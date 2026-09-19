import sys
import os
import time
import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_uc07_and_uc08():
    print("\n==================================================")
    print("RUNNING API INTEGRATION TESTS FOR UC07 & UC08")
    print("==================================================\n")

    # 1. Register test user & login
    test_email = f"task_test_uc0708_{int(time.time())}@example.com"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": "Password123!",
        "full_name": "Tester Stats Journal"
    })
    assert reg_res.status_code == 201, f"Register failed: {reg_res.text}"
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"[PASS] Auth User Created & Logged in (User: {test_email})")

    # 2. UC07: Get User Streak
    streak_res = client.get("/api/v1/stats/streak", headers=headers)
    assert streak_res.status_code == 200, f"Get streak failed: {streak_res.text}"
    streak_data = streak_res.json()
    assert "current_streak" in streak_data
    assert "longest_streak" in streak_data
    print("[PASS] UC07 Get User Streak API OK")

    # 3. UC07: Get Productivity Stats (Week & Month)
    prod_week_res = client.get("/api/v1/stats/productivity?period=week", headers=headers)
    assert prod_week_res.status_code == 200, f"Get productivity week failed: {prod_week_res.text}"
    week_data = prod_week_res.json()
    assert week_data["period"] == "week"
    assert len(week_data["daily_breakdown"]) == 7
    print("[PASS] UC07 Productivity Stats (Week) OK")

    prod_month_res = client.get("/api/v1/stats/productivity?period=month", headers=headers)
    assert prod_month_res.status_code == 200
    assert prod_month_res.json()["period"] == "month"
    print("[PASS] UC07 Productivity Stats (Month) OK")

    # 4. UC08: Get Daily Summary
    today_str = datetime.date.today().isoformat()
    summary_res = client.get(f"/api/v1/journal/daily-summary?journal_date={today_str}", headers=headers)
    assert summary_res.status_code == 200, f"Get daily summary failed: {summary_res.text}"
    summary_data = summary_res.json()
    assert summary_data["journal_date"] == today_str
    print("[PASS] UC08 Get Daily Summary API OK")

    # 5. UC08: Save & Retrieve Journal Draft (Auto-save)
    draft_payload = {
        "journal_date": today_str,
        "draft_content": "Bản nháp tự động lưu lúc 22:00..."
    }
    save_draft_res = client.put("/api/v1/journal/draft", json=draft_payload, headers=headers)
    assert save_draft_res.status_code == 200, f"Save draft failed: {save_draft_res.text}"
    assert save_draft_res.json()["draft_content"] == "Bản nháp tự động lưu lúc 22:00..."
    print("[PASS] UC08 Save Journal Draft (Auto-save) OK")

    get_draft_res = client.get(f"/api/v1/journal/draft?journal_date={today_str}", headers=headers)
    assert get_draft_res.status_code == 200
    assert get_draft_res.json()["draft_content"] == "Bản nháp tự động lưu lúc 22:00..."
    print("[PASS] UC08 Get Journal Draft OK")

    # 6. UC08: Save Official Journal Entry
    journal_payload = {
        "journal_date": today_str,
        "content_html": "<h3>Hôm nay học tập hiệu quả</h3><p>Đã làm xong backend FastAPI!</p>",
        "content_markdown": "### Hôm nay học tập hiệu quả\n\nĐã làm xong backend FastAPI!"
    }
    save_j_res = client.post("/api/v1/journal", json=journal_payload, headers=headers)
    assert save_j_res.status_code == 200, f"Save journal failed: {save_j_res.text}"
    j_data = save_j_res.json()
    assert j_data["content_markdown"] == "### Hôm nay học tập hiệu quả\n\nĐã làm xong backend FastAPI!"
    assert j_data["summary_data"] is not None
    print("[PASS] UC08 Save Official Journal Entry OK")

    # 7. UC08: Get Official Journal Entry
    get_j_res = client.get(f"/api/v1/journal?journal_date={today_str}", headers=headers)
    assert get_j_res.status_code == 200
    assert get_j_res.json()["content_html"] == "<h3>Hôm nay học tập hiệu quả</h3><p>Đã làm xong backend FastAPI!</p>"
    print("[PASS] UC08 Get Official Journal Entry OK")

    # 8. UC08: Check Draft Removed after Official Save
    check_draft_res = client.get(f"/api/v1/journal/draft?journal_date={today_str}", headers=headers)
    assert check_draft_res.status_code == 404
    print("[PASS] UC08 Auto-delete Draft after Official Save OK (Status 404)")

    print("\n==================================================")
    print("ALL API INTEGRATION TESTS PASSED 100% SUCCESSFULLY!")
    print("==================================================\n")

if __name__ == "__main__":
    test_uc07_and_uc08()
