# DANH SÁCH CHỨC NĂNG HỆ THỐNG MATHAI TUTOR

## 📋 TỔNG QUAN HỆ THỐNG

**Hệ thống gia sư toán AI** dành cho giáo viên và phụ huynh, hỗ trợ học sinh tiểu học (6-11 tuổi) học toán theo chương trình GDPT 2018 của Việt Nam.

**Số lượng User Roles**: 2

- Giáo viên (Teacher)
- Phụ huynh (Parent)

**Tổng số màn hình**: 9 màn hình chính

---

## 👨‍🏫 CHỨC NĂNG DÀNH CHO GIÁO VIÊN

### 1. TEACHER DASHBOARD (Bảng điều khiển giáo viên)

#### 1.1. Thống kê tổng quan

- **Số học sinh đang quản lý**: Hiển thị tổng số học sinh và số lượng học sinh mới trong tuần
- **Thời gian soạn bài/tuần**: Theo dõi thời gian tiết kiệm (mục tiêu 80% giảm)
- **Số bài tập đã tạo**: Thống kê số lượng bài tập đã tạo trong tháng
- **Điểm trung bình lớp**: Theo dõi hiệu suất học tập chung của lớp với xu hướng tăng/giảm

#### 1.2. Thao tác nhanh (Quick Actions)

4 nút chức năng chính:

- **Tạo học liệu CPA**: Sinh bài tập theo phương pháp Concrete-Pictorial-Abstract
- **Soạn bài theo mục tiêu**: Tạo bài tập phân hóa đa cấp độ
- **Xuất PDF bài tập**: In bài tập có QR code định danh
- **Chấm bài bằng AI**: Quét và chấm bài tự động bằng OCR

#### 1.3. Phân tích lỗi phổ biến (Error Analytics Summary)

- Hiển thị top 3 lỗi phổ biến nhất của lớp
- Mỗi lỗi bao gồm:
  - Tên chủ đề (ví dụ: "Phép chia có dư")
  - Số lượng học sinh mắc lỗi
  - Tỷ lệ phần trăm lỗi
  - Xu hướng (tăng/giảm)
- Gợi ý giảng dạy tự động từ AI

#### 1.4. Hoạt động gần đây (Recent Activity)

- Timeline hiển thị 4 hoạt động gần nhất
- Mỗi hoạt động ghi nhận:
  - Thời gian thực hiện
  - Loại hành động
  - Số lượng (bài chấm, học sinh, cấp độ...)

---

### 2. CPA DESIGNER (Tạo học liệu CPA)

#### 2.1. Quy trình tạo bài (3 bước)

**Bước 1: Chọn khối & chủ đề**

- Chọn khối lớp: 1, 2, 3, 4, 5
- Chọn chủ đề toán theo chương trình GDPT 2018:
  - Phép chia có dư
  - Phép nhân trong phạm vi 1000
  - Phân số đơn giản
  - Hình học cơ bản
  - (Và nhiều chủ đề khác)

**Bước 2: Xác định mục tiêu**

- Nhập mục tiêu bài học (textarea)
- Cài đặt số lượng bài tập cho mỗi cấp độ CPA:
  - Concrete: 3-10 bài
  - Pictorial: 3-10 bài
  - Abstract: 3-10 bài

**Bước 3: Xem trước & chỉnh sửa**

- Preview 3 phần CPA:
  - **Concrete**: Bài toán gắn với thực tế đời sống
  - **Pictorial**: Minh họa bằng hình vẽ, sơ đồ
  - **Abstract**: Ký hiệu toán học thuần túy
- Chỉnh sửa nội dung bài tập
- Lưu học liệu vào thư viện

#### 2.2. Đặc điểm kỹ thuật

- Tuân thủ phương pháp sư phạm CPA (Singapore Math)
- Phù hợp tâm lý trẻ 6-11 tuổi
- Tự động gắn tag chủ đề và khối lớp

