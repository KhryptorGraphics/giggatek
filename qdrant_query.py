#!/usr/bin/env python3
"""
Qdrant Project Codebase Query Script

This script allows you to search your project codebase using semantic search
powered by Qdrant vector database. It provides a way to find code snippets,
functions, classes, and documentation based on natural language queries.

Usage:
1. Make sure Qdrant is running: docker run -p 6333:6333 qdrant/qdrant
2. Run the script with a search query: python qdrant_query.py --search "database connection"
3. Filter by file type: python qdrant_query.py --search "auth" --type source_code
4. Filter by language: python qdrant_query.py --search "routing" --language python

Features:
- Semantic code search using vector similarity
- Multiple filtering options
- Colorized code output
- Result context with file path and line numbers
"""

import os
import sys
import re
import json
import argparse
import logging
import random
import textwrap
from typing import Dict, List, Any, Tuple, Optional, Set

# Try to import Qdrant client
try:
    from qdrant_client import QdrantClient
    from qdrant_client.http import models
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False
    print("Qdrant client not found. Install with 'pip install qdrant-client'")

# Try to import colorized output
try:
    from colorama import init, Fore, Style
    from pygments import highlight
    from pygments.lexers import get_lexer_by_name, guess_lexer
    from pygments.formatters import Terminal256Formatter
    COLORS_AVAILABLE = True
    init()  # Initialize colorama
except ImportError:
    COLORS_AVAILABLE = False
    print("Optional packages not found. Install with 'pip install colorama pygments'")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("qdrant_query")

# Constants
COLLECTION_NAME = "giggatek_codebase"
EMBEDDING_SIZE = 384  # Size of the embedding vectors

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

def colorize_code(code: str, language: str, max_width: int = 120) -> str:
    """Colorize code using Pygments if available.
    
    Args:
        code: Code to colorize
        language: Programming language
        max_width: Maximum width for the code output
        
    Returns:
        Colorized code or original code if colorization not available
    """
    if not COLORS_AVAILABLE:
        # Just wrap the lines if colors are not available
        return '\n'.join(textwrap.wrap(code, width=max_width))
    
    try:
        # Try to get a lexer for the specified language
        try:
            lexer = get_lexer_by_name(language)
        except:
            # If that fails, try to guess the lexer
            lexer = guess_lexer(code)
        
        # Highlight the code
        return highlight(code, lexer, Terminal256Formatter())
    except:
        # Fall back to plain text if highlighting fails
        return code

def format_result(result: Dict[str, Any], index: int, max_width: int = 120) -> str:
    """Format a search result for display.
    
    Args:
        result: Search result dictionary
        index: Result index
        max_width: Maximum width for the output
        
    Returns:
        Formatted result string
    """
    payload = result["payload"]
    
    header = f"Result #{index+1} [{payload['file_path']}:{payload['start_line']}-{payload['end_line']}]"
    
    # Add metadata
    metadata = (
        f"Type: {payload['file_type'].capitalize()} | "
        f"Language: {payload['language']} | "
        f"Score: {result['score']:.4f} | "
        f"Chunk Type: {payload['chunk_type'].replace('_', ' ').capitalize()}"
    )
    
    # Colorize the code
    code = colorize_code(payload['content'], payload['language'], max_width)
    
    # Build the formatted result
    if COLORS_AVAILABLE:
        formatted = f"{Fore.GREEN}{header}{Style.RESET_ALL}\n"
        formatted += f"{Fore.CYAN}{metadata}{Style.RESET_ALL}\n\n"
        formatted += f"{code}\n"
    else:
        formatted = f"{header}\n"
        formatted += f"{metadata}\n\n"
        formatted += f"{code}\n"
    
    return formatted

def search(query: str, client: QdrantClient, 
          file_type: Optional[str] = None,
          language: Optional[str] = None,
          chunk_type: Optional[str] = None,
          file_path_pattern: Optional[str] = None,
          limit: int = 5) -> List[Dict[str, Any]]:
    """Search for code in the Qdrant collection.
    
    Args:
        query: Query string
        client: Qdrant client
        file_type: Filter by file type
        language: Filter by programming language
        chunk_type: Filter by chunk type
        file_path_pattern: Filter by file path pattern
        limit: Maximum number of results to return
        
    Returns:
        List of search results
    """
    # Generate the query vector
    query_vector = generate_embedding(query)
    
    # Build the filter
    must_conditions = []
    
    if file_type:
        must_conditions.append(
            models.FieldCondition(
                key="file_type",
                match=models.MatchValue(value=file_type)
            )
        )
    
    if language:
        must_conditions.append(
            models.FieldCondition(
                key="language",
                match=models.MatchValue(value=language)
            )
        )
    
    if chunk_type:
        must_conditions.append(
            models.FieldCondition(
                key="chunk_type",
                match=models.MatchValue(value=chunk_type)
            )
        )
    
    if file_path_pattern:
        must_conditions.append(
            models.FieldCondition(
                key="file_path",
                match=models.MatchText(text=file_path_pattern)
            )
        )
    
    query_filter = None
    if must_conditions:
        query_filter = models.Filter(must=must_conditions)
    
    # Perform the search
    search_params = models.SearchParams(
        hnsw_ef=128,  # Higher value improves recall at the cost of latency
    )
    
    search_results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        query_filter=query_filter,
        limit=limit,
        search_params=search_params,
        with_payload=True
    )
    
    # Convert to a simpler format for the caller
    results = []
    for result in search_results:
        results.append({
            "id": result.id,
            "score": float(result.score),
            "payload": result.payload
        })
    
    return results

