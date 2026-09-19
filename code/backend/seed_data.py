import sys
import os
import datetime
import bcrypt

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.models import User, TopicBlock, Task, UserStreak

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def seed_database():
    db = SessionLocal()
    print("Seeding database on Supabase PostgreSQL...")
    try:
        # 1. Create Demo User if not exists
        demo_user = db.query(User).filter(User.email == "demo@taskmanagement.com").first()
        if not demo_user:
            demo_user = User(
                email="demo@taskmanagement.com",
                password_hash=hash_password("Password123!"),
                full_name="Đỗ Học Viên Demo",
                avatar_url="https://api.dicebear.com/7.x/bottts/svg?seed=DemoUser"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"Created demo user: {demo_user.email} (ID: {demo_user.id})")
        else:
            print(f"Demo user exists: {demo_user.email}")

        # 2. Create User Streak record
        streak = db.query(UserStreak).filter(UserStreak.user_id == demo_user.id).first()
        if not streak:
            streak = UserStreak(
                user_id=demo_user.id,
                current_streak=3,
                longest_streak=7,
                last_activity_date=datetime.date(2026, 9, 19),
                total_completed_tasks=12,
                total_pomodoros=28
            )
            db.add(streak)
            db.commit()
            print("Initialized UserStreak record.")

        # 3. Create 9 Topic Blocks
        topics_def = [
            ("Tiếng Anh Cơ Bản", "Học tiếng Anh ngữ cảnh & Shadowing/Dictation hàng ngày", "#3B82F6"),
            ("Classical Machine Learning", "Ôn tập Toán ML, EDA, Supervised, Unsupervised & Sklearn", "#10B981"),
            ("Deep Learning", "Nơ-ron nhân tạo, PyTorch, CNN, RNN, Transformers & GenAI", "#8B5CF6"),
            ("NLP & Large Language Models", "Tokenization, Embeddings, PhoBERT, GPT, PEFT/LoRA", "#F59E0B"),
            ("RAG Systems", "Naive RAG, Chunking, Vector DB, Hybrid Search, Reranking & Evaluation", "#EC4899"),
            ("AI Agent", "ReAct, CoT, Memory, Tool Calling, LangGraph & Multi-Agent Systems", "#EF4444"),
            ("AI Optimizer & MLOps", "GPU Architecture, Quantization AWQ, vLLM, Docker, MLflow, K8s, Drift", "#64748B"),
            ("Kiến trúc Phần mềm", "Clean Code, SOLID, Design Patterns, Monolith, DDD, Microservices, Saga, C4", "#14B8A6"),
            ("Cấu trúc Dữ liệu & Thuật toán (DSA)", "Array, Linked List, Stack, Binary Search, DP, Graph, Blind 75", "#EAB308")
        ]

        topic_map = {}
        for title, desc, color in topics_def:
            topic = db.query(TopicBlock).filter(
                TopicBlock.user_id == demo_user.id,
                TopicBlock.title == title
            ).first()
            if not topic:
                topic = TopicBlock(
                    user_id=demo_user.id,
                    title=title,
                    description=desc,
                    color_code=color,
                    total_tasks=0,
                    completed_tasks=0
                )
                db.add(topic)
                db.commit()
                db.refresh(topic)
            topic_map[title] = topic.id

        print(f"Initialized {len(topic_map)} topic blocks.")

        # 4. Schedule data across days starting 20/09/2026
        start_date = datetime.date(2026, 9, 20)
        
        schedule_data = [
            # Day 1 (Sunday 20/09/2026)
            ("Giai đoạn 1: Đọc đoạn văn A2 & Phân tích S-V-O", "Tiếng Anh Cơ Bản", 3, "08:00:00", "09:30:00"),
            ("ML Toán: Đại số tuyến tính (Ma trận, Vector) & Giải tích Gradient", "Classical Machine Learning", 2, "10:00:00", "11:00:00"),
            ("DSA: Phân tích độ phức tạp thuật toán (Big-O, Space/Time)", "Cấu trúc Dữ liệu & Thuật toán (DSA)", 2, "14:00:00", "15:00:00"),
            ("Thời gian cho Project / Môn học trên trường", "Kiến trúc Phần mềm", 4, "19:00:00", "22:00:00"),

            # Day 2 (Monday 21/09/2026)
            ("Viết mô phỏng câu từ bài đọc + Shadowing clip 30s", "Tiếng Anh Cơ Bản", 3, "08:00:00", "09:30:00"),
            ("DL Base: Cấu trúc Nơ-ron (ANN/MLP) & Activation (ReLU, GELU)", "Deep Learning", 2, "10:00:00", "11:00:00"),
            ("KTPM: Nguyên lý Clean Code & Naming Conventions", "Kiến trúc Phần mềm", 2, "14:00:00", "15:00:00"),
            ("Thời gian cho Project / Môn học trên trường", "Kiến trúc Phần mềm", 4, "19:00:00", "22:00:00"),

            # Day 3 (Tuesday 22/09/2026)
            ("Đọc phân tích đoạn văn song ngữ + Shadowing luyện âm", "Tiếng Anh Cơ Bản", 3, "08:00:00", "09:30:00"),
            ("ML Toán: Xác suất thống kê (Mean, Gaussian) & Định lý Bayes", "Classical Machine Learning", 2, "10:00:00", "11:00:00"),
            ("DSA: Mảng & Chuỗi (Array & String manipulation)", "Cấu trúc Dữ liệu & Thuật toán (DSA)", 2, "14:00:00", "15:00:00"),
            ("Thời gian cho Project / Môn học trên trường", "Kiến trúc Phần mềm", 4, "19:00:00", "22:00:00"),

            # Day 4 (Wednesday 23/09/2026)
            ("Bóc tách ngữ pháp câu phức + Luyện Shadowing 4-5 lần", "Tiếng Anh Cơ Bản", 3, "08:00:00", "09:30:00"),
            ("RAG Base: Document Ingestion/Splitting & Chunking Strategies", "RAG Systems", 2, "10:00:00", "11:00:00"),
            ("KTPM: Nguyên tắc SOLID (Single Responsibility & Open/Closed)", "Kiến trúc Phần mềm", 2, "14:00:00", "15:00:00"),
            ("Thời gian cho Project / Môn học trên trường", "Kiến trúc Phần mềm", 4, "19:00:00", "22:00:00"),

            # Day 5 (Thursday 24/09/2026)
            ("Đọc tin tức A2 + Viết lại 3 câu mô phỏng đời sống", "Tiếng Anh Cơ Bản", 3, "08:00:00", "09:30:00"),
            ("Python EDA: NumPy mảng nhiều chiều & Pandas filter/groupby", "Classical Machine Learning", 2, "10:00:00", "11:00:00"),
            ("DSA: Danh sách liên kết (Linked List: Đơn, đôi, chu trình)", "Cấu trúc Dữ liệu & Thuật toán (DSA)", 2, "14:00:00", "15:00:00"),
            ("Thời gian cho Project / Môn học trên trường", "Kiến trúc Phần mềm", 4, "19:00:00", "22:00:00"),

            # Day 6 (Friday 25/09/2026)
            ("Shadowing video BBC 6 Minute English + Tổng hợp vocab", "Tiếng Anh Cơ Bản", 3, "08:00:00", "09:30:00"),
            ("Agent Base: System Prompt Persona & Reasoning Chain-of-Thought", "AI Agent", 2, "10:00:00", "11:00:00"),
            ("KTPM: Nguyên tắc SOLID (Liskov, Interface Segregation, Dependency Inversion)", "Kiến trúc Phần mềm", 2, "14:00:00", "15:00:00"),
            ("Thời gian cho Project / Môn học trên trường", "Kiến trúc Phần mềm", 4, "19:00:00", "22:00:00"),

            # Day 7 (Saturday 26/09/2026)
            ("Review từ vựng tuần 1 + Luyện phát âm ngữ điệu", "Tiếng Anh Cơ Bản", 3, "08:00:00", "09:30:00"),
            ("NLP Base: Tokenization (Regex, Stopwords) & Bag-of-Words TF-IDF", "NLP & Large Language Models", 2, "10:00:00", "11:00:00"),
            ("DSA: Ngăn xếp & Hàng đợi (Stack & Queue, Monotonic Stack)", "Cấu trúc Dữ liệu & Thuật toán (DSA)", 2, "14:00:00", "15:00:00"),
            ("Thời gian cho Project / Môn học trên trường", "Kiến trúc Phần mềm", 4, "19:00:00", "22:00:00"),

            # Day 8 (Sunday 27/09/2026)
            ("Giai đoạn 1: Đọc bóc tách câu ngắn + Viết 3 câu ứng dụng", "Tiếng Anh Cơ Bản", 3, "08:00:00", "09:30:00"),
            ("DL Training: Forward Prop & Cross-Entropy Loss + Backprop", "Deep Learning", 2, "10:00:00", "11:00:00"),
            ("KTPM Design Pattern: Factory Method & Abstract Factory", "Kiến trúc Phần mềm", 2, "14:00:00", "15:00:00"),
            ("Thời gian cho Project / Môn học trên trường", "Kiến trúc Phần mềm", 4, "19:00:00", "22:00:00"),

            # Day 9 (Monday 28/09/2026)
            ("Nghe & Shadowing đoạn hội thoại 60s (Easy English)", "Tiếng Anh Cơ Bản", 3, "08:00:00", "09:30:00"),
            ("Supervised Reg: Linear Regression + Ridge & Lasso Regularization", "Classical Machine Learning", 2, "10:00:00", "11:00:00"),
            ("DSA: Đệ quy & Chia để trị (Recursion & Call Stack)", "Cấu trúc Dữ liệu & Thuật toán (DSA)", 2, "14:00:00", "15:00:00"),
            ("Thời gian cho Project / Môn học trên trường", "Kiến trúc Phần mềm", 4, "19:00:00", "22:00:00"),

            # Day 10 (Tuesday 29/09/2026)
            ("Đọc đoạn văn B1 ngắn + Gạch chân Collocations", "Tiếng Anh Cơ Bản", 3, "08:00:00", "09:30:00"),
            ("Agent ReAct: ReAct Pattern & Plan-and-Solve / Tree of Thoughts", "AI Agent", 2, "10:00:00", "11:00:00"),
            ("KTPM Design Pattern: Singleton & Builder Pattern", "Kiến trúc Phần mềm", 2, "14:00:00", "15:00:00"),
            ("Thời gian cho Project / Môn học trên trường", "Kiến trúc Phần mềm", 4, "19:00:00", "22:00:00"),

            # Day 11 (Wednesday 30/09/2026)
            ("Viết mô phỏng tóm tắt đoạn văn + Shadowing củng cố", "Tiếng Anh Cơ Bản", 3, "08:00:00", "09:30:00"),
            ("Supervised Class: Logistic Regression & Sigmoid + KNN & Naive Bayes", "Classical Machine Learning", 2, "10:00:00", "11:00:00"),
            ("DSA: Binary Search (Tìm kiếm nhị phân & Không gian đáp án)", "Cấu trúc Dữ liệu & Thuật toán (DSA)", 2, "14:00:00", "15:00:00"),
            ("Thời gian cho Project / Môn học trên trường", "Kiến trúc Phần mềm", 4, "19:00:00", "22:00:00"),

            # Day 12 (Thursday 01/10/2026)
            ("Đọc tin tức khoa học đơn giản + Bóc tách liên từ", "Tiếng Anh Cơ Bản", 3, "08:00:00", "09:30:00"),
            ("Vector Embeddings: OpenAI/BGE Embeddings & Vector DB (Qdrant/Chroma)", "RAG Systems", 2, "10:00:00", "11:00:00"),
            ("KTPM Design Pattern: Strategy & Observer Pattern", "Kiến trúc Phần mềm", 2, "14:00:00", "15:00:00"),
            ("Thời gian cho Project / Môn học trên trường", "Kiến trúc Phần mềm", 4, "19:00:00", "22:00:00"),

            # Day 13 (Friday 02/10/2026)
            ("Shadowing luyện nối âm & âm đuôi", "Tiếng Anh Cơ Bản", 3, "08:00:00", "09:30:00"),
            ("PyTorch: Tensor operations CUDA + torch.nn.Module & DataLoader", "Deep Learning", 2, "10:00:00", "11:00:00"),
            ("DSA: Thuật toán sắp xếp (Merge Sort & Quick Sort partition)", "Cấu trúc Dữ liệu & Thuật toán (DSA)", 2, "14:00:00", "15:00:00"),
            ("Thời gian cho Project / Môn học trên trường", "Kiến trúc Phần mềm", 4, "19:00:00", "22:00:00"),

            # Day 14 (Saturday 03/10/2026)
            ("Ôn tập từ vựng & cấu trúc ngữ pháp tuần 2", "Tiếng Anh Cơ Bản", 3, "08:00:00", "09:30:00"),
            ("Embeddings: Word2Vec (CBOW/Skip-gram) + FastText subword n-grams", "NLP & Large Language Models", 2, "10:00:00", "11:00:00"),
            ("KTPM Design Pattern: Decorator, Adapter & Repository", "Kiến trúc Phần mềm", 2, "14:00:00", "15:00:00"),
            ("Thời gian cho Project / Môn học trên trường", "Kiến trúc Phần mềm", 4, "19:00:00", "22:00:00"),
        ]

        # Insert tasks iteratively for the schedule
        task_count = 0
        current_day_offset = 0

        for i in range(0, len(schedule_data), 4):
            day_date = start_date + datetime.timedelta(days=current_day_offset)
            daily_tasks = schedule_data[i:i+4]

            for title, topic_name, pomodoros, s_time, e_time in daily_tasks:
                t_id = topic_map.get(topic_name)
                
                existing = db.query(Task).filter(
                    Task.user_id == demo_user.id,
                    Task.scheduled_date == day_date,
                    Task.title == title
                ).first()

                if not existing:
                    t_start = datetime.datetime.strptime(s_time, "%H:%M:%S").time()
                    t_end = datetime.datetime.strptime(e_time, "%H:%M:%S").time()

                    new_task = Task(
                        user_id=demo_user.id,
                        topic_id=t_id,
                        title=title,
                        description=f"Task phân bổ cho mốc ngày {day_date.strftime('%d/%m/%Y')}",
                        scheduled_date=day_date,
                        start_time=t_start,
                        end_time=t_end,
                        target_pomodoro=pomodoros,
                        completed_pomodoro=0,
                        status="PENDING"
                    )
                    db.add(new_task)
                    task_count += 1
            
            current_day_offset += 1

        db.commit()
        print(f"Successfully seeded {task_count} tasks into Supabase PostgreSQL!")

        # 5. Update topic block task counts
        for topic_title, topic_id in topic_map.items():
            count = db.query(Task).filter(Task.topic_id == topic_id).count()
            db.query(TopicBlock).filter(TopicBlock.id == topic_id).update({"total_tasks": count})
        db.commit()
        print("Updated topic block task counts.")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
