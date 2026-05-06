from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.math_class import MathClass, generate_class_code
from app.models.student import Student
from app.models.announcement import Announcement
from app.models.student_progress import StudentProgress
from app.models.student_analytics import StudentAnalytics
from app.models.grading_report import GradingReport
from app.models.worksheet import Worksheet
from app.models.worksheet_exercise import WorksheetExercise
from app.models.grade_entry import GradeEntry


def get_teacher_classes(
    db: Session,
    teacher_id: int,
    skip: int = 0,
    limit: int = 20,
) -> List[MathClass]:
    """Get all classes for a teacher."""
    return (
        db.query(MathClass)
        .filter(MathClass.teacher_id == teacher_id)
        .order_by(MathClass.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


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
    class_id = db_class.id

    worksheet_ids_query = db.query(Worksheet.id).filter(Worksheet.class_id == class_id)
    student_ids_query = db.query(Student.id).filter(Student.class_id == class_id)

    db.query(GradeEntry).filter(GradeEntry.worksheet_id.in_(worksheet_ids_query)).delete(synchronize_session=False)
    db.query(StudentProgress).filter(StudentProgress.worksheet_id.in_(worksheet_ids_query)).delete(synchronize_session=False)
    db.query(WorksheetExercise).filter(WorksheetExercise.worksheet_id.in_(worksheet_ids_query)).delete(synchronize_session=False)
    db.query(StudentAnalytics).filter(StudentAnalytics.worksheet_id.in_(worksheet_ids_query)).delete(synchronize_session=False)

    db.query(GradeEntry).filter(GradeEntry.student_id.in_(student_ids_query)).delete(synchronize_session=False)
    db.query(StudentProgress).filter(StudentProgress.student_id.in_(student_ids_query)).delete(synchronize_session=False)
    db.query(StudentAnalytics).filter(StudentAnalytics.student_id.in_(student_ids_query)).delete(synchronize_session=False)

    db.query(Announcement).filter(Announcement.class_id == class_id).delete(synchronize_session=False)
    db.query(StudentAnalytics).filter(StudentAnalytics.class_id == class_id).delete(synchronize_session=False)
    db.query(GradingReport).filter(GradingReport.class_id == class_id).delete(synchronize_session=False)

    db.query(Worksheet).filter(Worksheet.class_id == class_id).delete(synchronize_session=False)
    db.query(Student).filter(Student.class_id == class_id).delete(synchronize_session=False)

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
