from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.auth_service import decode_access_token, get_user_by_id
from app.models.user import User, UserRole


# OAuth2 scheme for JWT token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin đăng nhập",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = decode_access_token(token)
    if token_data is None:
        raise credentials_exception
    
    user = get_user_by_id(db, token_data.user_id)
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_teacher(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require current user to be a teacher."""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ giáo viên mới có quyền truy cập"
        )
    return current_user


async def get_current_parent(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require current user to be a parent."""
    if current_user.role != UserRole.PARENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ phụ huynh mới có quyền truy cập"
        )
    return current_user
