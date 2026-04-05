"""
AI Router - API endpoints for AI-powered features.
All endpoints require Teacher authentication.
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Dict, Optional, List, Any, cast

from app.application.use_cases.ai.generate_cpa_draft import GenerateCPADraftUseCase
from app.application.use_cases.ai.generate_cpa_bundle import GenerateCPABundleUseCase
from app.application.use_cases.ai.generate_differentiation_draft import (
    GenerateDifferentiationDraftUseCase,
)
from app.application.use_cases.ai.save_cpa_bundles import SaveCPABundlesUseCase
from app.bootstrap.container import (
    get_cpa_bundle_repository,
    get_generate_cpa_bundle_use_case,
    get_generate_cpa_draft_use_case,
    get_generate_differentiation_draft_use_case,
    get_save_cpa_bundles_use_case,
)
from app.database import get_db
from app.core.dependencies import get_current_teacher
from app.models.user import User
from app.services.ai.ollama_service import OllamaService
from app.schemas.ai import (
    AIStatusResponse,
    CPAGenerationRequest,
    DifferentiationRequest,
    DifferentiationResponse,
    GradingReportExportRequest,
    GradeImageResponse,
    ClassAnalyticsResponse,
    ExerciseExplanationRequest,
    ExerciseExplanationResponse,
    CPABundle,
    CPABundleGenerationRequest,
    CPABundleGenerationResponse,
    SaveCPABundlesRequest,
    SaveCPABundlesResponse,
)
from app.infrastructure.db.sqlalchemy.repositories.cpa_bundle_repository import (
    SqlAlchemyCPABundleRepository,
)
from app.services.ai.analytics_service import AnalyticsService
import json
from app.models.worksheet_exercise import WorksheetExercise
from app.models.worksheet import Worksheet
from app.models.math_class import MathClass

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/status", response_model=AIStatusResponse)
async def get_ai_status(teacher: User = Depends(get_current_teacher)):
    """Check AI services status (Teacher only)."""
    ollama_status = "running" if OllamaService.is_running() else "stopped"
    loaded_models = OllamaService.get_loaded_models() if ollama_status == "running" else []
    
    # Check vector DB
    try:
        import os
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
        db_path = os.path.join(project_root, "vector_db", "chroma.sqlite3")
        
        if os.path.exists(db_path) and os.path.getsize(db_path) > 1024:
            db_status = "ready (found DB)"
        else:
            db_status = "not found"
    except Exception as e:
        db_status = f"error: {str(e)[:50]}"
    
    return {
        "ollama": ollama_status,
        "model": ", ".join(loaded_models) if loaded_models else "no models loaded",
        "vector_db": db_status
    }


@router.post("/generate-cpa")
async def generate_cpa_worksheet(
    request: CPAGenerationRequest,
    use_case: GenerateCPADraftUseCase = Depends(get_generate_cpa_draft_use_case),
    teacher: User = Depends(get_current_teacher)
) -> Dict:
    """Generate CPA worksheet questions using AI (Teacher only)."""

    return use_case.execute(
        topic_id=request.topic_id,
        grade=request.grade,
        objective=request.objective,
        counts=request.counts,
    )


@router.post("/generate-cpa-bundle", response_model=CPABundleGenerationResponse)
async def generate_cpa_bundle(
    request: CPABundleGenerationRequest,
    use_case: GenerateCPABundleUseCase = Depends(get_generate_cpa_bundle_use_case),
    teacher: User = Depends(get_current_teacher),
) -> CPABundleGenerationResponse:
    """Generate structured CPA bundles for teacher review."""

    return use_case.execute(
        topic_id=request.topic_id,
        grade=request.grade,
        objective=request.objective,
        bundle_count=request.bundle_count,
    )


@router.post("/worksheets/{worksheet_id}/cpa-bundles", response_model=SaveCPABundlesResponse)
async def save_cpa_bundles(
    worksheet_id: int,
    request: SaveCPABundlesRequest,
    db: Session = Depends(get_db),
    use_case: SaveCPABundlesUseCase = Depends(get_save_cpa_bundles_use_case),
    teacher: User = Depends(get_current_teacher),
) -> SaveCPABundlesResponse:
    """Save teacher-reviewed CPA bundles for a worksheet."""

    worksheet = db.query(Worksheet).filter(Worksheet.id == worksheet_id).first()
    if not worksheet:
        raise HTTPException(status_code=404, detail="Khong tim thay bai tap")

    owned_class = db.query(MathClass).filter(
        MathClass.id == worksheet.class_id,
        MathClass.teacher_id == teacher.id,
    ).first()
    if not owned_class:
        raise HTTPException(status_code=403, detail="Ban khong co quyen luu bundle cho bai tap nay")

    result = use_case.execute(worksheet_id=worksheet_id, bundles=request.bundles)
    return SaveCPABundlesResponse(**result)


@router.get("/worksheets/{worksheet_id}/cpa-bundles", response_model=List[CPABundle])
async def get_cpa_bundles(
    worksheet_id: int,
    db: Session = Depends(get_db),
    repository: SqlAlchemyCPABundleRepository = Depends(get_cpa_bundle_repository),
    teacher: User = Depends(get_current_teacher),
) -> List[CPABundle]:
    worksheet = db.query(Worksheet).filter(Worksheet.id == worksheet_id).first()
    if not worksheet:
        raise HTTPException(status_code=404, detail="Khong tim thay bai tap")

    owned_class = db.query(MathClass).filter(
        MathClass.id == worksheet.class_id,
        MathClass.teacher_id == teacher.id,
    ).first()
    if not owned_class:
        raise HTTPException(status_code=403, detail="Ban khong co quyen xem bundle cua bai tap nay")

    return repository.get_by_worksheet_id(worksheet_id)


@router.post("/generate-differentiation", response_model=DifferentiationResponse)
async def generate_differentiation_worksheet(
    request: DifferentiationRequest,
    use_case: GenerateDifferentiationDraftUseCase = Depends(
        get_generate_differentiation_draft_use_case
    ),
    teacher: User = Depends(get_current_teacher)
) -> Dict:
    """Generate differentiated worksheet content (Teacher only)."""

    return use_case.execute(
        topic_id=request.topic_id,
        grade=request.grade,
        objective=request.objective,
        tiers=request.tiers,
    )


@router.post("/grade-image", response_model=GradeImageResponse)
async def grade_image_endpoint(
    file: UploadFile = File(...),
    correct_answers_json: Optional[str] = Form(None),
    teacher: User = Depends(get_current_teacher)
):
    """
    Grade an uploaded image (Teacher only).
    If correct_answers_json is provided, compares against it.
    If not, uses AI to self-solve.
    """
    try:
        allowed_types = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Chi chap nhan anh PNG/JPEG/WEBP")

        correct_answers: Optional[List[Dict[str, Any]]] = None
        if correct_answers_json:
            try:
                parsed = json.loads(correct_answers_json)
                if isinstance(parsed, list):
                    correct_answers = parsed
                else:
                    raise HTTPException(status_code=400, detail="correct_answers must be a JSON array")
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid JSON for correct_answers")

        image_content = await file.read()
        max_size_bytes = 5 * 1024 * 1024
        if len(image_content) > max_size_bytes:
            raise HTTPException(status_code=400, detail="Kich thuoc anh vuot qua 5MB")
        
        from app.services.ai.grading_service import GradingService
        grader = GradingService()
        
        result = grader.grade_submission(image_content, correct_answers)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
             
        return GradeImageResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Grading Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/{class_id}", response_model=ClassAnalyticsResponse)
async def get_class_analytics(
    class_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """Get error analytics for a specific class (Teacher only)."""
    owned_class = db.query(MathClass).filter(
        MathClass.id == class_id,
        MathClass.teacher_id == teacher.id,
    ).first()
    if not owned_class:
        raise HTTPException(status_code=403, detail="Ban khong co quyen xem thong ke lop nay")

    service = AnalyticsService(db)
    return service.analyze_class_errors(class_id)


@router.post("/exercises/{exercise_id}/explanation", response_model=ExerciseExplanationResponse)
async def generate_exercise_explanation(
    exercise_id: int,
    request: ExerciseExplanationRequest,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    """Generate step-by-step explanation for one exercise (Teacher only)."""
    exercise = db.query(WorksheetExercise).filter(WorksheetExercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi")

    worksheet = db.query(Worksheet).filter(Worksheet.id == exercise.worksheet_id).first()
    if not worksheet:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài tập")

    owned_class = db.query(MathClass).filter(
        MathClass.id == worksheet.class_id,
        MathClass.teacher_id == teacher.id,
    ).first()
    if not owned_class:
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập câu hỏi này")

    style = (request.response_style or "ngan gon").strip()
    student_answer = (request.student_answer or "").strip()
    prompt = f"""Ban la giao vien Toan tieu hoc Viet Nam.
