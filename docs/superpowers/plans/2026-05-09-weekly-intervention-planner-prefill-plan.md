# Weekly Intervention Planner Prefill Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the reviewed Weekly Intervention Planner patch findings, change intervention week logic to the school week Monday through Saturday, and connect each intervention group to the Differentiation Wizard through a prefilled “Tạo worksheet” flow that auto-links the created worksheet back to the group.

**Architecture:** Keep the intervention planner rule-based and teacher-controlled. Backend remains FastAPI + SQLAlchemy ORM with teacher ownership checks in `InterventionService`; frontend routes worksheet creation through the existing `DifferentiationWizard` so AI content stays draft and teacher-reviewed before save. Avoid adding new AI models, new roles, parent/student flows, or auto-publish behavior.

**Tech Stack:** FastAPI, SQLAlchemy ORM, Pydantic v2, Pytest, React 19, TypeScript, React Router, TanStack Query, Vitest, Tailwind/Shadcn UI.

---

## Domain Decisions

- Intervention week means school week: Monday 00:00 through Sunday 00:00 exclusive, effectively using Monday through Saturday activity and excluding Sunday.
- Sunday data must not be included in intervention clustering or low-score fallback.
- Each intervention group must show a teacher-friendly `Tạo worksheet` action, not a manual `worksheet_id` input.
- `Tạo worksheet` opens `/differentiation-wizard` with route state prefilled from the intervention group.
- Differentiation Wizard must still require teacher review/edit before saving the worksheet.
- When the worksheet is saved, the newly created `worksheet.id` must be linked to the originating intervention group through the existing `/api/intervention/groups/{group_id}/link-worksheet` endpoint.
- Default post-save destination should be `/worksheets/{worksheet.id}/edit` so teacher reviews the draft worksheet immediately.

---

## File Responsibility Map

### Backend

- `backend/app/models/intervention_plan.py`
  - Update worksheet foreign key to `ondelete="SET NULL"`.
  - Keep plan/group persistence model minimal.

- `backend/app/schemas/intervention.py`
  - Add strict validation for `suggested_exercises` tier keys and counts.
  - Add positive integer validation for `worksheet_id`.

- `backend/app/services/intervention_service.py`
  - Add school-week Monday-through-Saturday bounds.
  - Exclude Sunday from analytics and score queries.
  - Handle concurrent `generate_plan` requests safely.
  - Filter analytics to the latest two worksheet attempts inside the school week when available.
  - Harden worksheet link rules: same class, same grade, teacher-owned, differentiation type, draft status.

- `backend/tests/test_intervention_service.py`
  - Add failing tests for school-week Sunday exclusion, latest-two worksheet filtering, and concurrent regenerate behavior where feasible.
  - Update existing tests if group categorization changes because of tighter week/window logic.

- `backend/tests/test_intervention_router.py`
  - Add API tests for invalid suggested exercises, invalid worksheet link, and valid auto-link target.

### Frontend

- `frontend/src/types/interventionPrefill.ts`
  - Create shared type and helpers for route-state payload passed from planner to Differentiation Wizard.

- `frontend/src/pages/InterventionPlannerPage.tsx`
  - Replace manual worksheet ID input with `Tạo worksheet` button.
  - Navigate to Differentiation Wizard with typed prefill state.
  - Fix stale plan display when selected week has no plan.
  - Extract backend `detail` error messages from Axios errors.

- `frontend/src/components/differentiation/DifferentiationWizard.tsx`
  - Read prefill state from `useLocation`.
  - Auto-select class and lock grade based on route state.
  - Seed wizard objective/strategy metadata from group context.
  - Auto-link saved worksheet to intervention group before navigating to editor.

- `frontend/src/components/differentiation/DiffStep1Config.tsx`
  - Preserve selected topic when locked grade changes only if the topic still belongs to the locked grade.
  - Display intervention context banner when prefill source is intervention.

- `frontend/src/components/differentiation/DiffStep2Assignment.tsx`
  - Add targeted-student mode so only group students are assigned initially.
  - Keep teacher able to move students between tiers before content generation.

- `frontend/src/components/differentiation/DiffStep3Content.tsx`
  - Include intervention objective in generation payload.
  - Generate only tiers with at least one assigned student or at least one requested exercise count.

- `frontend/src/services/interventionApi.ts`
  - Reuse existing `linkWorksheet` method.

- `frontend/src/services/interventionApi.test.ts`
  - Add API tests for endpoint payloads affected by auto-link flow.

- `frontend/src/components/differentiation/*.test.tsx`
  - Add or extend tests for prefill state behavior if test infrastructure supports component rendering.

---

## Phase 1: Backend Patch Findings

### Task 1: Make linked worksheet deletion safe

**Files:**
- Modify: `backend/app/models/intervention_plan.py:57`
- Test: `backend/tests/test_intervention_router.py`

- [ ] **Step 1: Write the failing API test**

Add this test to `backend/tests/test_intervention_router.py`:

