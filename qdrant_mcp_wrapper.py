#!/usr/bin/env python3
"""
Qdrant MCP Server Wrapper (Standalone, No mcp-server-utils)

This script implements a minimal FastAPI server that exposes the qdrant-store and qdrant-find tools
as HTTP endpoints for use with the MCP ingest script and other clients.

Endpoints:
  POST /tool/qdrant-store
    - arguments: { "information": str, "metadata": dict }
    - Stores the information and metadata as a point in Qdrant

  POST /tool/qdrant-find
    - arguments: { "query": str }
    - Returns the top 5 most similar information chunks from Qdrant

Requirements:
  pip install fastapi uvicorn qdrant-client

Usage:
  python qdrant_mcp_wrapper.py --host 0.0.0.0 --port 8000
"""

import argparse
import time
import uuid
import random
from typing import Dict, Any, List, Optional

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn

try:
    from qdrant_client import QdrantClient
    from qdrant_client.http import models
except ImportError:
    print("Please install qdrant-client: pip install qdrant-client")
    exit(1)

app = FastAPI()

COLLECTION_NAME = "giggatek_codebase"
EMBEDDING_SIZE = 384  # Must match the ingest script

def generate_embedding(text: str) -> List[float]:
    random.seed(hash(text) % (2**32))
    return [random.random() for _ in range(EMBEDDING_SIZE)]

def ensure_collection_exists(client: QdrantClient):
    collections = client.get_collections().collections
    collection_names = [c.name for c in collections]
    if COLLECTION_NAME not in collection_names:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(
                size=EMBEDDING_SIZE,
                distance=models.Distance.COSINE
            )
        )

def get_qdrant_client(host: str, port: int) -> QdrantClient:
    return QdrantClient(host, port=port)

# Global Qdrant client (initialized in startup event)
qdrant_client: Optional[QdrantClient] = None

@app.on_event("startup")
def startup_event():
    global qdrant_client
    qdrant_client = get_qdrant_client("localhost", 6333)
    ensure_collection_exists(qdrant_client)
    print("Qdrant MCP server started and collection ensured.")

@app.post("/tool/qdrant-store")
async def qdrant_store(request: Request):
    """
    Store a chunk in Qdrant.
    Expects JSON: { "tool": "qdrant-store", "arguments": { "information": str, "metadata": dict } }
    """
    data = await request.json()
    args = data.get("arguments", {})
    information = args.get("information")
    metadata = args.get("metadata", {})
    if not information:
        return JSONResponse({"error": "Missing 'information' in arguments"}, status_code=400)
    # Generate embedding
    embedding = generate_embedding(information)
    # Generate unique ID
    point_id = str(uuid.uuid4())
    # Add timestamp
    metadata = dict(metadata)
    metadata["timestamp"] = time.time()
    # Store in Qdrant
    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=[models.PointStruct(
            id=point_id,
            vector=embedding,
            payload={
                "information": information,
                **metadata
            }
        )]
    )
    return {"result": f"Stored information with id {point_id}"}

@app.post("/tool/qdrant-find")
async def qdrant_find(request: Request):
    """
    Find similar chunks in Qdrant.
    Expects JSON: { "tool": "qdrant-find", "arguments": { "query": str } }
    """
    data = await request.json()
    args = data.get("arguments", {})
    query = args.get("query")
    if not query:
        return JSONResponse({"error": "Missing 'query' in arguments"}, status_code=400)
    embedding = generate_embedding(query)
    results = qdrant_client.search(
        collection_name=COLLECTION_NAME,
        query_vector=embedding,
        limit=5,
        with_payload=True
    )
    output = []
    for r in results:
        payload = r.payload.copy()
        info = payload.pop("information", "")
        output.append({
            "score": float(r.score),
            "information": info,
            "metadata": payload
        })
    return {"results": output}

def main():
    parser = argparse.ArgumentParser(description="Run Qdrant MCP server (standalone, no mcp-server-utils)")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind (default: 8000)")
    args = parser.parse_args()
    uvicorn.run("qdrant_mcp_wrapper:app", host=args.host, port=args.port, reload=False)

if __name__ == "__main__":
    main()