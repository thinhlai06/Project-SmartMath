from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.student import Student


def get_students_by_class(
    db: Session,
    class_id: int,
    tier: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> List[Student]:
    """Get all students in a class, optionally filtered by tier."""
    query = db.query(Student).filter(Student.class_id == class_id)
    if tier:
        query = query.filter(Student.tier == tier)
    return query.order_by(Student.full_name).offset(skip).limit(limit).all()


def get_student_by_id(db: Session, student_id: int) -> Optional[Student]:
    """Get a student by ID."""
    return db.query(Student).filter(Student.id == student_id).first()


def create_student(db: Session, full_name: str, class_id: int, tier: str = "standard") -> Student:
    """Create a new student in a class."""
    student = Student(
        full_name=full_name,
        class_id=class_id,
        tier=tier
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


def update_student(db: Session, student: Student, full_name: Optional[str] = None, tier: Optional[str] = None) -> Student:
    """Update a student's information."""
    if full_name is not None:
        student.full_name = full_name
    if tier is not None:
        student.tier = tier
        
    db.commit()
    db.refresh(student)
    return student


def delete_student(db: Session, student: Student) -> None:
    """Delete a student."""
    db.delete(student)
    db.commit()