```python
def test_linked_worksheet_can_be_deleted_without_breaking_group(client: TestClient, db_session):
    headers = _register_and_login_teacher(client, 30)
    class_id = _create_class(client, headers)

    teacher = db_session.query(User).filter(User.email == "intervention.teacher30@example.com").first()
    worksheet_id = _seed_intervention_rows(db_session, class_id, teacher.id)

    now = datetime.utcnow().isocalendar()
    generate_response = client.post(
        "/api/intervention/generate",
        headers=headers,
        json={"class_id": class_id, "week_number": now.week, "year": now.year},
    )
    assert generate_response.status_code == 200

    group_id = generate_response.json()["groups"][0]["id"]
    link_response = client.put(
        f"/api/intervention/groups/{group_id}/link-worksheet",
        headers=headers,
        json={"worksheet_id": worksheet_id},
    )
    assert link_response.status_code == 200

    delete_response = client.delete(f"/api/worksheets/{worksheet_id}", headers=headers)
    assert delete_response.status_code in (200, 204)

    db_session.expire_all()
    group_response = client.get(f"/api/intervention/{generate_response.json()['id']}", headers=headers)
    assert group_response.status_code == 200
    assert group_response.json()["groups"][0]["worksheet_id"] is None
```

- [ ] **Step 2: Run the test and verify it fails**

Run from repo root:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_intervention_router.py::test_linked_worksheet_can_be_deleted_without_breaking_group -v
```

Expected: FAIL because the `worksheet_id` foreign key does not use `ON DELETE SET NULL`.

- [ ] **Step 3: Update the model foreign key**

Change `backend/app/models/intervention_plan.py`:

```python
worksheet_id = Column(Integer, ForeignKey("worksheets.id", ondelete="SET NULL"), nullable=True)
```

- [ ] **Step 4: Run the focused test**

Run:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_intervention_router.py::test_linked_worksheet_can_be_deleted_without_breaking_group -v
```

Expected: PASS.

- [ ] **Step 5: Run backend intervention tests**

Run:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_intervention_service.py backend/tests/test_intervention_router.py -q
```

Expected: all tests PASS.

---

### Task 2: Validate intervention group update payloads

**Files:**
- Modify: `backend/app/schemas/intervention.py:19-27`
- Test: `backend/tests/test_intervention_router.py`

- [ ] **Step 1: Write failing validation tests**

Add these tests to `backend/tests/test_intervention_router.py`:

```python
def test_update_group_rejects_unknown_exercise_tier(client: TestClient, db_session):
    headers = _register_and_login_teacher(client, 31)
    class_id = _create_class(client, headers)
    teacher = db_session.query(User).filter(User.email == "intervention.teacher31@example.com").first()
    _seed_intervention_rows(db_session, class_id, teacher.id)

    now = datetime.utcnow().isocalendar()
    response = client.post(
        "/api/intervention/generate",
        headers=headers,
        json={"class_id": class_id, "week_number": now.week, "year": now.year},
    )
    assert response.status_code == 200
    group_id = response.json()["groups"][0]["id"]

    update_response = client.put(
        f"/api/intervention/groups/{group_id}",
        headers=headers,
        json={"suggested_exercises": {"random": 3}},
    )
    assert update_response.status_code == 422


def test_update_group_rejects_negative_exercise_count(client: TestClient, db_session):
    headers = _register_and_login_teacher(client, 32)
    class_id = _create_class(client, headers)
    teacher = db_session.query(User).filter(User.email == "intervention.teacher32@example.com").first()
    _seed_intervention_rows(db_session, class_id, teacher.id)

    now = datetime.utcnow().isocalendar()
    response = client.post(
        "/api/intervention/generate",
        headers=headers,
        json={"class_id": class_id, "week_number": now.week, "year": now.year},
    )
    assert response.status_code == 200
    group_id = response.json()["groups"][0]["id"]

    update_response = client.put(
        f"/api/intervention/groups/{group_id}",
        headers=headers,
        json={"suggested_exercises": {"foundation": -1}},
    )
    assert update_response.status_code == 422
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_intervention_router.py::test_update_group_rejects_unknown_exercise_tier backend/tests/test_intervention_router.py::test_update_group_rejects_negative_exercise_count -v
```

Expected: FAIL because current schema accepts invalid tiers/counts.

- [ ] **Step 3: Add schema validators**

Update `backend/app/schemas/intervention.py`:

```python
from pydantic import BaseModel, Field, field_validator

ALLOWED_EXERCISE_TIERS = {"foundation", "standard", "extension", "advanced"}

class UpdateGroupRequest(BaseModel):
    suggested_activity: str | None = None
    suggested_exercises: dict[str, int] | None = None
    duration_minutes: int | None = Field(default=None, ge=5, le=120)
    notes: str | None = None

    @field_validator("suggested_exercises")
    @classmethod
    def validate_suggested_exercises(cls, value: dict[str, int] | None) -> dict[str, int] | None:
        if value is None:
            return value
        unknown_tiers = set(value) - ALLOWED_EXERCISE_TIERS
        if unknown_tiers:
            raise ValueError("Mức bài tập không hợp lệ")
        for count in value.values():
            if count < 0 or count > 50:
                raise ValueError("Số lượng bài tập phải từ 0 đến 50")
        return value

class LinkWorksheetRequest(BaseModel):
    worksheet_id: int = Field(..., ge=1)
```

- [ ] **Step 4: Run validation tests**

Run:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_intervention_router.py::test_update_group_rejects_unknown_exercise_tier backend/tests/test_intervention_router.py::test_update_group_rejects_negative_exercise_count -v
```

Expected: PASS.

---

### Task 3: Harden worksheet linking rules

**Files:**
- Modify: `backend/app/services/intervention_service.py:200-219`
- Test: `backend/tests/test_intervention_router.py`

- [ ] **Step 1: Write failing link guard tests**

Add these tests to `backend/tests/test_intervention_router.py`:

