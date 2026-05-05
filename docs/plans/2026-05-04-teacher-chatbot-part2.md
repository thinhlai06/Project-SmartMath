# Teacher AI Chatbot — Implementation Plan (Part 2: Frontend + Testing)

> Continues from [Part 1](./2026-05-04-teacher-chatbot-part1.md)

---

## PHASE 3: Frontend — Chat Types, API, Hook

**Est. time:** 1-2 days

### Task 3.1: Chat TypeScript Types

**Create:** `frontend/src/types/chat.ts`

```typescript
export interface ChatMessageRequest {
    message: string;
    session_id?: string;
    class_id?: number;
    student_id?: number;
}

export interface ChatMessageData {
    role: 'user' | 'assistant';
    content: string;
    message_type: string;
    created_at?: string;
}

export interface ChatResponse {
    session_id: string;
    message: ChatMessageData;
    context?: Record<string, unknown>;
}

export interface ChatHistoryResponse {
    session_id: string;
    messages: ChatMessageData[];
    total_count: number;
}

export interface ChatSessionItem {
    session_id: string;
    last_message_preview: string;
    message_count: number;
    created_at: string;
    updated_at: string;
}

export interface StudentSpotlightData {
    student_name: string;
    student_id: number;
    tier?: string;
    total_worksheets: number;
    average_score: number;
    class_average_score: number;
    score_trend: { date: string; score: number; max_score: number }[];
    error_distribution: { error_type: string; count: number }[];
    recent_errors: {
        error_type: string;
        error_detail?: string;
        question_text?: string;
        student_answer?: string;
        correct_answer?: string;
        created_at: string;
    }[];
    total_error_records: number;
}
```

**Commit:** `feat(chatbot): add frontend chat TypeScript types`

---

### Task 3.2: Chat API Service

**Create:** `frontend/src/services/chatApi.ts`

Methods (follows same pattern as `aiApi.ts` — uses axios `api` instance):

| Method | Description | Notes |
|--------|-------------|-------|
| `sendMessage(request)` | POST `/chat/send` → `ChatResponse` | Non-streaming fallback |
| `sendMessageStream(request, onChunk, onDone, onError)` | POST `/chat/send-stream` → SSE | Returns `AbortController` for cancellation. Uses raw `fetch()` + `ReadableStream` for SSE parsing. `onChunk(text)` called per chunk, `onDone(sessionId)` on completion. |
| `analyzeImage(file, prompt?, sessionId?, analysisType?, classId?)` | POST `/chat/analyze-image` multipart → `ChatResponse` | |
| `getHistory(sessionId)` | GET `/chat/history/{sessionId}` → `ChatHistoryResponse` | |
| `getSessions()` | GET `/chat/sessions` → `ChatSessionItem[]` | |
| `deleteSession(sessionId)` | DELETE `/chat/sessions/{sessionId}` | |
| `getStudentSpotlight(classId, studentId)` | GET `/ai/analytics/{classId}/student-spotlight/{studentId}` → `StudentSpotlightData` | |

SSE parsing logic for `sendMessageStream`:
```
1. fetch() with credentials: 'include'
2. Read response.body via getReader()
3. Decode chunks with TextDecoder
4. Buffer partial lines, split on '\n'
5. Lines starting with "data: " → extract payload
6. payload === "[DONE]" → call onDone()
7. Otherwise → call onChunk(payload)
8. "event: error" → next data line is error → call onError()
9. AbortController.abort() cancels stream
```

**Commit:** `feat(chatbot): add frontend chat API service with SSE streaming`

---

### Task 3.3: useChatbot Hook

**Create:** `frontend/src/hooks/useChatbot.ts`

```typescript
interface UseChatbotOptions {
    classId?: number;
    studentId?: number;
}
```

State:
- `messages: ChatMessageData[]` — Full message history
- `isLoading: boolean` — True while waiting for response
- `sessionId: string | undefined` — Current session ID
- `isOpen: boolean` — Panel open/closed
- `streamingContent: string` — Partial content during streaming

