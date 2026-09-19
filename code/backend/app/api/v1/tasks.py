from datetime import date
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, TopicBlock, Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["Tasks"])

def format_task_response(task: Task) -> TaskResponse:
    topic_title = task.topic.title if task.topic else None
    topic_color = task.topic.color_code if task.topic else None
    
    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        topic_id=task.topic_id,
        topic_title=topic_title,
        topic_color=topic_color,
        title=task.title,
        description=task.description,
        scheduled_date=task.scheduled_date,
        start_time=task.start_time,
        end_time=task.end_time,
        target_pomodoro=task.target_pomodoro,
        completed_pomodoro=task.completed_pomodoro,
        status=task.status,
        created_at=task.created_at,
        updated_at=task.updated_at
    )

def update_topic_stats(db: Session, topic_id: Optional[UUID]):
    if not topic_id:
        return
    total = db.query(Task).filter(Task.topic_id == topic_id).count()
    completed = db.query(Task).filter(Task.topic_id == topic_id, Task.status == "COMPLETED").count()
    db.query(TopicBlock).filter(TopicBlock.id == topic_id).update({
        "total_tasks": total,
        "completed_tasks": completed
    })
    db.commit()

@router.get("", response_model=List[TaskResponse])
def get_user_tasks(
    scheduled_date: Optional[date] = Query(None, description="Lọc theo 1 ngày cụ thể"),
    start_date: Optional[date] = Query(None, description="Lọc từ ngày (Tuần)"),
    end_date: Optional[date] = Query(None, description="Lọc đến ngày (Tuần)"),
    topic_id: Optional[UUID] = Query(None, description="Lọc theo Khối chủ đề"),
    status_filter: Optional[str] = Query(None, alias="status", description="Lọc theo Trạng thái"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Task).filter(Task.user_id == current_user.id)

    if scheduled_date:
        query = query.filter(Task.scheduled_date == scheduled_date)
    if start_date and end_date:
        query = query.filter(Task.scheduled_date >= start_date, Task.scheduled_date <= end_date)
    elif start_date:
        query = query.filter(Task.scheduled_date >= start_date)
    elif end_date:
        query = query.filter(Task.scheduled_date <= end_date)

    if topic_id:
        query = query.filter(Task.topic_id == topic_id)
    if status_filter:
        query = query.filter(Task.status == status_filter)

    tasks = query.order_by(Task.scheduled_date.asc(), Task.start_time.asc().nulls_last()).all()
    return [format_task_response(t) for t in tasks]

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify topic exists and belongs to current user if specified
    if task_in.topic_id:
        topic = db.query(TopicBlock).filter(
            TopicBlock.id == task_in.topic_id,
            TopicBlock.user_id == current_user.id
        ).first()
        if not topic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Khối chủ đề được chọn không tồn tại hoặc bạn không có quyền truy cập."
            )

    new_task = Task(
        user_id=current_user.id,
        topic_id=task_in.topic_id,
        title=task_in.title,
        description=task_in.description,
        scheduled_date=task_in.scheduled_date,
        start_time=task_in.start_time,
        end_time=task_in.end_time,
        target_pomodoro=task_in.target_pomodoro,
        completed_pomodoro=0,
        status="PENDING"
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    update_topic_stats(db, new_task.topic_id)

    return format_task_response(new_task)

@router.get("/{task_id}", response_model=TaskResponse)
def get_task_detail(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy công việc hoặc bạn không có quyền truy cập."
        )

    return format_task_response(task)

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: UUID,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy công việc hoặc bạn không có quyền truy cập."
        )

    old_topic_id = task.topic_id

    # If updating topic_id, verify new topic exists and belongs to user
    if task_in.topic_id is not None and task_in.topic_id != old_topic_id:
        new_topic = db.query(TopicBlock).filter(
            TopicBlock.id == task_in.topic_id,
            TopicBlock.user_id == current_user.id
        ).first()
        if not new_topic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Khối chủ đề mới được chọn không tồn tại."
            )
        task.topic_id = task_in.topic_id

    if task_in.title is not None:
        task.title = task_in.title
    if task_in.description is not None:
        task.description = task_in.description
    if task_in.scheduled_date is not None:
        task.scheduled_date = task_in.scheduled_date
    if task_in.start_time is not None:
        task.start_time = task_in.start_time
    if task_in.end_time is not None:
        task.end_time = task_in.end_time
    if task_in.target_pomodoro is not None:
        task.target_pomodoro = task_in.target_pomodoro
    if task_in.completed_pomodoro is not None:
        task.completed_pomodoro = task_in.completed_pomodoro
    if task_in.status is not None:
        task.status = task_in.status

    db.commit()
    db.refresh(task)

    # Update stats for old and new topics if changed
    if old_topic_id != task.topic_id:
        update_topic_stats(db, old_topic_id)
    update_topic_stats(db, task.topic_id)

    return format_task_response(task)

@router.delete("/{task_id}")
def delete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy công việc hoặc bạn không có quyền truy cập."
        )

    topic_id = task.topic_id

    db.delete(task)
    db.commit()

    if topic_id:
        update_topic_stats(db, topic_id)

    return {"message": "Đã xóa công việc thành công."}
