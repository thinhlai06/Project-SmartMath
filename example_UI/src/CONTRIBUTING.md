# 🤝 Contributing to MathAI Tutor

Cảm ơn bạn đã quan tâm đến việc đóng góp cho MathAI Tutor! Tài liệu này sẽ hướng dẫn bạn cách contribute hiệu quả.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Bug Reports](#bug-reports)
8. [Feature Requests](#feature-requests)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Our Standards

**Positive behaviors:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behaviors:**
- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could be considered inappropriate

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.0.0
- npm ≥ 9.0.0
- Git
- Code editor (VS Code recommended)

### Setup Development Environment

1. **Fork the repository**
   - Click "Fork" button on GitHub
   - Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mathai-tutor.git
   cd mathai-tutor
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/mathai-tutor.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

---

## 🔄 Development Workflow

### 1. Sync with Upstream

Before starting work, sync your fork:

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### 2. Create Feature Branch

```bash
git checkout -b feature/amazing-feature
```

Branch naming convention:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 3. Make Changes

- Write clean, readable code
- Follow coding standards (see below)
- Add comments where necessary
- Test your changes thoroughly

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

See [Commit Guidelines](#commit-guidelines) for commit message format.

### 5. Push to GitHub

```bash
git push origin feature/amazing-feature
```

### 6. Create Pull Request

- Go to your fork on GitHub
- Click "Pull Request"
- Fill in the template
- Wait for review

---

## 💻 Coding Standards

### TypeScript

**Use TypeScript for all new code:**

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  role: 'teacher' | 'parent';
}

function greetUser(user: User): string {
  return `Hello, ${user.name}!`;
}

// ❌ Bad
function greetUser(user: any) {
  return `Hello, ${user.name}!`;
}
```

### React Components

**Use functional components with hooks:**

```typescript
// ✅ Good
export function MyComponent({ title }: { title: string }) {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
    </div>
  );
}

// ❌ Bad - No types
export function MyComponent({ title }) {
  const [count, setCount] = useState(0);
  return <div>{title}</div>;
}
```

### File Organization

```typescript
// Order of imports
import { useState } from 'react';                    // React
import { useRouter } from 'next/router';             // Next/External
import { Button } from '@/components/ui/button';     // Internal UI
import { getUser } from '@/lib/api';                 // Utilities
import type { User } from '@/types';                 // Types
```

### Naming Conventions

```typescript
// Components: PascalCase
export function TeacherDashboard() {}

// Functions: camelCase
function calculateScore() {}

// Constants: UPPER_SNAKE_CASE
const MAX_STUDENTS = 100;

// Types/Interfaces: PascalCase
interface Student {}
type UserRole = 'teacher' | 'parent';

// Files: kebab-case
// teacher-dashboard.tsx
// error-analytics.tsx
```

### Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from './ui/button';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

// 3. Component
export function MyComponent({ title, onAction }: MyComponentProps) {
  // 3a. Hooks
  const [isOpen, setIsOpen] = useState(false);
  
  // 3b. Derived state
  const displayTitle = title.toUpperCase();
  
  // 3c. Event handlers
  const handleClick = () => {
    setIsOpen(!isOpen);
    onAction();
  };
  
  // 3d. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 3e. Early returns
  if (!title) return null;
  
  // 3f. Render
  return (
    <div>
      <h1>{displayTitle}</h1>
      <Button onClick={handleClick}>Toggle</Button>
    </div>
  );
}
```

### Tailwind CSS

**Use Tailwind utility classes:**

```tsx
// ✅ Good
<div className="bg-white rounded-xl p-6 shadow-sm">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>

// ❌ Bad - Inline styles
<div style={{ background: 'white', borderRadius: '12px' }}>
  <h1 style={{ fontSize: '24px' }}>Title</h1>
</div>
```

**Use cn() helper for conditional classes:**

```tsx
import { cn } from '@/lib/utils';

<button
  className={cn(
    "px-4 py-2 rounded-lg",
    isActive ? "bg-blue-500 text-white" : "bg-gray-100"
  )}
>
  Button
</button>
```

---

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(teacher): add CPA designer step 3 preview"

# Bug fix
git commit -m "fix(pdf): correct QR code generation logic"

# Documentation
git commit -m "docs: update API specification for grading endpoint"

# Refactoring
git commit -m "refactor(utils): simplify date formatting functions"

# Multiple changes
git commit -m "feat(teacher): add batch grading

- Add upload multiple images
- Implement progress tracking
- Add error handling

Closes #123"
```

### Rules

1. Use present tense ("add feature" not "added feature")
2. Use imperative mood ("move cursor to..." not "moves cursor to...")
3. First line max 72 characters
4. Reference issues and PRs in footer

---

## 🔍 Pull Request Process

### Before Creating PR

- [ ] Code follows style guidelines
- [ ] All tests pass (if applicable)
- [ ] No console.log or debugging code
- [ ] Documentation updated
- [ ] Self-reviewed the code

### PR Title Format

Same as commit messages:

```
feat(scope): description
fix(scope): description
docs(scope): description
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Item 1
- Item 2

## Screenshots (if applicable)
[Add screenshots]

## Testing
How to test the changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least 1 approval required
3. **Testing**: Reviewer tests the changes
4. **Merge**: Squash and merge to main

---

## 🐛 Bug Reports

### Before Reporting

- Search existing issues
- Try latest version
- Reproduce on clean install

### Bug Report Template

```markdown
## Bug Description
Clear and concise description

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- OS: [e.g., macOS 13.0]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.0.0]
- Version: [e.g., 1.0.0]

## Additional Context
Any other information
```

---

## ✨ Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear and concise description

## Problem it Solves
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
What other solutions did you consider?

## Additional Context
Mockups, examples, etc.

## Implementation Complexity
- [ ] Simple (< 1 day)
- [ ] Medium (1-3 days)
- [ ] Complex (> 3 days)
```

---

## 🧪 Testing

### Manual Testing

Test your changes in:
- Chrome/Edge
- Firefox
- Safari (if possible)
- Mobile view (responsive)

### Testing Checklist

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] No breaking changes
- [ ] Performance acceptable

---

## 📚 Documentation

### When to Update Docs

- Adding new feature → Update FEATURES.md
- API changes → Update API_SPEC.md
- Setup changes → Update SETUP.md
- Deployment changes → Update DEPLOYMENT.md

### Documentation Style

- Clear and concise
- Use examples
- Add code snippets
- Include screenshots if helpful

---

## 🎨 Design Guidelines

### UI/UX Principles

1. **Consistency**: Follow existing patterns
2. **Simplicity**: Keep UI clean and minimal
3. **Accessibility**: Support keyboard navigation
4. **Responsive**: Mobile-first approach

### Color Usage

See `styles/globals.css` for color palette:
- Blue: Primary (teacher)
- Green: Success (parent)
- Orange: Warning/attention
- Red: Error

---

## 🔐 Security

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Email: security@example.com

### Security Checklist

- [ ] No API keys in code
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Use HTTPS
- [ ] Follow OWASP guidelines

---

## 📞 Getting Help

### Resources

- [INDEX.md](./INDEX.md) - Documentation index
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [SETUP.md](./SETUP.md) - Setup guide

### Questions

- Check documentation first
- Search existing issues
- Create discussion (not issue)

---

## 🎉 Recognition

Contributors will be:
- Listed in README
- Mentioned in release notes
- Added to contributors list

---

## ✅ Contribution Checklist

### For Code Changes

- [ ] Fork and clone repository
- [ ] Create feature branch
- [ ] Write code following standards
- [ ] Test thoroughly
- [ ] Commit with proper message
- [ ] Create pull request
- [ ] Respond to review comments
- [ ] Celebrate! 🎉

### For Documentation

- [ ] Check which file to update
- [ ] Make clear, concise changes
- [ ] Add examples if needed
- [ ] Submit pull request

---

**Thank you for contributing to MathAI Tutor!** 🙏

Every contribution, no matter how small, is valuable and appreciated.

---

**Questions?** Open a discussion on GitHub!
