# MathAI Tutor - Hệ thống Gia sư Toán AI

> Hệ thống hỗ trợ giáo viên và phụ huynh trong việc dạy và học toán cho học sinh tiểu học (lớp 1-5) theo chương trình GDPT 2018 của Việt Nam.

## 🎯 Tính năng chính

### 👨‍🏫 Dành cho Giáo viên
- **Tiết kiệm 80% thời gian soạn bài**
- Tạo học liệu CPA (Concrete-Pictorial-Abstract) tự động
- Phân hóa đa cấp độ (4 tầng: Foundation, Standard, Extension, Advanced)
- Xuất PDF thông minh với QR code định danh
- Chấm bài tự động bằng AI (OCR)
- Phân tích lỗi sai và đề xuất can thiệp

### 👪 Dành cho Phụ huynh
- Cẩm nang đồng hành dễ hiểu (không dùng ẩn số x)
- Hướng dẫn giải bài từng bước theo phương pháp mới
- Theo dõi tiến độ học tập của con
- Bài tập bổ trợ cá nhân hóa
- Xem màn hình học tập của con

## 🚀 Cài đặt và Chạy

```bash
# Clone repository
git clone <repository-url>
cd mathai-tutor

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
```

## 📁 Cấu trúc Project

```
/
├── components/          # React components
│   ├── ui/             # UI components (shadcn/ui)
│   ├── figma/          # Figma imported components
│   ├── TeacherDashboard.tsx
│   ├── ParentDashboard.tsx
│   ├── CPADesigner.tsx
│   ├── DifferentiationScreen.tsx
│   ├── PDFExportScreen.tsx
│   ├── AIGradingScreen.tsx
│   ├── ErrorAnalytics.tsx
│   ├── ParentSolutions.tsx
│   ├── StudentExperience.tsx
│   ├── Navigation.tsx
│   ├── Welcome.tsx
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   ├── Toast.tsx
│   ├── ConfirmDialog.tsx
│   ├── StatCard.tsx
│   ├── ProgressBar.tsx
│   └── Badge.tsx
├── lib/                # Utilities and helpers
│   ├── utils.ts        # Utility functions
│   └── mockData.ts     # Mock data for demo
├── hooks/              # Custom React hooks
│   └── useLocalStorage.ts
├── styles/
│   └── globals.css     # Global styles with Tailwind v4
├── App.tsx             # Main app component
├── FEATURES.md         # Full feature documentation
└── README.md           # This file
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Education & Trust
- **Secondary**: Teal (#14B8A6) - Balance
- **Success**: Green (#10B981) - Achievement
- **Warning**: Orange (#F97316) - Attention
- **Error**: Red (#EF4444) - Error states
- **Premium**: Purple (#A855F7) - Advanced features

### Typography
- Large, readable fonts
- High contrast for accessibility
- Default font from globals.css

### Components
- Rounded corners (rounded-lg, rounded-xl, rounded-2xl)
- Soft shadows (shadow-sm, shadow-md, shadow-lg)
- Smooth transitions
- Clear visual hierarchy

## 🔧 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

## 📱 Responsive Design

- **Mobile**: < 640px (default)
- **Tablet**: ≥ 640px (sm:)
- **Desktop**: ≥ 1024px (lg:)

Tất cả màn hình được tối ưu cho cả desktop và mobile.

## 🎓 Pedagogy

Hệ thống tuân thủ:
- **Phương pháp CPA** (Singapore Math)
  - Concrete: Gắn với thực tế đời sống
  - Pictorial: Minh họa bằng hình vẽ
  - Abstract: Ký hiệu toán học
- **Chương trình GDPT 2018** của Việt Nam
- Phù hợp tâm lý trẻ 6-11 tuổi
- Không sử dụng ẩn số (x) cho phụ huynh

## 📊 Key Features Detail

### 1. CPA Designer
Tạo bài tập theo 3 bước:
1. Chọn khối lớp và chủ đề
2. Xác định mục tiêu bài học
3. Xem trước và chỉnh sửa

### 2. Differentiation
Tự động tạo 4 cấp độ:
- Foundation: Củng cố nền tảng
- Standard: Phù hợp đa số
- Extension: Thử thách tư duy
- Advanced: Tổng hợp nâng cao

### 3. PDF Export
2 chế độ:
- **Classroom PDF**: Phân tầng cho cả lớp (3 tầng)
- **Personalized PDF**: Bài tập riêng cho từng học sinh

### 4. AI Grading
- OCR nhận dạng chữ viết tay
- Chấm điểm tự động
- Phát hiện loại lỗi
- Batch processing (50 bài cùng lúc)

### 5. Error Analytics
- Phân tích lỗi phổ biến
- Gợi ý can thiệp sư phạm
- Theo dõi học sinh cần hỗ trợ
- Tạo bài tập bổ trợ tự động

## 🔐 Data & Privacy

- Auto-anonymization của dữ liệu học sinh
- Chỉ lưu kết quả học tập, không lưu ảnh bài làm
- QR code để tracking không chạm (contactless)
- Tuân thủ quy định bảo vệ dữ liệu

## 🎯 Performance Goals

- ⚡ Tiết kiệm 80% thời gian soạn bài
- 📄 Tiết kiệm 30% giấy và mực in (Eco-Layout)
- 🎓 Phân hóa 4 cấp độ tự động
- 📱 Offline-first cho học sinh
- 🤖 AI grading accuracy > 95%

## 🌟 Demo Account

### Teacher Demo
- Username: `demo-teacher`
- Classes: 3A, 3B
- Students: 67

### Parent Demo
- Username: `demo-parent`
- Child: Nguyễn Văn An (Class 3A)

## 📚 Documentation

- [FEATURES.md](./FEATURES.md) - Danh sách đầy đủ tất cả tính năng
- [Attributions.md](./Attributions.md) - Tín dụng và giấy phép

## 🤝 Contributing

Frontend đã hoàn thiện và sẵn sàng sử dụng. Để kết nối backend:

1. Tạo API endpoints theo structure trong `lib/mockData.ts`
2. Thay thế mock data bằng API calls
3. Implement authentication
4. Kết nối Supabase cho database (optional)

## 📞 Support

Hệ thống này được thiết kế để demo và prototype. Để triển khai production, cần:
- Backend API
- Database (PostgreSQL/Supabase)
- Authentication system
- File storage cho PDF
- OCR service integration
- Payment gateway (cho subscription)

## 📄 License

Xem file LICENSE để biết thêm thông tin.

---

**Phiên bản**: 1.0.0  
**Ngày cập nhật**: 2026-01-16  
**Trạng thái**: Production Ready (Frontend)
