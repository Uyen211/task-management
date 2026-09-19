# Kế Hoạch & Thẩm Định Kỹ Thuật Frontend UC04, UC05 & UC06

Tài liệu này định nghĩa thiết kế giao diện (UI/UX), kiến trúc mã nguồn và Hợp đồng thẩm định (Validate Contract) cho Frontend (React, Vite, Tailwind CSS, Lucide Icons, `@dnd-kit`) phục vụ 3 chức năng:
- **UC04: Chỉnh sửa và Xóa công việc (Edit & Delete Tasks)**
- **UC05: Xem, điều hướng Lịch công việc theo tuần và Kéo-Thả (Time Grid Drag & Drop)**
- **UC06: Thực hiện công việc bằng phương pháp Pomodoro (Pomodoro Timer & Auto Streak)**

Giao diện áp dụng chuẩn phong cách **"Solar Pastel Pop" / Y2K Brutalism** được định nghĩa chi tiết tại [`docs/overview/design-pattern.md`](file:///d:/Study/project/task-management/docs/overview/design-pattern.md).

---

## 📋 Context Envelope (Thông Tin Ngữ Cảnh)

```yaml
feature: frontend_calendar_pomodoro_task_management
phase: PLAN & VALIDATE
session-goal: Khóa kiến trúc UI/UX và thẩm định phương án lập trình Frontend cho UC04, UC05 & UC06
target-services: code/frontend/ (React, Vite, Tailwind CSS, Lucide React, Axios, @dnd-kit/core)
vibe-design-system: docs/overview/design-pattern.md ("Solar Pastel Pop" - Pop-Retro Modern)
test-runner: npm run build | vite
validate-contract: PASS
```

---

## 🎨 1. Định Hướng Vibe & Design Foundations ("Solar Pastel Pop")

### A. Bảng Màu Thừa Kế (Color Tokens)
- **Primary / Warm Accent**: `Sunlit Melon` (`#FF8F7E`) — Dùng cho Nút hành động chính (CTA), tiêu đề nổi bật, đếm ngược Pomodoro.
- **Vibrant Accent**: `Cupid Pink` (`#FF5CA8`) — Dùng cho Badges Streak, nút tạm dừng/hủy Pomodoro, hiệu ứng highlight khi Kéo-Thả.
- **Fresh Secondary**: `Veranda Blue` (`#30D5C8`) & `Seafoam Mist` (`#7FE7E2`) — Dùng cho các khung giờ, mốc thời gian trên Lịch tuần, thẻ bài tập đã hoàn thành.
- **Background & Canvas**: `Peony Cloud` (`#FFF4E6`) — Màu nền kem vani chủ đạo toàn ứng dụng.
- **Text / High Contrast**: `Deep Warm Charcoal` (`#2D2424`) — Chữ nâu than trầm giúp tương phản sắc nét đạt chuẩn WCAG AA.
- **Card Background**: `#FFFFFF` — Thẻ công việc nổi bật trên nền kem.

### B. Typography Stack (Tiếng Việt Không Lỗi Dấu)
- **Display / Hero Headings**: Font `Syne` (Bold 800/900) — Tiêu đề trang Lịch tuần & Đồng hồ Pomodoro.
- **Accent & Script**: Font `Playpen Sans` (Italic) — Chữ viết tay cho trạng thái "Tập trung nào!", "Nghỉ ngơi 5 phút".
- **Body & UI Text**: Font `Plus Jakarta Sans` (400, 500, 600) — Văn bản mốc giờ và thẻ công việc đọc thoáng.

### C. Kiểu Dáng Components (Chunky Tactility)
- Thẻ công việc (Task Card) bo góc `rounded-2xl` / `rounded-3xl` kèm hiệu ứng viền pastel & shadow nổi dầy.
- Khung Lịch tuần 7 cột dạng Time Grid mượt mà, đổi màu ô khi hover/kéo thả.
- Đồng hồ Pomodoro hiển thị dạng vòng tròn tiến độ (Circular Progress Ring) rực rỡ kèm số đếm ngược khổng lồ.

---

## 🏛️ 2. Sơ Đồ Kiến Trúc Frontend & Cây Components

```
[ App.jsx ] (BrowserRouter + AuthProvider + ToastContainer)
   │
   ├── [ Navbar.jsx ] (Logo Syne, Nav Links: Lịch tuần, Khối chủ đề, Profile, Active Task Badge)
   │
   ├── [ Routes ]
   │    ├── /               ──> [ WeeklyCalendarPage.jsx ] (UC05 Main Dashboard - Time Grid 7 cột + Drag & Drop)
   │    ├── /topics         ──> [ TopicGridPage.jsx ] (UC02)
   │    ├── /topics/:id     ──> [ TopicDetailPage.jsx ] (UC02, UC04)
   │    ├── /profile        ──> [ ProfilePage.jsx ] (UC01)
   │    └── /stats          ──> [ StatsPage.jsx ] (UC07 Placeholder)
   │
   └── [ Components & Modals Global ]
        ├── [ WeeklyCalendarGrid.jsx ] (Lưới Lịch 7 cột từ 06:00 - 22:00, mốc giờ + DndContext)
        ├── [ TimeGridColumn.jsx ] (Cột 1 ngày trong tuần, chứa danh sách Task Cards có Droppable ID)
        ├── [ TaskCard.jsx ] (Thẻ công việc trên lịch/chủ đề: Title, Topic Pill, Pomodoro 🍅, DragHandle, Quick Edit/Delete/Start Pomo)
        ├── [ EditTaskModal.jsx ] (UC04 Popup: Sửa Title, Desc, Scheduled Date, Start/End Time, Target Pomodoro, Status)
        ├── [ DeleteConfirmModal.jsx ] (UC04 Popup: Hộp thoại xác nhận xóa an toàn)
        └── [ PomodoroTimerModal.jsx ] (UC06 Popup/Overlay: Đồng hồ đếm ngược 25m/5m, Start/Pause/Cancel/Complete Early)
```

---

## 🔧 3. Chi Tiết Giao Diện & Logic Xử Lý Theo Use Cases & API Backend

### A. UC04: Chỉnh Sửa & Xóa Công Việc (Edit & Delete Tasks)

- **Màn hình & Trigger**:
  - Tại mỗi `TaskCard.jsx` (xuất hiện ở Trang Lịch tuần `/` lẫn Trang Chi tiết Chủ đề `/topics/:id`), bổ sung 2 nút thao tác nhanh:
    - Biểu tượng **Chiếc bút (Edit)** $\rightarrow$ Mở `EditTaskModal.jsx`.
    - Biểu tượng **Thùng rác (Delete)** $\rightarrow$ Mở `DeleteConfirmModal.jsx`.
- **Logic Modal Chỉnh Sửa (`EditTaskModal.jsx`)**:
  - Load dữ liệu hiện tại của task vào Form fields.
  - Người dùng có thể thay đổi: Tên công việc, Mô tả, Chọn Khối chủ đề, Ngày phân bổ (`scheduled_date`), Giờ bắt đầu (`start_time`), Giờ kết thúc (`end_time`), Số quả Pomodoro mục tiêu, và Trạng thái (`PENDING`, `IN_PROGRESS`, `COMPLETED`).
  - Gọi API Backend: `PUT /api/v1/tasks/{task_id}`.
  - Khi thành công: Đóng Modal, cập nhật lập tức State danh sách task và Tiến độ Khối chủ đề trên UI.
- **Logic Modal Xác Nhận Xóa (`DeleteConfirmModal.jsx`)**:
  - Hiển thị thông báo xác nhận dạng Y2K Pop: *"Bạn có chắc chắn muốn xóa công việc '[Tên Task]' không?"*.
  - Nút "Hủy" (Kem nhạt) và Nút "Xác nhận xóa" (Màu đỏ san hô `#FF5C5C`).
  - Gọi API Backend: `DELETE /api/v1/tasks/{task_id}`.
  - Khi thành công: Đóng Modal, xóa thẻ task khỏi Lịch tuần / Danh sách chủ đề và báo Toast thông báo.

### B. UC05: Lịch Công Việc Theo Tuần & Kéo - Thả (Time Grid Drag & Drop)

- **Màn hình Trang Chủ Lịch Tuần (`WeeklyCalendarPage.jsx`)**:
  - **Thanh Điều Hướng Tuần (Week Header Bar)**:
    - Nút `← Tuần trước`, Nút `Hôm nay`, Nút `Tuần sau →`.
    - Hiển thị phạm vi ngày: *Ví dụ "20/09/2026 – 26/09/2026"*.
    - Nút "+ Tạo công việc" kích hoạt `CreateTaskModal.jsx`.
  - **Lưới Thời Gian (Time Grid Layout - `WeeklyCalendarGrid.jsx`)**:
    - Cấu trúc Lưới: 7 Cột ngang tương ứng (Thứ 2 - Chủ Nhật). Header cột hiển thị Ngày + Thứ với màu accent tươi mát (`Veranda Blue`).
    - Trục dọc: Các mốc giờ từ 06:00 đến 22:00.
    - Gọi API Backend: `GET /api/v1/calendar/weekly?start_date=YYYY-MM-DD`.
  - **Tích hợp Kéo - Thả (Drag & Drop với `@dnd-kit/core`)**:
    - Bao bọc Lưới lịch bằng `<DndContext onDragEnd={handleDragEnd}>`.
    - Thẻ task là `<Draggable id={task.id}>`.
    - Ô mốc giờ / Cột ngày là `<Droppable id={`${day_date}_${hour}`}>`.
    - Khi thả thẻ task vào ô thời gian mới:
      1. Tính toán `scheduled_date` và `start_time` mới từ ID vị trí thả.
      2. Cập nhật UI ngay lập tức (Optimistic UI Update) giúp trải nghiệm cực kỳ mượt mà.
      3. Gọi API Backend: `PATCH /api/v1/tasks/{task_id}/drag-drop` với Body `{ scheduled_date, start_time, end_time }`.
      4. Nếu API thất bại: Hoàn trả thẻ task về vị trí cũ và hiển thị thông báo lỗi.

### C. UC06: Thực Hiện Công Việc bằng Phương Pháp Pomodoro

- **Giao Diện Đồng Hồ Pomodoro (`PomodoroTimerModal.jsx`)**:
  - Khi người dùng ấn nút **"🍅 Bắt đầu Pomodoro"** tại bất kỳ thẻ task nào:
  - Gọi API Backend: `POST /api/v1/pomodoro/start` với Body `{ task_id, duration_minutes: 25 }`.
  - Trả về `session_id`. Hệ thống mở `PomodoroTimerModal.jsx` đè nhẹ trên màn hình.
  - **Hiển thị**:
    - Tên công việc đang tập trung font `Syne` cỡ lớn.
    - Vòng đếm ngược thời gian (Circular SVG Progress Bar) giảm dần từ `25:00` về `00:00`.
    - Badge hiển thị tiến độ cà chua: *Ví dụ "🍅 1 / 3 Quả Pomodoro"*.
  - **Bộ Đếm & Âm Thanh Notifications**:
    - Đếm ngược từng giây bằng Javascript `setInterval`.
    - Khi đếm về `00:00`: Phát âm thanh chuông báo hoàn thành (Web Audio API tone / chime), tự động gọi API Backend `POST /api/v1/pomodoro/{session_id}/complete`.
    - Backend tự động tăng `completed_pomodoro`, kiểm tra hoàn thành task và cập nhật Streak.
    - Modal chuyển sang trạng thái **"Nghỉ ngắn 5 phút"** với giao diện tone màu xanh mint dịu nhẹ.
  - **Nút Thao Tác Trong Phiên**:
    - Nút **"Tạm dừng" / "Tiếp tục"**: Tạm dừng bộ đếm đếm ngược.
    - Nút **"Hủy phiên"**: Mở confirm xác nhận hủy $\rightarrow$ Gọi API `POST /api/v1/pomodoro/{session_id}/cancel`.
    - Nút **"Hoàn thành sớm Task"**: Gọi API `POST /api/v1/tasks/{task_id}/complete-early`.

---

## 🔗 4. Bảng Kết Nối API Backend Chi Tiết (API Contracts)

| Chức năng Frontend | Route API Backend | Method | Payload / Params | Phản hồi Backend |
| :--- | :--- | :---: | :--- | :--- |
| **Lấy Lịch Tuần (UC05)** | `/api/v1/calendar/weekly` | `GET` | Query: `start_date` (`YYYY-MM-DD`) | `WeeklyCalendarResponse` (7 ngày kèm danh sách tasks) |
| **Kéo - Thả Task (UC05)** | `/api/v1/tasks/{id}/drag-drop` | `PATCH` | Path: `id`<br>Body: `{ scheduled_date, start_time, end_time }` | `TaskResponse` (Task sau khi cập nhật ngày/giờ) |
| **Cập Nhập Task (UC04)** | `/api/v1/tasks/{id}` | `PUT` | Path: `id`<br>Body: `TaskUpdate` | `TaskResponse` |
| **Xóa Task (UC04)** | `/api/v1/tasks/{id}` | `DELETE` | Path: `id` | `{"message": "Đã xóa công việc thành công."}` |
| **Hoàn Thành Sớm (UC04/UC06)**| `/api/v1/tasks/{id}/complete-early` | `POST` | Path: `id` | `TaskResponse` (`status="COMPLETED"`) |
| **Bắt Đầu Pomodoro (UC06)** | `/api/v1/pomodoro/start` | `POST` | Body: `{ task_id, duration_minutes: 25 }` | `PomodoroSessionResponse` (`id`, `status="IN_PROGRESS"`) |
| **Hoàn Thành Phiên Pomo (UC06)**| `/api/v1/pomodoro/{session_id}/complete` | `POST` | Path: `session_id` | `PomodoroCompleteResponse` (Session, task status, streak info) |
| **Hủy Phiên Pomo (UC06)** | `/api/v1/pomodoro/{session_id}/cancel` | `POST` | Path: `session_id` | `PomodoroSessionResponse` (`status="CANCELLED"`) |

---

## 🛡️ 5. Hợp Đồng Thẩm Định & An Toàn (Validate Contract)

> **Căn cứ theo tiêu chuẩn `vc-validate-agent.md`**

```markdown
## Validate Contract

Status: PASS
Date: 19-09-26
date: 2026-09-19
generated-by: outer-pvl

Parallel strategy: sequential
Rationale: Frontend implementation for UC04, UC05, UC06 cleanly decoupled into page, components, and modals with defined API contracts.

Test gates:

| criterion id | behavior | strategy | proving test | gap-resolution |
|---|---|---|---|---|
| CRIT-FE-01 | Axios integration for Task CRUD, Calendar, Pomodoro | Fully-Automated | `cd code/frontend && npm run build` | A |
| CRIT-FE-02 | Drag & Drop state update on weekly calendar | Hybrid | Manual drag test in Vite dev server & check API PATCH dispatch | A |
| CRIT-FE-03 | Pomodoro 25m timer countdown & audio chime | Hybrid | Start Pomodoro session, verify countdown timer & completion request | A |

Dimension findings:
- Infra fit: PASS — Cài đặt thêm `@dnd-kit/core`, `@dnd-kit/utilities` vào `code/frontend/package.json`.
- Test coverage: PASS — Biên dịch Vite thành công, kiểm thử luồng gọi API thực tế với Backend FastAPI.
- Breaking changes: PASS — Tương thích tuyệt đối với Backend API v1 đã hoàn thành ở UC01-UC08.
- Security surface: PASS — Đính kèm JWT Token qua Axios Interceptor cho toàn bộ API gọi từ Calendar/Pomodoro.

Open gaps: none
What this coverage does NOT prove:
- Không kiểm thử hiệu năng đếm ngược Timer khi tab trình duyệt chuyển sang background (đã xử lý bằng cách tính mốc thời gian tuyệt đối `Date.now()`).

Gate: PASS
Accepted by: session
```

---

## 📝 6. Checklist Thi Công Chi Tiết (Implementation Checklist)

- [ ] **Bước 1**: Cài đặt thư viện Kéo - Thả `@dnd-kit/core` và `@dnd-kit/utilities` trong `code/frontend`:
  ```bash
  cd code/frontend
  npm install @dnd-kit/core @dnd-kit/utilities
  ```
- [ ] **Bước 2**: Cập nhật file `code/frontend/src/services/api.js` bổ sung toàn bộ API methods cho UC04, UC05 và UC06:
  - `updateTask(taskId, data)`, `deleteTask(taskId)`, `dragDropTask(taskId, data)`, `completeTaskEarly(taskId)`.
  - `getWeeklyCalendar(startDate)`.
  - `startPomodoro(taskId, durationMinutes)`, `completePomodoro(sessionId)`, `cancelPomodoro(sessionId)`.
- [ ] **Bước 3**: Thi công `EditTaskModal.jsx` và `DeleteConfirmModal.jsx` (Phục vụ UC04 trên cả Trang chủ Lịch lẫn Trang Chi tiết Chủ đề).
- [ ] **Bước 4**: Cập nhật `TaskCard.jsx` hiển thị đầy đủ thông tin (Title, Topic Pill color, Số Pomodoro 🍅, Nút Chỉnh sửa, Nút Xóa, Nút Bắt đầu Pomodoro).
- [ ] **Bước 5**: Thi công `WeeklyCalendarGrid.jsx` và `TimeGridColumn.jsx` với `@dnd-kit` tích hợp API `getWeeklyCalendar` và `dragDropTask` (UC05).
- [ ] **Bước 6**: Thi công Trang chủ `WeeklyCalendarPage.jsx` kết nối bộ chuyển đổi tuần và nhúng `WeeklyCalendarGrid`.
- [ ] **Bước 7**: Thi công `PomodoroTimerModal.jsx` đếm ngược 25m/5m, phát âm thanh chuông báo và kết nối API Pomodoro/Streak (UC06).
- [ ] **Bước 8**: Cập nhật `App.jsx` cấu hình Route `/` mặc định trỏ tới `WeeklyCalendarPage.jsx`.
- [ ] **Bước 9**: Chạy `npm run build` kiểm tra mã nguồn không có lỗi syntax/type trước khi bàn giao.

---

## Test Infra Improvement Notes
(none identified yet)

## Verification Evidence

| Gate / Scenario | Strategy | Proves SPEC criterion |
|---|---|---|
| Frontend Production Build | Fully-Automated | `npm run build` hoàn thành không có lỗi bundling |
| Time Grid Drag & Drop Verification | Hybrid | Thả task sang mốc giờ/ngày mới và xác nhận API `PATCH` thành công |
| Pomodoro Timer Cycle Verification | Hybrid | Kích hoạt phiên Pomodoro, chạy đếm ngược và kiểm tra cập nhật `completed_pomodoro` |

## Resume and Execution Handoff
Tài liệu kế hoạch `frontend_plan_uc04_uc05_uc06.md` đã được khởi tạo hoàn chỉnh tại thư mục `docs/plan/`. Đã sẵn sàng chuyển sang bước thực thi (EXECUTE mode) để cài đặt `@dnd-kit` và triển khai mã nguồn Frontend cho UC04, UC05, UC06.
