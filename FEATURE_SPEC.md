# 📋 Smart-MathAI Feature Specification

> Tài liệu tổng hợp toàn bộ chức năng và UI mẫu từ example_UI để chuẩn bị lập kế hoạch code

---

## 🎯 Tổng Quan Hệ Thống

| Thông Số | Giá Trị |
|----------|---------|
| Số màn hình chính | 9 |
| Số vai trò người dùng | 2 (Teacher, Parent) |
| Số tính năng | 60+ |
| Tech Stack mẫu | React 18 + TypeScript + Tailwind CSS v4 |
| Trạng thái UI mẫu | ✅ Hoàn chỉnh |

---

## 📁 Cấu Trúc Màn Hình

```
App.tsx (Main Router)
├── Welcome.tsx            → Chọn vai trò (Teacher/Parent)
├── Navigation.tsx         → Thanh điều hướng trên cùng
│
├── [TEACHER SCREENS]
│   ├── TeacherDashboard.tsx      → Bảng điều khiển giáo viên
│   ├── CPADesigner.tsx           → Tạo học liệu CPA (3 bước)
│   ├── DifferentiationScreen.tsx → Phân hóa 4 cấp độ
│   ├── PDFExportScreen.tsx       → Xuất PDF (2 chế độ)
│   ├── AIGradingScreen.tsx       → Chấm bài bằng AI
│   └── ErrorAnalytics.tsx        → Phân tích lỗi & đề xuất
│
└── [PARENT SCREENS]
    ├── ParentDashboard.tsx       → Bảng điều khiển phụ huynh
    ├── ParentSolutions.tsx       → Hướng dẫn giải bài CPA
    └── StudentExperience.tsx     → Màn hình học tập của con
```

---

## 🏠 1. WELCOME SCREEN (Trang Chủ)

### Mục đích
Cho phép người dùng chọn vai trò (Giáo viên hoặc Phụ huynh) để vào hệ thống.

### Giao diện

```
┌─────────────────────────────────────────────────────────┐
│                    MathAI Tutor                         │
│              Hệ thống gia sư toán AI                    │
│                                                         │
│    Tiết kiệm 80% thời gian soạn bài...                 │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │   👨‍🏫 Giáo viên   │  │   👪 Phụ huynh   │            │
│  │                  │  │                  │            │
│  │ • Tạo học liệu   │  │ • Hướng dẫn giải │            │
│  │ • Phân hóa 4 tầng│  │ • Theo dõi tiến  │            │
│  │ • Chấm bài AI    │  │ • Bài tập riêng  │            │
│  │                  │  │                  │            │
│  │   [Bắt đầu →]    │  │   [Bắt đầu →]    │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                         │
│      ┌─────────┬─────────┬─────────┐                   │
│      │   80%   │   CPA   │   AI    │                   │
│      │ tiết    │ phương  │ chấm    │                   │
│      │ kiệm    │ pháp    │ thông   │                   │
│      └─────────┴─────────┴─────────┘                   │
│                                                         │
│   Hỗ trợ chương trình GDPT 2018 • Lớp 1-3              │
└─────────────────────────────────────────────────────────┘
```

### Chức năng
- [x] Hiển thị logo và tên hệ thống
- [x] 2 card lớn để chọn vai trò
- [x] Mô tả tóm tắt tính năng mỗi vai trò
- [x] Thống kê highlight (80%, CPA, AI)

---

## 👨‍🏫 2. TEACHER DASHBOARD (Bảng Điều Khiển Giáo Viên)

### Mục đích
Hiển thị tổng quan thông tin và các thao tác nhanh cho giáo viên.

### Giao diện

```
┌─────────────────────────────────────────────────────────┐
│  Xin chào, Cô Lan                                       │
│  Bảng điều khiển giáo viên - Tiết kiệm 80% thời gian   │
├─────────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │ 👥 142 │ │ ⏱ 2.5h │ │ 📄 48  │ │ ⭐ 8.2 │           │
│  │ học    │ │ soạn   │ │ bài    │ │ điểm   │           │
│  │ sinh   │ │ bài    │ │ tập    │ │ TB     │           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
├─────────────────────────────────────────────────────────┤
│  THAO TÁC NHANH                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ 📖 Tạo  │ │ 🎯 Soạn │ │ 📥 Xuất │ │ 📷 Chấm │   │
│  │ CPA     │ │ mục tiêu│ │ PDF    │ │ bài AI │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├─────────────────────────────────────────────────────────┤
│  PHÂN TÍCH LỖI PHỔ BIẾN          │  HOẠT ĐỘNG GẦN ĐÂY │
│  ├ Phép chia có dư (68%) ↓       │  • 10p - Chấm 35   │
│  ├ Bài toán nhiều bước (52%) ↓   │  • 2h - Tạo CPA    │
│  └ Đổi đơn vị (45%) ↑            │  • Hqua - PDF 28   │
│                                   │                    │
│  💡 Gợi ý: Lớp 3A cần ôn phép    │                    │
│  chia có dư...                    │                    │
└─────────────────────────────────────────────────────────┘
```

