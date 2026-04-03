---
name: Backend Python Review
description: "Review Python/FastAPI backend code theo Smart-MathAI standards"
argument-hint: "File hoac diff backend can review"
agent: python-reviewer
---

Review backend code sau:

$ARGUMENTS

Tap trung:
- Security, authn/authz
- Grade boundary (`Literal[1, 2, 3]`)
- Role checks (Teacher/Parent)
- AI output draft va AI logic isolation
- Test coverage va edge cases
