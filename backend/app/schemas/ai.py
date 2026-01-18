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


class DifferentiationRequest(BaseModel):
    topic_id: int
    grade: int
    objective: str
    tiers: Optional[List[str]] = ["foundation", "standard", "extension", "advanced"]


class DifferentiationResponse(BaseModel):
    content: Dict[str, List[QuestionItem]]
    rag_sources: Optional[List[str]] = None


class QuestionGradeResult(BaseModel):
    question_id: str
    student_answer: str
    correct_answer: str
    is_correct: bool
    score: int
    max_score: int
    feedback: Optional[str] = None
    reasoning: Optional[str] = None
    question_type: Optional[str] = None


class GradeImageResponse(BaseModel):
    total_score: int
    max_score: int
    results: List[QuestionGradeResult]
    raw_text: str
    extracted_json: Optional[Dict[str, str]] = None
