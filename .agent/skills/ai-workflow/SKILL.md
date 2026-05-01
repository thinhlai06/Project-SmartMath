---
name: ai-workflow
description: >
  Workflow vÃ  patterns cho Smart-MathAI AI features â€” sá»­ dá»¥ng khi implement,
  debug hoáº·c refactor AI question generation (gemma3:12b Cloud), RAG pipeline
        (vietnamese-sbert/ChromaDB), hoáº·c OCR grading (gemma4:31b).
---

## Smart-MathAI Guardrails (MANDATORY)

- Scope: only Vietnamese primary Math for grades 1-3.
- Roles: only Teacher and Parent are allowed.
- AI output must remain draft; Teacher review is required before publish.
- Approved AI models only: gemma3:12b (question generation via Ollama Cloud), qwen2.5:3b (grading/explanation local), gemma4:31b (OCR via Ollama Cloud), vietnamese-sbert (RAG).
- Do not introduce other AI models or auto-publish flows.
- Backend: FastAPI + SQLAlchemy ORM only (no raw SQL); enforce grade with Literal[1,2,3] when applicable.
- Frontend: TypeScript strict mode, immutable updates, role-based rendering, Vietnamese UX/error messages.
- Keep AI logic isolated under backend/app/services/ai and mock AI calls in tests.

# AI Workflow â€” Smart-MathAI

## 3 AI Models ÄÆ°á»£c PhÃ©p (KHÃ”NG thÃªm model khÃ¡c)

| Model | Tool | Má»¥c Ä‘Ã­ch | Khi nÃ o dÃ¹ng |
|-------|------|----------|--------------|
| `gemma3:12b` | Ollama Cloud | Sinh cau hoi CPA/Differentiation | AI question generation |
| `keepitreal/vietnamese-sbert` | HuggingFace | RAG embeddings | TÃ¬m context tá»« SGK trong ChromaDB |
| `gemma4:31b` | Ollama Cloud | OCR áº£nh bÃ i lÃ m há»c sinh | Auto-grading tá»« áº£nh |

> **LÆ¯U Ã QUAN TRá»ŒNG**: ÄÃ£ Ä‘á»•i tá»« `qwen2.5-1.5b-instruct` -> `gemma3:12b` (Cloud), `PaddleOCR-VL` -> `gemma4:31b` (Cloud OCR)

## Pipeline AI Question Generation

```
Teacher â†’ [Chá»n Grade/Topic/Difficulty]
  â†’ RAG: TÃ¬m context SGK liÃªn quan (vietnamese-sbert + ChromaDB)
  â†’ Qwen3: Táº¡o draft questions vá»›i context
  â†’ [Draft] â†’ Teacher review â†’ [Approve] â†’ Publish
                              â†’ [Edit] â†’ Save Draft
                              â†’ [Reject] â†’ Discard
```

## Current Runtime Mode (single mode)

Question generation hiá»‡n cháº¡y **má»™t mode duy nháº¥t**: luá»“ng má»›i (Template-first RAG + Difficulty Ladder).

Flags sá»­ dá»¥ng:

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

## Current Generation Strategy (Ä‘Ã£ triá»ƒn khai)

1. **Template-first RAG**: retrieve báº±ng metadata filter theo `topic_slug`, `representation`, `difficulty_band` trÆ°á»›c, sau Ä‘Ã³ má»›i similarity search.
2. **Template seeds**: khÃ´ng nhÃ©t nguyÃªn chunk SGK vÃ o prompt; trÃ­ch ra seed cáº¥u trÃºc gá»“m dáº¡ng bÃ i, kiáº¿n thá»©c lÃµi, giá»›i háº¡n, Ä‘iá»u cáº¥m, máº«u cÃ¢u.
3. **Difficulty ladder**: phÃ¢n hÃ³a pháº£i sinh theo bá»™ 4 má»©c trong má»™t láº§n thay vÃ¬ gá»i Ä‘á»™c láº­p tá»«ng tier.
4. **Validator + repair loop**: sau sinh, há»‡ thá»‘ng cháº¥m láº¡i Ä‘Ãºng topic/lá»›p/tier; cÃ¢u fail Ä‘Æ°á»£c sá»­a theo lá»—i cá»¥ thá»ƒ (khÃ´ng rewrite tá»± do).

