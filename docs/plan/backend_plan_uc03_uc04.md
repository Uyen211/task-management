# Kế Hoạch & Thẩm Định Kỹ Thuật Backend UC03 & UC04

Tài liệu này định nghĩa thiết kế kỹ thuật chi tiết, quy trình triển khai và Hợp đồng thẩm định (Validate Contract) cho Backend (FastAPI, SQLAlchemy, Supabase PostgreSQL) phục vụ 2 chức năng:
- **UC03: Tạo công việc mới (Create Simple Task)**
- **UC04: Chỉnh sửa và Xóa công việc (Edit & Delete Tasks)**

---

## 📋 Context Envelope (Thông Tin Ngữ Cảnh)

```yaml
feature: task_crud_management
phase: PLAN & VALIDATE
session-goal: Khóa kiến trúc và thẩm định phương án triển khai Backend cho UC03 & UC04
target-services: code/backend/app/
database-target: Supabase PostgreSQL (models: Task, TopicBlock, User)
test-runner: pytest | httpx.AsyncClient
validate-contract: PASS
```

---

## 🏛️ 1. Sơ Đồ Kiến Trúc & Luồng Dữ Liệu (Data Flow)

```
[ HTTP Client (React/Axios) ]
          │
          ▼  (Bearer Token / JSON Payload)
[ FastAPI Router Layer ] (/api/v1/tasks)
          │
          ▼  (Security Middleware & Authorization Fence)
[ Auth Layer ] (get_current_user -> xác thực Token & kiềm tra user_id)
          │
          ▼  (Validation via Pydantic Schemas)
[ Service & ORM Layer ] (SQLAlchemy Session, App Models: Task & TopicBlock)
          │
          ▼  (Prepared SQL Statements via Connection Pooler)
[ Database Layer ] (Supabase PostgreSQL)
```

---

## 🔧 2. Đổi Mới Kỹ Thuật Chi Tiết UC03: Tạo Công Việc Mới

### A. Pydantic Schemas (`code/backend/app/schemas/task.py`)
- **`TaskCreate`**:
  - `title`: `str` (bắt buộc, 1-255 ký tự).
  - `description`: `str | None` (tùy chọn).
  - `topic_id`: `UUID | None` (tùy chọn).
  - `scheduled_date`: `date` (bắt buộc).
  - `start_time`: `time | None` (tùy chọn, mốc giờ bắt đầu trên Lưới Lịch tuần).
  - `end_time`: `time | None` (tùy chọn, mốc giờ kết thúc).
  - `target_pomodoro`: `int` (mặc định: 1, yêu cầu $> 0$).
- **`TaskResponse`**:
  - `id`: `UUID`
  - `user_id`: `UUID`
  - `topic_id`: `UUID | None`
  - `topic_title`: `str | None`
  - `topic_color`: `str | None`
  - `title`: `str`
  - `description`: `str | None`
  - `scheduled_date`: `date`
  - `start_time`: `time | None`
  - `end_time`: `time | None`
  - `target_pomodoro`: `int`
  - `completed_pomodoro`: `int`
  - `status`: `str` (`PENDING`, `IN_PROGRESS`, `COMPLETED`)
  - `created_at`: `datetime`
  - `updated_at`: `datetime`

### B. API Endpoint UC03 (`code/backend/app/api/v1/tasks.py`)

