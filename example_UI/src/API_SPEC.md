# API Specification - MathAI Tutor Backend

> Tài liệu này mô tả API endpoints cần implement cho backend để kết nối với frontend.

## 🔐 Authentication

### POST /api/auth/login
Đăng nhập người dùng.

**Request:**
```json
{
  "username": "string",
  "password": "string",
  "role": "teacher" | "parent"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "string",
    "name": "string",
    "role": "teacher" | "parent",
    "email": "string"
  }
}
```

### POST /api/auth/logout
Đăng xuất người dùng.

---

## 👨‍🏫 Teacher APIs

### GET /api/teacher/dashboard
Lấy dữ liệu dashboard cho giáo viên.

**Response:**
```json
{
  "stats": {
    "totalStudents": 142,
    "newStudentsThisWeek": 3,
    "avgPrepTime": 2.5,
    "worksheetsCreated": 48,
    "avgClassScore": 8.2,
    "scoreImprovement": 0.12
  },
  "recentActivities": [
    {
      "time": "10 phút trước",
      "action": "Chấm bài kiểm tra lớp 3A",
      "count": "35 bài"
    }
  ],
  "errorSummary": [
    {
      "topic": "Phép chia có dư",
      "students": 23,
      "percent": 68,
      "trend": "down"
    }
  ]
}
```

### GET /api/teacher/classes
Lấy danh sách lớp học.

**Response:**
```json
{
  "classes": [
    {
      "id": "3A",
      "name": "Lớp 3A",
      "students": 35,
      "distribution": {
        "foundation": 8,
        "extension": 18,
        "advanced": 9
      }
    }
  ]
}
```

### GET /api/teacher/topics?grade={grade}
Lấy danh sách chủ đề theo khối lớp.

**Parameters:**
- `grade`: 1-5 (optional)

**Response:**
```json
{
  "topics": [
    {
      "id": "division",
      "name": "Phép chia có dư",
      "grade": [3, 4]
    }
  ]
}
```

### POST /api/teacher/cpa/create
Tạo học liệu CPA.

**Request:**
```json
{
  "grade": 3,
  "topicId": "division",
  "objective": "Học sinh hiểu và thực hiện được phép chia có dư...",
  "exerciseCounts": {
    "concrete": 5,
    "pictorial": 5,
    "abstract": 5
  }
}
```

**Response:**
```json
{
  "id": "worksheet-123",
  "content": {
    "concrete": [
      {
        "question": "Có 23 cái kẹo...",
        "type": "concrete"
      }
    ],
    "pictorial": [...],
    "abstract": [...]
  },
  "createdAt": "2026-01-16T10:00:00Z"
}
```

### POST /api/teacher/differentiation/create
Tạo bài tập phân hóa.

**Request:**
```json
{
  "grade": 3,
  "topicId": "division",
  "objective": "Học sinh hiểu và thực hiện được...",
  "tiers": ["foundation", "standard", "extension", "advanced"]
}
```

**Response:**
```json
{
  "id": "diff-123",
  "tiers": {
    "foundation": {
      "exercises": [...]
    },
    "standard": {...},
    "extension": {...},
    "advanced": {...}
  }
}
```

### POST /api/teacher/pdf/export
Tạo và xuất PDF.

**Request:**
```json
{
  "type": "classroom" | "personalized",
  "classId": "3A",
  "worksheetId": "worksheet-123",
  "settings": {
    "paperSize": "A4",
    "includeQR": true,
    "ecoLayout": true
  },
  "studentIds": ["student-1", "student-2"] // for personalized only
}
```

**Response:**
```json
{
  "pdfUrl": "https://storage.example.com/pdfs/worksheet-123.pdf",
  "qrCodes": [
    {
      "studentId": "student-1",
      "qrData": "encrypted-data"
    }
  ],
  "expiresAt": "2026-01-23T10:00:00Z"
}
```

### POST /api/teacher/grading/upload
Upload ảnh bài làm để chấm.

**Request:** (multipart/form-data)
```
image: File
worksheetId: string
classId: string
```

**Response:**
```json
{
  "jobId": "grading-job-123",
  "status": "processing",
  "estimatedTime": 30
}
```

### GET /api/teacher/grading/{jobId}
Lấy kết quả chấm bài.

**Response:**
```json
{
  "status": "completed",
  "results": [
    {
      "studentId": "student-1",
      "studentName": "Nguyễn Văn An",
      "totalScore": 8.5,
      "answers": [
        {
          "question": "Bài 1",
          "studentAnswer": "23 : 5 = 4 (dư 3)",
          "correctAnswer": "23 : 5 = 4 (dư 3)",
          "isCorrect": true,
          "points": 3
        }
      ]
    }
  ]
}
```

