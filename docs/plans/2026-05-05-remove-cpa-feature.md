# Plan: Xóa tính năng Tạo CPA (CPA Wizard + CPA Bundle)

> **Mục tiêu:** Gỡ bỏ hoàn toàn tính năng tạo bài tập CPA (Concrete-Pictorial-Abstract) khỏi hệ thống, bao gồm backend, frontend, tests, database migration, và documentation.
>
> **Nguyên tắc:** Không được ảnh hưởng đến các tính năng: Differentiation Wizard, AI Grading/OCR, Error Analytics, Chatbot, PDF Export (cho differentiation), Class/Student Management.
>
> **Commit message:** `feat: remove CPA feature to prepare for replacement`

---

## MỤC LỤC

1. [Task 1: Xóa backend files CPA-specific](#task-1)
2. [Task 2: Revert backend schemas & models](#task-2)
3. [Task 3: Revert backend routing, DI container, config](#task-3)
4. [Task 4: Revert backend services (question_generator, pdf, chat, adapters)](#task-4)
5. [Task 5: Revert backend service imports (worksheet_service, class_service)](#task-5)
6. [Task 6: Tạo Alembic migration](#task-6)
7. [Task 7: Xóa frontend files CPA-specific](#task-7)
8. [Task 8: Revert frontend routing & navigation](#task-8)
9. [Task 9: Revert frontend pages](#task-9)
10. [Task 10: Revert frontend types & services](#task-10)
11. [Task 11: Revert mock data](#task-11)
12. [Task 12: Cập nhật Documentation](#task-12)
13. [Task 13: Verification (tests + build)](#task-13)

---

<a id="task-1"></a>
## Task 1: Xóa backend files CPA-specific (17 files)

### Files cần XÓA:

**Schemas:**
- `backend/app/schemas/cpa_bundle.py` (227 dòng) — Toàn bộ CPA Bundle Pydantic schemas

**Use Cases:**
- `backend/app/application/use_cases/ai/generate_cpa_draft.py` — Legacy CPA draft use case
- `backend/app/application/use_cases/ai/generate_cpa_bundle.py` — CPA Bundle generation use case
- `backend/app/application/use_cases/ai/save_cpa_bundles.py` — Save approved bundles use case

**Services:**
- `backend/app/services/ai/cpa_bundle_generator.py` (720 dòng) — Core bundle generator (arithmetic, geometry, measurement families)
- `backend/app/services/ai/cpa_validator.py` (481 dòng) — Pedagogical validator (9 check layers)
- `backend/app/services/cpa_render_service.py` — HTML/SVG/LaTeX renderer cho CPA bundles
- `backend/app/services/ai/topic_family.py` — TopicGenerationMetadata (chỉ dùng bởi CPA bundle generator)

**Domain & Infrastructure:**
- `backend/app/domain/repositories/cpa_bundle_repository.py` — Abstract repository port
- `backend/app/infrastructure/db/sqlalchemy/repositories/cpa_bundle_repository.py` — SQLAlchemy implementation

**Models:**
- `backend/app/models/cpa_bundle.py` — CPABundleRecord SQLAlchemy model (bảng `cpa_bundles`)

**Tests:**
- `backend/tests/test_cpa_bundle_endpoints.py` — Bundle endpoint integration tests
- `backend/tests/test_cpa_validator.py` — Validator unit tests
- `backend/test_cpa_api.py` — Root-level CPA API test script

**Migration (xóa file, sẽ tạo migration mới ở Task 6):**
- `backend/alembic/versions/20260405_add_cpa_bundles_table.py` — Migration tạo bảng cpa_bundles

### Lệnh thực thi:
```powershell
# Schemas
Remove-Item "backend/app/schemas/cpa_bundle.py"

# Use Cases
Remove-Item "backend/app/application/use_cases/ai/generate_cpa_draft.py"
Remove-Item "backend/app/application/use_cases/ai/generate_cpa_bundle.py"
Remove-Item "backend/app/application/use_cases/ai/save_cpa_bundles.py"

# Services
Remove-Item "backend/app/services/ai/cpa_bundle_generator.py"
Remove-Item "backend/app/services/ai/cpa_validator.py"
Remove-Item "backend/app/services/cpa_render_service.py"
Remove-Item "backend/app/services/ai/topic_family.py"

# Domain & Infrastructure
Remove-Item "backend/app/domain/repositories/cpa_bundle_repository.py"
Remove-Item "backend/app/infrastructure/db/sqlalchemy/repositories/cpa_bundle_repository.py"

# Models
Remove-Item "backend/app/models/cpa_bundle.py"

# Tests
Remove-Item "backend/tests/test_cpa_bundle_endpoints.py"
Remove-Item "backend/tests/test_cpa_validator.py"
Remove-Item "backend/test_cpa_api.py"

# Migration cũ
Remove-Item "backend/alembic/versions/20260405_add_cpa_bundles_table.py"
```

### Kiểm tra sau khi xóa:
```powershell
# Đảm bảo không còn file nào
Get-ChildItem -Recurse backend/app -Filter "*cpa*" -Include "*.py" | Where-Object { $_.FullName -notmatch "venv|__pycache__" }
```

---

<a id="task-2"></a>
## Task 2: Revert backend schemas & models

### 2.1 File: `backend/app/schemas/worksheet.py`

**Thay đổi:**
- Xóa `CPA = "cpa"` khỏi `WorksheetType` enum → chỉ còn `DIFFERENTIATION = "differentiation"`
- Xóa toàn bộ `ExerciseType` enum (concrete/pictorial/abstract) — đây là CPA-specific
- Xóa field `exercise_type` khỏi `ExerciseBase`, `ExerciseCreate`, `ExerciseUpdate`
- Xóa comment `# For CPA worksheets` ở mọi nơi

**Trước:**
```python
class WorksheetType(str, Enum):
    CPA = "cpa"
    DIFFERENTIATION = "differentiation"

class ExerciseType(str, Enum):
    """CPA exercise types."""
    CONCRETE = "concrete"
    PICTORIAL = "pictorial"
    ABSTRACT = "abstract"
```

**Sau:**
```python
class WorksheetType(str, Enum):
    DIFFERENTIATION = "differentiation"

# Xóa hoàn toàn ExerciseType enum
```

**LƯU Ý:** Cần kiểm tra mọi import của `ExerciseType` trong các file khác. Grep:
```powershell
grep -r "ExerciseType" backend/app --include="*.py" | grep -v "__pycache__"
```

### 2.2 File: `backend/app/schemas/ai.py`

**Thay đổi:**
- Xóa toàn bộ block import `from app.schemas.cpa_bundle import (...)` 
- Xóa class `CPAGenerationRequest` 
- Xóa class `CPAGenerationResponse`
- Giữ nguyên: `DifferentiationRequest`, `DifferentiationResponse`, `QuestionItem`, các schema grading/analytics

**Trước:**
```python
from app.schemas.cpa_bundle import (
    CPABundle,
    CPABundleGenerationRequest,
    CPABundleGenerationResponse,
    SaveCPABundlesRequest,
    SaveCPABundlesResponse,
    ValidationIssue,
    ValidationResult,
)
...
class CPAGenerationRequest(BaseModel):
    topic_id: int
    grade: Literal[1, 2, 3]
    objective: str
    counts: Optional[Dict[str, int]] = None

class CPAGenerationResponse(BaseModel):
    concrete: List[QuestionItem]
    pictorial: List[QuestionItem]
    abstract: List[QuestionItem]
```

**Sau:** Xóa toàn bộ block trên. Giữ nguyên phần còn lại.

### 2.3 File: `backend/app/models/worksheet.py`

**Thay đổi:**
- Xóa `CPA = "cpa"` khỏi `WorksheetType` enum
- Xóa relationship `cpa_bundles = relationship("CPABundleRecord", ...)`

**Trước:**
```python
class WorksheetType(str, enum.Enum):
    CPA = "cpa"
    DIFFERENTIATION = "differentiation"
...
    cpa_bundles = relationship("CPABundleRecord", back_populates="worksheet", cascade="all, delete-orphan")
```

**Sau:**
```python
class WorksheetType(str, enum.Enum):
    DIFFERENTIATION = "differentiation"
...
    # Xóa dòng cpa_bundles relationship
```

### 2.4 File: `backend/app/models/worksheet_exercise.py`

**Thay đổi:**
- Xóa toàn bộ `ExerciseType` enum (concrete/pictorial/abstract)
- Xóa column `exercise_type = Column(SQLEnum(ExerciseType), nullable=True)`
- Giữ nguyên: `DifficultyTier` enum và `difficulty_tier` column

**Trước:**
```python
class ExerciseType(str, enum.Enum):
    """CPA exercise types."""
    CONCRETE = "concrete"
    PICTORIAL = "pictorial"
    ABSTRACT = "abstract"
...
    exercise_type = Column(SQLEnum(ExerciseType), nullable=True)  # For CPA worksheets
```

**Sau:**
```python
# Xóa ExerciseType enum hoàn toàn
# Xóa exercise_type column
```

### 2.5 File: `backend/app/models/__init__.py`

**Thay đổi:**
- Xóa `from app.models.cpa_bundle import CPABundleRecord`
- Xóa `"CPABundleRecord"` khỏi `__all__`

### 2.6 File: `backend/app/main.py`

**Thay đổi:**
- Xóa `from app.models.cpa_bundle import CPABundleRecord`
- Cập nhật description: thay `Tạo và quản lý bài tập CPA/Differentiation` → `Tạo và quản lý bài tập Differentiation`

---

<a id="task-3"></a>
## Task 3: Revert backend routing, DI container

### 3.1 File: `backend/app/routers/ai.py`

**Thay đổi — Xóa imports:**
```python
# XÓA:
from app.application.use_cases.ai.generate_cpa_draft import GenerateCPADraftUseCase
from app.application.use_cases.ai.generate_cpa_bundle import GenerateCPABundleUseCase
from app.application.use_cases.ai.save_cpa_bundles import SaveCPABundlesUseCase

# XÓA từ bootstrap imports:
get_cpa_bundle_repository,
get_generate_cpa_bundle_use_case,
get_generate_cpa_draft_use_case,
get_save_cpa_bundles_use_case,

# XÓA từ schemas imports:
CPAGenerationRequest,
CPABundle,
CPABundleGenerationRequest,
CPABundleGenerationResponse,
SaveCPABundlesRequest,
SaveCPABundlesResponse,

# XÓA infrastructure import:
from app.infrastructure.db.sqlalchemy.repositories.cpa_bundle_repository import SqlAlchemyCPABundleRepository
```

**Thay đổi — Xóa 4 endpoints:**
1. `POST /generate-cpa` — hàm `generate_cpa_worksheet`
2. `POST /generate-cpa-bundle` — hàm `generate_cpa_bundle`
3. `POST /worksheets/{worksheet_id}/cpa-bundles` — hàm `save_cpa_bundles`
4. `GET /worksheets/{worksheet_id}/cpa-bundles` — hàm `get_cpa_bundles`

**GIỮNGUYÊN:** Tất cả endpoints khác (generate-differentiation, grade-image, status, chat, analytics, grading-report, exercise-explanation, student-errors, v.v.)

### 3.2 File: `backend/app/interfaces/api/v1/routers/ai_router.py`

**Thay đổi:**
- Xóa import `GenerateCPADraftUseCase`, `get_generate_cpa_draft_use_case`, `CPAGenerationRequest`
- Xóa endpoint `POST /generate-cpa` (hàm `generate_cpa_worksheet_v1`)
- Giữ nguyên: differentiation endpoint, analytics submit endpoint

### 3.3 File: `backend/app/bootstrap/container.py`

**Thay đổi — Xóa imports:**
```python
# XÓA:
from app.application.use_cases.ai.generate_cpa_bundle import GenerateCPABundleUseCase
from app.application.use_cases.ai.generate_cpa_draft import GenerateCPADraftUseCase
from app.application.use_cases.ai.save_cpa_bundles import SaveCPABundlesUseCase
from app.infrastructure.db.sqlalchemy.repositories.cpa_bundle_repository import SqlAlchemyCPABundleRepository
from app.services.ai.cpa_bundle_generator import CPABundleGenerator
from app.services.ai.cpa_validator import CPABundleValidator
from app.services.cpa_render_service import CPARenderService
```

**Thay đổi — Xóa factory functions:**
```python
# XÓA toàn bộ các hàm:
def get_cpa_bundle_repository(...) -> SqlAlchemyCPABundleRepository
def get_cpa_validator() -> CPABundleValidator
def get_cpa_render_service() -> CPARenderService
def get_cpa_bundle_generator(...) -> CPABundleGenerator
def get_generate_cpa_draft_use_case(...) -> GenerateCPADraftUseCase
def get_generate_cpa_bundle_use_case(...) -> GenerateCPABundleUseCase
def get_save_cpa_bundles_use_case(...) -> SaveCPABundlesUseCase
```

**GIỮNGUYÊN:** `get_topic_repository`, `get_worksheet_repository`, `get_class_repository`, `get_question_generation_port`, `get_rag_service`, `get_generate_differentiation_draft_use_case`, `get_publish_worksheet_use_case`

---

<a id="task-4"></a>
## Task 4: Revert backend services

### 4.1 File: `backend/app/services/ai/question_generator.py`

**Thay đổi — Xóa các method CPA-specific:**
- Xóa method `generate_cpa_questions` (backward-compatible entrypoint)
- Xóa method `generate_cpa_questions_legacy` (legacy pipeline)
- Xóa method `generate_cpa_questions_new` (new template-first pipeline)
- Xóa method `_build_cpa_seed_prompt` (prompt builder)
- Giữ nguyên: `generate_differentiation_questions`, `_build_differentiation_prompt`, tất cả RAG/template methods chung

**LƯU Ý QUAN TRỌNG:** Cần kiểm tra kỹ các methods shared giữa CPA và differentiation:
- `_retrieve_templates_for_level` — dùng bởi cả CPA và differentiation → GIỮNGUYÊN
- `_parse_json` — utility chung → GIỮNGUYÊN
- `_validate_question_fields` — utility chung → GIỮNGUYÊN
- RAG retrieval methods — dùng chung → GIỮNGUYÊN

### 4.2 File: `backend/app/infrastructure/ai/question_generator_adapter.py`

**Thay đổi:**
- Xóa method `generate_cpa_questions` (calls `self.generator.generate_cpa_questions_new`)
- Giữ nguyên: `generate_differentiation_questions`

### 4.3 File: `backend/app/application/ports/question_generation_port.py`

**Thay đổi:**
- Xóa abstract method `generate_cpa_questions`
- Giữ nguyên: `generate_differentiation_questions`

### 4.4 File: `backend/app/services/pdf_service.py`

**Thay đổi:**
- Xóa constant `CPA_SECTIONS` dict
- Xóa hàm `_add_cpa_content`
- Cập nhật hàm `generate_worksheet_pdf`: bỏ branch `if worksheet.worksheet_type == WorksheetType.CPA` → chỉ còn differentiation content

**Trước:**
```python
CPA_SECTIONS = {
    "concrete": {"name": "CỤ THỂ (CONCRETE)", ...},
    "pictorial": {"name": "HÌNH ẢNH (PICTORIAL)", ...},
    "abstract": {"name": "TRỪU TƯỢNG (ABSTRACT)", ...},
}
...
if worksheet.worksheet_type == WorksheetType.CPA:
    _add_cpa_content(pdf, exercises)
else:
    _add_differentiation_content(pdf, exercises)
```

**Sau:**
```python
# Xóa CPA_SECTIONS
# Xóa _add_cpa_content function
# Đổi branching thành:
_add_differentiation_content(pdf, exercises)
```

### 4.5 File: `backend/app/services/ai/chat_service.py`

**Thay đổi:**
- Trong `SYSTEM_INSTRUCTION`: thay `Hỗ trợ phương pháp CPA (Concrete-Pictorial-Abstract) trong dạy Toán` → `Hỗ trợ giáo viên trong dạy Toán tiểu học`
- Trong `HOMEWORK_ANALYSIS_PROMPT`: thay `Đề xuất cách sửa lỗi theo phương pháp CPA (Concrete → Pictorial → Abstract)` → `Đề xuất cách sửa lỗi phù hợp trình độ tiểu học`
- Trong `WHITEBOARD_VERIFICATION_PROMPT`: thay `Gợi ý cách trình bày tốt hơn theo CPA` → `Gợi ý cách trình bày tốt hơn`
- Xóa `"cpa_advisor"` intent keywords và xóa `"cpa_advisor"` khỏi intent list
- Xóa các branch `elif intent == "cpa_advisor"` trong method `_route_with_context`

**LƯU Ý:** RAG service vẫn GIỮNGUYÊN (nó được dùng chung, không chỉ CPA). Chỉ xóa CPA-specific intent routing.

---

<a id="task-5"></a>
## Task 5: Revert backend service imports

### 5.1 File: `backend/app/services/worksheet_service.py`

**Thay đổi:**
- Xóa `from app.models.cpa_bundle import CPABundleRecord`
- Xóa dòng `db.query(CPABundleRecord).filter(CPABundleRecord.worksheet_id == worksheet_id).delete(...)`

**GIỮNGUYÊN:** Tất cả các delete queries khác (GradeEntry, StudentProgress, StudentAnalytics, WorksheetExercise)

### 5.2 File: `backend/app/services/class_service.py`

**Thay đổi:**
- Xóa `from app.models.cpa_bundle import CPABundleRecord`
- Xóa dòng `db.query(CPABundleRecord).filter(CPABundleRecord.worksheet_id.in_(worksheet_ids_query)).delete(...)`

### 5.3 File: `backend/app/routers/worksheets.py`

**Thay đổi:**
- Cập nhật query parameter description: `"Lọc theo loại (cpa/differentiation)"` → `"Lọc theo loại (differentiation)"`

---

<a id="task-6"></a>
## Task 6: Tạo Alembic migration

**Tạo file:** `backend/alembic/versions/20260505_remove_cpa_feature.py`

**Nội dung migration:**
```python
"""Remove CPA feature: drop cpa_bundles table, remove exercise_type column, handle existing CPA worksheets."""

revision = '20260505_remove_cpa'
down_revision = '<PREVIOUS_REVISION>'  # Lấy revision mới nhất từ alembic

def upgrade():
    # 1. Drop cpa_bundles table
    op.drop_table('cpa_bundles')
    
    # 2. Remove exercise_type column from worksheet_exercises
    op.drop_column('worksheet_exercises', 'exercise_type')
    
    # 3. Update existing CPA worksheets → differentiation (hoặc xóa)
    # Option A: Convert CPA worksheets thành differentiation
    op.execute("UPDATE worksheets SET worksheet_type = 'differentiation' WHERE worksheet_type = 'cpa'")
    # Option B: Hoặc xóa CPA worksheets (nếu muốn clean slate)
    # op.execute("DELETE FROM worksheets WHERE worksheet_type = 'cpa'")

def downgrade():
    # Recreate exercise_type column
    op.add_column('worksheet_exercises', sa.Column('exercise_type', sa.String(20), nullable=True))
    
    # Recreate cpa_bundles table
    op.create_table('cpa_bundles', ...)
```

**LƯU Ý:** 
- Kiểm tra revision chain trước khi tạo: `alembic heads`
- Test migration trên DB copy trước
- Nếu dùng SQLite (dev), một số ALTER TABLE operations bị hạn chế → cần batch mode

---

<a id="task-7"></a>
## Task 7: Xóa frontend files CPA-specific

### Files cần XÓA:

**Components (toàn bộ thư mục):**
- `frontend/src/components/cpa/` — 9 files:
  - `CPAStepWizard.tsx` (508 dòng) — Main wizard page
  - `CPABundleReviewPanel.tsx` — Bundle review container
  - `CPABundleCard.tsx` (229 dòng) — Individual bundle card
  - `ConcreteDisplay.tsx` — Concrete layer renderer
  - `PictorialDisplay.tsx` — Pictorial layer renderer
  - `AbstractDisplay.tsx` — Abstract layer renderer
  - `Step1Input.tsx` — Wizard step 1
  - `Step2CPAGenerator.tsx` — Wizard step 2
  - `Step3Review.tsx` — Wizard step 3

**Services:**
- `frontend/src/services/cpaBundleApi.ts` (138 dòng) — CPA Bundle API client

**Types:**
- `frontend/src/types/cpaBundle.ts` (125 dòng) — CPA Bundle TypeScript types

**Mock data:**
- `frontend/src/mockData/cpaTopics.ts` — Mock CPA topics (đã renamed nhưng vẫn CPA-specific)

### Lệnh thực thi:
```powershell
Remove-Item "frontend/src/components/cpa" -Recurse
Remove-Item "frontend/src/services/cpaBundleApi.ts"
Remove-Item "frontend/src/types/cpaBundle.ts"
Remove-Item "frontend/src/mockData/cpaTopics.ts"
```

---

<a id="task-8"></a>
## Task 8: Revert frontend routing & navigation

### 8.1 File: `frontend/src/App.tsx`

**Thay đổi:**
- Xóa import: `import { CPAStepWizard } from './components/cpa/CPAStepWizard';`
- Xóa Route block:
```tsx
// XÓA:
<Route
  path="/cpa-wizard"
  element={
    <ProtectedRoute allowedRoles={['teacher']}>
      <CPAStepWizard />
    </ProtectedRoute>
  }
/>
```

### 8.2 File: `frontend/src/components/Navigation.tsx`

**Thay đổi:**
- Xóa nav link: `{ label: 'Tạo CPA', href: '/cpa-wizard', icon: Sparkles }`
- Nếu icon `Sparkles` không còn được dùng ở đâu, xóa import

---

<a id="task-9"></a>
## Task 9: Revert frontend pages

### 9.1 File: `frontend/src/pages/HomePage.tsx`

**Thay đổi:**
- Feature list: thay `Tạo bài tập CPA (Concrete-Pictorial-Abstract)` → Xóa hoặc thay bằng text generic
- Stats: thay `Sinh câu hỏi CPA thông minh` → `Hỗ trợ AI thông minh`
- Quick action: thay `onClick={() => navigate('/cpa-wizard')}` → `onClick={() => navigate('/differentiation-wizard')}`
- Quick action title: thay `Sinh bài tập` → `Phân hóa bài tập` (hoặc tên tính năng mới khi có)

### 9.2 File: `frontend/src/pages/WorksheetsPage.tsx`

**Thay đổi:**
- Default `worksheet_type`: thay `'cpa'` → `'differentiation'`
- Description: thay `Quản lý bài tập CPA và phân hóa` → `Quản lý bài tập phân hóa`
- Xóa filter button CPA:
```tsx
// XÓA:
<Button
    variant={filterType === 'cpa' ? 'default' : 'outline'}
    size="sm"
    onClick={() => setFilterType('cpa')}
>
    CPA
</Button>
```
- Creation form: xóa button chọn type CPA, chỉ còn differentiation → auto-set `worksheet_type: 'differentiation'`

### 9.3 File: `frontend/src/pages/WorksheetEditorPage.tsx`

**Thay đổi:**
- Xóa constant `CPA_SECTIONS` array
- Xóa import `ExerciseType` (nếu chỉ dùng cho CPA)
- Simplify `sections` variable: bỏ branch `worksheet.worksheet_type === 'cpa'`, chỉ còn `DIFF_TIERS`
- Simplify `getExercisesForSection`: bỏ branch CPA filter by `exercise_type`
- Simplify save logic: bỏ branch `if (worksheet.worksheet_type === 'cpa')`
- Simplify Badge: bỏ CPA ternary, chỉ hiện 'Phân hóa'

### 9.4 File: `frontend/src/pages/ClassDetailPage.tsx`

**Thay đổi:**
- Thay `{ws.worksheet_type === 'cpa' ? 'CPA' : 'Phân hóa'}` → `'Phân hóa'`

### 9.5 File: `frontend/src/components/redesign/teacher/WorksheetGridCard.tsx`

**Thay đổi:**
- Simplify `typeLabel`: bỏ CPA check → luôn hiện 'Phân hóa'
- Simplify `typeBadgeClass`: bỏ CPA color class

---

<a id="task-10"></a>
## Task 10: Revert frontend types & services

### 10.1 File: `frontend/src/types/worksheet.ts`

**Thay đổi:**
- Xóa `'cpa'` khỏi `WorksheetType` union → `export type WorksheetType = "differentiation";`
- Xóa toàn bộ `ExerciseType` type (`"concrete" | "pictorial" | "abstract"`)
- Xóa field `exercise_type` khỏi `Exercise`, `ExerciseCreate`, `ExerciseUpdate` interfaces

### 10.2 File: `frontend/src/services/worksheetApi.ts`

**Thay đổi:**
- Xóa `'cpa'` khỏi `WorksheetType` union
- Xóa `ExerciseType` type
- Xóa `exercise_type` fields trong interfaces

### 10.3 File: `frontend/src/services/aiApi.ts`

**Thay đổi:**
- Xóa method `generateCPA` hoàn toàn:
```typescript
// XÓA:
generateCPA: async (params: {
    topic_id: number;
    grade: number;
    objective: string;
    counts?: Record<string, number>;
}) => {
    const { data } = await api.post('/ai/generate-cpa', params);
    return data;
},
```

### 10.4 File: `frontend/src/types/index.ts`

**Kiểm tra:** Nếu có re-export `ExerciseType` hoặc CPA types → xóa

---

<a id="task-11"></a>
## Task 11: Revert mock data

### 11.1 File: `frontend/src/mockData/announcements.ts`

**Thay đổi:**
- Thay `"Nhắc nhở hoàn thành bài tập CPA"` → `"Nhắc nhở hoàn thành bài tập"`

---

<a id="task-12"></a>
## Task 12: Cập nhật Documentation

### 12.1 File: `README.md`

**Thay đổi:**
- Section "Tạo câu hỏi thông minh": xóa `CPA Wizard` entry
- Feature list: thay CPA reference bằng generic hoặc placeholder cho tính năng mới
- Setup section: xóa bất kỳ CPA-specific config

### 12.2 File: `ARCHITECTURE.md`

**Thay đổi:**
- Section "Implemented clean slices": xóa `GenerateCpaDraftUseCase`
- Xóa bất kỳ CPA-related architecture notes

### 12.3 File: `PROJECT_OVERVIEW.md`

**Thay đổi:**
- Xóa/thay CPA references

### 12.4 File: `HUONG_DAN_CHAY.md`

**Thay đổi:**
- Xóa CPA wizard instructions nếu có

### 12.5 File: `CLAUDE.md`

**Thay đổi:**
- Xóa CPA references

### 12.6 File: `_bmad-output/project-context.md`

**Thay đổi:**
- Cập nhật `Phương pháp CPA` rule — xóa hoặc thay bằng context mới
- Cập nhật Cloud AI description: xóa `sinh câu hỏi CPA/Differentiation` → `sinh câu hỏi Differentiation`

### 12.7 Files: `.agent/skills/ai-workflow/SKILL.md` và `.github/instructions/ai-workflow.instructions.md`

**Thay đổi:**
- Xóa CPA references trong workflow descriptions

### 12.8 File: `_bmad-output/planning-artifacts/epics.md`

**Thay đổi:**
- Xóa CPA epics/stories nếu có

---

<a id="task-13"></a>
## Task 13: Verification

### 13.1 Backend tests
```powershell
cd backend
python -m pytest tests/ -v --tb=short 2>&1
```

**Expected:** 
- Tất cả CPA tests đã bị xóa → không chạy
- Differentiation tests, AI grading tests, dashboard tests vẫn PASS
- Không có `ImportError` từ CPA modules

### 13.2 Frontend build
```powershell
cd frontend
npm run build 2>&1
```

**Expected:**
- Build thành công, không có TypeScript errors
- Không có import errors từ deleted CPA components/types/services

### 13.3 Grep verification
```powershell
# Backend: không còn CPA references trong code (trừ docs)
grep -r "cpa_bundle\|CPABundle\|generate_cpa\|cpa_validator\|cpa_render" backend/app --include="*.py" | grep -v "__pycache__"

# Frontend: không còn CPA references
grep -r "cpa\|CPA\|cpaBundleApi\|cpaBundle\|CPAStep\|CPABundle" frontend/src --include="*.ts" --include="*.tsx"
```

**Expected:** Cả 2 grep trả về 0 results (trừ docs/plans).

### 13.4 Alembic migration test
```powershell
cd backend
alembic upgrade head
```

### 13.5 Smoke test
- Truy cập http://localhost:5173 → HomePage load OK
- Navigation không có link CPA
- Differentiation Wizard hoạt động bình thường
- AI Grading hoạt động bình thường
- Chatbot hoạt động bình thường (không crash khi mention "CPA")
- PDF export cho differentiation worksheets hoạt động

---

## REVIEW CHECKLIST

### Completeness Review ✅
- [x] Tất cả 17 backend CPA files được liệt kê xóa
- [x] Tất cả 12 frontend CPA files/dirs được liệt kê xóa
- [x] Tất cả file cần modify được liệt kê với diff cụ thể (trước/sau)
- [x] Alembic migration cho DB schema changes
- [x] Documentation updates (8 docs)
- [x] Verification steps với expected outcomes

### Safety Review ✅
- [x] Differentiation Wizard: KHÔNG bị ảnh hưởng (endpoints, use cases, frontend riêng biệt)
- [x] AI Grading/OCR: KHÔNG bị ảnh hưởng (dùng OllamaService riêng, không share code CPA)
- [x] Error Analytics: KHÔNG bị ảnh hưởng (AnalyticsService independent)
- [x] Chatbot: CPA intent bị xóa nhưng chatbot vẫn hoạt động (chỉ mất CPA advisor routing)
- [x] PDF Export: CPA section bị xóa nhưng differentiation section GIỮNGUYÊN
- [x] RAG Service: GIỮNGUYÊN (dùng chung, không CPA-specific)
- [x] `question_generator.py`: Chỉ xóa CPA methods, differentiation methods independent

### Risk Assessment ✅
- **Rủi ro thấp:** Xóa CPA code rõ ràng isolated, không share state với differentiation
- **Rủi ro trung bình:** `question_generator.py` là file lớn, cần review kỹ khi xóa methods
- **Rủi ro DB:** Migration cần test trên copy DB trước khi chạy production
- **Mitigation:** Grep verify sau mỗi task, chạy full test suite trước commit

### Execution Order Review ✅
1. Xóa files trước → tránh import errors khi modify
2. Modify schemas/models → fix type system
3. Modify routing/DI → fix dependency injection
4. Modify services → fix business logic
5. DB migration → fix schema
6. Frontend xóa → fix UI
7. Frontend modify → fix routing/types
8. Docs → update knowledge
9. Verify → confirm no regression

---

## TÓM TẮT

| Hạng mục | Số file xóa | Số file sửa | Ghi chú |
|---|---|---|---|
| Backend xóa | 17 files | — | Schemas, services, use cases, models, tests, migration |
| Backend sửa | — | 16 files | Routing, DI, schemas, models, services, adapters |
| Frontend xóa | 12 files | — | Components, services, types, mock data |
| Frontend sửa | — | 11 files | Routing, pages, types, services, navigation |
| Alembic | 1 file tạo mới | — | Drop table, remove column, convert data |
| Docs | — | 8 files | README, ARCHITECTURE, project-context, etc. |
| **TỔNG** | **30 files xóa** | **35 files sửa** | **1 migration mới** |