| Method | Endpoint | Description | Auth Required | Request Body | Status Code / Response |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/v1/tasks` | Tạo mới công việc |  Có | `TaskCreate` | `201 Created` $\rightarrow$ `TaskResponse` |

#### Logic Nghiệp Vụ Xử Lý:
1. Xác thực Token người dùng hiện tại via `get_current_user`.
2. Kiểm tra nếu `topic_id` được truyền vào: xác nhận `topic_id` có tồn tại và thuộc quyền sở hữu của `current_user.id`. Nếu không, ném lỗi `HTTPException(status_code=404)`.
3. Khởi tạo đối tượng `Task` mới với `user_id = current_user.id`, `status = "PENDING"`, `completed_pomodoro = 0`.
4. Đẩy công việc vào CSDL và tự động cập nhật số đếm `total_tasks` trong `TopicBlock` liên quan.
5. Trả về `201 Created` cùng thông tin `TaskResponse`.

---

## 🎨 3. Đổi Mới Kỹ Thuật Chi Tiết UC04: Chỉnh Sửa & Xóa Công Việc

### A. Pydantic Schemas (`code/backend/app/schemas/task.py`)
- **`TaskUpdate`**:
  - `title`: `str | None` (1-255 ký tự).
  - `description`: `str | None`.
  - `topic_id`: `UUID | None` (hỗ trợ gán hoặc chuyển đổi sang chủ đề khác).
  - `scheduled_date`: `date | None` (hỗ trợ đổi ngày thực hiện).
  - `start_time`: `time | None` (hỗ trợ đổi mốc giờ khi Kéo - Thả Drag & Drop).
  - `end_time`: `time | None`.
  - `target_pomodoro`: `int | None` ($> 0$).
  - `completed_pomodoro`: `int | None` ($\ge 0$).
  - `status`: `str | None` (chỉ chấp nhận `PENDING`, `IN_PROGRESS`, `COMPLETED`).

### B. API Endpoints UC04 (`code/backend/app/api/v1/tasks.py`)

| Method | Endpoint | Description | Auth Required | Path & Request Params | Response / Status Code |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `PUT` | `/api/v1/tasks/{task_id}` | Chỉnh sửa thông tin / trạng thái / giờ |  Có | `task_id` (UUID), `TaskUpdate` | `200 OK` $\rightarrow$ `TaskResponse` |
| `DELETE` | `/api/v1/tasks/{task_id}` | Xóa công việc |  Có | `task_id` (UUID) | `200 OK` $\rightarrow$ `{"message": "Success"}` |

#### Logic Nghiệp Vụ Xử Lý:
- **Xử lý Chỉnh sửa (`PUT /api/v1/tasks/{task_id}`)**:
  1. Truy vấn công việc theo `task_id` và bắt buộc kiểm tra `user_id == current_user.id` (Bảo vệ IDOR). Ném `404 Not Found` nếu không tìm thấy.
  2. Nếu người dùng thay đổi `topic_id`: Tự động tính toán và cập nhật lại `total_tasks`, `completed_tasks` ở Khối chủ đề cũ và Khối chủ đề mới.
  3. Cập nhật các trường thông tin được gửi lên (bao gồm `start_time` & `scheduled_date` khi người dùng kéo thả trên Lịch tuần).
  4. Trả về `200 OK` $\rightarrow$ `TaskResponse`.
- **Xử lý Xóa (`DELETE /api/v1/tasks/{task_id}`)**:
  1. Truy vấn công việc theo `task_id` và kiểm tra `user_id == current_user.id`.
  2. Nếu công việc gắn với 1 `topic_id`: Tự động giảm số lượng `total_tasks` (và `completed_tasks` nếu công việc đó đã hoàn thành) trong `TopicBlock`.
  3. Thực hiện xóa bản ghi công việc khỏi CSDL.
  4. Trả về `200 OK` với thông báo thành công.

---

## 🛡️ 4. Hợp Đồng Thẩm Định & An Toàn (Validate Contract)

> **Căn cứ theo tiêu chuẩn `vc-validate-agent.md`**

```yaml
validate-contract:
  gate-verdict: PASS
  generated-by: vc-validate-agent
  timestamp: 2026-09-19T21:52:30+07:00
```

### Thẩm định 4 Dạng An toàn (Four Dimension Audit)

1. **Hạ tầng & Schema CSDL (Infrastructure Readiness)**: `PASS`
   - Bảng `tasks` đã được định nghĩa và tạo thành công trên Supabase PostgreSQL qua file `init_db.py`.
   - Đã thiết lập khóa ngoại `tasks.topic_id` $\rightarrow$ `topic_blocks.id` với ràng buộc `ON DELETE SET NULL`.

2. **Bảo mật & Cảnh báo Nguy cơ (Security & Vulnerability Audit)**: `PASS`
   - **Bảo vệ IDOR (Insecure Direct Object References)**: Mọi thao tác `PUT` và `DELETE` đều bắt buộc chứa điều kiện `Task.user_id == current_user.id`, đảm bảo tuyệt đối người dùng không thể xem/sửa/xóa công việc của người dùng khác.
   - **Kiểm tra tính hợp lệ dữ liệu**: Pydantic Schemas validate nguyên ngặt `target_pomodoro > 0`, `status` thuộc danh sách enum cho phép.

3. **Chiến lược Kiểm thử (Test Coverage Matrix)**: `PASS`
   - Viết test suite `code/backend/test_api_uc03_uc04.py` sử dụng Pytest & `httpx.AsyncClient`.
   - Kiểm thử thành công các luồng chính: *Tạo task mới $\rightarrow$ Kiểm tra task xuất hiện ở Lịch tuần & Chủ đề $\rightarrow$ Cập nhật mốc giờ/ngày $\rightarrow$ Đổi chủ đề $\rightarrow$ Xóa task*.
   - Kiểm thử luồng rẽ nhánh: *Sửa/Xóa task không thuộc về mình (HTTP 404), Tạo task gán vào topic_id không tồn tại (HTTP 404)*.

4. **Tương thích & Blast Radius (Scope Fence)**: `PASS`
   - Tất cả các endpoint quản lý task nằm dưới tiền tố `/api/v1/tasks`, tương thích hoàn toàn với hệ thống hiện tại.

---

## 📝 5. Checklist Thi Công Chi Tiết (Implementation Checklist)

- [ ] **Bước 1**: Tạo file `code/backend/app/schemas/task.py` (Định nghĩa Pydantic Schemas `TaskCreate`, `TaskUpdate`, `TaskResponse`).
- [ ] **Bước 2**: Tạo file `code/backend/app/api/v1/tasks.py` (Xử lý router `POST /api/v1/tasks`, `PUT /api/v1/tasks/{task_id}`, `DELETE /api/v1/tasks/{task_id}`).
- [ ] **Bước 3**: Cập nhật `code/backend/main.py` để nhúng `tasks_router` vào ứng dụng FastAPI với tiền tố `/api/v1`.
- [ ] **Bước 4**: Tạo và chạy test suite integration `code/backend/test_api_uc03_uc04.py` để kiểm thử toàn bộ luồng API với Supabase PostgreSQL.
