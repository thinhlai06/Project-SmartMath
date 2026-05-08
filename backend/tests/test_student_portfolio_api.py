from __future__ import annotations

from fastapi.testclient import TestClient

from app.models.grade_entry import GradeEntry
from app.models.math_class import MathClass
from app.models.math_topic import MathTopic
from app.models.student import Student
from app.models.student_analytics import StudentAnalytics
from app.models.student_progress import StudentProgress
from app.models.user import User
from app.models.worksheet import Worksheet, WorksheetType


def _register_and_login_teacher(client: TestClient, index: int):
    email = f"portfolio.teacher{index}@example.com"
    password = "secret123"
    register_response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": f"Portfolio Teacher {index}",
            "role": "teacher",
        },
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/api/auth/login",
        data={"username": email, "password": password},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create_class(client: TestClient, headers: dict[str, str], name: str = "2A", grade: int = 2) -> int:
    response = client.post("/api/classes", headers=headers, json={"class_name": name, "grade": grade})
    assert response.status_code == 201
    return response.json()["id"]


def _seed_student_portfolio_rows(db_session, class_id: int, teacher_id: int):
    topic = MathTopic(topic_name="Phép trừ", category="Số học", grade=2)
    db_session.add(topic)
    db_session.flush()

    student = Student(full_name="Nguyen Van A", class_id=class_id, tier="standard")
    db_session.add(student)
    db_session.flush()

    worksheet = Worksheet(
        title="Bài kiểm tra 1",
        class_id=class_id,
        topic_id=topic.id,
        grade=2,
        worksheet_type=WorksheetType.DIFFERENTIATION.value,
        objective="Luyện tập",
    )
    db_session.add(worksheet)
    db_session.flush()

    db_session.add_all(
        [
            StudentProgress(
                student_id=student.id,
                worksheet_id=worksheet.id,
                status="graded",
                correct_count=5,
                total_count=10,
            ),
            GradeEntry(student_id=student.id, worksheet_id=worksheet.id, score=8.0),
            StudentAnalytics(
                class_id=class_id,
                teacher_id=teacher_id,
                student_id=student.id,
                worksheet_id=worksheet.id,
                error_type="nham_phep_tinh",
                count=2,
                source="teacher_review",
            ),
        ]
    )
    db_session.commit()
    return student.id


def _seed_student_without_learning_data(db_session, class_id: int) -> int:
    student = Student(full_name="Tran Thi B", class_id=class_id, tier="foundation")
    db_session.add(student)
    db_session.commit()
    return student.id


def test_student_portfolio_api_returns_summary_detail_and_score_source(client: TestClient, db_session):
    headers = _register_and_login_teacher(client, 1)
    class_id = _create_class(client, headers)
    teacher = db_session.query(User).filter(User.email == "portfolio.teacher1@example.com").first()
    student_id = _seed_student_portfolio_rows(db_session, class_id, teacher.id)

    summary_response = client.get(f"/api/v1/classes/{class_id}/student-portfolios", headers=headers)
    assert summary_response.status_code == 200
    summary = summary_response.json()
    assert summary["class_id"] == class_id
    assert summary["students"][0]["student_id"] == student_id
    assert summary["students"][0]["average_score"] == 8.0
    assert summary["students"][0]["score_source"] == "grade_entry"

    detail_response = client.get(f"/api/v1/classes/{class_id}/students/{student_id}/portfolio", headers=headers)
    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["student_id"] == student_id
    assert detail["score_source"] == "grade_entry"
    assert detail["repeated_mistakes"][0]["error_type"] == "nham_phep_tinh"


def test_student_portfolio_api_blocks_cross_teacher_access(client: TestClient, db_session):
    teacher_1_headers = _register_and_login_teacher(client, 10)
    teacher_2_headers = _register_and_login_teacher(client, 20)
    class_id = _create_class(client, teacher_1_headers, name="2C")
    teacher = db_session.query(User).filter(User.email == "portfolio.teacher10@example.com").first()
    student_id = _seed_student_portfolio_rows(db_session, class_id, teacher.id)

    forbidden_summary = client.get(f"/api/v1/classes/{class_id}/student-portfolios", headers=teacher_2_headers)
    assert forbidden_summary.status_code == 403

    forbidden_detail = client.get(
        f"/api/v1/classes/{class_id}/students/{student_id}/portfolio",
        headers=teacher_2_headers,
    )
    assert forbidden_detail.status_code == 403


def test_student_portfolio_api_rejects_non_grade_1_to_3_class(client: TestClient, db_session):
    headers = _register_and_login_teacher(client, 30)
    teacher = db_session.query(User).filter(User.email == "portfolio.teacher30@example.com").first()
    math_class = MathClass(class_name="4A", grade=4, teacher_id=teacher.id)
    db_session.add(math_class)
    db_session.commit()

    response = client.get(f"/api/v1/classes/{math_class.id}/student-portfolios", headers=headers)

    assert response.status_code == 400


def test_student_portfolio_api_returns_neutral_no_data_detail(client: TestClient, db_session):
    headers = _register_and_login_teacher(client, 40)
    class_id = _create_class(client, headers, name="2D")
    student_id = _seed_student_without_learning_data(db_session, class_id)

    response = client.get(f"/api/v1/classes/{class_id}/students/{student_id}/portfolio", headers=headers)

    assert response.status_code == 200
    detail = response.json()
    assert detail["student_id"] == student_id
    assert detail["progress_status"] == "no_data"
    assert detail["data_quality"] == ["no_learning_data"]
    assert detail["score_trend"] == []
