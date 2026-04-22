---
name: bmad-validate-prd
description: 'Validate a PRD against standards. Use when the user says "validate this PRD" or "run PRD validation"'
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

Follow the instructions in ./workflow.md.

