---
title: 'Smart Student Progress Portfolio'
type: 'feature'
created: '2026-05-07'
status: 'implemented-targeted-verified'
context:
  - 'ARCHITECTURE.md'
  - '_bmad-output/project-context.md'
  - 'PROJECT_OVERVIEW.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Giáo viên hiện có điểm, tiến độ và lỗi sai rải rác ở sổ điểm, AI grading, analytics và chatbot spotlight, nhưng chưa có một trang hồ sơ tiến bộ tập trung để xem từng học sinh đang cải thiện, ổn định hay cần can thiệp. Điều này làm giáo viên vẫn phải tự tổng hợp dữ liệu khi muốn theo dõi tiến bộ dài hạn hoặc quyết định hỗ trợ cá nhân.

**Approach:** Xây dựng Smart Student Progress Portfolio như một workflow teacher-only, chỉ đọc/tổng hợp dữ liệu hiện có trước, không thay đổi luồng chấm bài hoặc xuất bản worksheet. MVP gồm trang danh sách portfolio theo lớp, trang chi tiết học sinh, biểu đồ tiến bộ, lỗi lặp lại, trạng thái can thiệp và gợi ý hành động dạng rule-based/draft để giáo viên tham khảo.

## Boundaries & Constraints

**Always:** Chỉ Toán lớp 1-3; mọi API dùng `get_current_teacher`; truy vấn scope theo `teacher_id`, class ownership và grade 1-3; tái sử dụng `StudentProgress`, `StudentAnalytics`, `GradeEntry`, `Worksheet`; score precedence là `GradeEntry` trước, `StudentProgress` fallback sau; không đổi semantics gradebook, AI grading, worksheet publish; UI/lỗi tiếng Việt; frontend TypeScript strict, `withCredentials`, TanStack Query; backend FastAPI + SQLAlchemy ORM, không raw SQL trong router; mọi recommendation là draft, không tự đánh giá thay giáo viên.

**Ask First:** Cần hỏi trước nếu muốn thêm bảng DB mới, thêm AI model mới, thêm parent/student-facing access, tự động đổi `student.tier`, tự động gửi nhận xét, hoặc sửa cấu trúc dữ liệu grading/progress hiện tại.

**Never:** Không dùng CPA làm nền tính năng; không tạo tài khoản học sinh/phụ huynh; không ghi đè điểm hoặc error analytics từ portfolio; không gọi model thật trong test; không đặt logic tổng hợp phức tạp trong React page; không để router truy vấn DB trực tiếp cho endpoint v1 mới.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Class portfolio happy path | Teacher owns class with students, grade entries, progress and analytics | Returns class summary: student cards, average score, trend label, repeated mistakes, risk badge | Không phát sinh lỗi |
| Student detail happy path | Teacher opens one student in owned class | Shows score trend, recent worksheets, error distribution, repeated errors, recommended next actions | Không phát sinh lỗi |
| No learning data | Class/student exists but no grade/progress/analytics | Shows empty state: “Chưa có đủ dữ liệu tiến bộ” and no crash | Return empty arrays and neutral status |
| Unauthorized class | Teacher requests another teacher’s class | No portfolio data returned | HTTP 403 Vietnamese message |
| Student not in class | Student id does not belong to class | No detail returned | HTTP 404 Vietnamese message |
| Partial legacy data | Missing `details` or grade/progress mismatch | Use score precedence and fallback; never divide by zero | Return conservative metrics with `data_quality` and `score_source` |
| Large class | 45+ students and many worksheets | Class endpoint returns summary cards only, not full detail payload for every student | Query only needed records; frontend skeleton/loading state |

</frozen-after-approval>

## Code Map

- `backend/app/models/student_progress.py`, `student_analytics.py`, `grade_entry.py` -- read-only portfolio sources.
- `backend/app/domain/repositories/*` -- target for repository port so use cases do not depend directly on SQLAlchemy.
- `backend/app/infrastructure/db/sqlalchemy/*` -- target for SQLAlchemy adapter that performs bounded portfolio queries.
- `backend/app/services/ai/analytics_service.py` -- already has `get_student_spotlight`; refactor/reuse cautiously for portfolio aggregation.
- `backend/app/routers/ai.py` -- legacy endpoint currently exposes `/api/ai/analytics/{class_id}/student-spotlight/{student_id}`; do not break chatbot usage.
- `backend/app/interfaces/api/v1/routers/*` -- target location for new contract-first portfolio read endpoints.
- `backend/app/interfaces/api/v1/schemas/student_portfolio.py` -- typed response models for portfolio list/detail.
- `frontend/src/components/chat/StudentSpotlightCharts.tsx` -- existing reusable chart ideas; extract shared portfolio charts instead of duplicating logic.
- `frontend/src/services/*` -- existing clients; add dedicated portfolio client.
- `frontend/src/App.tsx` -- add teacher-protected portfolio routes.
- `frontend/src/pages/ErrorAnalyticsPage.tsx` and `frontend/src/pages/GradebookPage.tsx` -- adjacent UX patterns and navigation entry points.
- `backend/tests/test_ai_analytics_service.py`, `backend/tests/test_ai_analytics_submit.py` -- add regression tests for aggregation and ownership behavior.