```python
def test_link_worksheet_rejects_wrong_class_worksheet(client: TestClient, db_session):
    headers = _register_and_login_teacher(client, 33)
    class_id = _create_class(client, headers, name="2A")
    other_class_id = _create_class(client, headers, name="2B")
    teacher = db_session.query(User).filter(User.email == "intervention.teacher33@example.com").first()
    _seed_intervention_rows(db_session, class_id, teacher.id)
    other_worksheet_id = _seed_intervention_rows(db_session, other_class_id, teacher.id)

    now = datetime.utcnow().isocalendar()
    response = client.post(
        "/api/intervention/generate",
        headers=headers,
        json={"class_id": class_id, "week_number": now.week, "year": now.year},
    )
    assert response.status_code == 200
    group_id = response.json()["groups"][0]["id"]

    link_response = client.put(
        f"/api/intervention/groups/{group_id}/link-worksheet",
        headers=headers,
        json={"worksheet_id": other_worksheet_id},
    )
    assert link_response.status_code == 400


def test_link_worksheet_rejects_non_draft_or_wrong_grade(client: TestClient, db_session):
    headers = _register_and_login_teacher(client, 34)
    class_id = _create_class(client, headers, name="2A", grade=2)
    teacher = db_session.query(User).filter(User.email == "intervention.teacher34@example.com").first()
    worksheet_id = _seed_intervention_rows(db_session, class_id, teacher.id)

    worksheet = db_session.query(Worksheet).filter(Worksheet.id == worksheet_id).first()
    worksheet.status = "published"
    db_session.commit()

    now = datetime.utcnow().isocalendar()
    response = client.post(
        "/api/intervention/generate",
        headers=headers,
        json={"class_id": class_id, "week_number": now.week, "year": now.year},
    )
    assert response.status_code == 200
    group_id = response.json()["groups"][0]["id"]

    link_response = client.put(
        f"/api/intervention/groups/{group_id}/link-worksheet",
        headers=headers,
        json={"worksheet_id": worksheet_id},
    )
    assert link_response.status_code == 400
```

- [ ] **Step 2: Run tests and verify at least published worksheet guard fails**

Run:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_intervention_router.py::test_link_worksheet_rejects_wrong_class_worksheet backend/tests/test_intervention_router.py::test_link_worksheet_rejects_non_draft_or_wrong_grade -v
```

Expected: the published worksheet case FAILS because current service accepts it.

- [ ] **Step 3: Update service guard**

Update imports in `backend/app/services/intervention_service.py`:

```python
from app.models.worksheet import Worksheet, WorksheetStatus, WorksheetType
```

Update `link_worksheet_to_group` query:

```python
worksheet = (
    self.db.query(Worksheet)
    .join(MathClass, Worksheet.class_id == MathClass.id)
    .filter(
        Worksheet.id == worksheet_id,
        Worksheet.class_id == group.plan.class_id,
        Worksheet.grade == group.plan.math_class.grade,
        Worksheet.worksheet_type == WorksheetType.DIFFERENTIATION.value,
        Worksheet.status == WorksheetStatus.DRAFT.value,
        MathClass.teacher_id == teacher_id,
    )
    .first()
)
if worksheet is None:
    raise HTTPException(status_code=400, detail="Chỉ có thể gắn bài tập phân hóa dạng nháp thuộc đúng lớp")
```

- [ ] **Step 4: Ensure `_get_owned_group` eager-loads class**

Update `_get_owned_group` options:

```python
.options(joinedload(InterventionGroup.plan).joinedload(InterventionPlan.math_class))
```

- [ ] **Step 5: Run link guard tests**

Run:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_intervention_router.py::test_link_worksheet_rejects_wrong_class_worksheet backend/tests/test_intervention_router.py::test_link_worksheet_rejects_non_draft_or_wrong_grade -v
```

Expected: PASS.

---

### Task 4: Handle concurrent plan generation safely

**Files:**
- Modify: `backend/app/services/intervention_service.py:89-143`
- Test: `backend/tests/test_intervention_service.py`

- [ ] **Step 1: Write failing service test for existing unique conflict path**

Add this test to `backend/tests/test_intervention_service.py`:

```python
def test_generate_plan_recovers_when_plan_already_exists_after_flush_failure(db_session, monkeypatch):
    teacher, math_class, _students, _worksheets = _seed_class_with_students(db_session, student_count=2)
    week, year = _iso_week_year_now()

    service = InterventionService(db_session)
    first_plan = service.generate_plan(math_class.id, week, year, teacher.id)

    original_flush = db_session.flush

    def raise_once_flush(*args, **kwargs):
        db_session.flush = original_flush
        from sqlalchemy.exc import IntegrityError
        raise IntegrityError("insert", {}, Exception("unique constraint"))

    db_session.flush = raise_once_flush
    second_plan = service.generate_plan(math_class.id, week, year, teacher.id)

    assert second_plan.id == first_plan.id
```

- [ ] **Step 2: Run test and verify it fails**

Run:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_intervention_service.py::test_generate_plan_recovers_when_plan_already_exists_after_flush_failure -v
```

Expected: FAIL until `IntegrityError` is handled. If this monkeypatch conflicts with SQLAlchemy session state, replace with an integration-level two-session race test before implementation.

- [ ] **Step 3: Add `IntegrityError` handling**

Update imports:

```python
from sqlalchemy.exc import IntegrityError
```

Add helper method to `InterventionService`:

```python
def _find_plan_for_week(self, class_id: int, week_number: int, year: int) -> InterventionPlan | None:
    return (
        self.db.query(InterventionPlan)
        .filter(
            InterventionPlan.class_id == class_id,
            InterventionPlan.week_number == week_number,
            InterventionPlan.year == year,
        )
        .first()
    )