### Chức năng
- [x] Hiển thị 4 thống kê: Học sinh, Thời gian soạn bài, Bài tập đã tạo, Điểm TB
- [x] 4 nút thao tác nhanh: CPA, Phân hóa, PDF, Chấm bài
- [x] Phân tích lỗi phổ biến (top 3) với progress bar
- [x] Gợi ý giảng dạy tự động
- [x] Timeline hoạt động gần đây

### Data Model cần thiết
```typescript
interface TeacherDashboard {
  stats: {
    totalStudents: number;
    newStudentsThisWeek: number;
    avgPrepTime: number;
    worksheetsCreated: number;
    avgClassScore: number;
  };
  errorSummary: ErrorAnalytics[];
  recentActivities: Activity[];
}
```

---

## 📖 3. CPA DESIGNER (Tạo Học Liệu CPA)

### Mục đích
Tạo bài tập theo phương pháp Concrete-Pictorial-Abstract (Singapore Math).

### Quy trình 3 bước

#### Bước 1: Chọn Khối & Chủ Đề
```
┌─────────────────────────────────────────────────────────┐
│  📖 Tạo học liệu CPA                                    │
│  Concrete - Pictorial - Abstract                        │
├─────────────────────────────────────────────────────────┤
│  [●] ─────── [○] ─────── [○]                           │
│   1           2           3                             │
│  Chọn khối  Mục tiêu   Xem trước                       │
├─────────────────────────────────────────────────────────┤
│  KHỐI LỚP                                               │
│  [Lớp 1] [Lớp 2] [Lớp 3*] [CHƯA HỖ TRỢ]               │
│                                                         │
│  CHỦ ĐỀ TOÁN (Theo GDPT 2018)                          │
│  ┌─────────────────────┐ ┌─────────────────────┐       │
│  │ ✓ Phép chia có dư   │ │   Phép nhân 1000   │       │
│  └─────────────────────┘ └─────────────────────┘       │
│  ┌─────────────────────┐ ┌─────────────────────┐       │
│  │   Phân số đơn giản  │ │   Hình học cơ bản  │       │
│  └─────────────────────┘ └─────────────────────┘       │
│                                                         │
│                              [Tiếp theo →]              │
└─────────────────────────────────────────────────────────┘
```

#### Bước 2: Xác Định Mục Tiêu
```
┌─────────────────────────────────────────────────────────┐
│  MỤC TIÊU BÀI HỌC                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Học sinh hiểu và thực hiện được phép chia có   │   │
│  │ dư trong phạm vi 100                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  SỐ LƯỢNG BÀI TẬP MỖI CẤP ĐỘ                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │Concrete  │ │Pictorial │ │Abstract  │               │
│  │   [5]    │ │   [5]    │ │   [5]    │               │
│  └──────────┘ └──────────┘ └──────────┘               │
│                                                         │
│  [Quay lại]     [✨ Tạo bài tập bằng AI]              │
└─────────────────────────────────────────────────────────┘
```

#### Bước 3: Xem Trước & Chỉnh Sửa
```
┌─────────────────────────────────────────────────────────┐
│  XEM TRƯỚC & CHỈNH SỬA      [Chỉnh sửa] [✓ Lưu]       │
├─────────────────────────────────────────────────────────┤
│  ┌─ CONCRETE (Cụ thể) ──────────────────────────────┐  │
│  │ 📙 Gắn với thực tế đời sống                      │  │
│  │                                                   │  │
│  │ Bài 1: Cô giáo có 23 cái kẹo muốn chia đều      │  │
│  │ cho 5 bạn học sinh. Hỏi mỗi bạn được bao        │  │
│  │ nhiêu cái kẹo và còn thừa bao nhiêu cái?        │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ PICTORIAL (Hình ảnh) ───────────────────────────┐  │
│  │ 🎨 Minh họa bằng hình vẽ                         │  │
│  │                                                   │  │
│  │ Bài 2: Quan sát hình vẽ. Có 17 quả táo được     │  │
│  │ xếp vào các rổ, mỗi rổ 4 quả.                   │  │
│  │ [🧺4] [🧺4] [🧺4] [🧺4] + 🍎                    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ ABSTRACT (Trừu tượng) ──────────────────────────┐  │
│  │ 🔢 Ký hiệu toán học                              │  │
│  │                                                   │  │
│  │ Bài 3: Thực hiện phép chia:                     │  │
│  │ a) 27 : 6 = ...                                 │  │
│  │ b) 35 : 8 = ...                                 │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  [Quay lại]            [Hoàn thành & lưu]              │
└─────────────────────────────────────────────────────────┘
```

### Chức năng
- [x] Wizard 3 bước với progress indicator
- [x] Chọn khối lớp (1-3 cho MVP)
- [x] Chọn chủ đề theo SGK
- [x] Nhập mục tiêu bài học
- [x] Cấu hình số lượng bài tập mỗi cấp độ
- [x] Preview 3 phần CPA với màu sắc phân biệt
- [x] Chỉnh sửa nội dung
- [x] Lưu học liệu

