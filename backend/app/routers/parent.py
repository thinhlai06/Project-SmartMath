"""Parent router - API endpoints for Parent features."""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.core.dependencies import get_current_user, get_current_parent
from app.models.user import User
from app.models.math_class import MathClass
from app.models.parent_class_link import ParentClassLink
from app.models.student import Student
from app.models.worksheet import Worksheet
from app.models.math_topic import MathTopic
from app.models.student_progress import StudentProgress, ProgressStatus
from app.models.announcement import Announcement
from app.models.worksheet_exercise import WorksheetExercise
from app.schemas.parent import (
    JoinClassRequest,
    JoinClassResponse,
    MarkWorksheetCompletedResponse,
    ParentClassInfo,
    TopicProgress,
    TodayAssignment,
    ParentDashboardResponse,
    WorksheetForParent,
)
from app.schemas.worksheet import ExerciseResponse
from app.services import parent_service

router = APIRouter()


def _status_value(value: object) -> str:
    if hasattr(value, "value"):
        return str(value.value)
    return str(value)


def _score_on_ten(progress: StudentProgress) -> Optional[float]:
    if isinstance(progress.details, list) and progress.details:
        total_score = 0.0
        total_max = 0.0
        for item in progress.details:
            if not isinstance(item, dict):
                continue
            total_score += float(item.get("score", 0) or 0)
            total_max += float(item.get("max_score", 0) or 0)
        if total_max > 0:
            return (total_score / total_max) * 10

    if progress.total_count and progress.total_count > 0:
        return (progress.correct_count / progress.total_count) * 10

    return None


def _build_parent_worksheets(db: Session, class_id: int) -> List[WorksheetForParent]:
    worksheet_rows = (
        db.query(Worksheet, MathTopic.topic_name)
        .outerjoin(MathTopic, Worksheet.topic_id == MathTopic.id)
        .filter(
            Worksheet.class_id == class_id,
            Worksheet.status == "published"
        )
        .order_by(Worksheet.created_at.desc())
        .all()
    )

    return [
        WorksheetForParent(
            id=ws.id,
            title=ws.title,
            topic=topic_name or "Chưa phân loại",
            grade=ws.grade,
            exercise_count=len(ws.exercises) if ws.exercises else 0,
            status=ws.status.value if hasattr(ws.status, "value") else ws.status,
            created_at=ws.created_at,
        )
        for ws, topic_name in worksheet_rows
    ]


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
    """Lấy dữ liệu dashboard cho phụ huynh theo lớp từ dữ liệu thật."""
    link = parent_service.check_parent_access(db, current_user.id, class_id)
    
    # Get class and student info
    math_class = db.query(MathClass).filter(MathClass.id == class_id).first()
    student = db.query(Student).filter(Student.id == link.student_id).first()
    teacher = db.query(User).filter(User.id == math_class.teacher_id).first()
    
    # Load progress for this student in this class
    progress_rows = (
        db.query(StudentProgress)
        .join(Worksheet, StudentProgress.worksheet_id == Worksheet.id)
        .filter(
            StudentProgress.student_id == link.student_id,
            Worksheet.class_id == class_id
        )
        .all()
    )
    progress_by_worksheet = {p.worksheet_id: p for p in progress_rows}

    completed_count = sum(1 for p in progress_rows if _status_value(p.status) == ProgressStatus.COMPLETED.value)
    total_correct = sum((p.correct_count or 0) for p in progress_rows)
    total_questions = sum((p.total_count or 0) for p in progress_rows if (p.total_count or 0) > 0)
    accuracy = round((total_correct / total_questions) * 100) if total_questions > 0 else 0

    worksheet_scores = []
    for progress in progress_rows:
        score = _score_on_ten(progress)
        if score is not None:
            worksheet_scores.append(score)
    avg_score = round(sum(worksheet_scores) / len(worksheet_scores), 1) if worksheet_scores else 0.0

    # Build topic progress from published worksheets + math topic
    worksheet_topic_rows = (
        db.query(Worksheet, MathTopic.topic_name)
        .outerjoin(MathTopic, Worksheet.topic_id == MathTopic.id)
        .filter(
            Worksheet.class_id == class_id,
            Worksheet.status == "published"
        )
        .all()
    )

    topic_percent_map = {}
    for ws, topic_name in worksheet_topic_rows:
        topic_label = topic_name or "Chưa phân loại"
        progress = progress_by_worksheet.get(ws.id)

        percent = 0
        if progress:
            if progress.total_count and progress.total_count > 0:
                percent = round((progress.correct_count / progress.total_count) * 100)
            elif _status_value(progress.status) == ProgressStatus.COMPLETED.value:
                percent = 100

        topic_percent_map.setdefault(topic_label, []).append(percent)

    topic_progress = []
    for topic, values in topic_percent_map.items():
        avg_percent = round(sum(values) / len(values)) if values else 0
        if avg_percent >= 80:
            status_value = "mastered"
        elif avg_percent >= 40:
            status_value = "practicing"
        else:
            status_value = "started"

        topic_progress.append(TopicProgress(topic=topic, status=status_value, percent=avg_percent))

    topic_progress.sort(key=lambda item: item.percent, reverse=True)

    # Latest teacher note from class announcements
    latest_announcement = (
        db.query(Announcement)
        .filter(Announcement.class_id == class_id)
        .order_by(Announcement.created_at.desc())
        .first()
    )
    teacher_comment = latest_announcement.content if latest_announcement else ""

    # Get published worksheets for today's assignments
    worksheets = parent_service.get_published_worksheets(db, class_id, limit=3)
    
    today_assignments = []
    for ws in worksheets:
        progress = progress_by_worksheet.get(ws.id)
        if progress:
            status_value = _status_value(progress.status)
            correct_count = progress.correct_count or 0
            total_count = progress.total_count if (progress.total_count or 0) > 0 else (len(ws.exercises) if ws.exercises else 0)
        else:
            status_value = "pending"
            correct_count = 0
            total_count = len(ws.exercises) if ws.exercises else 0

        topic_name = "Chưa phân loại"
        if ws.topic_id:
            topic = db.query(MathTopic).filter(MathTopic.id == ws.topic_id).first()
            if topic:
                topic_name = topic.topic_name

        today_assignments.append(TodayAssignment(
            id=ws.id,
            title=ws.title,
            topic=topic_name,
            status=status_value,
            correct=correct_count,
            total=total_count,
        ))
    
    return ParentDashboardResponse(
        student_name=student.full_name if student else "Con bạn",
        class_name=math_class.class_name,
        teacher_name=teacher.full_name if teacher else "Giáo viên",
        stats={
            "completed": completed_count,
            "study_time": total_questions,
            "avg_score": avg_score,
            "accuracy": accuracy,
        },
        topic_progress=topic_progress,
        teacher_comment=teacher_comment,
        today_assignments=today_assignments
    )


