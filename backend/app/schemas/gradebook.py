from pydantic import BaseModel, field_validator, model_validator
from typing import List, Dict

class GradeEntryCreate(BaseModel):
    student_id: int
    worksheet_id: int
    score: float
    correct_count: int | None = None
    total_count: int | None = None
    details: dict | None = None

    @field_validator('score')
    @classmethod
    def score_must_be_valid(cls, v: float) -> float:
        if v < 0 or v > 10:
            raise ValueError('Điểm phải trong khoảng [0, 10]')
        return round(v, 2)

    @model_validator(mode='after')
    def validate_progress_payload(self):
        has_correct = self.correct_count is not None
        has_total = self.total_count is not None

        if has_correct != has_total:
            raise ValueError('Cần truyền đủ correct_count và total_count nếu muốn lưu tiến độ')

        if has_correct and has_total:
            if self.correct_count < 0 or self.total_count <= 0:
                raise ValueError('correct_count phải >= 0 và total_count phải > 0')
            if self.correct_count > self.total_count:
                raise ValueError('correct_count không thể lớn hơn total_count')

        return self

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