Actions:
- `sendMessage(text: string)` — Append user msg, call `sendMessageStream`, accumulate chunks in `streamingContent`, on done move to `messages`
- `sendImage(file, prompt?, analysisType?)` — Append user msg with 📷 prefix, call `analyzeImage`, append response
- `stopStreaming()` — Abort current stream
- `clearChat()` — Reset all state
- `loadSession(sessionId)` — Fetch history from API
- `setIsOpen(boolean)` — Toggle panel

Key behavior:
- `sendMessage` uses streaming by default (not `sendMessage` non-streaming endpoint)
- On stream done callback, `streamingContent` is moved into a proper assistant message in `messages` array
- AbortController ref stored for cancellation
- All callbacks wrapped in `useCallback` with proper deps

**Commit:** `feat(chatbot): add useChatbot hook with streaming support`

---

## PHASE 4: Frontend — Chat UI Components

**Est. time:** 2-3 days

**Design system:** Uses existing Shadcn/UI components (`Button`, `Card`, `ScrollArea`, `Separator`, `Textarea`) + Lucide icons + TailwindCSS v4. **NO new UI dependencies.**

---

### Task 4.1: ChatMessageBubble Component

**Create:** `frontend/src/components/chat/ChatMessageBubble.tsx`

Props: `{ message: ChatMessageData; isStreaming?: boolean; streamingContent?: string }`

