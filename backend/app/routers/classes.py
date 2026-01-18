from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.math_class import ClassCreate, ClassUpdate, ClassResponse, ClassListResponse
from app.services.class_service import (
    get_teacher_classes,
    get_class_by_id,
    create_class,
    update_class,
    delete_class,
    regenerate_class_code,
    get_class_student_count,
)
from app.utils.dependencies import get_current_user, get_current_teacher
from app.models.user import User


router = APIRouter()


@router.get("", response_model=List[ClassListResponse])
async def list_classes(
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách lớp học của giáo viên.
    
    Yêu cầu quyền: Teacher
    """
    classes = get_teacher_classes(db, current_user.id)
    result = []
    for c in classes:
        result.append(ClassListResponse(
            id=c.id,
            class_name=c.class_name,
            grade=c.grade,
            class_code=c.class_code,
            student_count=get_class_student_count(db, c.id)
        ))
    return result


@router.post("", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
async def create_new_class(
    class_data: ClassCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Tạo lớp học mới.
    
    - **class_name**: Tên lớp (ví dụ: "3A", "2B")
    - **grade**: Khối lớp (1, 2, hoặc 3)
    
    Mã lớp sẽ được tự động tạo.
    """
    db_class = create_class(
        db=db,
        class_name=class_data.class_name,
        grade=class_data.grade,
        teacher_id=current_user.id
    )
    return ClassResponse(
        id=db_class.id,
        class_name=db_class.class_name,
        grade=db_class.grade,
        class_code=db_class.class_code,
        teacher_id=db_class.teacher_id,
        student_count=0,
        created_at=db_class.created_at
    )


@router.get("/{class_id}", response_model=ClassResponse)
async def get_class(
    class_id: int,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Lấy thông tin chi tiết một lớp học.
    """
    db_class = get_class_by_id(db, class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lớp học"
        )
    
    # Verify ownership
    if db_class.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập lớp học này"
        )
    
    return ClassResponse(
        id=db_class.id,
        class_name=db_class.class_name,
        grade=db_class.grade,
        class_code=db_class.class_code,
        teacher_id=db_class.teacher_id,
        student_count=get_class_student_count(db, db_class.id),
        created_at=db_class.created_at
    )


@router.put("/{class_id}", response_model=ClassResponse)
async def update_existing_class(
    class_id: int,
    class_data: ClassUpdate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Cập nhật thông tin lớp học.
    """
    db_class = get_class_by_id(db, class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lớp học"
        )
    
    if db_class.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền chỉnh sửa lớp học này"
        )
    
    updated_class = update_class(
        db=db,
        db_class=db_class,
        class_name=class_data.class_name,
        grade=class_data.grade
    )
    
    return ClassResponse(
        id=updated_class.id,
        class_name=updated_class.class_name,
        grade=updated_class.grade,
        class_code=updated_class.class_code,
        teacher_id=updated_class.teacher_id,
        student_count=get_class_student_count(db, updated_class.id),
        created_at=updated_class.created_at
    )


@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_class(
    class_id: int,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Xóa lớp học và tất cả dữ liệu liên quan.
    
    ⚠️ Hành động này không thể hoàn tác!
    """
    db_class = get_class_by_id(db, class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lớp học"
        )
    
    if db_class.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xóa lớp học này"
        )
    
    delete_class(db, db_class)
    return None


@router.post("/{class_id}/regenerate-code", response_model=ClassResponse)
async def regenerate_code(
    class_id: int,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Tạo mã lớp mới.
    
    Mã cũ sẽ không còn hiệu lực.
    """
    db_class = get_class_by_id(db, class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lớp học"
        )
    
    if db_class.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền thay đổi mã lớp này"
        )
    
    updated_class = regenerate_class_code(db, db_class)
    
    return ClassResponse(
        id=updated_class.id,
        class_name=updated_class.class_name,
        grade=updated_class.grade,
        class_code=updated_class.class_code,
        teacher_id=updated_class.teacher_id,
        student_count=get_class_student_count(db, updated_class.id),
        created_at=updated_class.created_at
    )
