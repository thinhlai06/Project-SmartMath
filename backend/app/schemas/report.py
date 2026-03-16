"""Pydantic schemas for Grading Report API."""
from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime


class GradingReportCreate(BaseModel):
    """Request to create/export a grading report."""
    student_name: str
    class_id: int
    worksheet_title: str = "Bài kiểm tra"
    total_score: float
    max_score: float
    results: List[dict]  # The detailed grading results
    raw_text: str = ""


class GradingReportResponse(BaseModel):
    """Response after creating a report."""
    id: int
    student_name: str
    worksheet_title: str
    total_score: float
    max_score: float
    file_url: str
    created_at: datetime

    class Config:
        from_attributes = True


class GradingReportListItem(BaseModel):
    """Simplified report item for parent listing."""
    id: int
    student_name: str
    worksheet_title: str
    total_score: float
    max_score: float
    created_at: datetime
    file_url: str

    class Config:
        from_attributes = True
