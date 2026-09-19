from datetime import datetime, date, time
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field

class TaskBriefResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    scheduled_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    target_pomodoro: int
    completed_pomodoro: int
    status: str

    class Config:
        from_attributes = True

class TopicBlockCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150, description="Tên khối chủ đề")
    description: Optional[str] = None
    color_code: str = Field("#3B82F6", max_length=20, description="Mã màu biểu thị")

class TopicBlockUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=150)
    description: Optional[str] = None
    color_code: Optional[str] = Field(None, max_length=20)

class TopicBlockResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    color_code: str
    total_tasks: int
    completed_tasks: int
    progress_percentage: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True

class TopicBlockDetailResponse(TopicBlockResponse):
    tasks: List[TaskBriefResponse] = []

    class Config:
        from_attributes = True
