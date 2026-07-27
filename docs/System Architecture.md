# Nexlane — System Architecture

## 1. Overview

Nexlane is an enterprise SaaS platform built on a modern, modular architecture designed for **multi-tenant readiness from day one**. It uses **Next.js (App Router)** for frontend and API layers, **Supabase** for authentication, database, storage, and real-time features, and **PostgreSQL** as the primary data store.

## 2. The 17 Architectural Pillars

### 1. Multi-Tenancy (Company Isolation)
Every business table includes `company_id`. All queries, RLS policies, and indexes filter by company. A single deployment serves unlimited tenants.

### 2. Dynamic RBAC
Permissions are data, not code. The `permissions` → `role_permissions` → `roles` → `user_roles` chain allows full permission management from the database/UI without redeployment.

### 3. Feature Flags
Modules and features can be toggled per company via `feature_flags` + `company_feature_flags`. Enables safe rollouts, beta testing, and premium feature gating.

### 4. 3-Tier Settings
System settings (global defaults), company settings (tenant overrides), and user settings (personal preferences) — each with JSON values and categories.

### 5. Universal Audit Trail
Every state change is logged with `previous_data` and `new_data` JSONB snapshots, IP address, and user agent. Supports compliance and debugging.

### 6. Event-Driven Architecture
Domain events decouple all modules. A single action (e.g., `lead.created`) triggers activity logging, notifications, analytics, n8n webhooks, and future AI processing — all via independent handlers.

### 7. Notification Framework
Decoupled from modules. Templates define message content per channel. Users configure channel preferences per event type. Supports in-app, email, SMS, WhatsApp, and push (future).

### 8. Background Jobs
Persistent job queue with retry, scheduling, and logging. Handles async operations: email sending, report generation, n8n webhook delivery, AI processing.

### 9. Double-Entry Accounting
Proper accounting foundation with chart of accounts, journal entries, and journal entry lines. Enables P&L, Balance Sheet, Trial Balance, and ledger reports without redesign.

### 10. Internal Spreadsheet Engine
Database-driven table builder. Users create custom tables with typed columns without writing code. n8n can read/write directly for automation.

### 11. Generic File Management
Single `files` table with polymorphic `entity_type` + `entity_id` attachment. Every module can attach files without its own infrastructure.

### 12. Universal Tag System
Tags + taggables for any entity. Filter, group, and organize across modules.

### 13. Comments System
Generic threaded comments on any entity with mention support.

### 14. Custom Fields
Users add fields to any entity type without coding. Stored as EAV (custom_fields + custom_field_values).

### 15. Search Foundation
PostgreSQL full-text search with `search_index` vector column. Spans employees, projects, leads, invoices, tasks, files, and more.

### 16. AI-Ready Foundation
Reserved schema for future AI features: conversations, prompts, actions, and usage logs.

### 17. Observability
Application logs, error logs, performance metrics, and API metrics for monitoring and debugging.

## 3. Event Flow (Example: Lead Created)

```
[Lead Created via UI or n8n]
       │
       ▼
LeadService.create()
       │
       ├──► LeadRepository.create() ──► INSERT leads
       │
       └──► EventBus.emit('lead.created', payload)
                │
                ├──► ActivityHandler — INSERT activity_logs
                ├──► NotificationHandler — INSERT notifications (+ check preferences)
                ├──► JobHandler — CREATE job (if n8n webhook configured)
                └──► [Future] AIHandler — score lead async
```

## 4. Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│  Client (Next.js App Router + React Query + shadcn/ui)          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │ Auth UI  │ │ RBAC     │ │ Feature  │ │ Module UIs       │   │
│  │          │ │ Guards   │ │ Flags    │ │ (Phase 1+)       │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│  Next.js API Layer (Route Handlers)                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Middleware: Authenticate → Authorize → Company Context     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌───────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐ │
│  │ Services   │ │  Zod     │ │ Repos     │ │ Event Bus        │ │
│  │ (Business  │ │ Valid.   │ │ (DB)      │ │ + Handlers       │ │
│  │  Logic)    │ │          │ │           │ │                  │ │
│  └───────────┘ └──────────┘ └───────────┘ └──────────────────┘ │
│  ┌───────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐ │
│  │ Activity   │ │ Jobs     │ │ Feature   │ │ Settings         │ │
│  │ Service    │ │ Queue    │ │ Flags     │ │ (3 tiers)        │ │
│  └───────────┘ └──────────┘ └───────────┘ └──────────────────┘ │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│  Supabase (PostgreSQL + Auth + Storage + Realtime)                │
│  47 tables across 20 domains, all RLS-enforced by company_id     │
└──────────────────────────────────────────────────────────────────┘
```

## 5. Module Dependency Graph

```
core/ (no dependencies on features)
  │
  ├── events/ (backbone — all modules emit)
  ├── jobs/ (async processing for all modules)
  │
  ├── shared/ (core + shadcn/ui + guards)
  │
  ├── infrastructure (cross-cutting — no feature deps)
  │   ├── feature-flags
  │   ├── settings (3 tiers)
  │   ├── activity-log
  │   ├── notifications
  │   ├── comments
  │   ├── tags
  │   ├── custom-fields
  │   ├── files
  │   └── search
  │
  └── features (business modules, depend on infrastructure)
      ├── auth
      ├── rbac
      ├── employees
      ├── projects
      ├── tasks
      ├── crm
      ├── spreadsheets
      ├── accounting
      ├── reports
      ├── ai
      └── settings-ui
```

## 6. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| 47 tables, normalized | Covers all known requirements + extensibility points |
| 3-tier settings | System defaults → company override → user preference |
| Feature flags as tables | Configurable without env vars, per-company toggling |
| EAV for custom fields | Users add fields without schema changes |
| Polymorphic comments/tags/files | One system serves all modules |
| Domain events persisted | Reliability, replay capability, audit |
| Job queue for async | Decouples fast API from slow operations |
| Notification templates | Content changes without code deployment |
| Soft deletes with deleted_by | Full auditability, restore capability |
| Full-text search index | Fast global search without external service |
| Observability tables | Built-in monitoring, no external tool required Day 1 |
