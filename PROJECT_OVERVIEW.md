# TÀI LIỆU TỔNG QUAN DỰ ÁN SMART-MATHAI

## 1. Tên dự án
**Smart-MathAI** (Hệ thống gia sư toán AI)

## 2. Tổng quan dự án
Smart-MathAI là hệ thống nền tảng giáo dục số, hỗ trợ dạy và học Toán tiểu học dành riêng cho khối Lớp 1 - Lớp 3. Dự án tuân thủ nghiêm ngặt chương trình Giáo dục phổ thông (GDPT) 2018 của Bộ Giáo dục & Đào tạo Việt Nam. 
Hiện tại hệ thống đã chuyển mình qua giai đoạn MVP và đang tích hợp sâu AI vào lõi hệ thống. Tuy nhiên, nguyên tắc tối thượng vẫn được giữ vững: **AI chỉ đóng vai trò trợ lý (Assistive AI), mọi kết quả sinh ra đều phải ở trạng thái Nháp (Draft/Pending) và bắt buộc phải có sự phê duyệt của Giáo viên (Human-in-the-loop) trước khi phát hành.**

## 3. Mục đích sản phẩm
Sản phẩm được xây dựng để nhằm giải quyết các bài toán về thời gian, chất lượng và phương pháp đồng hành cùng trẻ:
- **Đối với Giáo viên:** Tự động hóa quá trình sinh đề bài tập phân hóa, chấm điểm thông minh qua ảnh chụp giúp tiết kiệm 80% thời gian biên soạn.
- **Đảm bảo tính an toàn:** Học sinh hoàn toàn không được quyền truy cập vào các công cụ sinh bằng AI, đảm bảo một lộ trình giáo dục chuẩn định hướng.

## 4. Tính năng cốt lõi (Trạng thái 2026)
- **Hệ thống phân quyền (Role-based):** Chỉ có Teacher (Người tạo/Quản lý). Mọi API sinh AI đều yêu cầu xác thực giáo viên.
- **Trình sinh bài tập phân hóa:** Quy trình sinh bài tập theo 4 cấp độ năng lực, thay thế cho việc sinh câu hỏi text rời rạc.
- **Quy trình xuất bản được kiểm soát (Publishing Workflow):** `GenerateDifferentiationDraftUseCase` tạo ra bản nháp -> Giáo viên kiểm tra/chỉnh sửa -> `PublishWorksheetUseCase` phát hành.
- **Chấm bài tự động (AI Grading với OCR):** Giáo viên đẩy ảnh chụp -> Bóc tách bởi OCR -> Giáo viên Validate lại -> Lưu trữ.
- **Bảo mật phiên làm việc (Auth Session):** Chuyển dịch hoàn toàn sang xác thực bằng HTTP-Only Cookie thay cho LocalStorage để tăng cường bảo mật XSS.

## 5. Kiến trúc tổng thể (Clean Architecture / Hexagonal Framework)
Cả Frontend và Backend đều đang trong quá trình chuyển đổi toàn diện sang kiến trúc phân lớp (Feature-Sliced/Clean Architecture):
- **Backend Hierarchy:** `interfaces -> application -> domain`. Các logic nghiệp vụ lõi (như quy tắc phê duyệt Giáo viên) được cô lập tại lớp `domain` và `use_cases`. DB hay AI chỉ là các module (adapters) gắn qua `infrastructure`.
- **Frontend Hierarchy:** Chuyển từ quản lý trạng thái hỗn độn sang sử dụng `TanStack Query` dưới dạng Server State ở root, đồng thời chia tách UI thành `features`, `entities`, `widgets`. Mọi giao tiếp với Backend đều tự động dùng `credentials: include`.

## 6. Công nghệ sử dụng
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Build bằng Vite. Quản lý trạng thái bằng TanStack Query v5. UI sử dụng Shadcn/UI (Radix UI) và Recharts. Test E2E bằng Playwright.
- **Backend:** Python 3.10+ kết hợp FastAPI, SQLAlchemy (ORM).
- **Cơ sở dữ liệu:** Thao tác thông qua Repository Pattern để không lệ thuộc vào framework.
- **Vector Storage:** ChromaDB.

## 7. AI Module & RAG Pipeline
Kiến trúc AI hiện tại kết hợp local grading + cloud generation + cloud OCR:
- **`gemma3:12b` (Cloud Question Gen):** Mô hình sinh câu hỏi phân hóa theo năng lực qua Ollama Cloud API.
- **`qwen2.5:3b` (Local):** Mô hình text local qua Ollama, đảm nhận chấm bài text reasoning và giải thích bài.
- **`gemma4:31b` (Cloud OCR):** Mô hình OCR trên Ollama Cloud để bóc tách điểm số và nội dung từ ảnh chụp bài làm.
- **`vietnamese-sbert`:** Xử lý nhúng độc lập.
- **RAG System:** Tuân thủ phân lập dữ liệu nghiêm ngặt theo Grades (Lớp 1 không được lẫn RAG của Lớp 3) để tránh tình trạng sinh logic quá tầm hiểu biết của lứa tuổi.

## 8. Phương pháp giáo dục áp dụng
- **Differentiation 4 cấp độ:** Foundation (Nền tảng), Standard (Chuẩn), Extension (Mở rộng) và Advanced (Nâng cao).
- **Sư phạm tiểu học nhi đồng:** Nghiêm cấm giải toán bằng đại số, quy trình sinh phải mô phỏng đồ vật thủ công.