### Data Model cần thiết
```typescript
interface CPAWorksheet {
  id: string;
  grade: number;
  topicId: string;
  objective: string;
  content: {
    concrete: Exercise[];
    pictorial: Exercise[];
    abstract: Exercise[];
  };
  status: 'draft' | 'published';
  createdAt: string;
  teacherId: string;
}
```

---

## 🎯 4. DIFFERENTIATION SCREEN (Phân Hóa Đa Cấp Độ)

### Mục đích
Tạo bài tập phân hóa 4 cấp độ cho học sinh có năng lực khác nhau.

### Giao diện

```
┌─────────────────────────────────────────────────────────┐
│  🎯 Phân hóa đa cấp độ                                  │
│  Một mục tiêu → 4 cấp độ khó                           │
├─────────────────────────────────────────────────────────┤
│  MỤC TIÊU BÀI HỌC                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Học sinh hiểu và thực hiện được phép chia có   │   │
│  │ dư trong phạm vi 100                            │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  QUẢN LÝ HIỂN THỊ CẤP ĐỘ            Tổng: 40 học sinh │
│  [👁 Foundation 8] [👁 Standard 18] [👁 Extension 9]   │
│  [👁 Advanced 5]                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─ 🌱 FOUNDATION (Nền tảng) ────────────── 8 HS ───┐  │
│  │ Củng cố kiến thức cơ bản                         │  │
│  │ ├ 1. 15 : 3 = ?                                 │  │
│  │ ├ 2. 20 : 4 = ?                                 │  │
│  │ └ 3. 18 : 6 = ?                                 │  │
│  │ [Chỉnh sửa bài tập] [Gắn nhãn học sinh]         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ 📘 STANDARD (Chuẩn) ─────────────────── 18 HS ──┐  │
│  │ Phù hợp đa số học sinh                           │  │
│  │ ├ 1. 23 : 5 = ? (dư ...)                        │  │
│  │ ├ 2. 31 : 7 = ? (dư ...)                        │  │
│  │ └ 3. 45 : 8 = ? (dư ...)                        │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ 🔶 EXTENSION (Mở rộng) ──────────────── 9 HS ───┐  │
│  │ Thử thách tư duy                                 │  │
│  │ ├ 1. Tìm số bị chia, biết số chia là 6...       │  │
│  │ └ 2. Một số chia cho 8 được thương là 5 dư 4    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ 💜 ADVANCED (Nâng cao) ──────────────── 5 HS ───┐  │
│  │ Bài toán tổng hợp                                │  │
│  │ ├ 1. Có 87 quyển vở chia đều cho một số HS...   │  │
│  │ └ 2. Số HS của lớp khi xếp hàng 6 thì thừa 2... │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  [Tạo thêm cấp độ]         [Lưu & Xuất PDF]            │
└─────────────────────────────────────────────────────────┘
```

### 4 Cấp Độ

| Cấp Độ | Màu | Mục Đích | Đối Tượng |
|--------|-----|----------|-----------|
| Foundation | 🟢 Xanh lá | Củng cố nền tảng | HS yếu |
| Standard | 🔵 Xanh dương | Theo mục tiêu chính | Đa số HS |
| Extension | 🟠 Cam | Thử thách tư duy | HS khá |
| Advanced | 🟣 Tím | Bài toán tổng hợp | HS giỏi |

### Chức năng
- [x] Hiển thị mục tiêu bài học
- [x] Toggle bật/tắt hiển thị từng cấp độ
- [x] Hiển thị số học sinh mỗi cấp
- [x] Preview bài tập từng cấp với màu sắc phân biệt
- [x] Chỉnh sửa bài tập
- [x] Gắn nhãn học sinh vào nhóm
- [x] Lưu & Xuất PDF

---

## 📥 5. PDF EXPORT SCREEN (Xuất PDF Thông Minh)

### Mục đích
Xuất bài tập dạng PDF với 2 chế độ: Classroom và Personalized.

### Chế Độ A: CLASSROOM PDF (Phân Tầng Lớp Học)

