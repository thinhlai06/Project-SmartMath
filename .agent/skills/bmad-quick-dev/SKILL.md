---
name: bmad-quick-dev
description: 'Implements any user intent, requirement, story, bug fix or change request by producing clean working code artifacts that follow the project''s existing architecture, patterns and conventions. Use when the user wants to build, fix, tweak, refactor, add or modify any code, component or feature.'
---

## Smart-MathAI Guardrails (MANDATORY)

- Scope: only Vietnamese primary Math for grades 1-3.
- Roles: Teacher only. No Parent role exists.
- AI output must remain draft; Teacher review is required before publish.
- Approved AI models only: gemma3:12b (question generation via Ollama Cloud), qwen2.5:3b (grading/explanation local), gemma4:31b (OCR via Ollama Cloud), vietnamese-sbert (RAG).
- Do not introduce other AI models or auto-publish flows.
- Backend: FastAPI + SQLAlchemy ORM only (no raw SQL); enforce grade with Literal[1,2,3] when applicable.
- Frontend: TypeScript strict mode, immutable updates, role-based rendering, Vietnamese UX/error messages.
- Keep AI logic isolated under backend/app/services/ai and mock AI calls in tests.

Follow the instructions in ./workflow.md.

