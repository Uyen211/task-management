# Kế Hoạch & Thẩm Định Kỹ Thuật Backend UC05 & UC06

Tài liệu này định nghĩa thiết kế kỹ thuật chi tiết, quy trình triển khai và Hợp đồng thẩm định (Validate Contract) cho Backend (FastAPI, SQLAlchemy, Supabase PostgreSQL) phục vụ 2 chức năng:
- **UC05: Xem, điều hướng Lịch công việc theo tuần và Kéo-Thả (Time Grid Drag & Drop)**
- **UC06: Thực hiện công việc bằng phương pháp Pomodoro**

---

## 📋 Context Envelope (Thông Tin Ngữ Cảnh)

```yaml
feature: calendar_and_pomodoro
phase: PLAN & VALIDATE
session-goal: Khóa kiến trúc và thẩm định phương án triển khai Backend cho UC05 & UC06
target-services: code/backend/app/
database-target: Supabase PostgreSQL (models: Task, PomodoroSession, UserStreak, TopicBlock, User)
test-runner: pytest | httpx.AsyncClient
validate-contract: PASS
```

---

## 🏛️ 1. Sơ Đồ Kiến Trúc & Luồng Dữ Liệu (Data Flow)

```
[ HTTP Client (React/TimeGrid UI) ]
          │
          ├───────────────────────────────────────────────────────┐
          ▼ (GET /api/v1/calendar/weekly & PATCH drag-drop)       ▼ (POST /api/v1/pomodoro/*)
[ FastAPI Calendar Router ]                             [ FastAPI Pomodoro Router ]
          │                                                       │
          ▼ (Authorization Fence & User Token Check)              ▼ (Session & Task Validation)
[ Auth Middleware ] (get_current_user)                   [ Auth Middleware ] (get_current_user)
          │                                                       │
          ▼ (Query tasks by date range / update time)             ▼ (Manage Pomodoro Sessions & Streaks)
[ Task & Calendar Service ]                              [ Pomodoro & Streak Service ]
          │                                                       │
          └───────────────────────────┬───────────────────────────┘
                                      ▼
                      [ Supabase PostgreSQL DB ]
           (Tables: tasks, pomodoro_sessions, user_streaks, topic_blocks)
```

---

## 🔧 2. Đổi Mới Kỹ Thuật Chi Tiết UC05: Lịch Công Việc Theo Tuần & Drag & Drop

### A. Pydantic Schemas (`code/backend/app/schemas/calendar.py`)

- **`TaskDragDropUpdate`**:
  - `scheduled_date`: `date` (ngày làm việc mới sau khi kéo thả).
  - `start_time`: `time | None` (giờ bắt đầu mới trên Lưới Time Grid).
  - `end_time`: `time | None` (giờ kết thúc mới).

- **`WeeklyCalendarDay`**:
  - `date`: `date`
  - `day_of_week`: `str` (Ví dụ: `"Monday"`, `"Tuesday"`,...)
  - `tasks`: `list[TaskResponse]`

- **`WeeklyCalendarResponse`**:
  - `start_date`: `date` (ngày đầu tuần - Thứ Hai)
  - `end_date`: `date` (ngày cuối tuần - Chủ Nhật)
  - `days`: `list[WeeklyCalendarDay]`

### B. API Endpoints UC05 (`code/backend/app/api/v1/calendar.py` & `tasks.py`)

