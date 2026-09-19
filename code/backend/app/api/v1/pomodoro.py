from datetime import datetime, date, timedelta, timezone
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Task, PomodoroSession, UserStreak, TopicBlock
from app.schemas.pomodoro import (
    PomodoroStartRequest,
    PomodoroSessionResponse,
    PomodoroCompleteResponse
)
from app.api.v1.tasks import update_topic_stats

router = APIRouter(prefix="/pomodoro", tags=["Pomodoro"])

def get_session_status(session: PomodoroSession) -> str:
    if not session.is_successful:
        return "CANCELLED"
    if session.completed_at is not None:
        return "COMPLETED"
    return "IN_PROGRESS"

def format_session_response(session: PomodoroSession) -> PomodoroSessionResponse:
    return PomodoroSessionResponse(
        id=session.id,
        user_id=session.user_id,
        task_id=session.task_id,
        duration_minutes=session.duration_minutes,
        started_at=session.started_at,
        completed_at=session.completed_at,
        is_successful=session.is_successful,
        status=get_session_status(session)
    )

@router.post("/start", response_model=PomodoroSessionResponse, status_code=status.HTTP_201_CREATED)
def start_pomodoro(
    req: PomodoroStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == req.task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy công việc hoặc bạn không có quyền truy cập."
        )

    if task.status == "PENDING":
        task.status = "IN_PROGRESS"

    new_session = PomodoroSession(
        task_id=task.id,
        user_id=current_user.id,
        duration_minutes=req.duration_minutes,
        started_at=datetime.now(timezone.utc),
        is_successful=True,
        completed_at=None
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return format_session_response(new_session)

@router.post("/{session_id}/complete", response_model=PomodoroCompleteResponse)
def complete_pomodoro(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pomo_session = db.query(PomodoroSession).filter(
        PomodoroSession.id == session_id,
        PomodoroSession.user_id == current_user.id
    ).first()

    if not pomo_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phiên Pomodoro."
        )

    if pomo_session.completed_at is not None or not pomo_session.is_successful:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phiên Pomodoro không ở trạng thái đang diễn ra."
        )

    # Complete session
    pomo_session.completed_at = datetime.now(timezone.utc)

    # Increment task completed_pomodoro
    task = db.query(Task).filter(Task.id == pomo_session.task_id).first()
    if task:
        task.completed_pomodoro += 1
        if task.completed_pomodoro >= task.target_pomodoro:
            task.status = "COMPLETED"

        if task.topic_id:
            update_topic_stats(db, task.topic_id)

    # Update Streak
    streak = db.query(UserStreak).filter(UserStreak.user_id == current_user.id).first()
    if not streak:
        streak = UserStreak(
            user_id=current_user.id,
            current_streak=0,
            longest_streak=0,
            last_activity_date=None,
            total_completed_tasks=0,
            total_pomodoros=0
        )
        db.add(streak)

    today = date.today()
    streak_updated = False

    if streak.last_activity_date != today:
        if streak.last_activity_date == today - timedelta(days=1):
            streak.current_streak += 1
        else:
            streak.current_streak = 1
        streak.longest_streak = max(streak.longest_streak, streak.current_streak)
        streak.last_activity_date = today
        streak_updated = True

    streak.total_pomodoros += 1
    if task and task.status == "COMPLETED":
        streak.total_completed_tasks += 1

    db.commit()
    db.refresh(pomo_session)
    if task:
        db.refresh(task)
    db.refresh(streak)

    return PomodoroCompleteResponse(
        session=format_session_response(pomo_session),
        task_id=task.id if task else pomo_session.task_id,
        completed_pomodoro=task.completed_pomodoro if task else 0,
        target_pomodoro=task.target_pomodoro if task else 1,
        task_status=task.status if task else "COMPLETED",
        streak_updated=streak_updated,
        current_streak=streak.current_streak
    )

@router.post("/{session_id}/cancel", response_model=PomodoroSessionResponse)
def cancel_pomodoro(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pomo_session = db.query(PomodoroSession).filter(
        PomodoroSession.id == session_id,
        PomodoroSession.user_id == current_user.id
    ).first()

    if not pomo_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phiên Pomodoro."
        )

    pomo_session.is_successful = False
    pomo_session.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(pomo_session)

    return format_session_response(pomo_session)
