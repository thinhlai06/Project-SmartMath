---
name: backend-patterns
description: >
  Patterns phá»• biáº¿n cho Smart-MathAI FastAPI backend: Repository pattern, service layer,
  dependency injection, error handling. DÃ¹ng khi implement endpoints má»›i, refactor
  backend code, hoáº·c cáº§n tham kháº£o cÃ¡ch tá»• chá»©c code Python/FastAPI Ä‘Ãºng chuáº©n.
---

## Smart-MathAI Guardrails (MANDATORY)

- Scope: only Vietnamese primary Math for grades 1-3.
- Roles: Teacher only. No Parent role exists.
- AI output must remain draft; Teacher review is required before publish.
- Approved AI models only: qwen2.5:3b (generation + grading text, local), gemma4:31b via Ollama Cloud (OCR image), vietnamese-sbert (RAG).
- Do not introduce other AI models or auto-publish flows.
- Backend: FastAPI + SQLAlchemy ORM only (no raw SQL); enforce grade with Literal[1,2,3] when applicable.
- Frontend: TypeScript strict mode, immutable updates, role-based rendering, Vietnamese UX/error messages.
- Keep AI logic isolated under backend/app/services/ai and mock AI calls in tests.

# Backend Patterns â€” Smart-MathAI

## Layered Architecture

```
routes/          â† HTTP layer (validate inputs, call services, return responses)
services/        â† Business logic thuáº§n tÃºy (khÃ´ng biáº¿t HTTP)
repositories/    â† Data access layer (SQLAlchemy queries)
models/          â† SQLAlchemy ORM models
schemas/         â† Pydantic request/response schemas (validation)
services/ai/     ← AI logic cô lập (gemma3:12b Cloud, qwen2.5:3b local, gemma4:31b Cloud OCR, RAG)
```

## Repository Pattern

```python
# repositories/worksheet_repository.py
class WorksheetRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def find_by_id(self, id: int) -> Worksheet | None:
        return self.db.query(Worksheet).filter(Worksheet.id == id).first()
    
    def find_published_by_class(self, class_id: int) -> list[Worksheet]:
        """Only published worksheets (for PDF export / preview)"""
        return (
            self.db.query(Worksheet)
            .filter(
                Worksheet.class_id == class_id,
                Worksheet.status == "published",
            )
            .all()
        )
    
    def find_all_by_class(self, class_id: int) -> list[Worksheet]:
        """DÃ¹ng cho Teacher â€” táº¥t cáº£ worksheets ká»ƒ cáº£ draft"""
        return self.db.query(Worksheet).filter(Worksheet.class_id == class_id).all()
    
    def save(self, worksheet: Worksheet) -> Worksheet:
        self.db.add(worksheet)
        self.db.commit()
        self.db.refresh(worksheet)
        return worksheet
```

## Service Layer

```python
# services/worksheet_service.py
class WorksheetService:
    def __init__(self, repo: WorksheetRepository):
        self._repo = repo
    
    def create_worksheet(
        self,
        request: WorksheetCreateRequest,
        teacher_id: int,
    ) -> Worksheet:
        if request.grade > 3:
            raise DomainError("Chá»‰ há»— trá»£ lá»›p 1, 2, hoáº·c 3")
        
        worksheet = Worksheet(
            grade=request.grade,
            topic=request.topic,
            title=request.title,
            status="draft",          # LUÃ”N báº¯t Ä‘áº§u lÃ  draft
            teacher_id=teacher_id,
            class_id=request.class_id,
        )
        return self._repo.save(worksheet)
    
    def get_published_worksheets(
        self, class_id: int
    ) -> list[Worksheet]:
        return self._repo.find_published_by_class(class_id)
```

## Dependency Injection

```python
# dependencies.py

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def require_teacher(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "teacher":
        raise HTTPException(403, detail="Chá»‰ giÃ¡o viÃªn má»›i cÃ³ quyá»n nÃ y")
    return current_user

def get_worksheet_service(db: Session = Depends(get_db)) -> WorksheetService:
    repo = WorksheetRepository(db)
    return WorksheetService(repo)
```

## Route Pattern

```python
# routes/worksheets.py
router = APIRouter(prefix="/api/worksheets", tags=["worksheets"])

@router.post("/", response_model=WorksheetResponse, status_code=201)
async def create_worksheet(
    request: WorksheetCreateRequest,
    service: WorksheetService = Depends(get_worksheet_service),
    current_user: User = Depends(require_teacher),  # Chá»‰ Teacher
):
    return service.create_worksheet(request, current_user.id)


@router.get("/class/{class_id}/published", response_model=list[WorksheetResponse])
async def get_published_worksheets(
    class_id: int,
    service: WorksheetService = Depends(get_worksheet_service),
    current_user: User = Depends(require_teacher),  # Teacher only
):
    return service.get_published_worksheets(class_id)
```

## Pydantic Schema vá»›i Domain Constraints

```python
# schemas/worksheet.py
from typing import Literal
from pydantic import BaseModel, Field

class WorksheetCreateRequest(BaseModel):
    grade: Literal[1, 2, 3]   # â† Pydantic tá»± reject grade 4+
    topic: str = Field(..., min_length=1, max_length=100)
    difficulty: Literal["nhan_biet", "thong_hieu", "van_dung", "van_dung_cao"]
    title: str = Field(..., min_length=1, max_length=200)
    class_id: int
```

## API Response Format

```python
from typing import Generic, TypeVar
T = TypeVar("T")

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: T | None = None
    error: str | None = None
    
# Sá»­ dá»¥ng trong route
return ApiResponse(success=True, data=worksheet_data)
return ApiResponse(success=False, error="KhÃ´ng tÃ¬m tháº¥y bÃ i táº­p")
```

## Standard HTTP Codes

| Code | Khi nÃ o |
|------|---------|
| 200 | ThÃ nh cÃ´ng (GET, PUT) |
| 201 | Táº¡o thÃ nh cÃ´ng (POST) |
| 400 | Validation error |
| 401 | ChÆ°a Ä‘Äƒng nháº­p |
| 403 | Sai role |
| 404 | KhÃ´ng tÃ¬m tháº¥y |
| 500 | Lá»—i server (log chi tiáº¿t, tráº£ vá» message chung) |

