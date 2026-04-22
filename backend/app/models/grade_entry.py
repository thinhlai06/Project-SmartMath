from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class GradeEntry(Base):
    """Lưu điểm số chính thức của học sinh trong sổ điểm."""

    __tablename__ = "grade_entries"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    worksheet_id = Column(Integer, ForeignKey("worksheets.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("student_id", "worksheet_id", name="uq_grade_student_worksheet"),
    )

    # passive_deletes=True: let the DB handle CASCADE instead of ORM loading all rows
    student = relationship("Student", backref="grades", passive_deletes=True)
    worksheet = relationship("Worksheet", backref="grade_entries_rel", passive_deletes=True)

    def __repr__(self):
        return f"<GradeEntry(student_id={self.student_id}, worksheet_id={self.worksheet_id}, score={self.score})>"

