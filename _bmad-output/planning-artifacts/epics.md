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
  1. DO NOT implement `react-to-pdf` or backend logic. Target purely `window.print()` using Tailwind `@media print`.
  2. Pre-pend elements to hide during print with `print:hidden` (sidebars, navbar, action buttons).
  3. Ensure the main container adopts paper form: `print:w-[210mm] print:h-[297mm] print:bg-white print:text-black print:p-8`.
  4. Typography Refinement: Add `print:text-xl print:font-sans print:leading-loose` explicitly to math questions to ensure they are visually comfortable for ages 6-9.
  5. Break Rules: Add `print:break-inside-avoid print:page-break-inside-avoid` to every question block `<div className="question-item">` so that questions NEVER bisect across two pages.