```

Replace the inline first query in `generate_plan` with:

```python
plan = self._find_plan_for_week(class_id, week_number, year)
```

Wrap the new-plan flush:

```python
try:
    self.db.flush()
except IntegrityError:
    self.db.rollback()
    plan = self._find_plan_for_week(class_id, week_number, year)
    if plan is None:
        raise HTTPException(status_code=409, detail="Không thể tạo kế hoạch do trùng dữ liệu tuần")
```

- [ ] **Step 4: Run focused test**

Run:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_intervention_service.py::test_generate_plan_recovers_when_plan_already_exists_after_flush_failure -v
```

Expected: PASS or replaced by a stable two-session equivalent.

---

## Phase 2: School Week Logic Monday Through Saturday

### Task 5: Replace ISO full-week data window with school-week data window

**Files:**
- Modify: `backend/app/services/intervention_service.py:91`, `backend/app/services/intervention_service.py:502-508`
- Test: `backend/tests/test_intervention_service.py`

- [ ] **Step 1: Write Sunday exclusion test**

Add this test to `backend/tests/test_intervention_service.py`:

```python
def test_generate_plan_excludes_sunday_records_from_school_week(db_session):
    teacher, math_class, students, worksheets = _seed_class_with_students(db_session, student_count=2)
    monday = datetime.fromisocalendar(2026, 19, 1)
    sunday = datetime.fromisocalendar(2026, 19, 7)

    for student in students:
        db_session.add(
            StudentAnalytics(
                class_id=math_class.id,
                teacher_id=teacher.id,
                student_id=student.id,
                worksheet_id=worksheets[0].id,
                error_type="tinh_sai",
                count=2,
                created_at=sunday,
            )
        )
    db_session.commit()

    service = InterventionService(db_session)
    plan = service.generate_plan(math_class.id, 19, 2026, teacher.id)
    payload = service.serialize_plan(plan)

    assert payload["groups"] == []
```

- [ ] **Step 2: Run test and verify it fails**

Run:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_intervention_service.py::test_generate_plan_excludes_sunday_records_from_school_week -v
```

Expected: FAIL because current week bounds include Sunday.

- [ ] **Step 3: Rename and update week helper**

Change method name and logic in `backend/app/services/intervention_service.py`:

```python
def _get_school_week_bounds(self, year: int, week_number: int) -> tuple[datetime, datetime]:
    try:
        start = datetime.fromisocalendar(year, week_number, 1)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Tuần không hợp lệ theo lịch ISO") from exc
    end = datetime.fromisocalendar(year, week_number, 7)
    return start, end
```

Update `generate_plan`:

```python
week_start, week_end = self._get_school_week_bounds(year, week_number)
```

This makes query condition `< week_end` exclude Sunday 00:00 and the rest of Sunday.

- [ ] **Step 4: Run Sunday exclusion test**

Run:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_intervention_service.py::test_generate_plan_excludes_sunday_records_from_school_week -v
```

Expected: PASS.

---

### Task 6: Filter analytics to latest two worksheets in the school week

**Files:**
- Modify: `backend/app/services/intervention_service.py:288-381`
- Test: `backend/tests/test_intervention_service.py`

- [ ] **Step 1: Write failing latest-two test**

Add this test to `backend/tests/test_intervention_service.py`:

```python
def test_generate_plan_uses_latest_two_worksheets_for_error_clustering(db_session):
    teacher, math_class, students, worksheets = _seed_class_with_students(db_session, student_count=2)
    topic = db_session.query(MathTopic).first()

    old_worksheet = Worksheet(
        title="Bài cũ",
        class_id=math_class.id,
        topic_id=topic.id,
        grade=2,
        worksheet_type=WorksheetType.DIFFERENTIATION.value,
        objective="Bài cũ",
        created_at=datetime.fromisocalendar(2026, 19, 1),
    )
    mid_worksheet = Worksheet(
        title="Bài giữa",
        class_id=math_class.id,
        topic_id=topic.id,
        grade=2,
        worksheet_type=WorksheetType.DIFFERENTIATION.value,
        objective="Bài giữa",
        created_at=datetime.fromisocalendar(2026, 19, 3),
    )
    latest_worksheet = Worksheet(
        title="Bài mới",
        class_id=math_class.id,
        topic_id=topic.id,
        grade=2,
        worksheet_type=WorksheetType.DIFFERENTIATION.value,
        objective="Bài mới",
        created_at=datetime.fromisocalendar(2026, 19, 5),
    )
    db_session.add_all([old_worksheet, mid_worksheet, latest_worksheet])
    db_session.flush()

    for student in students:
        db_session.add(
            StudentAnalytics(
                class_id=math_class.id,
                teacher_id=teacher.id,
                student_id=student.id,
                worksheet_id=old_worksheet.id,
                error_type="doc_de_sai",
                count=2,
                created_at=datetime.fromisocalendar(2026, 19, 1),
            )
        )
        db_session.add(
            StudentAnalytics(
                class_id=math_class.id,
                teacher_id=teacher.id,
                student_id=student.id,
                worksheet_id=latest_worksheet.id,
                error_type="tinh_sai",
                count=2,
                created_at=datetime.fromisocalendar(2026, 19, 5),
            )
        )
    db_session.commit()

    service = InterventionService(db_session)
    plan = service.generate_plan(math_class.id, 19, 2026, teacher.id)
    payload = service.serialize_plan(plan)

    error_types = {group["error_type"] for group in payload["groups"]}
    assert "tinh_sai" in error_types
    assert "doc_de_sai" not in error_types
```

