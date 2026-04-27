"""
AI Schemas - Pydantic models for AI API requests/responses.
"""
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Literal, Optional

from app.schemas.cpa_bundle import (
    CPABundle,
    CPABundleGenerationRequest,
    CPABundleGenerationResponse,
    SaveCPABundlesRequest,
    SaveCPABundlesResponse,
    ValidationIssue,
    ValidationResult,
)


class QuestionItem(BaseModel):
    question: str
    answer: str
    hint: Optional[str] = None


class CPAGenerationRequest(BaseModel):
    topic_id: int
    grade: Literal[1, 2, 3]
    objective: str
    counts: Optional[Dict[str, int]] = None


class CPAGenerationResponse(BaseModel):
    concrete: List[QuestionItem]
    pictorial: List[QuestionItem]
    abstract: List[QuestionItem]
    rag_sources: Optional[List[str]] = None
    generation_mode: Optional[str] = None
    template_seed_count: Optional[Dict[str, int]] = None
    retrieval_filter_applied: Optional[Dict[str, Any]] = None


class AIStatusResponse(BaseModel):
    ollama: str
    model: str
    vector_db: str


class DifferentiationRequest(BaseModel):
    topic_id: int
    grade: Literal[1, 2, 3]
    objective: str
    tiers: List[Literal["foundation", "standard", "extension", "advanced"]] = Field(
        default_factory=lambda: ["foundation", "standard", "extension", "advanced"]
    )


class GradingReportExportRequest(BaseModel):
    class_id: int
    student_name: str = "Hoc sinh"
    worksheet_title: str = "Bai kiem tra"
    total_score: float = 0
    max_score: float = 0
    results: List[Dict[str, Any]] = Field(default_factory=list)
    raw_text: str = ""


class DifferentiationResponse(BaseModel):
    content: Dict[str, List[QuestionItem]]
    rag_sources: Optional[List[str]] = None
    generation_mode: Optional[str] = None
    template_seed_count: Optional[int] = None
    retrieval_filter_applied: Optional[Dict[str, Any]] = None
    validation_summary: Optional[Dict[str, Any]] = None


class OCRTokenConfidence(BaseModel):
    text: str
    confidence: float


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
    error_type: Optional[str] = None
    error_detail: Optional[str] = None
    ocr_confidence: Optional[float] = None
    low_confidence_tokens: Optional[List[OCRTokenConfidence]] = None


class GradeImageResponse(BaseModel):
    total_score: int
    max_score: int
    results: List[QuestionGradeResult]
    raw_text: str
    extracted_json: Optional[Dict[str, str]] = None
    ocr_tokens: Optional[List[OCRTokenConfidence]] = None
    ocr_avg_confidence: Optional[float] = None


class ExerciseExplanationRequest(BaseModel):
    student_answer: Optional[str] = None
    response_style: Optional[str] = "ngan gon"


class ExerciseExplanationResponse(BaseModel):
    exercise_id: int
    explanation: str


class WeakTopic(BaseModel):
    topic: str
    accuracy: float
    total_questions: int

class StudentPerformance(BaseModel):
    student: str
    average_score: float
    assignment_count: int

class MistakePattern(BaseModel):
    type: str
    count: int

class ClassAnalyticsResponse(BaseModel):
    weak_topics: List[WeakTopic]
    student_performance: List[StudentPerformance]
    common_mistakes: List[MistakePattern]


class AnalyticsTagItem(BaseModel):
    error_type: str = Field(..., min_length=1, max_length=120)
    count: int = Field(default=1, ge=1, le=100)
    question_id: Optional[str] = None
    ocr_confidence: Optional[float] = Field(default=None, ge=0, le=100)
    error_detail: Optional[str] = None
    student_answer: Optional[str] = None
    correct_answer: Optional[str] = None
    question_text: Optional[str] = None


class AnalyticsSubmitRequest(BaseModel):
    class_id: int
    student_id: Optional[int] = None
    worksheet_id: Optional[int] = None
    source: Literal["ai_grading", "teacher_review"] = "ai_grading"
    error_tags: List[AnalyticsTagItem] = Field(default_factory=list, min_length=1)


class AnalyticsSubmitResponse(BaseModel):
    message: str
    records_created: int


class StudentErrorDetail(BaseModel):
    id: int
    student_id: Optional[int] = None
    student_name: Optional[str] = None
    error_type: str
    error_detail: Optional[str] = None
    question_text: Optional[str] = None
    student_answer: Optional[str] = None
    correct_answer: Optional[str] = None
    created_at: str


class StudentErrorListResponse(BaseModel):
    errors: List[StudentErrorDetail]
    total_count: int


class UpdateErrorRequest(BaseModel):
    error_type: Optional[str] = Field(default=None, min_length=1, max_length=120)
    error_detail: Optional[str] = None
