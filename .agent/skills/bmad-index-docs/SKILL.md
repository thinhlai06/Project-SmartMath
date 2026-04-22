---
name: bmad-index-docs
description: 'Generates or updates an index.md to reference all docs in the folder. Use if user requests to create or update an index of all files in a specific folder'
---

## Smart-MathAI Guardrails (MANDATORY)

- Scope: only Vietnamese primary Math for grades 1-3.
- Roles: only Teacher and Parent are allowed.
- AI output must remain draft; Teacher review is required before publish.
- Approved AI models only: qwen3:1.7b (generation), glm-ocr:latest (OCR), vietnamese-sbert (RAG).
- Do not introduce other AI models or auto-publish flows.
- Backend: FastAPI + SQLAlchemy ORM only (no raw SQL); enforce grade with Literal[1,2,3] when applicable.
- Frontend: TypeScript strict mode, immutable updates, role-based rendering, Vietnamese UX/error messages.
- Keep AI logic isolated under backend/app/services/ai and mock AI calls in tests.

# Index Docs

**Goal:** Generate or update an index.md to reference all docs in a target folder.


## EXECUTION

### Step 1: Scan Directory

- List all files and subdirectories in the target location

### Step 2: Group Content

- Organize files by type, purpose, or subdirectory

### Step 3: Generate Descriptions

- Read each file to understand its actual purpose and create brief (3-10 word) descriptions based on the content, not just the filename

### Step 4: Create/Update Index

- Write or update index.md with organized file listings


## OUTPUT FORMAT

```markdown
# Directory Index

## Files

- **[filename.ext](./filename.ext)** - Brief description
- **[another-file.ext](./another-file.ext)** - Brief description

## Subdirectories

### subfolder/

- **[file1.ext](./subfolder/file1.ext)** - Brief description
- **[file2.ext](./subfolder/file2.ext)** - Brief description

### another-folder/

- **[file3.ext](./another-folder/file3.ext)** - Brief description
```


## HALT CONDITIONS

- HALT if target directory does not exist or is inaccessible
- HALT if user does not have write permissions to create index.md


## VALIDATION

- Use relative paths starting with ./
- Group similar files together
- Read file contents to generate accurate descriptions - don't guess from filenames
- Keep descriptions concise but informative (3-10 words)
- Sort alphabetically within groups
- Skip hidden files (starting with .) unless specified

