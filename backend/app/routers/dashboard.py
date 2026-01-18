from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.math_class import MathClass
from app.models.student import Student
from app.models.worksheet import Worksheet
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter()


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics for the current teacher."""
    if current_user.role != "teacher":
        return {
            "total_classes": 0,
            "total_students": 0,
            "total_worksheets": 0,
            "avg_score": None
        }
    
    # Count classes owned by teacher
    total_classes = db.query(MathClass).filter(
        MathClass.teacher_id == current_user.id
    ).count()
    
    # Get all class IDs for this teacher
    class_ids = [c.id for c in db.query(MathClass.id).filter(
        MathClass.teacher_id == current_user.id
    ).all()]
    
    # Count students in those classes
    total_students = 0
    if class_ids:
        total_students = db.query(Student).filter(
            Student.class_id.in_(class_ids)
        ).count()
    
    # Count worksheets in those classes
    total_worksheets = 0
    if class_ids:
        total_worksheets = db.query(Worksheet).filter(
            Worksheet.class_id.in_(class_ids)
        ).count()
    
    return {
        "total_classes": total_classes,
        "total_students": total_students,
        "total_worksheets": total_worksheets,
        "avg_score": None  # TODO: Calculate from StudentProgress when available
    }
