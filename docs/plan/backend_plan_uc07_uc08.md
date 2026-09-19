# Kế Hoạch & Thẩm Định Kỹ Thuật Backend UC07 & UC08

Tài liệu này định nghĩa thiết kế kỹ thuật chi tiết, quy trình triển khai và Hợp đồng thẩm định (Validate Contract) cho Backend (FastAPI, SQLAlchemy, Supabase PostgreSQL) phục vụ 2 chức năng:
- **UC07: Xem Chuỗi làm việc (Streak) và Thống kê hiệu suất**
- **UC08: Ghi nhật ký học tập và xem tóm tắt ngày**

---

## 📋 Context Envelope (Thông Tin Ngữ Cảnh)

```yaml
feature: stats_and_journal
phase: PLAN & VALIDATE
session-goal: Khóa kiến trúc và thẩm định phương án triển khai Backend cho UC07 & UC08
target-services: code/backend/app/
database-target: Supabase PostgreSQL (models: UserStreak, DailyJournal, JournalDraft, Task, PomodoroSession, TopicBlock, User)
test-runner: pytest | httpx.AsyncClient
validate-contract: PASS
```

---

## 🏛️ 1. Sơ Đồ Kiến Trúc & Luồng Dữ Liệu (Data Flow)

```
[ HTTP Client (React/Dashboard & Journal Editor) ]
          │
          ├───────────────────────────────────────────────────────┐
          ▼ (GET /api/v1/stats/*)                                 ▼ (GET & POST /api/v1/journal/*)
[ FastAPI Stats Router ]                                [ FastAPI Journal Router ]
          │                                                       │
          ▼ (Authorization Fence & User Token Check)              ▼ (Authorization Fence & User Token Check)
[ Auth Middleware ] (get_current_user)                   [ Auth Middleware ] (get_current_user)
          │                                                       │
          ▼ (Aggregate Streaks & Daily Task/Pomo Data)            ▼ (Fetch Daily Summary, Manage Journal & Drafts)
[ Stats & Productivity Service ]                          [ Daily Journal Service ]
          │                                                       │
          └───────────────────────────┬───────────────────────────┘
                                      ▼
                      [ Supabase PostgreSQL DB ]
       (Tables: user_streaks, daily_journals, journal_drafts, tasks, pomodoro_sessions, topic_blocks)
```

---

## 🔧 2. Đổi Mới Kỹ Thuật Chi Tiết UC07: Chuỗi Làm Việc & Thống Kê Hiệu Suất

### A. Pydantic Schemas (`code/backend/app/schemas/stats.py`)

- **`StreakResponse`**:
  - `current_streak`: `int`
  - `longest_streak`: `int`
  - `last_activity_date`: `date | None`
  - `total_completed_tasks`: `int`
  - `total_pomodoros`: `int`

- **`DailyProductivityItem`**:
  - `date`: `date`
  - `completed_tasks`: `int`
  - `completed_pomodoros`: `int`

- **`TopicProductivityItem`**:
  - `topic_id`: `UUID | None`
  - `topic_title`: `str`
  - `color_code`: `str`
  - `completed_tasks`: `int`
  - `completed_pomodoros`: `int`

- **`ProductivityStatsResponse`**:
  - `period`: `str` (`week`, `month`, `all`)
  - `total_completed_tasks`: `int`
  - `total_pomodoros`: `int`
  - `daily_breakdown`: `list[DailyProductivityItem]`
  - `top_topics`: `list[TopicProductivityItem]`

### B. API Endpoints UC07 (`code/backend/app/api/v1/stats.py`)

