from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User roles."""
    TEACHER = "teacher"
    PARENT = "parent"


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: str
    role: UserRole


class UserCreate(UserBase):
    """Schema for creating a user."""
    password: str


class UserResponse(UserBase):
    """Schema for user response."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    """User with password hash (internal use only)."""
    password_hash: str
