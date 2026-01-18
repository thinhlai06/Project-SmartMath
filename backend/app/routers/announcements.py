from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.announcement import Announcement
from app.models.math_class import MathClass
from app.models.user import User
from app.schemas.announcement import AnnouncementCreate, AnnouncementResponse
from app.routers.auth import get_current_user

router = APIRouter()


@router.get("/classes/{class_id}/announcements", response_model=List[AnnouncementResponse])
async def get_announcements(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all announcements for a class."""
    # Verify class exists
    math_class = db.query(MathClass).filter(MathClass.id == class_id).first()
    if not math_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    announcements = db.query(Announcement).filter(
        Announcement.class_id == class_id
    ).order_by(Announcement.created_at.desc()).all()
    
    return announcements


@router.post("/announcements", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    announcement: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new announcement (Teacher only)."""
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create announcements")
    
    # Verify class exists and belongs to teacher
    math_class = db.query(MathClass).filter(
        MathClass.id == announcement.class_id,
        MathClass.teacher_id == current_user.id
    ).first()
    if not math_class:
        raise HTTPException(status_code=404, detail="Class not found or not owned by you")
    
    db_announcement = Announcement(
        class_id=announcement.class_id,
        title=announcement.title,
        content=announcement.content
    )
    db.add(db_announcement)
    db.commit()
    db.refresh(db_announcement)
    
    return db_announcement


@router.delete("/announcements/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an announcement (Teacher only)."""
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can delete announcements")
    
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Verify the announcement's class belongs to the teacher
    math_class = db.query(MathClass).filter(
        MathClass.id == announcement.class_id,
        MathClass.teacher_id == current_user.id
    ).first()
    if not math_class:
        raise HTTPException(status_code=403, detail="You don't own this class")
    
    db.delete(announcement)
    db.commit()
    
    return None
