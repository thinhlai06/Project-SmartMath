from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.models.math_class import MathClass
from app.models.parent_class_link import ParentClassLink
from app.models.student import Student
from app.models.worksheet import Worksheet


router = APIRouter()


# === Schemas ===

class JoinClassRequest(BaseModel):
    class_code: str
    student_name: str


class JoinClassResponse(BaseModel):
    message: str
    class_name: str
    student_name: str


class ParentClassInfo(BaseModel):
    id: int
    class_id: int
    class_name: str
    grade: int
    student_name: str
    teacher_name: str
    joined_at: datetime

    class Config:
        from_attributes = True


class TopicProgress(BaseModel):
    topic: str
    status: str  # 'mastered', 'practicing', 'started'
    percent: int


class TodayAssignment(BaseModel):
    id: int
    title: str
    topic: str
    status: str  # 'completed', 'in_progress', 'pending'
    correct: int
    total: int


class ParentDashboardResponse(BaseModel):
    student_name: str
    class_name: str
    teacher_name: str
    stats: dict  # completed, study_time, avg_score, accuracy
    topic_progress: List[TopicProgress]
    teacher_comment: str
    today_assignments: List[TodayAssignment]


class WorksheetForParent(BaseModel):
    id: int
    title: str
    topic: str
    grade: int
    exercise_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# === Endpoints ===

@router.post("/join-class", response_model=JoinClassResponse)
async def join_class(
    request: JoinClassRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Phụ huynh tham gia lớp học bằng mã lớp.
    """
    # Check if user is a parent
    if current_user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ phụ huynh mới có thể tham gia lớp học"
        )
    
    # Find class by code
    math_class = db.query(MathClass).filter(
        MathClass.class_code == request.class_code.upper()
    ).first()
    
    if not math_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mã lớp không hợp lệ"
        )
    
    # Check if already joined
    existing = db.query(ParentClassLink).filter(
        ParentClassLink.parent_id == current_user.id,
        ParentClassLink.class_id == math_class.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn đã tham gia lớp học này rồi"
        )
    
    # Create or find student
    student = db.query(Student).filter(
        Student.class_id == math_class.id,
        Student.full_name == request.student_name
    ).first()
    
    if not student:
        # Create new student
        student = Student(
            full_name=request.student_name,
            class_id=math_class.id
        )
        db.add(student)
        db.flush()
    
    # Create link
    link = ParentClassLink(
        parent_id=current_user.id,
        class_id=math_class.id,
        student_id=student.id
    )
    db.add(link)
    db.commit()
    
    return JoinClassResponse(
        message="Tham gia lớp học thành công!",
        class_name=math_class.class_name,
        student_name=request.student_name
    )


@router.get("/classes", response_model=List[ParentClassInfo])
async def get_parent_classes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách lớp học mà phụ huynh đã tham gia.
    """
    if current_user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ phụ huynh mới có thể xem danh sách lớp"
        )
    
    links = db.query(ParentClassLink).filter(
        ParentClassLink.parent_id == current_user.id
    ).all()
    
    result = []
    for link in links:
        math_class = db.query(MathClass).filter(MathClass.id == link.class_id).first()
        student = db.query(Student).filter(Student.id == link.student_id).first()
        teacher = db.query(User).filter(User.id == math_class.teacher_id).first()
        
        result.append(ParentClassInfo(
            id=link.id,
            class_id=math_class.id,
            class_name=math_class.class_name,
            grade=math_class.grade,
            student_name=student.full_name if student else "Không xác định",
            teacher_name=teacher.full_name if teacher else "Không xác định",
            joined_at=link.joined_at
        ))
    
    return result


@router.get("/dashboard/{class_id}", response_model=ParentDashboardResponse)
async def get_parent_dashboard(
    class_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lấy dữ liệu dashboard cho phụ huynh theo lớp.
    
    Note: MVP sử dụng mock data cho thống kê tiến độ.
    """
    if current_user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ phụ huynh mới có thể xem dashboard"
        )
    
    # Verify parent has access to this class
    link = db.query(ParentClassLink).filter(
        ParentClassLink.parent_id == current_user.id,
        ParentClassLink.class_id == class_id
    ).first()
    
    if not link:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập lớp này"
        )
    
    # Get class and student info
    math_class = db.query(MathClass).filter(MathClass.id == class_id).first()
    student = db.query(Student).filter(Student.id == link.student_id).first()
    teacher = db.query(User).filter(User.id == math_class.teacher_id).first()
    
    # Get published worksheets for today's assignments
    worksheets = db.query(Worksheet).filter(
        Worksheet.class_id == class_id,
        Worksheet.status == "published"
    ).limit(3).all()
    
    today_assignments = []
    for ws in worksheets:
        today_assignments.append(TodayAssignment(
            id=ws.id,
            title=ws.title,
            topic=ws.topic,
            status="pending",  # Mock - no real tracking yet
            correct=0,
            total=ws.exercise_count
        ))
    
    # Return dashboard with MOCK data for progress
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách bài tập đã published cho phụ huynh xem.
    """
    if current_user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ phụ huynh mới có thể xem bài tập"
        )
    
    # Verify parent has access
    link = db.query(ParentClassLink).filter(
        ParentClassLink.parent_id == current_user.id,
        ParentClassLink.class_id == class_id
    ).first()
    
    if not link:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập lớp này"
        )
    
    # Get published worksheets only
    worksheets = db.query(Worksheet).filter(
        Worksheet.class_id == class_id,
        Worksheet.status == "published"
    ).order_by(Worksheet.created_at.desc()).all()
    
    return [
        WorksheetForParent(
            id=ws.id,
            title=ws.title,
            topic=ws.topic,
            grade=ws.grade,
            exercise_count=ws.exercise_count,
            status=ws.status,
            created_at=ws.created_at
        )
        for ws in worksheets
    ]