- [ ] **Step 2: Run test and verify it fails**

Run:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_intervention_service.py::test_generate_plan_uses_latest_two_worksheets_for_error_clustering -v
```

Expected: FAIL because current query includes all analytics rows in the week.

- [ ] **Step 3: Add helper for latest worksheet ids**

Add method to `InterventionService`:

```python
def _get_latest_school_week_worksheet_ids(self, class_id: int, week_start: datetime, week_end: datetime) -> list[int]:
    rows = (
        self.db.query(Worksheet.id)
        .filter(
            Worksheet.class_id == class_id,
            Worksheet.created_at >= week_start,
            Worksheet.created_at < week_end,
        )
        .order_by(Worksheet.created_at.desc(), Worksheet.id.desc())
        .limit(2)
        .all()
    )
    return [int(row[0]) for row in rows]
```

- [ ] **Step 4: Apply helper in `_build_groups`**

Before `analytics_rows` query, add:

```python
latest_worksheet_ids = self._get_latest_school_week_worksheet_ids(class_id, week_start, week_end)
```

Build analytics filters:

```python
analytics_filters = [
    StudentAnalytics.class_id == class_id,
    StudentAnalytics.teacher_id == teacher_id,
    StudentAnalytics.student_id.isnot(None),
    StudentAnalytics.created_at >= week_start,
    StudentAnalytics.created_at < week_end,
]
if latest_worksheet_ids:
    analytics_filters.append(StudentAnalytics.worksheet_id.in_(latest_worksheet_ids))
```

Use:

```python
.filter(*analytics_filters)
```

- [ ] **Step 5: Run latest-two test**

Run:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_intervention_service.py::test_generate_plan_uses_latest_two_worksheets_for_error_clustering -v
```

Expected: PASS.

---

## Phase 3: Frontend Patch Findings

### Task 7: Prevent stale plan display when selected week has no plan

**Files:**
- Modify: `frontend/src/pages/InterventionPlannerPage.tsx:190-205`, `frontend/src/pages/InterventionPlannerPage.tsx:403-462`
- Test: Manual UI verification, optional component test if existing app test harness supports route/query provider rendering.

- [ ] **Step 1: Change active plan selection behavior**

Replace the effect body with:

```ts
useEffect(() => {
    if (!plansQuery.data || plansQuery.data.length === 0) {
        setActivePlanId(null);
        return;
    }

    const currentWeekPlan = plansQuery.data.find((item) => item.week_number === week && item.year === year);
    setActivePlanId(currentWeekPlan?.id ?? null);
}, [plansQuery.data, week, year]);
```

- [ ] **Step 2: Add selected-week empty state**

Render this when `selectedClass && !currentPlan && !planQuery.isLoading && !plansQuery.isLoading`:

```tsx
<Card>
    <CardContent className="space-y-4 p-8 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
        <p className="font-semibold text-slate-700">Tuần học này chưa có kế hoạch can thiệp.</p>
        <p className="text-sm text-slate-500">Bấm “Tạo kế hoạch” để hệ thống gom nhóm học sinh từ dữ liệu Thứ 2 đến Thứ 7.</p>
    </CardContent>
</Card>
```

- [ ] **Step 3: Run frontend tests and build**

Run from `frontend`:

```powershell
npm.cmd run test
npm.cmd run build
```

Expected: both PASS.

---

### Task 8: Show backend Vietnamese error details in frontend

**Files:**
- Modify: `frontend/src/pages/InterventionPlannerPage.tsx`
- Test: `frontend/src/services/interventionApi.test.ts` remains unchanged; manual browser check for error messages.

- [ ] **Step 1: Add Axios import**

At the top of `InterventionPlannerPage.tsx` add:

```ts
import axios from 'axios';
```

- [ ] **Step 2: Add helper near `statusBadge`**

Add:

```ts
function getErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        if (typeof detail === 'string') {
            return detail;
        }
        if (Array.isArray(detail) && detail.length > 0 && typeof detail[0]?.msg === 'string') {
            return detail[0].msg;
        }
        return fallback;
    }
    return error instanceof Error ? error.message : fallback;
}
```

- [ ] **Step 3: Replace mutation error handlers**

Use:

```ts
setErrorMessage(getErrorMessage(error, 'Không thể tạo kế hoạch tuần.'));
setErrorMessage(getErrorMessage(error, 'Không thể duyệt kế hoạch.'));
setErrorMessage(getErrorMessage(error, 'Không thể đánh dấu hoàn thành.'));
setErrorMessage(getErrorMessage(error, 'Không thể gắn worksheet vào nhóm.'));
```

- [ ] **Step 4: Run lint and build**

Run from `frontend`:

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: lint has 0 errors; build PASS.

---

## Phase 4: “Tạo worksheet” Prefill Flow

### Task 9: Add typed route-state contract for intervention prefill

**Files:**
- Create: `frontend/src/types/interventionPrefill.ts`
- Test: `frontend/src/services/interventionApi.test.ts` not needed for this type-only file.

- [ ] **Step 1: Create type file**

Create `frontend/src/types/interventionPrefill.ts`:

