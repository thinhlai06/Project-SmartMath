from __future__ import annotations

from datetime import datetime

from fastapi import HTTPException
from app.models.grade_entry import GradeEntry
from app.models.intervention_plan import InterventionPlan
from app.models.math_class import MathClass
from app.models.math_topic import MathTopic
from app.models.student import Student
from app.models.student_analytics import StudentAnalytics
from app.models.user import User, UserRole
from app.models.worksheet import Worksheet, WorksheetType
from app.services.intervention_service import InterventionService
from sqlalchemy.exc import IntegrityError


def _iso_week_year_now() -> tuple[int, int]:
    now = datetime.utcnow()
    iso = now.isocalendar()
    return iso.week, iso.year


def _seed_class_with_students(db_session, student_count: int = 4):
    teacher = User(
        email="intervention.teacher@example.com",
        password_hash="hashed",
        full_name="Intervention Teacher",
        role=UserRole.TEACHER.value,
    )
    db_session.add(teacher)
    db_session.flush()

    math_class = MathClass(class_name="2A", grade=2, teacher_id=teacher.id)
    db_session.add(math_class)
    db_session.flush()

    topic = MathTopic(topic_name="Phép cộng", category="Số học", grade=2)
    db_session.add(topic)
    db_session.flush()

    worksheets = [
        Worksheet(
            title="Bài 1",
            class_id=math_class.id,
            topic_id=topic.id,
            grade=2,
            worksheet_type=WorksheetType.DIFFERENTIATION.value,
            objective="Luyện tập",
        ),
        Worksheet(
            title="Bài 2",
            class_id=math_class.id,
            topic_id=topic.id,
            grade=2,
            worksheet_type=WorksheetType.DIFFERENTIATION.value,
            objective="Luyện tập",
        ),
    ]
    db_session.add_all(worksheets)
    db_session.flush()

    students = []
    for index in range(student_count):
        student = Student(full_name=f"Hoc sinh {index + 1}", class_id=math_class.id, tier="standard")
        students.append(student)
    db_session.add_all(students)
    db_session.commit()

    return teacher, math_class, students, worksheets


def test_generate_plan_clusters_students_with_same_error_type(db_session):
    teacher, math_class, students, worksheets = _seed_class_with_students(db_session, student_count=4)

    for student in students[:3]:
        db_session.add(
            StudentAnalytics(
                class_id=math_class.id,
                teacher_id=teacher.id,
                student_id=student.id,
                worksheet_id=worksheets[0].id,
                error_type="tinh_sai",
                count=2,
                payload={"question_text": "25 + 17", "student_answer": "32", "correct_answer": "42"},
            )
        )
    db_session.commit()

    week, year = _iso_week_year_now()
    service = InterventionService(db_session)
    plan = service.generate_plan(math_class.id, week, year, teacher.id)
    payload = service.serialize_plan(plan)

    assert len(payload["groups"]) == 1
    group = payload["groups"][0]
    assert group["error_type"] == "tinh_sai"
    assert len(group["student_ids"]) == 3


def test_generate_plan_merges_small_groups_into_khac(db_session):
    teacher, math_class, students, worksheets = _seed_class_with_students(db_session, student_count=3)

    db_session.add_all(
        [
            StudentAnalytics(
                class_id=math_class.id,
                teacher_id=teacher.id,
                student_id=students[0].id,
                worksheet_id=worksheets[0].id,
                error_type="doc_de_sai",
                count=2,
            ),
            StudentAnalytics(
                class_id=math_class.id,
                teacher_id=teacher.id,
                student_id=students[1].id,
                worksheet_id=worksheets[1].id,
                error_type="viet_sai_so",
                count=2,
            ),
        ]
    )
    db_session.commit()

    week, year = _iso_week_year_now()
    service = InterventionService(db_session)
    plan = service.generate_plan(math_class.id, week, year, teacher.id)
    payload = service.serialize_plan(plan)

    assert len(payload["groups"]) == 1
    assert payload["groups"][0]["error_type"] == "khac"
    assert len(payload["groups"][0]["student_ids"]) == 2


