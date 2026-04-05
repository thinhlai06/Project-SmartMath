# Tái Thiết Kiến Trúc CPA Đúng Chuẩn Sư Phạm

## Bối Cảnh & Vấn Đề

Hệ thống hiện tại đang sinh CPA như 3 đoạn text độc lập (`{"question":"...","answer":"...","hint":"..."}`).
Đây là sai lầm thiết kế cốt lõi vì CPA không phải 3 câu hỏi mà là **1 lõi toán học được biểu diễn qua 3 tầng nhận thức**:

| Tầng | Đúng nghĩa | Hiện tại sai |
|------|-----------|-------------|
| **Concrete** | Thao tác vật thật / vật mô phỏng | Câu lời văn bình thường |
| **Pictorial** | Hình vẽ, sơ đồ, bar model, chấm tròn có thể render | Text mô tả suông |
| **Abstract** | Phép tính thuần ký hiệu | Gần đúng nhưng có thể lẫn ngữ cảnh |

**Vấn đề sâu hơn**: 3 phần C-P-A có thể dùng số khác nhau → đứt mạch học tập.

---

## Tổng Quan Giải Pháp

**Chuyển từ**: AI sinh 3 text questions riêng lẻ  
**Chuyển sang**: AI sinh 1 **CPA Bundle** thống nhất có cấu trúc → hệ thống **render** thành 3 tầng

```
AI (qwen3:1.7b)
  ↓ sinh CPA Bundle JSON (có math_core + spec cho từng tầng)
CPABundleValidator  
  ↓ kiểm tra tính nhất quán và đúng bản chất
CPARenderLayer
  ↓ render Concrete = tokens/vật thể | Pictorial = SVG/sơ đồ | Abstract = phép tính
WorksheetEditorPage (Teacher duyệt)
  ↓ Teacher nhìn thấy đúng 3 tầng, approve → lưu bundle
DB (lưu bundle + specs)
```

---

## User Review Required

> [!IMPORTANT]
> **Thay đổi database schema**: Cần thêm bảng `cpa_bundles` và cột `cpa_bundle_data` (JSON) vào `worksheet_exercises` HOẶC tách hẳn thành bảng riêng. Quyết định này ảnh hưởng migration. Đề xuất: **thêm bảng `cpa_bundles` riêng** để không đụng schema cũ.

> [!WARNING]
> **Breaking change với pipeline hiện tại**: `CPAGenerationResponse` schema cũ (`concrete: List[QuestionItem]`) sẽ bị thay bằng `CPABundleResponse`. Cần giữ backward-compat endpoint cũ hoặc version API. Đề xuất: **thêm endpoint mới `/api/ai/generate-cpa-bundle`**, giữ nguyên endpoint cũ.

> [!IMPORTANT]
> **Render layer phía frontend**: Concrete và Pictorial sẽ cần render SVG/canvas cho hình ảnh. Phạm vi MVP của plan này dùng **SVG inline** được generate từ spec (không cần canvas library phức tạp). Giáo viên vẫn có thể override text nếu cần.

---

## Kiến Trúc Dữ Liệu Mới: CPABundle

### Lõi Cấu Trúc Đa Hình (Polymorphic Math Core)
Thay vì thiết kế lõi toán học đơn giản chỉ có phép tính, `math_core` được tách thành **BaseCore** chung và **TopicSpecificCore** riêng để dễ mở rộng sau này (như hình học, đo lường).

```json
{
  "math_core": {
    "common": {
      "topic": "Phép chia có dư",
      "grade": 3,
      "operation_family": "division_with_remainder",
      "difficulty_band": "standard"
    },
    // Các fields phụ thuộc vào operation_family, ví dụ:
    "specific": {
      // Dành cho arithmetic (cộng/trừ/nhân thường):
      // "operand_a": 7, "operand_b": 5, "result": 12
      
      // Dành cho division_with_remainder:
      "dividend": 23,
      "divisor": 5,
      "quotient": 4,
      "remainder": 3
      
      // Dành cho measurement:
      // "value_a": 10, "value_b": 15, "unit": "cm"
      
      // Dành cho geometry:
      // "shape_type": "rectangle", "target_property": "perimeter"
    }
  }
}
```

