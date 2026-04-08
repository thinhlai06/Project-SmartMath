# Everything Claude Code — Smart-MathAI Setup

> Luu y:
> - Thu muc `.agent/` danh cho Antigravity IDE.
> - VS Code Copilot/Codex uu tien `.github/copilot-instructions.md`, `.github/instructions/` va co the nap skills tu `.agents/skills/`.
> - De tranh drift, nen coi `.github/` + `.agents/skills/` la nguon su that cho VS Code workflow.

Bộ bí kíp tối ưu hóa AI agent được tùy chỉnh cho **Smart-MathAI**.  
Nguồn: [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) → Adapted for **Antigravity IDE**

---

## 📁 Cấu trúc (tương thích Antigravity)

```
.agent/
├── workflows/        ← ✅ ANTIGRAVITY SLASH COMMANDS (hiển thị dưới dạng /plan, /tdd...)
│   ├── plan.md
│   ├── tdd.md
│   ├── code-review.md
│   ├── python-review.md
│   └── security-scan.md
│
├── skills/           ← ✅ ANTIGRAVITY SKILLS (AI tự gợi ý hoặc đọc khi cần)
│   ├── frontend-design/SKILL.md
│   ├── ai-workflow/SKILL.md      ← AI gen (qwen3:1.7b) + OCR (glm-ocr:latest) + RAG
│   └── backend-patterns/SKILL.md ← FastAPI, Repository, Service Layer patterns
│
├── rules/            ← Coding rules (AI áp dụng ngầm)
│   ├── common/
│   │   ├── coding-style.md
│   │   ├── testing.md
│   │   ├── security.md
│   │   └── git-workflow.md
│   ├── python/
│   │   └── patterns.md
│   └── typescript/
│       └── patterns.md
│
└── agents/           ← Agent definitions (tham khảo, không auto-load trong Antigravity)
    ├── planner.md
    ├── python-reviewer.md
    ├── typescript-reviewer.md
    ├── tdd-guide.md
    └── security-reviewer.md
```

---

## 🚀 Slash Commands (Workflows) — Dùng trong Antigravity

> Gõ `/` trong chat để xem danh sách commands

| Command | Mô tả |
|---------|-------|
| `/plan` | Lên kế hoạch tính năng mới với domain constraints check |
| `/tdd` | Bắt đầu TDD workflow (Red→Green→Refactor) |
| `/python-review` | Review Python/FastAPI backend code |
| `/code-review` | Review TypeScript/React frontend code |
| `/security-scan` | Scan bảo mật toàn diện |

---

## 🧠 Skills — AI Tự Gợi Ý Khi Phù Hợp

Skills được AI **tự đọc** khi nhận ra yêu cầu phù hợp với `description` trong SKILL.md:

| Skill | Khi nào được gợi ý |
|-------|-------------------|
| `ai-workflow` | Implement/debug AI features (qwen3, glm-ocr, RAG) |
| `backend-patterns` | Viết endpoints mới, refactor backend |
| `frontend-design` | Build UI components, pages |

---

## 🤖 AI Models Được Duyệt

| Model | Tool | Dùng cho |
|-------|------|---------|
| `qwen3:1.7b` | Ollama | Tạo câu hỏi toán học |
| `glm-ocr:latest` | Ollama | OCR ảnh bài làm học sinh |
| `vietnamese-sbert` | HuggingFace | RAG embeddings từ SGK |

---

## ⚡ Smart-MathAI Domain Constraints (nhúng sẵn vào mọi nơi)

| Constraint | Rule |
|-----------|------|
| Grade 1-3 only | `grade: Literal[1, 2, 3]` — không bao giờ > 3 |
| Teacher creates | Role check mandatory trên mọi write endpoint |
| Parent reads | Chỉ published worksheets của class đã join |
| AI = Draft | Output qwen3/glm-ocr → pending Teacher review |
| Tiếng Việt | UI messages và AI output |
| Isolated AI | `services/ai/` không mix vào controller |
