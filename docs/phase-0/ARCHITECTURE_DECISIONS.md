# Architecture Decisions

**Project:** Nexlane
**Last Updated:** Phase 0

---

## AD-01: Next.js App Router

| Detail | Value |
|--------|-------|
| **Context** | Choosing between Pages Router and App Router |
| **Decision** | Use Next.js App Router (v16) with file-based routing |
| **Rationale** | Server Components, streaming, nested layouts, and API route co-location. App Router is the recommended approach for new Next.js projects and provides better performance characteristics. |
| **Trade-offs** | Steeper learning curve, some patterns still maturing |
| **Status** | Accepted |

---

## AD-02: Supabase for Backend

| Detail | Value |
|--------|-------|
| **Context** | Selecting backend infrastructure |
| **Decision** | Supabase (PostgreSQL + Auth + Storage) |
| **Rationale** | Provides hosted PostgreSQL with built-in Auth, Row Level Security, auto-generated API, file storage, and realtime subscriptions. Eliminates need for a separate backend server. |
| **Trade-offs** | Vendor lock-in risk; limited to PostgreSQL ecosystem |
| **Status** | Accepted |

---

## AD-03: TypeScript Strict Mode

| Detail | Value |
|--------|-------|
| **Context** | TypeScript configuration level |
| **Decision** | Enable `strict: true` in `tsconfig.json` |
| **Rationale** | Catches null/undefined errors at compile time, improves code quality and developer experience |
| **Trade-offs** | More verbose code, requires explicit type annotations |
| **Status** | Accepted |

---

## AD-04: Dynamic RBAC (Not Hardcoded)

| Detail | Value |
|--------|-------|
| **Context** | Authorization approach |
| **Decision** | Fully dynamic RBAC with roles → permissions stored in database |
| **Rationale** | Allows administrators to create custom roles and assign permissions without code changes. Supports multi-tenant role isolation. |
| **Trade-offs** | Requires database queries for every authorization check (mitigated by caching) |
| **Status** | Accepted |

---

## AD-05: Event-Driven Architecture

| Detail | Value |
|--------|-------|
| **Context** | Cross-module communication |
| **Decision** | In-process event bus with database persistence (outbox pattern) |
| **Rationale** | Decouples modules, provides audit trail, enables replay, supports n8n integrations. Events persisted in `domain_events` table ensure no data loss. |
| **Trade-offs** | Not distributed (single-process); may need message queue (Redis/RabbitMQ) at scale |
| **Status** | Accepted |

---

## AD-06: Repository + Service Pattern

| Detail | Value |
|--------|-------|
| **Context** | Code organization for data access |
| **Decision** | Separate repository layer (data access) and service layer (business logic) |
| **Rationale** | Clean separation of concerns, testable business logic, swappable data sources |
| **Trade-offs** | More files, boilerplate for simple CRUD |
| **Status** | Accepted (repositories mostly empty in Phase 0, pattern established) |

---

## AD-07: Soft Delete Pattern

| Detail | Value |
|--------|-------|
| **Context** | Data deletion strategy |
| **Decision** | Soft delete on all business entities via `deleted_at` + `deleted_by` columns |
| **Rationale** | Preserves data integrity, enables undo, maintains referential integrity for audit trails |
| **Trade-offs** | Requires `WHERE deleted_at IS NULL` on all queries; tables grow larger |
| **Status** | Accepted |

---

## AD-08: Multi-Company via Company ID

| Detail | Value |
|--------|-------|
| **Context** | Multi-tenancy approach |
| **Decision** | Discriminator column (`company_id`) on every business table |
| **Rationale** | Simplest multi-tenant approach; RLS enforces company isolation at database level; no connection pooling per tenant required |
| **Trade-offs** | Requires careful indexing on `company_id`; no hard tenant boundaries |
| **Status** | Accepted |

---

## AD-09: Zod for Validation Everywhere

| Detail | Value |
|--------|-------|
| **Context** | Validation strategy (client + server) |
| **Decision** | Zod for all input validation, shared between client and server |
| **Rationale** | Single source of truth for validation rules, TypeScript type inference via `z.infer`, no duplication between frontend and backend |
| **Trade-offs** | Bundle size impact on client (~12KB gzipped) |
| **Status** | Accepted |