### Concrete Spec
```json
{
  "concrete": {
    "manipulative_type": "que_tinh",  // "vien_bi" | "khoi_vuong" | "dong_xu" | "que_tinh"
    "groups": [
      {"label": "Nhóm 1", "count": 7, "color": "#4CAF50"},
      {"label": "Nhóm 2", "count": 5, "color": "#2196F3"}
    ],
    "action_instruction": "Lấy 7 que tính, thêm 5 que tính nữa. Đếm tổng cộng có bao nhiêu que?",
    "result_prompt": "Tất cả có ? que tính",
    "answer": 12
  }
}
```

### Pictorial Spec
```json
{
  "pictorial": {
    "diagram_type": "dot_array",  // "dot_array" | "bar_model" | "number_bond" | "ten_frame" | "number_line"
    "groups": [
      {"count": 7, "color": "#4CAF50", "shape": "circle"},
      {"count": 5, "color": "#2196F3", "shape": "circle"}
    ],
    "question_text": "Nhìn vào hình, tính tổng số chấm:",
    "answer": 12,
    "layout": "horizontal"
  }
}
```

### Abstract Spec
```json
{
  "abstract": {
    "expression": "7 + 5 = ?",
    "answer": "12",
    "hint": "Đếm tiếp từ 7",
    "show_blank": true
  }
}
```

---

## Proposed Changes

### LAYER 1: Backend — Data Schema

---

#### [NEW] `backend/app/schemas/cpa_bundle.py`

File Pydantic schemas mới cho CPA Bundle:

```python
# Toàn bộ type definitions cho:
# - ManipulativeType (enum: que_tinh, vien_bi, khoi_vuong, dong_xu, trai_cay)
# - DiagramType (enum: dot_array, bar_model, number_bond, ten_frame, number_line, segment)
# - MathCore (operand_a, operand_b, result, operation, number_range)
# - ConcreteSpec (manipulative_type, groups: List[{label, count, color}], action_instruction, result_prompt, answer)
# - PictorialSpec (diagram_type, groups: List[{count, color, shape}], question_text, answer, layout)
# - AbstractSpec (expression, answer, hint, show_blank)
# - CPABundle (math_core, concrete, pictorial, abstract, validation_status, validator_messages)
# - CPABundleGenerationRequest (topic_id, grade, objective, bundle_count)
# - CPABundleGenerationResponse (bundles: List[CPABundle], rag_sources, generation_mode)
```

**Constraints:**
- `math_core.grade`: `Literal[1, 2, 3]`
- `math_core.operand_a`, `operand_b`: phải nhất quán với `math_core.result`
- Abstract.expression phải chứa đúng operand_a và operand_b từ math_core

---

#### [NEW] `backend/app/models/cpa_bundle.py`

SQLAlchemy model để lưu CPA bundles (không break schema cũ):

```python
class CPABundle(Base):
    __tablename__ = "cpa_bundles"
    
    id: int (PK)
    worksheet_id: int (FK → worksheets.id)
    math_core_json: Text (JSON serialized MathCore)
    concrete_spec_json: Text (JSON serialized ConcreteSpec)
    pictorial_spec_json: Text (JSON serialized PictorialSpec)
    abstract_spec_json: Text (JSON serialized AbstractSpec)
    validation_status: str  # "passed" | "failed" | "warning"
    validator_messages_json: Text (JSON list)
    teacher_approved: bool (default False)
    order_index: int
    created_at: datetime
    updated_at: datetime
```

> **Lý do làm bảng riêng**: Không ảnh hưởng `worksheet_exercises` cũ, dễ rollback, schema rõ ràng.

