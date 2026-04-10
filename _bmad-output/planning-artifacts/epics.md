# BMad Product Epics & Stories: Smart-MathAI Phase 2 Refinement

## Introduction for Dev Agents
This document provides extreme low-level implementation details for the BMad Developer Agent (`bmad-quick-dev` or `bmad-dev-story`).
The architecture mandates Hexagonal Architecture (Clean Architecture patterns) for the Backend (FastAPI, Python 3.10) and Feature-Driven component design for the Frontend (React, Vite, TanStack Query, TailwindCSS).

---

## Epic 1: Quản trị Học sinh & Bulk Import Excel (Student Model Expansion)
**Goal:** Expand student profiles and implement zero-friction Excel onboarding with full detail views.

### Story 1.1: Database Schema & Pydantic Schema Overhaul
* **Role:** Backend Dev Agent
* **Target Files:** `backend/app/models/student.py`, `backend/app/schemas/student.py`, `backend/requirements.txt`
* **Implementation Directives:**
  1. Inject `openpyxl` and `python-multipart` to `requirements.txt`.
  2. In `student.py` (SQLAlchemy), append new columns:
     - `dob: Mapped[date] = mapped_column(Date, nullable=True)`
     - `parent_name: Mapped[str] = mapped_column(String(100), nullable=True)`
     - `parent_phone: Mapped[str] = mapped_column(String(20), nullable=True)`
  3. In `schemas/student.py`, mirror these fields to `StudentBase`, `StudentCreate`, and `StudentResponse`. The frontend expects `dob` formatted as ISO dates.

### Story 1.2: Excel Upload Service
* **Role:** Backend Dev Agent
* **Target Files:** `backend/app/routers/students.py`
* **Implementation Directives:**
  1. Build a new POST endpoint: `/api/classes/{class_id}/students/upload`.
  2. Use `UploadFile = File(...)` to ingest the Excel file.
  3. Validate using `openpyxl` (or `pandas` if already installed). The expected sheet template MUST STRICTLY contain these specific Vietnamese column headers:
     - `["Họ và tên", "Ngày tháng năm sinh", "Họ tên bố hoặc mẹ", "SĐT bố hoặc mẹ"]`.
  4. Parse the dates (handle multiple string formats like `dd/mm/yyyy` gracefully).
  5. Save to the database using `session.add_all()`.
  6. **Data Isolation Security:** Implicitly deny upload if `class_id` does not belong to `current_teacher.id`.

### Story 1.3: UI Modal & Excel Upload Implementation
* **Role:** Frontend Dev Agent
* **Target Files:** `frontend/src/services/classApi.ts`, `frontend/src/pages/ClassDetailPage.tsx`
* **Implementation Directives:**
  1. In `classApi.ts`, expose `uploadStudentsExcel(classId: number, file: File)`.
  2. In `ClassDetailPage.tsx`, add an "Import Excel" `<button>` wrapped around a hidden `<input type="file" accept=".xlsx" />`. Add a subtle toast loading state while parsing.
  3. Modify the Student List row renderer: Change it so clicking the row triggers a Shadcn UI `<Dialog>` or `<Sheet>` that acts as a "Profile Card".
  4. The Profile Card must elegantly display: Name, DOB, Parent Name, Parent Phone, and their Average Score/Tier.

---

## Epic 2: Real-time Dashboard & Security
**Goal:** Eliminate the mock data on the Home Dashboard and securely isolate queries.

### Story 2.1: Enforce Segregation in Dashboard Analytics
* **Role:** Backend Dev Agent
* **Target Files:** `backend/app/routers/dashboard.py` (and relevant repository files)
* **Implementation Directives:**
  1. Hardcode security logic: Any `avg_score`, `total_students`, or `total_worksheets` calculated MUST be joined securely with `classes.teacher_id == current_user.id`.
  2. Return true numbers to the frontend instead of `None`.

