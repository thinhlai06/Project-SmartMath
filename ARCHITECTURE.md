# SMART-MATHAI - FINAL ARCHITECTURE 2026

## 1) Mission and non-negotiable boundaries

Smart-MathAI is a controlled educational platform for Vietnamese primary Math Grades 1-3.

Hard boundaries:
- Domain: Math only.
- Grade scope: Grades 1-3 only.
- Roles: Teacher and Parent only.
- AI authority: AI is assistive, never autonomous.
- Publication control: AI output must start as Draft/Pending and requires Teacher approval before publish.

These constraints are enforced as product rules and architecture rules.

## 2) Current architecture (implemented)

## 2.1 Backend runtime architecture

Current backend structure follows an incremental Clean Architecture rollout:

- Interfaces layer:
  - Legacy routers under `app/routers/*` still serve existing APIs.
  - New clean rollout routers under `app/interfaces/api/v1/routers/*` expose migrated endpoints.
- Application layer:
  - Use cases are introduced for critical flows (AI generation and worksheet publish).
- Domain layer:
  - Repository ports define contracts independent from SQLAlchemy.
- Infrastructure layer:
  - SQLAlchemy adapters implement domain repository ports.
  - AI adapter wraps existing generation service behind application port.
- Bootstrap layer:
  - Composition root wires use cases and adapters through dependency providers.

Implemented clean slices:
- AI draft generation:
  - `GenerateCpaDraftUseCase`
  - `GenerateDifferentiationDraftUseCase`
- Worksheet publication:
  - `PublishWorksheetUseCase`

Implemented v1 rollout endpoints:
- `POST /api/v1/ai/generate-cpa`
- `POST /api/v1/ai/generate-differentiation`
- `POST /api/v1/worksheets/{worksheet_id}/publish`

## 2.2 Frontend runtime architecture

Frontend has started moving from page-centric fetch logic to scalable app composition:

- App providers:
  - Query provider is integrated at app root.
- Server state:
  - TanStack Query is active for worksheet list/mutations.
- Authentication transport:
  - Migrated from localStorage bearer token usage to HTTP-only cookie session flow.
  - Axios API client runs with `withCredentials: true`.
  - Fetch-based APIs use `credentials: include`.

Implemented migration highlights:
- Query foundation:
  - `src/app/providers/query-provider.tsx`
  - App wrapped by QueryProvider.
- Query migration:
  - `WorksheetsPage` migrated to query/mutation hooks.
- Cookie-session security migration:
  - Removed remaining manual Authorization/localStorage usage in active pages/components.

## 2.3 Auth and security architecture (updated)

Backend auth behavior:
- Login creates JWT and also sets HTTP-only auth cookie.
- Logout clears auth cookie.
- Auth dependency accepts:
  - Bearer token from header (compatibility)
  - Auth cookie token (primary path)

Frontend auth behavior:
- Client no longer depends on storing token in localStorage for authenticated requests.
- Browser-managed cookie session is the primary auth channel.

Security impact:
- Reduced XSS risk compared with localStorage token persistence.
- Cleaner auth boundary at transport layer.

## 3) Clean Architecture target model (project-wide)

Target backend module model:

```text
app/
  domain/
    entities/
    value_objects/
    repositories/
    services/
  application/
    dto/
    ports/
    use_cases/
  infrastructure/
    db/sqlalchemy/
    ai/
    auth/
    observability/
  interfaces/
    api/v1/
      routers/
      schemas/
    dependencies/
  bootstrap/
  main.py
```

Dependency rule:
- `interfaces -> application -> domain`
- `infrastructure` implements ports defined by `application/domain`
- `domain` has no dependency on frameworks

Target frontend module model:

```text
src/
  app/
    providers/
    routes/
    layout/
  shared/
    ui/
    lib/
    config/
    types/
  entities/
  features/
  widgets/
  pages/
  processes/
```

## 4) Business rule enforcement map

Current enforced rules:
- Teacher-gated publish flow enforced in publish use case.
- AI generation routed through use cases/adapters for migrated endpoints.
- Role checks remain active in auth dependencies and role-specific endpoints.

Rules to enforce consistently across all modules during full migration:
- Parent cannot generate AI worksheets.
- All AI outputs remain Draft/Pending until teacher approval.
- Grade/domain validation for all generated and published content.

## 5) API strategy

Versioning strategy:
- New or migrated contract-first endpoints go to `/api/v1/*`.
- Legacy `/api/*` endpoints remain temporarily for compatibility.
- Migration follows strangler pattern endpoint by endpoint.

Contract strategy:
- Preserve existing responses for legacy clients.
- Move v1 endpoints toward consistent schema envelope and typed client generation.

## 6) Progress snapshot (final update)

Overall status:
- Core architecture direction: established and active.
- Clean migration: in progress, with multiple production slices completed.

Phase progress:
- Phase 0 - Architecture baseline and rollout strategy: 100%
- Phase 1 - Backend clean foundation and first migrated slices: 85%
- Phase 2 - AI ports/adapters standardization: 65%
- Phase 3 - Frontend architecture shift and auth hardening: 70%
- Phase 4 - Hardening (tests, metrics, observability): 30%

Completed key outcomes:
- Added backend clean slices for AI generation and worksheet publish.
- Added DI composition providers in bootstrap container.
- Added v1 routers and mounted them in app startup.
- Introduced TanStack Query app provider and worksheet query migration.
- Completed cookie-session auth migration on backend + frontend transport layer.

Remaining priority work to reach full-state architecture:
- Migrate remaining legacy routers to use-case driven v1 modules.
- Complete frontend feature-sliced module restructuring.
- Standardize response envelope for v1 APIs.
- Expand integration tests around publish, auth session, and AI draft flows.
- Add observability baseline (request id, audit logs, latency/quality metrics).

## 7) Definition of Done for full redesign

Backend DoD:
- Zero direct DB query inside routers for migrated modules.
- Critical business rules centralized in use cases/domain services.
- AI providers consumed only through ports/adapters.
- Teacher approval constraints enforced in publish and AI workflows.

Frontend DoD:
- No localStorage token auth flow in runtime paths.
- Server state managed by query layer in core teacher/parent workflows.
- Role routes and auth guards centralized in app routing composition.
- Features/widgets/processes split replaces large page-local orchestration.

Quality DoD:
- Integration tests for auth cookie session, AI draft generation, worksheet publish.
- Basic observability: structured logs, audit events, and endpoint metrics.

## 8) Recommended implementation order from now

1. Continue migrating high-traffic legacy routers into `interfaces/api/v1` with use cases first.
2. Finish frontend module split for CPA and Differentiation workflows.
3. Introduce shared typed API client generation from OpenAPI for v1 endpoints.
4. Add integration test suite for auth + publish + AI draft approval boundaries.
5. Final deprecation window planning for legacy `/api/*` routes after parity.

This document is the authoritative architecture state and migration direction for Smart-MathAI 2026.
