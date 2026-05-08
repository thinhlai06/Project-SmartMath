# SMART-MATHAI — WIKI TOÀN DIỆN

> **Tài liệu tổng hợp kiến trúc, tính năng, công nghệ và định hướng phát triển của hệ thống Smart-MathAI.**
>
> Phiên bản: 1.1 — Ngày cập nhật: 08/05/2026
>
> Mục đích: Tài liệu tham khảo chính thức phục vụ viết báo cáo sản phẩm, giới thiệu dự án, và định hướng phát triển.

---

## MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Sứ mệnh và nguyên tắc cốt lõi](#2-sứ-mệnh-và-nguyên-tắc-cốt-lõi)
3. [Đối tượng người dùng](#3-đối-tượng-người-dùng)
4. [Kiến trúc hệ thống](#4-kiến-trúc-hệ-thống)
5. [Công nghệ sử dụng](#5-công-nghệ-sử-dụng)
6. [Cơ sở dữ liệu](#6-cơ-sở-dữ-liệu)
7. [Hệ thống AI](#7-hệ-thống-ai)
8. [Tính năng hiện tại](#8-tính-năng-hiện-tại)
9. [Bảo mật và phân quyền](#9-bảo-mật-và-phân-quyền)
10. [Quy trình phát triển](#10-quy-trình-phát-triển)
11. [Tính năng tương lai](#11-tính-năng-tương-lai)
12. [Lộ trình phát triển](#12-lộ-trình-phát-triển)
13. [Phụ lục](#13-phụ-lục)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Giới thiệu

**Smart-MathAI** là nền tảng giáo dục số (Educational SaaS) hỗ trợ dạy và học môn Toán tiểu học dành riêng cho khối Lớp 1, Lớp 2 và Lớp 3 tại Việt Nam. Hệ thống được thiết kế dành riêng cho **Giáo viên** (không có học sinh hay phụ huynh đăng nhập trực tiếp), với mục tiêu tự động hóa các tác vụ tốn thời gian như soạn bài tập phân hóa, chấm điểm, phân tích lỗi sai và tư vấn sư phạm.

Dự án tuân thủ nghiêm ngặt **Chương trình Giáo dục phổ thông (GDPT) 2018** của Bộ Giáo dục & Đào tạo Việt Nam, đảm bảo mọi nội dung sinh ra đều bám sát khung chương trình SGK/SGV chính thống.

### 1.2 Tên dự án

- **Tên chính thức:** Smart-MathAI
- **Tên mô tả:** Hệ thống trợ lý giáo dục Toán tiểu học thông minh
- **Tên tiếng Anh:** Smart-MathAI — AI-Powered Vietnamese Primary Math Platform

### 1.3 Mục đích sản phẩm

Sản phẩm được xây dựng nhằm giải quyết ba bài toán cốt lõi trong giáo dục tiểu học:

1. **Bài toán thời gian:** Giáo viên tiểu học thường dành 15-20 giờ mỗi tuần cho việc soạn bài tập, chấm bài và viết nhận xét. Smart-MathAI tự động hóa các tác vụ này, giúp tiết kiệm đến 80% thời gian biên soạn và chấm điểm.

2. **Bài toán chất lượng:** Việc tạo bài tập phân hóa theo năng lực từng học sinh là nhiệm vụ khó khăn, đòi hỏi chuyên môn sâu. Hệ thống sử dụng AI để sinh bài tập theo 4 cấp độ năng lực, đảm bảo mọi học sinh đều có tài liệu phù hợp.

3. **Bài toán đồng hành:** Giáo viên cần công cụ để theo dõi tiến bộ của từng học sinh theo thời gian và nhận gợi ý can thiệp kịp thời. Hệ thống cung cấp phân tích lỗi sai, dashboard trực quan và chatbot tư vấn sư phạm.

### 1.4 Phạm vi sản phẩm

| Thành phần | Phạm vi |
|---|---|
| **Môn học** | Chỉ Toán học |
| **Khối lớp** | Lớp 1, Lớp 2, Lớp 3 |
| **Người dùng** | Chỉ Giáo viên (Teacher-only) |
| **Ngôn ngữ** | Tiếng Việt (UI + AI output) |
| **Chương trình** | GDPT 2018 — Bộ GD&ĐT Việt Nam |
| **Mô hình AI** | Ollama (local + cloud) + Gemini API |

### 1.5 Trạng thái hiện tại (Tháng 5/2026)

Hệ thống đã vượt qua giai đoạn MVP (Minimum Viable Product) và đang trong quá trình chuyển đổi kiến trúc sang **Clean Architecture** toàn diện. Các tính năng cốt lõi đã hoạt động ổn định:

- ✅ Quản lý lớp học và học sinh (CRUD đầy đủ)
- ✅ Tạo bài tập phân hóa 4 cấp độ với AI
- ✅ Chấm điểm tự động qua ảnh chụp (OCR + AI Grading)
- ✅ Phân tích lỗi sai theo lớp và học sinh
- ✅ Sổ điểm (Gradebook) với xuất Excel
- ✅ Smart Student Progress Portfolio (hồ sơ tiến bộ thông minh)
- ✅ Chatbot trợ lý giáo viên (Gemini)
- ✅ Xuất PDF bài tập
- ✅ Xác thực qua HTTP-only Cookie

---

## 2. SỨ MỆNH VÀ NGUYÊN TẮC CỐT LÕI

### 2.1 Sứ mệnh

> **"Trao quyền cho giáo viên tiểu học Việt Nam bằng công nghệ AI, giúp họ tập trung vào điều quan trọng nhất: đồng hành và phát triển từng học sinh."**

### 2.2 Nguyên tắc bất di bất dịch (Non-Negotiable Boundaries)

Đây là các ràng buộc kiến trúc và sản phẩm mà mọi thành phần của hệ thống phải tuân thủ:

#### Nguyên tắc 1: AI chỉ là trợ lý, không tự quyết định

- **Tất cả output từ AI đều ở trạng thái `Draft` (Nháp) hoặc `Pending` (Chờ duyệt).**
- **Bắt buộc có Human-in-the-loop:** Giáo viên phải xem xét, chỉnh sửa và phê duyệt trước khi bất kỳ nội dung AI nào được chính thức hóa.
- **Không có auto-publish:** Không một bài tập, điểm số hay nhận xét nào được tự động phát hành mà không qua tay giáo viên.

#### Nguyên tắc 2: Giới hạn phạm vi nghiêm ngặt

- **Chỉ Toán học:** Không mở rộng sang Tiếng Việt, Tiếng Anh hay môn học khác.
- **Chỉ Lớp 1-3:** Tuyệt đối không sinh nội dung cho Lớp 4 trở lên.
- **Ràng buộc sư phạm tiểu học:** Nghiêm cấm giải toán bằng phương pháp đại số (x, y). Nội dung phải phù hợp tư duy trực quan của trẻ 6-9 tuổi.

#### Nguyên tắc 3: Teacher-only

- **Chỉ có 1 role duy nhất:** `teacher`.
- **Không có học sinh đăng nhập.**
- **Không có phụ huynh đăng nhập.**
- Mọi API và route đều yêu cầu xác thực giáo viên.

#### Nguyên tắc 4: Cô lập dữ liệu theo khối lớp

- **RAG Data Isolation:** Tuyệt đối không query chéo dữ liệu ChromaDB giữa các khối lớp.
- **Topic Lock:** Khi chọn lớp, chỉ hiển thị chủ đề thuộc đúng khối lớp đó.
- Tránh rủi ro "học vượt" — sinh nội dung vượt quá khả năng nhận thức của lứa tuổi.

#### Nguyên tắc 5: Mô hình AI được phê duyệt

- Chỉ sử dụng các model đã được kiểm định và phê duyệt:
  - `gemma3:12b` — sinh câu hỏi phân hóa (Ollama Cloud)
  - `qwen2.5:3b` — chấm bài text + giải thích (local)
  - `gemma4:31b` — OCR nhận diện chữ viết tay (Ollama Cloud)
  - `gemini-2.5-flash` — chatbot (Gemini API)
  - `vietnamese-sbert` — embeddings cho RAG
- Không tự ý thêm model mới.

---

## 3. ĐỐI TƯỢNG NGƯỜI DÙNG

### 3.1 Giáo viên (Primary User)

Giáo viên tiểu học là người dùng **duy nhất** của hệ thống. Họ tương tác với Smart-MathAI qua giao diện web (React SPA).

**Chân dung người dùng điển hình:**
- Giáo viên chủ nhiệm lớp 1, 2 hoặc 3 tại các trường tiểu học Việt Nam
- Phụ trách 30-45 học sinh mỗi lớp
- Có thể dạy nhiều lớp cùng lúc
- Thành thạo các thao tác máy tính cơ bản
- Cần công cụ giảm tải công việc hành chính và chuyên môn

**Nhu cầu chính:**
- Tạo bài tập phân hóa nhanh chóng, không cần soạn thủ công
- Chấm bài tự động qua ảnh chụp, tiết kiệm thời gian
- Theo dõi được học sinh nào đang yếu phần nào
- Có nhận xét, gợi ý sư phạm để cải thiện chất lượng dạy học
- In ấn và xuất bản bài tập chuyên nghiệp

### 3.2 Học sinh (Indirect Beneficiary)

Học sinh không trực tiếp sử dụng hệ thống, nhưng là đối tượng thụ hưởng gián tiếp:
- Nhận được bài tập phù hợp với năng lực cá nhân
- Được giáo viên theo dõi sát sao hơn nhờ công cụ phân tích
- Có cơ hội cải thiện các điểm yếu thông qua can thiệp kịp thời

### 3.3 Phụ huynh (Future Consideration)

Hiện tại phụ huynh chưa có quyền truy cập hệ thống. Đây là hướng mở rộng tiềm năng trong tương lai nhưng chưa nằm trong lộ trình ngắn hạn.

---

## 4. KIẾN TRÚC HỆ THỐNG

### 4.1 Tổng quan kiến trúc

Smart-MathAI áp dụng kiến trúc **Clean Architecture (Hexagonal Architecture)** cho cả Backend và Frontend. Hệ thống được thiết kế theo hướng phân lớp rõ ràng, đảm bảo:

- **Tính độc lập với framework:** Business logic không phụ thuộc vào FastAPI hay React
- **Khả năng kiểm thử:** Mỗi layer có thể được test độc lập
- **Tính bảo trì:** Thay đổi ở tầng ngoài không ảnh hưởng đến logic nghiệp vụ lõi
- **Tính mở rộng:** Dễ dàng thêm adapter mới (DB, AI provider, v.v.)

### 4.2 Kiến trúc Backend

Backend được xây dựng theo mô hình phân lớp 4 tầng:

```
┌─────────────────────────────────────┐
│         INTERFACES LAYER            │  ← Routers, Schemas, Dependencies
├─────────────────────────────────────┤
│        APPLICATION LAYER            │  ← Use Cases, Ports, DTOs
├─────────────────────────────────────┤
│          DOMAIN LAYER               │  ← Entities, Value Objects, Repository Ports
├─────────────────────────────────────┤
│       INFRASTRUCTURE LAYER          │  ← DB Adapters, AI Adapters, Auth, Observability
└─────────────────────────────────────┘
```

**Dependency Rule:** `Interfaces → Application → Domain` (mũi tên phụ thuộc hướng vào trong). Domain không phụ thuộc vào bất kỳ framework nào.

#### 4.2.1 Interfaces Layer (Tầng giao tiếp)

- **Legacy Routers** (`app/routers/*`): Các API endpoint hiện có, phục vụ tương thích ngược.
- **V1 Routers** (`app/interfaces/api/v1/routers/*`): Các endpoint mới được migrate theo Clean Architecture.
- **Schemas** (`app/schemas/*`): Pydantic models cho request/response validation.

Các router chính:
| Router | Prefix | Chức năng |
|---|---|---|
| `auth.py` | `/api/auth` | Đăng ký, đăng nhập, đăng xuất |
| `classes.py` | `/api/classes` | CRUD lớp học |
| `students.py` | `/api` | CRUD học sinh, import Excel |
| `worksheets.py` | `/api` | CRUD bài tập, publish |
| `ai.py` | `/api` | Sinh câu hỏi, chấm ảnh, analytics |
| `chat.py` | `/api` | Chatbot AI |
| `gradebook.py` | `/api` | Sổ điểm |
| `student_portfolio_router.py` | `/api/v1` | Hồ sơ tiến bộ học sinh |
| `dashboard.py` | `/api` | Thống kê dashboard |
| `pdf.py` | `/api` | Xuất PDF |
| `exercises.py` | `/api` | Quản lý câu hỏi trong bài tập |

#### 4.2.2 Application Layer (Tầng ứng dụng)

Chứa các **Use Cases** — đơn vị logic nghiệp vụ độc lập:

- `GenerateDifferentiationDraftUseCase`: Sinh bài tập phân hóa dạng nháp
- `PublishWorksheetUseCase`: Phê duyệt và phát hành bài tập
- Các **Ports** (giao diện) định nghĩa contract cho infrastructure

#### 4.2.3 Domain Layer (Tầng nghiệp vụ lõi)

- **Entities:** Các thực thể nghiệp vụ (User, Student, Worksheet, MathClass, v.v.)
- **Repository Ports:** Giao diện trừu tượng cho data access, không phụ thuộc SQLAlchemy
- **Domain Services:** Logic nghiệp vụ thuần túy, không phụ thuộc framework

#### 4.2.4 Infrastructure Layer (Tầng hạ tầng)

- **DB/SQLAlchemy:** Implement repository ports bằng SQLAlchemy ORM
- **AI Adapters:** Wrap các service AI (Ollama, Gemini) đằng sau application ports
- **Auth:** JWT + HTTP-only Cookie implementation
- **Observability:** Logging, metrics (đang phát triển)

#### 4.2.5 Bootstrap Layer

- **Composition Root:** Khởi tạo và wire các dependency (use cases, repositories, adapters)
- Sử dụng FastAPI dependency injection để cung cấp dependencies cho routers

### 4.3 Kiến trúc Frontend

Frontend đang chuyển đổi từ mô hình page-centric sang **Feature-Sliced Design**:

```
src/
├── app/            # App-wide providers, routes, layout
│   └── providers/  # QueryProvider, AuthProvider, ToastProvider
├── shared/         # Shared UI, lib, config, types
├── entities/       # Business entities (Student, Worksheet, Class)
├── features/       # Feature modules (differentiation, grading, analytics)
├── widgets/        # Composed UI widgets
├── pages/          # Page-level components
└── processes/      # Multi-step processes (wizards)
```

#### 4.3.1 Quản lý trạng thái

- **TanStack Query v5:** Quản lý toàn bộ Server State (data fetching, caching, mutations)
- **Hạn chế useState/useEffect:** Không dùng để fetch data thuần túy
- **Auth state:** Quản lý qua React Context (`AuthProvider`)

#### 4.3.2 Routing

- **React Router v6** với cấu trúc route phân quyền rõ ràng
- **ProtectedRoute:** Yêu cầu xác thực + role `teacher`
- **GuestRoute:** Chặn người dùng đã đăng nhập vào trang login/register

Danh sách routes:
| Path | Component | Auth |
|---|---|---|
| `/` | HomePage | Required |
| `/login` | LoginPage | Guest only |
| `/register` | RegisterPage | Guest only |
| `/classes` | ClassesPage | Teacher |
| `/classes/:classId` | ClassDetailPage | Teacher |
| `/classes/:classId/worksheets` | WorksheetsPage | Teacher |
| `/classes/:classId/gradebook` | GradebookPage | Teacher |
| `/worksheets/:worksheetId/edit` | WorksheetEditorPage | Teacher |
| `/differentiation-wizard` | DifferentiationWizard | Teacher |
| `/ai-grading` | AIGradingPage | Teacher |
| `/error-analytics` | ErrorAnalyticsPage | Teacher |
| `/gradebook` | GradebookHubPage | Teacher |
| `/student-portfolios` | StudentPortfolioHubPage | Teacher |
| `/classes/:classId/students/:studentId/portfolio` | StudentPortfolioDetailPage | Teacher |
| `/settings` | SettingsPage | Teacher |

### 4.4 Chiến lược API

- **Versioning:** `/api/v1/*` cho endpoint mới, `/api/*` cho legacy
- **Migration Pattern:** Strangler Fig Pattern — migrate từng endpoint một
- **Backward Compatibility:** Endpoint cũ vẫn hoạt động trong giai đoạn chuyển đổi
- **Contract Strategy:** Tiến tới typed client generation từ OpenAPI spec

### 4.5 Trạng thái chuyển đổi kiến trúc

| Phase | Mô tả | Tiến độ |
|---|---|---|
| Phase 0 | Architecture baseline & rollout strategy | 100% ✅ |
| Phase 1 | Backend clean foundation & first migrated slices | 85% |
| Phase 2 | AI ports/adapters standardization | 65% |
| Phase 3 | Frontend architecture shift & auth hardening | 70% |
| Phase 4 | Hardening (tests, metrics, observability) | 30% |

---

## 5. CÔNG NGHỆ SỬ DỤNG

### 5.1 Tổng quan Technology Stack

Smart-MathAI sử dụng stack công nghệ hiện đại, được lựa chọn để tối ưu cho cả hiệu năng và trải nghiệm phát triển:

```
┌──────────────────────────────────────────────┐
│                 FRONTEND                      │
│  React 19 + TypeScript 5.9 + Vite 7          │
│  Tailwind CSS v4 + Shadcn/UI (Radix UI)      │
│  TanStack Query v5 + Recharts                │
│  Playwright (E2E Testing)                     │
├──────────────────────────────────────────────┤
│                 BACKEND                       │
│  Python 3.10+ + FastAPI + SQLAlchemy          │
│  Pydantic v2 + Alembic (Migrations)          │
│  Pytest + HTTP-only Cookie Auth               │
├──────────────────────────────────────────────┤
│                    AI                         │
│  Ollama (Local + Cloud) + Gemini API          │
│  ChromaDB + vietnamese-sbert (RAG)           │
│  LangChain (Orchestration)                    │
└──────────────────────────────────────────────┘
```

### 5.2 Frontend Chi Tiết

#### 5.2.1 Core Framework

| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| **React** | 19 | UI framework chính |
| **TypeScript** | 5.9 | Type safety, strict mode |
| **Vite** | 7 | Build tool, HMR nhanh |

#### 5.2.2 UI & Styling

| Công nghệ | Vai trò |
|---|---|
| **Tailwind CSS v4** | Utility-first CSS framework |
| **Shadcn/UI** | Component library dựa trên Radix UI |
| **Radix UI** | Headless UI primitives (Dialog, Sheet, Dropdown, v.v.) |
| **Recharts** | Biểu đồ tương tác (Dashboard, Analytics) |
| **Lucide React** | Icon library |

#### 5.2.3 State Management & Data Fetching

| Công nghệ | Vai trò |
|---|---|
| **TanStack Query v5** | Server state management, caching, auto-refetch |
| **React Context** | Auth state, Toast notifications |
| **Axios** | HTTP client với `withCredentials: true` |

#### 5.2.4 Testing

| Công nghệ | Vai trò |
|---|---|
| **Vitest** | Unit tests |
| **Playwright** | End-to-End tests |
| **ESLint** | Code quality, TypeScript rules |

### 5.3 Backend Chi Tiết

#### 5.3.1 Core Framework

| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| **Python** | 3.10+ | Ngôn ngữ chính |
| **FastAPI** | Latest | REST API framework, auto-docs |
| **Uvicorn** | Latest | ASGI server |

#### 5.3.2 Database & ORM

| Công nghệ | Vai trò |
|---|---|
| **SQLAlchemy** | ORM, query builder |
| **SQLite** | Database chính (development/production) |
| **Alembic** | Database migrations |
| **Repository Pattern** | Trừu tượng hóa data access |

#### 5.3.3 Validation & Serialization

| Công nghệ | Vai trò |
|---|---|
| **Pydantic v2** | Request/response validation, settings management |
| **Pydantic-Settings** | Environment variable loading |

#### 5.3.4 Authentication

| Công nghệ | Vai trò |
|---|---|
| **JWT (python-jose)** | Token generation và verification |
| **HTTP-only Cookies** | Primary auth transport |
| **bcrypt** | Password hashing |

#### 5.3.5 File Processing

| Công nghệ | Vai trò |
|---|---|
| **openpyxl** | Excel import/export (học sinh, sổ điểm) |
| **python-multipart** | File upload handling |

#### 5.3.6 Testing

| Công nghệ | Vai trò |
|---|---|
| **pytest** | Test framework |
| **pytest-cov** | Code coverage |

### 5.4 AI/ML Stack Chi Tiết

#### 5.4.1 Language Models

| Model | Môi trường | Vai trò | Thông số |
|---|---|---|---|
| **gemma3:12b** | Ollama Cloud | Sinh câu hỏi phân hóa | 12B params |
| **qwen2.5:3b** | Ollama Local | Chấm bài text + giải thích | 3B params |
| **gemma4:31b** | Ollama Cloud | OCR nhận diện chữ viết tay | 31B params |
| **gemini-2.5-flash** | Gemini API | Chatbot trợ lý giáo viên | — |

#### 5.4.2 Embeddings & Vector Search

| Công nghệ | Vai trò |
|---|---|
| **vietnamese-sbert** (`keepitreal/vietnamese-sbert`) | Vietnamese text embeddings |
| **ChromaDB** | Vector database cho RAG |
| **sentence-transformers** | Embedding model interface |

#### 5.4.3 AI Orchestration

| Công nghệ | Vai trò |
|---|---|
| **LangChain** | AI pipeline orchestration |
| **LangChain-Community** | Community integrations |

### 5.5 DevOps & Infrastructure

| Công nghệ | Vai trò |
|---|---|
| **ngrok** | Tunneling cho development |
| **Git** | Version control |
| **GitHub** | Repository hosting, CI/CD |

### 5.6 Nguyên tắc lựa chọn công nghệ

1. **Ưu tiên mã nguồn mở:** Tất cả công nghệ chính đều là open-source.
2. **Tối ưu cho hệ sinh thái Python/JavaScript:** Giảm context switching cho developer.
3. **Production-ready:** Các thư viện đã được kiểm chứng trong môi trường production.
4. **Cộng đồng lớn:** Dễ dàng tìm kiếm hỗ trợ và tài liệu.
5. **Hiệu năng:** Tối ưu cho môi trường local development với tài nguyên hạn chế.

---

## 6. CƠ SỞ DỮ LIỆU

### 6.1 Tổng quan thiết kế CSDL

Smart-MathAI sử dụng **SQLite** làm database chính, truy cập thông qua **SQLAlchemy ORM** và **Repository Pattern**. Thiết kế CSDL tuân thủ nguyên tắc:

- **Data Isolation:** Dữ liệu được phân lập theo `teacher_id` ở mọi bảng
- **Cascading Deletes:** Xóa lớp sẽ xóa toàn bộ học sinh, bài tập liên quan
- **Audit Trail:** Timestamps (`created_at`, `updated_at`) trên mọi bảng
- **JSON Flexibility:** Sử dụng JSON columns cho dữ liệu có cấu trúc động

### 6.2 Sơ đồ quan hệ (Entity Relationship Diagram)

```
users (1) ──────< math_classes (N)
  │                   │
  │                   ├──< students (N)
  │                   │      └──< student_progress (N)
  │                   │
  │                   ├──< worksheets (N)
  │                   │      ├──< worksheet_exercises (N)
  │                   │      └──< student_progress (N)
  │                   │
  │                   ├──< announcements (N)
  │                   │
  │                   └──< student_analytics (N)
  │
  ├──< grading_reports (N)
  │
  └──< chat_messages (N)
```

### 6.3 Chi tiết các bảng

#### 6.3.1 Bảng `users` — Người dùng

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INTEGER | PK, Auto Increment | ID người dùng |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | Email đăng nhập |
| `password_hash` | VARCHAR(255) | NOT NULL | Mật khẩu đã hash (bcrypt) |
| `full_name` | VARCHAR(255) | NOT NULL | Họ tên đầy đủ |
| `role` | ENUM('teacher') | NOT NULL | Vai trò (chỉ có teacher) |
| `created_at` | DATETIME | DEFAULT NOW | Thời điểm tạo tài khoản |

#### 6.3.2 Bảng `math_classes` — Lớp học

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INTEGER | PK, Auto Increment | ID lớp học |
| `class_name` | VARCHAR(100) | NOT NULL | Tên lớp (VD: "Lớp 2A") |
| `grade` | INTEGER | NOT NULL | Khối lớp (1, 2 hoặc 3) |
| `class_code` | VARCHAR(10) | UNIQUE, INDEX | Mã lớp ngẫu nhiên (6 ký tự) |
| `teacher_id` | INTEGER | FK → users.id, NOT NULL | Giáo viên chủ nhiệm |
| `created_at` | DATETIME | DEFAULT NOW | Thời điểm tạo lớp |

#### 6.3.3 Bảng `students` — Học sinh

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INTEGER | PK, Auto Increment | ID học sinh |
| `full_name` | VARCHAR(255) | NOT NULL | Họ tên học sinh |
| `class_id` | INTEGER | FK → math_classes.id, NOT NULL | Lớp học |
| `tier` | VARCHAR(20) | DEFAULT 'standard' | Cấp độ năng lực (foundation/standard/extension/advanced) |
| `dob` | DATE | NULLABLE | Ngày sinh |
| `parent_name` | VARCHAR(100) | NULLABLE | Họ tên phụ huynh |
| `parent_phone` | VARCHAR(20) | NULLABLE | SĐT phụ huynh |
| `created_at` | DATETIME | DEFAULT NOW | Thời điểm thêm học sinh |

#### 6.3.4 Bảng `worksheets` — Bài tập

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INTEGER | PK, Auto Increment | ID bài tập |
| `title` | VARCHAR(255) | NOT NULL | Tiêu đề bài tập |
| `class_id` | INTEGER | FK → math_classes.id, NOT NULL | Lớp học |
| `topic_id` | INTEGER | FK → math_topics.id, NULLABLE | Chủ đề toán |
| `grade` | INTEGER | NOT NULL | Khối lớp |
| `difficulty` | VARCHAR(50) | NULLABLE | Độ khó |
| `status` | ENUM('draft','published') | DEFAULT 'draft' | Trạng thái |
| `worksheet_type` | ENUM('differentiation') | NOT NULL | Loại bài tập |
| `objective` | VARCHAR(500) | NULLABLE | Mục tiêu học tập |
| `created_at` | DATETIME | DEFAULT NOW | Thời điểm tạo |
| `published_at` | DATETIME | NULLABLE | Thời điểm phát hành |

#### 6.3.5 Bảng `student_progress` — Tiến độ học sinh

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INTEGER | PK, Auto Increment | ID bản ghi |
| `student_id` | INTEGER | FK → students.id, CASCADE | Học sinh |
| `worksheet_id` | INTEGER | FK → worksheets.id, CASCADE | Bài tập |
| `status` | VARCHAR | DEFAULT 'not_started' | Trạng thái (not_started/completed/graded) |
| `correct_count` | INTEGER | DEFAULT 0 | Số câu đúng |
| `total_count` | INTEGER | DEFAULT 0 | Tổng số câu |
| `completed_at` | DATETIME | NULLABLE | Thời điểm hoàn thành |
| `details` | JSON | NULLABLE | Chi tiết kết quả |
| `created_at` | DATETIME | DEFAULT NOW | Thời điểm tạo |
| `updated_at` | DATETIME | AUTO UPDATE | Thời điểm cập nhật |

#### 6.3.6 Bảng `student_analytics` — Phân tích lỗi

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INTEGER | PK, Auto Increment | ID bản ghi |
| `class_id` | INTEGER | FK → math_classes.id, NOT NULL, INDEX | Lớp học |
| `teacher_id` | INTEGER | FK → users.id, NOT NULL, INDEX | Giáo viên |
| `student_id` | INTEGER | FK → students.id, NULLABLE, INDEX | Học sinh |
| `worksheet_id` | INTEGER | FK → worksheets.id, NULLABLE, INDEX | Bài tập |
| `error_type` | VARCHAR(120) | NOT NULL | Loại lỗi |
| `count` | INTEGER | NOT NULL, DEFAULT 1 | Số lần mắc lỗi |
| `source` | VARCHAR(50) | NOT NULL, DEFAULT 'ai_grading' | Nguồn dữ liệu |
| `ocr_confidence` | FLOAT | NULLABLE | Độ tin cậy OCR |
| `metadata` | JSON | NULLABLE | Payload chi tiết (question_id, error_detail, student_answer, correct_answer, question_text) |
| `created_at` | DATETIME | DEFAULT NOW, INDEX | Thời điểm tạo |

#### 6.3.7 Bảng `grading_reports` — Báo cáo chấm điểm

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INTEGER | PK, Auto Increment | ID báo cáo |
| `teacher_id` | INTEGER | FK → users.id, NOT NULL | Giáo viên tạo |
| `class_id` | INTEGER | FK → math_classes.id, NOT NULL | Lớp học |
| `student_name` | VARCHAR(100) | NOT NULL | Tên học sinh |
| `worksheet_title` | VARCHAR(255) | DEFAULT 'Bài kiểm tra' | Tiêu đề bài |
| `total_score` | FLOAT | NOT NULL | Tổng điểm |
| `max_score` | FLOAT | NOT NULL | Điểm tối đa |
| `file_path` | VARCHAR(500) | NOT NULL | Đường dẫn file PDF |
| `results_json` | TEXT | NULLABLE | Kết quả chi tiết (JSON string) |
| `created_at` | DATETIME | DEFAULT NOW | Thời điểm tạo |

#### 6.3.8 Bảng `chat_messages` — Tin nhắn chatbot

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | INTEGER | PK, Auto Increment | ID tin nhắn |
| `teacher_id` | INTEGER | FK → users.id, NOT NULL, INDEX | Giáo viên |
| `session_id` | VARCHAR(64) | NOT NULL, INDEX | ID phiên chat |
| `role` | VARCHAR(10) | NOT NULL | Vai trò ('user' hoặc 'assistant') |
| `content` | TEXT | NOT NULL | Nội dung tin nhắn |
| `message_type` | VARCHAR(30) | DEFAULT 'text' | Loại tin nhắn |
| `metadata_json` | JSON | NULLABLE | Metadata ngữ cảnh |
| `created_at` | DATETIME | DEFAULT NOW, INDEX | Thời điểm gửi |

### 6.4 Chiến lược Migration

- Sử dụng **Alembic** cho tất cả thay đổi schema
- Mỗi thay đổi schema có một migration file riêng
- Migration được chạy tự động khi deploy
- Có kế hoạch xóa bảng `cpa_bundles` (tính năng CPA đã deprecated)

### 6.5 Vector Database (ChromaDB)

Ngoài SQLite, hệ thống còn sử dụng **ChromaDB** làm vector database cho RAG pipeline:

- **Mục đích:** Lưu trữ embeddings của nội dung SGK Toán lớp 1-3
- **Embedding model:** `keepitreal/vietnamese-sbert`
- **Phân lập dữ liệu:** Mỗi khối lớp có collection riêng trong ChromaDB
- **Truy vấn:** Semantic search theo ngữ cảnh câu hỏi cần sinh
- **Storage:** Lưu trữ local tại thư mục `vector_db/`

---

## 7. HỆ THỐNG AI

### 7.1 Tổng quan kiến trúc AI

Smart-MathAI tích hợp AI một cách có kiểm soát, tuân thủ nguyên tắc **AI Assistive** (AI chỉ là trợ lý). Hệ thống AI được thiết kế theo mô hình **Ports & Adapters**, đảm bảo:

- **Cô lập AI logic:** Tất cả code AI nằm trong `backend/app/services/ai/`
- **Adapter Pattern:** AI providers được wrap đằng sau application ports
- **Dynamic Model Loading:** Model được load khi cần, unload sau khi dùng (theo `OLLAMA_KEEP_ALIVE`)
- **Fallback Strategy:** Cloud model failure → tự động fallback về local model

### 7.2 Các AI Service Chính

#### 7.2.1 Question Generator (`question_generator.py` — 43,257 bytes)

Service lớn nhất và phức tạp nhất, chịu trách nhiệm sinh câu hỏi toán phân hóa.

**Quy trình sinh câu hỏi:**
1. Nhận input: `topic_id`, `grade`, `objective`, `tiers[]`
2. Truy vấn RAG pipeline để lấy ngữ cảnh SGK liên quan
3. Xây dựng prompt với đầy đủ ràng buộc sư phạm
4. Gọi `gemma3:12b` (Ollama Cloud) để sinh câu hỏi
5. Validate output qua template filter và difficulty validator
6. Trả về danh sách câu hỏi ở trạng thái `Draft`

**Ràng buộc trong prompt:**
- Chỉ dùng kiến thức lớp 1-3
- Không giải bằng đại số (x, y)
- Mô phỏng đồ vật thủ công, trực quan
- Tiếng Việt chuẩn, phù hợp trẻ 6-9 tuổi
- Phân hóa 4 cấp độ: Foundation → Standard → Extension → Advanced

#### 7.2.2 Grading Service (`grading_service.py` — 40,410 bytes)

Chấm điểm tự động bài làm của học sinh sau khi OCR đã bóc tách chữ.

**Quy trình chấm điểm:**
1. Nhận input: OCR text, correct answers (JSON schema)
2. Parse và chuẩn hóa cả student answer và correct answer
3. So khớp theo từng câu hỏi với typed comparator
4. Áp dụng grading rule per question (`all_or_nothing` hoặc `per_item`)
5. Tính điểm tổng và sinh feedback chi tiết
6. Gán error tags (sai logic, sai tính toán, bỏ trống, v.v.)

**Các loại câu hỏi được hỗ trợ (V1):**
- `numeric` — Đáp án số
- `ordered_list` — Danh sách có thứ tự
- `unordered_list` — Danh sách không thứ tự
- `multi_blank` — Nhiều ô trống
- `boolean` — Đúng/Sai

**Cải tiến độ chính xác:**
- Typed comparator thay vì so khớp chuỗi đơn giản
- Rule `per_item` cho phép chấm từng phần tử trong list
- Phát hiện thiếu phần tử (không còn false-positive full score)
- OCR confidence tracking cho low-confidence tokens

#### 7.2.3 OCR Service (`ocr_service.py` — 3,996 bytes)

Nhận diện chữ viết tay tiếng Việt từ ảnh chụp bài làm.

**Quy trình OCR:**
1. Nhận ảnh upload từ giáo viên
2. Gửi ảnh đến `gemma4:31b` (Ollama Cloud Vision)
3. Nhận text đã bóc tách + confidence scores
4. Trả về raw text và OCR tokens với confidence

#### 7.2.4 Analytics Service (`analytics_service.py` — 18,425 bytes)

Phân tích lỗi sai và thống kê theo lớp/học sinh.

**Chức năng:**
- Aggregrate error tags từ grading sessions
- Tính toán weak topics (chủ đề yếu của lớp)
- Tính student performance metrics
- Phát hiện mistake patterns (mẫu lỗi phổ biến)
- Cung cấp dữ liệu cho dashboard và error analytics page

#### 7.2.5 Chat Service (`chat_service.py` — 14,860 bytes)

Xử lý hội thoại giữa giáo viên và AI chatbot.

**Tính năng chatbot:**
- **Class Insights:** Phân tích lỗi sai và xu hướng của cả lớp
- **Student Spotlight:** Phân tích sâu từng học sinh kèm biểu đồ
- **Homework Photo Analysis:** Phân tích ảnh bài làm qua Gemini Vision
- **Whiteboard Verification:** Xác minh bài giải trên bảng
- **Lesson Plan Chat:** Gợi ý kế hoạch bài dạy

#### 7.2.6 Gemini Service (`gemini_service.py` — 11,307 bytes)

Adapter cho Gemini API, xử lý:
- Text generation (chatbot responses)
- Vision analysis (ảnh bài tập, bảng viết)
- Streaming responses

#### 7.2.7 Ollama Service (`ollama_service.py` — 19,632 bytes)

Adapter cho Ollama (local + cloud), xử lý:
- Model loading/unloading lifecycle
- Request/response handling
- Fallback logic (cloud → local)
- Keep-alive management

#### 7.2.8 RAG Service (`rag_service.py` — 10,133 bytes)

Retrieval-Augmented Generation pipeline:
- Query ChromaDB với vietnamese-sbert embeddings
- Truy xuất nội dung SGK liên quan
- Cung cấp context cho question generator
- Đảm bảo grade isolation (không query chéo lớp)

### 7.3 RAG Pipeline Chi Tiết

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  User Input  │───▶│   Embedding  │───▶│  ChromaDB    │
│  (topic,     │    │  (vietnamese │    │  Search      │
│   grade)     │    │   -sbert)    │    │              │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                               │
                                               ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  AI Output   │◀───│  LLM Prompt  │◀───│  Retrieved   │
│  (questions) │    │  (gemma3)    │    │  Context     │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Data Source:** File PDF SGK Toán lớp 1-3 trong `backend/data_raw/`
**Ingestion Script:** `scripts/ingest.py` — Chunk và embed SGK vào ChromaDB
**Isolation:** Mỗi grade có collection riêng, query theo `grade` filter

### 7.4 AI Model Lifecycle

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  IDLE   │────▶│  LOAD   │────▶│  INFER  │────▶│ UNLOAD  │
│         │     │ (on     │     │ (process│     │ (after  │
│         │     │ demand) │     │ request)│     │ keep-   │
│         │     │         │     │         │     │ alive)  │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
      ▲                                              │
      └──────────────────────────────────────────────┘
```

- **Load:** Model được load vào RAM/GPU khi có request đầu tiên
- **Infer:** Xử lý request, trả về kết quả
- **Unload:** Sau `OLLAMA_KEEP_ALIVE` (mặc định 3 phút) không có request, model được unload
- **Fallback:** Nếu cloud model không khả dụng → tự động dùng local model

### 7.5 Prompt Engineering

Mỗi AI service có hệ thống prompt riêng, được thiết kế cẩn thận:

**Question Generation Prompt bao gồm:**
- System role: "Bạn là trợ lý giáo dục toán tiểu học Việt Nam..."
- Grade constraint: "Chỉ tạo câu hỏi cho học sinh lớp {grade}..."
- Pedagogical rules: "Không dùng đại số, mô phỏng đồ vật thực tế..."
- Differentiation tiers: "Tạo {count} câu hỏi cho mỗi cấp độ: {tiers}..."
- Output format: JSON schema cụ thể

**Grading Prompt bao gồm:**
- Correct answers schema
- Student OCR text
- Grading rules per question
- Error type taxonomy
- Feedback language: Tiếng Việt, nhẹ nhàng, khích lệ

### 7.6 AI Safety & Quality Controls

| Cơ chế | Mô tả |
|---|---|
| **Template Filter** | Kiểm tra output có đúng format JSON không |
| **Difficulty Validator** | Đảm bảo câu hỏi phù hợp cấp độ yêu cầu |
| **Grade Boundary Check** | Không cho phép nội dung vượt quá khối lớp |
| **Max Repair Rounds** | Giới hạn số lần sửa lỗi (mặc định: 1) |
| **OCR Confidence Threshold** | Cảnh báo khi OCR confidence thấp |
| **Teacher Review Gate** | Mọi output AI đều cần giáo viên duyệt |

---

## 8. TÍNH NĂNG HIỆN TẠI

### 8.1 Tổng quan tính năng

Smart-MathAI hiện có **9 nhóm tính năng chính**, chia thành 2 loại: Core Features (nền tảng) và AI Features (thông minh).

### 8.2 Core Features

#### 8.2.1 Quản lý lớp học (Class Management)

**Mô tả:** Cho phép giáo viên tạo và quản lý nhiều lớp học cùng lúc.

**Chức năng chi tiết:**
- Tạo lớp mới với tên, khối lớp (1/2/3)
- Tự động sinh mã lớp ngẫu nhiên (6 ký tự)
- Sửa thông tin lớp (có cảnh báo khi đổi khối lớp)
- Xóa lớp (cascade xóa học sinh, bài tập)
- Xem danh sách tất cả lớp của giáo viên
- Xem chi tiết từng lớp (học sinh, bài tập, thống kê)

**Files:**
- Backend: `backend/app/routers/classes.py`, `backend/app/services/class_service.py`
- Frontend: `frontend/src/pages/ClassesPage.tsx`, `frontend/src/pages/ClassDetailPage.tsx`

#### 8.2.2 Quản lý học sinh (Student Management)

**Mô tả:** Quản lý danh sách học sinh trong từng lớp.

**Chức năng chi tiết:**
- Thêm học sinh thủ công (họ tên, ngày sinh, thông tin phụ huynh)
- Import hàng loạt qua file Excel (.xlsx)
  - Template: `Họ và tên | Ngày tháng năm sinh | Họ tên bố hoặc mẹ | SĐT bố hoặc mẹ`
- Sửa thông tin học sinh
- Xóa học sinh
- Xem hồ sơ học sinh (thông tin cá nhân + điểm số + cấp độ)
- Tự động phân loại cấp độ năng lực (tier)

**Files:**
- Backend: `backend/app/routers/students.py`, `backend/app/services/student_service.py`
- Frontend: `frontend/src/pages/ClassDetailPage.tsx`

#### 8.2.3 Sổ điểm (Gradebook)

**Mô tả:** Bảng điểm tổng hợp cho từng lớp, có thể chỉnh sửa và xuất Excel.

**Chức năng chi tiết:**
- Xem điểm tất cả học sinh trong lớp theo từng bài tập
- Chỉnh sửa điểm trực tiếp trên bảng (inline editing)
- Tự động tính điểm trung bình
- Xuất sổ điểm ra file Excel
- Hub page: chọn lớp để xem sổ điểm

**Files:**
- Backend: `backend/app/routers/gradebook.py`, `backend/app/services/gradebook_service.py`
- Frontend: `frontend/src/pages/GradebookPage.tsx`, `frontend/src/pages/GradebookHubPage.tsx`

#### 8.2.4 Smart Student Progress Portfolio (Hồ sơ tiến bộ thông minh)

**Mô tả:** Hồ sơ tiến bộ tập trung cho từng học sinh, giúp giáo viên theo dõi điểm số, lỗi lặp lại, trạng thái tiến bộ và gợi ý hỗ trợ mà không phải tự tổng hợp từ nhiều màn hình.

**Nguồn dữ liệu:**
- `GradeEntry`: điểm chính thức từ sổ điểm, được ưu tiên khi tính điểm trung bình.
- `StudentProgress`: dữ liệu fallback khi chưa có điểm chính thức.
- `StudentAnalytics`: lỗi sai, error tags và evidence từ luồng chấm bài/analytics.
- `Worksheet`: thông tin bài tập, ngày làm và ngữ cảnh học tập.

**Chức năng chi tiết:**
- Hub `Portfolio`: chọn lớp và xem danh sách học sinh dạng card.
- Mỗi card hiển thị tên học sinh, tier, điểm trung bình, trạng thái tiến bộ, lỗi nổi bật và hoạt động gần nhất.
- Trang chi tiết học sinh hiển thị xu hướng điểm, bài gần đây, lỗi lặp lại, data quality và gợi ý hỗ trợ.
- Trạng thái tiến bộ được tính deterministic/rule-based: `Chưa đủ dữ liệu`, `Đang tiến bộ`, `Ổn định`, `Cần theo dõi`, `Cần can thiệp`.
- Gợi ý hành động là **nháp tham khảo**, giáo viên quyết định áp dụng; không có auto-publish, không ghi đè điểm/lỗi.
- Có link “Xem hồ sơ” từ Gradebook để kết nối workflow điểm số với hồ sơ tiến bộ.

**API v1:**
- `GET /api/v1/classes/{class_id}/student-portfolios`
- `GET /api/v1/classes/{class_id}/students/{student_id}/portfolio`

**Bảo mật và ràng buộc:**
- Teacher-only qua `get_current_teacher`.
- Enforce teacher ownership, class scope và grade 1-3.
- Không tạo role học sinh/phụ huynh, không thêm model AI mới, không sửa semantics Gradebook/AI Grading/Worksheet Publish.

**Files:**
- Backend: `backend/app/application/use_cases/get_class_student_portfolios.py`, `backend/app/application/use_cases/get_student_portfolio_detail.py`, `backend/app/domain/repositories/student_portfolio_repository.py`, `backend/app/domain/services/student_progress_classifier.py`, `backend/app/infrastructure/db/sqlalchemy/repositories/student_portfolio_repository.py`, `backend/app/interfaces/api/v1/routers/student_portfolio_router.py`
- Frontend: `frontend/src/pages/StudentPortfolioHubPage.tsx`, `frontend/src/pages/StudentPortfolioDetailPage.tsx`, `frontend/src/features/student-portfolio/queries.ts`, `frontend/src/components/portfolio/`, `frontend/src/services/studentPortfolioApi.ts`

### 8.3 AI Features

#### 8.3.1 Differentiation Worksheet Generation (Sinh bài tập phân hóa)

**Mô tả:** Tính năng flagship của hệ thống. AI tự động sinh bài tập toán theo 4 cấp độ năng lực.

**Quy trình:**
1. Giáo viên chọn lớp → chọn chủ đề → nhập mục tiêu học tập
2. Chọn cấp độ cần sinh (Foundation, Standard, Extension, Advanced)
3. Hệ thống gọi AI sinh câu hỏi cho từng cấp độ
4. Câu hỏi ở trạng thái `Draft` — giáo viên xem và chỉnh sửa
5. Giáo viên bấm `Publish` để phát hành bài tập
6. Có thể xuất PDF hoặc in trực tiếp

**4 cấp độ phân hóa:**
| Cấp độ | Mô tả | Đối tượng |
|---|---|---|
| **Foundation** | Bài tập nền tảng, cơ bản nhất | Học sinh yếu, cần củng cố kiến thức gốc |
| **Standard** | Bài tập chuẩn theo chương trình | Học sinh trung bình |
| **Extension** | Bài tập mở rộng, vận dụng | Học sinh khá |
| **Advanced** | Bài tập nâng cao, thử thách | Học sinh giỏi, cần thử thách thêm |

**Files:**
- Backend: `backend/app/services/ai/question_generator.py`, `backend/app/routers/ai.py`
- Frontend: `frontend/src/components/differentiation/DifferentiationWizard.tsx`

#### 8.3.2 AI Grading với OCR (Chấm điểm tự động qua ảnh)

**Mô tả:** Giáo viên chụp ảnh bài làm của học sinh → AI tự động đọc và chấm điểm.

**Quy trình:**
1. Giáo viên chọn lớp, chọn học sinh
2. Upload ảnh bài làm
3. Nhập đáp án đúng qua Answer Builder (không cần JSON)
4. Hệ thống:
   - OCR bóc tách chữ viết tay (`gemma4:31b`)
   - So khớp với đáp án (`qwen2.5:3b` hoặc `gemma3:12b`)
   - Tính điểm, gán error tags
5. Giáo viên xem kết quả, có thể override từng câu
6. Lưu điểm vào hệ thống + đẩy error tags vào analytics

**Answer Builder:** UI form cho phép giáo viên nhập đáp án theo từng câu:
- Chọn loại câu hỏi (numeric, list, multi-blank, boolean)
- Nhập đáp án đúng
- Chọn rule chấm (all_or_nothing / per_item)
- Hệ thống tự convert sang internal JSON schema

**Files:**
- Backend: `backend/app/services/ai/grading_service.py`, `backend/app/services/ai/ocr_service.py`
- Frontend: `frontend/src/pages/AIGradingPage.tsx`, `frontend/src/components/ai/AnswerBuilder.tsx`

#### 8.3.3 Error Analytics (Phân tích lỗi sai)

**Mô tả:** Thống kê và phân tích lỗi sai của học sinh theo lớp và cá nhân.

**Chức năng chi tiết:**
- Xem danh sách lỗi theo lớp (tất cả học sinh)
- Lọc lỗi theo từng học sinh
- Phân loại lỗi: sai logic, sai tính toán, bỏ trống, đọc đề sai, thiếu đơn vị
- Biểu đồ phân bố lỗi (Recharts)
- Chỉnh sửa error tags (giáo viên có thể sửa lại phân loại của AI)
- Xóa error records
- Dữ liệu được cập nhật real-time từ AI grading

**Files:**
- Backend: `backend/app/services/ai/analytics_service.py`
- Frontend: `frontend/src/pages/ErrorAnalyticsPage.tsx`

#### 8.3.4 AI Chatbot (Trợ lý giáo viên)

**Mô tả:** Chatbot AI thông minh, hoạt động như một trợ lý sư phạm luôn sẵn sàng.

**Tính năng:**
- **Floating button:** Luôn hiển thị ở góc phải màn hình
- **Hội thoại tiếng Việt:** Tự nhiên, chuyên nghiệp
- **Class Insights:** Hỏi về tình hình lớp (VD: "Lớp 2A đang yếu phần nào?")
- **Student Spotlight:** Hỏi về học sinh cụ thể (VD: "Em Minh có tiến bộ không?")
- **Photo Analysis:** Gửi ảnh bài làm để AI phân tích
- **Lesson Planning:** Gợi ý kế hoạch bài dạy
- **Lịch sử chat:** Lưu trữ và xem lại các phiên chat trước

**Files:**
- Backend: `backend/app/routers/chat.py`, `backend/app/services/ai/chat_service.py`, `backend/app/services/ai/gemini_service.py`
- Frontend: `frontend/src/components/chat/`

#### 8.3.5 Dashboard (Bảng điều khiển)

**Mô tả:** Trang tổng quan hiển thị thống kê và gợi ý sư phạm.

**Thông tin hiển thị:**
- Tổng số lớp, học sinh, bài tập
- Điểm trung bình toàn hệ thống
- Biểu đồ phân bố lỗi
- Danh sách hoạt động gần đây
- Gợi ý sư phạm dựa trên error patterns
- Quick action buttons (tạo bài tập, chấm điểm, xem analytics)

**Files:**
- Backend: `backend/app/routers/dashboard.py`
- Frontend: `frontend/src/pages/HomePage.tsx`

### 8.4 Tính năng phụ trợ

#### 8.4.1 PDF Export (Xuất PDF)

- In nhanh trong editor (`window.print()` với `@media print` CSS)
- Tải file PDF thật từ modal export
- Hỗ trợ 2 chế độ: Classroom (cả lớp) và Personalized (cá nhân hóa)
- Layout chuẩn A4, font tiếng Việt rõ nét
- Page break thông minh, không cắt nửa câu hỏi

#### 8.4.2 Quản lý bài tập (Worksheet Management)

- Tạo, sửa, xóa, nhân bản bài tập
- Lọc theo loại bài tập
- Xem danh sách bài tập trong lớp
- Chỉnh sửa nội dung bài tập trong editor

#### 8.4.3 Xác thực và phân quyền

- Đăng ký / Đăng nhập / Đăng xuất
- HTTP-only Cookie session
- Role-based access control (teacher only)

### 8.5 Tính năng đã deprecated

#### CPA Feature (Concrete-Pictorial-Abstract)

- **Trạng thái:** Đã có kế hoạch xóa bỏ (plan: `docs/plans/2026-05-05-remove-cpa-feature.md`)
- **Lý do:** Chuẩn bị thay thế bằng tính năng mới
- **Phạm vi xóa:** 30 files, 35 files cần sửa, 1 migration mới
- **Chưa thực thi:** Plan đã được phê duyệt nhưng chưa chạy

---

## 9. BẢO MẬT VÀ PHÂN QUYỀN

### 9.1 Tổng quan chiến lược bảo mật

Smart-MathAI áp dụng chiến lược **Defense in Depth** (phòng thủ nhiều lớp):

| Lớp bảo vệ | Cơ chế |
|---|---|
| **Application Security** | Role-based Access, Input Validation qua Pydantic |
| **Transport Security** | HTTP-only Cookies, CORS Policy |
| **Authentication** | JWT + bcrypt, Session Management |
| **Data Isolation** | Teacher-scoped queries, Grade isolation trong RAG |

### 9.2 Authentication (Xác thực)

Hệ thống sử dụng **JWT (JSON Web Token)** kết hợp **HTTP-only Cookie**:

**Quy trình đăng nhập:**
1. Giáo viên gửi `email` + `password` → `/api/auth/login`
2. Backend verify password với bcrypt hash
3. Tạo JWT chứa `user_id`, `role`, `exp`
4. Set JWT vào HTTP-only cookie (`access_token`)
5. Frontend tự động gửi cookie trong mọi request tiếp theo

**Cấu hình JWT:**

| Tham số | Giá trị |
|---|---|
| `JWT_ALGORITHM` | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 30 phút |
| `AUTH_COOKIE_NAME` | `access_token` |
| `AUTH_COOKIE_SAMESITE` | `lax` |

**Lợi ích HTTP-only Cookie so với LocalStorage:**

| Tiêu chí | LocalStorage | HTTP-only Cookie |
|---|---|---|
| XSS Protection | ❌ Có thể bị đọc bởi JS | ✅ Không thể truy cập từ JS |
| Tự động gửi | ❌ Phải code thêm header | ✅ Browser tự gửi |

### 9.3 Authorization (Phân quyền)

- **1 Role duy nhất:** `teacher`
- **Mọi API endpoint** yêu cầu `get_current_teacher` dependency
- **Data Isolation:** Mọi query đều scope theo `teacher_id`
- **Grade Isolation:** ChromaDB query luôn kèm `grade` filter

### 9.4 CORS Policy

Chỉ cho phép origin từ frontend dev server:
- `http://localhost:5173` (Vite)
- `http://localhost:3000` (Alternative)
- `allow_credentials=True`

### 9.5 Password Security

- Hashing: **bcrypt** với salt rounds mặc định
- Không lưu hoặc log plaintext password
- Minimum length: 6 ký tự

### 9.6 Các rủi ro đã được mitigate

| Rủi ro | Biện pháp |
|---|---|
| XSS đánh cắp token | HTTP-only cookie |
| CSRF tấn công | SameSite=lax + CORS |
| Data leak giữa teachers | Teacher-scoped queries |
| Học vượt (grade mixing) | Grade isolation trong RAG |
| AI tự động publish | Human-in-the-loop bắt buộc |
| Lộ API key | `.env` file, gitignored |

---

## 10. QUY TRÌNH PHÁT TRIỂN

### 10.1 Phương pháp

Smart-MathAI áp dụng **Agile/Scrum** kết hợp:
- **TDD (Test-Driven Development):** Viết test trước khi code
- **Code Review:** Review bắt buộc trước merge
- **AI-Assisted Development:** BMad + Antigravity skills

### 10.2 AI-Assisted Development

**CLAUDE.md** định nghĩa cho AI agents:
- Domain constraints (toán 1-3, teacher-only, AI draft)
- Quy tắc code (FastAPI patterns, TypeScript strict)
- Available commands (`/plan`, `/tdd`, `/python-review`, v.v.)

**Slash Commands:**

| Command | Chức năng |
|---|---|
| `/plan "feature"` | Lên kế hoạch và phân tích impact |
| `/tdd "feature"` | Bắt đầu TDD workflow |
| `/python-review` | Review backend code |
| `/code-review` | Review frontend code |
| `/security-scan` | Scan bảo mật |

### 10.3 Testing Strategy

**Backend:**
```bash
pytest tests/ -v --cov=app
```
- Coverage ≥ 80%
- Mock AI calls (không gọi model thật khi test)

**Frontend:**
```bash
npm run test          # Unit tests (Vitest)
npm run lint          # ESLint
npx playwright test   # E2E tests
```

**Quick Verification:**
```bash
backend\venv\Scripts\python.exe -m pytest -q backend/tests
npm --prefix frontend run test
npm --prefix frontend run lint
```

### 10.4 Quy trình phát triển tính năng mới

```
Brainstorm → Spec → Plan → TDD → Review → Integrate
```

### 10.5 Cấu trúc thư mục dự án

```
d:\project smartMathAI\
├── backend/                    # FastAPI Application
│   ├── app/
│   │   ├── application/        # Use Cases, Ports, DTOs
│   │   ├── bootstrap/          # DI Composition Root
│   │   ├── core/               # Exceptions, Security
│   │   ├── domain/             # Entities, Repository Ports
│   │   ├── infrastructure/     # DB Adapters, AI Adapters
│   │   ├── interfaces/         # API Routers (v1)
│   │   ├── models/             # SQLAlchemy Models (8 models)
│   │   ├── routers/            # Legacy API Routers (12 routers)
│   │   ├── schemas/            # Pydantic Schemas
│   │   ├── services/           # Business Logic & AI Services
│   │   │   └── ai/             # AI Services (8 modules)
│   │   ├── config.py           # App configuration
│   │   ├── database.py         # DB connection
│   │   └── main.py             # App entry point
│   ├── alembic/                # Database migrations
│   ├── data_raw/               # PDF Textbooks for RAG
│   ├── tests/                  # Backend tests
│   └── requirements.txt        # Python dependencies
├── frontend/                   # React Application
│   ├── src/
│   │   ├── app/                # Providers, Routes
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── ai/             # AI-related components
│   │   │   ├── chat/           # Chatbot components
│   │   │   ├── dashboard/      # Dashboard widgets
│   │   │   ├── differentiation/# Differentiation wizard
│   │   │   ├── redesign/       # Redesigned components
│   │   │   └── ui/             # Shadcn UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page Views (13 pages)
│   │   ├── services/           # API Clients (8 services)
│   │   └── types/              # TypeScript type definitions
│   └── e2e/                    # Playwright E2E tests
├── docs/                       # Project documentation
├── scripts/                    # Utility Scripts
├── vector_db/                  # ChromaDB Storage
├── _bmad/                      # BMad methodology
├── _bmad-output/               # Planning artifacts (PRD, Epics, Brief)
├── ARCHITECTURE.md             # Architecture document
├── PROJECT_OVERVIEW.md         # Project overview
├── README.md                   # Main README
├── CLAUDE.md                   # AI agent configuration
└── wiki.md                     # This document

---

## 11. TÍNH NĂNG TƯƠNG LAI

### 11.1 Smart Teacher Comment Bank (Ngân hàng nhận xét thông minh)

> **Trạng thái:** Đã brainstorm — Chưa triển khai | **Ưu tiên:** Cao

#### Ý tưởng chính

Giúp giáo viên tạo, lưu, tái sử dụng và cá nhân hóa các **nhận xét học tập nội bộ** cho từng học sinh hoặc cả lớp. Trả lời câu hỏi: **"Tôi nên viết nhận xét gì cho học sinh này?"**

#### Giá trị giảm tải

Giáo viên tiểu học phải viết rất nhiều nhận xét nhưng dễ bị lặp lại, khó cá nhân hóa, và mất thời gian nghĩ câu chữ. Hệ thống tự động sinh nhận xét dựa trên dữ liệu thực tế của học sinh.

#### MVP Scope

**Tạo nhận xét cho từng học sinh — 3 phiên bản:**
- **Ngắn gọn:** Dùng cho sổ theo dõi nhanh
- **Chi tiết:** Dùng cho đánh giá định kỳ
- **Hành động tiếp theo:** Tập trung vào việc giáo viên nên làm gì

**Comment Bank theo mẫu:**
- Thư viện nhận xét có sẵn theo nhóm: Tiến bộ tốt, Cần luyện tính toán, Cần cải thiện đọc đề, Cần trình bày rõ hơn, Hay bỏ sót câu, Cần tự tin hơn, Cần thử thách thêm
- Mỗi mẫu được AI cá nhân hóa theo dữ liệu học sinh

**Nhận xét hàng loạt cho cả lớp:**
- Bảng nhận xét nháp cho từng học sinh với trạng thái và hành động
- Tất cả đều là bản nháp để giáo viên duyệt

#### Khác biệt với Portfolio

| Tiêu chí | Portfolio | Comment Bank |
|---|---|---|
| Câu hỏi trả lời | "Học sinh này đang học thế nào?" | "Tôi nên viết nhận xét gì?" |
| Thiên về | Dữ liệu, biểu đồ, tiến bộ | Câu chữ, nhận xét, mẫu đánh giá |
| Output | Dashboard cá nhân | Văn bản nhận xét |

#### Vì sao phù hợp

- **Không cần mở sang phụ huynh** — hoàn toàn nội bộ giáo viên
- **Tận dụng dữ liệu điểm/lỗi hiện tại**
- **Giảm việc viết lặp lại** — giá trị thực tế cao
- **Có thể làm module riêng** — không ảnh hưởng core hiện có

---

## 12. LỘ TRÌNH PHÁT TRIỂN

### 12.1 Giai đoạn hiện tại: Hoàn thiện MVP (Q1-Q2/2026)

| Mục tiêu | Trạng thái |
|---|---|
| Xóa bỏ mock data, đồng bộ OCR → Analytics | ✅ Hoàn thành |
| Answer Builder (không cần JSON) | ✅ Hoàn thành |
| Khóa chủ đề theo lớp | ✅ Hoàn thành |
| Hoàn thiện CRUD lớp/học sinh | ✅ Hoàn thành |
| PDF export thật (classroom + personalized) | ✅ Hoàn thành |
| Nâng cấp grading accuracy (typed comparator) | ✅ Hoàn thành |
| Xóa CPA feature | 📋 Đã lên kế hoạch |
| Mở rộng Bundle-v2 Phase 1 | 🔄 Đang triển khai |

### 12.2 Giai đoạn tiếp theo: Mở rộng giá trị (Q3-Q4/2026)

| Ưu tiên | Tính năng | Giá trị |
|---|---|---|
| 1 | **Smart Teacher Comment Bank** | Tự động hóa viết nhận xét |
| 2 | Hoàn thiện Clean Architecture migration | Nâng cao chất lượng code |
| 3 | Observability (logging, metrics, audit) | Monitoring & debugging |
| 4 | Integration test suite mở rộng | Đảm bảo chất lượng |

### 12.3 Tầm nhìn dài hạn (2027+)

- **Weekly Intervention Planner:** Kế hoạch phụ đạo theo tuần dựa trên hồ sơ tiến bộ
- **Báo cáo định kỳ tự động:** Tổng kết học kỳ, cuối năm
- **Mobile App:** Ứng dụng di động cho giáo viên
- **Multi-school Support:** Hỗ trợ quản lý nhiều trường

---

## 13. PHỤ LỤC

### 13.1 Tài khoản Demo

- **Giáo viên:** `teacher@demo.com` / `123456`

### 13.2 Các file tài liệu quan trọng

| File | Nội dung |
|---|---|
| `README.md` | Giới thiệu dự án, cài đặt, tech stack |
| `ARCHITECTURE.md` | Kiến trúc hệ thống chi tiết |
| `PROJECT_OVERVIEW.md` | Tổng quan dự án |
| `CLAUDE.md` | Cấu hình cho AI agents |
| `HUONG_DAN_CHAY.md` | Hướng dẫn chạy dự án |
| `HuongDanSuDungSkill.md` | Hướng dẫn sử dụng BMad skills |
| `_bmad-output/planning-artifacts/prd.md` | PRD giai đoạn 2 |
| `_bmad-output/planning-artifacts/epics.md` | Epics & Stories chi tiết |
| `_bmad-output/planning-artifacts/brief.md` | Product Brief |
| `_bmad-output/project-context.md` | Context cho AI agents |
| `docs/plans/2026-05-05-remove-cpa-feature.md` | Kế hoạch xóa CPA |

### 13.3 Các API endpoint chính

| Endpoint | Method | Chức năng |
|---|---|---|
| `/api/auth/login` | POST | Đăng nhập |
| `/api/auth/register` | POST | Đăng ký |
| `/api/classes` | GET/POST | Danh sách/Tạo lớp |
| `/api/classes/{id}` | GET/PUT/DELETE | Chi tiết/Sửa/Xóa lớp |
| `/api/classes/{id}/students` | GET/POST | Danh sách/Thêm học sinh |
| `/api/classes/{id}/students/upload` | POST | Import Excel học sinh |
| `/api/worksheets` | GET/POST | Danh sách/Tạo bài tập |
| `/api/worksheets/{id}/publish` | POST | Phát hành bài tập |
| `/api/ai/generate-differentiation` | POST | Sinh câu hỏi phân hóa |
| `/api/ai/grade-image` | POST | Chấm điểm ảnh |
| `/api/ai/analytics/{class_id}` | GET | Phân tích lỗi lớp |
| `/api/v1/ai/analytics/submit` | POST | Gửi error tags |
| `/api/v1/classes/{class_id}/student-portfolios` | GET | Danh sách portfolio học sinh theo lớp |
| `/api/v1/classes/{class_id}/students/{student_id}/portfolio` | GET | Chi tiết portfolio một học sinh |
| `/api/chat/send` | POST | Gửi tin nhắn chatbot |
| `/api/gradebook/{class_id}` | GET | Xem sổ điểm |
| `/api/dashboard` | GET | Thống kê dashboard |
| `/api/pdf/export` | POST | Xuất PDF |

### 13.4 Biến môi trường (`.env`)

| Biến | Mô tả |
|---|---|
| `DATABASE_URL` | Chuỗi kết nối database |
| `SECRET_KEY` | Khóa bảo mật JWT |
| `OLLAMA_API_BASE` | Ollama local API URL |
| `OLLAMA_TEXT_MODEL` | Model chấm bài local (`qwen2.5:3b`) |
| `OLLAMA_CLOUD_API_KEY` | API key Ollama Cloud |
| `OLLAMA_CLOUD_TEXT_MODEL` | Model sinh câu hỏi (`gemma3:12b`) |
| `OLLAMA_CLOUD_VISION_MODEL` | Model OCR (`gemma4:31b`) |
| `GEMINI_API_KEY` | API key Gemini |
| `GEMINI_MODEL` | Model chatbot (`gemini-2.5-flash`) |

### 13.5 Các model AI được phê duyệt

| Model | Môi trường | Vai trò | Kích thước |
|---|---|---|---|
| `gemma3:12b` | Ollama Cloud | Sinh câu hỏi phân hóa | 12B params |
| `qwen2.5:3b` | Ollama Local | Chấm bài text + giải thích | 3B params |
| `gemma4:31b` | Ollama Cloud | OCR nhận diện chữ viết tay | 31B params |
| `gemini-2.5-flash` | Gemini API | Chatbot trợ lý giáo viên | — |
| `vietnamese-sbert` | Local | Embeddings cho RAG | — |

### 13.6 Thuật ngữ

| Thuật ngữ | Giải thích |
|---|---|
| **Differentiation** | Phương pháp phân hóa bài tập theo năng lực học sinh |
| **RAG** | Retrieval-Augmented Generation — sinh nội dung có truy xuất ngữ cảnh |
| **OCR** | Optical Character Recognition — nhận diện chữ viết tay từ ảnh |
| **Clean Architecture** | Kiến trúc phân lớp: Interfaces → Application → Domain |
| **Human-in-the-loop** | Cơ chế bắt buộc có người (giáo viên) kiểm duyệt trước khi AI output được dùng |
| **Draft/Pending** | Trạng thái nháp của mọi nội dung do AI sinh ra |
| **Tier** | Cấp độ năng lực: foundation, standard, extension, advanced |
| **Bundle-v2** | Hệ thống sinh bài tập theo taxonomy/task-family |
| **Answer Builder** | UI form nhập đáp án thay cho JSON thô |

---

> **Tài liệu được biên soạn bởi AI Assistant dựa trên toàn bộ source code và documentation của dự án Smart-MathAI.**
>
> **Cập nhật lần cuối:** 08/05/2026
>
> **Tổng số trang ước tính:** 32-37 trang A4 (tương đương ~1,300 dòng markdown)
