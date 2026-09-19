from datetime import date, timedelta, datetime
from typing import Optional, Dict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, UserStreak, Task, PomodoroSession, TopicBlock
from app.schemas.stats import (
    StreakResponse,
    DailyProductivityItem,
    TopicProductivityItem,
    ProductivityStatsResponse
)

router = APIRouter(prefix="/stats", tags=["Stats & Productivity"])

@router.get("/streak", response_model=StreakResponse)
def get_user_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    streak = db.query(UserStreak).filter(UserStreak.user_id == current_user.id).first()
    
    if not streak:
        return StreakResponse(
            current_streak=0,
            longest_streak=0,
            last_activity_date=None,
            total_completed_tasks=0,
            total_pomodoros=0
        )

    today = date.today()
    if streak.last_activity_date and streak.last_activity_date < today - timedelta(days=1):
        if streak.current_streak > 0:
            streak.current_streak = 0
            db.commit()
            db.refresh(streak)

    return streak

@router.get("/productivity", response_model=ProductivityStatsResponse)
def get_productivity_stats(
    period: str = Query("week", description="Chu kỳ: week | month | all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    if period == "week":
        start_date = today - timedelta(days=today.weekday())
    elif period == "month":
        start_date = date(today.year, today.month, 1)
    else:  # all
        start_date = None

    # Query completed tasks
    task_query = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "COMPLETED"
    )
    if start_date:
        task_query = task_query.filter(Task.scheduled_date >= start_date)
    completed_tasks = task_query.all()

    # Query completed pomodoro sessions
    pomo_query = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.completed_at.isnot(None),
        PomodoroSession.is_successful.is_(True)
    )
    if start_date:
        start_datetime = datetime.combine(start_date, datetime.min.time())
        pomo_query = pomo_query.filter(PomodoroSession.started_at >= start_datetime)
    completed_pomodoros = pomo_query.all()

    # Aggregate daily breakdown
    daily_tasks_count: Dict[date, int] = {}
    for task in completed_tasks:
        daily_tasks_count[task.scheduled_date] = daily_tasks_count.get(task.scheduled_date, 0) + 1

    daily_pomo_count: Dict[date, int] = {}
    for session in completed_pomodoros:
        session_date = session.started_at.date()
        daily_pomo_count[session_date] = daily_pomo_count.get(session_date, 0) + 1

    # Generate daily breakdown list
    daily_breakdown = []
    if period == "week":
        for i in range(7):
            d = start_date + timedelta(days=i)
            daily_breakdown.append(DailyProductivityItem(
                date=d,
                completed_tasks=daily_tasks_count.get(d, 0),
                completed_pomodoros=daily_pomo_count.get(d, 0)
            ))
    elif period == "month":
        num_days = (today - start_date).days + 1
        for i in range(num_days):
            d = start_date + timedelta(days=i)
            daily_breakdown.append(DailyProductivityItem(
                date=d,
                completed_tasks=daily_tasks_count.get(d, 0),
                completed_pomodoros=daily_pomo_count.get(d, 0)
            ))
    else:  # all dates found
        all_dates = sorted(set(list(daily_tasks_count.keys()) + list(daily_pomo_count.keys())))
        if not all_dates:
            all_dates = [today]
        for d in all_dates:
            daily_breakdown.append(DailyProductivityItem(
                date=d,
                completed_tasks=daily_tasks_count.get(d, 0),
                completed_pomodoros=daily_pomo_count.get(d, 0)
            ))

    # Aggregate top topics
    topic_task_map: Dict[Optional[str], int] = {}
    for task in completed_tasks:
        topic_task_map[task.topic_id] = topic_task_map.get(task.topic_id, 0) + 1

    topic_pomo_map: Dict[Optional[str], int] = {}
    for session in completed_pomodoros:
        if session.task and session.task.topic_id:
            top_id = session.task.topic_id
            topic_pomo_map[top_id] = topic_pomo_map.get(top_id, 0) + 1

    # Fetch user topic blocks for detail
    user_topics = db.query(TopicBlock).filter(TopicBlock.user_id == current_user.id).all()
    topic_dict = {t.id: t for t in user_topics}

    all_topic_ids = set(list(topic_task_map.keys()) + list(topic_pomo_map.keys()))
    top_topics = []
    for top_id in all_topic_ids:
        if top_id and top_id in topic_dict:
            t_obj = topic_dict[top_id]
            top_topics.append(TopicProductivityItem(
                topic_id=t_obj.id,
                topic_title=t_obj.title,
                color_code=t_obj.color_code,
                completed_tasks=topic_task_map.get(top_id, 0),
                completed_pomodoros=topic_pomo_map.get(top_id, 0)
            ))
        elif top_id is None and (topic_task_map.get(None, 0) > 0 or topic_pomo_map.get(None, 0) > 0):
            top_topics.append(TopicProductivityItem(
                topic_id=None,
                topic_title="Không phân loại",
                color_code="#9CA3AF",
                completed_tasks=topic_task_map.get(None, 0),
                completed_pomodoros=topic_pomo_map.get(None, 0)
            ))

    return ProductivityStatsResponse(
        period=period,
        total_completed_tasks=len(completed_tasks),
        total_pomodoros=len(completed_pomodoros),
        daily_breakdown=daily_breakdown,
        top_topics=top_topics
    )
