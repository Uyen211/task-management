import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.models.models import (
    User, TopicBlock, Task, PomodoroSession, UserStreak, DailyJournal, JournalDraft
)

def init_db():
    print("Connecting to Supabase PostgreSQL database and creating tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Successfully created all database tables on Supabase!")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_db()