---

#### [NEW] `backend/app/services/ai/cpa_bundle_generator.py`

**File mới** — Tách hoàn toàn khỏi `question_generator.py`. Đây là file quan trọng nhất:

**Class `CPABundleGenerator`**:

```python
class CPABundleGenerator:
    """
    Sinh CPA Bundle đúng nghĩa sư phạm.
    ⚠️ Output luôn là DRAFT — Teacher phải review.
    Model: qwen3:1.7b (Ollama)
    """
    
    def generate_bundles(
        self, 
        topic: str, 
        grade: int, 
        objective: str,
        count: int = 3,
        existing_math_cores: List[MathCore] = None
    ) -> List[CPABundle]:
        # Hỗ trợ generate số lượng linh hoạt (mặc định 3, có thể 1-2 để thay thế)
        # Step 1: RAG retrieve context (⚠️ LƯU Ý: RAG chỉ lấy tham chiếu văn phong, hành động sư phạm, gợi ý biểu diễn. RAG TUYỆT ĐỐI KHÔNG ĐƯỢC quyết định các giá trị số học hay diagram_type cuối cùng)
        # Step 2: Compute math_cores (deterministic rules, dùng lại existing nếu được cấp để hỗ trợ Tier 2)
        # Step 3: Build structured prompt (AI chỉ sinh spec, không sinh text tự do)
        # Step 4: Parse + validate bundle
        # Step 5: Chạy 3-Tier Fallback nếu validate fail
```

**Hàm `_compute_math_cores(topic, grade, count)`**:

Tạo math core **theo rules deterministic** — không để AI tự chọn số:
```python
def _compute_math_cores(topic: str, grade: int, count: int) -> List[MathCore]:
    # Grade 1, phép cộng phạm vi 20: random a in [1..10], b = random, a+b <= 20
    # Grade 1, phép trừ phạm vi 20: random a in [5..20], b in [1..a-1]
    # Grade 2, phép cộng có nhớ phạm vi 100: đảm bảo units digit sum >= 10
    # Grade 2, bảng nhân: a in [2,3,4,5], b in [1..10]
    # Grade 3, phép chia có dư: chọn a, b sao cho a % b != 0
    # ...vv
```

**Hàm `_build_bundle_prompt(math_cores, topic, grade, seeds)`**:

Prompt cực kỳ cụ thể — AI chỉ điền spec, không sáng tạo số:
```
NHIỆM VỤ: Sinh CPA Bundle specs cho từng math core sau.
KHÔNG được thay đổi các số trong math_core.

MATH CORES CẦN SINH:
[
  {"id": 1, "operand_a": 7, "operand_b": 5, "result": 12, "operation": "addition"},
  ...
]

VỚI MỖI MATH CORE, sinh:
1. concrete_spec: vật thao tác + hành động → JSON chứa manipulative_type, groups, action_instruction, result_prompt
2. pictorial_spec: hình vẽ có thể render → JSON chứa diagram_type, groups, question_text
3. abstract_spec: phép tính thuần → JSON chứa expression đúng với operand_a + operand_b + result

RULES:
- concrete: KHÔNG được có phép tính ký hiệu (+, =). Chỉ mô tả vật và hành động.
- pictorial: PHẢI có diagram_type từ: dot_array, bar_model, number_bond, ten_frame, segment
- abstract: expression PHẢI là "{operand_a} + {operand_b} = ?" (đúng số từ math_core)
- Tất cả 3 tầng PHẢI dùng cùng operand_a và operand_b từ math_core

OUTPUT: JSON array of bundles theo schema đã định.
```

### Cơ Chế 3-Tier Fallback (Xử lý khi AI sinh lỗi)

