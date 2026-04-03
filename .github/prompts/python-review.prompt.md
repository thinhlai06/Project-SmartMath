---
name: Backend Python Review
description: "Review Python/FastAPI backend code theo Smart-MathAI standards"
argument-hint: "File hoac diff backend can review"
agent: python-reviewer
---

Dùng **python-reviewer** agent để review Python/FastAPI code:

$ARGUMENTS

Review sẽ kiểm tra:
- Code quality (functions nhỏ, không deep nesting)
- Security (auth, authorization, SQL injection)
- Domain rules (Grade 1-3, Teacher vs Parent access)
- AI safety (output luôn là draft, không auto-publish)
- Test coverage

