from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.models.student import Student
from app.models.math_class import MathClass
from app.utils.dependencies import get_current_teacher
from app.models.user import User


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
    tier: str = None,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách học sinh trong lớp.
    
    - **tier**: Lọc theo nhóm (foundation, standard, extension, advanced)
    """
    verify_class_ownership(db, class_id, current_user.id)
    
    query = db.query(Student).filter(Student.class_id == class_id)
    if tier:
        query = query.filter(Student.tier == tier)
    
    students = query.order_by(Student.full_name).all()
    return students


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
    
    student = Student(
        full_name=student_data.full_name,
        class_id=class_id,
        tier=student_data.tier.value if student_data.tier else "standard"
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get("/students/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: int,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Lấy thông tin học sinh.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
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
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy học sinh"
        )
    
    verify_class_ownership(db, student.class_id, current_user.id)
    
    if student_data.full_name is not None:
        student.full_name = student_data.full_name
    if student_data.tier is not None:
        student.tier = student_data.tier.value
    
    db.commit()
    db.refresh(student)
    return student


@router.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: int,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Xóa học sinh khỏi lớp.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy học sinh"
        )
    
    verify_class_ownership(db, student.class_id, current_user.id)
    
    db.delete(student)
    db.commit()
    return None