Để đảm bảo hệ thống luôn trả về output kể cả khi AI viết sai format, sử dụng luồng fallback 3 cấp:
1. **Tier 1 - Repair (Bắt buộc)**: Nếu bundle không qua được Validator, gửi lại bundle lỗi + thông báo của Validator cho AI, yêu cầu AI sửa lỗi (tương tự pipeline difficulty ladder).
2. **Tier 2 - Regenerate Cùng Math Core**: Nếu repair quá `MAX_ROUND` (VD: 2 lần) vẫn fail, giữ nguyên `math_core` đã tạo, gọi AI sinh lại spec mới từ đầu.
3. **Tier 3 - Hard Fallback (Chống sập)**: Nếu AI không phản hồi hoặc JSON parse fail hoàn toàn mức hệ thống, tạo ra bundle dùng template cứng (VD: Concrete: que tính, Pictorial: dot_array) ăn khớp đúng với `math_core` hiện tại để giáo viên vẫn có template.

---

#### [NEW] `backend/app/services/ai/cpa_validator.py`

**Validator chuyên dụng CPA** (độc lập, dễ test):

```python
class CPABundleValidator:
    """
    7 nhóm kiểm tra:
    1. Math consistency (cùng lõi toán học)
    2. Layer authenticity (đúng bản chất từng tầng)
    3. Cognitive progression (điểm concrete → pictorial → abstract)
    4. Grade appropriateness (phù hợp lớp 1-3)
    5. Renderability check (kiểm tra spec có render được không)
    6. Visual feasibility check (không phải cái gì đúng toán cũng vẽ đẹp)
    7. Linguistic appropriateness check (kiểm tra text hiển thị)
    """
    
    def validate(self, bundle: CPABundle) -> ValidationResult:
        issues = []
        issues += self._check_math_consistency(bundle)
        issues += self._check_concrete_authenticity(bundle.concrete)
        issues += self._check_pictorial_authenticity(bundle.pictorial)
        issues += self._check_abstract_authenticity(bundle.abstract)
        issues += self._check_cognitive_progression(bundle)
        issues += self._check_grade_appropriateness(bundle)
        return ValidationResult(
            passed=len([i for i in issues if i.severity == "error"]) == 0,
            issues=issues
        )
    
    def _check_math_consistency(self, bundle) -> List[ValidationIssue]:
        # Kiểm tra concrete.answer == pictorial.answer == abstract.answer == math_core.result
        # Kiểm tra abstract.expression chứa đúng operand_a và operand_b
        
    def _check_concrete_authenticity(self, spec) -> List[ValidationIssue]:
        # FAIL nếu action_instruction chứa ký hiệu: +, =, -, ×, ÷
        # FAIL nếu không có groups (không có vật)
        # FAIL nếu action_instruction dưới 10 chữ (quá ngắn)
        
    def _check_pictorial_authenticity(self, spec) -> List[ValidationIssue]:
        # FAIL nếu diagram_type không trong danh sách cho phép
        # FAIL nếu groups rỗng (không có hình)
        # WARNING nếu groups count không khớp math_core operands
        
    def _check_abstract_authenticity(self, spec) -> List[ValidationIssue]:
        # FAIL nếu expression không chứa số (chưa đủ trừu tượng)
        # FAIL nếu answer không phải số thuần
        
    def _check_cognitive_progression(self, bundle) -> List[ValidationIssue]:
        # FAIL nếu concrete chứa ký hiệu toán (Concrete bị lẫn Abstract)
        # FAIL nếu pictorial không có diagram_type (Pictorial bị lẫn Abstract)
        
    def _check_grade_appropriateness(self, bundle) -> List[ValidationIssue]:
        # Grade 1: result <= 20
        # Grade 2: result <= 100 (cộng), result <= 50 (chia)
        # Grade 3: result <= 100000

    def _check_renderability(self, bundle) -> List[ValidationIssue]:
        # FAIL nếu spec yêu cầu bar_model nhưng thiếu length logic
        # FAIL nếu ten_frame yêu cầu > 10 mỗi frame nhưng thiết kế spec không hỗ trợ nhiều frame
        # FAIL nếu number_bond thiếu target (whole/parts)

    def _check_visual_feasibility(self, bundle) -> List[ValidationIssue]:
        # WARNING nếu dot_array định vẽ 100 chấm (do quá lớn sẽ vẽ rất xấu)
        # WARNING nếu ten_frame áp dụng cho topic chia số lớn của lớp 3

    def _check_linguistic_appropriateness(self, bundle) -> List[ValidationIssue]:
        # WARNING nếu action_instruction hay question_text lặp vô nghĩa
        # WARNING nếu có từ khóa đậm tính "AI text" (như "Hãy cùng khám phá", "Tưởng tượng rằng")
        # FAIL nếu text mô tả quá dài dòng không hợp học sinh Tiểu học
```

