# Hướng dẫn Setup và Triển khai

## 📋 Yêu cầu Hệ thống

### Môi trường Development
- Node.js ≥ 18.0.0
- npm ≥ 9.0.0 hoặc pnpm/yarn
- Git
- Code editor (VS Code khuyến nghị)

### Trình duyệt hỗ trợ
- Chrome/Edge ≥ 90
- Firefox ≥ 88
- Safari ≥ 14

## 🚀 Cài đặt Nhanh

### 1. Clone Repository

```bash
git clone <repository-url>
cd mathai-tutor
```

### 2. Cài đặt Dependencies

Sử dụng npm:
```bash
npm install
```

Hoặc pnpm (khuyến nghị - nhanh hơn):
```bash
pnpm install
```

Hoặc yarn:
```bash
yarn install
```

### 3. Chạy Development Server

```bash
npm run dev
```

Mở trình duyệt tại: `http://localhost:5173`

### 4. Build Production

```bash
npm run build
```

File build sẽ nằm trong folder `dist/`

### 5. Preview Production Build

```bash
npm run preview
```

## 🔧 Cấu hình

### Tailwind CSS

File cấu hình: `styles/globals.css`

Tailwind v4 đã được cấu hình với:
- Custom color palette
- Typography defaults
- Component base styles

**Không cần** `tailwind.config.js` vì đang dùng Tailwind v4.

### TypeScript

File cấu hình: `tsconfig.json`

Đã được setup với:
- Strict mode
- Path aliases
- React JSX support

### Vite

File cấu hình: `vite.config.ts`

Optimizations:
- Fast HMR (Hot Module Replacement)
- Code splitting
- Asset optimization

## 📁 Cấu trúc Thư mục Chi tiết

```
mathai-tutor/
│
├── public/                  # Static assets
│   └── (images, fonts, etc.)
│
├── src/ (root /)
│   │
│   ├── components/          # React Components
│   │   ├── ui/             # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   │
│   │   ├── figma/          # Figma imported components
│   │   │   └── ImageWithFallback.tsx
│   │   │
│   │   ├── TeacherDashboard.tsx      # Main teacher screen
│   │   ├── ParentDashboard.tsx       # Main parent screen
│   │   ├── CPADesigner.tsx           # CPA material creator
│   │   ├── DifferentiationScreen.tsx # Differentiation tool
│   │   ├── PDFExportScreen.tsx       # PDF export interface
│   │   ├── AIGradingScreen.tsx       # AI grading interface
│   │   ├── ErrorAnalytics.tsx        # Error analysis screen
│   │   ├── ParentSolutions.tsx       # Parent guide screen
│   │   ├── StudentExperience.tsx     # Student view
│   │   ├── Navigation.tsx            # Top navigation
│   │   ├── Welcome.tsx               # Landing/role selection
│   │   ├── LoadingSpinner.tsx        # Loading states
│   │   ├── EmptyState.tsx            # Empty state component
│   │   ├── ErrorBoundary.tsx         # Error handling
│   │   ├── Toast.tsx                 # Toast notifications
│   │   ├── ConfirmDialog.tsx         # Confirmation dialogs
│   │   ├── StatCard.tsx              # Statistics card
│   │   ├── ProgressBar.tsx           # Progress bar component
│   │   └── Badge.tsx                 # Badge component
│   │
│   ├── lib/                # Utilities & Helpers
│   │   ├── utils.ts        # General utilities
│   │   └── mockData.ts     # Demo/mock data
│   │
│   ├── hooks/              # Custom React Hooks
│   │   └── useLocalStorage.ts
│   │
│   ├── styles/             # Global Styles
│   │   └── globals.css     # Tailwind + custom CSS
│   │
│   ├── App.tsx             # Main App component
│   └── main.tsx            # Entry point
│
├── FEATURES.md             # Full feature documentation
├── README.md               # Project overview
├── SETUP.md                # This file
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
└── .gitignore             # Git ignore rules
```

## 🎨 Customization

### Thay đổi Color Palette

Edit `styles/globals.css`:

```css
@theme {
  --color-primary: #3B82F6;    /* Blue */
  --color-secondary: #14B8A6;  /* Teal */
  --color-success: #10B981;    /* Green */
  /* ... */
}
```

### Thêm Custom Components

```bash
# Tạo component mới
touch src/components/MyComponent.tsx
```

### Sử dụng shadcn/ui Components

Components có sẵn trong `components/ui/`:
- Button
- Card
- Badge
- Dialog
- Tabs
- Table
- ... và nhiều hơn

## 🔌 Kết nối Backend

### Mock Data → API Migration

1. **Tìm mock data** trong `lib/mockData.ts`
2. **Tạo API service**:

```typescript
// lib/api.ts
export async function getClasses() {
  const response = await fetch('/api/classes');
  return response.json();
}
```

3. **Thay thế trong components**:

```typescript
// Before
import { mockClasses } from '../lib/mockData';

// After
import { getClasses } from '../lib/api';
const classes = await getClasses();
```

### Environment Variables

Tạo file `.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Sử dụng trong code:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🧪 Testing

### Unit Tests (cần setup)

```bash
npm install -D vitest @testing-library/react
```

### E2E Tests (cần setup)

```bash
npm install -D playwright
```

## 📦 Deploy

### Deploy tới Vercel

```bash
npm install -g vercel
vercel
```

### Deploy tới Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

### Deploy tới GitHub Pages

```bash
npm install -D gh-pages

# Add to package.json:
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}

npm run deploy
```

## 🐛 Troubleshooting

### Port already in use

```bash
# Change port in vite.config.ts
export default {
  server: {
    port: 3000  // Change to any available port
  }
}
```

### Module not found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors

```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Build errors

```bash
# Check for TypeScript errors
npm run type-check

# Clean build
rm -rf dist
npm run build
```

## 💡 Tips & Best Practices

### 1. Code Organization
- Một component = một file
- Group related components trong subfolders
- Tách logic phức tạp thành custom hooks

### 2. Performance
- Lazy load heavy components
- Memoize expensive calculations
- Use React.memo cho components render nhiều lần

### 3. Accessibility
- Luôn có alt text cho images
- Semantic HTML
- Keyboard navigation support
- ARIA labels khi cần

### 4. Git Workflow
- Feature branches: `feature/ten-tinh-nang`
- Commit messages rõ ràng
- Pull request trước khi merge

## 📚 Tài liệu Tham khảo

- [React Documentation](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Guide](https://vitejs.dev/guide)
- [Lucide Icons](https://lucide.dev)

## 🆘 Hỗ trợ

Nếu gặp vấn đề:

1. Check console logs
2. Xem FEATURES.md để hiểu flow
3. Review code examples trong components
4. Google error message
5. Tạo issue với đầy đủ thông tin

---

**Happy Coding!** 🚀