---

## AD-10: React Query for Server State

| Detail | Value |
|--------|-------|
| **Context** | State management approach |
| **Decision** | React Query (`@tanstack/react-query`) for all server state |
| **Rationale** | Built-in caching, background refetching, optimistic updates, request deduplication. Reduces boilerplate vs manual `fetch` + `useState`. |
| **Trade-offs** | Additional dependency; adds complexity for simple fetches |
| **Status** | Accepted |

---

## AD-11: Tailwind CSS v4

| Detail | Value |
|--------|-------|
| **Context** | Styling approach |
| **Decision** | Tailwind CSS v4 with PostCSS |
| **Rationale** | Utility-first, zero-runtime CSS, built-in design system, easy theming. v4 has improved performance and CSS-first configuration. |
| **Trade-offs** | HTML can look verbose; team must know Tailwind classes |
| **Status** | Accepted |

---

## AD-12: shadcn/ui Pattern (Radix + Tailwind)

| Detail | Value |
|--------|-------|
| **Context** | Component library approach |
| **Decision** | Use Radix UI primitives + Tailwind styling (shadcn/ui pattern) |
| **Rationale** | Fully customizable, accessible, no locked-in components. Radix handles accessibility; Tailwind handles styling. |
| **Trade-offs** | Radix packages installed but not yet used (Phase 1+) |
| **Status** | Accepted (deferred) |

---

## AD-13: Thin API Routes

| Detail | Value |
|--------|-------|
| **Context** | API route implementation pattern |
| **Decision** | API routes perform only: authenticate → parse → validate → delegate to service → respond |
| **Rationale** | Keeps routes simple and testable; business logic lives in services |
| **Trade-offs** | Indirection for simple operations |
| **Status** | Accepted |

---

## AD-14: Standardized API Response Format

| Detail | Value |
|--------|-------|
| **Context** | API response shape |
| **Decision** | All API responses follow `{ data, error }` format |
| **Rationale** | Consistent client-side handling, typed responses, clear error vs success path |
| **Trade-offs** | Slightly more verbose responses |
| **Status** | Accepted |

---

## AD-15: Admin Client for Server-to-Server

| Detail | Value |
|--------|-------|
| **Context** | Database access from server code |
| **Decision** | Use service role key (admin client) for all server-side database operations, bypassing RLS |
| **Rationale** | RLS is designed for end-user access. Server code has already been authenticated and authorized via `authenticate()` + `authorize()`. Bypassing RLS avoids recursive policy checks and double-permission evaluation. |
| **Trade-offs** | Service role key must be kept secret; no RLS as second line of defense for server code |
| **Status** | Accepted |

---

## AD-16: Webpack Build (Windows Workaround)

| Detail | Value |
|--------|-------|
| **Context** | Build tool selection |
| **Decision** | Build with `--webpack` flag |
| **Rationale** | Turbopack (Next.js default bundler) has native dependency issues on Windows, preventing `next build` from completing. Webpack is the stable fallback. |
| **Trade-offs** | Slower builds than Turbopack |
| **Status** | Temporary (until Turbopack supports this Windows environment) |

---

## AD-17: Seed Data in SQL (Not TypeScript)

| Detail | Value |
|--------|-------|
| **Context** | Seed data approach |
| **Decision** | Seed data stored in `supabase/seed.sql` executed directly against the database |
| **Rationale** | Database migration + seed is self-contained; seed can be run in any environment; no code dependency for initial data |
| **Trade-offs** | No TypeScript type safety for seed data; must keep in sync with type definitions |
| **Status** | Accepted |

---

## AD-18: n8n Webhook Integration

| Detail | Value |
|--------|-------|
| **Context** | External workflow automation |
| **Decision** | n8n calls Nexlane webhook endpoints to create entities; Nexlane emits events that n8n can consume |
| **Rationale** | Bidirectional integration without tight coupling. n8n handles workflow orchestration; Nexlane provides CRUD + event hooks. |
| **Trade-offs** | Requires n8n deployment; shared secret auth is basic |
| **Status** | Accepted (shared secret will be enhanced in Phase 1+) |
