from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import datetime, date
import enum


class StudentTier(str, enum.Enum):
    """Student tier for differentiation."""
    FOUNDATION = "foundation"
    STANDARD = "standard"
    EXTENSION = "extension"
    ADVANCED = "advanced"


class StudentBase(BaseModel):
    """Shared student fields."""
    full_name: str = Field(..., min_length=1, max_length=255)
    tier: Optional[StudentTier] = StudentTier.STANDARD
    dob: Optional[date] = None
    parent_name: Optional[str] = Field(None, max_length=100)
    parent_phone: Optional[str] = Field(None, max_length=20)


class StudentCreate(BaseModel):
    """Schema for creating a student."""
    full_name: str = Field(..., min_length=1, max_length=255)
    tier: StudentTier
    dob: Optional[date] = None
    parent_name: Optional[str] = Field(None, max_length=100)
    parent_phone: Optional[str] = Field(None, max_length=20)


class StudentUpdate(BaseModel):
    """Schema for updating a student."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    tier: Optional[StudentTier] = None
    dob: Optional[date] = None
    parent_name: Optional[str] = Field(None, max_length=100)
    parent_phone: Optional[str] = Field(None, max_length=20)


class StudentResponse(StudentBase):
    """Response schema for a student."""
    id: int
    class_id: int
    created_at: datetime
    avg_score: Optional[float] = None

    class Config:
        from_attributes = True


class StudentProgressCreate(BaseModel):
    """Schema for creating or updating a student's worksheet progress."""
    worksheet_id: int = Field(..., gt=0)
    correct_count: int = Field(..., ge=0)
    total_count: int = Field(..., gt=0)
    score: Optional[float] = Field(None, ge=0, le=10)
    details: Optional[dict] = None

    @model_validator(mode="after")
    def validate_counts(self):
        if self.correct_count > self.total_count:
            raise ValueError("Số câu đúng không thể lớn hơn tổng số câu")
        return self


class StudentProgressResponse(BaseModel):
    """Response schema for student progress records."""
    id: int
    student_id: int
    worksheet_id: int
    status: str
    correct_count: int
    total_count: int
    completed_at: Optional[datetime]
    details: Optional[dict]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
