# Kế Hoạch & Thẩm Định Kỹ Thuật Frontend UC01, UC02 & UC03

Tài liệu này định nghĩa thiết kế giao diện (UI/UX), kiến trúc mã nguồn và Hợp đồng thẩm định (Validate Contract) cho Frontend (React, Vite, Tailwind CSS, Lucide Icons) phục vụ 3 chức năng:
- **UC01: Đăng ký, Đăng nhập và Quản lý Hồ sơ người dùng**
- **UC02: Xem và quản lý công việc theo Khối chủ đề**
- **UC03: Tạo công việc mới**

Giao diện áp dụng chuẩn phong cách **"Solar Pastel Pop" / Y2K Brutalism** được định nghĩa chi tiết tại [`docs/overview/design-pattern.md`](file:///d:/Study/project/task-management/docs/overview/design-pattern.md).

---

## 📋 Context Envelope (Thông Tin Ngữ Cảnh)

```yaml
feature: frontend_core_auth_topics_tasks
phase: PLAN & VALIDATE
session-goal: Khóa kiến trúc UI/UX và thẩm định phương án lập trình Frontend cho UC01, UC02 & UC03
target-services: code/frontend/ (React, Vite, Tailwind CSS, Lucide React, Axios, React Router)
vibe-design-system: docs/overview/design-pattern.md ("Solar Pastel Pop" - Pop-Retro Modern)
validate-contract: PASS
```

---

## 🎨 1. Định Hướng Vibe & Design Foundations ("Solar Pastel Pop")

### A. Bảng Màu Thừa Kế (Color Tokens)
- **Primary / Warm Accent**: `Sunlit Melon` (`#FF8F7E`) — Dùng cho Nút bấm chính (CTA), Card tiêu đề nổi bật.
- **Vibrant Accent**: `Cupid Pink` (`#FF5CA8`) — Dùng cho Badges, Tag highlight, hiệu ứng hover.
- **Fresh Secondary**: `Veranda Blue` (`#30D5C8`) & `Seafoam Mist` (`#7FE7E2`) — Dùng cho các thẻ trạng thái, tiến độ, chi tiết thông tin.
- **Background & Canvas**: `Peony Cloud` (`#FFF4E6`) — Màu nền kem vani ấm áp chủ đạo cho toàn bộ ứng dụng.
- **Text / High Contrast**: `Deep Warm Charcoal` (`#2D2424`) — Chữ nâu than trầm giúp tương phản sắc nét WCAG AA.
- **Card Background**: `#FFFFFF` — Thẻ khối trắng nổi bật trên nền kem.

### B. Typography Stack (Tiếng Việt Không Lỗi Dấu)
- **Display / Hero Headings**: Font `Syne` (Bold 800/900) — Tiêu đề cá tính mạnh mẽ.
- **Accent & Script**: Font `Playpen Sans` (Italic) — Điểm nhấn chữ viết tay nghệ thuật.
- **Body & UI Text**: Font `Plus Jakarta Sans` (400, 500, 600) — Văn bản đọc thoáng, hỗ trợ đầy đủ dấu tiếng Việt.

### C. Kiểu Dáng Components (Chunky Tactility)
- Bo góc thẻ (`rounded-3xl` / 24px - 32px), bo góc nút kiểu viên thuốc (`rounded-full`).
- Đường viền mảnh hoặc hiệu ứng đổ bóng nổi dầy nhẹ (`shadow-md` / `shadow-lg` ấm áp).
- Hiệu ứng micro-interaction (Hover `scale-105`, chuyển màu mượt `transition-all duration-200`).

---

## 🏛️ 2. Sơ Đồ Kiến Trúc Frontend & Cây Components

```
[ App.jsx ] (BrowserRouter + AuthProvider + ToastContainer)
   │
   ├── [ Navbar.jsx ] (Logo Syne, Nav Links, User Dropdown Avatar, Logout Button)
   │
   ├── [ Routes ]
   │    ├── /login          ──> [ LoginPage.jsx ] (Auth Card, Form Validation, Switch to Register)
   │    ├── /register       ──> [ RegisterPage.jsx ] (Auth Card, Form Validation, Switch to Login)
   │    ├── /profile        ──> [ ProfilePage.jsx ] (Edit Name, Avatar URL, Change Password)
   │    ├── /topics         ──> [ TopicGridPage.jsx ] (9 Topic Cards Grid, Progress %, Add Topic Button)
   │    └── /topics/:id     ──> [ TopicDetailPage.jsx ] (Topic Header, Filter Bar, Task List, Edit/Delete)
   │
   └── [ Modals Global ]
        ├── [ CreateTaskModal.jsx ] (Title, Desc, Topic Picker, Date/Time Picker, Pomodoro Counter, Inline New Topic)
        └── [ CreateTopicModal.jsx ] (Title, Desc, Color Code Picker)
```

---

## 🔧 3. Chi Tiết Giao Diện & Logic Xử Lý Theo Use Cases

### A. UC01: Đăng ký, Đăng nhập và Quản lý Hồ sơ người dùng
- **Màn hình Đăng nhập (`/login`) & Đăng ký (`/register`)**:
  - Thẻ Auth đặt ở trung tâm màn hình trên nền `Peony Cloud`, viền mềm bo góc 32px (`rounded-3xl`).
  - Nút Submit hình dạng viên thuốc (`rounded-full`) màu `Sunlit Melon` (`#FF8F7E`), chữ trắng bold.
  - Tích hợp Axios gọi API Backend (`POST /api/v1/auth/login`, `POST /api/v1/auth/register`).
  - Lưu JWT Token vào `localStorage` và tự động đính kèm header `Authorization: Bearer <token>` thông qua Axios Interceptor.
- **Màn hình Hồ sơ cá nhân (`/profile`)**:
  - Hiển thị Avatar tròn lớn kèm badge tên người dùng font `Syne`.
  - Form chỉnh sửa Họ tên, URL ảnh đại diện (`PUT /api/v1/users/me`) và Form Đổi mật khẩu (`POST /api/v1/users/me/change-password`).
  - Nút "Đăng xuất" kích hoạt hàm xóa token và chuyển hướng về `/login`.

### B. UC02: Xem và Quản lý Công việc theo Khối Chủ Đề
- **Màn hình Trang Khối Chủ Đề (`/topics`)**:
  - Tiêu đề "Khối Chủ Đề Học Tập" dùng font `Syne` đan xen font `Playpen Sans` viết tay.
  - Lưới 3x3 thẻ Khối chủ đề (`TopicCard.jsx`): Hiển thị màu chủ đề (`color_code`), Tên chủ đề, Mô tả, Badge số task (`total_tasks`), và Thanh tiến độ hoàn thành (`completed_tasks / total_tasks * 100%`).
  - Nút "Thêm Chủ Đề Mới" dạng Card nét đứt rực rỡ mở `CreateTopicModal`.
- **Màn hình Trang Chi Tiết Chủ Đề (`/topics/:id`)**:
  - Banner tiêu đề chủ đề rực rỡ theo tone màu chủ đề (`color_code`).
  - Thanh bộ lọc công việc (Tìm kiếm theo tên, Lọc theo trạng thái `PENDING`, `IN_PROGRESS`, `COMPLETED`).
  - Danh sách thẻ task (`TaskCard.jsx`): Hiển thị Tên task, Mốc giờ, Số quả Pomodoro 🍅, Nút Chỉnh sửa (Chiếc bút) và Nút Xóa (Thùng rác). Kích hoạt API sửa/xóa UC04.

### C. UC03: Tạo Công Việc Mới
- **Modal Popup Tạo Task (`CreateTaskModal.jsx`)**:
  - Hiển thị Popup phủ mờ mượt mà trên màn hình (Backdrop Blur).
  - Biểu mẫu nhập: Tên task (bắt buộc), Mô tả, Chọn Khối chủ đề (dropdown danh sách chủ đề của user + Tùy chọn "＋ Tạo chủ đề mới trực tiếp"), Chọn Ngày thực hiện (`scheduled_date`), Giờ bắt đầu (`start_time`), Giờ kết thúc (`end_time`).
  - Bộ đếm số quả Pomodoro mục tiêu: Nút Trừ `-` và Cộng `+` trực quan kèm biểu tượng 🍅.
  - Khi ấn "Lưu công việc": Gọi API `POST /api/v1/tasks`, hiển thị thông báo Toast thành công, đóng Modal và tự động làm mới danh sách task & tiến độ chủ đề.

---

## 🛡️ 4. Hợp Đồng Thẩm Định & An Toàn (Validate Contract)

> **Căn cứ theo tiêu chuẩn `vc-validate-agent.md`**

```yaml
validate-contract:
  gate-verdict: PASS
  generated-by: vc-validate-agent
  timestamp: 2026-09-19T22:12:00+07:00
```

### Thẩm định 4 Dạng An toàn (Four Dimension Audit)

1. **Hạ tầng & Tech Stack (Infrastructure Readiness)**: `PASS`
   - Khởi tạo dự án React + Vite trong thư mục `code/frontend` bằng `npm create vite@latest`.
   - Cài đặt Tailwind CSS, Lucide React (Icons), Axios, React Router DOM.
   - Nạp Google Fonts (`Syne`, `Playpen Sans`, `Plus Jakarta Sans`) trong `index.html`.

2. **Bảo mật & Quản lý Phiên (Security & Auth Audit)**: `PASS`
   - **Xác thực Route (Protected Routes)**: Tự động chuyển hướng người dùng về `/login` nếu chưa đăng nhập khi truy cập các trang `/topics`, `/profile`.
   - **Xử lý Token hết hạn**: Axios Interceptor tự động bắt lỗi `401 Unauthorized` và đăng xuất an toàn.

3. **Kiểm thử Giao diện & Tương tác (Test Coverage Matrix)**: `PASS`
   - Kiểm thử render thành công các màn hình Auth, Topic Grid, Topic Detail và Modal.
   - Kiểm thử kết nối API thực tế với Backend FastAPI (`http://localhost:8000/api/v1`).

4. **Tương thích & Scope Fence**: `PASS`
   - Không can thiệp mã nguồn backend, chỉ tương tác qua các RESTful API endpoints đã xây dựng chuẩn ở UC01, UC02, UC03.

---

## 📝 5. Checklist Thi Công Chi Tiết (Implementation Checklist)

- [ ] **Bước 1**: Khởi tạo dự án `code/frontend` bằng Vite (React + JavaScript), cài đặt Tailwind CSS, Axios, Lucide React, React Router DOM.
- [ ] **Bước 2**: Cấu hình Google Fonts & CSS Tokens "Solar Pastel Pop" trong `tailwind.config.js` và `src/index.css`.
- [ ] **Bước 3**: Thi công Auth Context & Axios API Service (`src/services/api.js`, `src/context/AuthContext.jsx`).
- [ ] **Bước 4**: Thi công UI UC01 (`src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`, `src/pages/ProfilePage.jsx`, `src/components/Navbar.jsx`).
- [ ] **Bước 5**: Thi công UI UC02 & UC03 (`src/pages/TopicGridPage.jsx`, `src/pages/TopicDetailPage.jsx`, `src/components/CreateTaskModal.jsx`, `src/components/CreateTopicModal.jsx`).
