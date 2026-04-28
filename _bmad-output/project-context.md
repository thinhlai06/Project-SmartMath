---
project_name: 'Smart-MathAI'
user_name: 'Admin'
date: '2026-04-08'
sections_completed: ['technology_stack', 'critical_rules']
existing_patterns_found: 5
---

# Project Context for AI Agents

*This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss.*

---

## Technology Stack & Versions

- **Frontend:** React 19, TypeScript 5.9, Vite 7, Tailwind v4
- **State Management & UI:** TanStack Query v5 (Server state), Shadcn UI (Radix), Recharts
- **Backend:** Python 3.10+, FastAPI, SQLAlchemy (ORM)
- **Local AI / OCR:** qwen2.5:3b (Text generation + grading text reasoning), gemma4:31b qua Ollama Cloud (Vision/OCR ảnh), vietnamese-sbert (Embeddings)
- **Vector DB:** ChromaDB

---

## Critical Implementation Rules

MỌI AI AGENTS (TỪ PM ĐẾN DEVELOPER) KHI LÀM VIỆC TRÊN DỰ ÁN NÀY LƯU Ý CÁC QUY TẮC SỐNG CÒN SAU:

### 1. Educational Domain Boundaries (Ranh giới nghiệp vụ giáo dục)
- **Giới hạn phạm vi:** Chỉ được phép thiết kế logic và sinh bài tập cho môn **Toán Tiểu học khối Lớp 1 đến Lớp 3** thuộc chương trình Việt Nam.
- **Phương pháp CPA:** Nghiêm cấm giải toán bằng phương pháp Đại Số (x, y). Các bài tập phải tuân thủ luồng phân tích nhận thức CPA (Concrete - Thực tiễn -> Pictorial - Hình ảnh vẽ -> Abstract - Dấu tính).
- **RAG Data Isolation:** Tuyệt đối không query chéo dữ liệu ChromaDB giữa các khối lớp để tránh rủi ro "học vượt".

### 2. No Autonomous AI (Triết lý AI làm trợ lý)
- **Luôn là Bản Nháp:** Tất cả mọi luồng `Generate` sử dụng LLM đều bắt buộc sinh ra dữ liệu ở trạng thái `Draft` hoặc `Pending`.
- **Human-in-the-loop:** Tuyệt đối phải có chốt chặn phê duyệt bởi Giáo viên (Teacher) thông qua Endpoint như `PublishWorksheetUseCase` (hoặc tương đương) trước khi bản ghi đó được chính thức hóa xuống DB hiển thị cho Học sinh/Phụ huynh.

### 3. Role-based Constraints (Phân quyền bảo mật)
- **Teacher vs Parent:** Giao diện và API phải kiểm tra kỹ Role. Phụ huynh (Parent) nghiêm cấm không được gọi các API liên quan đến thao tác AI Sinh đề hay AI Chấm ảnh.
- **Cookie-session:** Tất cả request Frontend gọi về Backend phải được truyền session thông qua HTTP-only cookie (`withCredentials: true`), tuyệt đối KHÔNG code thêm logic dựa vào AccessToken giấu trong LocalStorage.

### 4. Hexagonal Architecture (Kiến trúc phân lớp)
- **Luồng dữ liệu bắt buộc:** `Interfaces (Routers/Views)` -> `Application (Use cases)` -> `Domain (Entities/Repositories)`.
- **Zero-DB in Routers:** Tuyệt đối cấm viết câu lệnh truy vấn SQLAlchemy ORM hay gọi trực tiếp database ở bên trong lớp Routers.
- **AI Port/Adapter:** Lớp gọi các mô hình Ollama hay LLM nội bộ phải được wrap trong `adapters` nằm ở tầng `infrastructure`, không được nằm vương vãi trong Domain. 

### 5. Frontend Scalability
- Không lạm dụng nhét hết logic vào một Page duy nhất. Phải chia để trị theo dạng `features/`, `entities/`, `widgets/`.
- Quản lý Server State bắt buộc phải sử dụng `TanStack Query`, hạn chế tối đa sử dụng `useState/useEffect` dư thừa để fetch data thuần.
