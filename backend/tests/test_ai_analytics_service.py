from __future__ import annotations

from app.models.math_class import MathClass
from app.models.math_topic import MathTopic
from app.models.student import Student
from app.models.student_analytics import StudentAnalytics
from app.models.student_progress import StudentProgress
from app.models.user import User, UserRole
from app.models.worksheet import Worksheet, WorksheetType
from app.services.ai.analytics_service import AnalyticsService


def _seed_teacher_class_student_worksheet(db_session):
    teacher = User(
        email="analytics.service.teacher@example.com",
        password_hash="hashed",
        full_name="Teacher Analytics",
        role=UserRole.TEACHER.value,
    )
    db_session.add(teacher)
    db_session.flush()

    math_class = MathClass(class_name="1A", grade=1, teacher_id=teacher.id)
    db_session.add(math_class)
    db_session.flush()

    topic = MathTopic(topic_name="Phép cộng trong phạm vi 10", category="Số học", grade=1)
    db_session.add(topic)
    db_session.flush()

    student = Student(full_name="Nguyen Van A", class_id=math_class.id)
    db_session.add(student)
    db_session.flush()

    worksheet = Worksheet(
        title="WS1",
        class_id=math_class.id,
        topic_id=topic.id,
        grade=1,
        worksheet_type=WorksheetType.CPA.value,
        objective="Luyen tap",
    )
    db_session.add(worksheet)
    db_session.flush()

    return teacher, math_class, student, worksheet


def test_analyze_class_errors_tolerates_legacy_malformed_details(db_session):
    teacher, math_class, student, worksheet = _seed_teacher_class_student_worksheet(db_session)

    db_session.add_all(
        [
            StudentProgress(
                student_id=student.id,
                worksheet_id=worksheet.id,
                details={
                    "results": [
                        {
                            "score": "7",
                            "max_score": "10",
                            "is_correct": False,
                            "question_type": "tinh_sai",
                        }
                    ]
                },
            ),
            StudentProgress(
                student_id=student.id,
                worksheet_id=worksheet.id,
                details='{"results": [{"score": 8, "max_score": 10, "is_correct": true, "question_type": "phep_cong"}]}',
            ),
            StudentProgress(
                student_id=student.id,
                worksheet_id=worksheet.id,
                details={"bad_shape": ["abc"]},
                correct_count=None,
                total_count=None,
            ),
            StudentAnalytics(
                class_id=math_class.id,
                teacher_id=teacher.id,
                student_id=student.id,
                worksheet_id=worksheet.id,
                source="teacher_review",
                error_type="thieu_don_vi",
                count=2,
            ),
        ]
    )
    db_session.commit()

    service = AnalyticsService(db_session)

    result = service.analyze_class_errors(math_class.id)

    assert "weak_topics" in result
    assert "student_performance" in result
    assert "common_mistakes" in result

    # Ensure no crash and mistakes are aggregated from both progress.details and analytics rows.
    mistake_map = {item["type"]: item["count"] for item in result["common_mistakes"]}
    assert mistake_map.get("tinh_sai", 0) >= 1
    assert mistake_map.get("thieu_don_vi", 0) >= 2


def test_analyze_class_errors_uses_summary_counts_when_details_missing(db_session):
    _teacher, math_class, student, worksheet = _seed_teacher_class_student_worksheet(db_session)

    db_session.add(
        StudentProgress(
            student_id=student.id,
            worksheet_id=worksheet.id,
            details=None,
            correct_count=6,
            total_count=10,
        )
    )
    db_session.commit()

    service = AnalyticsService(db_session)
    result = service.analyze_class_errors(math_class.id)

    assert len(result["student_performance"]) == 1
    assert result["student_performance"][0]["average_score"] == 6.0