---

### 3. DIFFERENTIATION SCREEN (Phân hóa đa cấp độ)

#### 3.1. Mục tiêu bài học

- Hiển thị rõ ràng mục tiêu bài học đang soạn
- Ví dụ: "Học sinh hiểu và thực hiện được phép chia có dư trong phạm vi 100"

#### 3.2. 4 tầng thử thách (Four-Tier System)

**Foundation (Nền tảng) - Màu xanh lá**

- Củng cố kiến thức cơ bản
- Số học sinh được gán: Hiển thị số lượng
- Bài tập đơn giản, ôn lại kiến thức nền
- Ví dụ: 15 : 3 = ?, 20 : 4 = ?

**Standard (Chuẩn) - Màu xanh dương**

- Phù hợp đa số học sinh
- Bài tập theo đúng mục tiêu bài học
- Ví dụ: 23 : 5 = ? (dư ...)

**Extension (Mở rộng) - Màu cam**

- Thử thách tư duy
- Bài toán mở rộng, tìm số hạng chưa biết
- Ví dụ: Tìm số bị chia, biết số chia là 6...

**Advanced (Nâng cao) - Màu tím**

- Bài toán tổng hợp, nhiều bước
- Yêu cầu tư duy logic cao
- Ví dụ: Bài toán có điều kiện kết hợp

#### 3.3. Quản lý hiển thị

- Bật/tắt hiển thị từng cấp độ (toggle visibility)
- Hiển thị tổng số học sinh cho mỗi cấp
- Xem tổng số học sinh toàn lớp

#### 3.4. Thao tác

- Chỉnh sửa bài tập từng cấp độ
- Gắn nhãn học sinh vào từng nhóm cấp độ
- Tạo thêm cấp độ nếu cần
- Lưu & xuất PDF phân tầng

---

### 4. PDF EXPORT SCREEN (Xuất PDF học liệu thông minh)

#### 4.1. Hai chế độ xuất chính

##### A. CLASSROOM PDF (Phân tầng lớp học)

**Mục đích**: Triển khai cá nhân hóa quy mô lớn không quá tải hậu cần

**Tính năng chính**:

1. **Three-Tier Templates (3 tầng thử thách)**
   - Tự động tạo 3 phiên bản: Nền tảng, Mở rộng, Nâng cao
   - Mỗi tầng có số học sinh riêng
   - Ví dụ phân bổ: 8 HS nền tảng, 18 HS mở rộng, 9 HS nâng cao

2. **Thiết kế chuẩn sư phạm CPA**
   - Mỗi tầng tuân theo tiến trình: Concrete → Pictorial → Abstract
   - Bố cục phù hợp tâm lý trẻ 6-11 tuổi
   - Không gian làm bài phù hợp với nét chữ và cách tư duy từng bước

3. **QR Code định danh nhóm**
   - Mỗi tầng có mã QR riêng (Nhóm A, B, C)
   - AI tự động nhận diện mức độ khi chấm bài
   - Ghi nhận kết quả chính xác theo nhóm

4. **Eco-Layout (Tối ưu in ấn)**
   - Toggle bật/tắt chế độ tiết kiệm
   - Tiết kiệm ~30% diện tích giấy và mực in
   - Vẫn đảm bảo sự sinh động của bài tập
   - Giảm chi phí in ấn cho nhà trường/quỹ phụ huynh

**Cài đặt xuất**:

- Khổ giấy: A4, A5, Letter
- Mã QR định danh: Bật/tắt
- Eco-Layout: Bật/tắt
- Thân thiện in đen trắng: Bật/tắt

**Preview tương tác**:

- Xem trước từng tầng riêng biệt
- Toggle nhanh giữa 3 tầng
- Xem cấu trúc CPA đầy đủ
- Hiển thị số trang và metadata

##### B. PERSONALIZED HOME-PDF (Lấp lỗ hổng cá nhân)

