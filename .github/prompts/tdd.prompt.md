---
name: TDD Workflow
description: "Bat dau workflow TDD (Red-Green-Refactor) cho Smart-MathAI"
argument-hint: "Tinh nang hoac bug can lam theo TDD"
agent: tdd-guide
---

Dùng **tdd-guide** agent để enforce Test-Driven Development:

$ARGUMENTS

Quy trình:
1. Viết test thất bại trước (RED)
2. Chạy test để confirm FAIL
3. Implementation tối thiểu (GREEN)
4. Chạy test để confirm PASS
5. Refactor và verify coverage ≥ 80%

Bao gồm test cases cho domain rules:
- Grade boundary (1-3)
- Role-based access control
- AI draft enforcement

