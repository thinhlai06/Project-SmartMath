# Smart-MathAI 🧮🤖

> Hệ thống hỗ trợ dạy và học Toán tiểu học (Lớp 1-3) theo chương trình GDPT mới của Việt Nam, tích hợp AI hỗ trợ giáo viên.

![Smart-MathAI Banner](https://placehold.co/1200x400?text=Smart-MathAI)

## 📖 Giới thiệu

**Smart-MathAI** là nền tảng giáo dục số giúp:
- **Giáo viên:** Tạo bài tập phân hóa tự động, chấm điểm nhanh chóng qua OCR, và phân tích lỗi sai của học sinh.
- **Học sinh:** Tiếp cận bài toán trực quan theo ngữ cảnh thực tế và bài tập phân hóa năng lực.

Dự án tuân thủ nghiêm ngặt khung chương trình SGK/SGV của Bộ Giáo dục & Đào tạo Việt Nam.

---

## 🚀 Tính năng nổi bật

### 1. Core Features (Cốt lõi)
- **Quản lý lớp học:** Tạo lớp, thêm học sinh, quản lý danh sách.
- **Quản lý bài tập (Worksheets):** Tạo, chỉnh sửa, nhân bản và xuất PDF.
- **Phân quyền:** Hệ thống tài khoản dành cho Giáo viên.

### 2. AI Features (Trí tuệ nhân tạo)
- **RAG Pipeline (Curriculum Grounding):** Sử dụng `vietnamese-sbert` để tra cứu kiến thức chuẩn từ SGK, đảm bảo nội dung sinh ra chính xác.
- **Tạo câu hỏi thông minh:**
    - **Differentiation:** Sinh bài tập phân hóa 4 cấp độ (Cơ bản -> Nâng cao).
- **Chấm điểm tự động (AI Grading):**
    - **OCR:** Nhận diện chữ viết tay tiếng Việt qua Cloud OCR model `gemma4:31b`.
    - **Auto-Grade:** Chấm điểm, nhận xét chi tiết và giải thích lỗi sai.
- **Phân tích lỗi (Analytics):** Thống kê các chủ đề yếu và lỗi sai phổ biến của cả lớp.

---

## 🛠️ Tech Stack

- **Backend:** Python (FastAPI), SQLAlchemy (SQLite), LangChain.
- **Frontend:** React (Vite), Tailwind CSS, Shadcn/UI, Recharts.
- **AI/ML:**
    - Question Gen (Cloud): `gemma3:12b` qua Ollama Cloud.
    - Grading/Explanation (Local): `qwen2.5:3b` qua Ollama local.
    - OCR: `gemma4:31b` qua Ollama Cloud.
    - Embeddings: `keepitreal/vietnamese-sbert`.
    - Vector DB: ChromaDB.

---

## ⚙️ Cài đặt & Hướng dẫn chạy

### 1. Prerequisites (Yêu cầu)
- **Python**: 3.10+
- **Node.js**: 18+
- **Ollama**
- **Visual C++ Build Tools** (để cài đặt các thư viện Python trên Windows).

### 2. Setup AI Models
Sử dụng **Ollama** để chạy các model AI cục bộ:
1. Tải và cài đặt [Ollama](https://ollama.com/download).
2. Pull model local (dùng cho grading/explanation):
    - `ollama pull qwen2.5:3b`
3. Cấu hình `OLLAMA_CLOUD_API_KEY` trong `backend/.env` để dùng Cloud:
    - `gemma3:12b` — sinh câu hỏi phân hóa
    - `gemma4:31b` — OCR ảnh bài làm
4. Cấu hình Gemini trong `backend/.env`:
    - `GEMINI_API_KEY` — API key Gemini
    - `GEMINI_MODEL=gemini-2.5-flash` — chatbot
5. Khởi chạy daemon:
    - `ollama serve`

### 3. Setup Backend
```powershell
# Di chuyển vào thư mục backend
cd backend

# Cài đặt thư viện (khuyên dùng môi trường ảo venv)
pip install -r requirements.txt

# Cài đặt thư viện bổ sung cho OCR và RAG (nếu thiếu)
pip install paddlepaddle paddleocr chromadb langchain-community sentence-transformers

# (Lần đầu chạy) Nạp dữ liệu SGK vào Vector DB
cd ..
python scripts/ingest.py
```

### 4. Setup Frontend
```powershell
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install
```

---

## ▶️ Chạy ứng dụng

Bạn cần mở 3 terminal riêng biệt để chạy toàn bộ hệ thống:

**Terminal 1: Ollama Daemon**
```powershell
ollama serve
```
*(Dam bao da pull model `qwen2.5:3b` (grading local) va da cau hinh `OLLAMA_CLOUD_API_KEY` cho question gen + OCR)*

**Terminal 2: Backend API**
```powershell
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*API Docs sẽ có tại: http://localhost:8000/docs*

**Terminal 3: Frontend UI**
```powershell
cd frontend
npm run dev
```
*Truy cập Web App tại: http://localhost:5173*

---

## 📂 Cấu trúc dự án

```
c:\project smartstudy\
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── models/         # Database Models
│   │   ├── routers/        # API Endpoints
│   │   ├── services/       # Business Logic & AI Services
│   │   │   └── ai/         # (Ollama, OCR, RAG, Analytics)
│   │   └── main.py         # App Entry Point
│   └── data_raw/           # PDF Textbooks for RAG
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Page Views
│   │   └── services/       # API Clients
├── scripts/                # Utility Scripts (Ingest, Test, Debug)
├── vector_db/              # ChromaDB Storage
└── README.md               # Project Documentation
```

---

## 🔑 Tài khoản Demo

- **Giáo viên:** `teacher@demo.com` / `123456`

---

## 📝 Ghi chú quan trọng

1. **OCR Data:** Hệ thống OCR dùng Cloud model `gemma4:31b`, cần cấu hình `OLLAMA_CLOUD_API_KEY` hợp lệ.
2. **Performance:** Tốc độ sinh câu hỏi và chấm điểm phụ thuộc vào cấu hình máy (RAM/GPU) và chính sách `OLLAMA_KEEP_ALIVE`.
3. **Restart:** Nếu gặp lỗi "Internal Server Error" sau khi cập nhật code, hãy thử khởi động lại Backend server.

---

**Developed for Smart-MathAI Project.**
