from sqlalchemy.orm import Session
from typing import List, Tuple, Optional, Dict, Any
from fastapi import HTTPException, status

from app.models.math_class import MathClass
from app.models.parent_class_link import ParentClassLink
from app.models.student import Student
from app.models.worksheet import Worksheet
from app.models.user import User


def check_parent_access(db: Session, parent_id: int, class_id: int) -> ParentClassLink:
    """Verify parent has access to the class."""
    link = db.query(ParentClassLink).filter(
        ParentClassLink.parent_id == parent_id,
        ParentClassLink.class_id == class_id
    ).first()
    if not link:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập lớp này"
        )
    return link


def join_parent_to_class(db: Session, parent_id: int, class_code: str, student_name: str) -> Tuple[MathClass, Student]:
    """Link a parent to a class and create/find student."""
    math_class = db.query(MathClass).filter(
        MathClass.class_code == class_code.upper()
    ).first()
    
    if not math_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mã lớp không hợp lệ"
        )
        
    existing = db.query(ParentClassLink).filter(
        ParentClassLink.parent_id == parent_id,
        ParentClassLink.class_id == math_class.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn đã tham gia lớp học này rồi"
        )
        
    student = db.query(Student).filter(
        Student.class_id == math_class.id,
        Student.full_name == student_name
    ).first()
    
    if not student:
        student = Student(
            full_name=student_name,
            class_id=math_class.id
        )
        db.add(student)
        db.flush()
        
    link = ParentClassLink(
        parent_id=parent_id,
        class_id=math_class.id,
        student_id=student.id
    )
    db.add(link)
    db.commit()
    
    return math_class, student


def get_parent_classes_info(db: Session, parent_id: int) -> List[Dict[str, Any]]:
    """Get summarized info for all classes a parent has joined."""
    links = db.query(ParentClassLink).filter(ParentClassLink.parent_id == parent_id).all()
    result = []
    for link in links:
        math_class = db.query(MathClass).filter(MathClass.id == link.class_id).first()
        student = db.query(Student).filter(Student.id == link.student_id).first()
        teacher = db.query(User).filter(User.id == math_class.teacher_id).first()
        
        result.append({
            "id": link.id,
            "class_id": math_class.id,
            "class_name": math_class.class_name,
            "grade": math_class.grade,
            "student_name": student.full_name if student else "Không xác định",
            "teacher_name": teacher.full_name if teacher else "Không xác định",
            "joined_at": link.joined_at
        })
    return result


def get_published_worksheets(db: Session, class_id: int, limit: Optional[int] = None) -> List[Worksheet]:
    """Get published worksheets for a class."""
    query = db.query(Worksheet).filter(
        Worksheet.class_id == class_id,
        Worksheet.status == "published"
    ).order_by(Worksheet.created_at.desc())
    
    if limit:
        return query.limit(limit).all()
    return query.all()