---

#### [NEW] `backend/app/application/use_cases/ai/generate_cpa_bundle.py`

Use case mới tương tự `generate_cpa_draft.py` nhưng dùng `CPABundleGenerator`:

```python
class GenerateCPABundleUseCase:
    def execute(self, topic_id, grade, objective, bundle_count=3) -> dict:
        # 1. Validate Ollama
        # 2. Get topic
        # 3. bundleGenerator.generate_bundles(...)
        # 4. validator.validate(bundle) cho từng bundle
        # 5. Return CPABundleGenerationResponse
        # ⚠️ Không auto-approve, không auto-save
```

---

#### [MODIFY] `backend/app/routers/ai.py`

Thêm endpoint **mới** (giữ endpoint cũ `/generate-cpa` để backward-compat):

```python
@router.post("/generate-cpa-bundle")
async def generate_cpa_bundle(
    request: CPABundleGenerationRequest,
    use_case: GenerateCPABundleUseCase = Depends(...),
    teacher: User = Depends(get_current_teacher)
) -> CPABundleGenerationResponse:
    """
    Generate CPA bundles theo chuẩn sư phạm đúng nghĩa.
    Mỗi bundle = 1 math_core + 3 representations.
    Teacher PHẢI review trước khi save.
    """
```

Thêm endpoint lưu bundle sau khi teacher approve:

```python
@router.post("/worksheets/{worksheet_id}/cpa-bundles")
async def save_cpa_bundles(
    worksheet_id: int,
    bundles: List[CPABundle],
    teacher: User = Depends(get_current_teacher)
) -> dict:
    """Lưu CPA bundles đã được teacher approve."""
```

---

#### [MODIFY] `backend/app/schemas/ai.py`

Thêm imports/re-exports từ `cpa_bundle.py`. Schema cũ `CPAGenerationResponse` **giữ nguyên**.

---

### LAYER 2: Backend — Render Specs (Pure Python, không phụ thuộc AI)

---

#### [NEW] `backend/app/services/cpa_render_service.py`

Service render spec → HTML/SVG string để preview trong API response:

```python
class CPARenderService:
    """
    Render CPA specs thành visual representations.
    Không phụ thuộc AI — thuần logic.
    """
    
    def render_concrete_html(self, spec: ConcreteSpec) -> str:
        """Render vật thao tác → HTML với emoji/icon"""
        # que_tinh → dùng | ký tự hoặc emoji 🥢
        # vien_bi → dùng ● 
        # khoi_vuong → dùng ■
        # Nhóm vật, hiển thị rõ từng nhóm, action_instruction

    def render_pictorial_svg(self, spec: PictorialSpec) -> str:
        """Render sơ đồ → SVG string"""
        if spec.diagram_type == "dot_array":
            return self._render_dot_array(spec.groups, spec.layout)
        elif spec.diagram_type == "bar_model":
            return self._render_bar_model(spec.groups)
        elif spec.diagram_type == "number_bond":
            return self._render_number_bond(spec)
        elif spec.diagram_type == "ten_frame":
            return self._render_ten_frame(spec.groups)
        elif spec.diagram_type == "number_line":
            return self._render_number_line(spec)
        elif spec.diagram_type == "segment":
            return self._render_segment_diagram(spec)
    
    def render_abstract_latex(self, spec: AbstractSpec) -> str:
        """Render phép tính → string hiển thị"""
        return spec.expression  # e.g. "7 + 5 = ?"
    
    # SVG renderers chi tiết:
    def _render_dot_array(self, groups, layout) -> str:
        # SVG với circles theo màu của từng nhóm
        # Sắp xếp horizontal hoặc vertical
        
    def _render_bar_model(self, groups) -> str:
        # SVG bars proportional theo count
        # Màu theo group.color
        
    def _render_number_bond(self, spec) -> str:
        # SVG circles với lines: result ở trên, operand_a và operand_b ở dưới
        
    def _render_ten_frame(self, groups) -> str:
        # SVG 2×5 grid, fill theo count
        
    def _render_number_line(self, spec) -> str:
        # SVG đường số với arrows và jumps
        
    def _render_segment_diagram(self, spec) -> str:
        # SVG sơ đồ đoạn thẳng (bar model ngang)
```

API response sẽ bao gồm cả spec JSON lẫn rendered HTML/SVG để frontend hiển thị ngay.

---

### LAYER 3: Frontend — CPA Bundle Types & Render Components

---

#### [NEW] `frontend/src/types/cpaBundle.ts`

TypeScript interfaces khớp với backend schemas:

```typescript
// ManipulativeType, DiagramType enums
// MathCore, ConcreteSpec, PictorialSpec, AbstractSpec interfaces  
// CPABundle interface
// CPABundleGenerationRequest/Response
// ValidationIssue, ValidationResult
```

---

#### [NEW] `frontend/src/components/cpa/ConcreteDisplay.tsx`

Component render phần Concrete:
- Hiển thị `action_instruction` rõ ràng (học sinh cần làm gì)
- Render vật thao tác dùng emoji hoặc SVG đã nhận từ API
- Hiển thị nhóm vật rõ ràng (Nhóm 1: 7 que | Nhóm 2: 5 que)
- Ô trống điền đáp án
- **KHÔNG** hiển thị ký hiệu toán (+, =)

```tsx
interface ConcreteDisplayProps {
  spec: ConcreteSpec;
  renderedHtml: string;  // HTML từ backend render service
  mode: 'preview' | 'student';  // preview = teacher duyệt, student = học sinh làm
}
```

---

#### [NEW] `frontend/src/components/cpa/PictorialDisplay.tsx`

Component render phần Pictorial:
- Render SVG nhận từ backend (`renderedSvg: string`)
- Hiển thị `question_text` bên dưới sơ đồ
- Ô trống điền đáp án  
- **Có label diagram type** để giáo viên biết loại sơ đồ

```tsx
interface PictorialDisplayProps {
  spec: PictorialSpec;
  renderedSvg: string;  // SVG từ backend render service
  mode: 'preview' | 'student';
}
```

---

#### [NEW] `frontend/src/components/cpa/AbstractDisplay.tsx`

Component render phần Abstract:
- Hiển thị expression (`7 + 5 = ?`) với font to, rõ ràng
- Ô trống điền đáp án
- Hint toggle

---

#### [NEW] `frontend/src/components/cpa/CPABundleCard.tsx`

