from datetime import date, time
from typing import List, Optional
from pydantic import BaseModel, Field

from app.schemas.task import TaskResponse

class TaskDragDropUpdate(BaseModel):
    scheduled_date: date = Field(..., description="Ngày thực hiện mới")
    start_time: Optional[time] = Field(None, description="Giờ bắt đầu mới")
    end_time: Optional[time] = Field(None, description="Giờ kết thúc mới")

class WeeklyCalendarDay(BaseModel):
    date: date
    day_of_week: str
    tasks: List[TaskResponse]

class WeeklyCalendarResponse(BaseModel):
    start_date: date
    end_date: date
    days: List[WeeklyCalendarDay]
