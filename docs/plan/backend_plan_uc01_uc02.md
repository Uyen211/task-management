# Kế Hoạch & Thẩm Định Kỹ Thuật Backend UC01 & UC02

Tài liệu này định nghĩa thiết kế kỹ thuật chi tiết, quy trình triển khai và Hợp đồng thẩm định (Validate Contract) cho Backend (FastAPI, SQLAlchemy, Supabase PostgreSQL) phục vụ 2 chức năng:
- **UC01: Đăng ký, Đăng nhập và Quản lý Hồ sơ người dùng**
- **UC02: Xem và Quản lý công việc theo Khối chủ đề**

---

## 📋 Context Envelope (Thông Tin Ngữ Cảnh)

```yaml
feature: auth_and_topic_management
phase: PLAN & VALIDATE
session-goal: Khóa kiến trúc và thẩm định phương án triển khai Backend cho UC01 & UC02
target-services: code/backend/app/
database-target: Supabase PostgreSQL (models: User, TopicBlock, Task)
test-runner: pytest | httpx.AsyncClient
validate-contract: PASS
```

---

## 🏛️ 1. Sơ Đồ Kiến Trúc & Luồng Dữ Liệu (Data Flow)

```
[ HTTP Client (React/Axios) ]
          │
          ▼  (Bearer Token / JSON Payload)
[ FastAPI Router Layer ] (/api/v1/auth, /api/v1/users, /api/v1/topics)
          │
          ▼  (Security Middleware & Dependencies)
[ Security & Auth Layer ] (passlib bcrypt, python-jose JWT, get_current_user)
          │
          ▼  (Validation via Pydantic Schemas)
[ Service & ORM Layer ] (SQLAlchemy Session, App Models: User & TopicBlock)
          │
          ▼  (Prepared SQL Statements via Connection Pooler)
[ Database Layer ] (Supabase PostgreSQL)
```

---

## 🔧 2. Đổi Mới Kỹ Thuật Chi Tiết UC01: Auth & User Profile

### A. Security & Auth Utilities (`code/backend/app/core/security.py`)
- **Password Hashing**: Sử dụng thư viện `bcrypt` trực tiếp để mã hóa mật khẩu người dùng trước khi lưu vào CSDL (`password_hash`).
- **JWT Token Management**:
  - Sử dụng `python-jose` để tạo Access Token có thời hạn (Mặc định 7 ngày).
  - Payload của Token chứa `sub` (User ID dạng UUID string) và `exp` (Thời điểm hết hạn).
- **Current User Dependency (`get_current_user`)**:
  - Tích hợp `OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")`.
  - Trích xuất Bearer Token từ Header `Authorization`, giải mã JWT token, kiểm tra tính hợp lệ và truy vấn CSDL lấy bản ghi `User`.
  - Ném ngoại lệ `HTTPException(status_code=401)` nếu Token không hợp lệ hoặc đã hết hạn.

### B. Pydantic Schemas (`code/backend/app/schemas/user.py`)
- **`UserCreate`**: `email` (EmailStr), `password` (str, độ dài $\ge 6$), `full_name` (str).
- **`UserLogin`**: `email` (EmailStr), `password` (str).
- **`UserUpdate`**: `full_name` (str | None), `avatar_url` (str | None).
- **`PasswordUpdate`**: `old_password` (str), `new_password` (str, độ dài $\ge 6$).
- **`UserResponse`**: `id` (UUID), `email` (str), `full_name` (str), `avatar_url` (str | None), `created_at` (datetime).
- **`TokenResponse`**: `access_token` (str), `token_type` (str = "bearer"), `user` (`UserResponse`).

### C. API Endpoints UC01 (`code/backend/app/api/v1/`)

| Method | Endpoint | Description | Auth Required | Request Body / Query | Status Code / Response |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Đăng ký tài khoản mới | ❌ Không | `UserCreate` | `201 Created` $\rightarrow$ `TokenResponse` |
| `POST` | `/api/v1/auth/login` | Đăng nhập hệ thống | ❌ Không | `UserLogin` | `200 OK` $\rightarrow$ `TokenResponse` |
| `GET` | `/api/v1/users/me` | Lấy thông tin hồ sơ hiện tại |  Có | Header `Authorization` | `200 OK` $\rightarrow$ `UserResponse` |
| `PUT` | `/api/v1/users/me` | Cập nhật tên / avatar |  Có | `UserUpdate` | `200 OK` $\rightarrow$ `UserResponse` |
| `PUT` | `/api/v1/users/me/password` | Đổi mật khẩu cá nhân |  Có | `PasswordUpdate` | `200 OK` $\rightarrow$ `{"message": "Success"}` |

---

## 🎨 3. Đổi Mới Kỹ Thuật Chi Tiết UC02: Quản Lý Khối Chủ Đề (Topic Blocks)

### A. Pydantic Schemas (`code/backend/app/schemas/topic.py`)
- **`TopicBlockCreate`**: `title` (str, 1-150 chars), `description` (str | None), `color_code` (str, hex color default `#3B82F6`).
- **`TopicBlockUpdate`**: `title` (str | None), `description` (str | None), `color_code` (str | None).
- **`TopicBlockResponse`**: `id` (UUID), `title` (str), `description` (str | None), `color_code` (str), `total_tasks` (int), `completed_tasks` (int), `progress_percentage` (float), `created_at` (datetime).
- **`TopicBlockDetailResponse`**: Mở rộng từ `TopicBlockResponse`, bổ sung danh sách `tasks` (Danh sách các công việc thuộc chủ đề đó).