@router.get("/worksheets/{class_id}", response_model=List[WorksheetForParent])
async def get_parent_worksheets(
    class_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_parent),
    db: Session = Depends(get_db)
):
    """Lấy danh sách bài tập đã published cho phụ huynh xem."""
    parent_service.check_parent_access(db, current_user.id, class_id)
    worksheets = _build_parent_worksheets(db, class_id)
    return worksheets[skip: skip + limit]


@router.get("/classes/{class_code}/worksheets", response_model=List[WorksheetForParent])
async def get_parent_worksheets_by_class_code(
    class_code: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_parent),
    db: Session = Depends(get_db)
):
    """Lấy danh sách bài tập theo class_code, trả về topic_name thật từ MathTopic."""
    math_class = db.query(MathClass).filter(MathClass.class_code == class_code.upper()).first()
    if not math_class:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mã lớp không hợp lệ")

    parent_service.check_parent_access(db, current_user.id, math_class.id)
    worksheets = _build_parent_worksheets(db, math_class.id)
    return worksheets[skip: skip + limit]


@router.post("/worksheets/{worksheet_id}/mark-completed", response_model=MarkWorksheetCompletedResponse)
async def mark_parent_worksheet_completed(
    worksheet_id: int,
    current_user: User = Depends(get_current_parent),
    db: Session = Depends(get_db)
):
    """Phụ huynh đánh dấu worksheet giấy đã hoàn thành cho con."""
    worksheet = db.query(Worksheet).filter(Worksheet.id == worksheet_id).first()
    if not worksheet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bài tập không tồn tại")

    link = parent_service.check_parent_access(db, current_user.id, worksheet.class_id)
    if _status_value(worksheet.status) != "published":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bài tập chưa được xuất bản")

    progress = (
        db.query(StudentProgress)
        .filter(
            StudentProgress.student_id == link.student_id,
            StudentProgress.worksheet_id == worksheet_id,
        )
        .first()
    )

    if not progress:
        exercise_count = (
            db.query(WorksheetExercise)
            .filter(WorksheetExercise.worksheet_id == worksheet_id)
            .count()
        )
        progress = StudentProgress(
            student_id=link.student_id,
            worksheet_id=worksheet_id,
            status=ProgressStatus.COMPLETED,
            correct_count=0,
            total_count=exercise_count,
            completed_at=datetime.utcnow(),
        )
        db.add(progress)
    else:
        progress.status = ProgressStatus.COMPLETED
        progress.completed_at = datetime.utcnow()

    db.commit()

    return MarkWorksheetCompletedResponse(
        worksheet_id=worksheet_id,
        status=ProgressStatus.COMPLETED.value,
        message="Đã đánh dấu hoàn thành",
    )


@router.get("/worksheets/{worksheet_id}/exercises", response_model=List[ExerciseResponse])
async def get_parent_worksheet_exercises(
    worksheet_id: int,
    current_user: User = Depends(get_current_parent),
    db: Session = Depends(get_db)
):
    """Lấy danh sách câu hỏi/đáp án của worksheet để phụ huynh xem chi tiết."""
    worksheet = db.query(Worksheet).filter(Worksheet.id == worksheet_id).first()
    if not worksheet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bài tập không tồn tại")

    parent_service.check_parent_access(db, current_user.id, worksheet.class_id)

    if _status_value(worksheet.status) != "published":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bài tập chưa được xuất bản")

    exercises = (
        db.query(WorksheetExercise)
        .filter(WorksheetExercise.worksheet_id == worksheet_id)
        .order_by(WorksheetExercise.order_index.asc(), WorksheetExercise.id.asc())
        .all()
    )
    return exercises


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
