# Coding Style — Smart-MathAI

> Nguồn: everything-claude-code / rules/common/coding-style.md  
> Tùy chỉnh cho dự án Smart-MathAI (Vietnamese Primary Math, Grade 1–3)

## Immutability (CRITICAL)

LUÔN tạo object mới, KHÔNG BAO GIỜ mutate object hiện có:

```python
# SAI: thay đổi trực tiếp
worksheet.status = "published"

# ĐÚNG: trả về bản sao mới
def publish_worksheet(worksheet: Worksheet) -> Worksheet:
    return dataclasses.replace(worksheet, status="published")
```

```typescript
// SAI
user.role = "teacher"

// ĐÚNG
const updatedUser = { ...user, role: "teacher" }
```

Lý do: Dữ liệu bất biến ngăn side effects ẩn, dễ debug hơn, an toàn với concurrency.

## File Organization

NHIỀU FILE NHỎ > ÍT FILE LỚN:
- High cohesion, low coupling
- 200–400 dòng thông thường, tối đa 800 dòng
- Extract utilities từ modules lớn
- Tổ chức theo feature/domain, không theo type

### Cấu trúc dự án Smart-MathAI:
```
backend/
  app/
    routes/         # <-- theo domain (auth, classes, worksheets...)
    services/       # <-- business logic thuần túy
    models/         # <-- SQLAlchemy models
    schemas/        # <-- Pydantic schemas (validation)
    services/ai/    # <-- AI logic cô lập
frontend/
  src/
    pages/          # <-- theo domain
    components/     # <-- reusable UI
    hooks/          # <-- custom React hooks
    api/            # <-- API clients
```

## Error Handling

LUÔN xử lý lỗi toàn diện:
- Xử lý lỗi tường minh ở mọi tầng
- Cung cấp thông báo lỗi thân thiện với người dùng (tiếng Việt) trên UI
- Log chi tiết context lỗi phía server
- Không bao giờ nuốt lỗi im lặng

```python
# ĐÚNG — Backend
try:
    result = generate_questions(grade, topic)
except QuestionGenerationError as e:
    logger.error(f"Lỗi tạo câu hỏi: {e}", extra={"grade": grade, "topic": topic})
    raise HTTPException(status_code=500, detail="Không thể tạo câu hỏi. Vui lòng thử lại.")
```

## Input Validation

LUÔN validate tại system boundaries:
- Validate toàn bộ input trước khi xử lý
- Dùng Pydantic schemas cho backend validation
- Dùng Zod/form validation cho frontend
- Fail fast với thông báo lỗi rõ ràng

```python
# Backend: Pydantic schema
class WorksheetCreateRequest(BaseModel):
    grade: Literal[1, 2, 3]  # Chỉ cho phép lớp 1-3
    topic: str
    difficulty: Literal["nhan_biet", "thong_hieu", "van_dung", "van_dung_cao"]
    title: str = Field(..., min_length=1, max_length=200)
```

## Smart-MathAI Domain Rules

- **Chỉ lớp 1–3**: Không bao giờ cho phép grade > 3
- **Chỉ Toán**: Không cross-subject logic
- **Teacher control**: AI output luôn là draft, không bao giờ auto-publish
- **Tiếng Việt**: UI messages và AI output bằng tiếng Việt

## Code Quality Checklist

Trước khi đánh dấu hoàn thành:
- [ ] Code dễ đọc, tên biến/hàm rõ ràng
- [ ] Functions nhỏ (< 50 dòng)
- [ ] Files tập trung (< 800 dòng)
- [ ] Không nest sâu (> 4 cấp)
- [ ] Xử lý lỗi đầy đủ
- [ ] Không hardcode values (dùng constants hoặc config)
- [ ] Không mutation (dùng immutable patterns)
- [ ] Grade boundary check (grade phải 1-3)
