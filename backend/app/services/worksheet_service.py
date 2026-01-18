"""Service layer for Worksheet operations."""
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional, List

from app.models.worksheet import Worksheet, WorksheetStatus, WorksheetType
from app.models.worksheet_exercise import WorksheetExercise
from app.schemas.worksheet import WorksheetCreate, WorksheetUpdate


def create_worksheet(
    db: Session,
    class_id: int,
    data: WorksheetCreate
) -> Worksheet:
    """Create a new worksheet for a class."""
    worksheet = Worksheet(
        title=data.title,
        class_id=class_id,
        topic_id=data.topic_id,
        grade=data.grade,
        worksheet_type=data.worksheet_type,
        objective=data.objective,
        difficulty=data.difficulty,
        status=WorksheetStatus.DRAFT
    )
    db.add(worksheet)
    db.commit()
    db.refresh(worksheet)
    return worksheet


def get_worksheets_by_class(
    db: Session,
    class_id: int,
    status: Optional[str] = None,
    worksheet_type: Optional[str] = None
) -> List[Worksheet]:
    """Get all worksheets for a class with optional filters."""
    query = db.query(Worksheet).filter(Worksheet.class_id == class_id)
    
    if status:
        query = query.filter(Worksheet.status == status)
    
    if worksheet_type:
        query = query.filter(Worksheet.worksheet_type == worksheet_type)
    
    return query.order_by(Worksheet.created_at.desc()).all()


def get_worksheet_by_id(db: Session, worksheet_id: int) -> Optional[Worksheet]:
    """Get a worksheet by ID with exercises loaded."""
    return db.query(Worksheet).filter(Worksheet.id == worksheet_id).first()


def update_worksheet(
    db: Session,
    worksheet: Worksheet,
    data: WorksheetUpdate
) -> Worksheet:
    """Update worksheet details."""
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(worksheet, key, value)
    db.commit()
    db.refresh(worksheet)
    return worksheet


def delete_worksheet(db: Session, worksheet: Worksheet) -> None:
    """Delete a worksheet and its exercises (cascade)."""
    db.delete(worksheet)
    db.commit()


def publish_worksheet(db: Session, worksheet: Worksheet) -> Worksheet:
    """Publish a worksheet, making it visible to parents."""
    worksheet.status = WorksheetStatus.PUBLISHED
    worksheet.published_at = datetime.utcnow()
    db.commit()
    db.refresh(worksheet)
    return worksheet


def unpublish_worksheet(db: Session, worksheet: Worksheet) -> Worksheet:
    """Unpublish a worksheet, reverting to draft status."""
    worksheet.status = WorksheetStatus.DRAFT
    worksheet.published_at = None
    db.commit()
    db.refresh(worksheet)
    return worksheet


def duplicate_worksheet(db: Session, worksheet: Worksheet, new_title: Optional[str] = None) -> Worksheet:
    """Duplicate a worksheet with all its exercises."""
    # Create new worksheet
    new_worksheet = Worksheet(
        title=new_title or f"{worksheet.title} (Copy)",
        class_id=worksheet.class_id,
        topic_id=worksheet.topic_id,
        grade=worksheet.grade,
        worksheet_type=worksheet.worksheet_type,
        objective=worksheet.objective,
        difficulty=worksheet.difficulty,
        status=WorksheetStatus.DRAFT
    )
    db.add(new_worksheet)
    db.flush()  # Get the new ID
    
    # Duplicate exercises
    for exercise in worksheet.exercises:
        new_exercise = WorksheetExercise(
            worksheet_id=new_worksheet.id,
            exercise_type=exercise.exercise_type,
            difficulty_tier=exercise.difficulty_tier,
            question=exercise.question,
            answer=exercise.answer,
            hint=exercise.hint,
            order_index=exercise.order_index
        )
        db.add(new_exercise)
    
    db.commit()
    db.refresh(new_worksheet)
    return new_worksheet


def get_exercise_count(db: Session, worksheet_id: int) -> int:
    """Get the number of exercises in a worksheet."""
    return db.query(func.count(WorksheetExercise.id)).filter(
        WorksheetExercise.worksheet_id == worksheet_id
    ).scalar() or 0
