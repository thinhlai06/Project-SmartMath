from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import HTTPException

from app.application.use_cases.get_class_student_portfolios import GetClassStudentPortfoliosUseCase
from app.application.use_cases.get_student_portfolio_detail import GetStudentPortfolioDetailUseCase
from app.domain.services.student_progress_classifier import classify_progress_status
from app.infrastructure.db.sqlalchemy.repositories.student_portfolio_repository import (
    SqlAlchemyStudentPortfolioRepository,
)
from app.models.grade_entry import GradeEntry
from app.models.math_class import MathClass
from app.models.math_topic import MathTopic
from app.models.student import Student
from app.models.student_analytics import StudentAnalytics
from app.models.student_progress import StudentProgress
from app.models.user import User, UserRole
from app.models.worksheet import Worksheet, WorksheetType


def _seed_portfolio_data(db_session):
    teacher = User(
        email="portfolio.teacher@example.com",
        password_hash="hashed",
        full_name="Teacher Portfolio",
        role=UserRole.TEACHER.value,
    )
    other_teacher = User(
        email="portfolio.other@example.com",
        password_hash="hashed",
        full_name="Other Teacher",
        role=UserRole.TEACHER.value,
    )
    db_session.add_all([teacher, other_teacher])
    db_session.flush()

    math_class = MathClass(class_name="2A", grade=2, teacher_id=teacher.id)
    other_class = MathClass(class_name="2B", grade=2, teacher_id=other_teacher.id)
    db_session.add_all([math_class, other_class])
    db_session.flush()

    topic = MathTopic(topic_name="Phép cộng có nhớ", category="Số học", grade=2)
    db_session.add(topic)
    db_session.flush()

    student = Student(full_name="Nguyen Van A", class_id=math_class.id, tier="standard")
    empty_student = Student(full_name="Tran Thi B", class_id=math_class.id, tier="foundation")
    other_student = Student(full_name="Le Van C", class_id=other_class.id, tier="standard")
    db_session.add_all([student, empty_student, other_student])
    db_session.flush()

    now = datetime.utcnow()
    worksheet_1 = Worksheet(
        title="Bài 1",
        class_id=math_class.id,
        topic_id=topic.id,
        grade=2,
        worksheet_type=WorksheetType.DIFFERENTIATION.value,
        objective="Luyện tập",
        created_at=now - timedelta(days=3),
    )
    worksheet_2 = Worksheet(
        title="Bài 2",
        class_id=math_class.id,
        topic_id=topic.id,
        grade=2,
        worksheet_type=WorksheetType.DIFFERENTIATION.value,
        objective="Luyện tập",
        created_at=now - timedelta(days=1),
    )
    db_session.add_all([worksheet_1, worksheet_2])
    db_session.flush()

    db_session.add_all(
        [
            StudentProgress(
                student_id=student.id,
                worksheet_id=worksheet_1.id,
                status="graded",
                correct_count=6,
                total_count=10,
                completed_at=now - timedelta(days=3),
                created_at=now - timedelta(days=3),
            ),
            StudentProgress(
                student_id=student.id,
                worksheet_id=worksheet_2.id,
                status="graded",
                correct_count=7,
                total_count=10,
                completed_at=now - timedelta(days=1),
                created_at=now - timedelta(days=1),
            ),
            GradeEntry(student_id=student.id, worksheet_id=worksheet_2.id, score=9.0),
            StudentAnalytics(
                class_id=math_class.id,
                teacher_id=teacher.id,
                student_id=student.id,
                worksheet_id=worksheet_1.id,
                error_type="doc_de_sai",
                count=2,
                source="teacher_review",
                payload={"error_detail": "Đọc thiếu dữ kiện", "question_text": "Có 12 quả táo..."},
                created_at=now - timedelta(days=2),
            ),
            StudentAnalytics(
                class_id=math_class.id,
                teacher_id=teacher.id,
                student_id=student.id,
                worksheet_id=worksheet_2.id,
                error_type="doc_de_sai",
                count=1,
                source="teacher_review",
                payload={"error_detail": "Nhầm yêu cầu đề bài"},
                created_at=now - timedelta(days=1),
            ),
        ]
    )
    db_session.commit()

    return teacher, other_teacher, math_class, other_class, student, empty_student, other_student


def test_classifier_keeps_no_data_neutral_and_detects_improving():
    no_data = classify_progress_status(score_percentages=[], error_count=0, class_average_score=0)
    improving = classify_progress_status(score_percentages=[55, 65, 82], error_count=1, class_average_score=6.5)

    assert no_data.status == "no_data"
    assert no_data.label == "Chưa đủ dữ liệu"
    assert improving.status == "improving"


def test_class_portfolios_use_grade_entry_precedence_and_repeated_mistakes(db_session):
    teacher, _other_teacher, math_class, _other_class, student, empty_student, _other_student = _seed_portfolio_data(db_session)
    repository = SqlAlchemyStudentPortfolioRepository(db_session)
    use_case = GetClassStudentPortfoliosUseCase(repository)

    result = use_case.execute(class_id=math_class.id, teacher_id=teacher.id)

    cards = {card.student_id: card for card in result.students}
    assert result.class_id == math_class.id
    assert cards[student.id].average_score == 7.5
    assert cards[student.id].score_source == "mixed"
    assert cards[student.id].top_repeated_mistake is not None
    assert cards[student.id].top_repeated_mistake.error_type == "doc_de_sai"
    assert cards[student.id].top_repeated_mistake.count == 3
    assert cards[empty_student.id].progress_status == "no_data"
    assert cards[empty_student.id].data_quality == ["no_learning_data"]


def test_class_portfolios_tolerate_malformed_legacy_progress_details(db_session):
    teacher, _other_teacher, math_class, _other_class, student, _empty_student, _other_student = _seed_portfolio_data(db_session)
    progress = db_session.query(StudentProgress).filter(StudentProgress.student_id == student.id).first()
    progress.details = {"results": [{"score": "khong-phai-so", "max_score": "10"}, {"score": 5, "max_score": "bad"}]}
    progress.correct_count = "bad"
    progress.total_count = "bad"
    db_session.commit()

    repository = SqlAlchemyStudentPortfolioRepository(db_session)
    use_case = GetClassStudentPortfoliosUseCase(repository)

    result = use_case.execute(class_id=math_class.id, teacher_id=teacher.id)

    cards = {card.student_id: card for card in result.students}
    assert cards[student.id].average_score == 5.8
    assert cards[student.id].score_source == "mixed"


def test_student_detail_rejects_cross_teacher_and_cross_class_access(db_session):
    teacher, other_teacher, math_class, other_class, student, _empty_student, other_student = _seed_portfolio_data(db_session)
    repository = SqlAlchemyStudentPortfolioRepository(db_session)
    use_case = GetStudentPortfolioDetailUseCase(repository)

    try:
        use_case.execute(class_id=math_class.id, student_id=student.id, teacher_id=other_teacher.id)
        assert False, "Expected forbidden access to raise"
    except HTTPException as exc:
        assert exc.status_code == 403

    try:
        use_case.execute(class_id=math_class.id, student_id=other_student.id, teacher_id=teacher.id)
        assert False, "Expected cross-class student lookup to raise"
    except HTTPException as exc:
        assert exc.status_code == 404

    detail = use_case.execute(class_id=math_class.id, student_id=student.id, teacher_id=teacher.id)
    assert detail.student_id == student.id
    assert detail.average_score == 7.5
    assert detail.score_source == "mixed"
    assert detail.repeated_mistakes[0].error_type == "doc_de_sai"
    assert detail.recommendations[0].is_draft is True
