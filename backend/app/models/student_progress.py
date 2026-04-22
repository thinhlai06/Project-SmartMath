from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class StudentProgress(Base):
    __tablename__ = "student_progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    worksheet_id = Column(Integer, ForeignKey("worksheets.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, default="not_started")  # not_started, completed, graded
    correct_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Use back_populates to allow Student.progress cascade to function correctly
    student = relationship("Student", back_populates="progress")
    worksheet = relationship("Worksheet", back_populates="student_progress")
