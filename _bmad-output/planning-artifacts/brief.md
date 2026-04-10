# Product Brief: Smart-MathAI (Baseline & Giai đoạn 2 Mở rộng)

## 1. Tóm tắt (Executive Summary)
**Smart-MathAI** là nền tảng SaaS trợ lý phân tích và ra đề môn Toán dành riêng cho Giáo viên Tiểu học (Khối 1-3).

Giai đoạn này tập trung hoàn thiện toàn bộ vòng lặp vận hành thật (không mock) và giảm ma sát cho giáo viên trong các tác vụ hằng ngày:
1. Đồng bộ luồng OCR -> Analytics Dashboard bằng dữ liệu thật.
2. Nâng cấp trải nghiệm xuất PDF theo hai hướng đồng thời: in nhanh trong editor và tải file PDF thật từ modal export.
3. Cải thiện độ chính xác chấm bài qua ảnh bằng Answer Builder (không yêu cầu giáo viên nhập JSON).
4. Khóa chủ đề theo khối lớp, mở rộng Bundle-v2 Phase 1, hoàn thiện CRUD lớp/học sinh tại các màn hình quản trị lớp.

## 2. Vấn đề hiện tại (The Problem Space)
Hệ thống đã có nền tảng kiến trúc tốt nhưng còn các điểm đứt gãy trải nghiệm end-to-end:
1. **Analytics chưa nhất quán dữ liệu thật:** OCR grading có thể hoàn thành nhưng dashboard dễ lệch nếu pipeline submit/label chưa chuẩn hóa.
2. **Chấm ảnh còn false-positive:** Dạng đáp án danh sách hoặc nhiều ô trống có thể bị chấm sai do so khớp chuỗi đơn giản.
3. **UX nhập đáp án gây ma sát:** Giáo viên phải nhập JSON thô thay vì nhập bằng form nghiệp vụ.
4. **Topic theo lớp chưa khóa triệt để:** Một số luồng vẫn có nguy cơ trộn chủ đề lớp 1-2-3.
5. **Bundle-v2 coverage còn hẹp:** Chưa bao phủ đủ nhóm bài trong phạm vi roadmap Phase 1.
6. **Xuất PDF chưa thống nhất hành vi:** Có luồng in popup nhưng chưa tải file thật ở một số đường đi.
7. **CRUD lớp/học sinh chưa hoàn thiện tại UI:** Còn thiếu hoặc chưa đồng đều giữa trang danh sách lớp và trang chi tiết lớp.

## 3. Tầm nhìn & Mục tiêu sắp tới
**Tầm nhìn:** Xây vòng lặp khép kín, vận hành ổn định cho giáo viên Tiểu học:
Tạo bài tập -> Xuất bản in đẹp/tải file thật -> Học sinh làm bài -> Chụp ảnh -> AI chấm có cấu trúc -> Giáo viên review -> Dashboard phản ánh lỗi thật theo lớp.

**Mục tiêu (Goals) giai đoạn này:**
1. Dashboard và analytics dùng dữ liệu thật, loại bỏ hoàn toàn mock liên quan.
2. PDF có hai trải nghiệm rõ ràng:
	 - In nhanh trong editor (print CSS).
	 - Tải file PDF thật từ modal (classroom + personalized).
3. Teacher không cần nhập JSON khi chấm ảnh; Answer Builder tự convert sang internal schema JSON.
4. Giảm lỗi chấm sai cho bài gần đúng (đặc biệt list/multi-blank) bằng rule per-question.
5. Khóa chủ đề theo lớp, mở rộng Bundle-v2 Phase 1 theo taxonomy bền vững.
6. Hoàn thiện class CRUD và student edit ở cả trang danh sách lớp và chi tiết lớp.

## 4. Đối tượng phục vụ (Target Audience)
- **Giáo viên (End-User chính):** Cần quy trình tạo đề, in/tải bài, chấm ảnh và theo dõi lỗi học sinh nhanh, chính xác, không phải thao tác kỹ thuật (nhập JSON).
- **Phụ huynh (End-User tiêu thụ):** Cần bản in rõ ràng, dễ dùng tại nhà, có hướng dẫn phù hợp.

## 5. Phạm vi (Scope)
- **Trong phạm vi thực hiện (In-Scope):**
	- Pipeline OCR analytics dữ liệu thật.
	- Answer Builder + structured grading schema (numeric, ordered/unordered list, multi-blank, boolean).
	- Khóa topic theo grade lớp và mở rộng Bundle-v2 Phase 1.
	- PDF real download từ modal + print aesthetic trong editor.
	- Hoàn thiện CRUD lớp/học sinh trong luồng teacher.
- **Ngoài phạm vi (Out-of-Scope):**
	- Auto-publish nội dung AI không qua giáo viên duyệt.
	- Mở rộng ngoài toán lớp 1-3.
	- Bổ sung model AI ngoài danh sách đã phê duyệt.
