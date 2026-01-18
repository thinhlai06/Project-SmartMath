"""
AI Schemas - Pydantic models for AI API requests/responses.
"""
from pydantic import BaseModel
from typing import List, Dict, Optional


class QuestionItem(BaseModel):
    question: str
    answer: str
    hint: Optional[str] = None


class CPAGenerationRequest(BaseModel):
    topic_id: int
    grade: int
    objective: str
    counts: Optional[Dict[str, int]] = None


class CPAGenerationResponse(BaseModel):
    concrete: List[QuestionItem]
    pictorial: List[QuestionItem]
    abstract: List[QuestionItem]
    rag_sources: Optional[List[str]] = None


class AIStatusResponse(BaseModel):
    ollama: str
    model: str
    vector_db: str
