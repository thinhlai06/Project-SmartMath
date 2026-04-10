from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.math_class import MathClass
from app.models.student import Student
from app.models.worksheet import Worksheet
from app.models.student_progress import StudentProgress
from app.models.user import User, UserRole
from app.schemas.ai import ClassAnalyticsResponse
from app.services.ai.analytics_service import AnalyticsService
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics for the current teacher."""
    if current_user.role != UserRole.TEACHER:
        return {
            "total_classes": 0,
            "total_students": 0,
            "total_worksheets": 0,
            "avg_score": None
        }
    
    # Securely scope every aggregate by classes.teacher_id == current_user.id.
    total_classes = (
        db.query(func.count(MathClass.id))
        .filter(MathClass.teacher_id == current_user.id)
        .scalar()
        or 0
    )

    total_students = (
        db.query(func.count(Student.id))
        .join(MathClass, Student.class_id == MathClass.id)
        .filter(MathClass.teacher_id == current_user.id)
        .scalar()
        or 0
    )

    total_worksheets = (
        db.query(func.count(Worksheet.id))
        .join(MathClass, Worksheet.class_id == MathClass.id)
        .filter(MathClass.teacher_id == current_user.id)
        .scalar()
        or 0
    )

    avg_score_raw = (
        db.query(func.avg((StudentProgress.correct_count * 10.0) / StudentProgress.total_count))
        .join(Student, StudentProgress.student_id == Student.id)
        .join(MathClass, Student.class_id == MathClass.id)
        .filter(
            MathClass.teacher_id == current_user.id,
            StudentProgress.total_count > 0,
        )
        .scalar()
    )
    avg_score = round(float(avg_score_raw), 1) if avg_score_raw is not None else None
    
    return {
        "total_classes": total_classes,
        "total_students": total_students,
        "total_worksheets": total_worksheets,
        "avg_score": avg_score
    }


@router.get("/ai/analytics/{class_id}", response_model=ClassAnalyticsResponse)
async def get_class_analytics_fallback(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fallback analytics endpoint available without loading the heavy AI router."""
    if current_user.role != UserRole.TEACHER:
        return {
            "weak_topics": [],
            "student_performance": [],
            "common_mistakes": []
        }

    service = AnalyticsService(db)
    return service.analyze_class_errors(class_id)
