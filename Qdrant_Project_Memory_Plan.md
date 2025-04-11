# Qdrant Project Memory Plan

## 1. File Selection
- **Include:** All text/code files: source code (.py, .js, .php, .sh, .tf, etc.), configs (.json, .yml, .ini, etc.), documentation (.md, .txt), scripts, tests, and infrastructure-as-code.
- **Exclude:** Binaries, images, build artifacts, node_modules, and other non-text files.

## 2. Chunking Strategy
- **Source Code:** Chunk by function, class, or logical section.
- **Documentation:** Chunk by heading/section (e.g., Markdown headings).
- **Configs/Scripts:** Chunk by file or logical block.
- **Tests/Infra:** Chunk by test function/case or resource block.

## 3. Metadata
- Store for each chunk:
  - File path
  - File type
  - Chunk type (function, class, section, etc.)
  - Chunk index/position
  - Project version/hash (optional)

## 4. Inclusion Policy
- **Include:** Tests, scripts, and infrastructure-as-code for full project context and debugging.
- **Exclude:** Non-textual assets.

## 5. Content Storage
- Store full content of each chunk for maximum retrieval flexibility.
- Optionally, generate and store summaries/embeddings for large files or sections.

## 6. Manifest
- Maintain a manifest (e.g., `project_codebase_manifest.txt`) listing all ingested files and their chunking for traceability.

## 7. Update Policy
- Re-ingest files on change (using file hashes or timestamps).
- Update manifest accordingly.

---

## Workflow Diagram (Mermaid)

```mermaid
flowchart TD
    A[Start: List Project Files] --> B{Is Text/Code File?}
    B -- Yes --> C[Chunk File (by function/section)]
    B -- No --> Z[Skip File]
    C --> D[Extract Metadata]
    D --> E[Store Chunk + Metadata in Qdrant]
    E --> F{More Files?}
    F -- Yes --> B
    F -- No --> G[Update Manifest]
    G --> H[Done]
```

---

## Summary Table

| Step                | Action                                      |
|---------------------|---------------------------------------------|
| File Selection      | Include text/code, exclude binaries         |
| Chunking            | By function/section for code/docs           |
| Metadata            | File path, type, chunk info                 |
| Inclusion           | Include tests/scripts/infra                 |
| Content             | Store full chunk content                    |
| Manifest            | Track all stored files/chunks               |
| Update Policy       | Re-ingest on file change                    |