```ts
export type InterventionPrefillSource = 'intervention';

export interface InterventionWorksheetPrefillState {
    source: InterventionPrefillSource;
    planId: number;
    groupId: number;
    classId: number;
    grade: 1 | 2 | 3;
    errorType: string;
    groupName: string;
    suggestedActivity: string;
    suggestedExercises: Record<string, number>;
    studentIds: number[];
    studentNames: string[];
}

export function isInterventionWorksheetPrefillState(value: unknown): value is InterventionWorksheetPrefillState {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const candidate = value as Partial<InterventionWorksheetPrefillState>;
    return candidate.source === 'intervention'
        && typeof candidate.planId === 'number'
        && typeof candidate.groupId === 'number'
        && typeof candidate.classId === 'number'
        && (candidate.grade === 1 || candidate.grade === 2 || candidate.grade === 3)
        && typeof candidate.errorType === 'string'
        && typeof candidate.groupName === 'string'
        && typeof candidate.suggestedActivity === 'string'
        && typeof candidate.suggestedExercises === 'object'
        && Array.isArray(candidate.studentIds)
        && Array.isArray(candidate.studentNames);
}
```

- [ ] **Step 2: Run TypeScript build**

Run from `frontend`:

```powershell
npm.cmd run build
```

Expected: PASS.

---

### Task 10: Replace manual worksheet ID input with “Tạo worksheet” navigation

**Files:**
- Modify: `frontend/src/pages/InterventionPlannerPage.tsx:64-163`, `frontend/src/pages/InterventionPlannerPage.tsx:451-457`

- [ ] **Step 1: Update imports**

Change import from React Router:

```ts
import { Link, useNavigate } from 'react-router-dom';
```

Import type:

```ts
import type { InterventionWorksheetPrefillState } from '@/types/interventionPrefill';
```

- [ ] **Step 2: Change `GroupCard` props**

Replace `onLinkWorksheet` and `linking` props with:

```ts
onCreateWorksheet: (group: InterventionGroup) => void;
creatingWorksheet: boolean;
```

- [ ] **Step 3: Remove manual input state and UI**

Remove:

```ts
const [worksheetIdInput, setWorksheetIdInput] = useState('');
```

Replace worksheet action block with:

```tsx
<div className="space-y-2">
    <Button
        type="button"
        variant="outline"
        className="h-9"
        disabled={creatingWorksheet}
        onClick={() => onCreateWorksheet(group)}
    >
        <FilePlus2 className="mr-2 h-4 w-4" />
        Tạo worksheet
    </Button>

    {group.worksheet_id ? (
        <p className="text-xs font-semibold text-emerald-700">Đã gắn worksheet ID: {group.worksheet_id}</p>
    ) : (
        <p className="text-xs text-slate-500">Chưa có worksheet luyện tập cho nhóm này.</p>
    )}
</div>
```

- [ ] **Step 4: Add navigation handler in page component**

Inside `InterventionPlannerPage` add:

```ts
const navigate = useNavigate();
```

Add handler:

```ts
const handleCreateWorksheet = (group: InterventionGroup) => {
    if (!currentPlan) {
        return;
    }

    const state: InterventionWorksheetPrefillState = {
        source: 'intervention',
        planId: currentPlan.id,
        groupId: group.id,
        classId: currentPlan.class_id,
        grade: currentPlan.grade,
        errorType: group.error_type,
        groupName: group.group_name,
        suggestedActivity: group.suggested_activity,
        suggestedExercises: group.suggested_exercises,
        studentIds: group.student_ids,
        studentNames: group.student_names,
    };

    navigate('/differentiation-wizard', { state });
};
```

- [ ] **Step 5: Pass handler into `GroupCard`**

Use:

```tsx
<GroupCard
    key={group.id}
    group={group}
    creatingWorksheet={false}
    onCreateWorksheet={handleCreateWorksheet}
/>
```

- [ ] **Step 6: Remove unused link worksheet mutation from planner**

Delete `linkWorksheetMutation` from `InterventionPlannerPage.tsx` after the wizard owns auto-linking.

- [ ] **Step 7: Run frontend build**

Run:

```powershell
npm.cmd run build
```

Expected: PASS.

---

### Task 11: Read prefill state in Differentiation Wizard

**Files:**
- Modify: `frontend/src/components/differentiation/DifferentiationWizard.tsx`

- [ ] **Step 1: Update imports**

Change React Router import:

```ts
import { useLocation, useNavigate } from 'react-router-dom';
```

Add imports:

```ts
import interventionApi from '../../services/interventionApi';
import { isInterventionWorksheetPrefillState } from '../../types/interventionPrefill';
```

- [ ] **Step 2: Read route state**

Inside component:

```ts
const location = useLocation();
const interventionPrefill = isInterventionWorksheetPrefillState(location.state) ? location.state : null;
```

- [ ] **Step 3: Initialize wizard data from prefill**

Change initial `wizardData` state:

```ts
const [wizardData, setWizardData] = useState({
    topicId: '',
    strategy: interventionPrefill
        ? `Can thiệp: ${interventionPrefill.groupName} - ${interventionPrefill.suggestedActivity}`
        : 'tiered',
    grade: interventionPrefill?.grade ?? 1,
    assignments: null as Record<string, string[]> | null,
});
```

- [ ] **Step 4: Auto-select class from prefill after classes load**

Update class-loading effect success branch:

```ts
setClasses(data);
if (interventionPrefill) {
    const targetClass = data.find((item) => item.id === interventionPrefill.classId);
    if (targetClass) {
        setSelectedClassId(targetClass.id);
    }
} else if (data.length > 0) {
    setSelectedClassId(data[0].id);
}
```