Hay giai thich tung buoc ro rang, de hieu cho hoc sinh lop {worksheet.grade}.

Thong tin cau hoi:
- Cau hoi: {exercise.question}
- Dap an dung: {exercise.answer or 'Khong co dap an mau'}
- Goi y co san: {exercise.hint or 'Khong co'}
- Cau tra loi cua hoc sinh (neu co): {student_answer or 'Khong co'}

Yeu cau dau ra:
- Viet bang tieng Viet de hieu.
- Tach thanh cac buoc danh so 1,2,3...
- Neu co sai sot pho bien, nhac nhe cach tranh sai.
- Do dai muc tieu: {style}.
"""

    try:
        explanation = OllamaService.generate(
            prompt=prompt,
            system="Ban la tro ly su pham, giai thich ngan gon, chinh xac, phu hop hoc sinh tieu hoc.",
            temperature=0.2,
        ).strip()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Khong the tao giai thich AI: {exc}") from exc

    return ExerciseExplanationResponse(exercise_id=exercise.id, explanation=explanation)


# === Grading Report Endpoints ===

@router.post("/grading-report/export")
async def export_grading_report(
    request: GradingReportExportRequest,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """
    Export a grading report as a text file (Teacher only).
    After AI grading, teacher can generate a report to send to parents.
    """
    from app.services.report_service import ReportService
    
    try:
        service = ReportService(db)
        owned_class = db.query(MathClass).filter(
            MathClass.id == request.class_id,
            MathClass.teacher_id == teacher.id,
        ).first()
        if not owned_class:
            raise HTTPException(status_code=403, detail="Ban khong co quyen tao bao cao cho lop nay")

        report = service.generate_report(
            teacher_id=cast(int, teacher.id),
            class_id=request.class_id,
            student_name=request.student_name,
            worksheet_title=request.worksheet_title,
            total_score=request.total_score,
            max_score=request.max_score,
            results=request.results,
            raw_text=request.raw_text,
        )
        
        return {
            "report_id": report.id,
            "file_url": f"/api/ai/grading-report/{report.id}/download",
            "message": "Báo cáo đã được tạo thành công!"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tạo báo cáo thất bại: {str(e)}")


@router.get("/grading-report/{report_id}/download")
async def download_grading_report(
    report_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher),
):
    """Download a generated grading report file."""
    from app.services.report_service import ReportService
    from fastapi.responses import FileResponse
    
    service = ReportService(db)
    report = service.get_report_by_id(report_id)
    
    if not report:
        raise HTTPException(status_code=404, detail="Báo cáo không tồn tại")

    if report.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Ban khong co quyen tai bao cao nay")
    
    import os
    if not os.path.exists(str(report.file_path)):
        raise HTTPException(status_code=404, detail="File báo cáo không tìm thấy")
    
    return FileResponse(
        path=str(report.file_path),
        filename=f"bao_cao_{report.student_name}.txt",
        media_type="text/plain"
    )


@router.get("/grading-reports/{class_id}")
async def list_class_reports(
    class_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(get_current_teacher)
):
    """List all grading reports for a class (Teacher only)."""
    from app.services.report_service import ReportService

    owned_class = db.query(MathClass).filter(
        MathClass.id == class_id,
        MathClass.teacher_id == teacher.id,
    ).first()
    if not owned_class:
        raise HTTPException(status_code=403, detail="Ban khong co quyen xem bao cao lop nay")
    
    service = ReportService(db)
    reports = service.get_reports_for_class(class_id)
    
    return [
        {
            "id": r.id,
            "student_name": r.student_name,
            "worksheet_title": r.worksheet_title,
            "total_score": r.total_score,
            "max_score": r.max_score,
            "created_at": r.created_at.isoformat(),
            "file_url": f"/api/ai/grading-report/{r.id}/download"
        }
        for r in reports
    ]
