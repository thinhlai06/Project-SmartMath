from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.models.math_class import MathClass
from app.utils.dependencies import get_current_teacher
from app.models.user import User
from app.services import student_service


router = APIRouter()


def verify_class_ownership(db: Session, class_id: int, teacher_id: int) -> MathClass:
    """Verify that the teacher owns the class."""
    db_class = db.query(MathClass).filter(MathClass.id == class_id).first()
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lớp học"
        )
    if db_class.teacher_id != teacher_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập lớp học này"
        )
    return db_class


@router.get("/classes/{class_id}/students", response_model=List[StudentResponse])
async def list_students(
    class_id: int,
    tier: Optional[str] = None,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách học sinh trong lớp.
    
    - **tier**: Lọc theo nhóm (foundation, standard, extension, advanced)
    """
    verify_class_ownership(db, class_id, current_user.id)
    return student_service.get_students_by_class(db, class_id, tier)


@router.post("/classes/{class_id}/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    class_id: int,
    student_data: StudentCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Thêm học sinh vào lớp.
    
    - **full_name**: Họ tên học sinh
    - **tier**: Nhóm năng lực (mặc định: standard)
    """
    verify_class_ownership(db, class_id, current_user.id)
    
    tier_val = student_data.tier.value if student_data.tier else "standard"
    return student_service.create_student(db, student_data.full_name, class_id, tier_val)


@router.get("/students/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: int,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Lấy thông tin học sinh.
    """
    student = student_service.get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy học sinh"
        )
    
    verify_class_ownership(db, student.class_id, current_user.id)
    return student


@router.put("/students/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: int,
    student_data: StudentUpdate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Cập nhật thông tin học sinh.
    """
    student = student_service.get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy học sinh"
        )
    
    verify_class_ownership(db, student.class_id, current_user.id)
    
    tier_val = student_data.tier.value if student_data.tier else None
    return student_service.update_student(db, student, student_data.full_name, tier_val)


@router.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: int,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Xóa học sinh khỏi lớp.
    """
    student = student_service.get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy học sinh"
        )
    
    verify_class_ownership(db, student.class_id, current_user.id)
    student_service.delete_student(db, student)
    return None
