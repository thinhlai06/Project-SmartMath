# Deployment Guide - MathAI Tutor

> Hướng dẫn deploy frontend MathAI Tutor lên các platforms phổ biến.

## 📦 Chuẩn bị Deploy

### 1. Build Production

```bash
# Install dependencies
npm install

# Run production build
npm run build

# Test production build locally
npm run preview
```

Build output sẽ nằm trong folder `dist/`

### 2. Environment Variables

Tạo file `.env.production`:

```env
# API Backend URL
VITE_API_URL=https://api.yourdomain.com

# Supabase (nếu dùng)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Analytics (optional)
VITE_GA_ID=G-XXXXXXXXXX

# Feature Flags
VITE_ENABLE_AI_GRADING=true
VITE_ENABLE_PDF_EXPORT=true
```

### 3. Performance Checklist

- [ ] Code splitting enabled
- [ ] Images optimized
- [ ] Lazy loading cho heavy components
- [ ] Minification enabled
- [ ] Source maps disabled (production)
- [ ] GZIP compression
- [ ] CDN cho static assets

---

## ☁️ Deploy Options

### Option 1: Vercel (Khuyến nghị)

**Ưu điểm:**
- Tự động deploy từ Git
- Free cho personal projects
- CDN global
- HTTPS tự động
- Preview deployments

**Bước deploy:**

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Configure trong Vercel Dashboard**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Development Command: `npm run dev`

5. **Environment Variables**
- Settings → Environment Variables
- Add tất cả VITE_* variables

6. **Custom Domain** (optional)
- Settings → Domains
- Add domain và follow DNS instructions

**Production URL:** `https://mathai-tutor.vercel.app`

---

### Option 2: Netlify

**Ưu điểm:**
- Dễ setup
- Free SSL
- Form handling
- Serverless functions

**Bước deploy:**

1. **Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
```

2. **Deploy**
```bash
netlify deploy --prod
```

Hoặc **drag & drop** folder `dist/` vào Netlify UI.

3. **netlify.toml** (optional)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

4. **Environment Variables**
- Site settings → Build & deploy → Environment
- Add VITE_* variables

---

### Option 3: GitHub Pages

**Ưu điểm:**
- Free hosting
- Tích hợp với GitHub
- Đơn giản

**Nhược điểm:**
- Không hỗ trợ server-side
- Chậm hơn Vercel/Netlify

**Bước deploy:**

1. **Install gh-pages**
```bash
npm install -D gh-pages
```

2. **Update package.json**
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "homepage": "https://username.github.io/mathai-tutor"
}
```

3. **Deploy**
```bash
npm run deploy
```

4. **GitHub Settings**
- Repository → Settings → Pages
- Source: gh-pages branch
- Custom domain (optional)

**URL:** `https://username.github.io/mathai-tutor`

---

### Option 4: Firebase Hosting

**Ưu điểm:**
- Free tier generous
- CDN global
- Easy integration với Firebase services

**Bước deploy:**

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
firebase login
```

2. **Initialize**
```bash
firebase init hosting
```

Chọn:
- Public directory: `dist`
- Single-page app: Yes
- GitHub auto-deploy: Optional

3. **Deploy**
```bash
npm run build
firebase deploy --only hosting
```

4. **firebase.json**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

---

### Option 5: AWS S3 + CloudFront

**Ưu điểm:**
- Scalability cao
- Professional setup
- Kiểm soát hoàn toàn

**Nhược điểm:**
- Phức tạp hơn
- Có chi phí

**Bước deploy:**

1. **Build**
```bash
npm run build
```

2. **Tạo S3 Bucket**
```bash
aws s3 mb s3://mathai-tutor
```

3. **Configure cho Static Website**
```bash
aws s3 website s3://mathai-tutor \
  --index-document index.html \
  --error-document index.html
```

4. **Upload files**
```bash
aws s3 sync dist/ s3://mathai-tutor
```

5. **Setup CloudFront** (optional cho CDN)
- Create CloudFront distribution
- Origin: S3 bucket
- Enable HTTPS
- Add custom domain

6. **Invalidate Cache khi update**
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_ID \
  --paths "/*"
```

---

## 🔧 Post-Deployment

### 1. Verify Deployment

