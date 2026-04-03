# Smart-MathAI Copilot Instructions (VS Code Codex)

File nay chi danh cho GitHub Copilot Chat trong VS Code.

- Nguon cau hinh Antigravity giu nguyen trong `.agent/`
- Cau hinh Copilot/Codex nam trong `.github/`
- Khong sua slash workflows cua Antigravity khi dang lam viec cho Codex

## Muc tieu du an

Smart-MathAI la nen tang giao duc toan tieu hoc Viet Nam cho Lop 1-3, phuc vu 2 vai tro:

- Teacher: tao bai tap va review noi dung AI
- Parent: xem va tai bai tap da duoc publish

## Domain Constraints (bat buoc)

1. Chi xu ly toan Lop 1, 2, 3
2. Chi co 2 role: Teacher va Parent
3. AI output luon la draft, Teacher review bat buoc truoc khi publish
4. Chi su dung model duoc duyet:
   - `qwen3:1.7b` cho tao cau hoi
   - `glm-ocr:latest` cho OCR
   - `vietnamese-sbert` cho RAG embeddings
5. UI va thong bao loi bang tieng Viet

## Backend conventions

- FastAPI + SQLAlchemy ORM, khong dung raw SQL
- Dung dependency injection cho auth checks
- Pydantic schema enforce grade voi `Literal[1, 2, 3]`
- AI logic dat trong `backend/app/services/ai/`, khong tron voi controller
- Khi test, mock AI calls, khong goi model that

## Frontend conventions

- TypeScript strict mode
- Role-based rendering ro rang (Parent khong thay teacher controls)
- Immutable state updates
- Error message than thien bang tieng Viet

## Testing and quality

- Uu tien TDD cho thay doi lon
- Backend coverage muc tieu >= 80%
- Neu thay doi auth/permissions, phai bo sung test role mismatch

## Working mode

- Uu tien thay doi nho, dung tam pham vi
- Khong pha vo behavior hien co neu khong duoc yeu cau
- Neu co xung dot giua `.agent/` va `.github/`, uu tien bo cau hinh theo IDE dang dung:
  - Antigravity -> `.agent/`
  - VS Code Copilot/Codex -> `.github/`
