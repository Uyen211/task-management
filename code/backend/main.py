import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.topics import router as topics_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.calendar import router as calendar_router
from app.api.v1.pomodoro import router as pomodoro_router
from app.api.v1.stats import router as stats_router
from app.api.v1.journal import router as journal_router

load_dotenv()

app = FastAPI(
    title="Task Management System API",
    description="Backend API for Task Management App with Roadmap, Pomodoro, Streak, and Daily Journal",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(topics_router, prefix="/api/v1")
app.include_router(tasks_router, prefix="/api/v1")
app.include_router(calendar_router, prefix="/api/v1")
app.include_router(pomodoro_router, prefix="/api/v1")
app.include_router(stats_router, prefix="/api/v1")
app.include_router(journal_router, prefix="/api/v1")



@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Task Management API v1.0",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    db_url = os.getenv("DATABASE_URL")
    return {
        "status": "healthy",
        "database_configured": bool(db_url)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
