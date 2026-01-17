# 🚀 Quick Start Guide - MathAI Tutor

> Bắt đầu nhanh trong 5 phút!

## ⚡ Installation

```bash
# 1. Clone repository (hoặc download ZIP)
git clone <your-repo-url>
cd mathai-tutor

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Mở browser tại: **http://localhost:5173**

---

## 🎯 First Steps

### 1. Choose Your Role

Khi mở app, bạn sẽ thấy Welcome screen với 2 options:

- **👨‍🏫 Giáo viên** - Công cụ soạn bài và quản lý
- **👪 Phụ huynh** - Đồng hành học tập với con

Click vào role bạn muốn explore.

### 2. Explore Teacher Features

Nếu chọn **Giáo viên**, bạn sẽ thấy:

**Dashboard** với 4 quick actions:
1. 📚 **Tạo học liệu CPA** → Click để tạo bài tập CPA
2. 🎯 **Soạn bài theo mục tiêu** → Tạo bài phân hóa 4 cấp độ
3. 📄 **Xuất PDF** → Export PDF có QR code
4. 🤖 **Chấm bài AI** → Upload ảnh để chấm tự động

**Try it out:**
```
Click "Tạo học liệu CPA" 
→ Chọn "Lớp 3"
→ Chọn "Phép chia có dư"
→ Click "Tiếp theo"
→ Xem AI tạo bài tập CPA
```

### 3. Explore Parent Features

Nếu chọn **Phụ huynh**, bạn sẽ thấy:

**Dashboard** với:
- 📊 Tiến độ học tập của con
- 📖 Hướng dẫn giải bài
- 👦 Màn hình học tập của con

**Try it out:**
```
Click "Hướng dẫn giải bài"
→ Xem hướng dẫn giải từng bước (4 bước CPA)
→ Đọc mẹo đồng hành
```

---

## 📁 Project Structure

```
mathai-tutor/
├── components/          # All React components
│   ├── TeacherDashboard.tsx    # Teacher main screen
│   ├── ParentDashboard.tsx     # Parent main screen
│   ├── CPADesigner.tsx         # CPA creator
│   ├── PDFExportScreen.tsx     # PDF export
│   └── ...
├── lib/
│   ├── mockData.ts     # Demo data (replace with API)
│   └── utils.ts        # Helper functions
├── styles/
│   └── globals.css     # Tailwind styles
└── App.tsx             # Main app
```

---

## 🎨 Customization

### Change Colors

Edit `styles/globals.css`:

```css
@theme {
  --color-primary: #3B82F6;    /* Change this */
  --color-secondary: #14B8A6;  /* And this */
}
```

### Add Mock Data

Edit `lib/mockData.ts`:

```typescript
export const mockClasses = [
  { id: '3A', name: 'Lớp 3A', students: 35 },
  // Add more classes here
];
```

### Modify Components

Example - Change dashboard stats:

```typescript
// components/TeacherDashboard.tsx
// Find the stats section and update values
```

---

## 🔌 Connect to Backend

### Step 1: Create API Service

Create `lib/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function login(username: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return response.json();
}

export async function getTeacherDashboard() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/teacher/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
}

// Add more API functions...
```

### Step 2: Replace Mock Data

In components, replace:

```typescript
// Before
import { mockClasses } from '../lib/mockData';
const classes = mockClasses;

// After
import { getClasses } from '../lib/api';
const classes = await getClasses();
```

### Step 3: Add Environment Variables

Create `.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

---

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

Output in `dist/` folder.

### Deploy to Vercel (Fastest)

```bash
npm install -g vercel
vercel
```

Follow prompts. Done! 🎉

See [DEPLOYMENT.md](./DEPLOYMENT.md) for more options.

---

## 🧪 Testing Features

### Test Teacher Flow

1. Click "Giáo viên" on Welcome screen
2. Try "Tạo học liệu CPA"
3. Go through 3 steps
4. See CPA preview
5. Click "Xuất PDF"
6. Try different tiers (Nền tảng, Mở rộng, Nâng cao)

### Test Parent Flow

1. Click "Phụ huynh" on Welcome screen
2. View child progress
3. Click "Hướng dẫn giải bài"
4. Read step-by-step solution
5. Click "Màn hình học tập của con"
6. See student gamification

---

## 💡 Tips

### Hot Reload

Changes auto-refresh! Edit any `.tsx` file and see updates instantly.

### Inspect Components

Use React DevTools:
- Chrome: Install React DevTools extension
- Inspect component props and state

### Debug

```typescript
// Add console.log anywhere
console.log('Debug:', someVariable);
```

### Format Code

```bash
# If you have Prettier
npm run format
```

---

## 🆘 Common Issues

### Port already in use?

Change port in terminal:
```bash
npm run dev -- --port 3000
```

### Module not found?

```bash
rm -rf node_modules
npm install
```

### TypeScript errors?

Restart VS Code TypeScript server:
- Cmd/Ctrl + Shift + P
- "TypeScript: Restart TS Server"

---

## 📚 Next Steps

1. ✅ Explore all features
2. 📖 Read [FEATURES.md](./FEATURES.md) for full feature list
3. 🔧 Read [SETUP.md](./SETUP.md) for detailed setup
4. 🔌 Read [API_SPEC.md](./API_SPEC.md) to connect backend
5. 🚀 Read [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy

---

## 🎓 Learn More

### Key Technologies

- **React 18** - [docs](https://react.dev)
- **TypeScript** - [handbook](https://www.typescriptlang.org/docs)
- **Tailwind CSS** - [docs](https://tailwindcss.com)
- **Vite** - [guide](https://vitejs.dev/guide)

### Components Used

- **Lucide Icons** - [browse](https://lucide.dev)
- **shadcn/ui** - [components](https://ui.shadcn.com)

---

## ✨ What's Included

✅ **9 Full Screens**
- Teacher Dashboard
- CPA Designer (3 steps)
- Differentiation (4 tiers)
- PDF Export (2 modes)
- AI Grading
- Error Analytics
- Parent Dashboard
- Parent Solutions
- Student Experience

✅ **60+ Features** documented in FEATURES.md

✅ **Production Ready**
- Error boundaries
- Loading states
- Toast notifications
- Responsive design
- TypeScript types
- Clean architecture

✅ **Developer Friendly**
- Well-organized code
- Reusable components
- Helper utilities
- Mock data included
- Full documentation

---

## 🤝 Need Help?

1. Check documentation files
2. Read component comments
3. Inspect browser console
4. Check React DevTools

---

**Happy Coding!** 🎉

Start exploring and building amazing educational experiences!