```
┌─────────────────────────────────────────────────────────┐
│  📥 Xuất PDF học liệu thông minh                        │
│  Phân tầng tự động • Tối ưu in ấn • Chuẩn sư phạm CPA  │
├─────────────────────────────────────────────────────────┤
│  [🏫 Classroom PDF ✓]  [👤 Personalized PDF]            │
├─────────────────────────────────────────────────────────┤
│ SETTINGS              │  PDF PREVIEW                    │
├───────────────────────┤                                 │
│ CHỌN LỚP HỌC         │  ┌─────────────────────────┐   │
│ [3A ✓] 35 HS         │  │ BÀI TẬP TOÁN - LỚP 3A  │   │
│  NT:8 MR:18 NC:9     │  │ Chủ đề: Phép nhân      │   │
│ [3B] 32 HS           │  │ 🎯 Tầng Mở rộng       │   │
│ [4A] 38 HS           │  │                         │   │
├───────────────────────┤  │ ┌─ CONCRETE ─────────┐ │   │
│ 3 TẦNG THỬ THÁCH     │  │ │ Bài 1: Một cửa hàng│ │   │
│ [🌱 Nền tảng] 8 HS   │  │ │ bán 6 hộp bánh...  │ │   │
│ [🎯 Mở rộng ✓] 18 HS │  │ └─────────────────────┘ │   │
│ [⭐ Nâng cao] 9 HS   │  │                         │   │
│ 💡 Mỗi tầng có QR    │  │ ┌─ PICTORIAL ────────┐ │   │
├───────────────────────┤  │ │ [📦6] [📦6]...     │ │   │
│ CÀI ĐẶT XUẤT         │  │ └─────────────────────┘ │   │
│ Khổ giấy: [A4 ▼]     │  │                         │   │
│ QR định danh: [ON]    │  │ ┌─ ABSTRACT ────────┐ │   │
│ Eco-Layout: [ON]      │  │ │ 6 × 8 = ___       │ │   │
│ ♻️ Tiết kiệm 30%     │  │ │ 6 × 12 = ___      │ │   │
├───────────────────────┤  │ └─────────────────────┘ │   │
│ [📥 Xuất PDF 35 bài] │  │ [QR] Trang 1/3         │   │
└───────────────────────┴──┴─────────────────────────┴───┘
```

### Chế Độ B: PERSONALIZED HOME-PDF (Lấp Lỗ Hổng)

```
┌─────────────────────────────────────────────────────────┐
│  [🏫 Classroom PDF]  [👤 Personalized PDF ✓]            │
├─────────────────────────────────────────────────────────┤
│ SETTINGS              │  PDF PREVIEW                    │
├───────────────────────┤                                 │
│ HỌC SINH CẦN HỖ TRỢ  │  ┌─────────────────────────┐   │
│ ┌───────────────────┐│  │ BÀI TẬP BỔ TRỢ CÁ NHÂN │   │
│ │ Nguyễn Văn An    ││  │ Nguyễn Văn An - Lớp 3A │   │
│ │ 3A • 2 lỗi       ││  │                         │   │
│ │ [Chia dư][Đơn vị]││  │ ┌─ 🎯 Phép chia có dư ─┐│   │
│ └───────────────────┘│  │ │ ⚠️ Lỗi: Tính sai số ││   │
│ ┌───────────────────┐│  │ │ dư                   ││   │
│ │ Trần Thị Bình    ││  │ │ Bài 1: Có 23 cái kẹo││   │
│ │ 3A • 1 lỗi       ││  │ │ chia đều cho 5 bạn..││   │
│ └───────────────────┘│  │ └─────────────────────┘ │   │
│                       │  │                         │   │
│ 💡 Dữ liệu từ AI     │  │ ┌─ 🎯 Đổi đơn vị ─────┐│   │
├───────────────────────┤  │ │ ⚠️ Lỗi: Nhầm hệ số ││   │
│ CÀI ĐẶT              │  │ │ Bài 3: 3m 25cm = ?cm││   │
│ Khổ giấy: [A4 ▼]     │  │ └─────────────────────┘ │   │
│ Cẩm nang PH: [ON]    │  │                         │   │
│ 📚 Phụ lục lời giải  │  │ [Personalized • Trang 1]│   │
├───────────────────────┤  └─────────────────────────┘   │
│ GỬI TỰ ĐỘNG          │                                 │
│ [📱 Gửi qua App]     │  ┌─ CẨM NANG PHỤ HUYNH ──────┐│
│ [💬 Gửi qua Zalo]    │  │ 📚 Trang 2: Hướng dẫn giải│ │
├───────────────────────┤  │ • Không dùng ẩn số (x)    │ │
│ [📥 Tạo & gửi PDF]   │  │ • Mẹo: Dùng đồ vật thực  │ │
└───────────────────────┴──┴───────────────────────────┴─┘
```

### Chức năng
- [x] Toggle 2 chế độ xuất
- [x] Chọn lớp học và xem phân bố học sinh
- [x] 3 tầng thử thách với QR code riêng
- [x] Preview PDF theo từng tầng
- [x] Cài đặt: Khổ giấy, QR, Eco-Layout
- [x] Danh sách học sinh cần hỗ trợ (từ AI)
- [x] Cẩm nang phụ huynh toggle
- [x] Gửi tự động qua App/Zalo

---

## 📷 6. AI GRADING SCREEN (Chấm Bài Bằng AI)

> ⚠️ **LƯU Ý MVP**: Màn hình này chuẩn bị sẵn UI, nhưng logic AI (OCR) CHƯA implement trong MVP.

### Giao diện

