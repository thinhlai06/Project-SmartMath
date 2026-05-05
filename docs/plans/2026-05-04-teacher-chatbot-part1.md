# Teacher AI Chatbot — Implementation Plan (Part 1: Backend)

> **Model:** Gemini 2.5 Flash | **API Key:** stored in `.env` as `GEMINI_API_KEY`

**Goal:** Build a Gemini 2.5 Flash powered chatbot for teachers with 7 features:
1. Class Insights Chat
2. Student Spotlight (with charts + common errors)
3. Natural Language Exercise Request
4. Homework Photo Analysis Chat
5. Whiteboard Verification
6. CPA Methodology Advisor
7. Lesson Plan Chat

---

## Safety Rules

1. **No impact on existing features** — All new code in separate files/modules. No modifying existing services/routers except adding imports.
2. **No deleting existing tests** — Only add new tests.
3. **API key in `.env`** — NEVER hardcode.
4. **Chat router is optional** — If `google-generativeai` not installed, app still runs (same try/except pattern as ai router in `main.py`).
5. **Teacher-only** — All chat endpoints require `get_current_teacher`.
6. **Draft-only outputs** — All AI outputs are suggestions; teacher decides.
7. **Code review after each Phase** — Run BMAD code review skill.

---

## File Structure Map

### Backend — New Files
```
backend/app/
├── models/
│   └── chat_message.py              # ChatMessage SQLAlchemy model
├── schemas/
│   └── chat.py                      # Pydantic schemas for chat API
├── services/ai/
│   ├── gemini_service.py            # Wrapper for Google Generative AI SDK
│   └── chat_service.py              # Chat orchestrator (intent → context → response)
├── routers/
│   └── chat.py                      # Chat API endpoints (SSE streaming)
└── alembic/versions/
    └── xxxx_add_chat_messages.py    # Migration for chat_messages table
```

### Backend — Modified Files
```
backend/
├── .env                              # Add GEMINI_API_KEY, GEMINI_MODEL
├── .env.example                      # Add GEMINI_API_KEY placeholder
├── requirements.txt                  # Add google-generativeai
├── app/config.py                     # Add GEMINI_* settings
├── app/main.py                       # Register chat router (optional, try/except)
└── app/services/ai/analytics_service.py  # Add get_student_spotlight method
```

### Frontend — New Files
```
frontend/src/
├── types/chat.ts
├── services/chatApi.ts
├── hooks/useChatbot.ts
└── components/chat/
    ├── ChatFloatingButton.tsx
    ├── ChatPanel.tsx
    ├── ChatMessageBubble.tsx
    ├── ChatInput.tsx
    └── index.ts
```

### Frontend — Modified Files
```
frontend/src/
├── App.tsx                           # Add ChatFloatingButton to layout
└── types/ai.ts                       # Add enhanced analytics types
```

---

## PHASE 1: Backend Foundation — Gemini Service + Chat Infrastructure

**Est. time:** 1-2 days

### Task 1.1: Install dependency + Config

**Files:** `requirements.txt`, `.env.example`, `app/config.py`, `.env`

- [ ] **1.1.1** Add to `requirements.txt` (end of AI section):
```
google-generativeai>=0.8.0
```

- [ ] **1.1.2** Add to `.env.example` after Ollama Cloud block:
```env
# Gemini (Chatbot)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TIMEOUT=120
GEMINI_MAX_OUTPUT_TOKENS=8192
```

- [ ] **1.1.3** Add to `app/config.py` class Settings (after `AI_GEN_MAX_REPAIR_ROUNDS`):
```python
    # Gemini (Chatbot)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_TIMEOUT: int = 120
    GEMINI_MAX_OUTPUT_TOKENS: int = 8192
```

- [ ] **1.1.4** Add to `.env`:
```env
GEMINI_API_KEY=AIzaSyCpE8NUNNodkximHWFvuW9cuZAiJvwrJSI
GEMINI_MODEL=gemini-2.5-flash
```

- [ ] **1.1.5** Run: `pip install google-generativeai>=0.8.0`
- [ ] **1.1.6** Verify: `python -c "import google.generativeai as genai; print('OK')"`

---

### Task 1.2: Create GeminiService

**Create:** `backend/app/services/ai/gemini_service.py`