**Mục đích**: Hỗ trợ phụ huynh giúp con tại nhà "không đau đớn" và bảo vệ thị lực

**Tính năng chính**:

1. **Phiếu bài tập độc bản (One-of-a-kind Worksheet)**
   - Sau khi AI phân tích lỗi sai từ bài làm trên lớp
   - Tạo PDF riêng cho 1 học sinh cụ thể
   - Nhắm vào các lỗi sai cụ thể đã phát hiện

2. **Danh sách học sinh cần hỗ trợ**
   - Hiển thị học sinh có lỗi sai từ AI phân tích
   - Mỗi học sinh hiển thị:
     - Họ tên
     - Lớp
     - Số lượng lỗi
     - Danh sách chủ đề yếu (tags)

3. **Nội dung PDF cá nhân**
   - Header: Tên học sinh, lớp, ngày tạo
   - Phần bài tập nhắm vào từng lỗi cụ thể:
     - Hiển thị loại lỗi (ví dụ: "Tính sai số dư")
     - 2-4 bài tập cho mỗi lỗi
     - Không gian làm bài phù hợp
   - Footer: Metadata cho tracking

4. **Cẩm nang lời giải dành cho phụ huynh**
   - Toggle bật/tắt trang phụ lục
   - Giải thích phương pháp sư phạm từng bước
   - Không sử dụng ẩn số (x) hay phương pháp cũ
   - Mẹo đồng hành: Đồ vật cụ thể, kiên nhẫn lắng nghe
   - Những lỗi thường gặp và cách tránh

5. **Gửi file tự động**
   - **Gửi qua App**: Thông báo tức thì
   - **Gửi qua Zalo**: Kết nối Zalo OA
   - Phụ huynh chủ động in tại nhà hoặc tiệm photocopy

**Cài đặt xuất**:

- Khổ giấy: A4, A5
- Cẩm nang phụ huynh: Bật/tắt

#### 4.2. Thông số kỹ thuật PDF xuất ra

**Định dạng**:

- PDF chất lượng cao
- Dễ mở trên mọi thiết bị và máy in

**Cấu trúc trang**:

- Phần đề bài: Tích hợp hình ảnh minh họa thực tế
- Phần trình bày: Không gian phù hợp nét chữ và tư duy từng bước
- Mã QR định danh: Để AI nhận diện học sinh/nhóm
- Footer: Verified pedagogy engine • Auto-grading enabled

**Tính năng "điểm chạm" dữ liệu**:

- QR code chứa thông tin học sinh/nhóm
- Khi quét, AI tự động biết:
  - Học sinh nào (personalized) hoặc nhóm nào (classroom)
  - Mức độ bài tập
  - Chủ đề và mục tiêu bài học
- Thu thập dữ liệu "không chạm" (contactless data collection)

---

### 5. AI GRADING SCREEN (Chấm bài bằng AI)

#### 5.1. Privacy & Security

- **Thông báo bảo mật**:
  - Tự động ẩn danh hóa dữ liệu học sinh
  - Chỉ lưu kết quả học tập
  - Không lưu hình ảnh bài làm
  - Tuân thủ quy định bảo vệ dữ liệu

#### 5.2. Giao diện quét bài (Scan Interface)

**Chụp ảnh/Upload**:

- Mở camera để quét bài làm
- Hoặc tải ảnh lên từ thiết bị
- Hỗ trợ nhiều định dạng ảnh
- Hướng dẫn đặt bài vào khung hình

**Chức năng**:

- Nút "Mở Camera"
- Nút "Tải ảnh lên"
- Quét lại nếu không rõ
- Xác nhận & chấm

#### 5.3. OCR Recognition (Nhận dạng văn bản)

**Công nghệ OCR**:

- Nhận dạng chữ viết tay của học sinh
- Đọc phép tính và kết quả
- Phát hiện câu trả lời từ bài làm

**Trạng thái nhận dạng**:

- Hiển thị tiến trình quét
- Số câu trả lời được phát hiện
- Tỷ lệ thành công (ví dụ: 3/3 câu)

#### 5.4. Kết quả chấm tự động (Grading Results)

**Thông tin học sinh**:

- Họ tên học sinh (từ QR code)
- Lớp và số báo danh
- Điểm tổng (hiển thị trong vòng tròn màu)

**Chi tiết từng câu**:

- **Câu đúng** (màu xanh lá):
  - Icon ✓
  - Hiển thị đáp án học sinh
  - Badge "ĐÚNG"
  - Số điểm được cộng
- **Câu sai** (màu đỏ):
  - Icon ✗
  - Hiển thị đáp án sai (gạch ngang)
  - Hiển thị đáp án đúng
  - Badge "SAI"
  - Mô tả loại lỗi (ví dụ: "Lỗi tính số dư")

#### 5.5. Hành động sau chấm

- **Lưu kết quả**: Lưu vào hệ thống và ghi nhận vào hồ sơ học sinh
- **Chỉnh sửa**: Sửa kết quả nếu AI nhận dạng sai
- **Chấm tiếp**: Quét bài tiếp theo

#### 5.6. Batch Processing (Chấm hàng loạt)

- **Tải nhiều ảnh cùng lúc**: Tối đa 50 ảnh
- **Chấm tự động hàng loạt**: Tiết kiệm thời gian
- **Báo cáo tổng hợp**: Sau khi chấm xong tất cả

---

### 6. ERROR ANALYTICS (Phân tích lỗi & Đề xuất)

#### 6.1. Overview Stats (Thống kê tổng quan)

4 chỉ số chính:

- **Số lỗi phổ biến nhất**: Hiển thị top lỗi cần ưu tiên
- **Số HS cần hỗ trợ nhiều**: Học sinh có nhiều lỗi sai
- **Tỷ lệ lỗi cao nhất**: Phần trăm lỗi cao nhất trong lớp
- **Số gợi ý giảng dạy**: Số lượng recommendations từ AI

#### 6.2. Lỗi phổ biến theo chủ đề (Common Errors Analysis)

**Mỗi lỗi bao gồm**:

- **Thông tin cơ bản**:
  - Tên chủ đề (ví dụ: "Phép chia có dư")
  - Danh mục (Số học, Tư duy, Đo lường, Phân số...)
  - Xu hướng: Đang cải thiện ↓ / Cần chú ý ↑ / Ổn định →

- **Thống kê**:
  - Số học sinh mắc lỗi
  - Tỷ lệ phần trăm
  - Progress bar trực quan

- **Phân loại lỗi**:
  - Loại lỗi cụ thể (ví dụ: "Sai khi tính số dư", "Nhầm hệ số quy đổi")
  - Icon cảnh báo

- **Gợi ý can thiệp** (AI-generated):
  - 3-5 gợi ý sư phạm cụ thể
  - Ví dụ:
    - "Sử dụng đồ vật cụ thể để minh họa"
    - "Luyện tập thêm 5-7 bài tương tự"
    - "Ôn lại khái niệm 'số dư < số chia'"
  - Nút "Tạo bài tập bổ trợ" liên kết trực tiếp

#### 6.3. Học sinh cần hỗ trợ cá nhân (Individual Students)

**Bảng chi tiết**:

- Cột 1: Họ tên học sinh
- Cột 2: Lớp
- Cột 3: Điểm trung bình (màu đỏ nếu < 7)
- Cột 4: Danh sách chủ đề yếu (dạng tags)
- Cột 5: Nút "Tạo bài riêng" (link đến Personalized PDF)

**Tính năng**:

- Sắp xếp theo điểm TB hoặc số lượng lỗi
- Filter theo lớp
- Export danh sách

#### 6.4. Hành động tiếp theo

