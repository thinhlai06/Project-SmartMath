---
name: Frontend Code Review
description: "Review TypeScript/React frontend theo Smart-MathAI standards"
argument-hint: "File hoac diff frontend can review"
agent: typescript-reviewer
---

Dùng **typescript-reviewer** agent để review React/TypeScript code:

$ARGUMENTS

Review sẽ kiểm tra:
- Type safety (không `any`, proper interfaces)
- Role-based UI (Teacher vs Parent rendering)
- Grade boundary validation (chỉ 1-3)
- Immutable state updates
- UX với tiếng Việt
- Error handling thân thiện

