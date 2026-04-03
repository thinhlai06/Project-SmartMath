---
description: Review TypeScript/React frontend code theo Smart-MathAI standards (type safety, role-based UI, UX tiếng Việt)
---

Review TypeScript/React code theo checklist Smart-MathAI:

1. **TypeScript Quality**
   - Không dùng `any` type
   - Props interfaces rõ ràng
   - Null/undefined handling đúng

2. **Role-Based UI (CRITICAL)**
   - Teacher-only features ẩn với Parent
   - Parent chỉ thấy published worksheets
   - Không render AI generation controls cho Parent
   - Grade selector chỉ cho phép 1, 2, 3

3. **State Management**
   - Không mutate state trực tiếp
   - Dùng `{ ...prev, field: value }` pattern
   - Loading/error states đầy đủ

4. **UX**
   - Error messages tiếng Việt
   - Empty states thân thiện
   - Loading indicators rõ ràng

5. **Component Architecture**
   - Logic trong custom hooks
   - Components focused (< 200 dòng)
   - Reusable components đúng chỗ

Báo cáo:
- 🔴 CRITICAL
- 🟡 WARNING
- 🟢 SUGGESTION