- [ ] **Step 5: Add prefilled assignment builder**

Add helper inside file:

```ts
function buildInterventionAssignments(studentIds: number[]): Record<string, string[]> {
    return {
        foundation: studentIds.map(String),
        standard: [],
        extension: [],
        advanced: [],
    };
}
```

Use `foundation` by default because intervention groups identify students needing support. Teachers can move students in Step 2 before generating content.

- [ ] **Step 6: Seed assignments when prefill exists**

Add effect:

```ts
useEffect(() => {
    if (!interventionPrefill || wizardData.assignments) {
        return;
    }
    setWizardData((current) => ({
        ...current,
        grade: interventionPrefill.grade,
        assignments: buildInterventionAssignments(interventionPrefill.studentIds),
    }));
}, [interventionPrefill, wizardData.assignments]);
```

- [ ] **Step 7: Add intervention context banner**

Above class selector, render:

```tsx
{interventionPrefill && (
    <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-800">
        <p className="font-bold">Đang tạo worksheet từ kế hoạch can thiệp</p>
        <p>{interventionPrefill.groupName} · {interventionPrefill.studentNames.join(', ')}</p>
    </div>
)}
```

- [ ] **Step 8: Run frontend build**

Run:

```powershell
npm.cmd run build
```

Expected: PASS.

---

### Task 12: Auto-link worksheet after wizard save

**Files:**
- Modify: `frontend/src/components/differentiation/DifferentiationWizard.tsx:80-152`

- [ ] **Step 1: Use existing API services for worksheet/exercise creation**

Import:

```ts
import { exerciseApi, worksheetApi } from '../../services/worksheetApi';
```

- [ ] **Step 2: Replace direct `fetch` worksheet creation**

Inside `handleSave`, replace worksheet POST block with:

```ts
const topic = topics.find(t => t.id.toString() === wizardData.topicId);
const worksheet = await worksheetApi.createWorksheet(selectedClassId, {
    title: interventionPrefill
        ? `Can thiệp: ${interventionPrefill.groupName}`
        : `Phân hóa: ${topic?.topic_name || 'Bài tập mới'}`,
    topic_id: parseInt(wizardData.topicId) || null,
    grade: wizardData.grade,
    worksheet_type: 'differentiation',
    objective: interventionPrefill
        ? `Kế hoạch can thiệp: ${interventionPrefill.suggestedActivity}`
        : `Chiến lược: ${wizardData.strategy}`,
});
```

- [ ] **Step 3: Replace exercise creation fetch with API service**

Inside exercise loop use:

```ts
await exerciseApi.createExercise(worksheet.id, {
    question: q.question,
    answer: q.answer || '',
    hint: q.hint || '',
    difficulty_tier: tier as 'foundation' | 'standard' | 'extension' | 'advanced',
    order_index: orderIndex++,
});
```

- [ ] **Step 4: Auto-link worksheet to intervention group**

Before navigate:

```ts
if (interventionPrefill) {
    await interventionApi.linkWorksheet(interventionPrefill.groupId, worksheet.id);
}
```

Then keep:

```ts
navigate(`/worksheets/${worksheet.id}/edit`);
```

- [ ] **Step 5: Improve save error message**

In catch block, keep Vietnamese fallback:

```ts
setSaveError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lưu');
```

- [ ] **Step 6: Run frontend tests and build**

Run:

```powershell
npm.cmd run test
npm.cmd run build
```

Expected: PASS.

---

### Task 13: Generate only relevant tiers in intervention flow

**Files:**
- Modify: `frontend/src/components/differentiation/DiffStep3Content.tsx:33-47`

- [ ] **Step 1: Add helper to select tiers**

Inside `DiffStep3Content` before `generateContent`:

```ts
const activeTiers = DIFF_TIERS
    .map((tier) => tier.id)
    .filter((tierId) => (assignments[tierId]?.length || 0) > 0);
```

- [ ] **Step 2: Use active tiers in AI request**

Change request body:

```ts
body: JSON.stringify({
    topic_id: parseInt(data.topicId),
    grade: data.grade || 1,
    objective: `Chiến lược: ${data.strategy}`,
    tiers: activeTiers.length > 0 ? activeTiers : DIFF_TIERS.map(t => t.id),
})
```

- [ ] **Step 3: Update effect dependency**

Change:

```ts
}, [hasGenerated]);
```

to:

```ts
}, [hasGenerated, activeTiers.join('|')]);
```

If lint complains because `generateContent` is missing dependency, wrap `generateContent` with `useCallback` using dependencies `activeTiers`, `data.grade`, `data.strategy`, and `data.topicId`.

- [ ] **Step 4: Run lint and build**

Run:

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected: lint has 0 errors; build PASS. Existing warnings outside touched files may remain if already present.

---

## Phase 5: Regression, Review, and Quality Gates

### Task 14: Backend regression suite

**Files:**
- No code changes.

- [ ] **Step 1: Run intervention tests**

Run:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_intervention_service.py backend/tests/test_intervention_router.py -v
```

Expected: all intervention tests PASS.

- [ ] **Step 2: Run nearby regression tests**

Run:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_student_portfolio_use_cases.py backend/tests/test_student_portfolio_api.py backend/tests/test_classes_worksheets.py -q
```

Expected: all tests PASS.

- [ ] **Step 3: Confirm no new backend failures in auth/class/worksheet flows**

