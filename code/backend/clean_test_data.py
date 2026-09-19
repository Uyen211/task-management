import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.models import User

def clean_test_data():
    db = SessionLocal()
    print("Cleaning test mock data from Supabase PostgreSQL...")
    try:
        # Delete all users EXCEPT demo@taskmanagement.com
        test_users = db.query(User).filter(User.email != "demo@taskmanagement.com").all()
        count = len(test_users)
        if count > 0:
            for user in test_users:
                print(f"Deleting test user: {user.email} (ID: {user.id})")
                db.delete(user)
            db.commit()
            print(f"Successfully cleaned up {count} test users and their cascade data!")
        else:
            print("No test mock data found. Only seed data exists.")
    except Exception as e:
        print(f"Error cleaning test data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clean_test_data()