### POST /api/teacher/grading/batch
Chấm nhiều bài cùng lúc.

**Request:** (multipart/form-data)
```
images: File[]
worksheetId: string
classId: string
```

**Response:**
```json
{
  "jobId": "batch-grading-123",
  "totalImages": 35,
  "status": "processing"
}
```

### GET /api/teacher/analytics/errors
Lấy phân tích lỗi sai.

**Parameters:**
- `classId`: string (optional)
- `topicId`: string (optional)
- `from`: date (optional)
- `to`: date (optional)

**Response:**
```json
{
  "commonErrors": [
    {
      "topic": "Phép chia có dư",
      "category": "Số học",
      "students": 23,
      "percent": 68,
      "errorType": "Sai khi tính số dư",
      "trend": "down",
      "recommendations": [
        "Sử dụng đồ vật cụ thể để minh họa",
        "Luyện tập thêm 5-7 bài tương tự"
      ]
    }
  ],
  "studentWeaknesses": [
    {
      "studentId": "student-1",
      "name": "Nguyễn Văn An",
      "class": "3A",
      "weakTopics": ["Phép chia có dư", "Đổi đơn vị"],
      "avgScore": 6.5
    }
  ]
}
```

### GET /api/teacher/students
Lấy danh sách học sinh.

**Parameters:**
- `classId`: string (optional)

**Response:**
```json
{
  "students": [
    {
      "id": "student-1",
      "name": "Nguyễn Văn An",
      "class": "3A",
      "avgScore": 8.2,
      "weakTopics": ["Phép chia có dư"],
      "parentId": "parent-1"
    }
  ]
}
```

---

## 👪 Parent APIs

### GET /api/parent/dashboard
Lấy dữ liệu dashboard cho phụ huynh.

**Response:**
```json
{
  "subscription": {
    "tier": "premium",
    "expiresAt": "2026-06-30T00:00:00Z"
  },
  "childProgress": {
    "weeklyCompleted": 12,
    "dailyStudyTime": 25,
    "avgScore": 8.2,
    "accuracy": 85,
    "topicProgress": [
      {
        "topic": "Phép chia có dư",
        "status": "mastered",
        "percent": 90
      }
    ]
  },
  "teacherComment": {
    "text": "An đã có tiến bộ rõ rệt...",
    "teacherName": "Cô Lan",
    "date": "2026-01-15T10:00:00Z"
  },
  "todayAssignments": [
    {
      "topic": "Phép chia có dư",
      "status": "completed",
      "correct": 5,
      "total": 5
    }
  ]
}
```

### GET /api/parent/solutions/{worksheetId}
Lấy hướng dẫn giải bài cho phụ huynh.

**Response:**
```json
{
  "worksheet": {
    "id": "worksheet-123",
    "topic": "Phép chia có dư",
    "grade": 3
  },
  "problem": {
    "question": "Cô giáo có 28 cái kẹo...",
    "difficulty": "standard"
  },
  "solution": {
    "steps": [
      {
        "step": 1,
        "type": "concrete",
        "title": "Hiểu đề bài",
        "content": "Hỏi con: Con hãy đọc đề...",
        "tips": "Sử dụng đồ vật thực tế..."
      },
      {
        "step": 2,
        "type": "pictorial",
        "title": "Vẽ sơ đồ",
        "content": "Hướng dẫn con vẽ...",
        "illustration": "base64-image"
      },
      {
        "step": 3,
        "type": "abstract",
        "title": "Viết phép tính",
        "content": "28 : 6 = 4 (dư 4)"
      },
      {
        "step": 4,
        "type": "answer",
        "title": "Trả lời",
        "content": "Mỗi bạn được 4 cái kẹo..."
      }
    ],
    "commonMistakes": [
      {
        "mistake": "Số dư lớn hơn hoặc bằng số chia",
        "explanation": "Ví dụ: 28 : 6 = 3 (dư 10) → SAI!"
      }
    ],
    "parentTips": [
      "Khuyến khích con tự làm trước",
      "Sử dụng đồ vật thực tế"
    ]
  }
}
```

### GET /api/parent/child/progress
Lấy chi tiết tiến độ học tập của con.

