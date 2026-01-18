"""
AI Router - API endpoints for AI-powered features.
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict

from app.database import get_db
from app.models.math_topic import MathTopic
from app.services.ai.ollama_service import OllamaService
from app.services.ai.question_generator import QuestionGenerator
from app.schemas.ai import (
    CPAGenerationRequest,
    CPAGenerationResponse,
    AIStatusResponse,
    QuestionItem
)

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/status", response_model=AIStatusResponse)
async def get_ai_status():
    """Check AI services status."""
    ollama_status = "running" if OllamaService.is_running() else "stopped"
    
    # Check vector DB
    try:
        from app.services.ai.rag_service import RAGService
        rag = RAGService()
        db_status = "ready"
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