Component tổng hợp 1 CPA Bundle:
```tsx
interface CPABundleCardProps {
  bundle: CPABundle;
  bundleIndex: number;
  onApprove: (bundleId: string) => void;
  onReject: (bundleId: string, reason: string) => void;
  onEdit: (bundleId: string, field: string, value: any) => void;
  onRegenerateWithNewNumbers: (bundleId: string) => void; // Nút "Đổi số"
  mode: 'review' | 'readonly';
}

// Layout:
// Header: "Bundle 1 — 7 + 5 = 12" (math core summary)
// 3 columns: Concrete | Pictorial | Abstract
// Validation badge (passed/failed + issues)
// Môi trường chỉnh sửa cho giáo viên (edit text, không edit gốc math_core)
// [Tính năng]: "Dirty State Revalidation" -> Khi giáo viên edit text, gọi một API check nhẹ (concrete_authenticity, linguistic, consistency) để đưa ra CẢNH BÁO nếu giáo viên vô tình gõ ký hiệu toán học lộ phép tính. (Không chặn lưu, chỉ cảnh báo).
// Footer: Approve/Reject/RegenerateWithNewNumbers buttons (Teacher only)
```

---

#### [NEW] `frontend/src/components/cpa/CPABundleReviewPanel.tsx`

Panel duyệt nhiều bundles:
- Hiển thị danh sách CPABundleCards
- Track approved/rejected
- Show validation summary
- Nút "Lưu tất cả đã duyệt" → POST `/worksheets/{id}/cpa-bundles`

---

#### [MODIFY] `frontend/src/components/cpa/Step2CPAGenerator.tsx`

**Thay đổi lớn**: Gọi endpoint **mới** `/generate-cpa-bundle` thay vì `/generate-cpa`:
- Remove `formatQuestions()` (không còn format text nữa)
- Thêm loading state phân tách (RAG → Compute → Generate → Validate)
- Pass raw bundle JSON + renderedHtml/SVG đến Step3

---

#### [MODIFY] `frontend/src/components/cpa/Step3Review.tsx`

**Thay đổi lớn**: Thay hiển thị text thuần → dùng `CPABundleReviewPanel`:
- Giáo viên nhìn thấy vật thao tác (Concrete), sơ đồ thực (Pictorial), phép tính (Abstract)
- Có thể approve/reject từng bundle
- Hiển thị validation issues cụ thể

---

#### [MODIFY] `frontend/src/components/cpa/CPAStepWizard.tsx`

Cập nhật data flow giữa các steps để truyền bundle format mới thay vì text format cũ.

---

#### [NEW] `frontend/src/services/cpaBundleApi.ts`

API service functions:
```typescript
export const cpaBundleApi = {
  generateBundles: (request: CPABundleGenerationRequest) => 
    api.post<CPABundleGenerationResponse>('/ai/generate-cpa-bundle', request),
  
  saveBundles: (worksheetId: number, bundles: CPABundle[]) =>
    api.post(`/worksheets/${worksheetId}/cpa-bundles`, { bundles }),
  
  getBundles: (worksheetId: number) =>
    api.get<CPABundle[]>(`/worksheets/${worksheetId}/cpa-bundles`),
}
```

---

### LAYER 4: Database Migration

---

#### [NEW] `backend/alembic/versions/xxxx_add_cpa_bundles_table.py`

