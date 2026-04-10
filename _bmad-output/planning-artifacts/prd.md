# Product Requirements Document (PRD): Smart-MathAI (Giai đoạn 2)

## 1. Siêu dữ liệu (Meta)
- **Dự án:** Smart-MathAI
- **Trạng thái:** Triển khai (In Progress)
- **Trọng tâm (Focus):** Xóa bỏ Mock-data, nâng độ tin cậy OCR grading, khóa chủ đề theo lớp, mở rộng Bundle-v2, chuẩn hóa PDF export thật và hoàn thiện CRUD lớp.

## 2. Tổng quan Sản phẩm
PRD này đặc tả phần còn dang dở của hệ thống Smart-MathAI. Hệ thống nền tảng (Base System) gồm Backend Architecture và AI Setup đã hoàn thiện. Các Epic dưới đây sẽ tập trung vào việc vá các lỗ hổng trải nghiệm để dự án có thể chạy trơn tru từ đầu tới cuối.

## 3. Epics & User Stories

### Epic 1: Xóa bỏ dữ liệu giả - Đồng bộ dữ liệu AI OCR & Analytics Dashboard
*Thực trạng: Dashboard hiển thị Mock Data. AI chấm điểm ảnh xong bị "mất hút" phần phân tích lỗi, không đẩy vào db.*
- **Story 1.1 (Backend):** Là một hệ thống, khi AI chấm điểm xong (OCR), tôi phải lưu các trường `loại lỗi` (sai logic, sai tính toán, bỏ trống) vào bảng `StudentAnalytics` (hoặc tương đương) ở tầng Domain thay vì chỉ bóc chữ thuần túy.
- **Story 1.2 (Frontend):** Là một Giáo viên, tôi muốn Dashboard kết nối trực tiếp với endpoint Analytics mới để biểu đồ thống kê các lỗi thường gặp của học sinh biến động dựa trên dữ liệu thật (Real-time).
- **Story 1.3 (Flow):** Là Giáo viên, khi duyệt kết quả OCR, tôi phải thấy được giao diện tóm tắt AI đã gán nhãn bài này mắc "Lỗi gì" để tôi có thể chỉnh sửa dán nhãn lại (Validates) trước khi Submit vào Dashboard chung.

### Epic 2: Nâng cấp Toàn diện Trải nghiệm Xuất PDF (PDF Export Perfection)
*Thực trạng: Có luồng in popup nhưng chưa đồng bộ hành vi tải PDF thật và layout in cần nâng chất lượng.*
- **Story 2.1 (Classroom PDF Template):** Là một Giáo viên, tôi muốn bản in PDF cho lớp học có layout chuẩn A4, font tiếng Việt rõ nét cho trẻ em, icon CPA không vỡ và QR code thẳng hàng.
- **Story 2.2 (Parent/Home PDF Template):** Là Phụ huynh, tôi muốn bản in của con có khối layout tách biệt "Bài tập của con" và "Cẩm nang hướng dẫn cho mẹ" rõ ràng khi in.
- **Story 2.3 (System - Print):** Duy trì quick print trong editor bằng Tailwind `@media print`, bảo đảm page-break không cắt nửa bài toán.
- **Story 2.4 (System - Download):** Từ modal export, cả hai mode Classroom và Personalized phải tải file PDF thật (không dùng alert/mock flow).

### Epic 3: Xóa bỏ dữ liệu giả - Luồng Phân hóa AI (Differentiation Component)
*Thực trạng: Component `DiffStep2Assignment.tsx` đang sử dụng file hardcode `MOCK_STUDENTS`.*
- **Story 3.1:** Là Giáo viên, tôi muốn khi mở tính năng Sinh đề Phân hóa, màn hình sẽ list ra đúng danh sách các học sinh có thật đang học trong lớp của mình thay vì data giả.
- **Story 3.2:** Dựa trên điểm số trung bình thực của từng học sinh (Analytics), hệ thống tự động gợi ý xếp học sinh đó vào nhóm Foundation, Standard, Extension hay Advanced hợp lý. Mảng UI xóa sổ hoàn toàn thư mục `mockData`.

### Epic 4: Khóa Chủ Đề Theo Lớp + Mở rộng Bundle-v2
*Thực trạng: Một số luồng vẫn có nguy cơ trộn topic khác khối; bundle-v2 coverage chưa đủ theo kế hoạch Phase 1.*
- **Story 4.1 (Frontend Topic Lock):** Là Giáo viên, khi chọn lớp, tôi chỉ thấy topic đúng khối của lớp đó (không lẫn lớp 1/2/3).
- **Story 4.2 (Bundle-v2 Taxonomy):** Là hệ thống, tôi cần route topic theo taxonomy/task-family bền vững, giảm phụ thuộc keyword mong manh.
- **Story 4.3 (Bundle-v2 Coverage Phase 1):** Mở rộng hỗ trợ nhóm division split (có dư/không dư phù hợp) và number-sense trong phạm vi deterministic generation.
- **Story 4.4 (Fallback Semantics):** Khi vượt phạm vi hỗ trợ, hệ thống trả lý do rõ ràng và fallback an toàn (không im lặng thất bại).

