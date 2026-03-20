# Smart-MathAI - UI Redesign Plan

This plan details the UI redesign for the **Smart-MathAI** project. The design strictly adheres to the project's educational constraints (Grades 1-3 math, Vietnamese context), role boundaries (Teacher vs. Parent), and utilizes modern web tech (React, Tailwind CSS v4, Shadcn/UI).

## 1. Layout Description

The application will use distinct layouts depending on the user's state and role to ensure a focused, intuitive, and distraction-free experience suitable for an educational tool.

### 1.1. Auth Layout (Public)
**Purpose:** For Login, Registration, and Landing pages.
**Description:**
- **Structure:** Centered, single-column layout.
- **Visuals:** Clean, airy background (soft colors to imply learning and friendliness, but professional). A split-screen design on desktop (left: branded illustration/mission statement, right: auth form) to make it premium.
- **Navigation:** Minimal header holding only the logo and fundamental links (e.g., "About", "Help").

### 1.2. Teacher Dashboard Layout (Authenticated)
**Purpose:** For Teachers to manage classes, create worksheets, and review AI grading.
**Description:**
- **Structure:** Application-style layout with a persistent sidebar.
- **Sidebar (Left):** Context-aware navigation (`Home`, `Classes`, `Worksheets`, `AI Tools`, `Settings`). Collapsible to maximize screen real estate when editing worksheets.
- **Top Header:** Breadcrumb navigation for context (`Classes > Class 1A > Worksheets`), User Profile dropdown, Notification bell (e.g., OCR grading completed), and a global "Create New" action button.
- **Main Content Area:** 
  - Uses a max-width container for standard pages (e.g., settings, class lists) to maintain readability.
  - Expands to full width for dense data views (e.g., student progress tables, worksheet editor).
- **Themes & Colors:** Professional yet approachable. Primary colors used for clear calls-to-action (Publish, Approve AI Draft).

### 1.3. Worksheet Editor / AI Generator Layout (Teacher)
**Purpose:** A specialized full-screen layout for focused content creation.
**Description:**
- **Structure:** 3-pane layout.
- **Left Pane (Tools & AI):** Controls for generating questions with Qwen2.5, selecting topics, defining difficulty (Grade 1-3 only).
- **Center Pane (Canvas/Preview):** A WYSIWYG editor or live PDF preview showing the actual worksheet.
- **Right Pane (Properties):** Settings for the selected item or worksheet metadata (Title, Deadline).

### 1.4. Parent Dashboard Layout (Authenticated)
**Purpose:** For Parents to track progress and download worksheets.
**Description:**
- **Structure:** Simplified top-navigation layout (no complex sidebar needed). Mobile-first design, as parents frequently check updates via phone.
- **Top Navigation:** Logo, active class indicator (if multiple children), simple tabs (`Bảng tin` / `Bài tập` / `Tiến độ`), Profile menu.
- **Main Content Area:** Card-based feed. Large, clear typography. Emphasizes "Active Worksheets" and "Recent Progress" charts.
- **Visuals:** Warm, encouraging UI elements. Focus on celebrating child progress rather than heavy management tools.

---

## 2. List of Components

The UI will be built composing standard **Shadcn/UI** elements combined into custom semantic components.

### 2.1. Core UI Elements (Enhanced Shadcn base)
- `Button` (Primary, Secondary, Outline, Ghost, Danger)
- `Input` & `Textarea` (With focus rings and error states)
- `Select` & `DropdownMenu`
- `Card` (Container for grouped information)
- `Badge` (Status indicators: Draft, Published, AI-Generated)
- `Dialog` / `Modal` (For confirmations, forms)
- `Table` / `DataTable` (For student lists, worksheet lists)
- `Tabs` (For switching views like 'Questions' vs 'Report')
- `Skeleton` (For loading states, especially during AI generation or RAG retrieval)

### 2.2. Layout Components

#### `MainSidebar`
- **Responsibility:** Provides the primary navigation for teachers, adapting to collapsed/expanded states.
- **Props:**
  - `isCollapsed: boolean` - Controls the visual state.
  - `activeKey: string` - The currently active route.
  - `links: Array<{label: string, icon: ReactNode, href: string}>` - Configuration for navigation items.
- **Example Usage:**
  ```tsx
  <MainSidebar 
    isCollapsed={false} 
    activeKey="worksheets" 
    links={[{label: 'Worksheets', icon: <FileText/>, href: '/worksheets'}]} 
  />
  ```

#### `PageHeader`
- **Responsibility:** Displays the page title, generic actions, and context (breadcrumbs).
- **Props:**
  - `title: string` - Main heading.
  - `breadcrumbs?: Array<{label: string, href?: string}>` - Breadcrumb path.
  - `actions?: ReactNode` - Buttons rendered on the right (e.g., "Create New").
