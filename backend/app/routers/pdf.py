"""FastAPI router for PDF Export."""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.utils.dependencies import get_current_teacher
from app.models.user import User
from app.models.math_class import MathClass
from app.models.worksheet import Worksheet
from app.services.pdf_service import (
    generate_worksheet_pdf,
    PdfExportSettings,
    PaperSize,
    Orientation,
    FontSize,
    Spacing
)

router = APIRouter(prefix="/worksheets", tags=["PDF Export"])


def verify_worksheet_access(db: Session, worksheet_id: int, teacher: User) -> Worksheet:
    """Verify the teacher has access to the worksheet."""
    worksheet = db.query(Worksheet).filter(Worksheet.id == worksheet_id).first()
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


@router.get("/{worksheet_id}/pdf")
async def export_worksheet_pdf(
    worksheet_id: int,
    paper_size: PaperSize = Query(PaperSize.A4, description="Khổ giấy"),
    orientation: Orientation = Query(Orientation.PORTRAIT, description="Chiều giấy"),
    with_answers: bool = Query(False, description="Kèm đáp án"),
    font_size: FontSize = Query(FontSize.MEDIUM, description="Cỡ chữ"),
    spacing: Spacing = Query(Spacing.NORMAL, description="Khoảng cách"),
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """
    Xuất bài tập dưới dạng PDF.
    
    Các tùy chọn:
    - **paper_size**: A4, A5, Letter
    - **orientation**: P (dọc), L (ngang)
    - **with_answers**: True để kèm đáp án
    - **font_size**: small, medium, large
    - **spacing**: compact, normal, spacious
    """
    worksheet = verify_worksheet_access(db, worksheet_id, teacher)
    
    # Get class info
    math_class = db.query(MathClass).filter(MathClass.id == worksheet.class_id).first()
    
    # Create settings
    settings = PdfExportSettings(
        paper_size=paper_size,
        orientation=orientation,
        with_answers=with_answers,
        font_size=font_size,
        spacing=spacing
    )
    
    # Generate PDF
    try:
        pdf_buffer = generate_worksheet_pdf(
            worksheet=worksheet,
            exercises=worksheet.exercises,
            class_name=math_class.class_name if math_class else "Unknown",
            settings=settings
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tạo PDF: {str(e)}")
    
    # Create safe filename
    safe_title = worksheet.title.replace(" ", "_")[:50]
    filename = f"baitap_{safe_title}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
