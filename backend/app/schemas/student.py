from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import enum


class StudentTier(str, enum.Enum):
    """Student tier for differentiation."""
    FOUNDATION = "foundation"
    STANDARD = "standard"
    EXTENSION = "extension"
    ADVANCED = "advanced"


class StudentCreate(BaseModel):
    """Schema for creating a student."""
    full_name: str = Field(..., min_length=1, max_length=255)
    tier: Optional[StudentTier] = StudentTier.STANDARD


class StudentUpdate(BaseModel):
    """Schema for updating a student."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    tier: Optional[StudentTier] = None


class StudentResponse(BaseModel):
    """Response schema for a student."""
    id: int
    full_name: str
    tier: Optional[str] = "standard"
    class_id: int
    created_at: datetime

    class Config:
        from_attributes = True
