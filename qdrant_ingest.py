#!/usr/bin/env python3
"""
Qdrant Project Codebase Ingestion Script

This script scans your project codebase and indexes it into a Qdrant vector database.
It breaks down code files into meaningful chunks like functions, classes, and documentation
blocks, and stores them with appropriate metadata for future retrieval.

Usage:
1. Make sure Qdrant is running: docker run -p 6333:6333 qdrant/qdrant
2. Run the script: python qdrant_ingest.py
3. Optionally specify directories to scan: python qdrant_ingest.py --directory ./frontend --directory ./backend

Features:
- Automatic language detection
- Intelligent code chunking (function/class level)
- Metadata tagging for efficient filtering
- Incremental updates (only process changed files)
"""

import os
import sys
import re
import json
import glob
import argparse
import logging
import hashlib
import uuid
import random
import time
from typing import Dict, List, Any, Tuple, Optional, Set
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

# Try to import Qdrant client
try:
    from qdrant_client import QdrantClient
    from qdrant_client.http import models
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False
    print("Qdrant client not found. Install with 'pip install qdrant-client'")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("qdrant_ingest")

# Constants
COLLECTION_NAME = "giggatek_codebase"
EMBEDDING_SIZE = 384  # Size of the embedding vectors
MAX_CHUNK_SIZE = 1000  # Maximum tokens per chunk
MIN_CHUNK_SIZE = 100   # Minimum tokens per chunk

# Language extensions and patterns
FILE_TYPES = {
    "source_code": [
        ".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".c", ".cpp", ".cs", ".go", ".rs",
        ".php", ".rb", ".swift", ".kt", ".scala", ".sh", ".bash", ".ps1", ".sql"
    ],
    "config": [
        ".json", ".yaml", ".yml", ".toml", ".ini", ".conf", ".config", ".xml", ".env", 
        ".properties", ".dockerignore", ".gitignore", "Dockerfile", "docker-compose.yml",
        ".babelrc", ".eslintrc", "tsconfig.json", "package.json", "composer.json"
    ],
    "documentation": [
        ".md", ".rst", ".txt", ".tex", ".adoc", ".wiki", ".html", ".htm", ".csv",
        "README", "LICENSE", "CHANGELOG", "CONTRIBUTING", "INSTALL", "TODO"
    ]
}

# Mapping of extensions to languages for syntax highlighting
EXTENSION_TO_LANGUAGE = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".java": "java",
    ".c": "c",
    ".cpp": "cpp",
    ".cs": "csharp",
    ".go": "go",
    ".rs": "rust",
    ".php": "php",
    ".rb": "ruby",
    ".swift": "swift",
    ".kt": "kotlin",
    ".scala": "scala",
    ".sh": "bash",
    ".bash": "bash",
    ".ps1": "powershell",
    ".sql": "sql",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".toml": "toml",
    ".ini": "ini",
    ".xml": "xml",
    ".md": "markdown",
    ".rst": "rst",
    ".tex": "latex",
    ".html": "html",
    ".htm": "html",
    ".css": "css",
    ".scss": "scss",
    ".sass": "sass",
    ".less": "less",
    ".tf": "terraform",
    ".Dockerfile": "dockerfile",
    "Dockerfile": "dockerfile",
    ".htaccess": "apache",
    ".gitignore": "gitignore",
    ".dockerignore": "gitignore",
    ".env": "dotenv",
    "Makefile": "makefile",
}

# Function/class detection patterns
CODE_PATTERNS = {
    "python": {
        "function": r"(def\s+\w+\s*\(.*?\):(?:\s*(?:\'|\"){3}[\s\S]*?(?:\'|\"){3})?[\s\S]*?)(?=\n\S|$)",
        "class": r"(class\s+\w+(?:\s*\(.*?\))?:[\s\S]*?)(?=\n\S|$)",
        "docstring": r"((?:\'|\"){3}[\s\S]*?(?:\'|\"){3})"
    },
    "javascript": {
        "function": r"((?:function\s+\w+|\w+\s*=\s*function|\w+\s*:\s*function|\w+\s*=\s*\(.*?\)\s*=>|(?:export\s+)?(?:async\s+)?function\s*\*?\s*\w*\s*\(.*?\))\s*\{[\s\S]*?\n\})",
        "class": r"((?:export\s+)?class\s+\w+(?:\s+extends\s+\w+)?\s*\{[\s\S]*?\n\})",
        "comment": r"(\/\*\*[\s\S]*?\*\/)"
    },
    "typescript": {
        "function": r"((?:function\s+\w+|\w+\s*=\s*function|\w+\s*:\s*function|\w+\s*=\s*\(.*?\)\s*=>|(?:export\s+)?(?:async\s+)?function\s*\*?\s*\w*\s*\(.*?\))\s*\{[\s\S]*?\n\})",
        "class": r"((?:export\s+)?class\s+\w+(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?\s*\{[\s\S]*?\n\})",
        "interface": r"((?:export\s+)?interface\s+\w+(?:\s+extends\s+[\w,\s]+)?\s*\{[\s\S]*?\n\})",
        "type": r"((?:export\s+)?type\s+\w+\s*=[\s\S]*?(?:;|\n\n))",
        "comment": r"(\/\*\*[\s\S]*?\*\/)"
    },
    "php": {
        "function": r"((?:public|protected|private)?\s*(?:static)?\s*function\s+\w+\s*\(.*?\)\s*\{[\s\S]*?\n\})",
        "class": r"((?:abstract\s+)?class\s+\w+(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?\s*\{[\s\S]*?\n\})",
        "comment": r"(\/\*\*[\s\S]*?\*\/)"
    }
}