Run:

```powershell
$env:DEBUG='false'; backend\venv\Scripts\python.exe -m pytest backend/tests/test_auth.py backend/tests/test_classes_worksheets.py -q
```

Expected: all tests PASS.

---

### Task 15: Frontend regression suite

**Files:**
- No code changes.

- [ ] **Step 1: Run frontend tests**

Run from `frontend`:

```powershell
npm.cmd run test
```

Expected: all Vitest tests PASS.

- [ ] **Step 2: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: 0 errors. Existing warnings outside changed files may remain, but no new warning should be introduced in `InterventionPlannerPage.tsx`, `DifferentiationWizard.tsx`, `DiffStep2Assignment.tsx`, or `DiffStep3Content.tsx`.

- [ ] **Step 3: Run production build**

Run:

```powershell
npm.cmd run build
```

Expected: TypeScript build and Vite build PASS.

---

### Task 16: Manual end-to-end verification

**Files:**
- No code changes.

- [ ] **Step 1: Start backend and frontend using existing project run workflow**

Use the repository’s normal development commands from README or current project workflow.

- [ ] **Step 2: Verify Monday-Saturday intervention week**

Manual scenario:

1. Login as teacher.
2. Create/select a grade 1-3 class.
3. Seed or create analytics records on Monday-Saturday.
4. Create a separate Sunday analytics record.
5. Generate intervention plan for that week.
6. Confirm Sunday-only errors do not create a group.

Expected: plan uses school-week data Monday through Saturday only.

- [ ] **Step 3: Verify planner no longer shows stale plan**

Manual scenario:

1. Select a week with an existing plan.
2. Move to a week with no plan.

Expected: page shows “Tuần học này chưa có kế hoạch can thiệp” and does not display old plan cards.

- [ ] **Step 4: Verify Tạo worksheet flow**

Manual scenario:

1. Open `/intervention-planner`.
2. Generate a draft plan with at least one group.
3. Click `Tạo worksheet` on one group.
4. Confirm Differentiation Wizard opens with class selected and intervention banner visible.
5. Confirm Step 2 contains targeted students in foundation tier by default.
6. Move a student to another tier.
7. Continue to Step 3.
8. Let AI generate draft content.
9. Save worksheet.
10. Confirm app navigates to `/worksheets/{id}/edit`.
11. Return to planner and reload the plan.

Expected: the group shows `worksheet_id` linked to the created worksheet.

- [ ] **Step 5: Verify teacher ownership safety**

Manual scenario:

1. Login as Teacher A and create intervention plan.
2. Login as Teacher B.
3. Try to access or link Teacher A’s group/plan via API.

Expected: backend returns 403.

---

## Plan Self-Review

### Spec coverage check

- Teacher-only access is preserved through existing `get_current_teacher` dependencies and service ownership checks.
- Grade 1-3 constraint is preserved in `_get_owned_class` and response schemas.
- AI output remains draft because worksheet creation still ends in worksheet editor and does not publish.
- No new AI model is introduced; existing `/api/ai/generate-differentiation` remains the generation path.
- Rule-based grouping remains backend-only in `InterventionService`.
- School week Monday-Saturday is explicitly implemented by `_get_school_week_bounds` and tested with Sunday exclusion.
- “Tạo worksheet” prefill is implemented through route state into `DifferentiationWizard` and auto-link after save.
- Patch findings from BMAD review are included: FK `SET NULL`, payload validation, worksheet link guards, stale plan UI, Axios detail errors, latest-two worksheet filtering, race handling.

### Placeholder scan

- This plan contains no `TBD`, no “implement later”, and no unspecified file paths.
- Each code-changing task names exact files and provides concrete snippets.
- Each validation/test task includes exact commands and expected results.

### Type consistency check

- `InterventionWorksheetPrefillState.groupId` maps to `interventionApi.linkWorksheet(groupId, worksheet.id)`.
- `InterventionWorksheetPrefillState.classId` maps to `selectedClassId` in `DifferentiationWizard`.
- `studentIds` are numbers in planner state and converted to string IDs for `DiffStep2Assignment`.
- `grade` is constrained to `1 | 2 | 3` in frontend prefill type and backend response schema.
- `suggestedExercises` remains `Record<string, number>` and is validated backend-side against allowed tiers.

### Risk review before execution

- Highest regression risk is modifying `DifferentiationWizard`, because it is a shared flow. Mitigation: all intervention behavior must be gated by `interventionPrefill`; normal wizard path must keep existing defaults.
- Backend FK `SET NULL` may require a real migration if production database does not auto-create schema from SQLAlchemy metadata. If this project uses Alembic in deployment, add a migration before release.
- `DiffStep3Content` currently generates content on mount. Prefill must not skip teacher review of Step 1 and Step 2 unless product explicitly requests fast-forward behavior. This plan keeps normal step progression.
- Route state disappears on browser refresh. If refresh-resilient prefill is required later, add query params with `planId/groupId` and fetch group detail from backend. This plan avoids that extra backend endpoint to keep MVP small.

---

## Recommended Commit Sequence

1. `fix(intervention): harden backend plan and worksheet linking guards`
2. `fix(intervention): use monday-saturday school week for grouping`
3. `fix(intervention-ui): improve planner empty and error states`
4. `feat(intervention): open differentiation wizard with group prefill`
5. `feat(intervention): auto-link created worksheet to intervention group`
6. `test(intervention): add regression coverage for planner worksheet flow`
