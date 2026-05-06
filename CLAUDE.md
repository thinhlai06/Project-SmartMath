# CLAUDE.md — Smart-MathAI

> File cấu hình cho AI agents làm việc với dự án này.
> Được tạo theo pattern của everything-claude-code.

## Dự án là gì?

**Smart-MathAI** — Nền tảng giáo dục toán học tiểu học Việt Nam (Lớp 1–3).  
Đây là educational SaaS dành cho **giáo viên** (tạo bài tập, chấm bài, phân tích kết quả học sinh).

## Tech Stack

```
Backend:   Python 3.11+ / FastAPI / SQLAlchemy / SQLite
Frontend:  TypeScript / React / Vite
AI:        Ollama Local (qwen2.5:3b — grading/explanation) / Ollama Cloud (gemma3:12b — question gen, gemma4:31b — OCR) / ChromaDB + vietnamese-sbert (RAG)
```

## Domain Constraints (BẮT BUỘC tuân thủ)

1. **Chỉ Toán học Lớp 1–3** — Không implement content ngoài phạm vi này
2. **1 Role duy nhất**: Teacher
3. **AI output = Draft** — Teacher review bắt buộc, không auto-publish
4. **AI models được duyệt**: `gemma3:12b` (sinh câu hỏi phân hóa, Ollama Cloud), `qwen2.5:3b` (chấm bài + giải thích, local), `gemma4:31b` (OCR ảnh, Ollama Cloud), `vietnamese-sbert` (RAG) — không thêm model khác
5. **Tiếng Việt** — UI và AI output bằng tiếng Việt

## Khi làm việc với Backend (`backend/`)

- Dùng FastAPI dependency injection cho auth checks
- Pydantic schemas với `grade: Literal[1, 2, 3]` để enforce boundary
- SQLAlchemy ORM (không raw SQL)
- Test coverage ≥ 80% với pytest

```bash
cd backend
pytest tests/ -v --cov=app
```

## Khi làm việc với Frontend (`frontend/`)

- TypeScript strict mode
- Teacher-only UI: tất cả routes đều yêu cầu role teacher
- Error messages bằng tiếng Việt
- Immutable state updates

```bash
cd frontend
npm run dev
```

## Khi làm việc với AI (`backend/app/services/ai/`)

- AI logic CÔ LẬP trong `services/ai/` — không mix với controller
- Mock AI calls trong tests (không gọi model thật khi test)
- Dynamic model loading với Ollama (load khi cần, unload ngay sau)
- Log: prompt_input, model, teacher_approval_status, ocr_confidence

## Commands Available

- `/plan "feature"` — Lên kế hoạch và phân tích impact
- `/tdd "feature"` — Bắt đầu TDD workflow
- `/python-review` — Review backend code
- `/code-review` — Review frontend code
- `/security-scan` — Scan bảo mật
- `/update-skills` — Tự động quét và cập nhật file `SKILL.md` theo rules mới nhất của dự án

## BMad Skills & Workflows Auto-Discovery (Dành cho VSCode AI / Roo / Cline)

Để đồng bộ với hệ thống Antigravity, phần mềm AI trong VSCode NẾU đang thực thi một tác vụ, **BẮT BUỘC** phải:
1. Quét nội dung thư mục `.agents/skills/`, `.agent/skills/` và `.agent/workflows/`.
2. Đọc file `SKILL.md` hoặc `workflow.md` tương ứng NẾU nhiệm vụ khớp với mô tả của skill đó (VD: thấy yêu cầu review code thì đọc skill code-review).
3. Tuân thủ 100% các bước hướng dẫn bên trong `SKILL.md` trước khi trực tiếp viết code.

## Agents Available

- `planner` — Feature planning với domain constraint checks
- `python-reviewer` — Backend code review
- `typescript-reviewer` — Frontend code review
- `tdd-guide` — TDD enforcement
- `security-reviewer` — Security audit

## Architecture Reference

Xem [ARCHITECTURE.md](./ARCHITECTURE.md) để hiểu cấu trúc hexagonal architecture.  
Xem [.agent/README.md](./.agent/README.md) để hiểu bộ bí kíp được setup.
