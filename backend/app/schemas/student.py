from pydantic import BaseModel, Field
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


class StudentCreate(StudentBase):
    """Schema for creating a student."""
    pass


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