UI spec:
- **User message**: `bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%] ml-auto`
- **Assistant message**: `bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%]`
- **Error message**: `bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 max-w-[85%]`
- **Streaming cursor**: Append blinking `▊` character (`animate-pulse`) at end of streaming content
- **Markdown rendering**: Basic support — parse `**bold**`, `- list items`, `` `code` ``, `### headings`` using simple regex replacement to HTML. No external markdown library needed for MVP.
- **Timestamp**: Small `text-xs text-gray-400` below bubble, show time only (not date)
- **Avatar area**: User → `User` icon (Lucide), Assistant → `Bot` icon (Lucide), both `w-7 h-7`

Layout: Each message is a flex row. User messages `flex-row-reverse`, assistant `flex-row`.

---

### Task 4.2: ChatInput Component

**Create:** `frontend/src/components/chat/ChatInput.tsx`

Props: `{ onSend: (text: string) => void; onSendImage: (file: File, prompt?: string) => void; isLoading: boolean; onStop: () => void }`

UI spec:
- Container: `flex items-end gap-2 p-3 border-t bg-white`
- **Textarea**: Auto-resize (1 row min, 4 rows max). `resize-none` class. Placeholder: `"Hỏi gì đó về lớp học..."`.
- **Send button**: `Send` icon (Lucide), `size-9` circle button, `bg-blue-600 text-white` when enabled, `bg-gray-200 text-gray-400` when disabled. Disabled if text empty or loading.
- **Stop button**: When `isLoading`, replace Send with `Square` icon (Lucide) with `bg-red-500 text-white`. Calls `onStop`.
- **Image attach**: `ImagePlus` icon (Lucide), `size-9` ghost button. Opens hidden `<input type="file" accept="image/*">`. On file selected, calls `onSendImage(file)`.
- **Keyboard**: Enter sends (calls `onSend`), Shift+Enter inserts newline.

---

### Task 4.3: ChatPanel Component

**Create:** `frontend/src/components/chat/ChatPanel.tsx`

Props: `{ isOpen: boolean; onClose: () => void; classId?: number; studentId?: number }`

This is the main chat container — a slide-in panel from the right.

UI spec:
- **Overlay**: `fixed inset-0 z-50` with `bg-black/20` backdrop, click outside closes
- **Panel**: `fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50` with slide-in animation (`translate-x-full` → `translate-x-0`, `transition-transform duration-300`)
- **Header**: `flex items-center justify-between px-4 py-3 border-b`
  - Left: `Bot` icon + `"Trợ lý AI"` title + status indicator (green dot if connected)
  - Right: `Trash2` icon (clear chat) + `X` icon (close)
  - Below title: Optional class/student context badge if `classId` provided
- **Messages area**: `ScrollArea` taking remaining height (`flex-1 overflow-y-auto`). Auto-scroll to bottom on new messages. Show welcome message if empty:
  ```
  👋 Xin chào! Tôi là trợ lý AI của Smart-MathAI.
  Tôi có thể giúp bạn:
  • Phân tích kết quả lớp học
  • Tìm hiểu tiến bộ từng học sinh
  • Gợi ý bài tập phù hợp
  • Phân tích bài làm/bảng viết
  • Tư vấn phương pháp CPA
  • Lên kế hoạch bài dạy
  ```
- **Quick action chips** (shown only in empty state): Row of clickable chips below welcome:
  - `"📊 Phân tích lớp"` — sends `"Phân tích kết quả lớp tôi tuần này"`
  - `"📝 Sinh bài tập"` — sends `"Tôi muốn sinh bài tập mới"`
  - `"📖 Gợi ý giáo án"` — sends `"Gợi ý giáo án cho tiết dạy sắp tới"`
  - `"💡 Tư vấn CPA"` — sends `"Cách dạy theo phương pháp CPA"`
- **Input area**: `ChatInput` component at bottom
- **Session list**: Optional dropdown/popover to switch sessions (Lucide `History` icon in header)

Behavior:
- Uses `useChatbot({ classId, studentId })` hook internally
- Mounts/unmounts based on `isOpen` (or use CSS visibility for performance)
- Auto-scrolls on new message or streaming content change (use `useEffect` + `ref.scrollIntoView`)

---

### Task 4.4: ChatFloatingButton Component

**Create:** `frontend/src/components/chat/ChatFloatingButton.tsx`

A floating action button in the bottom-right corner of every page.

UI spec:
- Position: `fixed bottom-6 right-6 z-40`
- Button: `size-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200`
- Icon: `MessageCircle` (Lucide) when closed, `X` when open
- **Notification badge**: Optional red dot/count badge for future use
- **Tooltip**: On hover, show `"Trợ lý AI"` tooltip
- Click toggles `ChatPanel` open/closed
- **Print**: Hide with `print:hidden` class

State management:
- Manages `isOpen` state locally OR receives from parent
- Renders `ChatPanel` as portal/sibling when open
- Extracts `classId` from current route params if on class detail page (use `useParams` from react-router-dom)

---

### Task 4.5: Barrel Export + App Integration

**Create:** `frontend/src/components/chat/index.ts`
```typescript
export { ChatFloatingButton } from './ChatFloatingButton';
export { ChatPanel } from './ChatPanel';
export { ChatMessageBubble } from './ChatMessageBubble';
export { ChatInput } from './ChatInput';
```

**Modify:** `frontend/src/App.tsx`

Add `ChatFloatingButton` inside `ProtectedRoute` layout (after `Navigation`, before `children`):

```tsx
// Inside ProtectedRoute return:
<div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="pt-4 print:pt-0">{children}</div>
    <ChatFloatingButton />  {/* ← ADD THIS */}
