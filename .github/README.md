# VS Code Codex Setup - Smart-MathAI

Tai lieu nay mo ta bo cau hinh danh rieng cho GitHub Copilot/Codex trong VS Code.

## Phan biet nhanh

- `.agent/` = Antigravity IDE
- `.github/` = VS Code Copilot/Codex

Neu ban dang lam viec trong VS Code, uu tien doc va dung cac file trong `.github/`.
Neu ban dang lam viec trong Antigravity, uu tien `.agent/`.

## Cau truc Codex

```
.github/
  copilot-instructions.md
  README.md
  agents/
    planner.agent.md
    python-reviewer.agent.md
    typescript-reviewer.agent.md
    tdd-guide.agent.md
    security-reviewer.agent.md
  prompts/
    plan.prompt.md
    tdd.prompt.md
    python-review.prompt.md
    code-review.prompt.md
    security-scan.prompt.md
  instructions/
    backend.instructions.md
    frontend.instructions.md
    ai-workflow.instructions.md
```

## Mapping command tu bo Antigravity

- `/plan` -> Prompt: `Plan Smart-MathAI Feature`
- `/tdd` -> Prompt: `TDD Workflow`
- `/python-review` -> Prompt: `Backend Python Review`
- `/code-review` -> Prompt: `Frontend Code Review`
- `/security-scan` -> Prompt: `Security Scan`

## Cach dung trong VS Code

1. Mo Chat view trong VS Code
2. Go `/` de mo danh sach prompt
3. Chon prompt can dung tu `.github/prompts/`
4. Hoac chon agent truc tiep tu agent picker

## Luu y tranh nham lan

- Khong copy workflow file tu `.agent/workflows/` vao `.github/prompts/` khi chua doi frontmatter
- Khong sua `.agent/` neu ban chi muon thay doi hanh vi Codex trong VS Code
- Khong tao them `AGENTS.md` o root de tranh xung dot huong dan (du an dang dung `copilot-instructions.md`)