**Response:**
```json
{
  "childId": "student-1",
  "childName": "An",
  "class": "3A",
  "statistics": {
    "totalStars": 48,
    "streakDays": 5,
    "accuracy": 85,
    "weeklyCompleted": 12
  },
  "missions": [
    {
      "topic": "Phép chia có dư",
      "status": "completed",
      "exercises": 5,
      "stars": 5
    },
    {
      "topic": "Bài toán tổng hợp",
      "status": "in-progress",
      "current": 3,
      "total": 8
    }
  ],
  "learningPath": [
    {
      "topic": "Phép cộng trong phạm vi 1000",
      "status": "completed",
      "stars": 5
    },
    {
      "topic": "Bài toán có nhiều bước",
      "status": "active",
      "stars": 0
    },
    {
      "topic": "Đổi đơn vị đo độ dài",
      "status": "locked",
      "stars": 0
    }
  ]
}
```

### POST /api/parent/message/teacher
Gửi tin nhắn cho giáo viên.

**Request:**
```json
{
  "teacherId": "teacher-1",
  "subject": "Hỏi về bài tập",
  "message": "Cô ơi, con em không hiểu...",
  "attachments": []
}
```

**Response:**
```json
{
  "messageId": "msg-123",
  "status": "sent",
  "sentAt": "2026-01-16T10:00:00Z"
}
```

---

## 📊 Common Data Models

### Student
```typescript
interface Student {
  id: string;
  name: string;
  class: string;
  grade: number;
  avgScore: number;
  weakTopics: string[];
  parentId: string;
  teacherId: string;
  createdAt: string;
}
```

### Worksheet
```typescript
interface Worksheet {
  id: string;
  teacherId: string;
  grade: number;
  topicId: string;
  objective: string;
  type: 'cpa' | 'differentiation' | 'personalized';
  content: {
    concrete?: Exercise[];
    pictorial?: Exercise[];
    abstract?: Exercise[];
  } | {
    foundation?: Exercise[];
    standard?: Exercise[];
    extension?: Exercise[];
    advanced?: Exercise[];
  };
  createdAt: string;
  updatedAt: string;
}
```

### Exercise
```typescript
interface Exercise {
  id: string;
  question: string;
  answer: string;
  type: 'concrete' | 'pictorial' | 'abstract';
  difficulty: 'foundation' | 'standard' | 'extension' | 'advanced';
  points: number;
  hints?: string[];
  illustration?: string; // base64 or URL
}
```

### GradingResult
```typescript
interface GradingResult {
  id: string;
  studentId: string;
  worksheetId: string;
  totalScore: number;
  maxScore: number;
  answers: {
    questionId: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    points: number;
    errorType?: string;
  }[];
  gradedAt: string;
  gradedBy: 'ai' | 'manual';
}
```

### ErrorAnalysis
```typescript
interface ErrorAnalysis {
  topic: string;
  category: string;
  students: number;
  percent: number;
  errorType: string;
  trend: 'up' | 'down' | 'stable';
  recommendations: string[];
}
```

---

## 🔒 Security & Privacy

### Authentication
- JWT tokens với expiration
- Refresh token mechanism
- Role-based access control (RBAC)

### Data Protection
- Auto-anonymization của student data
- GDPR/PDPA compliance
- Encrypted storage cho sensitive data
- No retention của images sau grading

### Rate Limiting
- 100 requests/minute per user
- 10 PDF exports/hour per teacher
- 50 grading jobs/hour per teacher

---

## 📝 Error Codes

### Standard Errors
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED` - Authentication required
- `INVALID_TOKEN` - Token invalid or expired
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Input validation failed
- `RATE_LIMIT` - Rate limit exceeded
- `SERVER_ERROR` - Internal server error

---

## 🧪 Testing

### Example cURL Requests

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo-teacher","password":"demo123","role":"teacher"}'
```

**Get Dashboard:**
```bash
curl -X GET http://localhost:3000/api/teacher/dashboard \
  -H "Authorization: Bearer {token}"
```

**Create CPA Worksheet:**
```bash
curl -X POST http://localhost:3000/api/teacher/cpa/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "grade": 3,
    "topicId": "division",
    "objective": "Học sinh hiểu phép chia có dư",
    "exerciseCounts": {"concrete":5,"pictorial":5,"abstract":5}
  }'
```

---

## 🚀 Implementation Priority

### Phase 1 (MVP)
1. Authentication APIs
2. Dashboard APIs
3. Basic worksheet creation
4. Mock grading (manual input)

### Phase 2
1. PDF export
2. Real AI grading (OCR integration)
3. Error analytics

### Phase 3
1. Parent features
2. Messaging
3. Advanced analytics
4. Personalized worksheets

---

**Version**: 1.0  
**Last Updated**: 2026-01-16
