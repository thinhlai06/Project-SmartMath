"""
AI Router - API endpoints for AI-powered features.
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from typing import Dict, Optional

from app.database import get_db
from app.models.math_topic import MathTopic
from app.services.ai.ollama_service import OllamaService
from app.services.ai.question_generator import QuestionGenerator
from app.schemas.ai import (
    AIStatusResponse,
    CPAGenerationRequest,
    CPAGenerationResponse,
    DifferentiationRequest,
    DifferentiationRequest,
    DifferentiationResponse,
    GradeImageResponse
)
import json

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/status", response_model=AIStatusResponse)
async def get_ai_status():
    """Check AI services status."""
    ollama_status = "running" if OllamaService.is_running() else "stopped"
    
    # Check vector DB
    try:
        import os
        # Assuming DB is at project_root/vector_db/chroma.sqlite3
        # Current file: backend/app/routers/ai.py
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
        "model": "qwen2.5:1.5b",
        "vector_db": db_status
    }


@router.post("/generate-cpa")
async def generate_cpa_worksheet(
    request: CPAGenerationRequest,
    db: Session = Depends(get_db)
) -> Dict:
    """Generate CPA worksheet questions using AI."""
    
    # Validate Ollama is available
    if not OllamaService.is_running():
        # Try to start it
        if not OllamaService.start_server():
            raise HTTPException(
                status_code=503,
                detail="Ollama service not available. Please start Ollama."
            )
    
    # Get topic from DB
    topic = db.query(MathTopic).filter(MathTopic.id == request.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Generate questions
    generator = QuestionGenerator()
    
    try:
        result = generator.generate_cpa_questions(
            topic=topic.topic_name,
            grade=request.grade,
            objective=request.objective,
            counts=request.counts
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.post("/start-ollama")
async def start_ollama():
    """Manually start Ollama server."""
    if OllamaService.is_running():
        return {"status": "already_running"}
    
    success = OllamaService.start_server()
    if success:
        return {"status": "started"}
    else:
        raise HTTPException(status_code=500, detail="Failed to start Ollama")


@router.post("/generate-differentiation", response_model=DifferentiationResponse)
async def generate_differentiation_worksheet(
    request: DifferentiationRequest,
    db: Session = Depends(get_db)
) -> Dict:
    """Generate differentiated worksheet content."""
    
    # Validate Ollama
    if not OllamaService.is_running():
        if not OllamaService.start_server():
            raise HTTPException(status_code=503, detail="Ollama service not available")

    # Get topic
    topic = db.query(MathTopic).filter(MathTopic.id == request.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    generator = QuestionGenerator()
    try:
        result = generator.generate_differentiation_questions(
            topic=topic.topic_name,
            grade=request.grade,
            objective=request.objective,
            tiers=request.tiers
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.post("/grade-image", response_model=GradeImageResponse)
async def grade_image_endpoint(
    file: UploadFile = File(...),
    correct_answers_json: Optional[str] = Form(None)
):
    """
    Grade an uploaded image.
    If correct_answers_json is provided, compares against it.
    If not, uses AI to self-solve.
    """
    try:
        # Parse answers if provided
        correct_answers = None
        if correct_answers_json:
            try:
                correct_answers = json.loads(correct_answers_json)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid JSON for correct_answers")

        # Read file
        image_content = await file.read()
        
        # Grading Service
        from app.services.ai.grading_service import GradingService
        grader = GradingService()
        
        result = grader.grade_submission(image_content, correct_answers)
        
        if "error" in result:
             raise HTTPException(status_code=400, detail=result["error"])
             
        # Map extracted_json to correct key if needed or rely on schema
        return GradeImageResponse(**result)

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Grading Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
