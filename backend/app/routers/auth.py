from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.schemas.user import UserResponse, UserUpdateMeRequest
from app.services.auth_service import (
    create_user,
    authenticate_user,
    create_access_token,
    get_user_by_email,
    verify_password,
    get_password_hash,
)
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.config import settings


router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Đăng ký tài khoản mới.
    
    - **email**: Email đăng nhập (duy nhất)
    - **password**: Mật khẩu (tối thiểu 6 ký tự)
    - **full_name**: Họ và tên
    - **role**: Vai trò (teacher hoặc parent)
    """
    # Check if email already exists
    existing_user = get_user_by_email(db, request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã được sử dụng"
        )
    
    # Validate password length
    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu phải có ít nhất 6 ký tự"
        )
    
    # Create user
    user = create_user(
        db=db,
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        role=request.role
    )
    
    return user


@router.post("/login", response_model=Token)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Đăng nhập và nhận JWT token.
    
    Sử dụng email làm username.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create JWT token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user.id),  # Jose requires 'sub' to be a string
            "email": user.email,
            "role": user.role.value
        },
        expires_delta=access_token_expires
    )

    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=f"Bearer {access_token}",
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        domain=settings.AUTH_COOKIE_DOMAIN,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response):
    """Dang xuat va xoa auth cookie."""
    response.delete_cookie(
        key=settings.AUTH_COOKIE_NAME,
        domain=settings.AUTH_COOKIE_DOMAIN,
        path="/",
    )
    return None


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Lấy thông tin người dùng hiện tại.
    
    Yêu cầu JWT token trong header Authorization.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    request: UserUpdateMeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cập nhật thông tin cá nhân (họ tên, mật khẩu) của người dùng hiện tại."""
    has_name_change = request.full_name is not None and request.full_name.strip() != ""
    has_password_change = request.new_password is not None and request.new_password.strip() != ""

    if not has_name_change and not has_password_change:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không có thông tin nào để cập nhật"
        )

    if has_name_change:
        current_user.full_name = request.full_name.strip()

    if has_password_change:
        if not request.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới"
            )

        if len(request.new_password.strip()) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mật khẩu mới phải có ít nhất 6 ký tự"
            )

        if not verify_password(request.current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mật khẩu hiện tại không đúng"
            )

        current_user.password_hash = get_password_hash(request.new_password.strip())

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
