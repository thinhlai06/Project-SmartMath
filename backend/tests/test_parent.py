from fastapi.testclient import TestClient

from app.models.announcement import Announcement
from app.models.math_topic import MathTopic
from app.models.parent_class_link import ParentClassLink
from app.models.student import Student
from app.models.student_progress import ProgressStatus, StudentProgress


def _register_user(client: TestClient, *, email: str, password: str, role: str, full_name: str):
    response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
            "role": role,
        },
    )
    assert response.status_code == 201


def _login_headers(client: TestClient, *, email: str, password: str):
    response = client.post("/api/auth/login", data={"username": email, "password": password})
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_parent_join_class_and_view_dashboard_stats(client: TestClient, db_session):
    _register_user(
        client,
        email="teacher-parent@example.com",
        password="secret123",
        role="teacher",
        full_name="Teacher Parent",
    )
    _register_user(
        client,
        email="parent@example.com",
        password="secret123",
        role="parent",
        full_name="Parent One",
    )

    teacher_headers = _login_headers(client, email="teacher-parent@example.com", password="secret123")
    parent_headers = _login_headers(client, email="parent@example.com", password="secret123")

    class_response = client.post(
        "/api/classes",
        headers=teacher_headers,
        json={"class_name": "2B", "grade": 2},
    )
    assert class_response.status_code == 201
    class_data = class_response.json()
    class_id = class_data["id"]
    class_code = class_data["class_code"]

    topic = MathTopic(topic_name="Phep cong", category="So hoc", grade=2)
    db_session.add(topic)
    db_session.commit()
    db_session.refresh(topic)

    worksheet_response = client.post(
        f"/api/classes/{class_id}/worksheets",
        headers=teacher_headers,
        json={
            "title": "Bai tap 2B",
            "grade": 2,
            "worksheet_type": "cpa",
            "topic_id": topic.id,
            "objective": "Luyen cong tru",
        },
    )
    assert worksheet_response.status_code == 201
    worksheet_id = worksheet_response.json()["id"]

    exercise_response = client.post(
        f"/api/worksheets/{worksheet_id}/exercises",
        headers=teacher_headers,
        json={
            "question": "2 + 3 = ?",
            "answer": "5",
            "order_index": 1,
        },
    )
    assert exercise_response.status_code == 201

    publish_response = client.post(f"/api/worksheets/{worksheet_id}/publish", headers=teacher_headers)
    assert publish_response.status_code == 200

    join_response = client.post(
        "/api/parent/join-class",
        headers=parent_headers,
        json={"class_code": class_code, "student_name": "Nguyen Van Be"},
    )
    assert join_response.status_code == 200

    link = db_session.query(ParentClassLink).filter(ParentClassLink.class_id == class_id).first()
    assert link is not None

    student = db_session.query(Student).filter(Student.id == link.student_id).first()
    assert student is not None

    db_session.add(
        StudentProgress(
            student_id=student.id,
            worksheet_id=worksheet_id,
            status=ProgressStatus.COMPLETED,
            correct_count=4,
            total_count=5,
        )
    )
    db_session.add(
        Announcement(
            class_id=class_id,
            title="Nhan xet",
            content="Con hoc tien bo rat tot",
        )
    )
    db_session.commit()

    dashboard_response = client.get(f"/api/parent/dashboard/{class_id}", headers=parent_headers)
    assert dashboard_response.status_code == 200
    dashboard = dashboard_response.json()

    assert dashboard["stats"]["completed"] == 1
    assert dashboard["stats"]["accuracy"] == 80
    assert dashboard["stats"]["avg_score"] == 8.0
    assert dashboard["teacher_comment"] == "Con hoc tien bo rat tot"
    assert len(dashboard["today_assignments"]) == 1

    worksheets_by_code = client.get(
        f"/api/parent/classes/{class_code}/worksheets",
        headers=parent_headers,
    )
    assert worksheets_by_code.status_code == 200
    worksheets = worksheets_by_code.json()
    assert worksheets[0]["topic"] == "Phep cong"
