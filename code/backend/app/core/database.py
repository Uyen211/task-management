from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Use DIRECT_URL for schema creation & session management
db_url = settings.DIRECT_URL if settings.DIRECT_URL else settings.DATABASE_URL

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_recycle=300
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