- **Xem tất cả**: Xem danh sách đầy đủ
- **Tạo bài tập bổ trợ**: Tự động tạo worksheet theo lỗi
- **Gửi cho phụ huynh**: Thông báo qua app/Zalo

---

## 👪 CHỨC NĂNG DÀNH CHO PHỤ HUYNH

### 7. PARENT DASHBOARD (Bảng điều khiển phụ huynh)

#### 7.1. Header chào mừng

- Hiển thị tên phụ huynh
- Thông điệp: "Cẩm nang đồng hành cùng con học toán"

#### 7.2. Subscription Banner (Gói Premium)

- Tên gói: "Gói Premium - Đồng hành tối ưu"
- **Lợi ích**:
  - Giải thích bài toán đơn giản
  - Theo dõi tiến độ hàng tuần
  - Bài tập bổ trợ tự động
- Hiển thị ngày hết hạn
- Thiết kế bắt mắt với gradient màu xanh

#### 7.3. Tiến độ học tập của con (Child Progress)

**4 chỉ số chính**:

- **Bài tập đã hoàn thành**: Số bài trong tuần với badge "Tuần này"
- **Thời gian học tập**: Phút học trong ngày với badge "Hôm nay"
- **Điểm trung bình**: Điểm TB với xu hướng tăng/giảm
- **Tỷ lệ làm đúng**: Phần trăm với đánh giá "Tốt/Khá/Cần cố gắng"

#### 7.4. Báo cáo tuần (Weekly Summary)

**Tiến độ theo chủ đề**:

- Mỗi chủ đề hiển thị:
  - Tên chủ đề toán
  - Trạng thái: "Đã nắm vững ✓" / "Đang luyện tập" / "Mới bắt đầu"
  - Progress bar với màu sắc tương ứng
  - Tỷ lệ phần trăm hoàn thành

**Nhận xét từ giáo viên**:

- Card đặc biệt với icon ❤️
- Nội dung nhận xét chi tiết từ giáo viên
- Tên giáo viên và lớp
- Thiết kế ấm áp, đáng tin cậy

#### 7.5. Cẩm nang đồng hành (Learning Companion Guide)

**3 nút chức năng chính**:

1. **Hướng dẫn giải bài** (Màu xanh lá):
   - Icon: 📄
   - Mô tả: "Giải thích đơn giản, dễ hiểu"
   - Link đến ParentSolutions screen

2. **Màn hình học tập của con** (Màu cam):
   - Icon: 📖
   - Mô tả: "Xem tiến độ và bài tập"
   - Link đến StudentExperience screen

3. **Bài tập bổ trợ** (Màu xanh dương):
   - Icon: 📚
   - Mô tả: "Luyện thêm tại nhà"
   - Link đến danh sách bài tập

#### 7.6. Bài tập hôm nay (Today's Assignment)

**Danh sách bài tập**:

- **Đã hoàn thành** (màu xanh lá):
  - Tên chủ đề
  - Số câu đúng/tổng số câu
  - Badge "Hoàn thành"

- **Đang làm** (màu xanh dương):
  - Tên chủ đề
  - Tiến độ (ví dụ: 3/8 câu)
  - Badge "Đang làm"

#### 7.7. Liên hệ giáo viên

- Nút "Nhắn tin cô giáo"
- Liên hệ nhanh về chủ đề cụ thể
- Lịch sử tin nhắn

---

### 8. PARENT SOLUTIONS (Hướng dẫn giải bài cho phụ huynh)

#### 8.1. Header

- Nút "Quay lại" về Parent Dashboard
- Tiêu đề: "Hướng dẫn giải bài cho phụ huynh"
- Mô tả: "Giải thích đơn giản theo phương pháp dạy mới"

#### 8.2. Pedagogy Notice (Thông báo phương pháp)

- Icon: 💡
- **Nội dung**:
  - "Cách giải đúng phương pháp mới"
  - Phù hợp chương trình GDPT 2018
  - Không sử dụng ẩn số (x)
  - Không dùng phương pháp cũ
  - Tránh gây nhầm lẫn cho con

