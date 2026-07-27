# Nexlane — Deployment Guide

## 1. Prerequisites

- **Node.js** 20.x LTS
- **npm** 10.x (or pnpm/bun)
- **Supabase** account (free tier or higher)
- **Vercel** account (Hobby or Pro)
- **Custom domain** (optional: nexlane.com)

## 2. Environment Setup

### 2.1 Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note the **Project URL** and **anon key** from Settings → API.
3. Generate a **service_role key** (keep secret — server-only).

### 2.2 Local Development

```bash
# Clone or init the project
cd D:\Nexlane Company Software

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXLANE_WEBHOOK_SECRET=generate-a-random-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Nexlane
```

### 2.3 Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Or apply via Supabase Dashboard SQL editor (paste migration files)
```

## 3. Deploy to Vercel

### 3.1 Vercel Project Setup

1. Push your repository to GitHub/GitLab/Bitbucket.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Configure:

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Root Directory | ./ |
| Build Command | `next build` |
| Output Directory | .next |

### 3.2 Environment Variables (Vercel)

Add these in Vercel project settings:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase (encrypted) |
| `NEXLANE_WEBHOOK_SECRET` | Your secret |
| `NEXT_PUBLIC_APP_URL` | `https://nexlane.com` |
| `NEXT_PUBLIC_SITE_NAME` | Nexlane |

**Important:** Mark `SUPABASE_SERVICE_ROLE_KEY` and `NEXLANE_WEBHOOK_SECRET` as "Encrypted" in Vercel.

### 3.3 Deploy

```bash
# Deploy via Vercel CLI
vercel --prod

# Or: push to the production branch (Vercel auto-deploys)
```

## 4. Custom Domain

1. In Vercel dashboard → your project → Domains.
2. Add `nexlane.com` (or your domain).
3. Configure DNS:
   - Add `CNAME` record: `www.nexlane.com` → `cname.vercel-dns.com`
   - Add `A` record: `nexlane.com` → `76.76.21.21` (or Vercel's IP)
4. SSL certificate is auto-provisioned.

## 4.1 Multi-Tenant Considerations

- The `companies` table is the root of all data. Every query filters by `company_id`.
- On signup, a new company is created with default roles and chart of accounts.
- Custom domains can be mapped per company for white-label SaaS.
- RLS policies ensure complete data isolation between companies.
- Future SaaS: implement per-company billing tiers, feature flags, and usage limits.

## 5. Supabase Production Checklist

- [ ] Enable **Row Level Security** on all tables
- [ ] Disable public schema execution for untrusted roles
- [ ] Set up **database backups** (daily in Pro plan)
- [ ] Configure **SMTP** for auth emails (Resend, SendGrid, etc.)
- [ ] Enable **MFA** for admin accounts
- [ ] Set up **Storage rules** for file uploads (MIME type, size limits)
- [ ] Create **database branches** for staging

## 6. Deployment Architecture

```
Internet
    │
    ▼
Vercel Edge Network (CDN)
    │
    ├── Static assets (/_next/static) — cached at edge
    ├── SSR pages — executed on Vercel serverless
    ├── API routes — executed on Vercel serverless
    └── Edge Middleware — executed at edge regions
            │
            ▼
Supabase (Managed Cloud)
    ├── PostgreSQL
    ├── Auth (GoTrue)
    ├── Storage
    └── Realtime
```

## 7. Post-Deployment Verification

```bash
# 1. Health check
curl https://nexlane.com/api/health

# 2. Auth flow
curl -X POST https://nexlane.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@nexlane.com","password":"test123"}'

# 3. Check dashboard loads
curl https://nexlane.com/
```

## 8. CI/CD Pipeline

The `.github/workflows/ci.yml` runs on every PR:

```yaml
steps:
  - Install dependencies
  - Lint (eslint)
  - Type check (tsc --noEmit)
  - Run unit tests (vitest)
  - Build (next build)
```

## 9. Monitoring & Observability

- **Vercel Analytics** — page views, web vitals
- **Supabase Dashboard** — database performance, query timing
- **Sentry** (recommended) — error tracking for frontend + backend
- **Logtail / Axiom** — structured logging for serverless functions
- **Built-in observability** — `app_logs`, `error_logs`, `api_metrics` tables in PostgreSQL (no external tool required Day 1)

## 10. Scaling Considerations

| Scenario | Strategy |
|----------|----------|
| High traffic | Enable Vercel Edge caching, ISR for static pages |
| Large dataset | Cursor-based pagination, materialized views |
| Background jobs | Built-in `jobs` table with retry + scheduling; Supabase pg_cron or Vercel Cron Jobs for triggers |
| Media files | Supabase Storage with CDN caching |
| Real-time | Supabase Realtime with presence/channel limits |
