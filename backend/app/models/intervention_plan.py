from __future__ import annotations

from datetime import datetime
import enum

from sqlalchemy import Column, DateTime, Enum as SQLEnum, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class InterventionPlanStatus(str, enum.Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    COMPLETED = "completed"


class InterventionPlan(Base):
    __tablename__ = "intervention_plans"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("math_classes.id", ondelete="CASCADE"), nullable=False, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    week_number = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    status = Column(
        SQLEnum(InterventionPlanStatus, values_callable=lambda x: [e.value for e in x]),
        default=InterventionPlanStatus.DRAFT,
        nullable=False,
    )
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)

    __table_args__ = (
        UniqueConstraint("class_id", "week_number", "year", name="uq_intervention_plan_class_week_year"),
    )

    groups = relationship("InterventionGroup", back_populates="plan", cascade="all, delete-orphan")
    math_class = relationship("MathClass")
    teacher = relationship("User")


class InterventionGroup(Base):
    __tablename__ = "intervention_groups"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("intervention_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    group_name = Column(String(200), nullable=False)
    error_type = Column(String(120), nullable=False)
    evidence = Column(JSON, nullable=True)
    suggested_activity = Column(Text, nullable=False)
    suggested_exercises = Column(JSON, nullable=False)
    duration_minutes = Column(Integer, nullable=False, default=15)
    student_ids = Column(JSON, nullable=False, default=list)
    worksheet_id = Column(Integer, ForeignKey("worksheets.id", ondelete="SET NULL"), nullable=True)
    order_index = Column(Integer, nullable=False, default=0)
    notes = Column(Text, nullable=True)

    plan = relationship("InterventionPlan", back_populates="groups")
    worksheet = relationship("Worksheet")
