import sys
import os
import time

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_uc01_and_uc02():
    print("\n==================================================")
    print("RUNNING API INTEGRATION TESTS FOR UC01 & UC02")
    print("==================================================\n")

    # 1. Test Root & Health
    res = client.get("/health")
    assert res.status_code == 200
    print("[PASS] Health Check Endpoint OK")

    # 2. Test Registration (UC01)
    test_email = f"test_{int(time.time())}@example.com"
    reg_payload = {
        "email": test_email,
        "password": "Password123!",
        "full_name": "Nguyễn Văn Test"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201, f"Register failed: {res.text}"
    token_data = res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"[PASS] UC01 Register API OK (User: {test_email})")

    # 3. Test Duplicate Registration (UC01 Branch Flow E-1)
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 409
    print("[PASS] UC01 Duplicate Email Handling OK (Status 409)")

    # 4. Test Login (UC01)
    login_payload = {
        "email": test_email,
        "password": "Password123!"
    }
    res = client.post("/api/v1/auth/login", json=login_payload)
    assert res.status_code == 200
    print("[PASS] UC01 Login API OK")

    # 5. Test Get Profile (UC01)
    res = client.get("/api/v1/users/me", headers=headers)
    assert res.status_code == 200
    user_info = res.json()
    assert user_info["email"] == test_email
    print("[PASS] UC01 Get Profile API OK")

    # 6. Test Update Profile (UC01)
    res = client.put("/api/v1/users/me", json={"full_name": "Nguyễn Văn Updated"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["full_name"] == "Nguyễn Văn Updated"
    print("[PASS] UC01 Update Profile API OK")

    # 7. Test Change Password (UC01)
    res = client.put("/api/v1/users/me/password", json={"old_password": "Password123!", "new_password": "NewPassword123!"}, headers=headers)
    assert res.status_code == 200
    print("[PASS] UC01 Change Password API OK")

    # 8. Test Create Topic Block (UC02)
    topic_payload = {
        "title": "Chủ đề Test Tự Động",
        "description": "Mô tả cho chủ đề test backend",
        "color_code": "#FF5733"
    }
    res = client.post("/api/v1/topics", json=topic_payload, headers=headers)
    assert res.status_code == 201
    topic_id = res.json()["id"]
    print(f"[PASS] UC02 Create Topic Block API OK (ID: {topic_id})")

    # 9. Test Get List Topics (UC02)
    res = client.get("/api/v1/topics", headers=headers)
    assert res.status_code == 200
    topics_list = res.json()
    assert len(topics_list) >= 1
    print(f"[PASS] UC02 Get User Topics List API OK (Total Topics: {len(topics_list)})")

    # 10. Test Get Topic Detail (UC02)
    res = client.get(f"/api/v1/topics/{topic_id}", headers=headers)
    assert res.status_code == 200
    topic_detail = res.json()
    assert topic_detail["title"] == "Chủ đề Test Tự Động"
    print("[PASS] UC02 Get Topic Detail & Tasks API OK")

    # 11. Test Update Topic Block (UC02)
    res = client.put(f"/api/v1/topics/{topic_id}", json={"title": "Chủ đề Đã Đổi Tên"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["title"] == "Chủ đề Đã Đổi Tên"
    print("[PASS] UC02 Update Topic Block API OK")

    # 12. Test Delete Topic Block (UC02)
    res = client.delete(f"/api/v1/topics/{topic_id}", headers=headers)
    assert res.status_code == 200
    print("[PASS] UC02 Delete Topic Block API OK")

    print("\n==================================================")
    print("ALL API INTEGRATION TESTS PASSED 100% SUCCESSFULLY!")
    print("==================================================\n")

if __name__ == "__main__":
    test_uc01_and_uc02()
