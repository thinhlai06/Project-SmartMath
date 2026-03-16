from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException

from app.models.worksheet_exercise import WorksheetExercise
from app.models.worksheet import Worksheet
from app.models.math_class import MathClass
from app.models.user import User


def get_exercises_by_worksheet(db: Session, worksheet_id: int) -> List[WorksheetExercise]:
    """Get all exercises for a worksheet."""
    return db.query(WorksheetExercise).filter(
        WorksheetExercise.worksheet_id == worksheet_id
    ).order_by(WorksheetExercise.order_index).all()


def create_exercise(
    db: Session, 
    worksheet_id: int, 
    question: str, 
    answer: Optional[str] = None, 
    hint: Optional[str] = None,
    exercise_type: str = "short_answer",
    difficulty_tier: str = "standard",
    order_index: int = 0
) -> WorksheetExercise:
    """Create a new exercise."""
    # Get max order_index if 0
    if order_index <= 0:
        order_index = db.query(WorksheetExercise).filter(
            WorksheetExercise.worksheet_id == worksheet_id
        ).count()
        
    exercise = WorksheetExercise(
        worksheet_id=worksheet_id,
        question=question,
        answer=answer,
        hint=hint,
        exercise_type=exercise_type,
        difficulty_tier=difficulty_tier,
        order_index=order_index
    )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


def update_exercise(db: Session, exercise: WorksheetExercise, update_data: dict) -> WorksheetExercise:
    """Update an exercise."""
    for key, value in update_data.items():
        setattr(exercise, key, value)
    db.commit()
    db.refresh(exercise)
    return exercise


def delete_exercise(db: Session, exercise: WorksheetExercise) -> None:
    """Delete an exercise."""
    db.delete(exercise)
    db.commit()


def reorder_exercises(db: Session, worksheet_id: int, exercise_ids: List[int]) -> List[WorksheetExercise]:
    """Reorder multiple exercises."""
    for index, exercise_id in enumerate(exercise_ids):
        exercise = db.query(WorksheetExercise).filter(
            WorksheetExercise.id == exercise_id,
            WorksheetExercise.worksheet_id == worksheet_id
        ).first()
        if exercise:
            exercise.order_index = index
    db.commit()
    return get_exercises_by_worksheet(db, worksheet_id)