## Re-ingest Requirement for New RAG

Khi báº­t `AI_GEN_ENABLE_TEMPLATE_FILTER=true`, báº¯t buá»™c re-ingest vector DB Ä‘á»ƒ cÃ³ metadata sÆ° pháº¡m má»›i (`topic_slug`, `skill`, `representation`, `template_type`, `difficulty_band`, ...). Náº¿u chÆ°a ingest láº¡i, há»‡ thá»‘ng váº«n cÃ³ fallback nhÆ°ng cháº¥t lÆ°á»£ng khÃ³a topic giáº£m.

### Implementation Pattern

```python
# services/ai/question_generator.py
class QuestionGenerator:
    """
    âš ï¸ Output LUÃ”N lÃ  DRAFT â€” Teacher pháº£i review trÆ°á»›c khi publish.
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
        assert 1 <= grade <= 3, "Grade pháº£i lÃ  1, 2 hoáº·c 3"
        
        # 1. RAG: Láº¥y context SGK
        context_chunks = await self._rag.retrieve(
            query=f"Lá»›p {grade}: {topic}",
            grade=grade,
            top_k=3,
        )
        
        # 2. Build prompt vá»›i topic rules
        prompt = self._build_grade_prompt(grade, topic, difficulty, context_chunks, count)
        
        # 3. Gá»i Ollama qwen2.5:3b
        response = await self._llm.generate(
            model="qwen2.5:3b",
            prompt=prompt,
            options={"temperature": 0.7, "num_predict": 1024},
        )
        
        # 4. Parse vÃ  tráº£ vá» DRAFTS (khÃ´ng publish!)
        return self._parse_questions(response["response"])
```

## Pipeline OCR Grading (gemma4:31b)

```
Teacher â†’ [Upload áº£nh bÃ i lÃ m]
    â†’ Gemma4 Cloud Vision: Extract text tá»« áº£nh
    â†’ Fallback local OCR (`glm-ocr:latest`) náº¿u cloud timeout/lá»—i káº¿t ná»‘i
  â†’ Rule-based: So sÃ¡nh vá»›i expected answers
  â†’ [Grade draft] â†’ Teacher review â†’ [Confirm/Override]
```

### Typed Answer Key Contract (grade-image)

`POST /api/ai/grade-image` há»— trá»£ 2 Ä‘á»‹nh dáº¡ng `correct_answers_json` Ä‘á»ƒ giá»¯ backward compatibility:

1. Legacy:
- `[{"id": 1, "answer": "12", "points": 10}]`

2. Typed (khuyáº¿n nghá»‹ dÃ¹ng tá»« Answer Builder):
- `answer_type`: `text | number | boolean | ordered_list | unordered_list | multi_blank`
- `grading_rule`: `all_or_nothing | per_item` (Ã¡p dá»¥ng cho list/multi_blank)
- VÃ­ dá»¥:
`[{"id":"1","answer_type":"ordered_list","grading_rule":"per_item","answer":["2","3","4"],"points":10}]`

Quy táº¯c runtime:
- `number`: so khá»›p theo giÃ¡ trá»‹ sá»‘
- `boolean`: cháº¥p nháº­n biáº¿n thá»ƒ `ÄÃºng/Sai`, `true/false`, `1/0`
- `ordered_list` vÃ  `multi_blank`: cháº¥m theo thá»© tá»±
- `unordered_list`: cháº¥m khÃ´ng phá»¥ thuá»™c thá»© tá»±
- `per_item`: cho phÃ©p Ä‘iá»ƒm má»™t pháº§n theo tá»‰ lá»‡ Ã½ Ä‘Ãºng

### Analytics Submit Gate (teacher review báº¯t buá»™c)

`POST /api/v1/ai/analytics/submit` chá»‰ cháº¥p nháº­n dá»¯ liá»‡u Ä‘Ã£ Ä‘Æ°á»£c giÃ¡o viÃªn duyá»‡t:

