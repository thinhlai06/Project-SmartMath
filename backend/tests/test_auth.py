from fastapi.testclient import TestClient


def _register(client: TestClient, *, email: str, password: str, role: str, full_name: str = "User Test"):
    return client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
            "role": role,
        },
    )


def _login(client: TestClient, *, email: str, password: str):
    return client.post(
        "/api/auth/login",
        data={"username": email, "password": password},
    )


def _auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"}


def test_register_login_and_get_me(client: TestClient):
    register_response = _register(
        client,
        email="teacher1@example.com",
        password="secret123",
        role="teacher",
        full_name="Teacher One",
    )
    assert register_response.status_code == 201
    assert register_response.json()["role"] == "teacher"

    login_response = _login(client, email="teacher1@example.com", password="secret123")
    assert login_response.status_code == 200

    payload = login_response.json()
    token = payload["access_token"]
    assert payload["token_type"] == "bearer"
    assert token
    assert "access_token=" in (login_response.headers.get("set-cookie") or "")

    me_response = client.get("/api/auth/me", headers=_auth_headers(token))
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == "teacher1@example.com"
    assert me_data["role"] == "teacher"


def test_register_duplicate_email_returns_400(client: TestClient):
    first = _register(
        client,
        email="duplicate@example.com",
        password="secret123",
        role="parent",
    )
    assert first.status_code == 201

    second = _register(
        client,
        email="duplicate@example.com",
        password="secret123",
        role="parent",
    )
    assert second.status_code == 400
    assert second.json()["detail"] == "Email đã được sử dụng"


def test_role_verification_parent_cannot_access_teacher_route(client: TestClient):
    register_parent = _register(
        client,
        email="parent1@example.com",
        password="secret123",
        role="parent",
        full_name="Parent One",
    )
    assert register_parent.status_code == 201

    login_parent = _login(client, email="parent1@example.com", password="secret123")
    parent_token = login_parent.json()["access_token"]

    classes_response = client.get("/api/classes", headers=_auth_headers(parent_token))
    assert classes_response.status_code == 403
    assert classes_response.json()["detail"] == "Chỉ giáo viên mới có quyền truy cập"
