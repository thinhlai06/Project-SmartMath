---
name: ai-workflow
description: >
  Workflow và patterns cho Smart-MathAI AI features — sử dụng khi implement,
  debug hoặc refactor AI question generation (gemma3:12b Cloud), RAG pipeline
        (vietnamese-sbert/ChromaDB), hoặc OCR grading (gemma4:31b).
---

## Smart-MathAI Guardrails (MANDATORY)

- Scope: only Vietnamese primary Math for grades 1-3.
- Roles: Teacher only. No Parent role exists.
- AI output must remain draft; Teacher review is required before publish.
- Approved AI models only: gemma3:12b (question generation via Ollama Cloud), qwen2.5:3b (grading/explanation local), gemma4:31b (OCR via Ollama Cloud), vietnamese-sbert (RAG).
- Do not introduce other AI models or auto-publish flows.
- Backend: FastAPI + SQLAlchemy ORM only (no raw SQL); enforce grade with Literal[1,2,3] when applicable.
- Frontend: TypeScript strict mode, immutable updates, role-based rendering, Vietnamese UX/error messages.
- Keep AI logic isolated under backend/app/services/ai and mock AI calls in tests.

# AI Workflow — Smart-MathAI

## 3 AI Models Được Phép (KHÔNG thêm model khác)

| Model | Tool | Mục đích | Khi nào dùng |
|-------|------|----------|--------------|
| `gemma3:12b` | Ollama Cloud | Sinh cau hoi CPA/Differentiation | AI question generation |
| `keepitreal/vietnamese-sbert` | HuggingFace | RAG embeddings | Tìm context từ SGK trong ChromaDB |
| `gemma4:31b` | Ollama Cloud | OCR ảnh bài làm học sinh | Auto-grading từ ảnh |

> **LƯU Ý QUAN TRỌNG**: Đã đổi từ `qwen2.5-1.5b-instruct` -> `gemma3:12b` (Cloud), `PaddleOCR-VL` -> `gemma4:31b` (Cloud OCR)

## Pipeline AI Question Generation

```
Teacher → [Chọn Grade/Topic/Difficulty]
  → RAG: Tìm context SGK liên quan (vietnamese-sbert + ChromaDB)
  → Qwen3: Tạo draft questions với context
  → [Draft] → Teacher review → [Approve] → Publish
                              → [Edit] → Save Draft
                              → [Reject] → Discard
```

## Current Runtime Mode (single mode)

Question generation hiện chạy **một mode duy nhất**: luồng mới (Template-first RAG + Difficulty Ladder).

Flags sử dụng:

- `AI_GEN_ENABLE_TEMPLATE_FILTER`
- `AI_GEN_ENABLE_DIFFICULTY_VALIDATOR`
- `AI_GEN_MAX_REPAIR_ROUNDS`

## CPA Bundle Runtime Mode (new)

CPA generation now supports a structured bundle workflow:

- Endpoint: `POST /api/ai/generate-cpa-bundle`
- Save approved bundles: `POST /api/ai/worksheets/{worksheet_id}/cpa-bundles`
- Retrieve saved bundles: `GET /api/ai/worksheets/{worksheet_id}/cpa-bundles`

Bundle format is `math_core + concrete + pictorial + abstract` and is validated before teacher review.
Legacy compatibility is preserved through `POST /api/ai/generate-cpa`.

Current family support (runtime):

- `bundle-v2` supports `arithmetic`, `geometry`, and `measurement` topics.
- Categories outside supported families (e.g. `word_problem`, `data_handling`) return `422` with a clear message.
- Arithmetic topics that do not map to a deterministic operation family still return `422`.

Bundle-specific implementation rules:

- Route by topic family metadata first, then use family-specific generation strategy.
- Arithmetic `math_core` values must be deterministic from grade/topic rules.
- Non-arithmetic families use `content_family + family_payload` as core envelope.
- RAG only supplies pedagogy/language seeds and must not decide arithmetic operands.
- Output remains `draft` until teacher review.
- AI orchestration stays inside `backend/app/services/ai/` and uses `gemma3:12b` (Cloud) for generation, `qwen2.5:3b` (local) for grading.

## Current Generation Strategy (đã triển khai)

