from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ClassCreate(BaseModel):
    """Schema for creating a new class."""
    class_name: str = Field(..., min_length=1, max_length=100)
    grade: int = Field(..., ge=1, le=3, description="Khối lớp (1-3)")
    description: Optional[str] = None


class ClassUpdate(BaseModel):
    """Schema for updating a class."""
    class_name: Optional[str] = Field(None, min_length=1, max_length=100)
    grade: Optional[int] = Field(None, ge=1, le=3)
    description: Optional[str] = None


class ClassResponse(BaseModel):
    """Response schema for a class."""
    id: int
    class_name: str
    grade: int
    class_code: str
    teacher_id: int
    student_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class ClassListResponse(BaseModel):
    """Response schema for class list."""
    id: int
    class_name: str
    grade: int
    class_code: str
    student_count: int = 0

    class Config:
        from_attributes = True
