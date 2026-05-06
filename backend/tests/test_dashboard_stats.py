from fastapi.testclient import TestClient

from app.models.student_progress import StudentProgress


def _register_and_login(client: TestClient, *, email: str, password: str, role: str, full_name: str):
    register_response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
            "role": role,
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


def test_dashboard_stats_are_teacher_scoped(client: TestClient, db_session):
    teacher_1_headers = _register_and_login(
        client,
        email="dashboard-teacher-1@example.com",
        password="secret123",
        role="teacher",
        full_name="Teacher One",
    )
    teacher_2_headers = _register_and_login(
        client,
        email="dashboard-teacher-2@example.com",
        password="secret123",
        role="teacher",
        full_name="Teacher Two",
    )

    class_1 = client.post(
        "/api/classes",
        headers=teacher_1_headers,
        json={"class_name": "1A", "grade": 1},
    )
    assert class_1.status_code == 201
    class_1_id = class_1.json()["id"]

    class_2 = client.post(
        "/api/classes",
        headers=teacher_2_headers,
        json={"class_name": "2A", "grade": 2},
    )
    assert class_2.status_code == 201
    class_2_id = class_2.json()["id"]

    student_1 = client.post(
        f"/api/classes/{class_1_id}/students",
        headers=teacher_1_headers,
        json={
            "full_name": "Nguyen Van A",
            "dob": "2018-01-15",
            "parent_name": "Tran Thi B",
            "parent_phone": "0909123456",
            "tier": "standard",
        },
    )
    assert student_1.status_code == 201
    student_1_id = student_1.json()["id"]

    student_2 = client.post(
        f"/api/classes/{class_2_id}/students",
        headers=teacher_2_headers,
        json={
            "full_name": "Le Thi B",
            "dob": "2018-02-20",
            "parent_name": "Pham Van C",
            "parent_phone": "0911222333",
            "tier": "standard",
        },
    )
    assert student_2.status_code == 201
    student_2_id = student_2.json()["id"]

    worksheet_1 = client.post(
        f"/api/classes/{class_1_id}/worksheets",
        headers=teacher_1_headers,
        json={
            "title": "Worksheet T1",
            "grade": 1,
            "worksheet_type": "differentiation",
            "objective": "Luyen tap",
        },
    )
    assert worksheet_1.status_code == 201
    worksheet_1_id = worksheet_1.json()["id"]

    worksheet_2 = client.post(
        f"/api/classes/{class_2_id}/worksheets",
        headers=teacher_2_headers,
        json={
            "title": "Worksheet T2",
            "grade": 2,
            "worksheet_type": "differentiation",
            "objective": "Luyen tap",
        },
    )
    assert worksheet_2.status_code == 201
    worksheet_2_id = worksheet_2.json()["id"]

    db_session.add_all(
        [
            StudentProgress(student_id=student_1_id, worksheet_id=worksheet_1_id, correct_count=8, total_count=10),
            StudentProgress(student_id=student_2_id, worksheet_id=worksheet_2_id, correct_count=2, total_count=5),
        ]
    )
    db_session.commit()

    teacher_1_stats = client.get("/api/dashboard/stats", headers=teacher_1_headers)
    assert teacher_1_stats.status_code == 200
    assert teacher_1_stats.json() == {
        "total_classes": 1,
        "total_students": 1,
        "total_worksheets": 1,
        "avg_score": 8.0,
    }

    teacher_2_stats = client.get("/api/dashboard/stats", headers=teacher_2_headers)
    assert teacher_2_stats.status_code == 200
    assert teacher_2_stats.json() == {
        "total_classes": 1,
        "total_students": 1,
        "total_worksheets": 1,
        "avg_score": 4.0,
    }


def test_dashboard_stats_for_parent_returns_zeroed_values(client: TestClient):
    parent_headers = _register_and_login(
        client,
        email="dashboard-parent@example.com",
        password="secret123",
        role="parent",
        full_name="Parent One",
    )

    response = client.get("/api/dashboard/stats", headers=parent_headers)
    assert response.status_code == 200
    assert response.json() == {
        "total_classes": 0,
        "total_students": 0,
        "total_worksheets": 0,
        "avg_score": None,
    }