1. **Template-first RAG**: retrieve bằng metadata filter theo `topic_slug`, `representation`, `difficulty_band` trước, sau đó mới similarity search.
2. **Template seeds**: không nhét nguyên chunk SGK vào prompt; trích ra seed cấu trúc gồm dạng bài, kiến thức lõi, giới hạn, điều cấm, mẫu câu.
3. **Difficulty ladder**: phân hóa phải sinh theo bộ 4 mức trong một lần thay vì gọi độc lập từng tier.
4. **Validator + repair loop**: sau sinh, hệ thống chấm lại đúng topic/lớp/tier; câu fail được sửa theo lỗi cụ thể (không rewrite tự do).

## Re-ingest Requirement for New RAG

Khi bật `AI_GEN_ENABLE_TEMPLATE_FILTER=true`, bắt buộc re-ingest vector DB để có metadata sư phạm mới (`topic_slug`, `skill`, `representation`, `template_type`, `difficulty_band`, ...). Nếu chưa ingest lại, hệ thống vẫn có fallback nhưng chất lượng khóa topic giảm.

### Implementation Pattern

```python
# services/ai/question_generator.py
class QuestionGenerator:
    """
    ⚠️ Output LUÔN là DRAFT — Teacher phải review trước khi publish.
    Models: gemma3:12b (Ollama Cloud - question gen), qwen2.5:3b (local - grading), vietnamese-sbert (RAG)
    """
    
    def __init__(self, rag_service: RAGService, ollama_client: OllamaClient):
        self._rag = rag_service
        self._llm = ollama_client
    
    async def generate_draft(
        self,
        grade: Literal[1, 2, 3],
        topic: str,
        difficulty: str,
        count: int = 5,
    ) -> list[QuestionDraft]:
        assert 1 <= grade <= 3, "Grade phải là 1, 2 hoặc 3"
        
        # 1. RAG: Lấy context SGK
        context_chunks = await self._rag.retrieve(
            query=f"Lớp {grade}: {topic}",
            grade=grade,
            top_k=3,
        )
        
        # 2. Build prompt với topic rules
        prompt = self._build_grade_prompt(grade, topic, difficulty, context_chunks, count)
        
        # 3. Gọi Ollama qwen2.5:3b
        response = await self._llm.generate(
            model="qwen2.5:3b",
            prompt=prompt,
            options={"temperature": 0.7, "num_predict": 1024},
        )
        
        # 4. Parse và trả về DRAFTS (không publish!)
        return self._parse_questions(response["response"])
```

## Pipeline OCR Grading (gemma4:31b)

```
Teacher → [Upload ảnh bài làm]
    → Gemma4 Cloud Vision: Extract text từ ảnh
    → Fallback local OCR (`glm-ocr:latest`) nếu cloud timeout/lỗi kết nối
  → Rule-based: So sánh với expected answers
  → [Grade draft] → Teacher review → [Confirm/Override]
```

### Typed Answer Key Contract (grade-image)

`POST /api/ai/grade-image` hỗ trợ 2 định dạng `correct_answers_json` để giữ backward compatibility:

1. Legacy:
- `[{"id": 1, "answer": "12", "points": 10}]`

2. Typed (khuyến nghị dùng từ Answer Builder):
- `answer_type`: `text | number | boolean | ordered_list | unordered_list | multi_blank`
- `grading_rule`: `all_or_nothing | per_item` (áp dụng cho list/multi_blank)
- Ví dụ:
`[{"id":"1","answer_type":"ordered_list","grading_rule":"per_item","answer":["2","3","4"],"points":10}]`

Quy tắc runtime:
- `number`: so khớp theo giá trị số
- `boolean`: chấp nhận biến thể `Đúng/Sai`, `true/false`, `1/0`
- `ordered_list` và `multi_blank`: chấm theo thứ tự
- `unordered_list`: chấm không phụ thuộc thứ tự
- `per_item`: cho phép điểm một phần theo tỉ lệ ý đúng

### Analytics Submit Gate (teacher review bắt buộc)

`POST /api/v1/ai/analytics/submit` chỉ chấp nhận dữ liệu đã được giáo viên duyệt:

