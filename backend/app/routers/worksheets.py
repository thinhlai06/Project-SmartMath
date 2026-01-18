"""FastAPI router for Worksheet Management."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.utils.dependencies import get_current_teacher
from app.models.user import User
from app.models.math_class import MathClass
from app.models.worksheet import Worksheet
from app.schemas.worksheet import (
    WorksheetCreate,
    WorksheetUpdate,
    WorksheetResponse,
    WorksheetListResponse,
    WorksheetDetailResponse
)
from app.services import worksheet_service

router = APIRouter(prefix="/worksheets", tags=["Worksheets"])
class_router = APIRouter(prefix="/classes", tags=["Worksheets"])


def verify_class_ownership(db: Session, class_id: int, teacher: User) -> MathClass:
    """Verify the teacher owns the class."""
    math_class = db.query(MathClass).filter(
        MathClass.id == class_id,
        MathClass.teacher_id == teacher.id
    ).first()
    if not math_class:
        raise HTTPException(status_code=404, detail="Lớp học không tồn tại hoặc bạn không có quyền truy cập")
    return math_class


def verify_worksheet_ownership(db: Session, worksheet_id: int, teacher: User) -> Worksheet:
    """Verify the teacher owns the worksheet through the class."""
    worksheet = worksheet_service.get_worksheet_by_id(db, worksheet_id)
    if not worksheet:
        raise HTTPException(status_code=404, detail="Bài tập không tồn tại")
    
    # Check class ownership
    math_class = db.query(MathClass).filter(
        MathClass.id == worksheet.class_id,
        MathClass.teacher_id == teacher.id
    ).first()
    if not math_class:
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập bài tập này")
    
    return worksheet


# --- Class-scoped endpoints ---

@class_router.get("/{class_id}/worksheets", response_model=List[WorksheetListResponse])
async def list_worksheets(
    class_id: int,
    status: Optional[str] = Query(None, description="Lọc theo trạng thái (draft/published)"),
    worksheet_type: Optional[str] = Query(None, description="Lọc theo loại (cpa/differentiation)"),
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """
    Lấy danh sách bài tập của một lớp.
    
    - **status**: Lọc theo trạng thái (draft, published)
    - **worksheet_type**: Lọc theo loại (cpa, differentiation)
    """
    verify_class_ownership(db, class_id, teacher)
    worksheets = worksheet_service.get_worksheets_by_class(db, class_id, status, worksheet_type)
    
    # Add exercise count to each worksheet
    result = []
    for ws in worksheets:
        ws_dict = {
            "id": ws.id,
            "title": ws.title,
            "grade": ws.grade,
            "status": ws.status,
            "worksheet_type": ws.worksheet_type,
            "exercise_count": len(ws.exercises),
            "created_at": ws.created_at
        }
        result.append(WorksheetListResponse(**ws_dict))
    
    return result


@class_router.post("/{class_id}/worksheets", response_model=WorksheetResponse, status_code=201)
async def create_worksheet(
    class_id: int,
    data: WorksheetCreate,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """Tạo bài tập mới cho lớp."""
    verify_class_ownership(db, class_id, teacher)
    worksheet = worksheet_service.create_worksheet(db, class_id, data)
    
    return WorksheetResponse(
        id=worksheet.id,
        title=worksheet.title,
        class_id=worksheet.class_id,
        topic_id=worksheet.topic_id,
        grade=worksheet.grade,
        difficulty=worksheet.difficulty,
        status=worksheet.status,
        worksheet_type=worksheet.worksheet_type,
        objective=worksheet.objective,
        created_at=worksheet.created_at,
        published_at=worksheet.published_at,
        exercise_count=0
    )


# --- Worksheet-scoped endpoints ---

@router.get("/{worksheet_id}", response_model=WorksheetDetailResponse)
async def get_worksheet(
    worksheet_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """Lấy chi tiết bài tập kèm danh sách câu hỏi."""
    worksheet = verify_worksheet_ownership(db, worksheet_id, teacher)
    
    return WorksheetDetailResponse(
        id=worksheet.id,
        title=worksheet.title,
        class_id=worksheet.class_id,
        topic_id=worksheet.topic_id,
        grade=worksheet.grade,
        difficulty=worksheet.difficulty,
        status=worksheet.status,
        worksheet_type=worksheet.worksheet_type,
        objective=worksheet.objective,
        created_at=worksheet.created_at,
        published_at=worksheet.published_at,
        exercises=worksheet.exercises
    )


@router.put("/{worksheet_id}", response_model=WorksheetResponse)
async def update_worksheet(
    worksheet_id: int,
    data: WorksheetUpdate,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """Cập nhật thông tin bài tập."""
    worksheet = verify_worksheet_ownership(db, worksheet_id, teacher)
    
    if worksheet.status.value == "published":
        raise HTTPException(
            status_code=400,
            detail="Không thể chỉnh sửa bài tập đã xuất bản. Hãy hủy xuất bản trước."
        )
    
    updated = worksheet_service.update_worksheet(db, worksheet, data)
    
    return WorksheetResponse(
        id=updated.id,
        title=updated.title,
        class_id=updated.class_id,
        topic_id=updated.topic_id,
        grade=updated.grade,
        difficulty=updated.difficulty,
        status=updated.status,
        worksheet_type=updated.worksheet_type,
        objective=updated.objective,
        created_at=updated.created_at,
        published_at=updated.published_at,
        exercise_count=len(updated.exercises)
    )


@router.delete("/{worksheet_id}", status_code=204)
async def delete_worksheet(
    worksheet_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """Xóa bài tập và tất cả câu hỏi."""
    worksheet = verify_worksheet_ownership(db, worksheet_id, teacher)
    worksheet_service.delete_worksheet(db, worksheet)
    return None


@router.post("/{worksheet_id}/publish", response_model=WorksheetResponse)
async def publish_worksheet(
    worksheet_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """Xuất bản bài tập để phụ huynh có thể xem."""
    worksheet = verify_worksheet_ownership(db, worksheet_id, teacher)
    
    if len(worksheet.exercises) == 0:
        raise HTTPException(
            status_code=400,
            detail="Không thể xuất bản bài tập không có câu hỏi nào."
        )
    
    published = worksheet_service.publish_worksheet(db, worksheet)
    
    return WorksheetResponse(
        id=published.id,
        title=published.title,
        class_id=published.class_id,
        topic_id=published.topic_id,
        grade=published.grade,
        difficulty=published.difficulty,
        status=published.status,
        worksheet_type=published.worksheet_type,
        objective=published.objective,
        created_at=published.created_at,
        published_at=published.published_at,
        exercise_count=len(published.exercises)
    )


@router.post("/{worksheet_id}/unpublish", response_model=WorksheetResponse)
async def unpublish_worksheet(
    worksheet_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """Hủy xuất bản bài tập, đưa về trạng thái nháp."""
    worksheet = verify_worksheet_ownership(db, worksheet_id, teacher)
    unpublished = worksheet_service.unpublish_worksheet(db, worksheet)
    
    return WorksheetResponse(
        id=unpublished.id,
        title=unpublished.title,
        class_id=unpublished.class_id,
        topic_id=unpublished.topic_id,
        grade=unpublished.grade,
        difficulty=unpublished.difficulty,
        status=unpublished.status,
        worksheet_type=unpublished.worksheet_type,
        objective=unpublished.objective,
        created_at=unpublished.created_at,
        published_at=unpublished.published_at,
        exercise_count=len(unpublished.exercises)
    )


@router.post("/{worksheet_id}/duplicate", response_model=WorksheetResponse, status_code=201)
async def duplicate_worksheet(
    worksheet_id: int,
    new_title: Optional[str] = Query(None, description="Tiêu đề mới cho bản sao"),
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """Nhân bản bài tập và tất cả câu hỏi."""
    worksheet = verify_worksheet_ownership(db, worksheet_id, teacher)
    duplicated = worksheet_service.duplicate_worksheet(db, worksheet, new_title)
    
    return WorksheetResponse(
        id=duplicated.id,
        title=duplicated.title,
        class_id=duplicated.class_id,
        topic_id=duplicated.topic_id,
        grade=duplicated.grade,
        difficulty=duplicated.difficulty,
        status=duplicated.status,
        worksheet_type=duplicated.worksheet_type,
        objective=duplicated.objective,
        created_at=duplicated.created_at,
        published_at=duplicated.published_at,
        exercise_count=len(duplicated.exercises)
    )