- **Example Usage:**
  ```tsx
  <PageHeader 
    title="Worksheets" 
    breadcrumbs={[{label: 'Classes'}, {label: '1A'}]}
    actions={<Button>Create Worksheet</Button>} 
  />
  ```

### 2.3. Teacher-Specific Components

#### `ClassCard`
- **Responsibility:** A summary card representing a single class.
- **Props:**
  - `className: string` - Name of the class (e.g., "1A").
  - `studentCount: number` - Number of enrolled students.
  - `onClick: () => void` - Handler for navigating to class details.
- **Example Usage:**
  ```tsx
  <ClassCard className="Class 1A" studentCount={32} onClick={() => navigate('/classes/1a')} />
  ```

#### `WorksheetGridCard`
- **Responsibility:** Displays a worksheet summary with quick actions and status.
- **Props:**
  - `title: string` - Topic or title of the worksheet.
  - `status: 'draft' | 'published'` - Influences the badge color.
  - `onEdit: () => void` - Action handler.
  - `onPdfExport: () => void` - Action handler.
- **Example Usage:**
  ```tsx
  <WorksheetGridCard 
    title="Phép cộng phạm vi 10" 
    status="published" 
    onEdit={handleEdit} 
    onPdfExport={exportPdf} 
  />
  ```

#### `AICreatorPanel`
- **Responsibility:** Interface for the teacher to input parameters for the Qwen model.
- **Props:**
  - `topics: string[]` - Available math topics.
  - `onGenerate: (params: {topic: string, diffLevel: number}) => Promise<void>` - Trigger AI generation.
  - `isLoading: boolean` - Controls generating state.
- **Example Usage:**
  ```tsx
  <AICreatorPanel topics={['Phép cộng', 'Tập chép số']} onGenerate={fetchAiQuestions} isLoading={false} />
  ```

#### `AIReviewWidget`
- **Responsibility:** Displays generated AI output, forcing teacher validation.
- **Props:**
  - `draftContent: string` - The raw or parsed AI generation.
  - `onApprove: (content: string) => void` - Approves the content for the worksheet.
  - `onReject: () => void` - Rejects the content.
- **Example Usage:**
  ```tsx
  <AIReviewWidget 
    draftContent="1 + 1 = ?" 
    onApprove={(c) => appendToWorksheet(c)} 
    onReject={clearDraft} 
  />
  ```

#### `GradingDiffViewer`
- **Responsibility:** Compares OCR text with the expected answer side-by-side.
- **Props:**
  - `ocrText: string` - Extracted literal text from PaddleOCR.
  - `expectedText: string` - The correct answer.
  - `confidenceScore: number` - OCR certainty percentage.
  - `onOverride: (correctedText: string) => void` - Manual correction by Teacher.
- **Example Usage:**
  ```tsx
  <GradingDiffViewer 
    ocrText="2" expectedText="3" confidenceScore={85} 
    onOverride={(val) => submitGrade(val)} 
  />
  ```

### 2.4. Parent-Specific Components

#### `HomeworkActionCard`
- **Responsibility:** Prominently displays an active assignment for the parent's child.
- **Props:**
  - `title: string` - Name of the assignment.
  - `dueDate?: string` - Optional deadline.
  - `onDownload: () => void` - Handler for getting the PDF.
- **Example Usage:**
  ```tsx
  <HomeworkActionCard title="Ôn tập cuối tuần" dueDate="2026-03-22" onDownload={downloadAssignment} />
  ```

#### `ProgressChartWidget`
- **Responsibility:** Wrapper around Recharts to show simple competence levels.
- **Props:**
  - `data: Array<{topic: string, score: number}>` - Chart data points.
  - `title: string` - Chart heading.
- **Example Usage:**
  ```tsx
  <ProgressChartWidget data={[{topic: 'Cộng', score: 90}]} title="Kỹ năng tính toán" />
  ```

### 2.5. Educational / Domain Components

#### `MathFormattedText`
- **Responsibility:** Safely renders math-specific symbols or simple fractions (Grade 1-3 appropriate).
- **Props:**
  - `text: string` - The source text.
  - `highlightKeywords?: string[]` - Terms to colorize for young readers.
- **Example Usage:**
  ```tsx
  <MathFormattedText text="Có 5 quả táo, cho đi 2 quả." highlightKeywords={['táo']} />
  ```

#### `DiffLevelBadge`
- **Responsibility:** A visual indicator for the difficulty level.
- **Props:**
  - `level: 1 | 2 | 3` - Represents Easy, Medium, Hard.
- **Example Usage:**
  ```tsx
  <DiffLevelBadge level={2} />
  ```
