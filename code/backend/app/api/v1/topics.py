from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, TopicBlock, Task
from app.schemas.topic import (
    TopicBlockCreate, TopicBlockUpdate, TopicBlockResponse, TopicBlockDetailResponse, TaskBriefResponse
)

router = APIRouter(prefix="/topics", tags=["Topics"])

@router.get("", response_model=List[TopicBlockResponse])
def get_user_topics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topics = db.query(TopicBlock).filter(TopicBlock.user_id == current_user.id).all()
    results = []
    for topic in topics:
        total = db.query(Task).filter(Task.topic_id == topic.id).count()
        completed = db.query(Task).filter(Task.topic_id == topic.id, Task.status == "COMPLETED").count()
        pct = (completed / total * 100.0) if total > 0 else 0.0
        
        topic_res = TopicBlockResponse(
            id=topic.id,
            title=topic.title,
            description=topic.description,
            color_code=topic.color_code,
            total_tasks=total,
            completed_tasks=completed,
            progress_percentage=round(pct, 1),
            created_at=topic.created_at
        )
        results.append(topic_res)
    return results

@router.post("", response_model=TopicBlockResponse, status_code=status.HTTP_201_CREATED)
def create_topic(
    topic_in: TopicBlockCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_topic = TopicBlock(
        user_id=current_user.id,
        title=topic_in.title,
        description=topic_in.description,
        color_code=topic_in.color_code,
        total_tasks=0,
        completed_tasks=0
    )
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    
    return TopicBlockResponse(
        id=new_topic.id,
        title=new_topic.title,
        description=new_topic.description,
        color_code=new_topic.color_code,
        total_tasks=0,
        completed_tasks=0,
        progress_percentage=0.0,
        created_at=new_topic.created_at
    )

@router.get("/{topic_id}", response_model=TopicBlockDetailResponse)
def get_topic_detail(
    topic_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = db.query(TopicBlock).filter(
        TopicBlock.id == topic_id,
        TopicBlock.user_id == current_user.id
    ).first()
    
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khối chủ đề hoặc bạn không có quyền truy cập."
        )

    tasks = db.query(Task).filter(Task.topic_id == topic.id).order_by(Task.scheduled_date.asc()).all()
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "COMPLETED")
    pct = (completed / total * 100.0) if total > 0 else 0.0

    task_briefs = [TaskBriefResponse.model_validate(t) for t in tasks]

    return TopicBlockDetailResponse(
        id=topic.id,
        title=topic.title,
        description=topic.description,
        color_code=topic.color_code,
        total_tasks=total,
        completed_tasks=completed,
        progress_percentage=round(pct, 1),
        created_at=topic.created_at,
        tasks=task_briefs
    )

@router.put("/{topic_id}", response_model=TopicBlockResponse)
def update_topic(
    topic_id: UUID,
    topic_in: TopicBlockUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = db.query(TopicBlock).filter(
        TopicBlock.id == topic_id,
        TopicBlock.user_id == current_user.id
    ).first()

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khối chủ đề hoặc bạn không có quyền truy cập."
        )

    if topic_in.title is not None:
        topic.title = topic_in.title
    if topic_in.description is not None:
        topic.description = topic_in.description
    if topic_in.color_code is not None:
        topic.color_code = topic_in.color_code

    db.commit()
    db.refresh(topic)

    total = db.query(Task).filter(Task.topic_id == topic.id).count()
    completed = db.query(Task).filter(Task.topic_id == topic.id, Task.status == "COMPLETED").count()
    pct = (completed / total * 100.0) if total > 0 else 0.0

    return TopicBlockResponse(
        id=topic.id,
        title=topic.title,
        description=topic.description,
        color_code=topic.color_code,
        total_tasks=total,
        completed_tasks=completed,
        progress_percentage=round(pct, 1),
        created_at=topic.created_at
    )

@router.delete("/{topic_id}")
def delete_topic(
    topic_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = db.query(TopicBlock).filter(
        TopicBlock.id == topic_id,
        TopicBlock.user_id == current_user.id
    ).first()

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khối chủ đề hoặc bạn không có quyền truy cập."
        )

    db.delete(topic)
    db.commit()
    return {"message": "Đã xóa khối chủ đề thành công."}