#### 8.3. Đề bài (Problem Statement)

- Icon: ❓
- Card màu cam nổi bật
- Hiển thị đề bài đầy đủ
- Font chữ rõ ràng, dễ đọc

#### 8.4. Hướng dẫn từng bước (Step-by-step Solution)

**4 bước chi tiết**:

**Bước 1: Hiểu đề bài (Concrete)**

- Icon: 🌱 (Màu xanh lá)
- **Nội dung**:
  - "Hỏi con": Câu hỏi gợi mở
  - "Hướng dẫn": Giải thích đề bài bằng ngôn ngữ đơn giản
  - "Mẹo": Sử dụng đồ vật thực tế (bi, cốc, kẹo...)
- Border màu xanh lá

**Bước 2: Vẽ sơ đồ (Pictorial)**

- Icon: 🎨 (Màu xanh ngọc)
- **Nội dung**:
  - "Hướng dẫn con vẽ": Cách vẽ sơ đồ từng bước
  - Minh họa: Hình vẽ trực quan (hộp, emoji...)
  - Ví dụ cụ thể với hình ảnh
  - "Kết luận": Tóm tắt kết quả từ sơ đồ
- Border màu xanh ngọc

**Bước 3: Viết phép tính (Abstract)**

- Icon: 🔢 (Màu xanh dương)
- **Nội dung**:
  - "Giải thích": Chuyển từ hình ảnh sang số học
  - "Phép chia": Viết phép tính
  - "Bài giải": Trình bày từng dòng
  - "Giải thích cho con": Phân tích chi tiết
    - Cách nhân để kiểm tra
    - Cách tính số dư
- Border màu xanh dương

**Bước 4: Trả lời**

- Icon: ✅ (Màu tím)
- **Nội dung**:
  - "Câu trả lời đầy đủ": Viết câu trả lời hoàn chỉnh
  - Nhấn mạnh viết đơn vị
  - Mẫu câu trả lời chuẩn
- Border màu tím

#### 8.5. Những lỗi thường gặp (Common Mistakes)

**Danh sách lỗi** (Card màu đỏ):

- Mỗi lỗi có:
  - Icon ✗
  - Mô tả lỗi
  - Ví dụ sai
  - Giải thích tại sao sai
- Ví dụ:
  - "Số dư lớn hơn hoặc bằng số chia"
  - "Quên viết 'dư'"

#### 8.6. Mẹo đồng hành hiệu quả (Tips for Parents)

**Card màu xanh lá**:

- Icon: 💡
- **4-5 mẹo chính**:
  - Khuyến khích con tự làm trước
  - Sử dụng đồ vật thực tế
  - Kiên nhẫn lắng nghe
  - Khen ngợi khi cố gắng
  - Không vội chỉ lỗi sai

---

### 9. STUDENT EXPERIENCE (Màn hình học tập của con)

**Lưu ý**: Màn hình này được phụ huynh truy cập từ Parent Dashboard

#### 9.1. Navigation

- Nút "Quay lại trang phụ huynh"
- Cho phép phụ huynh quay về dashboard

#### 9.2. Welcome Header

- Icon chào: 👋
- Tên học sinh
- Thông điệp động viên: "Hãy cùng học toán vui vẻ nhé"

#### 9.3. Achievement Banner (Thành tích)

- Icon: 🏆
- **Hiển thị**:
  - Lời khen: "Làm tốt lắm!"
  - Số bài hoàn thành trong tuần
  - 3 huy hiệu thành tích: ⭐🏆🎯
- Gradient màu vàng-cam-đỏ bắt mắt

#### 9.4. Learning Progress (Tiến độ học tập)

**3 chỉ số chính**:

- **Ngôi sao đã nhận**: Tổng số sao tích lũy
- **Ngày học liên tiếp**: Streak days
- **Tỷ lệ làm đúng**: Phần trăm chính xác

