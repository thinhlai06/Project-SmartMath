---
description: Lên kế hoạch triển khai tính năng mới cho Smart-MathAI với domain constraints check
---

Phân tích yêu cầu và lập kế hoạch implementation:

1. Đọc context liên quan trong codebase (routes, services, models, schemas)
2. Kiểm tra domain constraints:
   - Tính năng có vượt quá Lớp 1-3 không?
   - Tính năng có yêu cầu đúng Teacher authentication không?
   - Có cần AI mà chưa được phép trong phase hiện tại không?
   - Luồng AI generation hiện là single mode (pipeline mới), không tách nhiều mode
   - Nếu thay đổi metadata RAG: có cần re-ingest vector DB không?
3. Xác định files bị ảnh hưởng và dependencies
4. Tạo implementation plan theo format:

```markdown
## Mục tiêu
[mô tả tính năng]

## Files bị ảnh hưởng
- backend/: ...
- frontend/: ...

## Implementation Steps
1. [ ] ...
2. [ ] ...

## Tests cần viết
- [ ] ...

## Risks
- ...
```

5. Chờ user approve trước khi bắt đầu code
