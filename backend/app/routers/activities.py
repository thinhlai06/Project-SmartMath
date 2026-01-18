"""
Activities router - generates activity feed from existing data
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, union_all
from typing import List
from datetime import datetime

from ..database import get_db
from ..models.user import User
from ..models.math_class import MathClass
from ..models.worksheet import Worksheet
from ..models.student import Student
from ..models.announcement import Announcement
from ..routers.auth import get_current_user

router = APIRouter()


@router.get("/activities")
async def get_recent_activities(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get recent activities for the teacher dashboard.
    Aggregates activities from worksheets, students, and announcements.
    """
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Only teachers can view activities")
    
    activities = []
    
    # Get teacher's class IDs
    class_ids = [c.id for c in db.query(MathClass.id).filter(
        MathClass.teacher_id == current_user.id
    ).all()]
    
    if not class_ids:
        return []
    
    # Get recent worksheets
    worksheets = db.query(Worksheet).filter(
        Worksheet.class_id.in_(class_ids)
    ).order_by(desc(Worksheet.created_at)).limit(5).all()
    
    for ws in worksheets:
        math_class = db.query(MathClass).filter(MathClass.id == ws.class_id).first()
        class_name = math_class.class_name if math_class else "Lớp"
        
        if ws.status == 'published':
            activities.append({
                "id": f"ws_{ws.id}",
                "type": "worksheet_published",
                "description": f"Xuất bản bài tập \"{ws.title}\"",
                "timestamp": ws.updated_at.isoformat() if ws.updated_at else ws.created_at.isoformat(),
                "icon": "📝",
                "color": "green",
                "metadata": {"class_name": class_name}
            })
        else:
            activities.append({
                "id": f"ws_{ws.id}",
                "type": "worksheet_created",
                "description": f"Tạo bài tập \"{ws.title}\"",
                "timestamp": ws.created_at.isoformat(),
                "icon": "📄",
                "color": "blue",
                "metadata": {"class_name": class_name}
            })
    
    # Get recent students added
    students = db.query(Student).filter(
        Student.class_id.in_(class_ids)
    ).order_by(desc(Student.created_at)).limit(5).all()
    
    for student in students:
        math_class = db.query(MathClass).filter(MathClass.id == student.class_id).first()
        class_name = math_class.class_name if math_class else "Lớp"
        activities.append({
            "id": f"student_{student.id}",
            "type": "student_added",
            "description": f"Thêm học sinh \"{student.full_name}\" vào {class_name}",
            "timestamp": student.created_at.isoformat(),
            "icon": "👤",
            "color": "purple",
            "metadata": {"class_name": class_name}
        })
    
    # Get recent announcements
    announcements = db.query(Announcement).filter(
        Announcement.class_id.in_(class_ids)
    ).order_by(desc(Announcement.created_at)).limit(5).all()
    
    for ann in announcements:
        math_class = db.query(MathClass).filter(MathClass.id == ann.class_id).first()
        class_name = math_class.class_name if math_class else "Lớp"
        activities.append({
            "id": f"ann_{ann.id}",
            "type": "announcement_created",
            "description": f"Đăng thông báo \"{ann.title}\"",
            "timestamp": ann.created_at.isoformat(),
            "icon": "📢",
            "color": "orange",
            "metadata": {"class_name": class_name}
        })
    
    # Sort all activities by timestamp (newest first)
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    
    # Return limited results
    return activities[:limit]