def test_generate_plan_limits_to_top_five_groups(db_session):
    teacher, math_class, students, worksheets = _seed_class_with_students(db_session, student_count=6)

    error_types = ["error_1", "error_2", "error_3", "error_4", "error_5", "error_6"]
    for index, error_type in enumerate(error_types):
        db_session.add_all(
            [
                StudentAnalytics(
                    class_id=math_class.id,
                    teacher_id=teacher.id,
                    student_id=students[index % len(students)].id,
                    worksheet_id=worksheets[0].id,
                    error_type=error_type,
                    count=2,
                ),
                StudentAnalytics(
                    class_id=math_class.id,
                    teacher_id=teacher.id,
                    student_id=students[(index + 1) % len(students)].id,
                    worksheet_id=worksheets[1].id,
                    error_type=error_type,
                    count=2,
                ),
            ]
        )

    db_session.commit()

    week, year = _iso_week_year_now()
    service = InterventionService(db_session)
    plan = service.generate_plan(math_class.id, week, year, teacher.id)
    payload = service.serialize_plan(plan)

    assert len(payload["groups"]) == 5


def test_generate_plan_returns_empty_groups_when_no_data(db_session):
    teacher, math_class, _students, _worksheets = _seed_class_with_students(db_session, student_count=2)

    week, year = _iso_week_year_now()
    service = InterventionService(db_session)
    plan = service.generate_plan(math_class.id, week, year, teacher.id)
    payload = service.serialize_plan(plan)

    assert payload["groups"] == []
    assert payload["total_students"] == 0


def test_generate_plan_adds_low_score_students_without_error_tags(db_session):
    teacher, math_class, students, worksheets = _seed_class_with_students(db_session, student_count=2)

    db_session.add(
        GradeEntry(
            student_id=students[0].id,
            worksheet_id=worksheets[0].id,
            score=4.0,
            updated_at=datetime.utcnow(),
        )
    )
    db_session.commit()

    week, year = _iso_week_year_now()
    service = InterventionService(db_session)
    plan = service.generate_plan(math_class.id, week, year, teacher.id)
    payload = service.serialize_plan(plan)

    assert len(payload["groups"]) == 1
    assert payload["groups"][0]["error_type"] == "khac"
    assert payload["groups"][0]["student_ids"] == [students[0].id]


def test_generate_plan_returns_conflict_when_insert_hits_unique_race(db_session, monkeypatch):
    teacher, math_class, _students, _worksheets = _seed_class_with_students(db_session, student_count=2)
    week, year = _iso_week_year_now()

    service = InterventionService(db_session)
    original_flush = db_session.flush

    def raise_for_intervention_plan(objects=None):
        if any(isinstance(item, InterventionPlan) for item in db_session.new):
            raise IntegrityError("insert", {}, Exception("unique constraint"))
        return original_flush(objects)

    monkeypatch.setattr(db_session, "flush", raise_for_intervention_plan)

    try:
        service.generate_plan(math_class.id, week, year, teacher.id)
    except HTTPException as exc:
        assert exc.status_code == 409
        assert exc.detail == "Không thể tạo kế hoạch do trùng dữ liệu tuần"
    else:
        raise AssertionError("Expected HTTPException for concurrent plan insert conflict")


def test_generate_plan_excludes_sunday_records_from_school_week(db_session):
    teacher, math_class, students, worksheets = _seed_class_with_students(db_session, student_count=2)
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


def test_generate_plan_uses_latest_two_worksheets_for_error_clustering(db_session):
    teacher, math_class, students, seed_worksheets = _seed_class_with_students(db_session, student_count=2)
    topic = db_session.query(MathTopic).first()

    for worksheet in seed_worksheets:
        worksheet.created_at = datetime.fromisocalendar(2026, 18, 1)

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
