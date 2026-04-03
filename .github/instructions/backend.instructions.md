---
name: Backend FastAPI Rules
description: "Use when editing Python backend files in FastAPI. Enforce grade boundary, role checks, ORM-only data access, and Vietnamese-friendly errors."
applyTo: backend/**/*.py
---

# Backend Rules

- Enforce grade boundary bang `Literal[1, 2, 3]` trong schemas khi phu hop
- Teacher-only actions phai co auth dependency check
- Parent chi duoc doc du lieu da publish va dung pham vi quyen
- Dung SQLAlchemy ORM, khong viet raw SQL
- Message loi user-facing bang tieng Viet
- AI integration dat trong `backend/app/services/ai/`, khong tron vao routers/controllers
