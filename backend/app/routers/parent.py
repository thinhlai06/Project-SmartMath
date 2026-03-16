"""Parent router - API endpoints for Parent features."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.core.dependencies import get_current_user, get_current_parent
from app.models.user import User
from app.models.math_class import MathClass
from app.models.parent_class_link import ParentClassLink
from app.models.student import Student
from app.models.worksheet import Worksheet
from app.schemas.parent import (
    JoinClassRequest,
    JoinClassResponse,
    ParentClassInfo,
    TopicProgress,
    TodayAssignment,
    ParentDashboardResponse,
    WorksheetForParent,
)
from app.services import parent_service

router = APIRouter()


# === Endpoints ===

@router.post("/join-class", response_model=JoinClassResponse)
async def join_class(
    request: JoinClassRequest,
    current_user: User = Depends(get_current_parent),
    db: Session = Depends(get_db)
):
    """Phụ huynh tham gia lớp học bằng mã lớp."""
    math_class, student = parent_service.join_parent_to_class(
        db, current_user.id, request.class_code, request.student_name
    )
    
    return JoinClassResponse(
        message="Tham gia lớp học thành công!",
        class_name=math_class.class_name,
        student_name=request.student_name
    )


@router.get("/classes", response_model=List[ParentClassInfo])
async def get_parent_classes(
    current_user: User = Depends(get_current_parent),
    db: Session = Depends(get_db)
):
    """Lấy danh sách lớp học mà phụ huynh đã tham gia."""
    result = parent_service.get_parent_classes_info(db, current_user.id)
    return [ParentClassInfo(**item) for item in result]


@router.get("/dashboard/{class_id}", response_model=ParentDashboardResponse)
async def get_parent_dashboard(
    class_id: int,
    current_user: User = Depends(get_current_parent),
    db: Session = Depends(get_db)
):
    """
    Lấy dữ liệu dashboard cho phụ huynh theo lớp.
    Note: MVP sử dụng mock data cho thống kê tiến độ.
    """
    link = parent_service.check_parent_access(db, current_user.id, class_id)
    
    # Get class and student info
    math_class = db.query(MathClass).filter(MathClass.id == class_id).first()
    student = db.query(Student).filter(Student.id == link.student_id).first()
    teacher = db.query(User).filter(User.id == math_class.teacher_id).first()
    
    # Get published worksheets for today's assignments
    worksheets = parent_service.get_published_worksheets(db, class_id, limit=3)
    
    today_assignments = []
    for ws in worksheets:
        today_assignments.append(TodayAssignment(
            id=ws.id,
            title=ws.title,
            topic="Toán",  # Simplified - will be enhanced with real topic data
            status="pending",
            correct=0,
            total=len(ws.exercises) if ws.exercises else 0
        ))
    
    # Return dashboard with MOCK data for progress (MVP)
    return ParentDashboardResponse(
        student_name=student.full_name if student else "Con bạn",
        class_name=math_class.class_name,
        teacher_name=teacher.full_name if teacher else "Giáo viên",
        stats={
            "completed": 12,
            "study_time": 25,
            "avg_score": 8.2,
            "accuracy": 85
        },
        topic_progress=[
            TopicProgress(topic="Phép chia có dư", status="mastered", percent=90),
            TopicProgress(topic="Bài toán nhiều bước", status="practicing", percent=65),
            TopicProgress(topic="Đổi đơn vị đo", status="started", percent=40),
        ],
        teacher_comment="Con đã có tiến bộ rõ rệt trong tuần này! Con rất tập trung và cố gắng. Hãy tiếp tục phát huy nhé!",
        today_assignments=today_assignments
    )


@router.get("/worksheets/{class_id}", response_model=List[WorksheetForParent])
async def get_parent_worksheets(
    class_id: int,
    current_user: User = Depends(get_current_parent),
    db: Session = Depends(get_db)
):
    """Lấy danh sách bài tập đã published cho phụ huynh xem."""
    parent_service.check_parent_access(db, current_user.id, class_id)
    worksheets = parent_service.get_published_worksheets(db, class_id)
    
    return [
        WorksheetForParent(
            id=ws.id,
            title=ws.title,
            topic="Toán",  # Simplified
            grade=ws.grade,
            exercise_count=len(ws.exercises) if ws.exercises else 0,
            status=ws.status.value if hasattr(ws.status, 'value') else ws.status,
            created_at=ws.created_at
        )
        for ws in worksheets
    ]


@router.get("/reports/{class_id}")
async def get_parent_reports(
    class_id: int,
    current_user: User = Depends(get_current_parent),
    db: Session = Depends(get_db)
):
    """Lấy danh sách báo cáo phân tích lỗi cho phụ huynh."""
    parent_service.check_parent_access(db, current_user.id, class_id)
    
    from app.services.report_service import ReportService
    service = ReportService(db)
    reports = service.get_reports_for_class(class_id)
    
    return [
        {
            "id": r.id,
            "student_name": r.student_name,
            "worksheet_title": r.worksheet_title,
            "total_score": r.total_score,
            "max_score": r.max_score,
            "created_at": r.created_at.isoformat(),
            "file_url": f"/api/ai/grading-report/{r.id}/download"
        }
        for r in reports
    ]
