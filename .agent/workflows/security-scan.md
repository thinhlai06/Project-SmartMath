---
description: Scan bảo mật Smart-MathAI — kiểm tra secrets, authentication, educational data safety, AI output control
---

Thực hiện security scan toàn diện:

1. **Scan secrets trong codebase**
   - Tìm hardcoded passwords, API keys, tokens
   - Kiểm tra `.env` có trong `.gitignore` không
   - Verify environment variables được validate khi startup

2. **Authentication & Authorization**
   - Mọi protected API route có `Depends(get_current_user)`
   - Teacher-only routes có `Depends(require_teacher)`
   - Tất cả routes đều yêu cầu `require_teacher` dependency
   - JWT token expiry được handle đúng

3. **Input Validation**
   - Tất cả API inputs qua Pydantic schemas
   - Grade boundary: `Literal[1, 2, 3]`
   - File upload (OCR images): validate type và size
   - SQL injection: dùng ORM, không raw SQL

4. **Educational Data Safety (CRITICAL)**
   - Không expose thông tin học sinh cho bên thứ ba
   - Images gửi qua `gemma4:31b` (Cloud OCR) không được log có PII
   - AI (`gemma3:12b`/`qwen2.5:3b`) không giải bài trực tiếp (chỉ teacher mới dùng được)
   - Teacher review mandatory trước publish

5. **API Security**
   - CORS configure đúng (không `allow_origins=["*"]` production)
   - Rate limiting trên AI endpoints (qwen3, glm-ocr)
   - Error messages không leak stack traces

Báo cáo Security Score A-F:
- 🔴 CRITICAL
- 🟡 HIGH
- 🟢 MEDIUM
