from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Task
from app.schemas.calendar import WeeklyCalendarResponse, WeeklyCalendarDay
from app.api.v1.tasks import format_task_response

router = APIRouter(prefix="/calendar", tags=["Calendar"])

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

@router.get("/weekly", response_model=WeeklyCalendarResponse)
def get_weekly_calendar(
    start_date: Optional[date] = Query(None, description="Ngày đầu tuần (Thứ 2). Mặc định là Thứ 2 tuần hiện tại"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not start_date:
        today = date.today()
        start_date = today - timedelta(days=today.weekday())

    end_date = start_date + timedelta(days=6)

    # Query all tasks for current user within the week range
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.scheduled_date >= start_date,
        Task.scheduled_date <= end_date
    ).order_by(Task.scheduled_date.asc(), Task.start_time.asc().nulls_last()).all()

    # Group tasks by date
    tasks_by_date = {}
    for task in tasks:
        tasks_by_date.setdefault(task.scheduled_date, []).append(format_task_response(task))

    # Build 7 days structure
    days = []
    for i in range(7):
        current_day = start_date + timedelta(days=i)
        day_name = DAY_NAMES[i]
        day_tasks = tasks_by_date.get(current_day, [])
        days.append(WeeklyCalendarDay(
            date=current_day,
            day_of_week=day_name,
            tasks=day_tasks
        ))

    return WeeklyCalendarResponse(
        start_date=start_date,
        end_date=end_date,
        days=days
    )
