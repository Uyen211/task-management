import sys
import os
import time
import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_uc03_and_uc04():
    print("\n==================================================")
    print("RUNNING API INTEGRATION TESTS FOR UC03 & UC04")
    print("==================================================\n")

    # 1. Register test user & login
    test_email = f"task_test_{int(time.time())}@example.com"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": "Password123!",
        "full_name": "Tester Task CRUD"
    })
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"[PASS] Auth User Created & Logged in (User: {test_email})")

    # 2. Create Topic Block for testing
    topic_res = client.post("/api/v1/topics", json={
        "title": "Chủ đề Test Task",
        "description": "Thống kê task test",
        "color_code": "#10B981"
    }, headers=headers)
    assert topic_res.status_code == 201
    topic_id = topic_res.json()["id"]
    print(f"[PASS] Topic Block Created (ID: {topic_id})")

    # 3. UC03: Create Task 1 with Topic
    today_str = datetime.date.today().isoformat()
    task1_payload = {
        "title": "Công việc Test 1",
        "description": "Mô tả công việc test 1",
        "topic_id": topic_id,
        "scheduled_date": today_str,
        "start_time": "09:00:00",
        "end_time": "10:30:00",
        "target_pomodoro": 3
    }
    task1_res = client.post("/api/v1/tasks", json=task1_payload, headers=headers)
    assert task1_res.status_code == 201, f"Task creation failed: {task1_res.text}"
    task1_data = task1_res.json()
    task1_id = task1_data["id"]
    assert task1_data["title"] == "Công việc Test 1"
    assert task1_data["topic_title"] == "Chủ đề Test Task"
    print(f"[PASS] UC03 Create Task 1 with Topic OK (ID: {task1_id})")

    # Check topic total_tasks updated to 1
    t_check = client.get(f"/api/v1/topics/{topic_id}", headers=headers).json()
    assert t_check["total_tasks"] == 1
    print("[PASS] UC03 Auto-update Topic total_tasks OK (Count: 1)")

    # 4. UC03: Create Task 2 without Topic
    task2_payload = {
        "title": "Công việc Test 2 Tự Do",
        "scheduled_date": today_str,
        "target_pomodoro": 1
    }
    task2_res = client.post("/api/v1/tasks", json=task2_payload, headers=headers)
    assert task2_res.status_code == 201
    task2_id = task2_res.json()["id"]
    print(f"[PASS] UC03 Create Task 2 without Topic OK (ID: {task2_id})")

    # 5. UC04: Update Task 1 (Drag & Drop time change, mark COMPLETED)
    update1_payload = {
        "title": "Công việc Test 1 - Đã Sửa Tên",
        "start_time": "14:00:00",
        "end_time": "15:30:00",
        "completed_pomodoro": 3,
        "status": "COMPLETED"
    }
    up1_res = client.put(f"/api/v1/tasks/{task1_id}", json=update1_payload, headers=headers)
    assert up1_res.status_code == 200
    up1_data = up1_res.json()
    assert up1_data["title"] == "Công việc Test 1 - Đã Sửa Tên"
    assert up1_data["status"] == "COMPLETED"
    print("[PASS] UC04 Update Task 1 (Time Drag-Drop & Status COMPLETED) OK")

    # Check topic completed_tasks updated to 1
    t_check2 = client.get(f"/api/v1/topics/{topic_id}", headers=headers).json()
    assert t_check2["completed_tasks"] == 1
    print("[PASS] UC04 Auto-update Topic completed_tasks OK (Count: 1)")

    # 6. UC04: Reassign Task 2 to Topic Block
    up2_res = client.put(f"/api/v1/tasks/{task2_id}", json={"topic_id": topic_id}, headers=headers)
    assert up2_res.status_code == 200
    print("[PASS] UC04 Reassign Task 2 to Topic Block OK")

    # Check topic total_tasks updated to 2
    t_check3 = client.get(f"/api/v1/topics/{topic_id}", headers=headers).json()
    assert t_check3["total_tasks"] == 2
    print("[PASS] UC04 Auto-update Topic total_tasks OK (Count: 2)")

    # 7. UC04: List Tasks with filters
    list_res = client.get(f"/api/v1/tasks?scheduled_date={today_str}", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 2
    print("[PASS] List Tasks with Scheduled Date Filter OK")

    # 8. UC04: Delete Task 1
    del1_res = client.delete(f"/api/v1/tasks/{task1_id}", headers=headers)
    assert del1_res.status_code == 200
    print("[PASS] UC04 Delete Task 1 OK")

    # Check topic counts after deletion (total_tasks = 1, completed_tasks = 0)
    t_check4 = client.get(f"/api/v1/topics/{topic_id}", headers=headers).json()
    assert t_check4["total_tasks"] == 1
    assert t_check4["completed_tasks"] == 0
    print("[PASS] UC04 Topic Stats Updated after Task Deletion OK")

    # 9. UC04: Delete Task 2
    del2_res = client.delete(f"/api/v1/tasks/{task2_id}", headers=headers)
    assert del2_res.status_code == 200
    print("[PASS] UC04 Delete Task 2 OK")

    # 10. UC04: Delete Non-existent Task (Handling HTTP 404)
    del_fake = client.delete(f"/api/v1/tasks/{task1_id}", headers=headers)
    assert del_fake.status_code == 404
    print("[PASS] UC04 Non-existent Task Deletion Handling OK (Status 404)")

    print("\n==================================================")
    print("ALL API INTEGRATION TESTS PASSED 100% SUCCESSFULLY!")
    print("==================================================\n")

if __name__ == "__main__":
    test_uc03_and_uc04()
