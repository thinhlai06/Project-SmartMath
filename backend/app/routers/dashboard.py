from fastapi import APIRouter, Depends
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
    
    # Count classes owned by teacher
    total_classes = db.query(MathClass).filter(
        MathClass.teacher_id == current_user.id
    ).count()
    
    # Get all class IDs for this teacher
    class_ids = [c.id for c in db.query(MathClass).filter(
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

    # Calculate average score (scale 0-10) from student progress of classes owned by teacher
    avg_score = None
    if class_ids:
        progress_rows = (
            db.query(StudentProgress)
            .join(Student, StudentProgress.student_id == Student.id)
            .filter(Student.class_id.in_(class_ids))
            .all()
        )

        score_values = []
        for progress in progress_rows:
            if progress.total_count and progress.total_count > 0:
                score_values.append(((progress.correct_count or 0) / progress.total_count) * 10)

        if score_values:
            avg_score = round(sum(score_values) / len(score_values), 1)
    
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