def get_file_type(file_path: str) -> str:
    """Determine the file type based on the file extension.
    
    Args:
        file_path: Path to the file
        
    Returns:
        One of: source_code, config, documentation, other
    """
    file_path = file_path.lower()
    
    # Check each file type
    for file_type, extensions in FILE_TYPES.items():
        for ext in extensions:
            if (
                file_path.endswith(ext) or 
                os.path.basename(file_path) == ext or
                (ext.startswith(".") and os.path.splitext(file_path)[1] == ext)
            ):
                return file_type
    
    # Default to other
    return "other"

def get_language(file_path: str) -> str:
    """Determine the programming language based on the file extension.
    
    Args:
        file_path: Path to the file
        
    Returns:
        Programming language name, or 'text' if unknown
    """
    file_name = os.path.basename(file_path).lower()
    extension = os.path.splitext(file_path)[1].lower()
    
    # Check exact filename match first
    if file_name in EXTENSION_TO_LANGUAGE:
        return EXTENSION_TO_LANGUAGE[file_name]
    
    # Then check extension
    if extension in EXTENSION_TO_LANGUAGE:
        return EXTENSION_TO_LANGUAGE[extension]
    
    # Default to text
    return "text"

def chunk_code(content: str, language: str) -> List[Dict[str, Any]]:
    """Chunk code into functions, classes, and other logical blocks.
    
    Args:
        content: Code content
        language: Programming language
        
    Returns:
        List of chunks with metadata
    """
    chunks = []
    
    # Get the patterns for the language
    patterns = CODE_PATTERNS.get(language)
    
    if patterns:
        # Process each pattern
        for chunk_type, pattern in patterns.items():
            matches = re.finditer(pattern, content, re.MULTILINE)
            for match in matches:
                chunk_text = match.group(1)
                
                # Get the line numbers
                start_line = content[:match.start()].count('\n') + 1
                end_line = start_line + chunk_text.count('\n')
                
                chunks.append({
                    "content": chunk_text,
                    "start_line": start_line,
                    "end_line": end_line,
                    "chunk_type": chunk_type
                })
    
    # If no chunks were extracted or language not supported,
    # fall back to simple chunking
    if not chunks:
        # Simple chunking based on line count
        lines = content.split('\n')
        
        # Process the file in chunks
        current_chunk = []
        current_line = 1
        
        for line in lines:
            current_chunk.append(line)
            
            # When chunk reaches appropriate size, add it
            if len(current_chunk) >= 50:  # ~50 lines per chunk
                chunk_text = '\n'.join(current_chunk)
                chunks.append({
                    "content": chunk_text,
                    "start_line": current_line,
                    "end_line": current_line + len(current_chunk) - 1,
                    "chunk_type": "regular"
                })
                
                current_chunk = []
                current_line += 50
        
        # Add any remaining lines
        if current_chunk:
            chunk_text = '\n'.join(current_chunk)
            chunks.append({
                "content": chunk_text,
                "start_line": current_line,
                "end_line": current_line + len(current_chunk) - 1,
                "chunk_type": "regular"
            })
    
    return chunks

