---
description: Scan bảo mật Smart-MathAI — kiểm tra secrets, auth, educational data safety
---

Dùng **security-reviewer** agent để scan bảo mật:

$ARGUMENTS

Scan sẽ kiểm tra:
- Hardcoded secrets trong codebase
- Authentication/Authorization trên tất cả routes
- SQL injection và XSS prevention
- Educational data safety (PII, student images)
- AI output control (Teacher review mandatory)
- CORS, rate limiting, error message safety

Chạy trước khi commit hoặc deploy.