#### 9.5. Nhiệm vụ hôm nay (Today's Mission)

**3 trạng thái bài tập**:

1. **Completed (Đã hoàn thành)** - Màu xanh lá:
   - Icon ✓
   - Tên bài tập
   - Số bài tập
   - 5 ngôi sao vàng
   - Progress bar 100%

2. **Active (Đang làm)** - Màu xanh dương:
   - Icon 📖
   - Tên bài tập
   - Tiến độ (3/8)
   - Progress bar theo phần trăm

3. **Locked (Khóa)** - Màu xám:
   - Icon 🔒
   - Tên bài tập
   - Text: "Hoàn thành bài trên để mở"
   - Opacity 60%

#### 9.6. QR Scan Entry Point (Điểm vào quét QR)

**Card gradient tím-hồng**:

- Icon QR code lớn
- Tiêu đề: "Bắt đầu học bài mới"
- Hướng dẫn: "Quét mã QR trên phiếu bài tập hoặc sách giáo khoa"
- Nút lớn: "Mở máy quét QR"
- **Tính năng**:
  - Quét QR từ PDF đã xuất
  - Tự động load bài tập tương ứng
  - Offline-first: Lưu bài tập vào thiết bị

#### 9.7. Lộ trình học tập (Learning Path)

**Danh sách chủ đề** (7+ items):

- Mỗi chủ đề có:
  - Icon trạng thái:
    - ✓ (xanh lá) - Đã hoàn thành
    - Số (xanh dương) - Đang học
    - 🔒 (xám) - Chưa mở
  - Tên chủ đề
  - Số sao nhận được (nếu hoàn thành)
- Visual: Border và màu nền theo trạng thái

**Chủ đề ví dụ**:

- Phép cộng trong phạm vi 1000 ✓
- Phép trừ trong phạm vi 1000 ✓
- Phép nhân với 2, 3, 4 ✓
- Phép chia có dư ✓
- Bài toán có nhiều bước (đang học)
- Đổi đơn vị đo độ dài 🔒
- Phân số đơn giản 🔒

#### 9.8. Gamification Elements

- **Progression system**: Unlock từng chủ đề
- **Reward system**: Ngôi sao và huy hiệu
- **Streak tracking**: Ngày học liên tiếp
- **Visual feedback**: Màu sắc, icon, animation

---

## 🎨 HỆ THỐNG THIẾT KẾ

### Design Language

- **Phong cách**: Educational, trustworthy, calm, child-friendly
- **Hình dạng**: Rounded corners, soft shadows
- **Hierarchy**: Clear visual hierarchy
- **Cognitive load**: Minimal
- **UI pattern**: Icons + short text labels
- **Animation**: Tránh flashy, ưu tiên smooth transitions

### Color Palette

**Primary Colors**:

