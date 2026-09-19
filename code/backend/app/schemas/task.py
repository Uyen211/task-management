from datetime import datetime, date, time
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Tên công việc")
    description: Optional[str] = Field(None, description="Mô tả công việc")
    topic_id: Optional[UUID] = Field(None, description="Khối chủ đề liên quan")
    scheduled_date: date = Field(..., description="Ngày thực hiện")
    start_time: Optional[time] = Field(None, description="Khung giờ bắt đầu")
    end_time: Optional[time] = Field(None, description="Khung giờ kết thúc")
    target_pomodoro: int = Field(1, gt=0, description="Số quả Pomodoro mục tiêu")

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    topic_id: Optional[UUID] = None
    scheduled_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    target_pomodoro: Optional[int] = Field(None, gt=0)
    completed_pomodoro: Optional[int] = Field(None, ge=0)
    status: Optional[str] = Field(None, pattern="^(PENDING|IN_PROGRESS|COMPLETED)$")

class TaskResponse(BaseModel):
    id: UUID
    user_id: UUID
    topic_id: Optional[UUID] = None
    topic_title: Optional[str] = None
    topic_color: Optional[str] = None
    title: str
    description: Optional[str] = None
    scheduled_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    target_pomodoro: int
    completed_pomodoro: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
