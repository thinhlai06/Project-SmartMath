from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.database import engine, Base
from app.models.student_progress import StudentProgress
from app.models.student_analytics import StudentAnalytics
from app.models.grading_report import GradingReport
from app.models.cpa_bundle import CPABundleRecord
from app.models.chat_message import ChatMessage
from app.routers import auth, topics, classes, students, worksheets, exercises, pdf, announcements, dashboard, activities, upload, gradebook
from app.core.exceptions import SmartMathException, smartmath_exception_handler
from fastapi.staticfiles import StaticFiles
import os


logger = logging.getLogger(__name__)


# Create all tables
Base.metadata.create_all(bind=engine)

# FastAPI application
app = FastAPI(
    title="Smart-MathAI API",
    description="""
    API cho hệ thống giáo dục Toán tiểu học Việt Nam (Lớp 1-3).
    
    ## Tính năng
    
    * **Authentication** - Đăng ký và đăng nhập cho Giáo viên
    * **Topics** - Danh sách chủ đề toán theo SGK
    * **Classes** - Quản lý lớp học
    * **Students** - Quản lý học sinh
    * **Worksheets** - Tạo và quản lý bài tập CPA/Differentiation
    * **Exercises** - Quản lý câu hỏi trong bài tập
    * **PDF Export** - Xuất bài tập dưới dạng PDF
    * **AI** - Sinh câu hỏi tự động với AI
    
    ## Vai trò người dùng
    
    * **Teacher (Giáo viên)** - Tạo lớp, tạo bài tập, chấm bài, phân tích kết quả
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev port
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom exception handler
app.add_exception_handler(SmartMathException, smartmath_exception_handler)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(topics.router, prefix="/api/topics", tags=["Math Topics"])
app.include_router(classes.router, prefix="/api/classes", tags=["Classes"])
app.include_router(students.router, prefix="/api", tags=["Students"])
app.include_router(worksheets.router, prefix="/api", tags=["Worksheets"])
app.include_router(worksheets.class_router, prefix="/api", tags=["Worksheets"])
app.include_router(exercises.router, prefix="/api", tags=["Exercises"])
app.include_router(pdf.router, prefix="/api", tags=["PDF Export"])
app.include_router(announcements.router, prefix="/api", tags=["Announcements"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(activities.router, prefix="/api", tags=["Activities"])
app.include_router(upload.router, prefix="/api")
app.include_router(gradebook.router, prefix="/api")

os.makedirs("uploads/images", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# AI routers are optional so core MVP (auth/classes/worksheets) still runs without AI dependencies.
try:
    from app.routers import ai
    app.include_router(ai.router, prefix="/api", tags=["AI"])
except ModuleNotFoundError as exc:
    logger.warning("Skipping legacy AI router due to missing dependency: %s", exc)

# Chat router is optional — runs without google-generativeai
try:
    from app.routers import chat
    app.include_router(chat.router, prefix="/api", tags=["Chatbot"])
except ModuleNotFoundError as exc:
    logger.warning("Skipping chat router due to missing dependency: %s", exc)

# Clean architecture rollout endpoints (v1)
try:
    from app.interfaces.api.v1.routers import worksheet_router as worksheet_router_v1
    app.include_router(worksheet_router_v1.router, prefix="/api/v1", tags=["Worksheets v1"])
except ModuleNotFoundError as exc:
    logger.warning("Skipping v1 worksheet router due to missing dependency: %s", exc)

try:
    from app.interfaces.api.v1.routers import ai_router as ai_router_v1
    app.include_router(ai_router_v1.router, prefix="/api/v1", tags=["AI v1"])
except ModuleNotFoundError as exc:
    logger.warning("Skipping v1 AI router due to missing dependency: %s", exc)


@app.get("/", tags=["Root"])
async def root():
    """Health check endpoint."""
    return {
        "message": "Smart-MathAI API is running!",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", tags=["Root"])
async def health_check():
    """Health check for monitoring."""
    return {"status": "healthy"}
