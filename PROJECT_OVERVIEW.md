# TÀI LIỆU TỔNG QUAN DỰ ÁN SMART-MATHAI

## 1. Tên dự án
**Smart-MathAI** (Hệ thống gia sư toán AI - MVP Project)

## 2. Tổng quan dự án
Smart-MathAI là hệ thống nền tảng giáo dục số, hỗ trợ dạy và học Toán tiểu học dành riêng cho khối Lớp 1 - Lớp 3. Dự án tuân thủ nghiêm ngặt chương trình Giáo dục phổ thông (GDPT) 2018 của Bộ Giáo dục & Đào tạo Việt Nam. Được phát triển theo chiến lược "MVP-first" (Ưu tiên các tính năng quản lý cốt lõi trước khi tích hợp AI), Smart-MathAI định vị AI chỉ đóng vai trò trợ lý (Assistive AI), chịu sự giám sát tuyệt đối của con người, không hoạt động tự trị (Autonomous).

## 3. Mục đích sản phẩm
Sản phẩm được xây dựng để nhằm giải quyết các bài toán về thời gian, chất lượng và phương pháp đồng hành cùng trẻ:
- **Đối với Giáo viên:** Tiết kiệm đến 80% thời gian biên soạn giáo án, ra đề thi, chấm điểm thủ công và phân tích học lực học sinh.
- **Đối với Phụ huynh:** Cung cấp công cụ theo dõi tiến độ cụ thể của con; nhận tài liệu ôn luyện được cá nhân hóa; đồng thời được hướng dẫn cách dạy con học chuẩn sư phạm (không bị sai lệch phương pháp).
- **Tính An toàn GD:** Giải quyết nguyên triệt để thực trạng "AI đi giải bài hộ học sinh", duy trì môi trường giáo dục có định hướng.

## 4. Tính năng cốt lõi
Giai đoạn MVP (Chưa có AI) và kiến trúc tổng thể bao gồm các tính năng chính:
- **Hệ thống phân quyền (Role-based):** Quản lý luồng truy cập và dữ liệu độc lập, nghiêm ngặt cho 2 vai trò: Giáo viên (Teacher) và Phụ huynh (Parent).
- **Quản lý học liệu (Worksheet Management):** Thực hiện quy trình CRUD đối với bài tập (tạo mới, lưu nháp, chỉnh sửa, nhân bản, phát hành cho phụ huynh). 
- **Phân hóa đa cấp độ (Differentiation):** Thiết lập bài tập chuyên sâu theo 4 mức độ cho từng năng lực học sinh.
- **Xuất PDF thông minh:**
  - *Classroom PDF:* Tối ưu in ấn cho cả lớp với mã QR định danh từng học sinh.
  - *Personalized Home-PDF:* In bài tập lấp lỗ hổng cá nhân chuẩn hóa kèm "Cẩm nang hướng dẫn" cho phụ huynh.
- **Đánh giá và Thống kê:** Ghi nhận thành tích, phân tích báo cáo (Bảng điều khiển cho giáo viên và lộ trình tiến độ cho phụ huynh).

## 5. Kiến trúc sử dụng
Hệ thống được thiết kế theo tư tưởng Clean Architecture & MVC pattern, đảm bảo dễ dàng mở rộng khi plug-in AI vào sau này:
- **Client-Server Hierarchy:** Tách biệt rõ ràng giao diện hiển thị (Frontend) và xử lý logic (Backend).
- **Tách biệt Business Logic:** Backend được cấu trúc theo dạng "Fat Services/Models, Skinny Routers". Mọi tính toán logic nghiệp vụ DB đều được đẩy vào lớp `services`, giúp Router chỉ nhận nhiệm vụ trung chuyển data.
- **Tách biệt AI Module:** Logic kết nối AI được gom nhóm độc lập (`app/services/ai/`), tuân thủ chuẩn Interface, đáp ứng việc tích hợp/thay thế hạ tầng AI mà không phá hỏng MVP.

## 6. Công nghệ sử dụng
Dự án được triển khai với bộ Tech Stack mạnh mẽ và thông dụng:
- **Frontend (UI/UX):** React 18, TypeScript, Tailwind CSS v4, Build bằng Vite. Tích hợp thư viện Shadcn/UI (Components) và Recharts (Vẽ biểu đồ phân tích).
- **Backend (API):** Python 3.10+ kết hợp FastAPI (Asynchronous Framework), SQLAlchemy (ORM).
- **Database:** PostgreSQL/SQLite quản lý thông tin quan hệ dữ liệu hệ thống.
- **AI/Vector Storage:** LangChain Framework và ChromaDB (Cho Vector DB rẽ nhánh).

