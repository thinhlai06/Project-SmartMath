from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class StudentAnalytics(Base):
    """
    Persist error tags captured from AI grading for class analytics.

    metadata payload can include:
    - question_id
    - error_detail
    - student_answer
    - correct_answer
    - question_text
    """

    __tablename__ = "student_analytics"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("math_classes.id"), nullable=False, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True, index=True)
    worksheet_id = Column(Integer, ForeignKey("worksheets.id"), nullable=True, index=True)

    error_type = Column(String(120), nullable=False)
    count = Column(Integer, nullable=False, default=1)
    source = Column(String(50), nullable=False, default="ai_grading")
    ocr_confidence = Column(Float, nullable=True)
    payload = Column("metadata", JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    math_class = relationship("MathClass")
    teacher = relationship("User")
    student = relationship("Student")
    worksheet = relationship("Worksheet")
