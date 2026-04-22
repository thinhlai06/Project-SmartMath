from pydantic import BaseModel, field_validator
from typing import List, Dict

class GradeEntryCreate(BaseModel):
    student_id: int
    worksheet_id: int
    score: float

    @field_validator('score')
    @classmethod
    def score_must_be_valid(cls, v: float) -> float:
        if v < 0 or v > 10:
            raise ValueError('Điểm phải trong khoảng [0, 10]')
        return round(v, 2)

class GradeEntryUpdate(BaseModel):
    score: float

class GradeEntryResponse(BaseModel):
    id: int
    student_id: int
    worksheet_id: int
    score: float

    class Config:
        from_attributes = True

class StudentGradeRecord(BaseModel):
    student_id: int
    full_name: str
    grades: Dict[int, float]  # worksheet_id -> score

class GradebookResponse(BaseModel):
    class_id: int
    worksheets: List[Dict[str, str | int]]  # id, title
    student_records: List[StudentGradeRecord]