Checklist:
- [ ] Website loads correctly
- [ ] All pages accessible
- [ ] Navigation works
- [ ] Images load
- [ ] API calls work (nếu có backend)
- [ ] Mobile responsive
- [ ] Performance good (Lighthouse > 90)

### 2. Setup Monitoring

**Google Analytics:**
```typescript
// Add to main.tsx hoặc App.tsx
if (import.meta.env.PROD && import.meta.env.VITE_GA_ID) {
  // Initialize Google Analytics
  window.gtag('config', import.meta.env.VITE_GA_ID);
}
```

**Sentry (Error tracking):**
```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### 3. Performance Optimization

**Enable GZIP:**
- Vercel/Netlify: Tự động
- Custom server: Configure trong server settings

**CDN:**
- Static assets → CDN
- Images → Image CDN (Cloudinary, imgix)

**Caching:**
```html
<!-- index.html -->
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

### 4. SEO

**Add meta tags:**
```html
<!-- index.html -->
<meta name="description" content="Hệ thống gia sư toán AI cho học sinh tiểu học">
<meta name="keywords" content="toán, tiểu học, AI, gia sư">
<meta property="og:title" content="MathAI Tutor">
<meta property="og:description" content="Tiết kiệm 80% thời gian soạn bài">
<meta property="og:image" content="/og-image.png">
```

**robots.txt:**
```
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml
```

---

## 🔐 Security

### 1. Environment Variables

**KHÔNG commit .env files vào Git!**

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

### 2. CORS

Nếu có backend riêng, configure CORS:

```javascript
// Backend
app.use(cors({
  origin: [
    'https://mathai-tutor.vercel.app',
    'https://yourdomain.com'
  ],
  credentials: true
}));
```

### 3. HTTPS

- Vercel/Netlify: Tự động
- Custom domain: Bắt buộc SSL certificate

### 4. Content Security Policy

Add headers:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline';
```

---

## 🚀 CI/CD Setup

### GitHub Actions Example

Tạo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build
      env:
        VITE_API_URL: ${{ secrets.VITE_API_URL }}
        
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📊 Monitoring & Analytics

### 1. Performance Monitoring

**Lighthouse CI:**
```bash
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage
```

**Web Vitals:**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 2. Error Tracking

- Sentry
- LogRocket
- Bugsnag

### 3. User Analytics

- Google Analytics 4
- Mixpanel
- Plausible (privacy-friendly)

---

## 🔄 Update Strategy

### 1. Versioning

```json
// package.json
{
  "version": "1.0.0"
}
```

### 2. Changelog

Maintain CHANGELOG.md:
```markdown
# Changelog

## [1.1.0] - 2026-01-20
### Added
- New AI grading feature
- PDF export improvements

### Fixed
- Bug in CPA designer
```

### 3. Rolling Updates

- Deploy to staging first
- Test thoroughly
- Deploy to production
- Monitor for errors
- Rollback if needed

---

## 🆘 Troubleshooting

### Build fails

```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### 404 on refresh

Configure redirects to index.html:

**Vercel:** vercel.json
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

**Netlify:** _redirects
```
/*    /index.html   200
```

### Slow load time

- Enable code splitting
- Lazy load components
- Optimize images
- Use CDN

### CORS errors

- Check backend CORS settings
- Verify API URL in env vars
- Check browser console for details

---

## 📞 Support

### Production Issues

1. Check error logs
2. Verify environment variables
3. Check backend status
4. Review recent deployments
5. Rollback if needed

### Rollback

**Vercel:**
```bash
vercel rollback
```

**Netlify:**
- Deploys → Previous deploy → Publish

**Firebase:**
```bash
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL TARGET_SITE_ID:live
```

---

## ✅ Deployment Checklist

Pre-deployment:
- [ ] All tests passing
- [ ] No console errors
- [ ] Build successful
- [ ] Environment variables set
- [ ] Performance optimized
- [ ] Security headers configured

Post-deployment:
- [ ] Verify all pages load
- [ ] Test user flows
- [ ] Check mobile responsive
- [ ] Monitor error rates
- [ ] Performance metrics good
- [ ] Analytics working

---

**Happy Deploying!** 🚀

**Version**: 1.0  
**Last Updated**: 2026-01-16
