from datetime import date, datetime
from typing import Optional, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, DailyJournal, JournalDraft, Task, PomodoroSession, TopicBlock
from app.schemas.journal import (
    TopicSummaryItem,
    DailySummaryResponse,
    JournalSaveRequest,
    JournalResponse,
    JournalDraftSaveRequest,
    JournalDraftResponse
)

router = APIRouter(prefix="/journal", tags=["Daily Journal"])

def generate_daily_summary(db: Session, user_id: str, journal_date: date) -> DailySummaryResponse:
    # Query completed tasks for the date
    tasks = db.query(Task).filter(
        Task.user_id == user_id,
        Task.scheduled_date == journal_date,
        Task.status == "COMPLETED"
    ).all()

    # Query completed pomodoros for the date
    start_datetime = datetime.combine(journal_date, datetime.min.time())
    end_datetime = datetime.combine(journal_date, datetime.max.time())
    pomo_sessions = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == user_id,
        PomodoroSession.started_at >= start_datetime,
        PomodoroSession.started_at <= end_datetime,
        PomodoroSession.completed_at.isnot(None),
        PomodoroSession.is_successful.is_(True)
    ).all()

    # Group counts by topic
    topic_tasks: Dict[Optional[str], int] = {}
    for t in tasks:
        topic_tasks[t.topic_id] = topic_tasks.get(t.topic_id, 0) + 1

    topic_pomos: Dict[Optional[str], int] = {}
    for s in pomo_sessions:
        if s.task:
            top_id = s.task.topic_id
            topic_pomos[top_id] = topic_pomos.get(top_id, 0) + 1

    # Fetch user topics
    user_topics = db.query(TopicBlock).filter(TopicBlock.user_id == user_id).all()
    topic_dict = {t.id: t for t in user_topics}

    all_topic_ids = set(list(topic_tasks.keys()) + list(topic_pomos.keys()))
    summary_items: List[TopicSummaryItem] = []

    for top_id in all_topic_ids:
        if top_id and top_id in topic_dict:
            t_obj = topic_dict[top_id]
            summary_items.append(TopicSummaryItem(
                topic_id=t_obj.id,
                topic_title=t_obj.title,
                color_code=t_obj.color_code,
                completed_tasks=topic_tasks.get(top_id, 0),
                completed_pomodoros=topic_pomos.get(top_id, 0)
            ))
        elif top_id is None and (topic_tasks.get(None, 0) > 0 or topic_pomos.get(None, 0) > 0):
            summary_items.append(TopicSummaryItem(
                topic_id=None,
                topic_title="Không phân loại",
                color_code="#9CA3AF",
                completed_tasks=topic_tasks.get(None, 0),
                completed_pomodoros=topic_pomos.get(None, 0)
            ))

    return DailySummaryResponse(
        journal_date=journal_date,
        total_completed_tasks=len(tasks),
        total_pomodoros=len(pomo_sessions),
        topics_summary=summary_items
    )

@router.get("/daily-summary", response_model=DailySummaryResponse)
def get_daily_summary(
    journal_date: Optional[date] = Query(None, description="Ngày xem tóm tắt (Mặc định: Hôm nay)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_date = journal_date or date.today()
    return generate_daily_summary(db, current_user.id, target_date)

@router.get("", response_model=JournalResponse)
def get_journal_entry(
    journal_date: Optional[date] = Query(None, description="Ngày xem nhật ký (Mặc định: Hôm nay)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_date = journal_date or date.today()
    journal = db.query(DailyJournal).filter(
        DailyJournal.user_id == current_user.id,
        DailyJournal.journal_date == target_date
    ).first()

    if not journal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chưa có nhật ký cho ngày được chọn."
        )

    return journal

@router.post("", response_model=JournalResponse)
def save_journal_entry(
    req: JournalSaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Auto-generate summary data
    summary_resp = generate_daily_summary(db, current_user.id, req.journal_date)
    summary_data_dict = summary_resp.model_dump(mode="json")

    journal = db.query(DailyJournal).filter(
        DailyJournal.user_id == current_user.id,
        DailyJournal.journal_date == req.journal_date
    ).first()

    if journal:
        journal.content_html = req.content_html
        journal.content_markdown = req.content_markdown
        journal.summary_data = summary_data_dict
    else:
        journal = DailyJournal(
            user_id=current_user.id,
            journal_date=req.journal_date,
            summary_data=summary_data_dict,
            content_html=req.content_html,
            content_markdown=req.content_markdown
        )
        db.add(journal)

    # Delete draft if exists
    db.query(JournalDraft).filter(
        JournalDraft.user_id == current_user.id,
        JournalDraft.journal_date == req.journal_date
    ).delete()

    db.commit()
    db.refresh(journal)
    return journal

@router.get("/draft", response_model=JournalDraftResponse)
def get_journal_draft(
    journal_date: Optional[date] = Query(None, description="Ngày bản nháp (Mặc định: Hôm nay)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_date = journal_date or date.today()
    draft = db.query(JournalDraft).filter(
        JournalDraft.user_id == current_user.id,
        JournalDraft.journal_date == target_date
    ).first()

    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bản nháp cho ngày này."
        )

    return draft

@router.put("/draft", response_model=JournalDraftResponse)
def save_journal_draft(
    req: JournalDraftSaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    draft = db.query(JournalDraft).filter(
        JournalDraft.user_id == current_user.id,
        JournalDraft.journal_date == req.journal_date
    ).first()

    if draft:
        draft.draft_content = req.draft_content
    else:
        draft = JournalDraft(
            user_id=current_user.id,
            journal_date=req.journal_date,
            draft_content=req.draft_content
        )
        db.add(draft)

    db.commit()
    db.refresh(draft)
    return draft