- Blue (#3B82F6): Education & trust - Giáo viên
- Teal (#14B8A6): Freshness & balance
- Light Green (#10B981): Growth & success - Phụ huynh

**Secondary Colors**:

- Yellow (#FBBF24): Encouragement
- Orange (#F97316): Energy - Học sinh/Cảnh báo
- Purple (#A855F7): Premium/Advanced

**Semantic Colors**:

- Green (#10B981): Success, completed
- Red (#EF4444): Error, incorrect
- Orange (#F97316): Warning, attention
- Blue (#3B82F6): Info, in-progress

**Background**:

- Light pastel: from-blue-50 via-teal-50 to-green-50
- White cards với shadow-sm

### Typography

- Large, readable fonts
- High contrast for accessibility
- Font weights: normal, medium, semibold, bold
- No custom font-size (sử dụng default từ globals.css)

### Component System

**Buttons**:

- Rounded: rounded-lg, rounded-xl
- Variants: Solid, outline, ghost
- States: Default, hover, active, disabled
- Sizes: Small, medium, large

**Cards**:

- White background
- Rounded-2xl
- Shadow-sm
- Border border-gray-100

**Badges**:

- Rounded-full hoặc rounded
- Color-coded theo trạng thái
- Font-semibold, size xs/sm

**Progress bars**:

- Rounded-full
- Height: h-2, h-3
- Color theo trạng thái
- Smooth transitions

**Icons** (từ lucide-react):

- Size: w-4 h-4 (small), w-5 h-5 (medium), w-6 h-6 (large)
- Consistent với text
- Màu theo context

---

## 📱 RESPONSIVE DESIGN

### Breakpoints

- Mobile: Default (< 640px)
- Tablet: sm: (≥ 640px)
- Desktop: lg: (≥ 1024px)

### Grid System

- Mobile: 1 column
- Tablet: 2-3 columns
- Desktop: 3-4 columns

### Navigation

- Mobile: Icon only
- Desktop: Icon + Text

---

## 🔐 THÔNG SỐ KỸ THUẬT

### PDF Export

- Format: PDF chất lượng cao
- Page sizes: A4, A5, Letter
- QR code: Dynamic, student/group specific
- Metadata: Embedded for tracking
- Eco-mode: 30% reduction in ink/paper

### AI/ML Features

- OCR: Handwriting recognition
- Auto-grading: Accuracy tracking
- Error analysis: Pattern detection
- Recommendations: Pedagogy-based
- Privacy: Auto-anonymization

### Data Structure

- Student profiles
- Assignment tracking
- Progress analytics
- Error logs
- Parent-teacher communication

### Integration Points

- App notification
- Zalo OA messaging
- QR code scanning
- Camera access
- File upload/download

---

## 📊 TỔNG KẾT SỐ LIỆU

### Tổng số tính năng: 60+ tính năng chi tiết

**Giáo viên**: 40+ tính năng

- Dashboard: 10 tính năng
- CPA Designer: 8 tính năng
- Differentiation: 10 tính năng
- PDF Export: 15+ tính năng
- AI Grading: 12 tính năng
- Error Analytics: 8 tính năng

**Phụ huynh**: 20+ tính năng

- Parent Dashboard: 12 tính năng
- Parent Solutions: 6 tính năng
- Student Experience: 8 tính năng (truy cập qua phụ huynh)

### Screens by Role

- **Teacher**: 6 screens (Dashboard, CPA, Differentiation, PDF, Grading, Analytics)
- **Parent**: 3 screens (Dashboard, Solutions, Student Experience)
- **Total**: 9 unique screens

### Key Metrics

- Time saved: 80% lesson prep reduction
- Personalization: 4-tier differentiation
- Eco-friendly: 30% paper/ink savings
- Coverage: Grades 1-5 (Vietnam GDPT 2018)
- Pedagogy: CPA method (Singapore Math)

---

## 🎯 UNIQUE VALUE PROPOSITIONS

### Cho Giáo viên

1. **Tiết kiệm 80% thời gian soạn bài**
2. **Phân hóa tự động 4 cấp độ**
3. **Chấm bài AI OCR**
4. **Phân tích lỗi thông minh**
5. **Xuất PDF QR-enabled**
6. **Chuẩn sư phạm CPA**

### Cho Phụ huynh

1. **Cẩm nang đồng hành dễ hiểu**
2. **Phương pháp dạy mới (không dùng x)**
3. **Bài tập cá nhân hóa cho con**
4. **Theo dõi tiến độ real-time**
5. **Giải thích từng bước chi tiết**
6. **Offline-first, bảo vệ thị lực**

### Cho Học sinh

1. **Gamification: sao, huy hiệu, streak**
2. **Offline-first learning**
3. **QR code entry**
4. **Visual learning path**
5. **Minimal screen time**
6. **Age-appropriate (6-11 tuổi)**

---

**Ngày cập nhật**: 2026-01-16  
**Version**: 1.0  
**Trạng thái**: Production Ready