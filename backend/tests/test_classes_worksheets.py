from fastapi.testclient import TestClient


def _register_and_login_teacher(client: TestClient, index: int):
    email = f"teacher{index}@example.com"
    password = "secret123"

    register_response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": f"Teacher {index}",
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


def test_teacher_class_and_worksheet_ownership(client: TestClient):
    teacher_1_headers = _register_and_login_teacher(client, 1)
    teacher_2_headers = _register_and_login_teacher(client, 2)

    class_response = client.post(
        "/api/classes",
        headers=teacher_1_headers,
        json={"class_name": "3A", "grade": 3},
    )
    assert class_response.status_code == 201
    class_id = class_response.json()["id"]

    # Teacher 2 cannot access class details owned by teacher 1.
    forbidden_class = client.get(f"/api/classes/{class_id}", headers=teacher_2_headers)
    assert forbidden_class.status_code == 403

    worksheet_response = client.post(
        f"/api/classes/{class_id}/worksheets",
        headers=teacher_1_headers,
        json={
            "title": "Bai tap CPA",
            "grade": 3,
            "worksheet_type": "cpa",
            "objective": "Luyen phep chia",
        },
    )
    assert worksheet_response.status_code == 201
    worksheet_id = worksheet_response.json()["id"]

    # Teacher 2 cannot access worksheet owned by teacher 1.
    forbidden_worksheet = client.get(f"/api/worksheets/{worksheet_id}", headers=teacher_2_headers)
    assert forbidden_worksheet.status_code == 403

    # Owner can update worksheet.
    update_response = client.put(
        f"/api/worksheets/{worksheet_id}",
        headers=teacher_1_headers,
        json={"title": "Bai tap CPA cap nhat"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Bai tap CPA cap nhat"