## Tasks & Acceptance

**Execution:**
- [x] `backend/app/application/dto/student_portfolio.py` -- define DTOs for class portfolio card, student detail, trend point, repeated mistake, recent worksheet and recommendation -- keeps API contract explicit.
- [x] `backend/app/domain/repositories/student_portfolio_repository.py` -- define read-only repository port for class summary/detail source data -- keeps use cases framework-independent.
- [x] `backend/app/infrastructure/db/sqlalchemy/student_portfolio_repository.py` -- implement bounded SQLAlchemy ORM queries with teacher/class/grade filters and no writes -- prevents leakage and over-fetching.
- [x] `backend/app/application/use_cases/get_class_student_portfolios.py` -- aggregate all students in a class into portfolio cards through repository port -- prevents DB logic in router/use-case coupling.
- [x] `backend/app/application/use_cases/get_student_portfolio_detail.py` -- aggregate one student’s full profile from repository data -- isolates score precedence, trend and recommendation rules.
- [x] `backend/app/domain/services/student_progress_classifier.py` -- implement documented deterministic labels: `improving`, `stable`, `needs_monitoring`, `at_risk`; no-data must stay neutral -- makes status testable and non-AI.
- [x] `backend/app/interfaces/api/v1/schemas/student_portfolio.py` -- add Pydantic response models with `data_quality`, `score_source`, safe defaults and Vietnamese-readable labels -- stabilizes frontend contract.
- [x] `backend/app/interfaces/api/v1/routers/student_portfolio_router.py` -- add `GET /api/v1/classes/{class_id}/student-portfolios` and `GET /api/v1/classes/{class_id}/students/{student_id}/portfolio` using dependencies only -- avoids legacy router growth.
- [x] `backend/app/bootstrap/container.py`, `backend/app/interfaces/api/v1/routers/__init__.py`, `backend/app/main.py` -- wire repository/use cases/router without changing existing AI, gradebook or worksheet routes -- keeps integration isolated.
- [x] `backend/tests/test_student_portfolio_use_cases.py` -- test edge cases from matrix plus classifier thresholds and score precedence -- protects aggregation logic.
- [x] `backend/tests/test_student_portfolio_api.py` -- test teacher ownership, 403/404, grade boundary, response shape, and no cross-class leakage -- protects security boundary.
- [x] `frontend/src/types/studentPortfolio.ts` -- define strict TS types matching v1 schemas -- avoids ad-hoc `any` usage.
- [x] `frontend/src/services/studentPortfolioApi.ts` -- add `getClassPortfolios(classId)` and `getStudentPortfolio(classId, studentId)` using shared axios client -- preserves cookie-session flow.
- [x] `frontend/src/features/student-portfolio/queries.ts` -- add TanStack Query hooks and query keys for class/detail data -- prevents page-local fetch sprawl.
- [x] `frontend/src/components/portfolio/*` -- create focused components: status badge, score trend, repeated mistakes, recommendation panel.
- [x] `frontend/src/pages/StudentPortfolioHubPage.tsx` -- class selector + student portfolio card grid + empty/loading/error states -- primary teacher workflow.
- [x] `frontend/src/pages/StudentPortfolioDetailPage.tsx` -- detail page with score trend, recent worksheets, repeated mistakes, recommendation draft and links to gradebook/analytics -- supports individual intervention.
- [x] `frontend/src/App.tsx`, `frontend/src/components/Navigation.tsx`, relevant dashboard cards -- add teacher-protected navigation entry without disrupting existing routes -- feature discoverability.
- [x] `frontend/src/pages/GradebookPage.tsx` and/or `ErrorAnalyticsPage.tsx` -- add optional “Xem hồ sơ tiến bộ” link per student where low-risk -- connects existing workflows without changing their data behavior.

**Acceptance Criteria:**
- Given a logged-in teacher owns a class with progress data, when they open portfolio list, then each student card shows name, tier, average score, progress status, top repeated mistake and latest activity.
- Given a student has no grade/progress/analytics data, when the teacher opens detail, then the page shows a stable empty state and does not display misleading risk conclusions.
- Given repeated `StudentAnalytics` rows exist for one student, when detail loads, then repeated mistake cards aggregate counts and show recent evidence without modifying analytics records.
- Given a teacher requests a class they do not own, when calling either portfolio endpoint, then the API returns 403 and no student data leaks.
- Given a student belongs to another class, when requested under the current class route, then the API returns 404.
- Given existing gradebook and AI grading flows run after this feature is added, when scores/errors are saved, then behavior remains unchanged and portfolio reflects data on refresh.
- Given frontend routes are protected, when an unauthenticated user opens portfolio URL, then they are redirected to login by existing `ProtectedRoute`.
- Given official `GradeEntry` and fallback `StudentProgress` both exist, when portfolio computes averages, then official gradebook score takes precedence and response exposes `score_source`.

