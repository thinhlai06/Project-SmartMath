# Testing Requirements — Smart-MathAI

> Nguồn: everything-claude-code / rules/common/testing.md  
> Tùy chỉnh cho dự án Smart-MathAI

## Minimum Test Coverage: 80%

Loại tests (tất cả đều bắt buộc):
1. **Unit Tests** — Từng function, utility, component riêng lẻ
2. **Integration Tests** — API endpoints, database operations
3. **E2E Tests** — Critical user flows (teacher workflow)

## Test-Driven Development

Quy trình BẮT BUỘC:
1. Viết test trước (RED)
2. Chạy test — phải FAIL
3. Viết implementation tối thiểu (GREEN)
4. Chạy test — phải PASS
5. Refactor (IMPROVE)
6. Verify coverage (80%+)

## Backend Test Setup (Python/pytest)

```bash
# Chạy tests
cd backend
pytest tests/ -v --cov=app --cov-report=term-missing

# Chạy test cụ thể
pytest tests/test_worksheets.py -v
```

```python
# Ví dụ unit test cho Smart-MathAI
def test_worksheet_cannot_have_grade_above_3():
    with pytest.raises(ValidationError):
        WorksheetCreateRequest(grade=4, topic="Phép cộng", ...)

def test_published_worksheet_is_downloadable():
    worksheet = create_test_worksheet(status="published")
    assert worksheet.status == "published"

def test_draft_worksheet_not_published():
    worksheet = create_test_worksheet(status="draft")
    assert worksheet.status == "draft"
```

## Frontend Test Setup (TypeScript/Vitest)

```bash
# Chạy tests
cd frontend
npm test

# Với coverage
npm test -- --coverage
```

```typescript
// Ví dụ test cho Smart-MathAI
describe("WorksheetCard", () => {
  it("shows download button only for published worksheets", () => {
    const { queryByText } = render(<WorksheetCard status="draft" />)
    expect(queryByText("Tải xuống PDF")).not.toBeInTheDocument()
  })

  it("shows edit button for authenticated teacher", () => {
    const { getByText } = render(<WorksheetCard role="teacher" />)
    expect(getByText("Điều chỉnh")).toBeInTheDocument()
  })
})
```

## Critical Test Cases cho Smart-MathAI

Luôn phải test các trường hợp sau:
- [ ] Grade validation (chỉ 1-3)
- [ ] Teacher authentication required for all routes
- [ ] Draft vs published worksheet visibility
- [ ] AI output không auto-publish
- [ ] OCR confidence threshold enforcement
- [ ] PDF export generation

## Troubleshooting Test Failures

1. Kiểm tra test isolation
2. Verify mocks chính xác
3. Fix implementation, không fix tests (trừ khi tests sai)
