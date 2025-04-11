#!/usr/bin/env python3
"""
Qdrant MCP Project Ingest Script

This script recursively scans your project directory, chunks each file using the same logic as qdrant_ingest.py,
and stores each chunk in Qdrant via the MCP server's qdrant-store tool, including full metadata.

Usage:
    python qdrant_mcp_project_ingest.py --mcp-url http://localhost:8000 --root-dir .

Options:
    --mcp-url: URL of the running MCP server exposing qdrant-store (default: http://localhost:8000)
    --root-dir: Root directory to scan (default: current directory)
    --exclude: Regex pattern to exclude files/directories (can be repeated)
    --dry-run: Only print what would be sent, do not actually send to MCP

Requirements:
    - requests
"""

import os
import re
import sys
import json
import hashlib
import argparse
import requests
from typing import Dict, List, Any

# --- Chunking logic (from qdrant_ingest.py) ---

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
    file_path = file_path.lower()
    for file_type, extensions in FILE_TYPES.items():
        for ext in extensions:
            if (
                file_path.endswith(ext) or 
                os.path.basename(file_path) == ext or
                (ext.startswith(".") and os.path.splitext(file_path)[1] == ext)
            ):
                return file_type
    return "other"

def get_language(file_path: str) -> str:
    file_name = os.path.basename(file_path).lower()
    extension = os.path.splitext(file_path)[1].lower()
    if file_name in EXTENSION_TO_LANGUAGE:
        return EXTENSION_TO_LANGUAGE[file_name]
    if extension in EXTENSION_TO_LANGUAGE:
        return EXTENSION_TO_LANGUAGE[extension]
    return "text"

def chunk_code(content: str, language: str) -> List[Dict[str, Any]]:
    chunks = []
    patterns = CODE_PATTERNS.get(language)
    if patterns:
        for chunk_type, pattern in patterns.items():
            matches = re.finditer(pattern, content, re.MULTILINE)
            for match in matches:
                chunk_text = match.group(1)
                start_line = content[:match.start()].count('\n') + 1
                end_line = start_line + chunk_text.count('\n')
                chunks.append({
                    "content": chunk_text,
                    "start_line": start_line,
                    "end_line": end_line,
                    "chunk_type": chunk_type
                })
    if not chunks:
        lines = content.split('\n')
        current_chunk = []
        current_line = 1
        for line in lines:
            current_chunk.append(line)
            if len(current_chunk) >= 50:
                chunk_text = '\n'.join(current_chunk)
                chunks.append({
                    "content": chunk_text,
                    "start_line": current_line,
                    "end_line": current_line + len(current_chunk) - 1,
                    "chunk_type": "regular"
                })
                current_chunk = []
                current_line += 50
        if current_chunk:
            chunk_text = '\n'.join(current_chunk)
            chunks.append({
                "content": chunk_text,
                "start_line": current_line,
                "end_line": current_line + len(current_chunk) - 1,
                "chunk_type": "regular"
            })
    return chunks

def file_hash(content: str) -> str:
    return hashlib.md5(content.encode('utf-8')).hexdigest()

def scan_directory(root_dir: str, exclude_patterns: List[str]) -> List[str]:
    exclude_re = [re.compile(pattern) for pattern in exclude_patterns]
    file_paths = []
    for dirpath, dirs, files in os.walk(root_dir):
        # Exclude dirs
        dirs[:] = [d for d in dirs if not any(r.search(os.path.join(dirpath, d)) for r in exclude_re)]
        for file in files:
            if file.startswith('.'):
                continue
            file_path = os.path.join(dirpath, file)
            if any(r.search(file_path) for r in exclude_re):
                continue
            file_paths.append(file_path)
    return file_paths

def check_mcp_server(mcp_url: str) -> bool:
    try:
        url = mcp_url.rstrip("/") + "/tool/qdrant-store"
        # Send a dummy request with invalid data to check connectivity
        resp = requests.post(url, json={"tool": "qdrant-store", "arguments": {"information": "ping", "metadata": {}}}, timeout=5)
        # Accept 200 or 400 (bad request) as "server is up"
        return resp.status_code in (200, 400)
    except Exception as e:
        print(f"Could not connect to MCP server at {mcp_url}: {e}")
        return False

def store_chunk_mcp(mcp_url: str, chunk: Dict[str, Any], metadata: Dict[str, Any], dry_run: bool = False):
    payload = {
        "tool": "qdrant-store",
        "arguments": {
            "information": chunk["content"],
            "metadata": metadata
        }
    }
    if dry_run:
        print(json.dumps(payload, indent=2))
        return
    url = mcp_url.rstrip("/") + "/tool/qdrant-store"
    try:
        resp = requests.post(url, json=payload)
        if resp.status_code != 200:
            print(f"Failed to store chunk: {resp.status_code} {resp.text}")
        else:
            print(f"Stored chunk: {metadata['file_path']} [{metadata['start_line']}-{metadata['end_line']}]")
    except Exception as e:
        print(f"Error storing chunk for {metadata['file_path']}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Ingest project into Qdrant via MCP server")
    parser.add_argument("--mcp-url", default="http://localhost:8000", help="MCP server URL")
    parser.add_argument("--root-dir", default=".", help="Root directory to scan")
    parser.add_argument("--exclude", action="append", default=[], help="Regex pattern to exclude (repeatable)")
    parser.add_argument("--dry-run", action="store_true", help="Print only, do not send to MCP")
    args = parser.parse_args()

    # Default excludes
    exclude_patterns = args.exclude or []
    exclude_patterns += [
        r"\.git", r"node_modules", r"__pycache__", r"\.venv", r"\.idea", r"\.vscode",
        r"\.pytest_cache", r"\.mypy_cache", r"\bdist\b", r"\bbuild\b", r"\.egg-info",
        r"\.conda"
    ]

    print("Checking MCP server connectivity...")
    if not check_mcp_server(args.mcp_url):
        print("\nERROR: MCP server is not running or not reachable at the specified URL.")
        print("To use this script, please ensure:")
        print("  1. Qdrant is running: docker run -p 6333:6333 qdrant/qdrant")
        print("  2. The MCP server (qdrant_mcp_wrapper.py) is running and listening on the correct port.")
        print("  3. The --mcp-url argument matches the MCP server address (default: http://localhost:8000)")
        print("After starting the servers, re-run this script.")
        sys.exit(1)

    file_paths = scan_directory(args.root_dir, exclude_patterns)
    print(f"Found {len(file_paths)} files to process.")

    for file_path in file_paths:
        rel_path = os.path.relpath(file_path, args.root_dir)
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
        except Exception as e:
            print(f"Skipping {rel_path}: {e}")
            continue
        if not content.strip():
            continue
        file_type = get_file_type(file_path)
        language = get_language(file_path)
        hash_val = file_hash(content)
        chunks = chunk_code(content, language)
        for chunk in chunks:
            metadata = {
                "file_path": rel_path,
                "file_type": file_type,
                "language": language,
                "start_line": chunk["start_line"],
                "end_line": chunk["end_line"],
                "chunk_type": chunk["chunk_type"],
                "file_hash": hash_val
            }
            store_chunk_mcp(args.mcp_url, chunk, metadata, dry_run=args.dry_run)

if __name__ == "__main__":
    main()