### Story 2.2: Compute True Average Score for UI
* **Role:** Frontend Dev Agent
* **Target Files:** `frontend/src/pages/HomePage.tsx`
* **Implementation Directives:**
  1. Find the "Coming soon" tag located on the "Điểm TB" tile card.
  2. Rip it out. Evaluate `stats.avg_score`:
     - If `undefined` or `null`, render `-`.
     - Otherwise render the float truncated to 1 decimal point (e.g., `8.5`).
     - Apply conditional coloring (`text-emerald-500` for >8, `text-orange-500` for <6, etc.).

---

## Epic 3: AI Differentiation - Mock Data Eradication
**Goal:** Hook up the real student data array into the Differentiation component.

### Story 3.1: Connect TanStack Query to Differentiation
* **Role:** Frontend Dev Agent
* **Target Files:** `frontend/src/components/differentiation/DiffStep2Assignment.tsx`
* **Implementation Directives:**
  1. Identify where `MOCK_STUDENTS` is imported from `mockData/differentiationData.ts`. DELETE the import and DELETE the file entirely.
  2. Utilize `useQuery` to fetch from `classApi.getStudents(currentClassId)`.
  3. Write a small helper function `suggestTier(avgScore)` that bins students into `foundation`, `standard`, `extension`, `advanced` if the backend doesn't already provide a tier. Standardize the mapped state UI so it works flawlessly with the real array.

---

## Epic 4: OCR Error Analytics Pipeline
**Goal:** Feed OCR label logic from grading into a real dashboard chart.

### Story 4.1: Database Route for Log Grading
* **Role:** Backend Dev Agent
* **Target Files:** `backend/app/interfaces/api/v1/routers/ai_router.py` (or existing AI tracking router)
* **Implementation Directives:**
  1. Open the POST endpoint (`/api/v1/ai/analytics/submit`).
  2. Process incoming JSON from the AI Image Grading page containing error tags (e.g., "Sai logic", "Sai số học"). Add these to the `StudentAnalytics` database records.

### Story 4.2: Replace ErrorAnalyticsPage Mock
* **Role:** Frontend Dev Agent
* **Target Files:** `frontend/src/pages/ErrorAnalyticsPage.tsx`
* **Implementation Directives:**
  1. Ensure the `fetchAnalytics` logic pulls genuine data from the backend. Delete `frontend/src/mockData/mockErrorData.ts`.
  2. Bind the data to the Recharts components smoothly.

---

## Epic 5: PDF Print Aesthetic Refinement
**Goal:** The exported PDF must look like a premium primary school resource using pure CSS.

### Story 5.1: Tailwind CSS @print Overhaul
* **Role:** Frontend Dev Agent
* **Target Files:** `frontend/src/pages/WorksheetEditorPage.tsx`
* **Implementation Directives:**
  1. Keep quick print experience in editor via `window.print()` using Tailwind `@media print`. This story handles print aesthetics only.
  2. Pre-pend elements to hide during print with `print:hidden` (sidebars, navbar, action buttons).
  3. Ensure the main container adopts paper form: `print:w-[210mm] print:h-[297mm] print:bg-white print:text-black print:p-8`.
  4. Typography Refinement: Add `print:text-xl print:font-sans print:leading-loose` explicitly to math questions to ensure they are visually comfortable for ages 6-9.
  5. Break Rules: Add `print:break-inside-avoid print:page-break-inside-avoid` to every question block `<div className="question-item">` so that questions NEVER bisect across two pages.

### Story 5.2: Real PDF Download from Export Modal (Classroom + Personalized)
* **Role:** Fullstack Dev Agent
* **Target Files:** `frontend/src/components/PdfExportModal.tsx`, `frontend/src/pages/WorksheetsPage.tsx`, `frontend/src/services/worksheetApi.ts`, `backend/app/routers/pdf.py`, `backend/app/services/pdf_service.py`
* **Implementation Directives:**
  1. Wire export modal to trigger real file download instead of mock alert/log flow.
  2. Support real download for both tabs: classroom mode and personalized mode.
  3. Preserve print flow in `WorksheetEditorPage` as a separate quick action.
  4. Ensure request params are mapped consistently between frontend settings and backend PDF endpoint.
  5. Handle error/success notifications in Vietnamese and keep UX responsive for large class exports.

