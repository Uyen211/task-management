# 🎯 Task Management System theo Lộ Trình Học Tập

Hệ thống Web Quản lý Công việc (Task Management) cá nhân hiện đại, kết hợp phân bổ công việc theo Lộ trình học tập (Roadmap), Phương pháp tập trung Pomodoro, Lịch tuần Kéo - Thả (Time Grid Drag & Drop), Chuỗi ngày làm việc (Streak) và Trình soạn thảo Nhật ký cá nhân (Daily Journal).

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+)
- **ORM & Database**: SQLAlchemy 2.0 + Psycopg2 kết nối trực tiếp **Supabase PostgreSQL**
- **Xác thực**: JWT Token (python-jose) + Bcrypt Hashing (passlib)
- **Virtual Environment**: Python `venv`

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Drag & Drop**: `@dnd-kit/core` & `@dnd-kit/sortable`
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Hạ tầng & Đóng gói (Infrastructure & DevOps)
- **Containerization**: Docker & Docker Compose

---

## 📁 Cấu Trúc Dự Án

```
task-management/
├── docs/                                  # Thư mục Tài liệu Hệ thống
│   ├── data/                              # Các lộ trình học gốc (Tiếng Anh, ML, Kiến trúc PM)
│   └── overview/                          # Tài liệu Phân tích & Kế hoạch
│       ├── usecases.md                    # Tài liệu Use Cases chi tiết theo thứ tự phát triển
│       ├── database.md                    # Lược đồ Cơ sở dữ liệu Supabase PostgreSQL
│       └── schedule.md                    # Kế hoạch Lịch học tập phân chia theo tuần
│
├── code/                                  # Thư mục Mã nguồn & Môi trường dự án
│   ├── .env                               # File chứa biến môi trường & kết nối Supabase
│   ├── docker-compose.yml                 # Cấu hình Docker Compose
│   ├── backend/                           # Service FastAPI Backend
│   │   ├── .venv/                         # Môi trường ảo Python
│   │   ├── app/                           # Core, Models, Schemas, API Endpoints
│   │   ├── main.py                        # Entrypoint ứng dụng FastAPI
│   │   ├── init_db.py                     # Script đẩy DDL schema lên Supabase
│   │   └── seed_data.py                   # Script nạp dữ liệu lộ trình 10 tuần vào Supabase
│   └── frontend/                          # Service React (Vite) + Tailwind CSS Frontend
│       ├── src/                           # Components, Pages, Services, Styling
│       ├── tailwind.config.js             # Cấu hình Tailwind CSS
│       └── vite.config.js
└── README.md                              # Tài liệu Hướng dẫn Dự án
```

---

## 📖 Tài Liệu Tham Chiếu (Documentation)

- [Tài liệu Use Cases chi tiết](docs/overview/usecases.md)
- [Tài liệu Thiết kế Cơ sở Dữ liệu Supabase](docs/overview/database.md)
- [Lịch Học tập Dài hạn theo tuần](docs/overview/schedule.md)

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Chuẩn bị Môi trường Backend (FastAPI)

```bash
cd code/backend

# Tạo và kích hoạt môi trường ảo Python
python -m venv .venv
# Trên Windows:
.venv\Scripts\activate

# Cài đặt các gói phụ thuộc
pip install -r requirements.txt

# Tạo bảng CSDL trên Supabase PostgreSQL (nếu chưa tạo)
python init_db.py

# Seed nạp dữ liệu lộ trình 10 tuần vào Supabase
python seed_data.py

# Khởi chạy Backend Server
python main.py
# API Docs tại: http://localhost:8000/docs
```

### 2. Chuẩn bị Môi trường Frontend (React + Vite + Tailwind CSS)

```bash
cd code/frontend

# Cài đặt các gói phụ thuộc
npm install

# Khởi chạy Vite Dev Server
npm run dev
# Frontend chạy tại: http://localhost:5173
```

### 3. Khởi chạy bằng Docker Compose

```bash
cd code

# Khởi chạy cả Backend và Frontend container
docker-compose up -d --build
```
