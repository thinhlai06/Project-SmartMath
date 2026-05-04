---
description: Review Python/FastAPI backend code theo Smart-MathAI standards (security, domain rules, patterns)
---

Review Python backend code theo checklist Smart-MathAI:

1. **Code Quality**
   - Functions < 50 dòng, files < 800 dòng
   - Type hints đầy đủ
   - Không deep nesting > 4 cấp

2. **Security & Auth**
   - Mọi protected route có `Depends(get_current_user)`
   - Teacher-only routes có `Depends(require_teacher)`
   - Không hardcode secrets
   - Pydantic validation đầy đủ

3. **Domain Rules (CRITICAL)**
   - Grade validation: `grade: Literal[1, 2, 3]`
   - Tất cả thao tác tạo/sửa worksheets phải có `require_teacher` dependency
   - AI output (gemma3:12b / qwen2.5:3b / gemma4:31b) luôn là Draft
   - AI logic nằm trong `app/services/ai/` (isolated)

4. **Error Handling**
   - Không `except: pass`
   - HTTPException với message tiếng Việt thân thiện
   - Log chi tiết server-side

5. **Tests**
   - Test coverage ≥ 80%
   - Có test grade boundary, role mismatch không?

Báo cáo format:
- 🔴 CRITICAL (phải fix ngay)
- 🟡 WARNING (nên fix)
- 🟢 SUGGESTION (tùy chọn)