- `source` bắt buộc là `teacher_review`
- Không submit analytics ngay sau OCR draft
- Frontend phải cho giáo viên review/override trước khi lưu thống kê
- Mục tiêu: tránh đẩy lỗi OCR chưa duyệt lên dashboard

### Implementation Pattern

```python
# services/ai/grading_service.py
class GradingService:
    """
    Model chính: gemma4:31b (Ollama Cloud)
    Fallback: glm-ocr:latest (Ollama local)
    ⚠️ OCR output là DRAFT — Teacher phải confirm.
    """
    
    async def grade_from_image(
        self,
        image_path: str,
        expected_answers: list[str],
        confidence_threshold: float = 0.8,
    ) -> GradingDraft:
        # 1. Gọi DeepSeek OCR Cloud, fallback local OCR khi cần
        ocr_result = await self._ocr.recognize_with_confidence(
            image_path=image_path,
            prompt="Đọc và trích xuất tất cả chữ số và phép tính trong ảnh.",
        )
        
        # 2. Parse OCR text
        extracted_text = ocr_result["response"]
        confidence = self._estimate_confidence(extracted_text)
        
        # 3. Nếu confidence thấp → yêu cầu Teacher review thủ công
        if confidence < confidence_threshold:
            return GradingDraft(
                status="low_confidence",
                confidence=confidence,
                extracted_text=extracted_text,
                requires_manual_review=True,
            )
        
        # 4. Rule-based grading
        score = self._grade_answers(extracted_text, expected_answers)
        return GradingDraft(
            status="pending_review",  # LUÔN pending — không auto-confirm
            score=score,
            confidence=confidence,
            extracted_text=extracted_text,
            requires_manual_review=False,
        )
```

## Ollama Dynamic Loading Pattern

```python
# Chỉ load model khi cần, unload ngay sau khi dùng xong
class OllamaModelManager:
    async def with_model(self, model_name: str):
        """Context manager: load → use → unload"""
        try:
            await self._client.pull(model_name)
            yield
        finally:
            # Unload để giải phóng VRAM
            await self._client.delete(model_name)

# Sử dụng
async with ollama_manager.with_model("gemma3:12b"):  # Cloud - question gen only
    result = await generate_questions(...)

# OCR cloud model không cần pull/delete local; local fallback vẫn dùng glm-ocr:latest khi cloud fail.
```

## Safety Rules Khi Implement AI

❌ KHÔNG BAO GIỜ:
- Auto-publish AI output (gemma3:12b / qwen2.5:3b / gemma4:31b)
- Cho Parent gọi AI endpoints trực tiếp
- Log raw images có thể chứa PII học sinh
- Implement AI logic bên ngoài `services/ai/`
- Thêm model khác ngoài danh sách 3 models đã phê duyệt

✅ LUÔN LUÔN:
- Log: `prompt`, `model`, `teacher_id`, `ocr_confidence`
- Teacher approval bắt buộc trước khi lưu vào DB
- Mock AI calls trong tests (không gọi Ollama thật khi test)
- Handle OCR errors gracefully (low confidence → manual review)

## Test Pattern cho AI

```python
# Mock Ollama — KHÔNG gọi model thật trong tests
@pytest.fixture
def mock_ollama_qwen():
    with patch("app.services.ai.question_generator.OllamaClient") as mock:
        mock.return_value.generate.return_value = {
            "response": SAMPLE_QUESTIONS_JSON
        }
        yield mock

@pytest.fixture
def mock_ollama_ocr():
    with patch("app.services.ai.grading_service.OllamaClient") as mock:
        mock.return_value.generate.return_value = {
            "response": "5 + 3 = 8\n4 + 2 = 6\n7 - 3 = 4"
        }
        yield mock

def test_generate_questions_returns_drafts(mock_ollama_qwen):
    generator = QuestionGenerator(...)
    drafts = await generator.generate_draft(grade=2, topic="Phép cộng có nhớ", count=5)
    assert all(q.status == "draft" for q in drafts)
    assert len(drafts) == 5

def test_ocr_low_confidence_requires_manual_review(mock_ollama_ocr):
    service = GradingService(...)
    result = await service.grade_from_image("test.jpg", [...], threshold=0.9)
    assert result.requires_manual_review is True
```