Key methods (all classmethod, stateless — same pattern as OllamaService):
- `_ensure_configured()` — Configure SDK once with API key
- `_get_model(model_name, system_instruction)` — Return GenerativeModel instance
- `generate(prompt, system, temperature, model, max_tokens, history)` → `str` — Synchronous text generation; supports multi-turn via `history` param
- `generate_stream(prompt, system, temperature, model, max_tokens, history)` → `AsyncIterator[str]` — Yields text chunks for SSE streaming
- `analyze_image(image_content, prompt, system, model)` → `str` — Vision analysis of raw bytes
- `analyze_image_stream(image_content, prompt, system, model)` → `AsyncIterator[str]` — Streaming vision
- `is_available()` → `bool` — Check if API key configured

Implementation details:
- Uses `genai.configure(api_key=...)` once (class-level `_configured` flag)
- `history` format: `[{"role": "user"|"model", "parts": "..."}]` for Gemini chat
- Generation config: `max_output_tokens`, `temperature` from settings
- Image part format: `{"mime_type": "image/jpeg", "data": image_bytes}`
- Error handling: catch all exceptions, log, re-raise as `RuntimeError`
- Streaming errors: yield `[Lỗi: ...]` message instead of raising

Unit test: `backend/tests/test_gemini_service.py`
- `test_gemini_is_available_with_key()` — Mock settings, assert True
- `test_gemini_is_unavailable_without_key()` — Mock empty key, assert False

**Commit:** `feat(chatbot): add GeminiService wrapper for Google Generative AI SDK`

---

### Task 1.3: Create ChatMessage Model + Migration

**Create:** `backend/app/models/chat_message.py`

```python
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    session_id = Column(String(64), nullable=False, index=True)
    role = Column(String(10), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    message_type = Column(String(30), default="text")
    context_metadata = Column("metadata_json", JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    teacher = relationship("User")
```

**Modify:** `backend/app/main.py` — Add ONE import line:
```python
from app.models.chat_message import ChatMessage
```

Run: `alembic revision --autogenerate -m "add_chat_messages_table"` then `alembic upgrade head`

**Commit:** `feat(chatbot): add ChatMessage model and migration`

---

### Task 1.4: Create Chat Schemas

**Create:** `backend/app/schemas/chat.py`

Schemas:
- `ChatMessageRequest` — `message: str`, `session_id: Optional[str]`, `class_id: Optional[int]`, `student_id: Optional[int]`
- `ChatImageRequest` — `prompt: str`, `session_id`, `class_id`, `analysis_type: "homework"|"whiteboard"`
- `ChatMessageResponse` — `role`, `content`, `message_type`, `created_at`
- `ChatResponse` — `session_id`, `message: ChatMessageResponse`, `context: Optional[dict]`
- `ChatHistoryResponse` — `session_id`, `messages: List[ChatMessageResponse]`, `total_count`
- `ChatSessionListItem` — `session_id`, `last_message_preview`, `message_count`, `created_at`, `updated_at`

**Commit:** `feat(chatbot): add chat Pydantic schemas`

---

### Task 1.5: Create Chat Router

**Create:** `backend/app/routers/chat.py`

Router prefix: `/chat`, all endpoints require `get_current_teacher`.

Helper functions:
- `_save_message(db, teacher_id, session_id, role, content, message_type, context_metadata)` — Persist to DB
- `_get_session_history(db, teacher_id, session_id, limit=20)` — Return Gemini-compatible history list

Endpoints:

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| POST | `/chat/send` | Send text, get non-streaming response | `ChatResponse` |
| POST | `/chat/send-stream` | Send text, get SSE stream | `StreamingResponse` |
| POST | `/chat/analyze-image` | Upload image + prompt | `ChatResponse` |
| GET | `/chat/history/{session_id}` | Get session messages | `ChatHistoryResponse` |
| GET | `/chat/sessions` | List all sessions | `List[ChatSessionListItem]` |
| DELETE | `/chat/sessions/{session_id}` | Delete session | `{message, deleted_count}` |

SSE streaming format:
```
data: <text chunk>\n\n
event: session_id\ndata: <id>\n\n
event: done\ndata: [DONE]\n\n
```

Image endpoint: Accepts `multipart/form-data` — file + prompt + session_id + analysis_type + class_id. Validates image type (PNG/JPEG/WEBP), max 10MB.

**Modify:** `backend/app/main.py` — Add after v1 AI router block:
```python
try:
    from app.routers import chat
    app.include_router(chat.router, prefix="/api", tags=["Chatbot"])
except ModuleNotFoundError as exc:
    logger.warning("Skipping chat router due to missing dependency: %s", exc)
```