</div>
```

This ensures the chat button appears on every authenticated page but NOT on login/register.

**Commit:** `feat(chatbot): add ChatPanel UI with floating button, streaming messages, image upload`

---

### ✅ Phase 4 Review Checkpoint

- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Verify floating button appears on all teacher pages
- [ ] Click button → panel slides in from right
- [ ] Type message → see streaming response from Gemini
- [ ] Upload image → see analysis response
- [ ] Quick action chips work
- [ ] Close panel, reopen → messages persist (same session)
- [ ] Clear chat → fresh start
- [ ] No visual regressions on existing pages
- [ ] **BMAD Code Review** for Phase 4
  - [ ] No new npm dependencies added
  - [ ] Uses existing Shadcn/UI components correctly
  - [ ] SSE parsing handles edge cases (partial chunks, errors)
  - [ ] Auto-scroll doesn't interfere with manual scrolling
  - [ ] Image upload validates file type client-side

---

## PHASE 5: Frontend — Student Spotlight Charts

**Est. time:** 1-2 days

**Uses:** `recharts` (already installed — `"recharts": "^3.6.0"` in package.json)

### Task 5.1: Student Spotlight Chart Components

**Create:** `frontend/src/components/chat/StudentSpotlightCharts.tsx`

This component renders inside `ChatPanel` when the assistant responds with Student Spotlight context.

Sub-components:

**ScoreTrendChart**
- Line chart showing score over time
- X-axis: date, Y-axis: score/max_score as percentage
- Add horizontal dashed line for class average
- Uses `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ReferenceLine` from recharts
- Colors: student line `#3b82f6` (blue-500), class average `#ef4444` (red-500 dashed)

**ErrorDistributionChart**
- Horizontal bar chart showing error type counts
- Uses `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip` from recharts
- Color: `#f59e0b` (amber-500)
- Labels: Vietnamese error type names

**SpotlightSummaryCard**
- Card showing: student name, tier badge, avg score vs class avg, total worksheets
- Tier badges: foundation=orange, standard=blue, extension=green, advanced=purple
- Score comparison: green if above class avg, red if below

Integration point:
- `ChatPanel` checks if response `context` contains `student_spotlight` data
- If yes, render `StudentSpotlightCharts` below the assistant message bubble
- Data comes from `ChatResponse.context` or a separate `chatApi.getStudentSpotlight()` call

**Commit:** `feat(chatbot): add Student Spotlight charts with score trend and error distribution`

---

### Task 5.2: Integrate Charts into ChatPanel

**Modify:** `frontend/src/components/chat/ChatPanel.tsx`

- When `ChatResponse.context` includes `student_spotlight` key, render `StudentSpotlightCharts` component below the relevant assistant message
- Alternative: Add a `"📊 Xem biểu đồ"` button in assistant messages that triggers fetching spotlight data and rendering charts inline

**Commit:** `feat(chatbot): integrate Student Spotlight charts into ChatPanel`

---

### ✅ Phase 5 Review Checkpoint

- [ ] Send message with student context → see charts rendered
- [ ] Score trend chart shows data points correctly
- [ ] Error distribution chart shows top errors
- [ ] Summary card shows correct comparison with class average
- [ ] Charts are responsive (fit within 420px panel width)
- [ ] No performance issues with chart rendering
- [ ] **BMAD Code Review** for Phase 5

---

## PHASE 6: Integration Testing + Polish

**Est. time:** 2-3 days

### Task 6.1: Backend Integration Tests

**Create:** `backend/tests/test_chat_router.py`

Tests (all using TestClient with authenticated teacher):

| Test | Description |
|------|-------------|
| `test_send_message_basic` | POST `/chat/send` with simple message → 200, has session_id and content |
| `test_send_message_with_class_context` | POST with class_id → response references class data |
| `test_send_message_creates_session` | First message creates new session_id |
| `test_send_message_continues_session` | Second message with same session_id returns same session |
| `test_analyze_image_homework` | POST image + prompt → 200 with analysis |
| `test_analyze_image_invalid_type` | POST non-image file → 400 |
| `test_analyze_image_too_large` | POST >10MB image → 400 |
| `test_get_history` | Create messages then GET history → correct order and count |
| `test_list_sessions` | Create multiple sessions → GET sessions returns all |
| `test_delete_session` | Create then DELETE → messages gone |
| `test_unauthenticated_rejected` | No auth → 401 |
| `test_student_spotlight_endpoint` | GET spotlight → correct structure |

