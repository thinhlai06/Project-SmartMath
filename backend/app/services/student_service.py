from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime

from app.models.student import Student
from app.models.student_progress import StudentProgress


def _calculate_avg_score(db: Session, student_id: int) -> Optional[float]:
    """Calculate average score on a 10-point scale for one student."""
    progress_rows = db.query(StudentProgress).filter(StudentProgress.student_id == student_id).all()
    score_values: List[float] = []

    for progress in progress_rows:
        if progress.total_count and progress.total_count > 0:
            score_values.append(((progress.correct_count or 0) / progress.total_count) * 10)

    if not score_values:
        return None

    return round(sum(score_values) / len(score_values), 1)


def _attach_avg_score(db: Session, student: Student) -> Student:
    """Attach computed avg_score attribute for response serialization."""
    setattr(student, "avg_score", _calculate_avg_score(db, student.id))
    return student


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
    students = query.order_by(Student.full_name).offset(skip).limit(limit).all()
    return [_attach_avg_score(db, student) for student in students]


def get_student_by_id(db: Session, student_id: int) -> Optional[Student]:
    """Get a student by ID."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return None
    return _attach_avg_score(db, student)


def create_student(
    db: Session,
    full_name: str,
    class_id: int,
    tier: str = "standard",
    dob: Optional[date] = None,
    parent_name: Optional[str] = None,
    parent_phone: Optional[str] = None,
) -> Student:
    """Create a new student in a class."""
    student = Student(
        full_name=full_name,
        class_id=class_id,
        tier=tier,
        dob=dob,
        parent_name=parent_name,
        parent_phone=parent_phone,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    setattr(student, "avg_score", None)
    return student


def update_student(
    db: Session,
    student: Student,
    full_name: Optional[str] = None,
    tier: Optional[str] = None,
    dob: Optional[date] = None,
    parent_name: Optional[str] = None,
    parent_phone: Optional[str] = None,
) -> Student:
    """Update a student's information."""
    if full_name is not None:
        student.full_name = full_name
    if tier is not None:
        student.tier = tier
    if dob is not None:
        student.dob = dob
    if parent_name is not None:
        student.parent_name = parent_name
    if parent_phone is not None:
        student.parent_phone = parent_phone
        
    db.commit()
    db.refresh(student)
    return _attach_avg_score(db, student)


def bulk_create_students(db: Session, students: List[Student]) -> List[Student]:
    """Bulk insert students in a single transaction using add_all."""
    db.add_all(students)
    db.commit()
    for student in students:
        db.refresh(student)
        setattr(student, "avg_score", None)
    return students


def delete_student(db: Session, student: Student) -> None:
    """Delete a student."""
    db.delete(student)
    db.commit()


def save_student_progress(
    db: Session,
    student_id: int,
    worksheet_id: int,
    correct_count: int,
    total_count: int,
    details: Optional[dict] = None,
) -> StudentProgress:
    """Create or update worksheet progress for a student."""
    progress = db.query(StudentProgress).filter(
        StudentProgress.student_id == student_id,
        StudentProgress.worksheet_id == worksheet_id,
    ).first()

    if progress is None:
        progress = StudentProgress(student_id=student_id, worksheet_id=worksheet_id)
        db.add(progress)

    progress.status = "completed"
    progress.correct_count = correct_count
    progress.total_count = total_count
    progress.completed_at = datetime.utcnow()
    progress.updated_at = datetime.utcnow()
    progress.details = details

    db.commit()
    db.refresh(progress)
    return progress
