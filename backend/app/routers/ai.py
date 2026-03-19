"""
AI Router - API endpoints for AI-powered features.
All endpoints require Teacher authentication.
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Dict, Optional, List, Any, cast

from app.application.use_cases.ai.generate_cpa_draft import GenerateCPADraftUseCase
from app.application.use_cases.ai.generate_differentiation_draft import (
    GenerateDifferentiationDraftUseCase,
)
from app.bootstrap.container import (
    get_generate_cpa_draft_use_case,
    get_generate_differentiation_draft_use_case,
)
from app.database import get_db
from app.core.dependencies import get_current_teacher
from app.models.user import User
from app.services.ai.lmstudio_service import LMStudioService
from app.schemas.ai import (
    AIStatusResponse,
    CPAGenerationRequest,
    DifferentiationRequest,
    DifferentiationResponse,
    GradeImageResponse,
    ClassAnalyticsResponse
)
from app.services.ai.analytics_service import AnalyticsService
import json

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/status", response_model=AIStatusResponse)
async def get_ai_status(teacher: User = Depends(get_current_teacher)):
    """Check AI services status (Teacher only)."""
    lmstudio_status = "running" if LMStudioService.is_running() else "stopped"
    loaded_models = LMStudioService.get_loaded_models() if lmstudio_status == "running" else []
    
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
        "lmstudio": lmstudio_status,
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
    service = AnalyticsService(db)
    return service.analyze_class_errors(class_id)


# === Grading Report Endpoints ===

@router.post("/grading-report/export")
async def export_grading_report(
    request: dict,
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
        report = service.generate_report(
            teacher_id=cast(int, teacher.id),
            class_id=request.get("class_id", 0),
            student_name=request.get("student_name", "Học sinh"),
            worksheet_title=request.get("worksheet_title", "Bài kiểm tra"),
            total_score=request.get("total_score", 0),
            max_score=request.get("max_score", 0),
            results=request.get("results", []),
            raw_text=request.get("raw_text", "")
        )
        
        return {
            "report_id": report.id,
            "file_url": f"/api/ai/grading-report/{report.id}/download",
            "message": "Báo cáo đã được tạo thành công!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tạo báo cáo thất bại: {str(e)}")


@router.get("/grading-report/{report_id}/download")
async def download_grading_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    """Download a generated grading report file."""
    from app.services.report_service import ReportService
    from fastapi.responses import FileResponse
    
    service = ReportService(db)
    report = service.get_report_by_id(report_id)
    
    if not report:
        raise HTTPException(status_code=404, detail="Báo cáo không tồn tại")
    
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
