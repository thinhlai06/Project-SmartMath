---
description: Bắt đầu Test-Driven Development cho tính năng hoặc bug fix trong Smart-MathAI
---

Thực hiện TDD workflow nghiêm ngặt:

1. **RED** — Viết test thất bại trước:
   - Xác định behavior cần implement
   - Viết test case cụ thể (pytest backend / vitest frontend)
   - Đảm bảo bao gồm domain rule tests:
     - Grade boundary (1-3)
     - Role-based access (Teacher vs Parent)
     - AI draft enforcement (không auto-publish)

2. **Chạy test — phải FAIL**
   ```bash
   # Backend
   cd backend && pytest tests/path/to/test.py::test_name -v
   # Frontend
   cd frontend && npm test -- --run path/to/test
   ```

3. **GREEN** — Implementation tối thiểu để test pass

4. **Chạy test — phải PASS**

5. **REFACTOR** — Cải thiện code trong khi giữ tests xanh

6. **Verify Coverage**
   ```bash
   cd backend && pytest tests/ --cov=app --cov-report=term-missing --cov-fail-under=80
   ```

Ưu tiên test các Smart-MathAI business rules:
- `test_grade_must_be_1_2_or_3`
- `test_parent_cannot_create_worksheet`
- `test_parent_cannot_see_draft_worksheet`
- `test_ai_output_is_always_draft`
- `test_qwen_generates_vietnamese_content`
- `test_ocr_confidence_threshold_enforced`
