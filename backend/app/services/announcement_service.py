from sqlalchemy.orm import Session
from typing import List
from fastapi import HTTPException, status

from app.models.announcement import Announcement
from app.models.math_class import MathClass


def get_announcements_by_class(db: Session, class_id: int) -> List[Announcement]:
    """Get all announcements for a class."""
    math_class = db.query(MathClass).filter(MathClass.id == class_id).first()
    if not math_class:
        raise HTTPException(status_code=404, detail="Class not found")
        
    return db.query(Announcement).filter(
        Announcement.class_id == class_id
    ).order_by(Announcement.created_at.desc()).all()


def create_announcement(db: Session, teacher_id: int, class_id: int, title: str, content: str) -> Announcement:
    """Create a new announcement for a class."""
    math_class = db.query(MathClass).filter(
        MathClass.id == class_id,
        MathClass.teacher_id == teacher_id
    ).first()
    
    if not math_class:
        raise HTTPException(status_code=404, detail="Class not found or not owned by you")
        
    announcement = Announcement(
        class_id=class_id,
        title=title,
        content=content
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    
    return announcement


def delete_announcement(db: Session, teacher_id: int, announcement_id: int) -> None:
    """Delete an announcement from a class."""
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    math_class = db.query(MathClass).filter(
        MathClass.id == announcement.class_id,
        MathClass.teacher_id == teacher_id
    ).first()
    
    if not math_class:
        raise HTTPException(status_code=403, detail="You don't own this class")
        
    db.delete(announcement)
    db.commit()