```
┌─────────────────────────────────────────────────────────┐
│  📷 Chấm bài bằng AI                                    │
│  Quét và chấm bài tự động với OCR                       │
├─────────────────────────────────────────────────────────┤
│  🔒 Bảo mật & Ẩn danh                                   │
│  Tất cả dữ liệu học sinh được tự động ẩn danh hóa.     │
│  Hệ thống chỉ lưu kết quả học tập, không lưu hình ảnh. │
├─────────────────────────────────────────────────────────┤
│ QUÉT BÀI LÀM           │  KẾT QUẢ CHẤM                 │
│ ┌───────────────────┐  │  ┌─────────────────────────┐  │
│ │                   │  │  │ Học sinh: Nguyễn Văn An │  │
│ │       📷         │  │  │ Lớp 3A • SBD: 01        │  │
│ │                   │  │  │                   [8.5] │  │
│ │  Đặt bài làm vào │  │  └─────────────────────────┘  │
│ │  khung hình      │  │                               │
│ │                   │  │  ✓ Nhận dạng hoàn tất       │
│ │  [📷 Mở Camera]  │  │  3/3 câu trả lời phát hiện  │
│ │                   │  │                               │
│ │      hoặc        │  │  ┌─ ✓ Bài 1 ─────────────┐  │
│ │  [📤 Tải ảnh lên]│  │  │ 23 : 5 = 4 (dư 3)     │  │
│ └───────────────────┘  │  │ [ĐÚNG] +3 điểm        │  │
│                        │  └─────────────────────────┘  │
│                        │  ┌─ ✗ Bài 2 ─────────────┐  │
│                        │  │ 31 : 7 = 4 (dư 2̶)     │  │
│                        │  │ ✓ Đáp án: = 4 (dư 3)  │  │
│                        │  │ [SAI] Lỗi tính số dư  │  │
│                        │  └─────────────────────────┘  │
│                        │                               │
│                        │  [Lưu kết quả] [Chỉnh sửa]   │
├────────────────────────┴───────────────────────────────┤
│  CHẤM HÀNG LOẠT                                         │
│  Chấm nhiều bài cùng lúc - Tối đa 50 ảnh               │
│                                    [📤 Tải nhiều ảnh]  │
└─────────────────────────────────────────────────────────┘
```

### Chức năng (UI ready, logic deferred)
- [x] Giao diện camera/upload ảnh
- [x] Privacy notice
- [x] OCR status display
- [x] Kết quả chấm với màu sắc (đúng/sai)
- [x] Phát hiện loại lỗi
- [x] Batch processing UI (50 ảnh)
- [ ] **(AI Phase)** OCR nhận dạng thực tế
- [ ] **(AI Phase)** Auto-grading engine

---

## 📊 7. ERROR ANALYTICS (Phân Tích Lỗi & Đề Xuất)

### Giao diện

