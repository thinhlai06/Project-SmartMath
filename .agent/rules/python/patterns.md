---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Python Patterns — Smart-MathAI

> Nguồn: everything-claude-code / rules/python/patterns.md  
> Tùy chỉnh cho FastAPI + SQLAlchemy backend

## Protocol (Duck Typing)

```python
from typing import Protocol

class WorksheetRepository(Protocol):
    def find_by_id(self, id: int) -> Worksheet | None: ...
    def find_by_class(self, class_id: int, status: str | None = None) -> list[Worksheet]: ...
    def save(self, worksheet: Worksheet) -> Worksheet: ...
    def delete(self, id: int) -> bool: ...
```

## Dataclasses / Pydantic as DTOs

```python
from pydantic import BaseModel, Field
from typing import Literal

class WorksheetCreateRequest(BaseModel):
    grade: Literal[1, 2, 3]  # CRITICAL: không bao giờ > 3
    topic: str = Field(..., min_length=1, max_length=100)
    difficulty: Literal["nhan_biet", "thong_hieu", "van_dung", "van_dung_cao"]
    title: str = Field(..., min_length=1, max_length=200)
    class_id: int
```

## FastAPI Route Pattern

```python
# routes/worksheets.py
router = APIRouter(prefix="/worksheets", tags=["worksheets"])

@router.post("/", response_model=WorksheetResponse)
async def create_worksheet(
    request: WorksheetCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher),  # LUÔN check role
):
    # Validate grade constraint
    if request.grade > 3:
        raise HTTPException(400, "Chỉ hỗ trợ lớp 1-3")
    return worksheet_service.create(db, request, current_user)
```

## Context Managers & Generators

- Dùng context managers (`with`) cho resource management (DB sessions, file I/O)
- Dùng generators cho lazy evaluation và memory-efficient iteration

```python
# ĐÚNG — Context manager cho DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## AI Service Pattern (Isolated Module)

```python
# services/ai/question_generator.py — AI logic cô lập hoàn toàn
class QuestionGenerator:
    """
    LƯU Ý: Module này chỉ tạo DRAFT questions.
    Teacher PHẢI review trước khi publish.
    Không bao giờ auto-publish AI output.
    """
    
    def generate(
        self,
        grade: Literal[1, 2, 3],
        topic: str,
        difficulty: str,
        count: int = 5,
    ) -> list[QuestionDraft]:
        # Validate inputs
        assert 1 <= grade <= 3, "Grade phải là 1, 2, hoặc 3"
        ...
```

## Dependency Injection Pattern

```python
# Inject services, không khởi tạo trong route
def get_worksheet_service(db: Session = Depends(get_db)) -> WorksheetService:
    return WorksheetService(WorksheetRepository(db))

@router.get("/{id}")
async def get_worksheet(
    id: int,
    service: WorksheetService = Depends(get_worksheet_service),
    current_user: User = Depends(get_current_user),
):
    ...
```