---

## Epic 6: AI Grading Accuracy Hardening & Answer Builder
**Goal:** Eliminate false-positive scoring in OCR grading and remove teacher JSON burden by introducing structured answer authoring UI with internal schema conversion.

### Story 6.1: Backend Structured Answer Schema & Converter
* **Role:** Backend Dev Agent
* **Target Files:** `backend/app/schemas/ai.py`, `backend/app/routers/ai.py`, `backend/app/services/ai/answer_schema_converter.py`
* **Implementation Directives:**
  1. Add structured request schemas for teacher-provided answers, including per-question fields: `answer_type`, `correct_answer`, `points`, `grading_rule`.
  2. Support V1 answer types: `numeric`, `ordered_list`, `unordered_list`, `multi_blank`, `boolean`.
  3. Implement converter service that transforms friendly UI payload into internal JSON answer schema used by grading engine.
  4. Keep backward compatibility with existing `correct_answers_json` input during migration window.
  5. Enforce validation constraints (grade 1-3 context, points bounds, unique question identifiers, type-specific required fields).

### Story 6.2: Typed Comparator Engine with Per-question Rules
* **Role:** Backend Dev Agent
* **Target Files:** `backend/app/services/ai/grading_service.py`, `backend/app/services/ai/answer_comparator.py`
* **Implementation Directives:**
  1. Refactor string-only comparison logic into typed comparator strategies by `answer_type`.
  2. For list answers, support teacher-select scoring rule per question:
     - `all_or_nothing`
     - `per_item`
  3. Ensure unordered list grading checks set completeness (missing element must lose score; no false 10/10).
  4. Ensure ordered list grading checks positional correctness.
  5. For multi-blank, grade per blank slot and aggregate according to question points.
  6. Preserve OCR confidence output and attach low-confidence indicators to graded result details.

### Story 6.3: Answer Builder UI (No JSON Input for Teacher)
* **Role:** Frontend Dev Agent
* **Target Files:** `frontend/src/pages/AIGradingPage.tsx`, `frontend/src/services/aiApi.ts`, `frontend/src/types/ai.ts`, `frontend/src/components/redesign/teacher/AnswerBuilderForm.tsx`
* **Implementation Directives:**
  1. Replace JSON textarea input with Answer Builder form blocks per question.
  2. Each block must include: answer type, correct answer authoring inputs, points, grading rule.
  3. Type-specific form rendering:
     - Numeric: single numeric field
     - Ordered/Unordered list: comma-separated or tokenized list editor + rule selector
     - Multi-blank: dynamic slots (`ô 1`, `ô 2`, ...)
     - Boolean: true/false selector
  4. Submit only structured payload from UI; teacher never sees or edits raw JSON.
  5. Keep UX text in Vietnamese and show validation errors inline before submit.

### Story 6.4: OCR Review Workflow Alignment
* **Role:** Fullstack Dev Agent
* **Target Files:** `frontend/src/components/redesign/teacher/GradingDiffViewer.tsx`, `frontend/src/pages/AIGradingPage.tsx`, `backend/app/schemas/ai.py`
* **Implementation Directives:**
  1. Ensure override/review UI still works with typed answers and per-question grading rules.
  2. Surface grading explanation for near-correct answers (e.g., missing list items) so teachers can validate quickly.
  3. Keep teacher-in-the-loop behavior: grading output remains reviewable draft before analytics submit.