```
┌─────────────────────────────────────────────────────────┐
│  📊 Phân tích lỗi & Đề xuất                             │
│  Điều chỉnh giảng dạy dựa trên dữ liệu thực tế         │
├─────────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │ 📊 4  │ │ 👥 23 │ │ 🎯 68% │ │ 💡 12 │           │
│  │ lỗi   │ │ HS cần │ │ tỷ lệ  │ │ gợi   │           │
│  │ phổ   │ │ hỗ trợ │ │ cao    │ │ ý     │           │
│  │ biến  │ │ nhiều  │ │ nhất   │ │       │           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
├─────────────────────────────────────────────────────────┤
│  LỖI PHỔ BIẾN THEO CHỦ ĐỀ                              │
│                                                         │
│  ┌─ Phép chia có dư ─────────────────────── 23 HS ──┐  │
│  │ [Số học] [↓ Đang cải thiện]                      │  │
│  │ ⚠️ Loại lỗi: Sai khi tính số dư                 │  │
│  │ ████████████████████████░░░░░░░░░░░ 68%         │  │
│  │                                                   │  │
│  │ 💡 GỢI Ý CAN THIỆP:                              │  │
│  │ • Sử dụng đồ vật cụ thể để minh họa             │  │
│  │ • Luyện tập thêm 5-7 bài tương tự               │  │
│  │ • Ôn lại khái niệm "số dư < số chia"            │  │
│  │                      [Tạo bài tập bổ trợ →]      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ Bài toán có nhiều bước ──────────────── 18 HS ──┐  │
│  │ [Tư duy] [↓ Đang cải thiện]                      │  │
│  │ ...                                               │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  HỌC SINH CẦN HỖ TRỢ CÁ NHÂN            [Xem tất cả →]│
│  ┌──────────────┬───────┬────────┬──────────────────┐  │
│  │ Học sinh     │ Lớp   │ Điểm TB│ Chủ đề yếu      │  │
│  ├──────────────┼───────┼────────┼──────────────────┤  │
│  │ Nguyễn Văn An│ 3A    │ 6.5    │[Chia dư][Đơn vị]│  │
│  │ Trần Thị Bình│ 3A    │ 7.0    │[Bài toán m.bước]│  │
│  │ Lê Minh Châu │ 3B    │ 6.8    │[Phân số][So sánh]│ │
│  └──────────────┴───────┴────────┴──────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Chức năng
- [x] 4 thống kê tổng quan
- [x] Danh sách lỗi phổ biến với chi tiết
- [x] Trend indicators (tăng/giảm/ổn định)
- [x] AI recommendations cho mỗi lỗi
- [x] Link tạo bài tập bổ trợ
- [x] Bảng học sinh yếu với điểm TB và chủ đề yếu
- [x] Link tạo bài riêng cho từng học sinh

---

## 👪 8. PARENT DASHBOARD (Bảng Điều Khiển Phụ Huynh)

### Giao diện

```
┌─────────────────────────────────────────────────────────┐
│  Xin chào, Phụ huynh Nguyễn Văn An                      │
│  Cẩm nang đồng hành cùng con học toán                  │
├─────────────────────────────────────────────────────────┤
│  ╭─────────────────────────────────────────────────────╮│
│  │ 🏆 Gói Premium - Đồng hành tối ưu    Đến 30/06/2026││
│  │ • Giải thích đơn giản • Theo dõi tiến độ           ││
│  ╰─────────────────────────────────────────────────────╯│
├─────────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │ 📚 12 │ │ ⏱ 25p │ │ ⭐ 8.2 │ │ 🎯 85% │           │
│  │ bài   │ │ hôm   │ │ điểm  │ │ làm   │           │
│  │ xong  │ │ nay   │ │ TB    │ │ đúng  │           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
├─────────────────────────────────────────────────────────┤
│ BÁO CÁO TUẦN NÀY          │  CẨM NANG ĐỒNG HÀNH       │
│                            │                           │
│ TIẾN ĐỘ THEO CHỦ ĐỀ       │  [📄 Hướng dẫn giải bài] │
│ Phép chia có dư            │  Giải thích đơn giản     │
│ [Đã nắm vững ✓] ████ 90%  │                           │
│                            │  [📖 Màn hình học của con]│
│ Bài toán nhiều bước        │  Xem tiến độ và bài tập  │
│ [Đang luyện tập] ███░ 65% │                           │
│                            │  [📚 Bài tập bổ trợ]     │
│ Đổi đơn vị đo              │  Luyện thêm tại nhà      │
│ [Mới bắt đầu] ██░░ 40%    │                           │
│                            ├───────────────────────────│
│ 💙 NHẬN XÉT TỪ GIÁO VIÊN  │  BÀI TẬP HÔM NAY         │
│ "An đã có tiến bộ rõ rệt  │  ┌─────────────────────┐  │
│ trong tuần này! Con rất    │  │ Phép chia có dư    │  │
│ tập trung và cố gắng..."   │  │ 5/5 đúng [Hoàn thành]│ │
│ - Cô Lan, GV lớp 3A       │  ├─────────────────────┤  │
│                            │  │ Bài toán tổng hợp  │  │
│                            │  │ 3/8 [Đang làm]     │  │
│                            │  └─────────────────────┘  │
└────────────────────────────┴───────────────────────────┘
```

### Chức năng
- [x] Banner Subscription (Premium/Free)
- [x] 4 thống kê tiến độ con
- [x] Tiến độ theo chủ đề với trạng thái
- [x] Nhận xét từ giáo viên
- [x] 3 nút cẩm nang đồng hành
- [x] Danh sách bài tập hôm nay

---

## 📝 9. PARENT SOLUTIONS (Hướng Dẫn Giải Bài CPA)

### Mục đích
Hướng dẫn phụ huynh cách giải bài theo phương pháp CPA mới, không dùng ẩn số (x).

### Giao diện

```
┌─────────────────────────────────────────────────────────┐
│  📝 Hướng dẫn giải bài cho phụ huynh                    │
│  Giải thích đơn giản theo phương pháp dạy mới          │
├─────────────────────────────────────────────────────────┤
│  💡 Cách giải đúng phương pháp mới                      │
│  Phù hợp với chương trình GDPT 2018. Không sử dụng     │
│  ẩn số (x) hay phương pháp cũ để tránh nhầm lẫn.       │
├─────────────────────────────────────────────────────────┤
│  ❓ ĐỀ BÀI                                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Cô giáo có 28 cái kẹo muốn chia đều cho 6 bạn │   │
│  │ học sinh. Hỏi mỗi bạn được bao nhiêu cái kẹo  │   │
│  │ và còn thừa bao nhiêu cái?                     │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  ✓ CÁCH HƯỚNG DẪN CON TỪNG BƯỚC:                       │
│                                                         │
│  ┌─ 🌱 BƯỚC 1: Hiểu đề bài (Concrete) ───────────────┐ │
│  │ Hỏi con: "Con hãy đọc đề và cho mẹ/ba biết..."   │ │
│  │ Hướng dẫn: "Có 28 cái kẹo, cô chia cho 6 bạn..." │ │
│  │ 💡 Mẹo: Dùng 28 viên bi và 6 cái cốc thực hành   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ 🎨 BƯỚC 2: Vẽ sơ đồ (Pictorial) ─────────────────┐ │
│  │ Hướng dẫn con vẽ 6 hộp (đại diện cho 6 bạn)      │ │
│  │ [🧺🍬🍬🍬🍬] [🧺🍬🍬🍬🍬] ... × 6 hộp           │ │
│  │ Còn thừa: 🍬🍬🍬🍬                                │ │
│  │ 📝 Kết luận: Mỗi hộp có 4 cái kẹo, còn thừa 4    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ 🔢 BƯỚC 3: Viết phép tính (Abstract) ────────────┐ │
│  │ Phép chia: 28 : 6 = ?                             │ │
│  │ Bài giải: 28 : 6 = 4 (dư 4)                      │ │
│  │ Giải thích: 6 × 4 = 24, 28 - 24 = 4 (số dư)     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ ✅ BƯỚC 4: Trả lời ──────────────────────────────┐ │
│  │ "Mỗi bạn được 4 cái kẹo và còn thừa 4 cái kẹo." │ │
│  │ ✓ Nhắc con: Luôn viết câu trả lời có đơn vị      │ │
│  └───────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  ⚠️ NHỮNG LỖI THƯỜNG GẶP                               │
│  ✗ Số dư lớn hơn hoặc bằng số chia (28:6=3 dư 10)     │
│  ✗ Quên viết "dư" (28:6=4...4 → SAI!)                 │
├─────────────────────────────────────────────────────────┤
│  💡 MẸO ĐỒNG HÀNH HIỆU QUẢ                             │
│  ✓ Luôn khuyến khích con tự làm trước                 │
│  ✓ Sử dụng đồ vật thực tế để minh họa                 │
│  ✓ Kiên nhẫn lắng nghe cách con giải                  │
│  ✓ Khen ngợi khi con làm đúng hoặc cố gắng            │
└─────────────────────────────────────────────────────────┘
```

### Chức năng
- [x] Pedagogy notice (không dùng ẩn số)
- [x] Hiển thị đề bài
- [x] 4 bước giải theo CPA với màu sắc phân biệt
- [x] Minh họa hình ảnh (pictorial)
- [x] Phần những lỗi thường gặp
- [x] Mẹo đồng hành cho phụ huynh

---

## 🎮 10. STUDENT EXPERIENCE (Màn Hình Học Tập)

### Giao diện

```
┌─────────────────────────────────────────────────────────┐
│  [← Quay lại trang phụ huynh]                           │
├─────────────────────────────────────────────────────────┤
│                      👋                                 │
│              Xin chào An!                               │
│        Hãy cùng học toán vui vẻ nhé                    │
├─────────────────────────────────────────────────────────┤
│  ╭─────────────────────────────────────────────────────╮│
│  │ 🏆 Làm tốt lắm! Tuần này em hoàn thành 12 bài    ││
│  │          [⭐] [🏆] [🎯]                            ││
│  ╰─────────────────────────────────────────────────────╯│
├─────────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐                      │
│  │ ⭐ 48 │ │ ⚡ 5  │ │ 🎯 85% │                      │
│  │ ngôi  │ │ ngày  │ │ làm   │                      │
│  │ sao   │ │ liên  │ │ đúng  │                      │
│  │       │ │ tiếp  │ │       │                      │
│  └────────┘ └────────┘ └────────┘                      │
├─────────────────────────────────────────────────────────┤
│  📅 NHIỆM VỤ HÔM NAY                                    │
│                                                         │
│  ┌─ ✓ Phép chia có dư ─────────────── ⭐⭐⭐⭐⭐ ───┐  │
│  │ 5 bài tập                          [100%]        │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ 📖 Bài toán tổng hợp ──────────────── 3/8 ──────┐  │
│  │ 8 bài tập                          [37.5%]       │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ 🔒 Đổi đơn vị đo ───────────────────────────────┐  │
│  │ Hoàn thành bài trên để mở                        │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  ╭─────────────────────────────────────────────────────╮│
│  │          📱 Bắt đầu học bài mới                   ││
│  │   Quét mã QR trên phiếu bài tập hoặc sách        ││
│  │               [Mở máy quét QR]                    ││
│  ╰─────────────────────────────────────────────────────╯│
├─────────────────────────────────────────────────────────┤
│  🗺️ LỘ TRÌNH HỌC TẬP                                   │
│  [✓] Phép cộng trong phạm vi 1000     ⭐⭐⭐⭐⭐      │
│  [✓] Phép trừ trong phạm vi 1000      ⭐⭐⭐⭐⭐      │
│  [✓] Phép nhân với 2, 3, 4            ⭐⭐⭐⭐        │
│  [✓] Phép chia có dư                   ⭐⭐⭐⭐⭐      │
│  [5] Bài toán có nhiều bước           [Đang học]      │
│  [🔒] Đổi đơn vị đo độ dài                             │
│  [🔒] Phân số đơn giản                                 │
└─────────────────────────────────────────────────────────┘
```

### Chức năng
- [x] Welcome header với tên học sinh
- [x] Achievement banner (thành tích tuần)
- [x] 3 thống kê (sao, streak, tỷ lệ đúng)
- [x] Nhiệm vụ hôm nay với 3 trạng thái
- [x] QR scan entry point
- [x] Learning path với progression
- [x] Gamification (stars, streaks, badges)

---

## 🗂️ DATA MODELS

### Core Entities (từ mockData.ts)

```typescript
// Lớp học
interface MathClass {
  id: string;
  name: string;
  students: number;
  distribution: {
    foundation: number;
    extension: number;
    advanced: number;
  };
}

