from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class ProgressStatus(str, enum.Enum):
    """Student progress status."""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class StudentProgress(Base):
    """Track student progress on worksheets."""
    
    __tablename__ = "student_progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    worksheet_id = Column(Integer, ForeignKey("worksheets.id"), nullable=False)
    status = Column(SQLEnum(ProgressStatus), default=ProgressStatus.NOT_STARTED)
    correct_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="progress")
    worksheet = relationship("Worksheet", back_populates="progress")

    def __repr__(self):
        return f"<StudentProgress(student_id={self.student_id}, worksheet_id={self.worksheet_id})>"
