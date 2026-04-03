# Git Workflow — Smart-MathAI

> Nguồn: everything-claude-code / rules/common/git-workflow.md

## Commit Message Format

```
<type>: <mô tả ngắn gọn>

<body tùy chọn — giải thích WHY, không phải WHAT>
```

### Types:
- `feat`: Tính năng mới
- `fix`: Sửa bug
- `refactor`: Refactor code (không thêm feature, không sửa bug)
- `docs`: Cập nhật tài liệu
- `test`: Thêm/sửa tests
- `chore`: Build process, dependencies
- `perf`: Cải thiện performance
- `ci`: CI/CD changes

### Ví dụ cho Smart-MathAI:
```
feat: thêm AI generation câu hỏi lớp 2 phép cộng

- Qwen2.5 tạo draft questions với RAG từ SGK
- Teacher phải review trước khi publish
- Tuân thủ giới hạn Grade 1-3

fix: sửa lỗi parent thấy worksheet draft

refactor: tách AI logic ra khỏi worksheet controller

test: thêm test kiểm tra grade boundary (không được > 3)
```

## Pull Request Workflow

Khi tạo PRs:
1. Phân tích toàn bộ commit history (không chỉ commit mới nhất)
2. Dùng `git diff main...HEAD` để xem toàn bộ changes
3. Viết PR summary đầy đủ
4. Bao gồm test plan rõ ràng

## Branch Naming

```
feat/ai-question-generation
fix/parent-sees-draft
refactor/isolate-ai-service
```
