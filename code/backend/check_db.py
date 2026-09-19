import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.models import User, TopicBlock, Task, UserStreak

def check():
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        topic_count = db.query(TopicBlock).count()
        task_count = db.query(Task).count()
        streak_count = db.query(UserStreak).count()

        print("=== SUPABASE DATABASE STATUS ===")
        print(f"Users: {user_count}")
        print(f"Topic Blocks: {topic_count}")
        print(f"Tasks: {task_count}")
        print(f"User Streaks: {streak_count}")

        print("\n--- Topic Blocks Breakdown ---")
        topics = db.query(TopicBlock).all()
        for t in topics:
            print(f"- [{t.color_code}] {t.title}: {t.total_tasks} tasks")

    finally:
        db.close()

if __name__ == "__main__":
    check()
