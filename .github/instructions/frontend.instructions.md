---
name: Frontend React Rules
description: "Use when editing React TypeScript frontend code. Enforce role-based UI, immutable state, grade 1-3 boundaries, and Vietnamese UX text."
applyTo:
  - frontend/src/**/*.ts
  - frontend/src/**/*.tsx
---
# TypeScript/React Patterns — Smart-MathAI

> Nguồn: everything-claude-code / rules/typescript/patterns.md  
> Tùy chỉnh cho React + TypeScript frontend

## API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}
```

## Role-Based Component Pattern

```typescript
// LUÔN kiểm tra role trước khi render actions
interface WorksheetCardProps {
  worksheet: Worksheet
  userRole: "teacher" | "parent"
}

export function WorksheetCard({ worksheet, userRole }: WorksheetCardProps) {
  const isTeacher = userRole === "teacher"
  const isPublished = worksheet.status === "published"

  return (
    <div>
      <h3>{worksheet.title}</h3>
      {/* Parent chỉ thấy published worksheets */}
      {isTeacher && <EditButton worksheetId={worksheet.id} />}
      {(isPublished || isTeacher) && <DownloadPdfButton id={worksheet.id} />}
    </div>
  )
}
```

## Custom Hooks Pattern

```typescript
// hooks/useWorksheets.ts
export function useWorksheets(classId: number) {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorksheets = async () => {
      setLoading(true)
      try {
        const data = await worksheetApi.getByClass(classId)
        setWorksheets(data)
      } catch (err) {
        setError("Không thể tải danh sách bài tập")
      } finally {
        setLoading(false)
      }
    }
    fetchWorksheets()
  }, [classId])

  return { worksheets, loading, error }
}
```

## Repository Pattern (API Client)

```typescript
// api/worksheetApi.ts
interface WorksheetRepository {
  getByClass(classId: number): Promise<Worksheet[]>
  getById(id: number): Promise<Worksheet>
  create(data: CreateWorksheetDto): Promise<Worksheet>
  update(id: number, data: UpdateWorksheetDto): Promise<Worksheet>
  publish(id: number): Promise<Worksheet>
  delete(id: number): Promise<void>
}
```

## Grade Boundary Validation

```typescript
// utils/validation.ts
export const VALID_GRADES = [1, 2, 3] as const
export type Grade = typeof VALID_GRADES[number]

export function isValidGrade(grade: number): grade is Grade {
  return VALID_GRADES.includes(grade as Grade)
}

// Trong form components
if (!isValidGrade(selectedGrade)) {
  setError("Chỉ hỗ trợ lớp 1, 2, hoặc 3")
  return
}
```

## Immutable State Updates

```typescript
// SAI
const handlePublish = () => {
  worksheet.status = "published"  // KHÔNG mutate!
  setWorksheet(worksheet)
}

// ĐÚNG
const handlePublish = () => {
  setWorksheet(prev => ({ ...prev, status: "published" }))
}
```

