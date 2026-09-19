# Tài liệu Thiết kế Cơ sở Dữ liệu (Database Design Specifications)

Tài liệu này định nghĩa lược đồ Cơ sở Dữ liệu (Database Schema) chi tiết cho ứng dụng **Task Management**, phục vụ trọn vẹn 8 Use Cases trong tài liệu [usecases.md](file:///d:/Study/project/task-management/docs/overview/usecases.md).

---

## 1. Sơ đồ Quan hệ Thực thể (Entity Relationship Overview)

```
 [ users ] ───1:N───> [ topic_blocks ] ───1:N───> [ tasks ]
    │                                                │
    ├───1:N───> [ daily_journals ]                   ├───1:N───> [ pomodoro_sessions ]
    ├───1:N───> [ journal_drafts ]                   
    └───1:1───> [ user_streaks ]
```

---

## 2. Bảng `users` (Quản lý Tài khoản & Hồ sơ Người dùng - UC08)

Bảng lưu trữ thông tin tài khoản, xác thực và thông tin cá nhân của người dùng.

| Tên trường (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả nghiệp vụ & Quy chuẩn kỹ thuật |
| --- | --- | --- | --- |
| `id` | UUID | PK, Default: `gen_random_uuid()` | Mã định danh duy nhất của người dùng |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Địa chỉ Email dùng để đăng nhập hệ thống |
| `password_hash` | VARCHAR(255) | NOT NULL | Chuỗi mật khẩu đã được mã hóa bằng Bcrypt/Argon2 |
| `full_name` | VARCHAR(100) | NOT NULL | Họ và tên hiển thị của người dùng |
| `avatar_url` | VARCHAR(500) | NULL | Đường dẫn đến ảnh đại diện cá nhân |
| `created_at` | TIMESTAMPTZ | NOT NULL, Default: `NOW()` | Thời điểm tài khoản được khởi tạo |
| `updated_at` | TIMESTAMPTZ | NOT NULL, Default: `NOW()` | Thời điểm thông tin tài khoản được cập nhật gần nhất |

---

## 3. Bảng `topic_blocks` (Quản lý Khối Chủ đề - UC02, UC03)

Bảng quản lý danh mục các Khối chủ đề học tập/làm việc (ví dụ: Machine Learning, Tiếng Anh, Kiến trúc phần mềm).

| Tên trường (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả nghiệp vụ & Quy chuẩn kỹ thuật |
| --- | --- | --- | --- |
| `id` | UUID | PK, Default: `gen_random_uuid()` | Mã định danh duy nhất của khối chủ đề |
| `user_id` | UUID | FK $\rightarrow$ `users(id)`, NOT NULL | Mã người dùng sở hữu khối chủ đề này |
| `title` | VARCHAR(150) | NOT NULL | Tên khối chủ đề |
| `description` | TEXT | NULL | Mô tả chi tiết về khối chủ đề |
| `color_code` | VARCHAR(20) | NOT NULL, Default: '#3B82F6' | Mã màu HEX/HSL biểu thị cho thẻ chủ đề trên giao diện UI |
| `total_tasks` | INT | NOT NULL, Default: 0, CHECK (`total_tasks` >= 0) | Tổng số lượng công việc thuộc chủ đề |
| `completed_tasks` | INT | NOT NULL, Default: 0, CHECK (`completed_tasks` >= 0) | Số lượng công việc đã hoàn thành thuộc chủ đề |
| `created_at` | TIMESTAMPTZ | NOT NULL, Default: `NOW()` | Thời điểm tạo khối chủ đề |
| `updated_at` | TIMESTAMPTZ | NOT NULL, Default: `NOW()` | Thời điểm cập nhật thông tin khối chủ đề gần nhất |

---

## 4. Bảng `tasks` (Quản lý Công việc trên Lịch tuần & Chủ đề - UC01, UC02, UC03, UC04)

Bảng chứa toàn bộ các thẻ công việc (task), hỗ trợ hiển thị theo Lưới thời gian (Time Grid) và Kéo - Thả (Drag & Drop).

| Tên trường (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả nghiệp vụ & Quy chuẩn kỹ thuật |
| --- | --- | --- | --- |
| `id` | UUID | PK, Default: `gen_random_uuid()` | Mã định danh duy nhất của công việc |
| `user_id` | UUID | FK $\rightarrow$ `users(id)`, NOT NULL | Mã người dùng tạo và sở hữu công việc |
| `topic_id` | UUID | FK $\rightarrow$ `topic_blocks(id)`, NULL | Khối chủ đề liên quan (NULL nếu là công việc tự do) |
| `title` | VARCHAR(255) | NOT NULL | Tên công việc |
| `description` | TEXT | NULL | Mô tả nội dung công việc |
| `scheduled_date` | DATE | NOT NULL | Ngày phân bổ thực hiện công việc |
| `start_time` | TIME | NULL | Giờ bắt đầu thực hiện (phục vụ hiển thị mốc giờ trên Lưới Lịch tuần) |
| `end_time` | TIME | NULL | Giờ kết thúc dự kiến |
| `target_pomodoro` | INT | NOT NULL, Default: 1, CHECK (`target_pomodoro` > 0) | Số lượng quả cà chua Pomodoro mục tiêu dự kiến hoàn thành |
| `completed_pomodoro` | INT | NOT NULL, Default: 0, CHECK (`completed_pomodoro` >= 0) | Số lượng quả cà chua Pomodoro thực tế đã đạt được |
| `status` | VARCHAR(20) | NOT NULL, Default: 'PENDING', CHECK (`status` IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')) | Trạng thái công việc (`PENDING`: Chưa làm, `IN_PROGRESS`: Đang làm, `COMPLETED`: Đã hoàn thành) |
| `created_at` | TIMESTAMPTZ | NOT NULL, Default: `NOW()` | Thời điểm công việc được tạo |
| `updated_at` | TIMESTAMPTZ | NOT NULL, Default: `NOW()` | Thời điểm cập nhật công việc gần nhất (gồm khi Kéo - Thả giờ/ngày) |

---

## 5. Bảng `pomodoro_sessions` (Nhật ký Phiên Pomodoro - UC05)

Bảng lưu chi tiết từng phiên đếm ngược Pomodoro khi người dùng làm việc với một task cụ thể.

| Tên trường (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả nghiệp vụ & Quy chuẩn kỹ thuật |
| --- | --- | --- | --- |
| `id` | UUID | PK, Default: `gen_random_uuid()` | Mã định danh duy nhất của phiên Pomodoro |
| `task_id` | UUID | FK $\rightarrow$ `tasks(id)`, NOT NULL | Mã công việc đang được thực hiện trong phiên |
| `user_id` | UUID | FK $\rightarrow$ `users(id)`, NOT NULL | Mã người dùng thực hiện phiên Pomodoro |
| `duration_minutes` | INT | NOT NULL, Default: 25, CHECK (`duration_minutes` > 0) | Thời lượng phiên tập trung (mặc định 25 phút) |
| `started_at` | TIMESTAMPTZ | NOT NULL, Default: `NOW()` | Thời điểm bấm nút Bắt đầu phiên đếm ngược |
| `completed_at` | TIMESTAMPTZ | NULL | Thời điểm hoàn thành trọn vẹn phiên đếm ngược |
| `is_successful` | BOOLEAN | NOT NULL, Default: `TRUE` | Trạng thái phiên (`TRUE`: Đạt 1 quả cà chua, `FALSE`: Hủy giữa chừng) |
| `created_at` | TIMESTAMPTZ | NOT NULL, Default: `NOW()` | Thời điểm ghi nhận bản ghi |

---

## 6. Bảng `user_streaks` (Chuỗi Làm việc & Thống kê Năng suất - UC06)

Bảng tổng hợp chỉ số Chuỗi ngày làm việc liên tục (Streak) và thống kê hiệu suất của người dùng.

| Tên trường (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả nghiệp vụ & Quy chuẩn kỹ thuật |
| --- | --- | --- | --- |
| `id` | UUID | PK, Default: `gen_random_uuid()` | Mã định danh duy nhất bản ghi thống kê |
| `user_id` | UUID | FK $\rightarrow$ `users(id)`, UNIQUE, NOT NULL | Mã người dùng sở hữu chỉ số Streak (1:1 với `users`) |
| `current_streak` | INT | NOT NULL, Default: 0, CHECK (`current_streak` >= 0) | Số ngày liên tiếp hoàn thành ít nhất 1 task hoặc 1 quả Pomodoro |
| `longest_streak` | INT | NOT NULL, Default: 0, CHECK (`longest_streak` >= 0) | Kỷ lục chuỗi ngày làm việc liên tục dài nhất đạt được |
| `last_activity_date` | DATE | NULL | Ngày gần nhất người dùng có hoạt động hoàn thành task/Pomodoro |
| `total_completed_tasks` | INT | NOT NULL, Default: 0, CHECK (`total_completed_tasks` >= 0) | Tích lũy tổng số công việc đã hoàn thành từ trước đến nay |
| `total_pomodoros` | INT | NOT NULL, Default: 0, CHECK (`total_pomodoros` >= 0) | Tích lũy tổng số quả cà chua Pomodoro đạt được |
| `updated_at` | TIMESTAMPTZ | NOT NULL, Default: `NOW()` | Thời điểm cập nhật chỉ số gần nhất |

---

## 7. Bảng `daily_journals` (Nhật ký Học tập & Ghi chú Cá nhân - UC07)

Bảng lưu trữ nhật ký văn bản giàu định dạng (Rich-text) và khối dữ liệu tóm tắt các chủ đề/task đã thực hiện trong ngày.

| Tên trường (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả nghiệp vụ & Quy chuẩn kỹ thuật |
| --- | --- | --- | --- |
| `id` | UUID | PK, Default: `gen_random_uuid()` | Mã định danh duy nhất của bài nhật ký |
| `user_id` | UUID | FK $\rightarrow$ `users(id)`, NOT NULL | Mã người dùng sở hữu bài nhật ký |
| `journal_date` | DATE | NOT NULL | Ngày viết nhật ký (Mỗi ngày có 1 bài nhật ký chính thức) |
| `summary_data` | JSONB | NULL | Dữ liệu JSON tóm tắt tự động (Danh sách chủ đề đã học, số task & pomodoro trong ngày) |
| `content_html` | TEXT | NULL | Nội dung nhật ký định dạng HTML sinh ra từ Trình soạn thảo Rich-text |
| `content_markdown` | TEXT | NULL | Nội dung nhật ký dạng thuần Markdown |
| `created_at` | TIMESTAMPTZ | NOT NULL, Default: `NOW()` | Thời điểm lưu bản nhật ký |
| `updated_at` | TIMESTAMPTZ | NOT NULL, Default: `NOW()` | Thời điểm cập nhật bài nhật ký gần nhất |

---

## 8. Bảng `journal_drafts` (Bản nháp Nhật ký Tự động Lưu - UC07)

Bảng lưu trữ bản nháp tạm thời (Auto-save) khi người dùng đang soạn thảo nhật ký.

| Tên trường (Column) | Kiểu dữ liệu | Ràng buộc (Constraints) | Mô tả nghiệp vụ & Quy chuẩn kỹ thuật |
| --- | --- | --- | --- |
| `id` | UUID | PK, Default: `gen_random_uuid()` | Mã định danh duy nhất của bản nháp |
| `user_id` | UUID | FK $\rightarrow$ `users(id)`, NOT NULL | Mã người dùng sở hữu bản nháp |
| `journal_date` | DATE | NOT NULL | Ngày đang soạn thảo bản nháp |
| `draft_content` | TEXT | NULL | Nội dung văn bản dở dang được tự động lưu sau mỗi 30 giây |
| `updated_at` | TIMESTAMPTZ | NOT NULL, Default: `NOW()` | Thời điểm tự động lưu bản nháp gần nhất |