- `source` báº¯t buá»™c lÃ  `teacher_review`
- KhÃ´ng submit analytics ngay sau OCR draft
- Frontend pháº£i cho giÃ¡o viÃªn review/override trÆ°á»›c khi lÆ°u thá»‘ng kÃª
- Má»¥c tiÃªu: trÃ¡nh Ä‘áº©y lá»—i OCR chÆ°a duyá»‡t lÃªn dashboard

### Implementation Pattern

```python
# services/ai/grading_service.py
class GradingService:
    """
    Model chÃ­nh: gemma4:31b (Ollama Cloud)
    Fallback: glm-ocr:latest (Ollama local)
    âš ï¸ OCR output lÃ  DRAFT â€” Teacher pháº£i confirm.
    """
    
    async def grade_from_image(
        self,
        image_path: str,
        expected_answers: list[str],
        confidence_threshold: float = 0.8,
    ) -> GradingDraft:
        # 1. Gá»i DeepSeek OCR Cloud, fallback local OCR khi cáº§n
        ocr_result = await self._ocr.recognize_with_confidence(
            image_path=image_path,
            prompt="Äá»c vÃ  trÃ­ch xuáº¥t táº¥t cáº£ chá»¯ sá»‘ vÃ  phÃ©p tÃ­nh trong áº£nh.",
        )
        
        # 2. Parse OCR text
        extracted_text = ocr_result["response"]
        confidence = self._estimate_confidence(extracted_text)
        
        # 3. Náº¿u confidence tháº¥p â†’ yÃªu cáº§u Teacher review thá»§ cÃ´ng
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
            status="pending_review",  # LUÃ”N pending â€” khÃ´ng auto-confirm
            score=score,
            confidence=confidence,
            extracted_text=extracted_text,
            requires_manual_review=False,
        )
```

## Ollama Dynamic Loading Pattern

```python
# Chá»‰ load model khi cáº§n, unload ngay sau khi dÃ¹ng xong
class OllamaModelManager:
    async def with_model(self, model_name: str):
        """Context manager: load â†’ use â†’ unload"""
        try:
            await self._client.pull(model_name)
            yield
        finally:
            # Unload Ä‘á»ƒ giáº£i phÃ³ng VRAM
            await self._client.delete(model_name)

# Sá»­ dá»¥ng
async with ollama_manager.with_model("gemma3:12b"):  # Cloud - question gen only
    result = await generate_questions(...)

# OCR cloud model khÃ´ng cáº§n pull/delete local; local fallback váº«n dÃ¹ng glm-ocr:latest khi cloud fail.
```

## Safety Rules Khi Implement AI

âŒ KHÃ”NG BAO GIá»œ:
- Auto-publish AI output (gemma3:12b / qwen2.5:3b / gemma4:31b)
- Cho Parent gá»i AI endpoints trá»±c tiáº¿p
- Log raw images cÃ³ thá»ƒ chá»©a PII há»c sinh
- Implement AI logic bÃªn ngoÃ i `services/ai/`
- ThÃªm model khÃ¡c ngoÃ i danh sÃ¡ch 3 models Ä‘Ã£ phÃª duyá»‡t

âœ… LUÃ”N LUÃ”N:
- Log: `prompt`, `model`, `teacher_id`, `ocr_confidence`
- Teacher approval báº¯t buá»™c trÆ°á»›c khi lÆ°u vÃ o DB
- Mock AI calls trong tests (khÃ´ng gá»i Ollama tháº­t khi test)
- Handle OCR errors gracefully (low confidence â†’ manual review)

## Test Pattern cho AI

```python
# Mock Ollama â€” KHÃ”NG gá»i model tháº­t trong tests
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
    drafts = await generator.generate_draft(grade=2, topic="PhÃ©p cá»™ng cÃ³ nhá»›", count=5)
    assert all(q.status == "draft" for q in drafts)
    assert len(drafts) == 5

def test_ocr_low_confidence_requires_manual_review(mock_ollama_ocr):
    service = GradingService(...)
    result = await service.grade_from_image("test.jpg", [...], threshold=0.9)
    assert result.requires_manual_review is True
```

