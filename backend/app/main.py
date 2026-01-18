from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, topics, classes, students, worksheets, exercises


# Create all tables
Base.metadata.create_all(bind=engine)

# FastAPI application
app = FastAPI(
    title="Smart-MathAI API",
    description="""
    API cho hệ thống giáo dục Toán tiểu học Việt Nam (Lớp 1-3).
    
    ## Tính năng
    
    * **Authentication** - Đăng ký và đăng nhập cho Giáo viên/Phụ huynh
    * **Topics** - Danh sách chủ đề toán theo SGK
    * **Classes** - Quản lý lớp học
    * **Students** - Quản lý học sinh
    * **Worksheets** - Tạo và quản lý bài tập CPA/Differentiation
    * **Exercises** - Quản lý câu hỏi trong bài tập
    * **PDF Export** - Xuất PDF với QR code (Coming soon)
    
    ## Vai trò người dùng
    
    * **Teacher (Giáo viên)** - Tạo lớp, tạo bài tập, chấm bài
    * **Parent (Phụ huynh)** - Xem bài tập, theo dõi tiến độ con
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

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(topics.router, prefix="/api/topics", tags=["Math Topics"])
app.include_router(classes.router, prefix="/api/classes", tags=["Classes"])
app.include_router(students.router, prefix="/api", tags=["Students"])
app.include_router(worksheets.router, prefix="/api", tags=["Worksheets"])
app.include_router(worksheets.class_router, prefix="/api", tags=["Worksheets"])
app.include_router(exercises.router, prefix="/api", tags=["Exercises"])


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
