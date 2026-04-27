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


def _create_student(client: TestClient, *, token: str, class_id: int, name: str) -> int:
    response = client.post(
        f"/api/classes/{class_id}/students",
        headers=_auth_headers(token),
        json={
            "full_name": name,
            "dob": "2018-01-15",
            "parent_name": "Parent",
            "parent_phone": "0909000111",
            "tier": "standard",
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


def _create_worksheet(client: TestClient, *, token: str, class_id: int, grade: int = 1) -> int:
    response = client.post(
        f"/api/classes/{class_id}/worksheets",
        headers=_auth_headers(token),
        json={
            "title": "Worksheet analytics",
            "grade": grade,
            "worksheet_type": "cpa",
            "objective": "Luyen tap",
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


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


def test_submit_analytics_tags_persists_enriched_fields(client: TestClient, db_session):
    token, class_id = _create_teacher_and_class(client, email="teacher.enriched.analytics@example.com", index=4)
    student_id = _create_student(client, token=token, class_id=class_id, name="Nguyen Van A")
    worksheet_id = _create_worksheet(client, token=token, class_id=class_id)

    response = client.post(
        "/api/v1/ai/analytics/submit",
        headers=_auth_headers(token),
        json={
            "class_id": class_id,
            "student_id": student_id,
            "worksheet_id": worksheet_id,
            "source": "teacher_review",
            "error_tags": [
                {
                    "error_type": "thieu_don_vi",
                    "count": 1,
                    "question_id": "Q1",
                    "ocr_confidence": 77.5,
                    "error_detail": "Thiếu đơn vị cm",
                    "student_answer": "5",
                    "correct_answer": "5 cm",
                    "question_text": "Độ dài đoạn thẳng là bao nhiêu?",
                }
            ],
        },
    )

    assert response.status_code == 200

    record = (
        db_session.query(StudentAnalytics)
        .filter(StudentAnalytics.class_id == class_id)
        .order_by(StudentAnalytics.id.desc())
        .first()
    )
    assert record is not None
    assert record.student_id == student_id
    assert record.worksheet_id == worksheet_id
    assert record.error_type == "thieu_don_vi"
    assert record.payload["error_detail"] == "Thiếu đơn vị cm"
    assert record.payload["student_answer"] == "5"
    assert record.payload["correct_answer"] == "5 cm"
    assert record.payload["question_text"] == "Độ dài đoạn thẳng là bao nhiêu?"


def test_student_error_crud_endpoints(client: TestClient):
    token, class_id = _create_teacher_and_class(client, email="teacher.error.crud@example.com", index=5)
    student_id = _create_student(client, token=token, class_id=class_id, name="Le Thi B")
    worksheet_id = _create_worksheet(client, token=token, class_id=class_id)

    submit_response = client.post(
        "/api/v1/ai/analytics/submit",
        headers=_auth_headers(token),
        json={
            "class_id": class_id,
            "student_id": student_id,
            "worksheet_id": worksheet_id,
            "source": "teacher_review",
            "error_tags": [
                {
                    "error_type": "tinh_sai",
                    "count": 1,
                    "question_id": "Q1",
                    "error_detail": "Nhầm kết quả cộng",
                    "student_answer": "7",
                    "correct_answer": "8",
                    "question_text": "5 + 3 = ?",
                }
            ],
        },
    )
    assert submit_response.status_code == 200

    list_response = client.get(
        f"/api/ai/analytics/{class_id}/student-errors",
        headers=_auth_headers(token),
    )
    assert list_response.status_code == 200
    payload = list_response.json()
    assert payload["total_count"] == 1
    assert payload["errors"][0]["student_name"] == "Le Thi B"
    record_id = payload["errors"][0]["id"]

    filtered = client.get(
        f"/api/ai/analytics/{class_id}/student-errors?student_id={student_id}",
        headers=_auth_headers(token),
    )
    assert filtered.status_code == 200
    assert filtered.json()["total_count"] == 1

    update_response = client.put(
        f"/api/ai/analytics/errors/{record_id}",
        headers=_auth_headers(token),
        json={"error_type": "thieu_don_vi", "error_detail": "Thiếu đơn vị mét"},
    )
    assert update_response.status_code == 200

    after_update = client.get(
        f"/api/ai/analytics/{class_id}/student-errors",
        headers=_auth_headers(token),
    )
    assert after_update.json()["errors"][0]["error_type"] == "thieu_don_vi"
    assert after_update.json()["errors"][0]["error_detail"] == "Thiếu đơn vị mét"

    delete_response = client.delete(
        f"/api/ai/analytics/errors/{record_id}",
        headers=_auth_headers(token),
    )
    assert delete_response.status_code == 200

    after_delete = client.get(
        f"/api/ai/analytics/{class_id}/student-errors",
        headers=_auth_headers(token),
    )
    assert after_delete.status_code == 200
    assert after_delete.json()["total_count"] == 0


def test_student_error_endpoints_enforce_teacher_ownership(client: TestClient):
    owner_token, class_id = _create_teacher_and_class(client, email="owner.errors@example.com", index=6)
    student_id = _create_student(client, token=owner_token, class_id=class_id, name="Pham Van C")
    worksheet_id = _create_worksheet(client, token=owner_token, class_id=class_id)

    submit_response = client.post(
        "/api/v1/ai/analytics/submit",
        headers=_auth_headers(owner_token),
        json={
            "class_id": class_id,
            "student_id": student_id,
            "worksheet_id": worksheet_id,
            "source": "teacher_review",
            "error_tags": [{"error_type": "tinh_sai", "count": 1}],
        },
    )
    assert submit_response.status_code == 200

    owner_records = client.get(
        f"/api/ai/analytics/{class_id}/student-errors",
        headers=_auth_headers(owner_token),
    )
    assert owner_records.status_code == 200
    record_id = owner_records.json()["errors"][0]["id"]

    outsider_password = "secret123"
    register_outsider = _register(
        client,
        email="outsider.errors@example.com",
        password=outsider_password,
        role="teacher",
        full_name="Outsider Errors",
    )
    assert register_outsider.status_code == 201
    outsider_token = _login(client, email="outsider.errors@example.com", password=outsider_password)

    forbidden_list = client.get(
        f"/api/ai/analytics/{class_id}/student-errors",
        headers=_auth_headers(outsider_token),
    )
    assert forbidden_list.status_code == 403

    forbidden_update = client.put(
        f"/api/ai/analytics/errors/{record_id}",
        headers=_auth_headers(outsider_token),
        json={"error_type": "khac"},
    )
    assert forbidden_update.status_code == 404

    forbidden_delete = client.delete(
        f"/api/ai/analytics/errors/{record_id}",
        headers=_auth_headers(outsider_token),
    )
    assert forbidden_delete.status_code == 404
