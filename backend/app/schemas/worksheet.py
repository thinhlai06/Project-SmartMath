"""Pydantic schemas for Worksheet API."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class WorksheetStatus(str, Enum):
    """Worksheet publication status."""
    DRAFT = "draft"
    PUBLISHED = "published"


class WorksheetType(str, Enum):
    """Type of worksheet."""
    CPA = "cpa"
    DIFFERENTIATION = "differentiation"


# --- Worksheet Schemas ---

class WorksheetCreate(BaseModel):
    """Schema for creating a new worksheet."""
    title: str = Field(..., min_length=1, max_length=255)
    topic_id: Optional[int] = None
    grade: int = Field(..., ge=1, le=3)
    worksheet_type: WorksheetType
    objective: Optional[str] = Field(None, max_length=500)
    difficulty: Optional[str] = Field(None, max_length=50)


class WorksheetUpdate(BaseModel):
    """Schema for updating worksheet details."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    topic_id: Optional[int] = None
    difficulty: Optional[str] = Field(None, max_length=50)
    objective: Optional[str] = Field(None, max_length=500)


class WorksheetResponse(BaseModel):
    """Schema for worksheet response."""
    id: int
    title: str
    class_id: int
    topic_id: Optional[int]
    grade: int
    difficulty: Optional[str]
    status: WorksheetStatus
    worksheet_type: WorksheetType
    objective: Optional[str]
    created_at: datetime
    published_at: Optional[datetime]
    exercise_count: int = 0

    class Config:
        from_attributes = True


class WorksheetListResponse(BaseModel):
    """Schema for worksheet list response (simplified)."""
    id: int
    title: str
    grade: int
    status: WorksheetStatus
    worksheet_type: WorksheetType
    exercise_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class WorksheetDetailResponse(BaseModel):
    """Schema for worksheet detail with exercises."""
    id: int
    title: str
    class_id: int
    topic_id: Optional[int]
    grade: int
    difficulty: Optional[str]
    status: WorksheetStatus
    worksheet_type: WorksheetType
    objective: Optional[str]
    created_at: datetime
    published_at: Optional[datetime]
    exercises: List["ExerciseResponse"] = []

    class Config:
        from_attributes = True


# --- Exercise Schemas ---

class ExerciseType(str, Enum):
    """CPA exercise types."""
    CONCRETE = "concrete"
    PICTORIAL = "pictorial"
    ABSTRACT = "abstract"


class DifficultyTier(str, Enum):
    """Differentiation difficulty tiers."""
    FOUNDATION = "foundation"
    STANDARD = "standard"
    EXTENSION = "extension"
    ADVANCED = "advanced"


class ExerciseCreate(BaseModel):
    """Schema for creating a new exercise."""
    question: str = Field(..., min_length=1)
    answer: Optional[str] = None
    hint: Optional[str] = None
    exercise_type: Optional[ExerciseType] = None  # For CPA worksheets
    difficulty_tier: Optional[DifficultyTier] = None  # For differentiation
    order_index: int = 0


class ExerciseUpdate(BaseModel):
    """Schema for updating exercise details."""
    question: Optional[str] = Field(None, min_length=1)
    answer: Optional[str] = None
    hint: Optional[str] = None
    exercise_type: Optional[ExerciseType] = None
    difficulty_tier: Optional[DifficultyTier] = None
    order_index: Optional[int] = None


class ExerciseResponse(BaseModel):
    """Schema for exercise response."""
    id: int
    worksheet_id: int
    question: str
    answer: Optional[str]
    hint: Optional[str]
    exercise_type: Optional[ExerciseType]
    difficulty_tier: Optional[DifficultyTier]
    order_index: int

    class Config:
        from_attributes = True


class ExerciseReorderRequest(BaseModel):
    """Schema for reordering exercises."""
    exercise_ids: List[int] = Field(..., description="List of exercise IDs in new order")


# Forward reference update
WorksheetDetailResponse.model_rebuild()
