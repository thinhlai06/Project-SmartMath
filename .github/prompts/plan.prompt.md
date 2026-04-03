---
name: Plan Smart-MathAI Feature
description: "Lap ke hoach trien khai tinh nang moi voi domain constraints check cho Smart-MathAI"
argument-hint: "Mo ta tinh nang can lap ke hoach"
agent: planner
---

Dùng **planner** agent để phân tích và lập kế hoạch triển khai tính năng:

**"$ARGUMENTS"**

Agent sẽ:
1. Phân tích requirements và context hiện tại
2. Kiểm tra domain constraints (Grade 1-3, roles, AI safety)
3. Tạo implementation plan với task breakdown
4. Identify risks và dependencies

Sau khi có plan, review và approve trước khi bắt đầu code.

