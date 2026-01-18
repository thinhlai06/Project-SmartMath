"""FastAPI router for Exercise Management."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.utils.dependencies import get_current_teacher
from app.models.user import User
from app.models.math_class import MathClass
from app.models.worksheet import Worksheet
from app.models.worksheet_exercise import WorksheetExercise
from app.schemas.worksheet import (
    ExerciseCreate,
    ExerciseUpdate,
    ExerciseResponse,
    ExerciseReorderRequest
)

router = APIRouter(tags=["Exercises"])


def verify_worksheet_ownership(db: Session, worksheet_id: int, teacher: User) -> Worksheet:
    """Verify the teacher owns the worksheet through the class."""
    worksheet = db.query(Worksheet).filter(Worksheet.id == worksheet_id).first()
    if not worksheet:
        raise HTTPException(status_code=404, detail="Bài tập không tồn tại")
    
    math_class = db.query(MathClass).filter(
        MathClass.id == worksheet.class_id,
        MathClass.teacher_id == teacher.id
    ).first()
    if not math_class:
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập bài tập này")
    
    return worksheet


def verify_exercise_ownership(db: Session, exercise_id: int, teacher: User) -> WorksheetExercise:
    """Verify the teacher owns the exercise through worksheet and class."""
    exercise = db.query(WorksheetExercise).filter(WorksheetExercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Câu hỏi không tồn tại")
    
    # Verify worksheet ownership
    verify_worksheet_ownership(db, exercise.worksheet_id, teacher)
    
    return exercise


# --- Worksheet-scoped exercise endpoints ---

@router.get("/worksheets/{worksheet_id}/exercises", response_model=List[ExerciseResponse])
async def list_exercises(
    worksheet_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """Lấy danh sách câu hỏi trong bài tập."""
    worksheet = verify_worksheet_ownership(db, worksheet_id, teacher)
    exercises = db.query(WorksheetExercise).filter(
        WorksheetExercise.worksheet_id == worksheet_id
    ).order_by(WorksheetExercise.order_index).all()
    
    return exercises


@router.post("/worksheets/{worksheet_id}/exercises", response_model=ExerciseResponse, status_code=201)
async def create_exercise(
    worksheet_id: int,
    data: ExerciseCreate,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """Thêm câu hỏi mới vào bài tập."""
    worksheet = verify_worksheet_ownership(db, worksheet_id, teacher)
    
    if worksheet.status.value == "published":
        raise HTTPException(
            status_code=400,
            detail="Không thể thêm câu hỏi vào bài tập đã xuất bản. Hãy hủy xuất bản trước."
        )
    
    # Get max order_index
    max_order = db.query(WorksheetExercise).filter(
        WorksheetExercise.worksheet_id == worksheet_id
    ).count()
    
    exercise = WorksheetExercise(
        worksheet_id=worksheet_id,
        question=data.question,
        answer=data.answer,
        hint=data.hint,
        exercise_type=data.exercise_type,
        difficulty_tier=data.difficulty_tier,
        order_index=data.order_index if data.order_index > 0 else max_order
    )
    
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    
    return exercise


# --- Exercise-scoped endpoints ---

@router.get("/exercises/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """Lấy chi tiết một câu hỏi."""
    exercise = verify_exercise_ownership(db, exercise_id, teacher)
    return exercise


@router.put("/exercises/{exercise_id}", response_model=ExerciseResponse)
async def update_exercise(
    exercise_id: int,
    data: ExerciseUpdate,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """Cập nhật câu hỏi."""
    exercise = verify_exercise_ownership(db, exercise_id, teacher)
    
    # Check if worksheet is published
    worksheet = db.query(Worksheet).filter(Worksheet.id == exercise.worksheet_id).first()
    if worksheet and worksheet.status.value == "published":
        raise HTTPException(
            status_code=400,
            detail="Không thể chỉnh sửa câu hỏi trong bài tập đã xuất bản."
        )
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(exercise, key, value)
    
    db.commit()
    db.refresh(exercise)
    
    return exercise


@router.delete("/exercises/{exercise_id}", status_code=204)
async def delete_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """Xóa câu hỏi."""
    exercise = verify_exercise_ownership(db, exercise_id, teacher)
    
    # Check if worksheet is published
    worksheet = db.query(Worksheet).filter(Worksheet.id == exercise.worksheet_id).first()
    if worksheet and worksheet.status.value == "published":
        raise HTTPException(
            status_code=400,
            detail="Không thể xóa câu hỏi trong bài tập đã xuất bản."
        )
    
    db.delete(exercise)
    db.commit()
    
    return None


@router.put("/worksheets/{worksheet_id}/exercises/reorder", response_model=List[ExerciseResponse])
async def reorder_exercises(
    worksheet_id: int,
    data: ExerciseReorderRequest,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """Sắp xếp lại thứ tự các câu hỏi."""
    worksheet = verify_worksheet_ownership(db, worksheet_id, teacher)
    
    if worksheet.status.value == "published":
        raise HTTPException(
            status_code=400,
            detail="Không thể sắp xếp lại câu hỏi trong bài tập đã xuất bản."
        )
    
    # Update order_index for each exercise
    for index, exercise_id in enumerate(data.exercise_ids):
        exercise = db.query(WorksheetExercise).filter(
            WorksheetExercise.id == exercise_id,
            WorksheetExercise.worksheet_id == worksheet_id
        ).first()
        if exercise:
            exercise.order_index = index
    
    db.commit()
    
    # Return updated list
    exercises = db.query(WorksheetExercise).filter(
        WorksheetExercise.worksheet_id == worksheet_id
    ).order_by(WorksheetExercise.order_index).all()
    
    return exercises