### Epic 5: Cải thiện độ chính xác Chấm bài qua ảnh + Answer Builder
*Thực trạng: Bài gần đúng có thể bị chấm sai do so khớp chuỗi đơn giản; giáo viên phải nhập JSON thô gây ma sát.*
- **Story 5.1 (UX):** Giáo viên nhập đáp án bằng Answer Builder theo từng câu, không phải nhập JSON.
- **Story 5.2 (Schema):** Backend tự convert UI answer model sang internal answer schema JSON có cấu trúc để lưu và chấm.
- **Story 5.3 (Rule-based Grading):** Mỗi câu có `loại câu`, `đáp án đúng`, `điểm`, `rule chấm`; hỗ trợ V1 types: `numeric`, `ordered_list`, `unordered_list`, `multi_blank`, `boolean`.
- **Story 5.4 (Per-question Rule):** Với dạng danh sách, giáo viên chọn rule theo từng câu (`all_or_nothing` hoặc `per_item`).
- **Story 5.5 (Regression case):** Trường hợp kỳ vọng `1,2,3,4,5` mà học sinh ghi `1,2,3,5` không được chấm 10/10.

### Epic 6: Hoàn thiện CRUD Quản trị lớp/học sinh
*Thực trạng: API đã có nhưng UI chưa đầy đủ ở cả trang danh sách lớp và chi tiết lớp.*
- **Story 6.1 (Class Edit/Delete in ClassesPage):** Cho phép sửa/xóa lớp trực tiếp từ danh sách lớp.
- **Story 6.2 (Class Edit/Delete in ClassDetailPage):** Cho phép sửa/xóa lớp ngay tại trang chi tiết lớp.
- **Story 6.3 (Student Edit):** Cho phép sửa thông tin học sinh trong danh sách học sinh lớp.
- **Story 6.4 (Grade-change Safety):** Khi sửa khối lớp, phải có cảnh báo xác nhận mạnh trước khi lưu.

### Epic 7: Baseline Hệ Sinh Thái Giáo Dục (Đã có - Tiếp tục duy trì)
- **Story 7.1:** Luôn ép dữ liệu sinh ra bởi RAG / GenAI ở chế độ Nháp `Draft/Pending`. Giáo viên duyệt xong chuyển status sang `Published`.

## 4. Yêu cầu Phi chức năng (Non-Functional Requirements)
- **Architecture Compliance:** Mọi Endpoint update dữ liệu OCR vào Dashboard phải đi đúng layer: `Router -> Use Case -> Repo/Domain`. Cấm viết UPDATE query trực tiếp trong endpoint AI.
- **Performance:** Thao tác tạo PDF cho một lớp 40 học sinh không được làm treo trình duyệt. Rendering engine xử lý bất đồng bộ.
- **Grading Reliability:** Engine chấm dạng list/multi-blank phải cho kết quả ổn định, tránh false-positive full score.
- **Backward Compatibility:** Trong giai đoạn migration, endpoint chấm ảnh phải hỗ trợ cả payload mới (Answer Builder) và đường cũ `correct_answers_json`.

## 5. Quy tắc Ràng buộc (Domain Constraints)
- **Chỉ toán lớp 1-3:** AI OCR Analytics Label không được sử dụng các thuật ngữ quá tầm (như: "Học sinh giải sai phương trình bậc nhất"), mà phải dùng từ ngữ khối tiểu học ("Học sinh đếm sai vật thế", "Cộng sai có nhớ").
- **Teacher-in-the-loop:** Mọi output AI (bao gồm chấm ảnh) là bản nháp review được, không tự động coi là quyết định cuối cùng mà bỏ qua quyền giáo viên.
- **Model Constraints:** Chỉ dùng các model đã phê duyệt trong dự án.

## 6. Success Metrics (Thước đo thành công)
- Dashboard trả về Code 200 từ Backend, Fetch ra dữ liệu lỗi thực sự thay cho Mock Data. Hệ thống xóa vĩnh viễn các file mock analytics cứng trong Frontend.
- PDF in ra trực quan, đẹp mắt, ngắt trang hợp lý, và modal export tải file PDF thật cho cả Classroom + Personalized.
- 100% flow chấm ảnh giáo viên có thể thao tác mà không cần nhập JSON.
- Case list thiếu phần tử không còn bị chấm full điểm.
- Luồng sinh đề không còn hiển thị topic sai khối lớp.
- CRUD lớp/học sinh hoạt động đầy đủ ở cả trang danh sách lớp và trang chi tiết lớp.