| Method | Endpoint | Description | Auth Required | Params / Request Body | Response / Status Code |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/calendar/weekly` | Lấy danh sách công việc 7 ngày trong tuần | Có | Query: `start_date` (`date`, tùy chọn - mặc định là Thứ Hai tuần hiện tại) | `200 OK` $\rightarrow$ `WeeklyCalendarResponse` |
| `PATCH` | `/api/v1/tasks/{task_id}/drag-drop` | Cập nhật nhanh thời gian/ngày do Kéo-Thả | Có | Path: `task_id` (UUID)<br>Body: `TaskDragDropUpdate` | `200 OK` $\rightarrow$ `TaskResponse` |

#### Logic Nghiệp Vụ Xử Lý UC05:
1. **Lấy dữ liệu Lịch tuần (`GET /api/v1/calendar/weekly`)**:
   - Nếu `start_date` không được truyền lên, hệ thống tự động tính ngày Thứ Hai của tuần chứa ngày hiện tại (`today - timedelta(days=today.weekday())`).
   - Ngày kết thúc `end_date = start_date + timedelta(days=6)` (Chủ Nhật).
   - Truy vấn CSDL danh sách các task có `scheduled_date` trong khoảng `[start_date, end_date]` thuộc sở hữu của `current_user.id`.
   - Gom nhóm task theo từng ngày trong tuần từ Thứ 2 đến Chủ Nhật và trả về cấu trúc `WeeklyCalendarResponse`.

2. **Kéo-Thả Cập Nhật Nhanh (`PATCH /api/v1/tasks/{task_id}/drag-drop`)**:
   - Kiểm tra task tồn tại và bảo vệ IDOR (`task.user_id == current_user.id`).
   - Cập nhật các trường `scheduled_date`, `start_time`, `end_time` vừa thả.
   - Trả về thông tin task cập nhật tức thì phục vụ phản hồi UI mượt mà.

---

## 🎨 3. Đổi Mới Kỹ Thuật Chi Tiết UC06: Phương Pháp Pomodoro & Chuỗi Làm Việc

### A. Pydantic Schemas (`code/backend/app/schemas/pomodoro.py`)

- **`PomodoroStartRequest`**:
  - `task_id`: `UUID` (ID công việc bắt đầu Pomodoro)
  - `duration_minutes`: `int` (mặc định: 25, yêu cầu $> 0$)

- **`PomodoroSessionResponse`**:
  - `id`: `UUID`
  - `user_id`: `UUID`
  - `task_id`: `UUID`
  - `start_time`: `datetime`
  - `end_time`: `datetime | None`
  - `duration_minutes`: `int`
  - `status`: `str` (`IN_PROGRESS`, `COMPLETED`, `CANCELLED`)
  - `completed_at`: `datetime | None`

- **`PomodoroCompleteResponse`**:
  - `session`: `PomodoroSessionResponse`
  - `task_id`: `UUID`
  - `completed_pomodoro`: `int`
  - `target_pomodoro`: `int`
  - `task_status`: `str` (`PENDING`, `IN_PROGRESS`, `COMPLETED`)
  - `streak_updated`: `bool`
  - `current_streak`: `int`

### B. API Endpoints UC06 (`code/backend/app/api/v1/pomodoro.py`)

| Method | Endpoint | Description | Auth Required | Params / Request Body | Response / Status Code |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/v1/pomodoro/start` | Bắt đầu 1 phiên Pomodoro mới | Có | Body: `PomodoroStartRequest` | `201 Created` $\rightarrow$ `PomodoroSessionResponse` |
| `POST` | `/api/v1/pomodoro/{session_id}/complete` | Hoàn thành phiên Pomodoro (25 phút) | Có | Path: `session_id` (UUID) | `200 OK` $\rightarrow$ `PomodoroCompleteResponse` |
| `POST` | `/api/v1/pomodoro/{session_id}/cancel` | Hủy phiên Pomodoro giữa chừng | Có | Path: `session_id` (UUID) | `200 OK` $\rightarrow$ `PomodoroSessionResponse` |
| `POST` | `/api/v1/tasks/{task_id}/complete-early` | Đánh dấu hoàn thành sớm task thủ công | Có | Path: `task_id` (UUID) | `200 OK` $\rightarrow$ `TaskResponse` |

#### Logic Nghiệp Vụ Xử Lý UC06:
1. **Bắt Đầu Phiên (`POST /api/v1/pomodoro/start`)**:
   - Kiểm tra `task_id` có tồn tại và thuộc sở hữu của `current_user.id`.
   - Nếu `task.status == "PENDING"`, tự động chuyển trạng thái task thành `"IN_PROGRESS"`.
   - Tạo bản ghi mới trong bảng `pomodoro_sessions` với `status = "IN_PROGRESS"`, `start_time = datetime.now(timezone.utc)`.