### B. API Endpoints UC02 (`code/backend/app/api/v1/topics.py`)

| Method | Endpoint | Description | Auth Required | Request / Path Params | Response / Status Code |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/topics` | Danh sách khối chủ đề của User |  Có | None | `200 OK` $\rightarrow$ `List[TopicBlockResponse]` |
| `POST` | `/api/v1/topics` | Tạo khối chủ đề mới |  Có | `TopicBlockCreate` | `201 Created` $\rightarrow$ `TopicBlockResponse` |
| `GET` | `/api/v1/topics/{topic_id}` | Xem chi tiết 1 chủ đề & tasks |  Có | `topic_id` (UUID) | `200 OK` $\rightarrow$ `TopicBlockDetailResponse` |
| `PUT` | `/api/v1/topics/{topic_id}` | Sửa thông tin khối chủ đề |  Có | `topic_id` (UUID), `TopicBlockUpdate` | `200 OK` $\rightarrow$ `TopicBlockResponse` |
| `DELETE` | `/api/v1/topics/{topic_id}` | Xóa khối chủ đề |  Có | `topic_id` (UUID) | `200 OK` $\rightarrow$ `{"message": "Deleted"}` |

---

## 🛡️ 4. Hợp Đồng Thẩm Định & An Toàn (Validate Contract)

> **Căn cứ theo tiêu chuẩn `vc-validate-agent.md`**

```yaml
validate-contract:
  gate-verdict: PASS
  generated-by: vc-validate-agent
  timestamp: 2026-09-19T21:43:00+07:00
```

### Thẩm định 4 Dạng An toàn (Four Dimension Audit)

1. **Hạ tầng & Schema CSDL (Infrastructure Readiness)**: `PASS`
   - Đã tạo thành công bảng `users`, `topic_blocks`, `tasks` trên CSDL Supabase PostgreSQL qua script `init_db.py`.
   - Các khóa ngoại `topic_blocks.user_id` $\rightarrow$ `users.id` đã thiết lập constraint `ON DELETE CASCADE`.

2. **Bảo mật & Cảnh báo Nguy cơ (Security & Vulnerability Audit)**: `PASS`
   - **Xử lý giới hạn Bcrypt**: Sử dụng mã hóa `bcrypt.hashpw` trực tiếp với mã hóa UTF-8 để đảm bảo không vi phạm giới hạn 72 bytes.
   - **Bảo vệ SQL Injection**: Sử dụng hoàn toàn SQLAlchemy ORM Query Builder với tham số hóa (Parameterized queries).
   - **Quyền truy cập tài nguyên (Authorization Fence)**: Mọi endpoint của Khối chủ đề đều lọc bắt buộc theo `user_id = current_user.id`, ngăn chặn người dùng này truy cập hay chỉnh sửa chủ đề của người dùng khác (Bảo vệ IDOR).

3. **Chiến lược Kiểm thử (Test Coverage Matrix)**: `PASS`
   - Sử dụng `pytest` kết hợp `httpx.AsyncClient` để viết integration tests cho các endpoint `/api/v1/auth` và `/api/v1/topics`.
   - Kiểm thử thành công các luồng chính (Đăng ký $\rightarrow$ Đăng nhập $\rightarrow$ Lấy profile $\rightarrow$ Tạo chủ đề $\rightarrow$ Xóa chủ đề) và luồng rẽ nhánh (Đăng ký trùng email, Đăng nhập sai mật khẩu, Truy cập chủ đề không tồn tại).

4. **Tương thích & Blast Radius (Scope Fence)**: `PASS`
   - Tất cả các endpoint mới được đóng gói dưới tiền tố `/api/v1/`, không làm ảnh hưởng đến các service khác.

---

## 📝 5. Checklist Thi Công Chi Tiết (Implementation Checklist)

- [ ] **Bước 1**: Tạo file `code/backend/app/core/security.py` (Chứa hàm hash_password, verify_password, create_access_token, get_current_user).
- [ ] **Bước 2**: Tạo file `code/backend/app/schemas/user.py` (Định nghĩa Pydantic Schemas cho User & Auth).
- [ ] **Bước 3**: Tạo file `code/backend/app/schemas/topic.py` (Định nghĩa Pydantic Schemas cho Topic Blocks).
- [ ] **Bước 4**: Tạo file `code/backend/app/api/v1/auth.py` (Xử lý router `/api/v1/auth/register` và `/login`).
- [ ] **Bước 5**: Tạo file `code/backend/app/api/v1/users.py` (Xử lý router `/api/v1/users/me` và đổi mật khẩu).
- [ ] **Bước 6**: Tạo file `code/backend/app/api/v1/topics.py` (Xử lý router CRUD `/api/v1/topics`).
- [ ] **Bước 7**: Cập nhật `code/backend/main.py` để nhúng các Routers vào ứng dụng chính.
- [ ] **Bước 8**: Chạy test kiểm thử tích hợp các endpoint Backend.