def process_file(file_path: str, relative_path: str) -> List[Dict[str, Any]]:
    """Process a single file and generate chunks for indexing.
    
    Args:
        file_path: Absolute path to the file
        relative_path: Path relative to the project root
        
    Returns:
        List of chunks with metadata
    """
    # Check if the file exists
    if not os.path.isfile(file_path):
        logger.warning(f"File not found: {file_path}")
        return []
    
    # Determine file type and language
    file_type = get_file_type(file_path)
    language = get_language(file_path)
    
    logger.debug(f"Processing {relative_path} as {file_type}/{language}")
    
    # Skip binary files
    if file_type == "other" and language == "text":
        try:
            with open(file_path, 'rb') as f:
                content_sample = f.read(1024)
                if b'\0' in content_sample:  # Simple binary file check
                    logger.debug(f"Skipping binary file: {relative_path}")
                    return []
        except Exception as e:
            logger.error(f"Error checking file {relative_path}: {str(e)}")
            return []
    
    # Read the file content
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except Exception as e:
        logger.error(f"Error reading file {relative_path}: {str(e)}")
        return []
    
    # Skip empty files
    if not content.strip():
        logger.debug(f"Skipping empty file: {relative_path}")
        return []
    
    # Chunk the content
    chunks = chunk_code(content, language)
    
    # Generate file hash for versioning
    file_hash = hashlib.md5(content.encode('utf-8')).hexdigest()
    
    # Add file metadata to each chunk
    for chunk in chunks:
        chunk["file_path"] = relative_path
        chunk["file_type"] = file_type
        chunk["language"] = language
        chunk["file_hash"] = file_hash
    
    return chunks

def generate_embedding(text: str) -> List[float]:
    """Generate an embedding vector for the text.
    
    In a real implementation, you would use a proper embedding model like 
    OpenAI's text-embedding-ada-002, Hugging Face models, or others.
    
    Args:
        text: Text to generate an embedding for
        
    Returns:
        List of floats representing the embedding vector
    """
    # Use the text hash as a seed for reproducible randomness
    random.seed(hash(text) % (2**32))
    return [random.random() for _ in range(EMBEDDING_SIZE)]

def ensure_collection_exists(client: QdrantClient):
    """Ensure the collection exists in Qdrant.
    
    Args:
        client: Qdrant client
    """
    collections = client.get_collections().collections
    collection_names = [c.name for c in collections]
    
    if COLLECTION_NAME not in collection_names:
        logger.info(f"Creating collection '{COLLECTION_NAME}'...")
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(
                size=EMBEDDING_SIZE,
                distance=models.Distance.COSINE
            )
        )
        
        # Add payload indexes for faster filtering
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="file_type",
            field_schema=models.KeywordIndexParams(
                type=models.IndexType.KEYWORD,
                lowercase=True
            )
        )
        
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="language",
            field_schema=models.KeywordIndexParams(
                type=models.IndexType.KEYWORD,
                lowercase=True
            )
        )
        
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="chunk_type",
            field_schema=models.KeywordIndexParams(
                type=models.IndexType.KEYWORD,
                lowercase=True
            )
        )
        
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="file_path",
            field_schema=models.KeywordIndexParams(
                type=models.IndexType.KEYWORD,
                lowercase=True
            )
        )
        
        logger.info(f"Created collection '{COLLECTION_NAME}' with indexes.")
    else:
        logger.info(f"Collection '{COLLECTION_NAME}' already exists.")

def find_existing_file_chunks(client: QdrantClient, file_path: str) -> List[Dict[str, Any]]:
    """Find existing chunks for a file in Qdrant.
    
    Args:
        client: Qdrant client
        file_path: Path to the file
        
    Returns:
        List of existing chunks
    """
    # Search for chunks with the given file path
    search_result = client.scroll(
        collection_name=COLLECTION_NAME,
        scroll_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="file_path",
                    match=models.MatchValue(value=file_path)
                )
            ]
        ),
        limit=1000,
        with_payload=True
    )
    
    chunks = []
    for point in search_result[0]:
        chunks.append({
            "id": point.id,
            "file_hash": point.payload.get("file_hash", "")
        })
    
    return chunks

def delete_chunks(client: QdrantClient, chunk_ids: List[str]):
    """Delete chunks from Qdrant.
    
    Args:
        client: Qdrant client
        chunk_ids: List of chunk IDs to delete
    """
    if not chunk_ids:
        return
    
    logger.info(f"Deleting {len(chunk_ids)} obsolete chunks...")
    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=models.PointIdsList(
            points=chunk_ids
        )
    )

def index_chunks(client: QdrantClient, chunks: List[Dict[str, Any]]):
    """Index chunks into Qdrant.
    
    Args:
        client: Qdrant client
        chunks: List of chunks to index
    """
    if not chunks:
        return
    
    logger.info(f"Indexing {len(chunks)} chunks...")
    
    # Prepare points for indexing
    points = []
    for chunk in chunks:
        # Generate a unique ID
        chunk_id = str(uuid.uuid4())
        
        # Generate embedding
        embedding = generate_embedding(chunk["content"])
        
        # Create point
        points.append(models.PointStruct(
            id=chunk_id,
            vector=embedding,
            payload=chunk
        ))
    
    # Index the points
    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

