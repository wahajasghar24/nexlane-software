# Dependency Report

**Project:** Nexlane
**Total Packages:** 21 (13 dependencies + 8 devDependencies)
**Last Updated:** QG-1 (22 unused packages removed)

---

## Active Dependencies (Used in Source Code)

### Framework

| Package | Version | Used In | Purpose |
|---------|---------|---------|---------|
| `next` | 16.2.11 | All pages, API routes, layout, middleware | React framework with App Router |
| `react` | 19.2.4 | All client components | UI library |
| `react-dom` | 19.2.4 | Indirect (Next.js runtime) | DOM rendering |

### Supabase (Database + Auth)

| Package | Version | Used In | Purpose |
|---------|---------|---------|---------|
| `@supabase/ssr` | ^0.12.3 | `core/supabase/server.ts`, `core/supabase/client.ts`, `core/supabase/middleware.ts`, `middleware.ts` | Next.js SSR-compatible Supabase client factories |
| `@supabase/supabase-js` | ^2.110.8 | `core/supabase/admin.ts` | Core Supabase client (service role) for admin operations |

### State Management & Data Fetching

| Package | Version | Used In | Purpose |
|---------|---------|---------|---------|
| `@tanstack/react-query` | ^5.101.4 | `query-provider.tsx`, `useAuth.ts` | Server state management (caching, mutations) |
| `next-themes` | ^0.4.6 | `theme-provider.tsx`, `theme-toggle.tsx` | Dark/light mode with SSR support |

### Forms & Validation

| Package | Version | Used In | Purpose |
|---------|---------|---------|---------|
| `react-hook-form` | ^7.83.0 | `login-form.tsx`, `signup-form.tsx` | Form state management |
| `@hookform/resolvers` | ^4.1.3 | `login-form.tsx`, `signup-form.tsx` | Zod integration with react-hook-form |
| `zod` | ^3.24.4 | Auth schemas, RBAC schemas, webhook routes | Schema validation and type inference |

### Utilities

| Package | Version | Used In | Purpose |
|---------|---------|---------|---------|
| `date-fns` | ^4.4.0 | `core/utils/date.ts` | Date formatting and relative time |
| `clsx` | ^2.1.1 | `core/utils/cn.ts` | Conditional CSS class joining |
| `tailwind-merge` | ^3.6.0 | `core/utils/cn.ts` | Tailwind class conflict resolution |

---

## Active DevDependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5 | Type checking and compilation |
| `@types/node` | ^20 | Node.js type definitions |
| `@types/react` | ^19 | React type definitions |
| `@types/react-dom` | ^19 | React DOM type definitions |
| `tailwindcss` | ^4 | Utility-first CSS framework |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin for Tailwind v4 |
| `eslint` | ^9 | Code linting |
| `eslint-config-next` | 16.2.11 | Next.js ESLint configuration |

---

## Removed Packages (22 removed in QG-1)

The following packages were removed during Quality Gate 1 because they are not used by the current implementation. They can be reinstalled when needed for Phase 1+ features.

### Radix UI Primitives (15 packages)
`@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-toast`, `@radix-ui/react-tooltip`

### UI Utilities (4 packages)
`class-variance-authority` (component variants), `cmdk` (command palette), `lucide-react` (icons), `sonner` (toasts)

### Other (3 packages)
`uuid` (client-side UUIDs), `vaul` (drawer component), `csstype` (CSS types — pinned version no longer needed)

---

## Dependency Tree (Current)

```
next 16.2.11
├── react 19.2.4
├── react-dom 19.2.4
├── @supabase/ssr ^0.12.3
│   └── @supabase/supabase-js ^2.110.8
├── @tanstack/react-query ^5.101.4
├── next-themes ^0.4.6
├── react-hook-form ^7.83.0
├── @hookform/resolvers ^4.1.3
├── zod ^3.24.4
├── date-fns ^4.4.0
├── clsx ^2.1.1
└── tailwind-merge ^3.6.0

DevDependencies:
├── typescript ^5
├── @types/node ^20
├── @types/react ^19
├── @types/react-dom ^19
├── tailwindcss ^4
├── @tailwindcss/postcss ^4
├── eslint ^9
└── eslint-config-next 16.2.11
```
