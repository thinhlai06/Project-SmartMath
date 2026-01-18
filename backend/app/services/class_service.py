from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.math_class import MathClass, generate_class_code
from app.models.student import Student


def get_teacher_classes(db: Session, teacher_id: int) -> List[MathClass]:
    """Get all classes for a teacher."""
    return db.query(MathClass).filter(MathClass.teacher_id == teacher_id).all()


def get_class_by_id(db: Session, class_id: int) -> Optional[MathClass]:
    """Get a class by ID."""
    return db.query(MathClass).filter(MathClass.id == class_id).first()


def get_class_by_code(db: Session, class_code: str) -> Optional[MathClass]:
    """Get a class by its class code."""
    return db.query(MathClass).filter(MathClass.class_code == class_code).first()


def create_class(
    db: Session, 
    class_name: str, 
    grade: int, 
    teacher_id: int
) -> MathClass:
    """Create a new class with auto-generated code."""
    # Generate unique class code
    while True:
        code = generate_class_code()
        if not get_class_by_code(db, code):
            break
    
    db_class = MathClass(
        class_name=class_name,
        grade=grade,
        class_code=code,
        teacher_id=teacher_id
    )
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class


def update_class(
    db: Session, 
    db_class: MathClass, 
    class_name: Optional[str] = None,
    grade: Optional[int] = None
) -> MathClass:
    """Update a class."""
    if class_name is not None:
        db_class.class_name = class_name
    if grade is not None:
        db_class.grade = grade
    
    db.commit()
    db.refresh(db_class)
    return db_class


def delete_class(db: Session, db_class: MathClass) -> None:
    """Delete a class and all related data."""
    db.delete(db_class)
    db.commit()


def regenerate_class_code(db: Session, db_class: MathClass) -> MathClass:
    """Regenerate the class code."""
    while True:
        code = generate_class_code()
        if not get_class_by_code(db, code):
            break
    
    db_class.class_code = code
    db.commit()
    db.refresh(db_class)
    return db_class


def get_class_student_count(db: Session, class_id: int) -> int:
    """Get the number of students in a class."""
    return db.query(Student).filter(Student.class_id == class_id).count()