**Note:** Tests that call Gemini API should mock `GeminiService.generate` to avoid real API calls in CI. Use `unittest.mock.patch`.

**Commit:** `test(chatbot): add chat router integration tests`

---

### Task 6.2: Frontend Component Tests

**Create:** `frontend/src/components/chat/__tests__/ChatInput.test.tsx`

Tests:
| Test | Description |
|------|-------------|
| `renders textarea and buttons` | Verify input, send, image buttons present |
| `send button disabled when empty` | Empty textarea → send button disabled |
| `calls onSend on Enter` | Type + Enter → onSend called with text |
| `Shift+Enter inserts newline` | Shift+Enter → no onSend call |
| `shows stop button when loading` | isLoading=true → stop button visible |

**Create:** `frontend/src/components/chat/__tests__/ChatMessageBubble.test.tsx`

Tests:
| Test | Description |
|------|-------------|
| `renders user message right-aligned` | role=user → blue bg, ml-auto |
| `renders assistant message left-aligned` | role=assistant → gray bg |
| `shows streaming cursor when streaming` | isStreaming=true → cursor visible |

**Create:** `frontend/src/services/__tests__/chatApi.test.ts`

Tests:
| Test | Description |
|------|-------------|
| `sendMessage calls POST /chat/send` | Mock axios → verify URL and payload |
| `getHistory calls GET with session_id` | Mock axios → verify URL |
| `getSessions calls GET /chat/sessions` | Mock axios → verify |

**Commit:** `test(chatbot): add frontend component and service tests`

---

### Task 6.3: E2E Test

**Create:** `frontend/e2e/chatbot-flow.spec.ts`

Playwright E2E test covering full flow:

```
1. Login as teacher
2. Navigate to class detail page
3. Click floating chat button → panel opens
4. Verify welcome message and quick action chips
5. Type message → verify response appears
6. Click quick action chip → verify pre-filled message sent
7. Close panel → reopen → messages persist
8. Clear chat → verify empty state
9. Upload image → verify analysis response (mock or skip in CI)
10. Close panel → floating button visible
```

**Note:** Mock Gemini API responses in E2E using Playwright route interception to avoid real API calls.

**Commit:** `test(chatbot): add E2E test for chatbot flow`

---

### Task 6.4: Polish & Edge Cases

- [ ] **Empty state**: If no class selected, show general chat only (no class insights)
- [ ] **Error handling**: Network errors show retry button
- [ ] **Rate limiting**: Disable send button for 1s after send to prevent spam
- [ ] **Message length**: Client-side validation matches backend (max 2000 chars)
- [ ] **Image preview**: Show thumbnail of uploaded image in user message bubble
- [ ] **Responsive**: Panel goes full-width on mobile (`w-full sm:w-[420px]`)
- [ ] **Keyboard accessibility**: Escape closes panel, Tab navigates elements
- [ ] **Dark mode ready**: Use Tailwind dark: variants (if app supports it)

**Commit:** `fix(chatbot): polish UI edge cases and error handling`

---

### ✅ Phase 6 Review Checkpoint

- [ ] ALL backend tests pass: `cd backend && python -m pytest tests/ -v`
- [ ] ALL frontend tests pass: `cd frontend && npm test`
- [ ] E2E test passes: `cd frontend && npm run e2e`
- [ ] **Full manual test** of all 7 features end-to-end
- [ ] **BMAD Code Review** for Phase 6 — final comprehensive review

---

## Summary — Complete Feature Checklist

