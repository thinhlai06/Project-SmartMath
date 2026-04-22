from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_teacher
from app.models.user import User
from app.models.math_class import MathClass
from app.schemas.gradebook import GradebookResponse, GradeEntryCreate, GradeEntryResponse
from app.services.gradebook_service import GradebookService

router = APIRouter(prefix="/gradebook", tags=["Gradebook"])

def verify_class_ownership(db: Session, class_id: int, teacher_id: int):
    math_class = db.query(MathClass).filter(MathClass.id == class_id).first()
    if not math_class or math_class.teacher_id != teacher_id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập lớp học này")

@router.get("/classes/{class_id}", response_model=GradebookResponse)
async def get_gradebook(
    class_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    verify_class_ownership(db, class_id, int(teacher.id))
    service = GradebookService(db)
    return service.get_class_gradebook(class_id)

@router.post("/entries", response_model=GradeEntryResponse)
async def save_grade_entry(
    data: GradeEntryCreate,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    # Verify the student belongs to one of the teacher's classes
    from app.models.student import Student
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")
    verify_class_ownership(db, student.class_id, int(teacher.id))

    service = GradebookService(db)
    return service.upsert_grade(data.student_id, data.worksheet_id, data.score)

@router.get("/classes/{class_id}/export")
async def export_gradebook_excel(
    class_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    verify_class_ownership(db, class_id, int(teacher.id))
    service = GradebookService(db)
    return service.export_excel(class_id)
