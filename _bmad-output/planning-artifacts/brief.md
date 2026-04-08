# Product Brief: Smart-MathAI (Baseline & Giai đoạn 2)

## 1. Tóm tắt (Executive Summary)
**Smart-MathAI** là nền tảng SaaS trợ lý phân tích và ra đề môn Toán dành riêng cho Giáo viên Tiểu học (Khối 1-3).
Bản Product Brief này nhằm hai mục đích: (1) Chuẩn hóa lại toàn bộ bối cảnh dự án đã xây dựng (Backend Hexagonal, RAG, Frontend React) và (2) Xác định rõ các "lỗ hổng" hiện tại cần phải ưu tiên giải quyết ngay: Thay thế toàn bộ dữ liệu giả (mock data) trên Dashboard bằng việc nối ống dữ liệu từ AI OCR Grade, và thiết kế lại hoàn toàn chất lượng UI/UX cho tính năng xuất PDF.

## 2. Vấn đề hiện tại (The Problem Space)
Hệ thống hiện tại đã có bộ khung kiến trúc cực kỳ chuẩn mực, nhưng trải nghiệm thực tế (End-to-End User Experience) đang bị đứt gãy ở những chặng cuối cùng:
1. **Đứt gãy luồng dữ liệu phân tích:** Mặc dù mô hình AI OCR (`glm-ocr`) đã chấm bài và phân tích được lỗi sai từ ảnh chụp bài làm, dữ liệu này lại không được đẩy thẳng vào Database phân tích. Hậu quả là Teacher Dashboard hiện tại hiển thị phân tích lỗi dựa trên Mock Data vô nghĩa.
2. **Thiết kế xuất bản (PDF) kém thẩm mỹ:** Tính năng xuất PDF hiện đã chạy được, tuy nhiên giao diện thô cứng, vỡ layout và không đạt chuẩn thẩm mỹ khắt khe của một sản phẩm giáo dục cao cấp cho trẻ em (thiếu tính đồng bộ CPA, căn lề và định dạng chưa tốt).

## 3. Tầm nhìn & Mục tiêu sắp tới
**Tầm nhìn:** Tạo ra một vòng lặp hoàn hảo: Tự động ra đề (CPA) -> Giáo viên in file PDF siêu đẹp -> Học sinh làm bài -> Chụp ảnh -> AI tự chấm và đẩy kết quả phân tích lỗi lên Dashboard để có chiến lược kèm cặp tiếp theo.

**Mục tiêu (Goals) cho Giai đoạn này:**
- Nối thành công luồng dữ liệu: Đưa kết quả phân tích lỗi từ `AI Grading UseCase` vào DB Thống kê, hiển thị Real-time trên Dashboard.
- Nâng cấp triệt để giao diện PDF (Classroom PDF & Home PDF) đạt chuẩn in ấn sách giáo khoa.

## 4. Đối tượng phục vụ (Target Audience)
- **Giáo viên (End-User chính):** Cần giao diện bảng điều khiển số liệu chính xác để theo dõi năng lực học sinh, và cần xuất file PDF đẹp để phát trên lớp.
- **Phụ huynh (End-User tiêu thụ):** Cần nhận được PDF kèm "Cẩm nang hướng dẫn" in rõ ràng, bắt mắt.

## 5. Phạm vi (Scope)
- **Trong phạm vi thực hiện (In-Scope):** Tích hợp logic lưu trữ Data Analytics, cập nhật UI/UX hiển thị Dashboard, thiết kế lại cấu trúc HTML/CSS cho bản in PDF.
- **Ngoài phạm vi (Out-of-Scope - cấm vi phạm):** Tự động phát hành bài tập mà không cần Giáo viên duyệt (No Autonomous AI). Nâng cấp sang lớp 4-5.
