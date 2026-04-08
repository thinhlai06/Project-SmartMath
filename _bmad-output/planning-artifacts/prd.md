# Product Requirements Document (PRD): Smart-MathAI (Giai đoạn 2)

## 1. Siêu dữ liệu (Meta)
- **Dự án:** Smart-MathAI
- **Trạng thái:** Triển khai (In Progress)
- **Trọng tâm (Focus):** Xóa bỏ Mock-data (Phân hóa AI, Dashboard), Đồng bộ luồng phân tích OCR & Nâng cấp UI/UX Xuất bản PDF.

## 2. Tổng quan Sản phẩm
PRD này đặc tả phần còn dang dở của hệ thống Smart-MathAI. Hệ thống nền tảng (Base System) gồm Backend Architecture và AI Setup đã hoàn thiện. Các Epic dưới đây sẽ tập trung vào việc vá các lỗ hổng trải nghiệm để dự án có thể chạy trơn tru từ đầu tới cuối.

## 3. Epics & User Stories

### Epic 1: Xóa bỏ dữ liệu giả - Đồng bộ dữ liệu AI OCR & Analytics Dashboard
*Thực trạng: Dashboard hiển thị Mock Data. AI chấm điểm ảnh xong bị "mất hút" phần phân tích lỗi, không đẩy vào db.*
- **Story 1.1 (Backend):** Là một hệ thống, khi AI chấm điểm xong (OCR), tôi phải lưu các trường `loại lỗi` (sai logic, sai tính toán, bỏ trống) vào bảng `StudentAnalytics` (hoặc tương đương) ở tầng Domain thay vì chỉ bóc chữ thuần túy.
- **Story 1.2 (Frontend):** Là một Giáo viên, tôi muốn Dashboard kết nối trực tiếp với endpoint Analytics mới để biểu đồ thống kê các lỗi thường gặp của học sinh biến động dựa trên dữ liệu thật (Real-time).
- **Story 1.3 (Flow):** Là Giáo viên, khi duyệt kết quả OCR, tôi phải thấy được giao diện tóm tắt AI đã gán nhãn bài này mắc "Lỗi gì" để tôi có thể chỉnh sửa dán nhãn lại (Validates) trước khi Submit vào Dashboard chung.

### Epic 2: Nâng cấp Toàn diện Trải nghiệm Xuất PDF (PDF Export Perfection)
*Thực trạng: Xuất PDF được nhưng giao diện vỡ, lỗi font và rất xấu.*
- **Story 2.1 (Classroom PDF Template):** Là một Giáo viên, tôi muốn bản in PDF cho lớp học phải có Layout căn chỉnh chính xác lề A4, font chữ tiếng Việt cho trẻ em (Ví dụ: Roboto, Inter hoặc font đặc thù), icon/hình vẽ bài tập CPA hiển thị nét (không bị vỡ pixel) và QR code được sắp xếp thẳng hàng.
- **Story 2.2 (Parent/Home PDF Template):** Là Phụ huynh, tôi muốn bản in của con có khối (block) Layout tách biệt rạch ròi: "Bài tập của con" và "Cẩm nang hướng dẫn cho mẹ" (Màu sắc và viền bo góc rõ ràng khi in).
- **Story 2.3 (System):** Refactor lại công nghệ in ấn bên Frontend (sử dụng Tailwind Print modifiers chuyên sâu `@media print`, hoặc tích hợp thư viện Render React2PDF) để đảm bảo trình duyệt tự động ngắt trang (page-break) đúng vị trí, không bị cắt đứt nửa một bài toán.

### Epic 3: Xóa bỏ dữ liệu giả - Luồng Phân hóa AI (Differentiation Component)
*Thực trạng: Component `DiffStep2Assignment.tsx` đang sử dụng file hardcode `MOCK_STUDENTS`.*
- **Story 3.1:** Là Giáo viên, tôi muốn khi mở tính năng Sinh đề Phân hóa, màn hình sẽ list ra đúng danh sách các học sinh có thật đang học trong lớp của mình thay vì data giả.
- **Story 3.2:** Dựa trên điểm số trung bình thực của từng học sinh (Analytics), hệ thống tự động gợi ý xếp học sinh đó vào nhóm Foundation, Standard, Extension hay Advanced hợp lý. Mảng UI xóa sổ hoàn toàn thư mục `mockData`.

### Epic 4: Baseline Hệ Sinh Thái Giáo Dục (Đã có - Tiếp tục duy trì)
- **Story 4.1:** Luôn ép dữ liệu sinh ra bởi RAG / GenAI ở chế độ Nháp `Draft/Pending`. Giáo viên duyệt xong chuyển status sang `Published`.

## 4. Yêu cầu Phi chức năng (Non-Functional Requirements)
- **Architecture Compliance:** Mọi Endpoint update dữ liệu OCR vào Dashboard phải đi đúng layer: `Router -> Use Case -> Repo/Domain`. Cấm viết UPDATE query trực tiếp trong endpoint AI.
- **Performance:** Thao tác tạo PDF cho một lớp 40 khối con không được làm treo trình duyệt. Rendering engine xử lý bất đồng bộ.

## 5. Quy tắc Ràng buộc (Domain Constraints)
- **Chỉ toán lớp 1-3:** AI OCR Analytics Label không được sử dụng các thuật ngữ quá tầm (như: "Học sinh giải sai phương trình bậc nhất"), mà phải dùng từ ngữ khối tiểu học ("Học sinh đếm sai vật thế", "Cộng sai có nhớ").

## 6. Success Metrics (Thước đo thành công)
- Dashboard trả về Code 200 từ Backend, Fetch ra dữ liệu lỗi thực sự thay cho Mock Data. Hệ thống xóa vĩnh viễn các file mock analytics cứng trong Frontend.
- PDF in ra trực quan, đẹp mắt, ngắt trang hoàn hảo.
