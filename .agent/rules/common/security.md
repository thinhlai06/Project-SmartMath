# Security Guidelines — Smart-MathAI

> Nguồn: everything-claude-code / rules/common/security.md  
> Tùy chỉnh cho Smart-MathAI (Educational Platform với dữ liệu học sinh)
> AI Models: gemma3:12b (question gen, Cloud), qwen2.5:3b (grading/explanation, local), gemma4:31b (OCR, Cloud), vietnamese-sbert (RAG)

## Mandatory Security Checks

Trước BẤT KỲ commit nào:
- [ ] Không hardcode secrets (API keys, passwords, tokens)
- [ ] Toàn bộ user input được validate
- [ ] SQL injection prevention (parameterized queries / SQLAlchemy ORM)
- [ ] XSS prevention (sanitized HTML output)
- [ ] CSRF protection enabled
- [ ] Authentication/authorization verified
- [ ] Rate limiting trên tất cả endpoints
- [ ] Error messages không leak sensitive data

## Secret Management

- KHÔNG BAO GIỜ hardcode secrets trong source code
- LUÔN dùng environment variables (.env file)
- Validate rằng required secrets có mặt khi startup
- Rotate bất kỳ secrets nào có thể đã bị lộ

```python
# ĐÚNG — Load từ environment
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")
```

## Role-Based Access Control (CRITICAL)

Smart-MathAI có 2 roles — LUÔN enforce:

| Action | Teacher | Parent |
|--------|---------|--------|
| Xem worksheet draft | ✅ | ❌ |
| Chỉnh sửa worksheet | ✅ | ❌ |
| Xuất PDF | ✅ | ✅ (chỉ published) |
| Dùng AI generation | ✅ | ❌ |
| Xem class khác | ✅ | ❌ |

```python
# Luôn check role trước khi xử lý
def require_teacher(current_user: User = Depends(get_current_user)):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Chỉ giáo viên mới có quyền này")
    return current_user
```

## Child Safety (CRITICAL — Educational Platform)

- Không bao giờ expose thông tin cá nhân học sinh cho bên thứ ba
- Không log raw images của học sinh
- AI `gemma3:12b`/`qwen2.5:3b` không giải bài tập trực tiếp cho phụ huynh
- Teacher luôn phải review AI output trước khi publish

## AI Safety Rules

- AI output phải là draft — không bao giờ auto-publish
- Log: prompt input, model used, teacher approval status, OCR confidence
- Không log: dữ liệu cá nhân học sinh, raw images

## Security Response Protocol

Nếu phát hiện vấn đề bảo mật:
1. DỪNG ngay lập tức
2. Fix CRITICAL issues trước khi tiếp tục
3. Rotate bất kỳ secrets nào bị lộ
4. Review toàn bộ codebase tìm vấn đề tương tự
