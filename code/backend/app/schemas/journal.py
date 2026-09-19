from datetime import date, datetime
from typing import List, Optional, Any, Dict
from uuid import UUID
from pydantic import BaseModel, Field

class TopicSummaryItem(BaseModel):
    topic_id: Optional[UUID] = None
    topic_title: str
    color_code: str
    completed_tasks: int
    completed_pomodoros: int

class DailySummaryResponse(BaseModel):
    journal_date: date
    total_completed_tasks: int
    total_pomodoros: int
    topics_summary: List[TopicSummaryItem]

class JournalSaveRequest(BaseModel):
    journal_date: date = Field(..., description="Ngày ghi nhật ký")
    content_html: Optional[str] = Field(None, description="Nội dung nhật ký định dạng HTML")
    content_markdown: Optional[str] = Field(None, description="Nội dung nhật ký định dạng Markdown")

class JournalResponse(BaseModel):
    id: UUID
    user_id: UUID
    journal_date: date
    summary_data: Optional[Dict[str, Any]] = None
    content_html: Optional[str] = None
    content_markdown: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class JournalDraftSaveRequest(BaseModel):
    journal_date: date = Field(..., description="Ngày bản nháp nhật ký")
    draft_content: str = Field(..., description="Nội dung bản nháp tự động lưu")

class JournalDraftResponse(BaseModel):
    id: UUID
    user_id: UUID
    journal_date: date
    draft_content: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True
