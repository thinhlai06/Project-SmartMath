"""SQLAlchemy model for persisted CPA bundles."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class CPABundleRecord(Base):
    __tablename__ = "cpa_bundles"

    id = Column(Integer, primary_key=True, index=True)
    worksheet_id = Column(Integer, ForeignKey("worksheets.id"), nullable=False, index=True)
    math_core_json = Column(Text, nullable=False)
    concrete_spec_json = Column(Text, nullable=False)
    pictorial_spec_json = Column(Text, nullable=False)
    abstract_spec_json = Column(Text, nullable=False)
    validation_status = Column(String(20), nullable=False, default="pending")
    validator_messages_json = Column(Text, nullable=True)
    teacher_approved = Column(Boolean, nullable=False, default=False)
    order_index = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    worksheet = relationship("Worksheet", back_populates="cpa_bundles")

    def __repr__(self) -> str:
        return f"<CPABundleRecord(id={self.id}, worksheet_id={self.worksheet_id}, status='{self.validation_status}')>"