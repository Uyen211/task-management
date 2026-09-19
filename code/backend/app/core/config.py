import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Task Management System"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/taskdb"
    )
    DIRECT_URL: str = os.getenv(
        "DIRECT_URL",
        os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/taskdb")
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-task-management-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

settings = Settings()
