# SMART-MATHAI - ARCHITECTURE REDESIGN 2026

## 1) Muc tieu thiet ke lai

Tai lieu nay de xuat huong thiet ke lai tong the de:
- Phu hop backend hien tai (FastAPI + SQLAlchemy + AI service).
- Dam bao mo rong de them tinh nang ma khong vo cau truc.
- Dat backend ve dung Clean Architecture (ro rang domain, use case, adapter).
- Nang frontend len pattern de scale theo module (Teacher/Parent/AI workflow).
- Giu nguyen cac quy tac bat buoc cua du an:
  - Chi Toan lop 1-3.
  - AI chi ho tro giao vien, khong tu dong publish.
  - Moi noi dung AI phai o trang thai Draft/Pending cho den khi giao vien duyet.

---

## 2) Frontend Pattern duoc chon

### Pattern: Feature-Sliced Design + App Shell + Role-Segmented Route

Ly do chon:
- Workspace hien co nhieu page theo role (Teacher/Parent), workflow nhieu buoc (CPA, differentiation, grading).
- Pattern nay tranh "components/pages/services" bi phong to khong kiem soat.
- De ket hop voi API versioning va use-case backend sau nay.

### 2.1 Cau truc frontend muc tieu

```text
frontend/src/
  app/
    providers/
      router-provider.tsx
      query-provider.tsx
      auth-provider.tsx
      error-boundary.tsx
    routes/
      teacher-routes.tsx
      parent-routes.tsx
      guest-routes.tsx
    layout/
      app-shell.tsx
      teacher-shell.tsx
      parent-shell.tsx
  shared/
    ui/
    lib/
      http-client.ts
      query-client.ts
    config/
      env.ts
      constants.ts
    types/
  entities/
    user/
    math-class/
    worksheet/
    exercise/
    report/
  features/
    auth-login/
    auth-register/
    class-join/
    worksheet-publish/
    worksheet-duplicate/
    cpa-generate-draft/
    differentiation-generate-draft/
    grading-upload-image/
  widgets/
    teacher-dashboard/
    parent-dashboard/
    worksheet-editor/
    analytics-panel/
  pages/
    teacher/
    parent/
    public/
  processes/
    worksheet-authoring/
    ai-grading-flow/
```

### 2.2 UI Pattern va state strategy

- UI pattern:
  - App Shell + Role Navigation + Task-Oriented Dashboard widgets.
  - Wizard pattern cho CPA/Differentiation (state machine nhe).
  - Editor pattern cho worksheet (draft -> review -> publish).
- Data/state:
  - Server state: TanStack Query (cache, stale, invalidation).
  - Client state nho: Zustand hoac Context cuc bo theo feature.
  - Form state: React Hook Form + Zod.
- Auth/security:
  - Chuyen tu localStorage token sang HTTPOnly cookie + refresh token.
  - Route guard theo role o route layer (teacher/parent).

### 2.3 Mapping tu cau truc hien tai sang cau truc moi

- `src/services/*.ts` -> tach vao `shared/lib/http-client.ts` + moi entity/feature co API module rieng.
- `src/components/cpa/*` -> `features/cpa-generate-draft` + `processes/worksheet-authoring`.
- `src/components/differentiation/*` -> `features/differentiation-generate-draft`.
- `src/pages/*` -> chia theo `pages/teacher`, `pages/parent`, `pages/public`.
- `src/hooks/useAuth.tsx` -> `app/providers/auth-provider.tsx` + auth service cookie-based.

---

## 3) Backend Clean Architecture (Target)

### 3.1 Nguyen tac

- Dependency Rule: lop trong cung khong phu thuoc lop ngoai.
- Routers chi nhan request/response (skinny controllers).
- Business rule nam trong Use Cases + Domain Services.
- SQLAlchemy chi nam o Infrastructure adapters.
- AI adapters la infrastructure plugin, truyen qua interface.

### 3.2 Cau truc backend muc tieu

```text
backend/app/
  domain/
    entities/
      worksheet.py
      exercise.py
      math_class.py
      user.py
      report.py
    value_objects/
      worksheet_status.py
      grade_level.py
      user_role.py
    repositories/
      worksheet_repository.py
      class_repository.py
      user_repository.py
      report_repository.py
    services/
      worksheet_policy_service.py
      approval_policy_service.py
      grading_policy_service.py
  application/
    dto/
      worksheet_dto.py
      auth_dto.py
      ai_dto.py
    use_cases/
      worksheet/
        create_worksheet.py
        publish_worksheet.py
        duplicate_worksheet.py
        list_class_worksheets.py
      parent/
        join_class.py
        get_parent_dashboard.py
      ai/
        generate_cpa_draft.py
        generate_differentiation_draft.py
        grade_submission.py
      auth/
        login.py
        register.py
    ports/
      ai_text_generator.py
      ai_embedding_provider.py
      ai_ocr_provider.py
      unit_of_work.py
  infrastructure/
    db/
      sqlalchemy/
        models/
        repositories/
        unit_of_work.py
        mappers/
    ai/
      lmstudio_text_adapter.py
      sbert_embedding_adapter.py
      paddle_ocr_adapter.py
      rag_adapter.py
    auth/
      jwt_service.py
      password_hasher.py
    observability/
      audit_logger.py
      metrics.py
  interfaces/
    api/
      v1/
        routers/
          auth_router.py
          worksheet_router.py
          parent_router.py
          ai_router.py
        schemas/
          request/
          response/
      dependencies/
        auth_dependencies.py
        permission_dependencies.py
  bootstrap/
    container.py
    settings.py
  main.py
```

