---
name: ai-workflow
description: >
  Workflow và patterns cho Smart-MathAI AI features — sử dụng khi implement,
  debug hoặc refactor AI question generation (qwen3:1.7b), RAG pipeline
  (vietnamese-sbert/ChromaDB), hoặc OCR grading (glm-ocr:latest).
---

# AI Workflow — Smart-MathAI

## 3 AI Models Được Phép (KHÔNG thêm model khác)

| Model | Tool | Mục đích | Khi nào dùng |
|-------|------|----------|--------------|
| `qwen3:1.7b` | Ollama | Tạo câu hỏi toán, giải thích từng bước | AI question generation |
| `keepitreal/vietnamese-sbert` | HuggingFace | RAG embeddings | Tìm context từ SGK trong ChromaDB |
| `glm-ocr:latest` | Ollama | OCR ảnh bài làm học sinh | Auto-grading từ ảnh |

> **LƯU Ý QUAN TRỌNG**: Đã đổi từ `qwen2.5-1.5b-instruct` → `qwen3:1.7b` và `PaddleOCR-VL` → `glm-ocr:latest`

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
    Models: qwen3:1.7b (Ollama), vietnamese-sbert (RAG)
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
        
        # 3. Gọi Ollama qwen3:1.7b
        response = await self._llm.generate(
            model="qwen3:1.7b",
            prompt=prompt,
            options={"temperature": 0.7, "num_predict": 1024},
        )
        
        # 4. Parse và trả về DRAFTS (không publish!)
        return self._parse_questions(response["response"])
```

## Pipeline OCR Grading (glm-ocr:latest)

```
Teacher → [Upload ảnh bài làm]
  → GLM-OCR: Extract text từ ảnh
  → Rule-based: So sánh với expected answers
  → [Grade draft] → Teacher review → [Confirm/Override]
```

### Implementation Pattern

```python
# services/ai/grading_service.py
class GradingService:
    """
    Model: glm-ocr:latest (Ollama)
    ⚠️ OCR output là DRAFT — Teacher phải confirm.
    """
    
    async def grade_from_image(
        self,
        image_path: str,
        expected_answers: list[str],
        confidence_threshold: float = 0.8,
    ) -> GradingDraft:
        # 1. Gọi GLM-OCR để extract text
        ocr_result = await self._ollama.generate(
            model="glm-ocr:latest",
            images=[image_path],
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
async with ollama_manager.with_model("qwen3:1.7b"):
    result = await generate_questions(...)

async with ollama_manager.with_model("glm-ocr:latest"):
    result = await grade_image(...)
```

## Safety Rules Khi Implement AI

❌ KHÔNG BAO GIỜ:
- Auto-publish AI output (qwen3 hay glm-ocr)
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