Migration thêm bảng `cpa_bundles` (không drop/alter bảng cũ):
```sql
CREATE TABLE cpa_bundles (
    id INTEGER PRIMARY KEY,
    worksheet_id INTEGER NOT NULL REFERENCES worksheets(id),
    math_core_json TEXT NOT NULL,
    concrete_spec_json TEXT NOT NULL,
    pictorial_spec_json TEXT NOT NULL,
    abstract_spec_json TEXT NOT NULL,
    validation_status VARCHAR(20) DEFAULT 'pending',
    validator_messages_json TEXT,
    teacher_approved BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### LAYER 5: Bootstrap / DI Container

---

#### [MODIFY] `backend/app/bootstrap/container.py`

Thêm factory functions cho:
- `get_generate_cpa_bundle_use_case`
- `get_cpa_bundle_repository`
- `get_cpa_render_service`

---

## Các Quyết Định Thiết Kế (Đã thống nhất)

1. **Số lượng Bundle**: Default là 3, nhưng UI/API hỗ trợ linh hoạt gọi generate thêm 1-2 bundle đơn lẻ, không giam chết mức mặc định.
2. **Cơ chế Fallback (3-Tier)**:
   - *Tier 1 (Repair)*: Dùng validator kết hợp repair prompt (giống difficulty ladder) bắt AI tự sửa.
   - *Tier 2 (Regenerate spec, giữ math_core)*: Nếu repair fail, sinh lại spec mới từ đầu giữ nguyên lõi toán học (toán hạng).
   - *Tier 3 (Hard Fallback)*: Chỉ khi dính sự cố nặng (parse fail, AI chết), xài mock data template kết hợp cùng math_core.
3. **Phạm vi Diagram Types (MVP)**: Áp dụng 4 loại minh họa cốt lõi trong sách tiểu học: `dot_array`, `bar_model`, `number_bond`, `ten_frame`.
4. **Quyền Chỉnh Sửa Của Giáo Viên**:
   - Được edit text thoải mái (`action_instruction`, `question_text`, `hint`).
   - Có cơ chế **"Dirty State Revalidation"**: re-run các check sư phạm nhẹ khi giáo viên sửa text (cảnh báo nếu giáo viên vô tình viết thêm số hoặc ký hiệu vào phần Concrete/Pictorial phá vỡ nguyên lý).
   - KHÔNG cấu hình chức năng cho phép edit `math_core` trực tiếp.
   - Cung cấp nút **"Đổi số" (Regenerate with new numbers)** -> Hệ thống auto-generate bundle mới với math_core và spec mới toanh để thay thế.
5. **Thiết kế Math Core**: Sử dụng Cấu trúc BaseCore + TopicSpecificCore để dễ mở rộng các topic đo lường, hình học, chia có dư (tránh lỗi tương thích schema sau này).
6. **Luật Nghiêm Ngặt về RAG**: Vai trò của RAG chỉ là module tham khảo phong cách văn bản và kiểu giáo dục. RAG **TUYỆT ĐỐI KHÔNG ĐƯỢC** tác động vào quá trình sinh số ngẫu nhiên của `math_core` hay tự quyết định toán hạng.

---

## Verification Plan

### Backend Tests

```bash
# Test CPABundleValidator
pytest backend/tests/unit/test_cpa_validator.py -v

# Test CPABundleGenerator (mock Ollama)  
pytest backend/tests/unit/test_cpa_bundle_generator.py -v

# Test CPARenderService (không cần mock)
pytest backend/tests/unit/test_cpa_render_service.py -v

# Test endpoint (TestClient)
pytest backend/tests/integration/test_cpa_bundle_endpoint.py -v
```

### Frontend Tests

```bash
# Type check
npx tsc --noEmit

# Unit test components
npx vitest run src/components/cpa/
```

### Manual Verification (Browser)

1. Login teacher → tạo worksheet CPA mới
2. Step 1: chọn topic "Phép cộng trong phạm vi 20", lớp 1
3. Step 2: gọi `/generate-cpa-bundle` → xem 3 bundles với render
   - Concrete phải thấy vật thao tác (que tính, nhóm rõ ràng) → **không thấy ký hiệu +, =**
   - Pictorial phải thấy SVG sơ đồ thực (chấm tròn, thanh bar) → **không phải text**
   - Abstract phải thấy phép tính thuần: `7 + 5 = ?`
   - Cả 3 tầng phải dùng **cùng một cặp số** (7 và 5)
4. Step 3: approve bundle → save
5. Kiểm tra DB: bảng `cpa_bundles` có dữ liệu đúng

### Validation Test Cases

| Test case | Expected |
|-----------|---------|
| Concrete chứa "+ = " | Validator FAIL: concrete_authenticity |
| Pictorial không có diagram_type | Validator FAIL: pictorial_authenticity |
| Abstract.answer ≠ math_core.result | Validator FAIL: math_consistency |
| Grade 1, result = 25 | Validator FAIL: grade_appropriateness |
| Tất cả đúng | Validator PASS |
