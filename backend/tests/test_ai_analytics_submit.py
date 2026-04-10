from fastapi.testclient import TestClient

from app.models.student_analytics import StudentAnalytics


def _register(client: TestClient, *, email: str, password: str, role: str, full_name: str):
    return client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
            "role": role,
        },
    )


def _login(client: TestClient, *, email: str, password: str) -> str:
    response = client.post(
        "/api/auth/login",
        data={"username": email, "password": password},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _create_teacher_and_class(client: TestClient, *, email: str, index: int) -> tuple[str, int]:
    password = "secret123"
    register_response = _register(
        client,
        email=email,
        password=password,
        role="teacher",
        full_name=f"Teacher {index}",
    )
    assert register_response.status_code == 201

    token = _login(client, email=email, password=password)

    class_response = client.post(
        "/api/classes",
        headers=_auth_headers(token),
        json={"class_name": f"{index}A", "grade": 1},
    )
    assert class_response.status_code == 201
    return token, class_response.json()["id"]


def test_submit_analytics_tags_persists_records(client: TestClient, db_session):
    token, class_id = _create_teacher_and_class(client, email="teacher.analytics@example.com", index=1)

    response = client.post(
        "/api/v1/ai/analytics/submit",
        headers=_auth_headers(token),
        json={
            "class_id": class_id,
            "source": "teacher_review",
            "error_tags": [
                {"error_type": "phep_cong", "count": 2, "question_id": "Q1", "ocr_confidence": 92.5},
                {"error_type": "dien_ket_qua", "count": 1, "question_id": "Q2", "ocr_confidence": 88.0},
            ],
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["records_created"] == 2

    stored = db_session.query(StudentAnalytics).filter(StudentAnalytics.class_id == class_id).all()
    assert len(stored) == 2
    assert sorted(record.error_type for record in stored) == ["dien_ket_qua", "phep_cong"]


def test_submit_analytics_tags_rejects_other_teacher_class(client: TestClient):
    owner_token, class_id = _create_teacher_and_class(client, email="owner.teacher@example.com", index=2)
    _ = owner_token

    outsider_password = "secret123"
    register_outsider = _register(
        client,
        email="outsider.teacher@example.com",
        password=outsider_password,
        role="teacher",
        full_name="Outsider Teacher",
    )
    assert register_outsider.status_code == 201
    outsider_token = _login(client, email="outsider.teacher@example.com", password=outsider_password)

    response = client.post(
        "/api/v1/ai/analytics/submit",
        headers=_auth_headers(outsider_token),
        json={
            "class_id": class_id,
            "source": "teacher_review",
            "error_tags": [{"error_type": "phep_chia", "count": 1}],
        },
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Ban khong co quyen cap nhat thong ke lop nay"


def test_submit_analytics_tags_rejects_unreviewed_source(client: TestClient):
    token, class_id = _create_teacher_and_class(client, email="teacher.review.lock@example.com", index=3)

    response = client.post(
        "/api/v1/ai/analytics/submit",
        headers=_auth_headers(token),
        json={
            "class_id": class_id,
            "source": "ai_grading",
            "error_tags": [{"error_type": "phep_tru", "count": 1}],
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Chi chap nhan du lieu da duoc giao vien duyet"