def analyze_results(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze search results to provide statistics.
    
    Args:
        results: List of search results
        
    Returns:
        Dictionary of result statistics
    """
    if not results:
        return {
            "count": 0,
            "file_types": {},
            "languages": {},
            "chunk_types": {}
        }
    
    file_types = {}
    languages = {}
    chunk_types = {}
    
    for result in results:
        payload = result["payload"]
        
        # Count file types
        file_type = payload.get("file_type", "unknown")
        file_types[file_type] = file_types.get(file_type, 0) + 1
        
        # Count languages
        language = payload.get("language", "unknown")
        languages[language] = languages.get(language, 0) + 1
        
        # Count chunk types
        chunk_type = payload.get("chunk_type", "unknown")
        chunk_types[chunk_type] = chunk_types.get(chunk_type, 0) + 1
    
    return {
        "count": len(results),
        "file_types": file_types,
        "languages": languages,
        "chunk_types": chunk_types
    }

def print_collection_info(client: QdrantClient):
    """Print information about the collection.
    
    Args:
        client: Qdrant client
    """
    try:
        collection = client.get_collection(collection_name=COLLECTION_NAME)
        
        print(f"{Fore.YELLOW if COLORS_AVAILABLE else ''}Collection Information:{Style.RESET_ALL if COLORS_AVAILABLE else ''}")
        print(f"Name: {COLLECTION_NAME}")
        print(f"Vectors: {collection.vectors_count}")
        print(f"Points: {collection.points_count}")
        print(f"Indexed segments: {collection.segments_count}")
        print()
        
    except Exception as e:
        logger.error(f"Failed to get collection info: {str(e)}")

def list_file_types(client: QdrantClient):
    """List all available file types in the collection.
    
    Args:
        client: Qdrant client
    """
    try:
        # Use aggregation to get unique file types
        aggregation_request = models.AggregationRequest(
            group_by=[
                models.GroupBy(
                    field="file_type",
                    limit=100
                )
            ]
        )
        
        aggregation_results = client.aggregate(
            collection_name=COLLECTION_NAME,
            aggregations=[aggregation_request]
        )
        
        print(f"{Fore.YELLOW if COLORS_AVAILABLE else ''}Available File Types:{Style.RESET_ALL if COLORS_AVAILABLE else ''}")
        for group in aggregation_results.groups:
            print(f"- {group.group['file_type']} ({group.count} points)")
        print()
        
    except Exception as e:
        logger.error(f"Failed to list file types: {str(e)}")

def list_languages(client: QdrantClient):
    """List all available languages in the collection.
    
    Args:
        client: Qdrant client
    """
    try:
        # Use aggregation to get unique languages
        aggregation_request = models.AggregationRequest(
            group_by=[
                models.GroupBy(
                    field="language",
                    limit=100
                )
            ]
        )
        
        aggregation_results = client.aggregate(
            collection_name=COLLECTION_NAME,
            aggregations=[aggregation_request]
        )
        
        print(f"{Fore.YELLOW if COLORS_AVAILABLE else ''}Available Languages:{Style.RESET_ALL if COLORS_AVAILABLE else ''}")
        for group in aggregation_results.groups:
            print(f"- {group.group['language']} ({group.count} points)")
        print()
        
    except Exception as e:
        logger.error(f"Failed to list languages: {str(e)}")

def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(description="Search project codebase using Qdrant")
    
    # Search options
    parser.add_argument("--search", help="Search query")
    parser.add_argument("--limit", type=int, default=5, help="Maximum number of results to return")
    
    # Filter options
    parser.add_argument("--type", choices=["source_code", "config", "documentation", "other"], 
                        help="Filter by file type")
    parser.add_argument("--language", help="Filter by programming language")
    parser.add_argument("--chunk-type", choices=["regular", "function_or_class"], 
                       help="Filter by chunk type")
    parser.add_argument("--path", help="Filter by file path pattern")
    
    # Information options
    parser.add_argument("--info", action="store_true", help="Show collection information")
    parser.add_argument("--list-types", action="store_true", help="List available file types")
    parser.add_argument("--list-languages", action="store_true", help="List available languages")
    
    args = parser.parse_args()
    
    # Check if Qdrant client is available
    if not QDRANT_AVAILABLE:
        print("Qdrant client not found. Install with 'pip install qdrant-client'")
        return 1
    
    try:
        # Connect to Qdrant
        client = QdrantClient("localhost", port=6333)
        
        # Check if collection exists
        collections = client.get_collections().collections
        collection_names = [c.name for c in collections]
        
        if COLLECTION_NAME not in collection_names:
            logger.error(f"Collection '{COLLECTION_NAME}' does not exist. Run the ingest script first.")
            return 1
        
        # Show information if requested
        if args.info:
            print_collection_info(client)
        
        if args.list_types:
            list_file_types(client)
        
        if args.list_languages:
            list_languages(client)
        
        # Perform search if query provided
        if args.search:
            logger.info(f"Searching for '{args.search}'...")
            
            results = search(
                query=args.search,
                client=client,
                file_type=args.type,
                language=args.language,
                chunk_type=args.chunk_type,
                file_path_pattern=args.path,
                limit=args.limit
            )
            
            if not results:
                print(f"No results found for '{args.search}'")
                return 0
            
            # Print the results
            for i, result in enumerate(results):
                print(format_result(result, i))
            
            # Print statistics
            stats = analyze_results(results)
            
            if COLORS_AVAILABLE:
                print(f"{Fore.YELLOW}Search Statistics:{Style.RESET_ALL}")
            else:
                print("Search Statistics:")
            
            print(f"Total Results: {stats['count']}")
            
            if stats['file_types']:
                print("File Types:")
                for ft, count in stats['file_types'].items():
                    print(f"  - {ft}: {count}")
            
            if stats['languages']:
                print("Languages:")
                for lang, count in stats['languages'].items():
                    print(f"  - {lang}: {count}")
            
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())