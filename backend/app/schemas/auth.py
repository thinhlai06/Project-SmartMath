from pydantic import BaseModel, EmailStr
from typing import Optional
from app.schemas.user import UserRole


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """Registration request schema."""
    email: EmailStr
    password: str
    full_name: str
    role: UserRole


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data."""
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None
