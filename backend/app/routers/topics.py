from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.math_topic import MathTopic
from app.schemas.topic import MathTopicResponse


router = APIRouter()


@router.get("", response_model=List[MathTopicResponse])
async def get_topics(
    grade: Optional[int] = Query(None, ge=1, le=3, description="Lọc theo khối lớp (1-3)"),
    category: Optional[str] = Query(None, description="Lọc theo danh mục"),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách chủ đề toán.
    
    - **grade**: Lọc theo khối lớp (1, 2, hoặc 3)
    - **category**: Lọc theo danh mục (Số học, Hình học, etc.)
    """
    query = db.query(MathTopic)
    
    if grade is not None:
        query = query.filter(MathTopic.grade == grade)
    
    if category is not None:
        query = query.filter(MathTopic.category == category)
    
    topics = query.order_by(MathTopic.grade, MathTopic.topic_name).all()
    return topics


@router.get("/{topic_id}", response_model=MathTopicResponse)
async def get_topic(
    topic_id: int,
    db: Session = Depends(get_db)
):
    """
    Lấy thông tin chi tiết một chủ đề.
    """
    from fastapi import HTTPException
    
    topic = db.query(MathTopic).filter(MathTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Không tìm thấy chủ đề")
    
    return topic