// Chủ đề toán
interface MathTopic {
  id: string;
  name: string;
  grade: number[];
}

// Học sinh
interface Student {
  id: number;
  name: string;
  class: string;
  avgScore: number;
  weakTopics: string[];
}

// Phân tích lỗi
interface ErrorAnalytics {
  topic: string;
  category: string;
  students: number;
  percent: number;
  errorType: string;
  trend: 'up' | 'down' | 'stable';
  recommendations: string[];
}

// Hoạt động
interface Activity {
  time: string;
  action: string;
  count: string;
}

// Lộ trình học tập
interface LearningPath {
  topic: string;
  status: 'completed' | 'active' | 'locked';
  stars: number;
}

// Tiến độ phụ huynh
interface ParentProgress {
  weeklyCompleted: number;
  dailyStudyTime: number;
  avgScore: number;
  accuracy: number;
  topicProgress: TopicProgress[];
  teacherComment: string;
  teacherName: string;
}

// Bài tập hôm nay
interface TodayAssignment {
  topic: string;
  status: 'completed' | 'in-progress' | 'pending';
  correct: number;
  total: number;
}

// Kết quả chấm bài
interface GradingResult {
  student: {
    name: string;
    class: string;
    studentId: string;
  };
  totalScore: number;
  answers: Answer[];
}

