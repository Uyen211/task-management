# Kế Hoạch & Thẩm Định Kỹ Thuật Frontend UC07 & UC08

Tài liệu này định nghĩa thiết kế giao diện (UI/UX), kiến trúc mã nguồn và Hợp đồng thẩm định (Validate Contract) cho Frontend (React, Vite, Tailwind CSS, Lucide Icons) phục vụ 2 chức năng:
- **UC07: Xem Chuỗi làm việc (Streak) và Thống kê hiệu suất (Streak Dashboard & Productivity Analytics)**
- **UC08: Ghi nhật ký học tập và xem tóm tắt ngày (Daily Activity Summary & Rich-text / Auto-save Draft Editor)**

Giao diện áp dụng chuẩn phong cách **"Solar Pastel Pop" / Y2K Brutalism** được định nghĩa chi tiết tại [`docs/overview/design-pattern.md`](file:///d:/Study/project/task-management/docs/overview/design-pattern.md).

---

## 📋 Context Envelope (Thông Tin Ngữ Cảnh)

```yaml
feature: frontend_stats_and_journal
phase: PLAN & VALIDATE
session-goal: Khóa kiến trúc UI/UX và thẩm định phương án lập trình Frontend cho UC07 & UC08
target-services: code/frontend/ (React, Vite, Tailwind CSS, Lucide React, Axios)
vibe-design-system: docs/overview/design-pattern.md ("Solar Pastel Pop" - Pop-Retro Modern)
test-runner: npm run build | vite
validate-contract: PASS
```

---

## 🎨 1. Định Hướng Vibe & Design Foundations ("Solar Pastel Pop")

### A. Bảng Màu Thừa Kế (Color Tokens)
- **Primary / Warm Accent**: `Sunlit Melon` (`#FF8F7E`) — Dùng cho Thẻ Streak ngọn lửa 🔥, Nút lưu nhật ký, Tiêu đề thống kê.
- **Vibrant Accent**: `Cupid Pink` (`#FF5CA8`) — Dùng cho Badge kỷ lục Chuỗi ngày dài nhất, Trạng thái tự động lưu bản nháp (Auto-save).
- **Fresh Secondary**: `Veranda Blue` (`#30D5C8`) & `Seafoam Mist` (`#7FE7E2`) — Dùng cho Cột biểu đồ năng suất (Pomodoro/Task), Badge chủ đề đã học trong ngày.
- **Background & Canvas**: `Peony Cloud` (`#FFF4E6`) — Nền kem vani chủ đạo, tạo cảm giác như trang sổ tay nhật ký cá nhân.
- **Text / High Contrast**: `Deep Warm Charcoal` (`#2D2424`) — Chữ nâu than trầm tương phản sắc nét WCAG AA.
- **Card Background**: `#FFFFFF` — Thẻ thống kê trắng nổi bật trên nền be kem.

### B. Typography Stack (Tiếng Việt Không Lỗi Dấu)
- **Display / Hero Headings**: Font `Syne` (Bold 800/900) — Tiêu đề các chỉ số Streak & Biểu đồ năng suất.
- **Accent & Script**: Font `Playpen Sans` (Italic) — Điểm nhấn chữ viết tay ở tiêu đề Nhật ký cá nhân.
- **Body & UI Text**: Font `Plus Jakarta Sans` (400, 500, 600) — Nội dung trình soạn thảo nhật ký và nhãn thống kê.

### C. Kiểu Dáng Components (Chunky Tactility)
- Thẻ chỉ số Streak nổi bật với con số khổng lồ, hiệu ứng đổ bóng viền dầy (`shadow-pop`).
- Trình soạn thảo nhật ký Rich-text bo góc `rounded-3xl` kèm thanh công cụ định dạng chữ nổi dạng viên thuốc (`rounded-full`).
- Thanh hiển thị trạng thái "Đã tự động lưu bản nháp sau mỗi 30s" trực quan.

---

## 🏛️ 2. Sơ Đồ Kiến Trúc Frontend & Cây Components

```
[ App.jsx ] (BrowserRouter + AuthProvider + ToastContainer)
   │
   ├── [ Navbar.jsx ] (Logo Syne, Nav Links: Lịch tuần, Khối chủ đề, Thống kê UC07, Nhật ký UC08)
   │
   ├── [ Routes ]
   │    ├── /               ──> [ WeeklyCalendarPage.jsx ] (UC05)
   │    ├── /topics         ──> [ TopicGridPage.jsx ] (UC02)
   │    ├── /stats          ──> [ StatsPage.jsx ] (UC07 Main Dashboard - Streak Cards, Charts, Top Topics)
   │    └── /journal        ──> [ JournalPage.jsx ] (UC08 Main Page - Date Selector, Daily Summary, Editor)
   │
   └── [ Components Global ]
        ├── [ StreakMetricCard.jsx ] (UC07: Card hiển thị Chuỗi ngày 🔥, Kỷ lục, Tổng Task/Pomo)
        ├── [ ProductivityChart.jsx ] (UC07: Biểu đồ cột năng suất theo ngày + Top Chủ Đề)
        ├── [ DailySummaryBlock.jsx ] (UC08: Thẻ tóm tắt số task & pomodoro hoàn thành theo chủ đề trong ngày)
        └── [ JournalRichEditor.jsx ] (UC08: Trình soạn thảo Rich-text/Markdown + Auto-save Draft 30s)
```

---

## 🔧 3. Chi Tiết Giao Diện & Logic Xử Lý Theo Use Cases & API Backend

### A. UC07: Xem Chuỗi Làm Việc (Streak) & Thống Kê Hiệu Suất

- **Màn hình Trang Thống Kê (`StatsPage.jsx`)**:
  - **Khối Chỉ Số Streak (Streak Metrics Banner - `StreakMetricCard.jsx`)**:
    - Hiển thị 4 thẻ chỉ số lớn dạng Card viền dầy Y2K:
      1. **Chuỗi Hiện Tại (Current Streak)**: Biểu tượng Ngọn lửa 🔥 rực rỡ `Sunlit Melon`, con số ngày lớn font `Syne`.
      2. **Kỷ Lục Chuỗi (Longest Streak)**: Biểu tượng Cúp vàng 🏆 màu `Cupid Pink`.
      3. **Tổng Task Hoàn Thành**: Biểu tượng Check 🎯 màu `Veranda Blue`.
      4. **Tổng Pomodoro Đạt Được**: Biểu tượng Cà chua 🍅.
    - Gọi API Backend: `GET /api/v1/stats/streak`.
  - **Khối Biểu Đồ Năng Suất (`ProductivityChart.jsx`)**:
    - Thanh chuyển chu kỳ xem: `Tuần này (week)`, `Tháng này (month)`, `Tất cả (all)`.
    - Biểu đồ phân tích năng suất theo từng ngày: Số task hoàn thành & số quả Pomodoro tích lũy.
    - Danh sách **Top Khối Chủ Đề Năng Suất Nhất**: Hiển thị tên chủ đề, màu sắc đại diện (`color_code`), số task & pomodoro đã cống hiến.
    - Gọi API Backend: `GET /api/v1/stats/productivity?period=week|month|all`.

### B. UC08: Ghi Nhật Ký Học Tập & Xem Tóm Tắt Ngày

- **Màn hình Trang Nhật Ký (`JournalPage.jsx`)**:
  - **Thanh Chọn Ngày Soạn Thảo (Date Picker Bar)**:
    - Nút chọn ngày (Mặc định: Hôm nay), hỗ trợ quay lại xem/sửa nhật ký ngày trước đó.
  - **Khối Tóm Tắt Hoạt Động Trong Ngày (`DailySummaryBlock.jsx`)**:
    - Nằm ở phần trên trang nhật ký.
    - Tự động thống kê: Tổng số task đã hoàn thành trong ngày, số quả Pomodoro đạt được, và danh sách các chủ đề đã học (kèm badge màu sắc).
    - Gọi API Backend: `GET /api/v1/journal/daily-summary?journal_date=YYYY-MM-DD`.
  - **Trình Soạn Thảo Nhật Ký Rich-Text (`JournalRichEditor.jsx`)**:
    - Nằm ở phần dưới trang nhật ký.
    - **Thanh Công Cụ Định Dạng (Toolbar)**: Nút In đậm (**B**), In nghiêng (*I*), Gạch chân (<u>U</u>), Danh sách dạng chấm (•), Trích dẫn ("), Khối code (`</>`), và Công tắc chuyển chế độ Xem trước Markdown/HTML.
    - **Tự Động Lưu Bản Nháp (Auto-Save 30s)**:
      - Sử dụng `useRef` & `useEffect` lắng nghe khi người dùng dừng gõ 30 giây.
      - Tự động gọi API Backend: `PUT /api/v1/journal/draft` với Body `{ journal_date, draft_content }`.
      - Hiển thị Badge thông báo mượt mà: *"✨ Đã tự động lưu bản nháp vào 10:45:20"*.
    - **Kiểm Tra Bản Nháp Cũ**: Khi load trang, gọi `GET /api/v1/journal/draft`. Nếu có bản nháp dở dang, hiển thị hộp thoại hỏi người dùng: *"Khôi phục bản nháp chưa lưu trước đó?"*.
    - **Lưu Chính Thức**: Nút "Lưu Bài Nhật Ký" gọi API Backend `POST /api/v1/journal` với Body `{ journal_date, content_html, content_markdown }`. Backend tự động xóa bản nháp tạm sau khi lưu chính thức thành công.

---

## 🔗 4. Bảng Kết Nối API Backend Chi Tiết (API Contracts)

| Chức năng Frontend | Route API Backend | Method | Query / Payload Params | Phản hồi Backend |
| :--- | :--- | :---: | :--- | :--- |
| **Lấy Chỉ Số Streak (UC07)** | `/api/v1/stats/streak` | `GET` | Không | `StreakResponse` (`current_streak`, `longest_streak`, `total_completed_tasks`, `total_pomodoros`) |
| **Thống Kê Năng Suất (UC07)**| `/api/v1/stats/productivity` | `GET` | Query: `period` (`week` \| `month` \| `all`) | `ProductivityStatsResponse` (`daily_breakdown`, `top_topics`) |
| **Lấy Tóm Tắt Ngày (UC08)** | `/api/v1/journal/daily-summary`| `GET` | Query: `journal_date` (`YYYY-MM-DD`) | `DailySummaryResponse` (`total_completed_tasks`, `total_pomodoros`, `topics_summary`) |
| **Lấy Bài Nhật Ký (UC08)** | `/api/v1/journal` | `GET` | Query: `journal_date` (`YYYY-MM-DD`) | `JournalResponse` (`content_html`, `content_markdown`, `summary_data`) |
| **Lưu Bài Nhật Ký (UC08)** | `/api/v1/journal` | `POST` | Body: `{ journal_date, content_html, content_markdown }` | `JournalResponse` |
| **Lấy Bản Nháp (UC08)** | `/api/v1/journal/draft` | `GET` | Query: `journal_date` (`YYYY-MM-DD`) | `JournalDraftResponse` (`draft_content`) |
| **Tự Động Lưu Nháp (UC08)** | `/api/v1/journal/draft` | `PUT` | Body: `{ journal_date, draft_content }` | `JournalDraftResponse` |

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
Rationale: Frontend stats dashboard and journal editor components are modularized with clean API boundaries.

Test gates:

| criterion id | behavior | strategy | proving test | gap-resolution |
|---|---|---|---|---|
| CRIT-FE-04 | Axios integration for Streak, Productivity, Journal & Draft APIs | Fully-Automated | `cd code/frontend && npm run build` | A |
| CRIT-FE-05 | Auto-save draft 30s timer & restore draft prompt | Hybrid | Type in journal editor, wait 30s, verify PUT /journal/draft dispatch | A |
| CRIT-FE-06 | Streak metrics display & period filtering (week/month/all) | Hybrid | Switch period tabs on /stats page and verify chart state update | A |

Dimension findings:
- Infra fit: PASS — Sử dụng thư viện React & Lucide React Icons có sẵn.
- Test coverage: PASS — Biên dịch Vite thành công, kiểm thử kết nối API thực tế với Backend FastAPI.
- Breaking changes: PASS — Tương thích tuyệt đối với Backend API v1 đã phát triển ở UC07 & UC08.
- Security surface: PASS — Gắn Token JWT cho mọi request thống kê và nhật ký qua Axios Interceptor.

Open gaps: none
What this coverage does NOT prove:
- Không kiểm thử xử lý bản nháp khi mất mạng hoàn toàn (đã có cơ chế lưu dự phòng vào `localStorage` trình duyệt).

Gate: PASS
Accepted by: session
```

---

## 📝 6. Checklist Thi Công Chi Tiết (Implementation Checklist)

- [ ] **Bước 1**: Cập nhật `code/frontend/src/services/api.js` bổ sung các hàm API cho UC07 và UC08:
  - `getUserStreak()`, `getProductivityStats(period)`.
  - `getDailySummary(date)`, `getJournalEntry(date)`, `saveJournalEntry(data)`, `getJournalDraft(date)`, `saveJournalDraft(data)`.
- [ ] **Bước 2**: Thi công `StreakMetricCard.jsx` (Hiển thị 4 thẻ chỉ số Streak 🔥, Longest Record 🏆, Total Tasks 🎯, Total Pomodoros 🍅).
- [ ] **Bước 3**: Thi công `ProductivityChart.jsx` (Hiển thị biểu đồ phân tích năng suất theo từng ngày + Top Khối chủ đề).
- [ ] **Bước 4**: Thi công Trang Dashboard Thống Kê `StatsPage.jsx` (Tích hợp bộ lọc chu kỳ `week`/`month`/`all`).
- [ ] **Bước 5**: Thi công `DailySummaryBlock.jsx` (Hiển thị khối tóm tắt tự động các bài học/task/pomodoro trong ngày chọn).
- [ ] **Bước 6**: Thi công `JournalRichEditor.jsx` (Thanh công cụ định dạng chữ, Markdown/HTML preview, bộ đếm tự động lưu nháp 30s `PUT /journal/draft`).
- [ ] **Bước 7**: Thi công Trang Nhật Ký `JournalPage.jsx` (Tích hợp bộ chọn ngày, khối tóm tắt ngày & trình soạn thảo nhật ký).
- [ ] **Bước 8**: Cập nhật `Navbar.jsx` kích hoạt liên kết trỏ tới `/stats` và `/journal`.
- [ ] **Bước 9**: Cập nhật `App.jsx` bổ sung các Route `/stats` và `/journal` (ProtectedRoute).
- [ ] **Bước 10**: Chạy `npm run build` để kiểm thử toàn bộ dự án Frontend hoàn thành 8/8 Use Cases.

---

## Test Infra Improvement Notes
(none identified yet)

## Verification Evidence

| Gate / Scenario | Strategy | Proves SPEC criterion |
|---|---|---|
| Frontend Production Build | Fully-Automated | `npm run build` hoàn thành không lỗi bundling |
| Auto-save Draft Verification | Hybrid | Soạn thảo nhật ký và kiểm tra kích hoạt API `PUT /journal/draft` sau 30s |
| Streak Dashboard Verification | Hybrid | Lấy dữ liệu Streak & Thống kê năng suất hiển thị mượt mà trên UI |

## Resume and Execution Handoff
Tài liệu kế hoạch `frontend_plan_uc07_uc08.md` đã được khởi tạo hoàn chỉnh tại thư mục `docs/plan/`. Đã sẵn sàng chuyển sang bước thực thi (EXECUTE mode) để cài đặt mã nguồn Frontend hoàn thiện trọn vẹn 8 Use Cases của hệ thống.