### 3.3 Luong xu ly chuan

- HTTP request -> router v1.
- Router goi use case.
- Use case lam viec voi repository interfaces + unit of work + domain services.
- Infrastructure adapters implement interfaces.
- Use case tra DTO -> router map sang response schema.

### 3.4 Quy tac nghiep vu can codify trong domain/application

- Chi teacher duoc tao draft AI, edit va publish worksheet.
- Parent khong duoc truy cap endpoint tao noi dung AI.
- Moi AI output luon tao o trang thai Draft/Pending.
- Publish bat buoc qua use case `PublishWorksheet` co check:
  - co exercise,
  - owner la teacher,
  - data hop le theo lop 1-3.
- Grading co confidence threshold va co co che override boi teacher.

---

## 4) API Contract va Integration Frontend-Backend

### 4.1 Versioning

- Dua tat ca route vao `/api/v1`.
- Giu `/api` cu trong 1 giai doan de backward compatibility, deprecate dan.

### 4.2 Response envelope thong nhat

```json
{
  "data": {},
  "meta": {
    "request_id": "...",
    "timestamp": "..."
  },
  "error": null
}
```

### 4.3 Typed API

- Generate TypeScript client tu OpenAPI (`openapi-typescript` hoac `orval`).
- Frontend entity hooks chi dung typed client, khong hardcode response.

---

## 5) Ke hoach migration khong pha vo he thong

## Phase 0 (1-2 ngay): Chuan bi
- Dong bo naming va import path.
- Them lint rule va test baseline.
- Bat dau ghi audit log cho action publish/approve.

## Phase 1 (1-2 tuan): Backend foundation clean architecture
- Tao skeleton `domain/application/infrastructure/interfaces`.
- Uu tien migrate 3 module: auth, worksheet, parent access.
- Dua query khoi router vao repository + use case.
- Them unit of work cho transaction.

## Phase 2 (1 tuan): AI ports/adapters
- Dinh nghia `AiTextGeneratorPort`, `OcrProviderPort`, `EmbeddingProviderPort`.
- LMStudio/Paddle/SBERT implement theo adapter.
- Use case AI chi goi qua ports, khong import truc tiep service cu.

## Phase 3 (1-2 tuan): Frontend architecture shift
- Lap `app/providers` + `shared/lib/http-client`.
- Dua auth sang cookie-based session flow.
- Tich hop TanStack Query va migrate page theo thu tu:
  1) Worksheets,
  2) Classes,
  3) Parent dashboard,
  4) AI workflows.

## Phase 4 (1 tuan): Hardening
- Add integration tests cho use cases critical.
- Add optimistic update cho worksheet editor.
- Add metrics: AI latency, OCR confidence, publish approvals.

---

## 6) Design system va UI huong mo rong

- Chuan token:
  - color semantic: `--color-primary`, `--color-surface`, `--color-success`, `--color-warning`, `--color-danger`.
  - spacing scale va radius scale ro rang.
- Pattern cho 2 role:
  - Teacher UI: command-center layout (overview + actions + alerts).
  - Parent UI: progress-story layout (timeline + progress + guidance cards).
- Tui component:
  - `shared/ui` chi chua primitive.
  - component nghiep vu dat o `widgets`/`features`.
- Accessibility:
  - keyboard-first cho wizard.
  - contrast va focus ring nhat quan.

---

## 7) KPI ky thuat sau khi redesign

- Backend:
  - >= 80% business rules nam trong use cases/domain services.
  - 0 truy van DB truc tiep trong router.
  - 100% endpoint AI tao output o Draft/Pending.
- Frontend:
  - >= 70% page query dung TanStack Query.
  - 0 luu access token trong localStorage.
  - TTFB + interactive o dashboard cai thien nho cache/query strategy.

---

## 8) First milestone de bat dau ngay

1. Tao `/api/v1` + migrate `worksheets` route dau tien.
2. Them use case `PublishWorksheet` co validation teacher-approval.
3. Refactor auth frontend sang cookie + Query provider.
4. Migrate `WorksheetsPage` sang feature-based + query hooks.

Neu can, co the chia milestone nay thanh cac PR nho theo tung module de de review.
