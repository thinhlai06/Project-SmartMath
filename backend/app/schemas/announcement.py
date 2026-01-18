from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AnnouncementBase(BaseModel):
    title: str
    content: str


class AnnouncementCreate(AnnouncementBase):
    class_id: int


class AnnouncementResponse(AnnouncementBase):
    id: int
    class_id: int
    created_at: datetime

    class Config:
        from_attributes = True