| # | Feature | Backend | Frontend | Tests |
|---|---------|---------|----------|-------|
| 1 | Class Insights Chat | Phase 2 (intent + analytics context) | Phase 4 (ChatPanel) | Phase 6 |
| 2 | Student Spotlight | Phase 2 (analytics + endpoint) | Phase 5 (charts) | Phase 6 |
| 3 | Natural Language Exercise Request | Phase 2 (intent + exercise context) | Phase 4 (ChatPanel) | Phase 6 |
| 4 | Homework Photo Analysis | Phase 1 (handle_image) | Phase 4 (image upload) | Phase 6 |
| 5 | Whiteboard Verification | Phase 1 (handle_image) | Phase 4 (image upload) | Phase 6 |
| 6 | CPA Methodology Advisor | Phase 2 (intent + RAG context) | Phase 4 (ChatPanel) | Phase 6 |
| 7 | Lesson Plan Chat | Phase 2 (intent + RAG + template) | Phase 4 (ChatPanel) | Phase 6 |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Gemini API rate limits | Add retry with exponential backoff in GeminiService |
| Gemini API latency | SSE streaming gives perceived responsiveness |
| Large image uploads | 10MB limit + client-side validation |
| API key exposure | .env only, never in frontend code, never in git |
| Breaking existing features | All new code in separate files; optional router import |
| Intent detection false positives | Conservative keyword matching + "general" fallback |
| RAG data missing for grade | Graceful fallback message when no docs found |
| Session history too long | Limit to last 20 messages per session for Gemini context |

---

## Dependency Summary

### Backend — New
- `google-generativeai>=0.8.0` (only new pip package)

### Frontend — No new dependencies
- Uses existing: `recharts`, `lucide-react`, `@radix-ui/*`, `axios`, `react-router-dom`

### Config — New env vars
```
GEMINI_API_KEY=<key>
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TIMEOUT=120
GEMINI_MAX_OUTPUT_TOKENS=8192
```

---

## Execution Order

```
Phase 1 → Review → Phase 2 → Review → Phase 3 → Review → Phase 4 → Review → Phase 5 → Review → Phase 6 → Final Review
```

Each phase is independently testable. After each phase, verify ALL existing tests still pass before proceeding.

**Total estimated time: 8-14 days** (depending on iteration from code reviews)

---

## Self-Review Notes

Issues identified during plan review and mitigations:

### 1. AnalyticsService helper methods
`get_student_spotlight` in Task 2.1 references `_extract_detail_items()` and `_to_int()`. Verify these exist in the current `AnalyticsService` class before implementing. If missing, add them as private helpers:
```python
def _to_int(self, val, default=0):
    try: return int(val)
    except (TypeError, ValueError): return default

def _extract_detail_items(self, details):
    if isinstance(details, list): return details
    if isinstance(details, dict): return details.get("results", [])
    return []
```

### 2. SSE session_id parsing
The frontend `sendMessageStream` SSE parser needs to handle the two-line event format:
```
event: session_id
data: abc123
```
The parser must track the last seen `event:` line and use it to interpret the next `data:` line. Current pseudocode is simplified — implementation must use a state variable for this.

### 3. Gemini SDK version compatibility
`google-generativeai>=0.8.0` is the minimum. The SDK API may change — pin to a tested version after Phase 1 verification (e.g., `google-generativeai==0.8.3`).

### 4. CORS for SSE
SSE streams via `fetch()` use `credentials: 'include'`. The existing CORS config in `main.py` already allows `allow_credentials=True` for `localhost:5173`, so this should work. Verify during Phase 4 testing.

### 5. Database session lifecycle in streaming
The `/chat/send-stream` endpoint creates a DB session via `Depends(get_db)`, then uses it inside the `event_generator()` async generator. The DB session must remain open during streaming. FastAPI handles this correctly with `Depends`, but verify during testing that the session isn't closed prematurely.

### 6. Intent detection edge case — "bài tập" overlap
The keyword "bài tập" appears in both `exercise_request` and potentially in student messages. The priority order (exercise_request > student_spotlight > class_insights) handles this, but consider adding compound keyword checks (e.g., "sinh bài tập" vs "kết quả bài tập") for better accuracy in a later iteration.

### 7. No frontend dependency on google-generativeai
The frontend NEVER imports or uses the Gemini SDK directly. All AI communication goes through the backend API. This is by design — the API key stays server-side only.