2. **Hoàn Thành Phiên (`POST /api/v1/pomodoro/{session_id}/complete`)**:
   - Kiểm tra phiên tồn tại, thuộc `current_user.id` và đang có `status == "IN_PROGRESS"`.
   - Cập nhật phiên `status = "COMPLETED"`, `end_time = completed_at = datetime.now(timezone.utc)`.
   - Tăng số quả Pomodoro của task: `task.completed_pomodoro += 1`.
   - Kiểm tra nếu `task.completed_pomodoro >= task.target_pomodoro`, tự động cập nhật `task.status = "COMPLETED"`. Cập nhật `completed_tasks` trong `TopicBlock` (nếu có).
   - **Tự động Cập nhật Chuỗi Làm Việc (Streak Auto-Sync)**:
     - Kiểm tra bản ghi `user_streaks` của người dùng.
     - Nếu hôm nay người dùng chưa có lượt làm việc nào:
       - Nếu ngày làm việc gần nhất (`last_activity_date`) là hôm qua $\rightarrow$ `current_streak += 1`.
       - Nếu ngày làm việc gần nhất nhỏ hơn hôm qua $\rightarrow$ Reset `current_streak = 1`.
       - Cập nhật `longest_streak = max(longest_streak, current_streak)`.
       - Cập nhật `last_activity_date = today`.

3. **Hủy Phiên (`POST /api/v1/pomodoro/{session_id}/cancel`)**:
   - Chuyển `session.status = "CANCELLED"`, không tăng số quả Pomodoro của task.

---

## 🛡️ 4. Hợp Đồng Thẩm Định & An Toàn (Validate Contract)

> **Căn cứ theo tiêu chuẩn `vc-validate-agent.md`**

```yaml
validate-contract:
  gate-verdict: PASS
  generated-by: vc-validate-agent
  timestamp: 2026-09-19T21:56:00+07:00
```

### Thẩm định 4 Dạng An toàn (Four Dimension Audit)

1. **Hạ tầng & Schema CSDL (Infrastructure Readiness)**: `PASS`
   - Tất cả các bảng CSDL cần thiết: `tasks`, `pomodoro_sessions`, `user_streaks`, `topic_blocks`, `users` đã được tạo hoàn chỉnh trên Supabase PostgreSQL qua `init_db.py`.
   - Khóa ngoại `pomodoro_sessions.task_id` $\rightarrow$ `tasks.id` và `pomodoro_sessions.user_id` $\rightarrow$ `users.id` hoạt động chuẩn xác với ràng buộc `ON DELETE CASCADE`.

2. **Bảo mật & Cảnh báo Nguy cơ (Security & Vulnerability Audit)**: `PASS`
   - **Bảo vệ IDOR (Insecure Direct Object References)**: Mọi thao tác lấy lịch tuần, kéo thả task, bắt đầu/hoàn thành/hủy phiên Pomodoro đều được kiểm tra `user_id == current_user.id`.
   - **Bảo vệ Trạng thái Phiên (Session State Pollution)**: Chỉ cho phép gọi `complete` hoặc `cancel` trên các phiên Pomodoro đang ở trạng thái `IN_PROGRESS`.

3. **Chiến lược Kiểm thử (Test Coverage Matrix)**: `PASS`
   - Viết test suite integration `code/backend/test_api_uc05_uc06.py` phủ các kịch bản:
     - Truy vấn lịch tuần 7 ngày, đổi tuần qua `start_date`.
     - Drag & Drop thay đổi `scheduled_date`, `start_time`, `end_time`.
     - Vòng đời Pomodoro: Bắt đầu $\rightarrow$ Hoàn thành 1 quả $\rightarrow$ Tăng `completed_pomodoro` $\rightarrow$ Tự động chuyển task `COMPLETED` khi đạt target $\rightarrow$ Tự động tính Streak.
     - Hủy phiên Pomodoro giữa chừng.

4. **Tương thích & Blast Radius (Scope Fence)**: `PASS`
   - Các API mới phân tách rõ ràng dưới tiền tố `/api/v1/calendar` và `/api/v1/pomodoro`, không gây ảnh hưởng tiêu cực tới các API UC01-UC04 đã phát triển.

---

## 📝 5. Checklist Thi Công Chi Tiết (Implementation Checklist)

- [ ] **Bước 1**: Tạo file `code/backend/app/schemas/calendar.py` và `code/backend/app/schemas/pomodoro.py`.
- [ ] **Bước 2**: Tạo file `code/backend/app/api/v1/calendar.py` (Xử lý router Lịch tuần & Drag-Drop).
- [ ] **Bước 3**: Tạo file `code/backend/app/api/v1/pomodoro.py` (Xử lý router Pomodoro Start/Complete/Cancel/Complete-early).
- [ ] **Bước 4**: Cập nhật `code/backend/main.py` đăng ký `calendar_router` và `pomodoro_router`.
- [ ] **Bước 5**: Tạo và chạy test suite integration `code/backend/test_api_uc05_uc06.py` để kiểm thử toàn bộ chức năng.
