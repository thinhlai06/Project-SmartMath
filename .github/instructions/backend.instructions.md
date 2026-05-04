---
name: Backend FastAPI Rules
description: "Use when editing Python backend files in FastAPI. Enforce grade boundary, role checks, ORM-only data access, and Vietnamese-friendly errors."
applyTo: backend/**/*.py
---

# Backend Patterns — Smart-MathAI

## Layered Architecture

```
routes/          ← HTTP layer (validate inputs, call services, return responses)
services/        ← Business logic thuần túy (không biết HTTP)
repositories/    ← Data access layer (SQLAlchemy queries)
models/          ← SQLAlchemy ORM models
schemas/         ← Pydantic request/response schemas (validation)
services/ai/     ← AI logic cô lập (qwen3:1.7b, glm-ocr:latest, RAG)
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
        """Chỉ published worksheets (cho PDF export / xem trước)"""
        return (
            self.db.query(Worksheet)
            .filter(
                Worksheet.class_id == class_id,
                Worksheet.status == "published",
            )
            .all()
        )
    
    def find_all_by_class(self, class_id: int) -> list[Worksheet]:
        """Dùng cho Teacher — tất cả worksheets kể cả draft"""
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
            raise DomainError("Chỉ hỗ trợ lớp 1, 2, hoặc 3")
        
        worksheet = Worksheet(
            grade=request.grade,
            topic=request.topic,
            title=request.title,
            status="draft",          # LUÔN bắt đầu là draft
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
        raise HTTPException(403, detail="Chỉ giáo viên mới có quyền này")
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
    current_user: User = Depends(require_teacher),  # Chỉ Teacher
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

## Pydantic Schema với Domain Constraints

```python
# schemas/worksheet.py
from typing import Literal
from pydantic import BaseModel, Field

class WorksheetCreateRequest(BaseModel):
    grade: Literal[1, 2, 3]   # ← Pydantic tự reject grade 4+
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
    
# Sử dụng trong route
return ApiResponse(success=True, data=worksheet_data)
return ApiResponse(success=False, error="Không tìm thấy bài tập")
```

## Standard HTTP Codes

| Code | Khi nào |
|------|---------|
| 200 | Thành công (GET, PUT) |
| 201 | Tạo thành công (POST) |
| 400 | Validation error |
| 401 | Chưa đăng nhập |
| 403 | Sai role |
| 404 | Không tìm thấy |
| 500 | Lỗi server (log chi tiết, trả về message chung) |

## Student Profile & Excel Import (Epic 1)

- Student profile fields chuẩn:
    - `dob` (nullable Date)
    - `parent_name` (nullable String(100))
    - `parent_phone` (nullable String(20))
- `StudentResponse` nên trả thêm `avg_score` (nullable, thang 0-10) để frontend render profile card.
- Endpoint import Excel bắt buộc dùng `UploadFile = File(...)` và kiểm tra quyền lớp với teacher trước khi xử lý dữ liệu.
- File import phải đúng template tiêu đề tiếng Việt theo thứ tự:
    - `Họ và tên`
    - `Ngày tháng năm sinh`
    - `Họ tên bố hoặc mẹ`
    - `SĐT bố hoặc mẹ`
- Parse ngày sinh linh hoạt (`dd/mm/yyyy`, `dd-mm-yyyy`, `yyyy-mm-dd`, ...) và trả lỗi rõ dòng khi parse thất bại.
- Khi import danh sách học sinh phải lưu bulk bằng `session.add_all()` trong một transaction, không commit từng dòng.

