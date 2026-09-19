import sys
import os
import time
import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_uc05_and_uc06():
    print("\n==================================================")
    print("RUNNING API INTEGRATION TESTS FOR UC05 & UC06")
    print("==================================================\n")

    # 1. Register test user & login
    test_email = f"task_test_uc0506_{int(time.time())}@example.com"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": "Password123!",
        "full_name": "Tester Calendar Pomodoro"
    })
    assert reg_res.status_code == 201, f"Register failed: {reg_res.text}"
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"[PASS] Auth User Created & Logged in (User: {test_email})")

    # 2. Create Task 1 for today
    today = datetime.date.today()
    today_str = today.isoformat()
    task1_payload = {
        "title": "Học Lập trình FastAPI UC05",
        "description": "Lịch làm việc và Pomodoro",
        "scheduled_date": today_str,
        "start_time": "08:00:00",
        "end_time": "09:00:00",
        "target_pomodoro": 1
    }
    t1_res = client.post("/api/v1/tasks", json=task1_payload, headers=headers)
    assert t1_res.status_code == 201, f"Create task failed: {t1_res.text}"
    task1_id = t1_res.json()["id"]
    print(f"[PASS] Task 1 Created for Today (ID: {task1_id})")

    # 3. UC05: Get Weekly Calendar
    cal_res = client.get("/api/v1/calendar/weekly", headers=headers)
    assert cal_res.status_code == 200, f"Get weekly calendar failed: {cal_res.text}"
    cal_data = cal_res.json()
    assert len(cal_data["days"]) == 7
    # Verify Task 1 exists in the list
    found_task = False
    for day in cal_data["days"]:
        if day["date"] == today_str:
            for t in day["tasks"]:
                if t["id"] == task1_id:
                    found_task = True
    assert found_task, "Task 1 not found in Weekly Calendar"
    print("[PASS] UC05 Weekly Calendar 7 Days Query OK")

    # 4. UC05: Drag & Drop update scheduled date and time
    tomorrow = today + datetime.timedelta(days=1)
    tomorrow_str = tomorrow.isoformat()
    drag_payload = {
        "scheduled_date": tomorrow_str,
        "start_time": "10:00:00",
        "end_time": "11:30:00"
    }
    drag_res = client.patch(f"/api/v1/tasks/{task1_id}/drag-drop", json=drag_payload, headers=headers)
    assert drag_res.status_code == 200, f"Drag drop failed: {drag_res.text}"
    drag_data = drag_res.json()
    assert drag_data["scheduled_date"] == tomorrow_str
    assert drag_data["start_time"] == "10:00:00"
    print("[PASS] UC05 Drag & Drop Fast Update OK")

    # Move task back to today for Pomodoro test
    client.patch(f"/api/v1/tasks/{task1_id}/drag-drop", json={
        "scheduled_date": today_str,
        "start_time": "08:00:00",
        "end_time": "09:00:00"
    }, headers=headers)

    # 5. UC06: Start Pomodoro Session
    pomo_start_res = client.post("/api/v1/pomodoro/start", json={
        "task_id": task1_id,
        "duration_minutes": 25
    }, headers=headers)
    assert pomo_start_res.status_code == 201, f"Pomodoro start failed: {pomo_start_res.text}"
    pomo_session = pomo_start_res.json()
    session1_id = pomo_session["id"]
    assert pomo_session["status"] == "IN_PROGRESS"

    # Check task status auto changed to IN_PROGRESS
    t1_check = client.get(f"/api/v1/tasks/{task1_id}", headers=headers).json()
    assert t1_check["status"] == "IN_PROGRESS"
    print(f"[PASS] UC06 Start Pomodoro Session OK (Session ID: {session1_id})")

    # 6. UC06: Complete Pomodoro Session & Verify Streak Sync
    pomo_comp_res = client.post(f"/api/v1/pomodoro/{session1_id}/complete", headers=headers)
    assert pomo_comp_res.status_code == 200, f"Pomodoro complete failed: {pomo_comp_res.text}"
    comp_data = pomo_comp_res.json()
    assert comp_data["session"]["status"] == "COMPLETED"
    assert comp_data["task_status"] == "COMPLETED"
    assert comp_data["completed_pomodoro"] == 1
    assert comp_data["streak_updated"] is True
    assert comp_data["current_streak"] >= 1
    print("[PASS] UC06 Complete Pomodoro Session & Auto Streak Sync OK")

    # 7. UC06: Create Task 2, Start Pomodoro & Cancel Session
    t2_res = client.post("/api/v1/tasks", json={
        "title": "Học Machine Learning UC06",
        "scheduled_date": today_str,
        "target_pomodoro": 2
    }, headers=headers)
    task2_id = t2_res.json()["id"]

    start2_res = client.post("/api/v1/pomodoro/start", json={
        "task_id": task2_id,
        "duration_minutes": 25
    }, headers=headers)
    session2_id = start2_res.json()["id"]

    cancel_res = client.post(f"/api/v1/pomodoro/{session2_id}/cancel", headers=headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "CANCELLED"
    print(f"[PASS] UC06 Cancel Pomodoro Session OK (Session ID: {session2_id})")

    # 8. UC06: Complete Task Early
    early_res = client.post(f"/api/v1/tasks/{task2_id}/complete-early", headers=headers)
    assert early_res.status_code == 200
    assert early_res.json()["status"] == "COMPLETED"
    print(f"[PASS] UC06 Complete Task Early OK (Task ID: {task2_id})")

    # Clean up tasks
    client.delete(f"/api/v1/tasks/{task1_id}", headers=headers)
    client.delete(f"/api/v1/tasks/{task2_id}", headers=headers)

    print("\n==================================================")
    print("ALL API INTEGRATION TESTS PASSED 100% SUCCESSFULLY!")
    print("==================================================\n")

if __name__ == "__main__":
    test_uc05_and_uc06()