### Story 6.5: Test Coverage for Grading Reliability
* **Role:** QA + Backend/Frontend Dev Agents
* **Target Files:** `backend/tests/test_grading_service.py`, `backend/tests/test_answer_schema_converter.py`, `backend/tests/test_grade_image_endpoint.py`, `frontend/e2e/ai-grading-answer-builder.spec.ts`, `frontend/e2e/ai-flows.spec.ts`
* **Implementation Directives:**
  1. Add regression test for key failure scenario: question expects `1,2,3,4,5` and student writes `1,2,3,5` must not score full marks.
  2. Add tests for ordered vs unordered list behavior.
  3. Add tests for multi-blank partial grading.
  4. Add migration compatibility tests for old `correct_answers_json` and new builder payload.
  5. Enforce no real model calls in tests (mock AI/OCR services).

---

## Epic 7: Class-Grade Topic Lock + Bundle-v2 Expansion + Class CRUD Completion
**Goal:** Complete the operational roadmap for class-grade isolation, broader bundle-v2 support, real export continuity, and full class management workflows.

### Story 7.1: Lock Topic Options by Selected Class Grade
* **Role:** Frontend Dev Agent
* **Target Files:** `frontend/src/components/cpa/CPAStepWizard.tsx`, `frontend/src/components/differentiation/DifferentiationWizard.tsx`, `frontend/src/services/classApi.ts`
* **Implementation Directives:**
  1. Ensure topic list calls always include `grade` from selected class context.
  2. On class switch, refetch topics and reset invalid topic selections.
  3. Prevent mixed-grade topic rendering in all teacher worksheet generation flows.
  4. Keep UX labels and validation feedback in Vietnamese.

### Story 7.2: Bundle-v2 Phase 1 Expansion (Deterministic Taxonomy)
* **Role:** Backend Dev Agent
* **Target Files:** `backend/app/services/ai/topic_family.py`, `backend/app/services/ai/cpa_bundle_generator.py`, `backend/app/schemas/cpa_bundle.py`, `backend/app/services/ai/cpa_validator.py`, `backend/app/application/use_cases/ai/generate_cpa_bundle.py`
* **Implementation Directives:**
  1. Refactor topic-family routing toward stable taxonomy/task-family mapping rather than fragile keyword-only logic.
  2. Expand Phase 1 bundle-v2 coverage for division split (`division_with_remainder` + non-remainder division where applicable) and number-sense families.
  3. Keep arithmetic cores deterministic and grade-safe for lớp 1-3.
  4. Preserve teacher review gate: generated bundles remain draft until approved.
  5. Keep model constraints unchanged (approved models only).

### Story 7.3: Full Class Management CRUD in Both Class Screens
* **Role:** Frontend Dev Agent
* **Target Files:** `frontend/src/pages/ClassesPage.tsx`, `frontend/src/pages/ClassDetailPage.tsx`, `frontend/src/services/classApi.ts`
* **Implementation Directives:**
  1. Add edit/delete class actions in both classes list and class detail pages.
  2. Implement student edit flow in class detail list (not icon placeholder only).
  3. Allow class grade editing with strong confirmation warning before save.
  4. Keep immutable state updates and role-safe rendering for teacher-only actions.

### Story 7.4: Regression & Acceptance Matrix for Roadmap Cohesion
* **Role:** QA + Fullstack Dev Agents
* **Target Files:** `frontend/e2e/ai-flows.spec.ts`, `frontend/e2e/epic1-student-flows.spec.ts`, `backend/tests/test_topic_family.py`, `backend/tests/test_cpa_bundle_endpoints.py`, `backend/tests/test_cpa_validator.py`
* **Implementation Directives:**
  1. Verify class-grade topic isolation in CPA and differentiation wizards.
  2. Verify expanded bundle-v2 families no longer trigger avoidable unsupported errors in Phase 1 scope.
  3. Verify class edit/delete and student edit actions in both class screens.
  4. Verify PDF modal still performs real download while editor quick print remains intact.
