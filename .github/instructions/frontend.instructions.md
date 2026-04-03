---
name: Frontend React Rules
description: "Use when editing React TypeScript frontend code. Enforce role-based UI, immutable state, grade 1-3 boundaries, and Vietnamese UX text."
applyTo:
	- frontend/src/**/*.ts
	- frontend/src/**/*.tsx
---

# Frontend Rules

- TypeScript strict-friendly code, tranh `any` neu co the
- UI role-based ro rang: Parent khong thay teacher controls
- Grade-related UI chi cho 1, 2, 3
- State updates immutable
- API error handling va thong bao bang tieng Viet
