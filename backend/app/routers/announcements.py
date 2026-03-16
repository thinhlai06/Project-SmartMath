from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.announcement import Announcement
from app.models.math_class import MathClass
from app.models.user import User, UserRole
from app.schemas.announcement import AnnouncementCreate, AnnouncementResponse
from app.utils.dependencies import get_current_user
from app.services import announcement_service

router = APIRouter()


@router.get("/classes/{class_id}/announcements", response_model=List[AnnouncementResponse])
async def get_announcements(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all announcements for a class."""
    return announcement_service.get_announcements_by_class(db, class_id)


@router.post("/announcements", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    announcement: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new announcement (Teacher only)."""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can create announcements")
    
    db_announcement = announcement_service.create_announcement(
        db, current_user.id, announcement.class_id, announcement.title, announcement.content
    )
    return db_announcement


@router.delete("/announcements/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an announcement (Teacher only)."""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can delete announcements")
    
    announcement_service.delete_announcement(db, current_user.id, announcement_id)
    return None
