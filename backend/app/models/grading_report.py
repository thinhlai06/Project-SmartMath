"""
GradingReport model - stores metadata for exported error analysis reports.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class GradingReport(Base):
    """Stores metadata for error analysis PDF reports."""
    __tablename__ = "grading_reports"

    id = Column(Integer, primary_key=True, index=True)
    
    # Who created / for whom
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("math_classes.id"), nullable=False)
    student_name = Column(String(100), nullable=False)
    
    # Grading results
    worksheet_title = Column(String(255), default="Bài kiểm tra")
    total_score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    
    # Report file
    file_path = Column(String(500), nullable=False)  # Path to generated PDF
    
    # Details (stored as JSON string)
    results_json = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    teacher = relationship("User", foreign_keys=[teacher_id])
    math_class = relationship("MathClass", foreign_keys=[class_id])