| Method | Endpoint | Description | Auth Required | Request Params | Response / Status Code |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/stats/streak` | Lấy các chỉ số Streak & tổng tích lũy | Có | Không | `200 OK` $\rightarrow$ `StreakResponse` |
| `GET` | `/api/v1/stats/productivity` | Lấy dữ liệu thống kê năng suất theo khoảng thời gian | Có | Query: `period` (`str`: `week` \| `month` \| `all`, mặc định: `week`) | `200 OK` $\rightarrow$ `ProductivityStatsResponse` |

#### Logic Nghiệp Vụ Xử Lý UC07:
1. **Lấy Chỉ Số Streak (`GET /api/v1/stats/streak`)**:
   - Truy vấn bản ghi `UserStreak` của `current_user.id`.
   - Nếu chưa có bản ghi (người dùng mới), khởi tạo giá trị mặc định: `current_streak = 0`, `longest_streak = 0`, `total_completed_tasks = 0`, `total_pomodoros = 0`.
   - Kiểm tra nếu `last_activity_date` trước ngày hôm qua (bỏ lỡ > 1 ngày), tự động reset `current_streak = 0` trong CSDL.
   - Trả về `StreakResponse`.

2. **Thống Kê Hiệu Suất (`GET /api/v1/stats/productivity`)**:
   - Xác định mốc thời gian dựa theo query param `period`:
     - `week`: 7 ngày tính từ Thứ 2 tuần này.
     - `month`: Từ ngày 1 của tháng hiện tại.
     - `all`: Không giới hạn ngày.
   - Tổng hợp số task hoàn thành (`Task.status == 'COMPLETED'`) và số quả Pomodoro hoàn thành (`PomodoroSession.completed_at is not None`) theo từng ngày trong khoảng thời gian.
   - Phân tích và nhóm theo từng Khối chủ đề (`TopicBlock`) để tính top các chủ đề được thực hiện nhiều nhất.

---

## 🎨 3. Đổi Mới Kỹ Thuật Chi Tiết UC08: Ghi Nhật Ký Học Tập & Tóm Tắt Ngày

### A. Pydantic Schemas (`code/backend/app/schemas/journal.py`)

- **`TopicSummaryItem`**:
  - `topic_id`: `UUID | None`
  - `topic_title`: `str`
  - `color_code`: `str`
  - `completed_tasks`: `int`
  - `completed_pomodoros`: `int`

- **`DailySummaryResponse`**:
  - `journal_date`: `date`
  - `total_completed_tasks`: `int`
  - `total_pomodoros`: `int`
  - `topics_summary`: `list[TopicSummaryItem]`

- **`JournalSaveRequest`**:
  - `journal_date`: `date`
  - `content_html`: `str | None`
  - `content_markdown`: `str | None`

- **`JournalResponse`**:
  - `id`: `UUID`
  - `user_id`: `UUID`
  - `journal_date`: `date`
  - `summary_data`: `dict | None`
  - `content_html`: `str | None`
  - `content_markdown`: `str | None`
  - `created_at`: `datetime`
  - `updated_at`: `datetime`

- **`JournalDraftSaveRequest`**:
  - `journal_date`: `date`
  - `draft_content`: `str`

- **`JournalDraftResponse`**:
  - `id`: `UUID`
  - `user_id`: `UUID`
  - `journal_date`: `date`
  - `draft_content`: `str | None`
  - `updated_at`: `datetime`

### B. API Endpoints UC08 (`code/backend/app/api/v1/journal.py`)

| Method | Endpoint | Description | Auth Required | Params / Request Body | Response / Status Code |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/journal/daily-summary` | Lấy tóm tắt công việc & chủ đề trong ngày | Có | Query: `journal_date` (`date`, mặc định: Hôm nay) | `200 OK` $\rightarrow$ `DailySummaryResponse` |
| `GET` | `/api/v1/journal` | Lấy bài nhật ký của ngày chỉ định | Có | Query: `journal_date` (`date`, mặc định: Hôm nay) | `200 OK` $\rightarrow$ `JournalResponse` |
| `POST` | `/api/v1/journal` | Lưu / Cập nhật bài nhật ký rich-text | Có | Body: `JournalSaveRequest` | `200 OK` / `201 Created` $\rightarrow$ `JournalResponse` |
| `GET` | `/api/v1/journal/draft` | Lấy bản nháp tự động lưu của ngày | Có | Query: `journal_date` (`date`, mặc định: Hôm nay) | `200 OK` $\rightarrow$ `JournalDraftResponse` |
| `PUT` | `/api/v1/journal/draft` | Tự động lưu bản nháp (Auto-save) | Có | Body: `JournalDraftSaveRequest` | `200 OK` $\rightarrow$ `JournalDraftResponse` |

#### Logic Nghiệp Vụ Xử Lý UC08:
1. **Lấy Tóm Tắt Ngày (`GET /api/v1/journal/daily-summary`)**:
   - Truy vấn tất cả công việc có `scheduled_date == journal_date` và `status == "COMPLETED"`.
   - Truy vấn các phiên Pomodoro hoàn thành trong ngày `journal_date`.
   - Tổng hợp danh sách chủ đề đã tương tác trong ngày kèm màu sắc và số task/pomodoro đã đạt được.
