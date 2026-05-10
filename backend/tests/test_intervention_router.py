from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient

from app.models.math_topic import MathTopic
from app.models.student import Student
from app.models.student_analytics import StudentAnalytics
from app.models.user import User
from app.models.worksheet import Worksheet, WorksheetStatus, WorksheetType


def _register_and_login_teacher(client: TestClient, index: int) -> dict[str, str]:
    email = f"intervention.teacher{index}@example.com"
    password = "secret123"

    register_response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": f"Intervention Teacher {index}",
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
    response = client.post(
        "/api/classes",
        headers=headers,
        json={"class_name": name, "grade": grade},
    )
    assert response.status_code == 201
    return response.json()["id"]


def _seed_intervention_rows(db_session, class_id: int, teacher_id: int):
    topic = MathTopic(topic_name="Phép cộng", category="Số học", grade=2)
    db_session.add(topic)
    db_session.flush()

    students = [
        Student(full_name="Nguyen Van A", class_id=class_id, tier="standard"),
        Student(full_name="Tran Thi B", class_id=class_id, tier="foundation"),
    ]
    db_session.add_all(students)
    db_session.flush()

    worksheet = Worksheet(
        title="Bài tuần",
        class_id=class_id,
        topic_id=topic.id,
        grade=2,
        worksheet_type=WorksheetType.DIFFERENTIATION.value,
        objective="Luyện tập",
    )
    db_session.add(worksheet)
    db_session.flush()

    for student in students:
        db_session.add(
            StudentAnalytics(
                class_id=class_id,
                teacher_id=teacher_id,
                student_id=student.id,
                worksheet_id=worksheet.id,
                error_type="tinh_sai",
                count=2,
                payload={"question_text": "25 + 17", "student_answer": "32", "correct_answer": "42"},
                created_at=datetime.utcnow(),
            )
        )

    db_session.commit()
    return worksheet.id


def test_intervention_requires_authentication(client: TestClient):
    response = client.post(
        "/api/intervention/generate",
        json={"class_id": 1, "week_number": 10, "year": 2026},
    )
    assert response.status_code == 401


def test_intervention_forbids_cross_teacher_access(client: TestClient, db_session):
    teacher_1_headers = _register_and_login_teacher(client, 1)
    teacher_2_headers = _register_and_login_teacher(client, 2)

    class_id = _create_class(client, teacher_1_headers, name="2B")

    response = client.post(
        "/api/intervention/generate",
        headers=teacher_2_headers,
        json={"class_id": class_id, "week_number": 15, "year": 2026},
    )
    assert response.status_code == 403


def test_intervention_router_crud_flow(client: TestClient, db_session):
    headers = _register_and_login_teacher(client, 10)
    class_id = _create_class(client, headers)

    teacher = db_session.query(User).filter(User.email == "intervention.teacher10@example.com").first()
    worksheet_id = _seed_intervention_rows(db_session, class_id, teacher.id)

    now = datetime.utcnow().isocalendar()
    week_number = now.week
    year = now.year

    generate_response = client.post(
        "/api/intervention/generate",
        headers=headers,
        json={"class_id": class_id, "week_number": week_number, "year": year},
    )
    assert generate_response.status_code == 200

    plan = generate_response.json()
    plan_id = plan["id"]
    group_id = plan["groups"][0]["id"]

    get_response = client.get(f"/api/intervention/{plan_id}", headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["status"] == "draft"

    approve_response = client.put(f"/api/intervention/{plan_id}/approve", headers=headers, json={"notes": "Tuần này ưu tiên nhóm phép cộng"})
    assert approve_response.status_code == 200
    assert approve_response.json()["status"] == "approved"

    link_response = client.put(
        f"/api/intervention/groups/{group_id}/link-worksheet",
        headers=headers,
        json={"worksheet_id": worksheet_id},
    )
    assert link_response.status_code == 200
    assert link_response.json()["worksheet_id"] == worksheet_id

    complete_response = client.put(f"/api/intervention/{plan_id}/complete", headers=headers)
    assert complete_response.status_code == 200
    assert complete_response.json()["status"] == "completed"


def test_intervention_delete_allows_only_draft(client: TestClient, db_session):
    headers = _register_and_login_teacher(client, 20)
    class_id = _create_class(client, headers)

    teacher = db_session.query(User).filter(User.email == "intervention.teacher20@example.com").first()
    _seed_intervention_rows(db_session, class_id, teacher.id)

    now = datetime.utcnow().isocalendar()
    week_number = now.week
    year = now.year

    generate_response = client.post(
        "/api/intervention/generate",
        headers=headers,
        json={"class_id": class_id, "week_number": week_number, "year": year},
    )
    assert generate_response.status_code == 200
    plan_id = generate_response.json()["id"]

    delete_draft_response = client.delete(f"/api/intervention/{plan_id}", headers=headers)
    assert delete_draft_response.status_code == 204

    regenerate_response = client.post(
        "/api/intervention/generate",
        headers=headers,
        json={"class_id": class_id, "week_number": week_number, "year": year},
    )
    assert regenerate_response.status_code == 200
    approved_plan_id = regenerate_response.json()["id"]

    approve_response = client.put(f"/api/intervention/{approved_plan_id}/approve", headers=headers, json={})
    assert approve_response.status_code == 200

    delete_approved_response = client.delete(f"/api/intervention/{approved_plan_id}", headers=headers)
    assert delete_approved_response.status_code == 400


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
    assert delete_response.status_code == 204

    db_session.expire_all()
    group_response = client.get(f"/api/intervention/{generate_response.json()['id']}", headers=headers)
    assert group_response.status_code == 200
    assert group_response.json()["groups"][0]["worksheet_id"] is None


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
    worksheet.status = WorksheetStatus.PUBLISHED.value
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
