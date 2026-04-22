import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from uuid import uuid4
from app.core.dependencies import get_current_teacher
from app.models.user import User

router = APIRouter(prefix="/upload", tags=["Upload"])

UPLOAD_DIR = "uploads/images"
MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/image", response_model=dict)
async def upload_image(
    file: UploadFile = File(...),
    teacher: User = Depends(get_current_teacher)
):
    """
    Upload an image for exercises (Teacher only).
    """
    allowed_types = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Chi chap nhan anh PNG/JPEG/WEBP")

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Kich thuoc anh toi da 5MB")

    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".png"
    unique_filename = f"{uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(content)

    return {"image_url": f"/uploads/images/{unique_filename}"}