## 7. AI sử dụng
Ứng dụng hoàn toàn các mô hình mã nguồn mở chạy Local-hosting (thông qua môi trường LMStudio) nhằm tối ưu chi phí học đường và bảo vệ 100% dữ liệu riêng tư học sinh:
- **`qwen2.5-1.5b-instruct`:** Đảm nhận sinh (Generate) câu hỏi bài toán, soạn thảo lời giải thích từng bước cho phụ huynh. (Bị khống chế Prompt bắt buộc sinh ra ngôn ngữ Tiếng Việt, đơn giản gọn gàng cấp lớp 1-3).
- **`keepitreal/vietnamese-sbert`:** Chuyên môn hóa xử lý nhúng (Embeddings) dữ liệu tiếng Việt phục vụ quá trình RAG. Không sinh text.
- **`PaddlePaddle/PaddleOCR-VL-1.5-GGUF`:** Đảm nhận nhận diện chữ viết tay từ ảnh chụp bài làm (OCR Workflow).

## 8. Hệ thống RAG (Retrieval-Augmented Generation)
Hệ thống RAG đảm bảo **Curriculum Grounding** (Tuân thủ triệt để khung chương trình giáo dục):
- **Cơ chế hoạt động:** Các nguồn sách giáo khoa (SGK), sách giáo viên (SGV) PDF đã được xử lý Vector hoá từ trước (Injected) và lưu trong kho ChromaDB.
- **Quy trình chuẩn hóa:** Khi Giáo viên ấn nút "Tạo đề toán bằng AI", Pipeline sẽ gọi mô hình `vietnamese-sbert` để truy vấn nội dung tương ứng trong Vector DB, sau đó cung cấp "ngữ cảnh chuẩn" (Context) cho mô hình `Qwen` kèm theo (Khối lớp, Chủ đề, Độ khó).
- **Đầu ra:** Bản Nháp (Draft) bài tập bám sát thực tiễn Việt Nam, sau đó phải có Giáo viên xem xét, chỉnh sửa và Approve mới được lưu trữ cho phụ huynh xem.

## 9. Phương pháp giáo dục sử dụng
Hệ thống được tinh chỉnh dựa trên các nền tảng khoa học giáo dục thực chứng:
- **Phương pháp CPA (Concrete - Pictorial - Abstract):** Tư duy hệ thống Toán học Singapore đi từ "Cụ thể" (đời sống) -> "Hình ảnh" (sơ đồ) -> "Trừu tượng" (phép tính toán học).
- **Differentiation 4 cấp độ:** Phân loại và tiếp cận học sinh trải đều Vùng phát triển gần (ZPD) theo năng lực: Foundation (Nền tảng), Standard (Chuẩn), Extension (Mở rộng) và Advanced (Nâng cao).
- **Sư phạm tiểu học không dùng (x):** Giới hạn cách AI và Hệ thống lý giải công thức, giải pháp hoàn toàn phù hợp đúng kỹ năng nhận thức lứa tuổi nhi đồng mà không cưỡng ép bằng phương trình đại số.

## 10. Luồng User như thế nào (User Flow)
Dự án có 2 luồng trải nghiệm độc lập dựa trên việc phân quyền cụ thể:

**Luồng của Giáo viên (Teacher Flow):**
1. Đăng nhập hệ thống -> Truy cập `Teacher Dashboard` theo dõi phân tích lỗi chung.
2. Thiết kế bài học thông qua trình tạo thủ công đa cấp độ (`Differentiation`) HOẶC Sinh bằng AI dựa trên SGK. Mọi bản nháp AI sinh ra đều yêu cầu giáo viên rà soát.
3. Xuất tài liệu (`PDF Export`) theo thiết lập cá nhân cho học sinh yếu hoặc cho toàn lớp (đính kèm QR).
4. Khi quá trình giao bài diễn ra -> Giáo viên nhận ảnh chụp -> Đẩy vào `AI Grading` (OCR bóc tách chữ tay) -> Giáo viên Validates xác nhận lại đúng/sai OCR -> Cập nhật Database tiến độ học tập.

**Luồng của Phụ huynh (Parent Flow):**
1. Đăng ký & Đăng nhập hệ thống -> Nhập "Mã lớp" để kết nối với lớp học của giáo viên quản lý -> Cập nhật `Parent Dashboard`.
2. Theo dõi tiến độ chủ điểm kỹ năng biểu diễn theo phần trăm, xem số sao/thành tích của con, đọc nhận xét từ giáo viên.
3. Chạy `Parent Solutions`: Nhận bài tập cho con bù đắp lỗ hổng. Quan trọng nhất, phụ huynh đọc được "Cẩm nang hướng dẫn giải bài cực kỳ đơn giản theo phương pháp CPA" - biết cách dùng ngôn từ đồ vật để giải thích cho con dễ hiểu nhất.

## 11. Tổng kết
**Smart-MathAI** không đi theo lối mòn của các ứng dụng Auto-Solver (Chatbot giải toán tự động). Đây là một nền tảng quy mô MVP hoàn mỹ được thiết kế với sự kết nối mật thiết giữa "Công nghệ" và "Sư phạm". Tôn chỉ của dự án là lấy Giáo viên làm trung tâm của quyền lực xét duyệt, đưa AI trở thành thứ công cụ đắc lực hỗ trợ tự động hóa các khâu tốn thời gian (soạn đề, chấm bài), cuối cùng mang lại một hành trình cá nhân hóa minh bạch giữa Nhà trường - Gia đình - Học sinh tiểu học Việt Nam.