**Commit:** `feat(chatbot): add chat router with send, stream, image, history endpoints`

---

### Task 1.6: Create ChatService (Skeleton)

**Create:** `backend/app/services/ai/chat_service.py`

System instruction (Vietnamese):
```
Bạn là trợ lý AI cho giáo viên Toán tiểu học Việt Nam (Lớp 1-3).
Hệ thống: Smart-MathAI — nền tảng giáo dục Toán theo phương pháp CPA.
Chương trình: GDPT 2018 Bộ GD&ĐT Việt Nam.

Rules:
- Always respond in Vietnamese
- Only elementary math (Grade 1-3), NO algebra/equations
- Friendly, professional language for teachers
- CPA methodology: Concrete → Pictorial → Abstract
- When class data provided, analyze specifically (don't generalize)
- If uncertain, say so — never fabricate data
- Format with Markdown when appropriate
```

Class `ChatService(db, teacher_id)`:

Phase 1 methods:
- `handle_message(message, class_id, student_id, history)` → `dict` — Forward to Gemini with system instruction. Returns `{"content": str, "message_type": str, "context": dict|None}`
- `handle_message_stream(message, class_id, student_id, history)` → `AsyncIterator[str]` — Stream version
- `handle_image(image_content, prompt, analysis_type)` → `dict` — Dispatch to Gemini Vision with enhanced prompts per analysis_type
- `_build_prompt(message, class_id, student_id)` → `str` — Phase 1: return message as-is (placeholder for Phase 2)

Image handling detail:
- `analysis_type == "homework"`: Enhanced prompt asking for error identification, error type classification, pedagogical feedback, CPA-based correction suggestions
- `analysis_type == "whiteboard"`: Enhanced prompt checking if solution method is appropriate for elementary level, flagging algebraic notation, checking clarity

**Commit:** `feat(chatbot): add ChatService orchestrator skeleton`

---

### ✅ Phase 1 Review Checkpoint

- [ ] Run all existing tests: `cd backend && python -m pytest tests/ -v --tb=short` — ALL PASS
- [ ] Start server: `uvicorn app.main:app --reload --port 8000` — No import errors
- [ ] Check `/docs` — See "Chatbot" group with new endpoints
- [ ] **BMAD Code Review** for Phase 1
  - [ ] GeminiService is read-only (no data mutations)
  - [ ] All chat endpoints require `get_current_teacher`
  - [ ] ChatMessage model has correct foreign keys
  - [ ] No hardcoded API keys anywhere
  - [ ] Optional router pattern matches existing ai router

---

## PHASE 2: Backend — Enhanced Analytics + Data-Aware Chat

**Est. time:** 2-3 days

### Task 2.1: Enhanced Analytics for Student Spotlight

**Modify:** `backend/app/services/ai/analytics_service.py`

Add method `get_student_spotlight(class_id, student_id)` → `Dict[str, Any]`:

Returns:
```python
{
    "student_name": str,
    "student_id": int,
    "tier": str,
    "total_worksheets": int,
    "average_score": float,        # /10 scale
    "class_average_score": float,  # for comparison
    "score_trend": [               # line chart data
        {"date": str, "score": int, "max_score": int, "worksheet_id": int}
    ],
    "error_distribution": [        # pie/bar chart data
        {"error_type": str, "count": int}
    ],
    "recent_errors": [             # detailed recent errors
        {"error_type": str, "error_detail": str, "question_text": str,
         "student_answer": str, "correct_answer": str, "created_at": str}
    ],
    "total_error_records": int,
}
```

Logic:
1. Query Student by `student_id + class_id`
2. Query StudentProgress ordered by created_at → build `score_trend`
3. Query StudentAnalytics by student_id + class_id → aggregate `error_distribution`
4. Take top 10 recent errors → `recent_errors`
5. Compute average_score from score_trend
6. Call `analyze_class_errors(class_id)` → compute class_average_score for comparison

**Modify:** `backend/app/schemas/ai.py` — Add schemas:
- `StudentSpotlightScoreTrend(date, score, max_score, worksheet_id)`
- `StudentSpotlightErrorDist(error_type, count)`
- `StudentSpotlightRecentError(error_type, error_detail, question_text, student_answer, correct_answer, created_at)`
- `StudentSpotlightResponse` — combines all above