def scan_directory(directory: str, exclude_patterns: List[str] = None) -> List[str]:
    """Scan a directory for files to process.
    
    Args:
        directory: Directory to scan
        exclude_patterns: List of regex patterns to exclude
        
    Returns:
        List of file paths
    """
    if exclude_patterns is None:
        exclude_patterns = []
    
    # Compile exclude patterns
    exclude_re = [re.compile(pattern) for pattern in exclude_patterns]
    
    file_paths = []
    
    # Walk the directory
    for root, dirs, files in os.walk(directory):
        # Check if the directory should be excluded
        should_exclude = False
        for pattern in exclude_re:
            if pattern.search(root):
                should_exclude = True
                break
        
        if should_exclude:
            continue
        
        # Add files
        for file in files:
            # Skip hidden files
            if file.startswith('.'):
                continue
            
            file_path = os.path.join(root, file)
            
            # Check if the file should be excluded
            should_exclude = False
            for pattern in exclude_re:
                if pattern.search(file_path):
                    should_exclude = True
                    break
            
            if should_exclude:
                continue
            
            file_paths.append(file_path)
    
    return file_paths

def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(description="Index project codebase into Qdrant")
    
    # Directory options
    parser.add_argument("--directory", action="append", default=[],
                      help="Directories to scan (default: current directory)")
    
    # Exclude options
    parser.add_argument("--exclude", action="append", default=[],
                      help="Exclude patterns (regex)")
    
    # Qdrant options
    parser.add_argument("--qdrant-host", default="localhost",
                      help="Qdrant host (default: localhost)")
    parser.add_argument("--qdrant-port", type=int, default=6333,
                      help="Qdrant port (default: 6333)")
    
    # Miscellaneous options
    parser.add_argument("--workers", type=int, default=4,
                      help="Number of worker threads (default: 4)")
    parser.add_argument("--overwrite", action="store_true",
                      help="Overwrite existing data, skipping hash checks")
    parser.add_argument("--verbose", action="store_true",
                      help="Enable verbose logging")
    
    args = parser.parse_args()
    
    # Set log level
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    # Default to current directory if none provided
    if not args.directory:
        args.directory.append(".")
    
    # Add default exclude patterns
    if not args.exclude:
        args.exclude.extend([
            r"\.git",
            r"node_modules",
            r"__pycache__",
            r"\.venv",
            r"\.idea",
            r"\.vscode",
            r"\.pytest_cache",
            r"\.mypy_cache",
            r"\bdist\b",
            r"\bbuild\b",
            r"\.egg-info",
        ])
    
    # Check if Qdrant client is available
    if not QDRANT_AVAILABLE:
        print("Qdrant client not found. Install with 'pip install qdrant-client'")
        return 1
    
    try:
        # Connect to Qdrant
        client = QdrantClient(args.qdrant_host, port=args.qdrant_port)
        
        # Ensure the collection exists
        ensure_collection_exists(client)
        
        # Scan directories for files
        all_files = []
        for directory in args.directory:
            directory = os.path.abspath(directory)
            logger.info(f"Scanning directory: {directory}")
            
            # Get all files in the directory
            files = scan_directory(directory, args.exclude)
            
            # Add to the list
            for file in files:
                # Get the path relative to the project root
                relative_path = os.path.relpath(file, directory)
                all_files.append((file, relative_path))
        
        logger.info(f"Found {len(all_files)} files to process.")
        
        # Process files
        processed_count = 0
        unchanged_count = 0
        deleted_count = 0
        added_count = 0
        
        # Process files in parallel
        with ThreadPoolExecutor(max_workers=args.workers) as executor:
            # Process each file
            for file_path, relative_path in all_files:
                processed_count += 1
                
                # Log progress
                if processed_count % 100 == 0 or processed_count == len(all_files):
                    logger.info(f"Processing file {processed_count}/{len(all_files)}: {relative_path}")
                
                # Find existing chunks
                existing_chunks = find_existing_file_chunks(client, relative_path)
                
                # Process the file
                new_chunks = process_file(file_path, relative_path)
                
                # Skip if no chunks were generated
                if not new_chunks:
                    continue
                
                # Check if the file has changed
                if existing_chunks and not args.overwrite:
                    old_hash = existing_chunks[0]["file_hash"]
                    new_hash = new_chunks[0]["file_hash"]
                    
                    if old_hash == new_hash:
                        unchanged_count += 1
                        continue
                
                # Delete existing chunks
                if existing_chunks:
                    chunk_ids = [chunk["id"] for chunk in existing_chunks]
                    delete_chunks(client, chunk_ids)
                    deleted_count += len(chunk_ids)
                
                # Index new chunks
                index_chunks(client, new_chunks)
                added_count += len(new_chunks)
        
        logger.info("Indexing complete.")
        logger.info(f"Processed {processed_count} files.")
        logger.info(f"Unchanged: {unchanged_count} files.")
        logger.info(f"Deleted: {deleted_count} chunks.")
        logger.info(f"Added: {added_count} chunks.")
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())