2. **Lưu Nhật Ký (`POST /api/v1/journal`)**:
   - Tự động lấy dữ liệu tóm tắt ngày (`summary_data`) đưa vào bản ghi nhật ký.
   - Tìm bản ghi nhật ký cũ theo `(user_id, journal_date)`. Nếu đã tồn tại $\rightarrow$ Cập nhật nội dung (`content_html`, `content_markdown`, `summary_data`). Nếu chưa có $\rightarrow$ Tạo bản ghi mới.
   - Xóa bản nháp trong `journal_drafts` sau khi lưu chính thức thành công.
3. **Tự Động Lưu Bản Nháp (`PUT /api/v1/journal/draft`)**:
   - Lưu hoặc cập nhật `draft_content` cho ngày `journal_date` của `current_user.id`, giúp khôi phục nội dung khi người dùng bất ngờ tắt trình duyệt.

---

## 🛡️ 4. Hợp Đồng Thẩm Định & An Toàn (Validate Contract)

> **Căn cứ theo tiêu chuẩn `vc-validate-agent.md`**

```yaml
validate-contract:
  gate-verdict: PASS
  generated-by: vc-validate-agent
  timestamp: 2026-09-19T22:04:00+07:00
```

### Thẩm định 4 Dạng An toàn (Four Dimension Audit)

1. **Hạ tầng & Schema CSDL (Infrastructure Readiness)**: `PASS`
   - Tất cả các bảng `user_streaks`, `daily_journals`, `journal_drafts` đã được tạo sẵn trên CSDL Supabase PostgreSQL thông qua `init_db.py`.
   - Các trường JSON `summary_data` trên bảng `daily_journals` đáp ứng khả năng lưu trữ tóm tắt ngày dạng tĩnh không bị ảnh hưởng bởi thay đổi task tương lai.

2. **Bảo mật & Cảnh báo Nguy cơ (Security & Vulnerability Audit)**: `PASS`
   - **Bảo vệ IDOR (Insecure Direct Object References)**: Mọi thao tác đọc/ghi nhật ký, bản nháp, lấy chỉ số Streak và biểu đồ năng suất đều gắn chặt với `current_user.id`.
   - **Xử lý Dữ liệu Rỗng (Graceful Fallback)**: Đảm bảo trả về mảng rỗng hoặc cấu trúc mặc định khi người dùng mới chưa có nhật ký hoặc dữ liệu thống kê.

3. **Chiến lược Kiểm thử (Test Coverage Matrix)**: `PASS`
   - Viết test suite integration `code/backend/test_api_uc07_uc08.py` bao phủ các luồng:
     - Lấy chỉ số Streak và thống kê năng suất theo tuần/tháng.
     - Lấy tóm tắt ngày $\rightarrow$ Lưu bản nháp (Auto-save) $\rightarrow$ Lấy bản nháp $\rightarrow$ Lưu chính thức bài nhật ký.
     - Đọc lại bài nhật ký đã lưu.

4. **Tương thích & Blast Radius (Scope Fence)**: `PASS`
   - Router thống kê nằm ở tiền tố `/api/v1/stats`, Router nhật ký nằm ở `/api/v1/journal`, đảm bảo cách ly tuyệt đối với các Use Cases UC01-UC06.

---

## 📝 5. Checklist Thi Công Chi Tiết (Implementation Checklist)

- [ ] **Bước 1**: Tạo file `code/backend/app/schemas/stats.py` và `code/backend/app/schemas/journal.py`.
- [ ] **Bước 2**: Tạo file `code/backend/app/api/v1/stats.py` (Router Streak & Productivity Stats).
- [ ] **Bước 3**: Tạo file `code/backend/app/api/v1/journal.py` (Router Daily Summary, Journal CRUD, Auto-save Draft).
- [ ] **Bước 4**: Đăng ký `stats_router` và `journal_router` trong `code/backend/main.py`.
- [ ] **Bước 5**: Tạo và chạy script kiểm thử tích hợp `code/backend/test_api_uc07_uc08.py` trên Supabase PostgreSQL.
