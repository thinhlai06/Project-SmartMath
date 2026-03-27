"""Pydantic schemas for Parent API."""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class JoinClassRequest(BaseModel):
    class_code: str
    student_name: str


class JoinClassResponse(BaseModel):
    message: str
    class_name: str
    student_name: str


class ParentClassInfo(BaseModel):
    id: int
    class_id: int
    class_name: str
    grade: int
    student_name: str
    teacher_name: str
    joined_at: datetime

    class Config:
        from_attributes = True


class TopicProgress(BaseModel):
    topic: str
    status: str  # 'mastered', 'practicing', 'started'
    percent: int


class TodayAssignment(BaseModel):
    id: int
    title: str
    topic: str
    status: str  # 'completed', 'in_progress', 'pending'
    correct: int
    total: int


class ParentDashboardResponse(BaseModel):
    student_name: str
    class_name: str
    teacher_name: str
    stats: dict  # completed, study_time, avg_score, accuracy
    topic_progress: List[TopicProgress]
    teacher_comment: str
    today_assignments: List[TodayAssignment]


class WorksheetForParent(BaseModel):
    id: int
    title: str
    topic: str
    grade: int
    exercise_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class MarkWorksheetCompletedResponse(BaseModel):
    worksheet_id: int
    status: str
    message: str
