from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

class PomodoroStartRequest(BaseModel):
    task_id: UUID = Field(..., description="ID công việc cần thực hiện Pomodoro")
    duration_minutes: int = Field(25, gt=0, description="Thời lượng phiên Pomodoro (phút)")

class PomodoroSessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    task_id: UUID
    duration_minutes: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    is_successful: bool
    status: str = Field(..., description="IN_PROGRESS, COMPLETED, CANCELLED")

    class Config:
        from_attributes = True

class PomodoroCompleteResponse(BaseModel):
    session: PomodoroSessionResponse
    task_id: UUID
    completed_pomodoro: int
    target_pomodoro: int
    task_status: str
    streak_updated: bool
    current_streak: int