### Review Findings

- [x] [Review][Patch] Domain service depends on application DTO, violating clean architecture dependency direction [backend/app/domain/services/student_progress_classifier.py:3]
- [x] [Review][Patch] Malformed legacy progress `details` values can crash aggregation instead of returning conservative metrics [backend/app/application/use_cases/student_portfolio_helpers.py:51]
- [x] [Review][Patch] Portfolio hub masks class-list load failures as an empty state instead of showing a Vietnamese error state [frontend/src/pages/StudentPortfolioHubPage.tsx:55]
- [x] [Review][Patch] v1 portfolio schemas expose `grade: int` instead of constraining response grade to 1-3 [backend/app/interfaces/api/v1/schemas/student_portfolio.py:66]
- [x] [Review][Patch] Invalid URL params on student detail route leave a blank page with no user-facing error [frontend/src/pages/StudentPortfolioDetailPage.tsx:14]
- [x] [Review][Patch] API test fixture hardcodes `StudentAnalytics.teacher_id=1`, making ownership coverage brittle [backend/tests/test_student_portfolio_api.py:76]
- [x] [Review][Patch] Unused `defaultdict` import should be removed from portfolio helper module [backend/app/application/use_cases/student_portfolio_helpers.py:4]
- [x] [Review][Patch] Tests do not cover no-data detail API response or malformed legacy progress details despite spec edge cases [backend/tests/test_student_portfolio_api.py:89]

## Spec Change Log

- 2026-05-07: Implemented backend repository port, SQLAlchemy adapter, DTOs, classifier, use cases, v1 schemas/router and DI/router mounting.
- 2026-05-07: Implemented frontend TS types, portfolio API client, TanStack Query hooks, portfolio components, hub/detail pages, navigation route and GradebookPage portfolio link.
- 2026-05-07: Added backend portfolio use case/API tests and frontend service test for v1 endpoint contracts.
- 2026-05-08: Resolved BMAD review findings by fixing domain dependency direction, malformed legacy progress parsing, v1 grade schema constraint, frontend error states, brittle API fixture and missing edge-case tests.

## Design Notes

MVP should be read-first and deterministic. The feature may display “gợi ý hành động” but should compute it from transparent rules, for example: repeated `doc_de_sai` errors → suggest short word-problem reading practice; declining score trend → suggest teacher review; no data → suggest grading/importing recent worksheet first. These are draft recommendations for teacher decision-making, not autonomous AI evaluation.

Avoid changing the current `get_student_spotlight` endpoint immediately because chatbot may depend on it. Instead, either reuse internal helper logic after extracting safe aggregation functions or leave spotlight intact and build the v1 portfolio use cases beside it. This reduces regression risk.

Risk review: highest risks are cross-teacher leakage, inconsistent score calculation, and frontend over-fetching. Mitigation: ownership in use case, documented score precedence, and summary-only class endpoint.

Pre-final review amendments added repository boundary, score precedence, `data_quality`/`score_source`, grade-boundary tests, router mounting, and large-class summary behavior.

## Verification

**Commands:**
- `backend\venv\Scripts\python.exe -m pytest -q backend/tests/test_student_portfolio_use_cases.py backend/tests/test_student_portfolio_api.py` -- result: 6 passed, 15 warnings.
- `backend\venv\Scripts\python.exe -m pytest -q backend/tests/test_ai_analytics_service.py backend/tests/test_ai_analytics_submit.py` -- result: 8 passed, 15 warnings.
- `npm.cmd --prefix frontend run test` -- result: 4 test files passed, 9 tests passed.
- `npm.cmd --prefix frontend run build` -- result: TypeScript build and Vite production build passed; Vite emitted existing large chunk warning.
- `npm.cmd --prefix frontend run lint` -- result: 0 errors, 6 pre-existing react-hooks warnings outside new portfolio files.
- `backend\venv\Scripts\python.exe -m pytest -q backend/tests` -- result: 66 passed, 4 failed, 15 warnings. Failures are outside portfolio scope: three `test_ai_ocr_service.py` failures patch removed/missing `OllamaService.vision_recognize`, and one `test_dashboard_stats.py` parent-role registration failure conflicts with teacher-only constraints.

**Manual checks:**
- Open portfolio hub as teacher; verify loading, empty, populated and error states in Vietnamese.
- Open detail for a student with recent grading data; verify charts match gradebook/analytics source data.
- Save a new grade through existing gradebook/AI grading flow; refresh portfolio; verify new result appears without breaking gradebook.
- Confirm no new UI exposes parent/student accounts or auto-publishes AI output.