**Modify:** `backend/app/routers/ai.py` — Add endpoint:
```
GET /ai/analytics/{class_id}/student-spotlight/{student_id} → StudentSpotlightResponse
```
With ownership check: class must belong to current teacher.

**Test:** `backend/tests/test_student_spotlight.py`

**Commit:** `feat(chatbot): add Student Spotlight enhanced analytics endpoint`

---

### Task 2.2: ChatService — Intent Detection + Context Injection

**Modify:** `backend/app/services/ai/chat_service.py`

Add methods:

**`_detect_intent(message)` → `str`**

Keyword-based intent detection (Vietnamese + English):

| Intent | Keywords |
|--------|----------|
| `class_insights` | lớp, thống kê, analytics, sai nhiều, lỗi phổ biến, kết quả lớp |
| `student_spotlight` | học sinh, student, em, tiến bộ, spotlight, cá nhân |
| `exercise_request` | sinh bài, tạo bài, generate, sinh đề, bài tập, cpa, phân hóa |
| `cpa_advisor` | phương pháp, cpa, concrete, pictorial, abstract, dạy, strategy |
| `lesson_plan` | giáo án, lesson plan, kế hoạch bài dạy, tiết dạy, 45 phút |
| `general` | (default fallback) |

Priority order: lesson_plan > exercise_request > student_spotlight > class_insights > cpa_advisor > general

**`_build_prompt(message, class_id, student_id)` → `str`**

Update the Phase 1 placeholder to:

1. Detect intent
2. Based on intent + available context (class_id, student_id):
   - `class_insights` + class_id → call `_get_class_context(class_id)`
   - `student_spotlight` + class_id + student_id → call `_get_student_context(class_id, student_id)`
   - `student_spotlight` + class_id (no student_id) → inject class data + hint to select student
   - `cpa_advisor` → call `_get_rag_context(message, class_id)`
   - `lesson_plan` → call `_get_rag_context(message, class_id)` + lesson plan structure template
   - `exercise_request` → call `_get_exercise_request_context(message, class_id)`
   - `general` → return message as-is
3. Append context as `\n\n---\nDỮ LIỆU THAM KHẢO:\n{context}` block

**`_get_class_context(class_id)` → `str`**

- Verify class ownership (teacher_id match)
- Call `AnalyticsService(self.db).analyze_class_errors(class_id)`
- Format: class name, grade, student count, bottom 3 students, top 5 weak topics, top 5 common mistakes

**`_get_student_context(class_id, student_id)` → `str`**

- Call `AnalyticsService(self.db).get_student_spotlight(class_id, student_id)`
- Format: student name, tier, avg score vs class avg, score trend (last 5), error distribution (top 5), recent errors (top 3)

**`_get_rag_context(message, class_id)` → `str`**

- Determine grade from class_id (query MathClass)
- Call `RAGService().retrieve(query=message, grade=grade, k=3)`
- Format: numbered docs with source metadata + first 500 chars

**`_get_exercise_request_context(message, class_id)` → `str`**

- List available generation features (CPA, Differentiation)
- Required params: grade, topic, objective, counts
- If class_id provided, inject class grade
- Instruct Gemini to help teacher clarify params, then direct to UI feature

**Commit:** `feat(chatbot): add intent detection + context injection for all 7 features`

---

### ✅ Phase 2 Review Checkpoint

- [ ] Run all tests: `cd backend && python -m pytest tests/ -v --tb=short`
- [ ] Manual test each intent:
  - Class Insights: `"Tuần này lớp 2A sai gì nhiều nhất?"` (class_id=1)
  - Student Spotlight: `"Em Nguyễn Văn A tiến bộ không?"` (class_id=1, student_id=1)
  - Exercise Request: `"Sinh cho tôi 5 bài CPA phép cộng có nhớ lớp 2"`
  - CPA Advisor: `"Dạy phép trừ có nhớ lớp 2 theo CPA thế nào?"`
  - Lesson Plan: `"Lên giáo án 45 phút dạy phép nhân bảng 3 lớp 3"`
  - Image (homework): Upload student work photo
  - Image (whiteboard): Upload whiteboard photo
- [ ] **BMAD Code Review** for Phase 2
  - [ ] `get_student_spotlight` only READs, no writes
  - [ ] Intent detection doesn't false-positive on normal messages
  - [ ] RAG context retrieval has proper error handling
  - [ ] All new endpoints check teacher ownership
