from datetime import date
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field

class StreakResponse(BaseModel):
    current_streak: int = Field(..., description="Số ngày chuỗi hiện tại")
    longest_streak: int = Field(..., description="Số ngày kỷ lục chuỗi dài nhất")
    last_activity_date: Optional[date] = Field(None, description="Ngày tương tác gần nhất")
    total_completed_tasks: int = Field(..., description="Tổng số công việc đã hoàn thành")
    total_pomodoros: int = Field(..., description="Tổng số quả Pomodoro đã hoàn thành")

    class Config:
        from_attributes = True

class DailyProductivityItem(BaseModel):
    date: date
    completed_tasks: int
    completed_pomodoros: int

class TopicProductivityItem(BaseModel):
    topic_id: Optional[UUID] = None
    topic_title: str
    color_code: str
    completed_tasks: int
    completed_pomodoros: int

class ProductivityStatsResponse(BaseModel):
    period: str = Field(..., description="Chu kỳ thống kê: week | month | all")
    total_completed_tasks: int
    total_pomodoros: int
    daily_breakdown: List[DailyProductivityItem]
    top_topics: List[TopicProductivityItem]