interface Answer {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  points: number;
  errorType?: string;
}
```

---

## 🎨 DESIGN SYSTEM

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#3B82F6` | Teacher, Info |
| Teal | `#14B8A6` | Balance, CPA |
| Green | `#10B981` | Success, Parent |
| Orange | `#F97316` | Warning, Student |
| Red | `#EF4444` | Error |
| Purple | `#A855F7` | Premium, Advanced |
| Yellow | `#FBBF24` | Encouragement |

### 4-Tier Colors

| Tier | Color | Badge |
|------|-------|-------|
| Foundation | Green `#10B981` | `bg-green-500` |
| Standard | Blue `#3B82F6` | `bg-blue-500` |
| Extension | Orange `#F97316` | `bg-orange-500` |
| Advanced | Purple `#A855F7` | `bg-purple-500` |

### CPA Colors

| Step | Color | Border |
|------|-------|--------|
| Concrete | Orange | `border-orange-300` |
| Pictorial | Teal | `border-teal-300` |
| Abstract | Blue | `border-blue-300` |

### Component Patterns

```css
/* Card */
.card {
  background: white;
  border-radius: 1rem; /* rounded-2xl */
  padding: 1.5rem; /* p-6 */
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05); /* shadow-sm */
  border: 1px solid rgb(243 244 246); /* border-gray-100 */
}

/* Button Primary */
.btn-primary {
  background: linear-gradient(to right, #3B82F6, #14B8A6);
  color: white;
  border-radius: 0.75rem; /* rounded-xl */
  padding: 0.75rem 1.5rem; /* py-3 px-6 */
  font-weight: 600; /* font-semibold */
}

/* Progress Bar */
.progress-bar {
  background: rgb(229 231 235); /* bg-gray-200 */
  border-radius: 9999px; /* rounded-full */
  height: 0.5rem; /* h-2 */
}
```

---

## 📋 MVP vs AI Features

### ✅ MVP Scope (Implement Now)

| Feature | Screen |
|---------|--------|
| Role selection | Welcome |
| Dashboard stats | TeacherDashboard, ParentDashboard |
| CPA worksheet creation (manual) | CPADesigner |
| 4-tier differentiation (manual) | DifferentiationScreen |
| PDF export (2 modes) | PDFExportScreen |
| Progress tracking | ParentDashboard, StudentExperience |
| Solutions guide | ParentSolutions |
| Learning path display | StudentExperience |

### ⏳ AI Phase (Defer)

| Feature | Screen |
|---------|--------|
| OCR scanning | AIGradingScreen |
| Auto-grading | AIGradingScreen |
| Error detection | ErrorAnalytics |
| AI recommendations | ErrorAnalytics |
| Auto question generation | CPADesigner |
| Personalized worksheets (auto) | PDFExportScreen |

---

## 🚀 Implementation Priority

### Phase 1: Foundation
1. [ ] Database schema (User, MathClass, MathTopic, Worksheet)
2. [ ] Authentication (Teacher/Parent)
3. [ ] Welcome screen + Role selection
4. [ ] Navigation component

### Phase 2: Teacher Core
5. [ ] Teacher Dashboard (UI + mock data)
6. [ ] CPA Designer (3-step wizard, manual)
7. [ ] Differentiation Screen (4-tier, manual)
8. [ ] Worksheet CRUD

### Phase 3: PDF & Export
9. [ ] PDF Export (Classroom mode)
10. [ ] PDF Export (Personalized mode)
11. [ ] QR code generation

### Phase 4: Parent Features
12. [ ] Parent Dashboard
13. [ ] Parent Solutions (CPA guide)
14. [ ] Student Experience view

### Phase 5: Analytics (UI Only)
15. [ ] Error Analytics (UI with mock data)
16. [ ] AI Grading Screen (UI only)

---

**Phiên bản**: 1.0  
**Ngày tạo**: 2026-01-17  
**Mục đích**: Chuẩn bị lập kế hoạch code cho Smart-MathAI
