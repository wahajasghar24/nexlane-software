# API Catalog

**Project:** Nexlane
**Total Endpoints:** 17
**Last Updated:** Phase 0

---

## Authentication Endpoints

### POST /api/auth/login

Authenticate with email and password.

| Detail | Value |
|--------|-------|
| **Method** | `POST` |
| **Auth** | None (public) |
| **Permission** | None |

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Success Response (200):**
```json
{
  "data": { "user": { ... Supabase User ... } },
  "error": null
}
```

**Error Codes:**

| Status | Code | Condition |
|--------|------|-----------|
| 401 | `AUTH_ERROR` | Invalid credentials |
| 422 | `VALIDATION_ERROR` | Invalid email or password format |
| 500 | `SERVER_ERROR` | Unexpected server error |

---

### POST /api/auth/signup

Register a new user account with optional company name.

| Detail | Value |
|--------|-------|
| **Method** | `POST` |
| **Auth** | None (public) |
| **Permission** | None |

**Side Effects:** Creates company, company membership, and Owner role assignment.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe",
  "companyName": "My Company (optional)"
}
```

**Success Response (200):**
```json
{
  "data": { "user": { ... Supabase User ... } },
  "error": null
}
```

**Error Codes:**

| Status | Code | Condition |
|--------|------|-----------|
| 400 | `AUTH_ERROR` | Signup failed (e.g., email taken) |
| 422 | `VALIDATION_ERROR` | Invalid input format |
| 500 | `SERVER_ERROR` | Unexpected server error |

---

### POST /api/auth/logout

Sign out the current user.

| Detail | Value |
|--------|-------|
| **Method** | `POST` |
| **Auth** | None |
| **Permission** | None |
| **Request Body** | None |

**Success Response (200):**
```json
{
  "data": { "success": true },
  "error": null
}
```

---

### GET /api/auth/session

Get the current Supabase session.

| Detail | Value |
|--------|-------|
| **Method** | `GET` |
| **Auth** | None |
| **Permission** | None |

**Success Response (200):**
```json
{
  "data": { "session": { ... Supabase Session or null ... } },
  "error": null
}
```

**Error Codes:**

| Status | Code | Condition |
|--------|------|-----------|
| 401 | `AUTH_ERROR` | Session fetch error |

---

### GET /api/auth/me

Get current user profile, preferences, and associated companies.

| Detail | Value |
|--------|-------|
| **Method** | `GET` |
| **Auth** | Required (implicit via `getUser()`) |
| **Permission** | None |

**Success Response (200):**
```json
{
  "data": {
    "user": { ... Supabase Auth User ... },
    "profile": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "avatar_url": null,
      "phone": null,
      "timezone": "UTC",
      "locale": "en"
    },
    "companies": [
      {
        "company_id": "uuid",
        "companies": {
          "id": "uuid",
          "name": "Nexlane",
          "slug": "nexlane",
          "logo_url": null
        }
      }
    ]
  },
  "error": null
}
```

**Error Codes:**

| Status | Code | Condition |
|--------|------|-----------|
| 401 | `UNAUTHORIZED` | Not authenticated |

---

### POST /api/auth/switch-company

Switch the user's active/default company.

| Detail | Value |
|--------|-------|
| **Method** | `POST` |
| **Auth** | Required (implicit via `getUser()`) |
| **Permission** | None |

**Request Body:**
```json
{
  "companyId": "uuid"
}
```

**Success Response (200):**
```json
{
  "data": { "success": true },
  "error": null
}
```

**Error Codes:**

| Status | Code | Condition |
|--------|------|-----------|
| 401 | `UNAUTHORIZED` | Not authenticated |
| 500 | `SERVER_ERROR` | Failed to switch company |

---

## RBAC Endpoints

All RBAC endpoints require authentication via `authenticate()` and the `rbac.manage` permission via `authorize()`.

---

### GET /api/rbac/permissions

List all available permissions in the system.

| Detail | Value |
|--------|-------|
| **Method** | `GET` |
| **Auth** | Required |
| **Permission** | `rbac.manage` |

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "module": "employees",
      "code": "employees.list",
      "name": "List Employees",
      "description": "Can view employee directory"
    }
  ],
  "error": null
}
```

**Error Codes:**

| Status | Code | Condition |
|--------|------|-----------|
| 401 | `UNAUTHENTICATED` | Not logged in |
| 403 | `NO_COMPANY` | No company membership |
| 403 | `FORBIDDEN` | Missing `rbac.manage` permission |
| 500 | `SERVER_ERROR` | Unexpected error |

---

### GET /api/rbac/roles

List all roles for the current company.

| Detail | Value |
|--------|-------|
| **Method** | `GET` |
| **Auth** | Required |
| **Permission** | `rbac.manage` |

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "name": "Admin",
      "description": "Administrator role",
      "is_system": true,
      "created_by": "uuid",
      "created_at": "timestamp",
      "updated_by": null,
      "updated_at": null,
      "role_permissions": [
        { "permission_id": "uuid" }
      ]
    }
  ],
  "error": null
}
```

---

### POST /api/rbac/roles

Create a new role with permissions.

| Detail | Value |
|--------|-------|
| **Method** | `POST` |
| **Auth** | Required |
| **Permission** | `rbac.manage` |

**Request Body:**
```json
{
  "name": "Project Manager",
  "description": "Manages projects and tasks",
  "permissionIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Success Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "company_id": "uuid",
    "name": "Project Manager",
    "description": "Manages projects and tasks",
    "created_by": "uuid",
    "created_at": "timestamp"
  },
  "error": null
}
```

---

### GET /api/rbac/roles/[id]

Get a single role with its full permission details.

| Detail | Value |
|--------|-------|
| **Method** | `GET` |
| **Auth** | Required |
| **Permission** | `rbac.manage` |
| **Params** | `id` — Role UUID |

**Success Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "company_id": "uuid",
    "name": "Admin",
    "description": null,
    "is_system": true,
    "created_by": "uuid",
    "created_at": "timestamp",
    "updated_by": null,
    "updated_at": null,
    "permissions": [
      {
        "id": "uuid",
        "module": "employees",
        "code": "employees.list",
        "name": "List Employees",
        "description": "Can view employee directory"
      }
    ]
  },
  "error": null
}
```

---

### PATCH /api/rbac/roles/[id]

Update a role's name and/or description.

| Detail | Value |
|--------|-------|
| **Method** | `PATCH` |
| **Auth** | Required |
| **Permission** | `rbac.manage` |
| **Params** | `id` — Role UUID |

**Request Body:**
```json
{
  "name": "Updated Role Name",
  "description": "Updated description"
}
```

**Success Response (200):**
```json
{
  "data": { "updated role object" },
  "error": null
}
```

---

### DELETE /api/rbac/roles/[id]

Soft-delete a role. System roles cannot be deleted.

| Detail | Value |
|--------|-------|
| **Method** | `DELETE` |
| **Auth** | Required |
| **Permission** | `rbac.manage` |
| **Params** | `id` — Role UUID |

**Success Response (200):**
```json
{
  "data": { "success": true },
  "error": null
}
```

**Error Codes:**

| Status | Code | Condition |
|--------|------|-----------|
| 403 | `SYSTEM_ROLE` | Cannot delete system-defined roles |

---

### POST /api/rbac/roles/[id]/permissions

Replace all permissions assigned to a role.

| Detail | Value |
|--------|-------|
| **Method** | `POST` |
| **Auth** | Required |
| **Permission** | `rbac.manage` |
| **Params** | `id` — Role UUID |

**Request Body:**
```json
{
  "permissionIds": ["uuid1", "uuid2"]
}
```

**Success Response (200):**
```json
{
  "data": { "success": true },
  "error": null
}
```

---

## n8n Webhook Endpoints

All webhook endpoints authenticate via Bearer token matching the `NEXLANE_WEBHOOK_SECRET` environment variable.

---

### POST /api/webhooks/n8n/tasks

Create a task from an external workflow (n8n).

| Detail | Value |
|--------|-------|
| **Method** | `POST` |
| **Auth** | Webhook secret (Bearer token) |
| **Permission** | None |

**Request Body:**
```json
{
  "company_id": "uuid",
  "title": "Implement login page",
  "description": "Build the login page UI and validation",
  "project_id": "uuid (optional)",
  "assigned_to": "uuid (optional)",
  "status": "todo",
  "priority": "medium",
  "due_date": "2026-08-01 (optional)",
  "estimated_hours": 8
}
```

**Success Response (201):**
```json
{
  "data": { "full task object..." },
  "error": null
}
```

**Event Emitted:** `task.created` with `{ ...task, source: 'n8n' }`

**Error Codes:**

| Status | Code | Condition |
|--------|------|-----------|
| 401 | `UNAUTHORIZED` | Invalid webhook secret |
| 422 | `VALIDATION_ERROR` | Invalid input |
| 500 | `DB_ERROR` | Database error |
| 500 | `SERVER_ERROR` | Unexpected error |

---

### POST /api/webhooks/n8n/leads

Create a lead from an external workflow (n8n).

| Detail | Value |
|--------|-------|
| **Method** | `POST` |
| **Auth** | Webhook secret (Bearer token) |
| **Permission** | None |

**Request Body:**
```json
{
  "company_id": "uuid",
  "contact_name": "Jane Smith",
  "company_name": "Acme Corp (optional)",
  "email": "jane@acme.com (optional)",
  "phone": "+1234567890 (optional)",
  "source": "n8n",
  "status": "new",
  "priority": "medium",
  "assigned_to": "uuid (optional)",
  "estimated_value": 50000,
  "notes": "Interested in enterprise plan"
}
```

**Success Response (201):**
```json
{
  "data": { "full lead object..." },
  "error": null
}
```

**Event Emitted:** `lead.created` with `{ ...lead, source: 'n8n' }`

---

### POST /api/webhooks/n8n/customers

Create a customer from an external workflow (n8n).

| Detail | Value |
|--------|-------|
| **Method** | `POST` |
| **Auth** | Webhook secret (Bearer token) |
| **Permission** | None |

**Request Body:**
```json
{
  "company_id": "uuid",
  "contact_name": "Jane Smith",
  "company_name": "Acme Corp (optional)",
  "email": "jane@acme.com (optional)",
  "phone": "+1234567890 (optional)",
  "website": "https://acme.com (optional)",
  "industry": "Technology (optional)",
  "notes": "Enterprise customer"
}
```

**Success Response (201):**
```json
{
  "data": { "full customer object..." },
  "error": null
}
```

**Event Emitted:** `customer.created` with `{ ...customer, source: 'n8n' }`

---

### POST /api/webhooks/n8n/invoices

Create an invoice with line items from an external workflow (n8n).

| Detail | Value |
|--------|-------|
| **Method** | `POST` |
| **Auth** | Webhook secret (Bearer token) |
| **Permission** | None |

**Request Body:**
```json
{
  "company_id": "uuid",
  "customer_id": "uuid",
  "issue_date": "2026-07-25",
  "due_date": "2026-08-24",
  "items": [
    {
      "description": "Consulting services",
      "quantity": 40,
      "unit_price": 150
    },
    {
      "description": "Software license",
      "quantity": 1,
      "unit_price": 500
    }
  ],
  "notes": "Payment due within 30 days (optional)"
}
```

**Success Response (201):**
```json
{
  "data": {
    "...invoice fields...": "...",
    "items": [ "...invoice item objects..." ]
  },
  "error": null
}
```

**Event Emitted:** `invoice.created` with `{ ...invoice, items, source: 'n8n' }`

---

## Common Error Response Format

All endpoints return errors in the following format:

```json
{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description"
  }
}
```

For validation errors (422), the response additionally includes:
```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { "...Zod error details..." }
  }
}
```

---

## Unified Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `UNAUTHENTICATED` | 401 | Authentication required |
| `AUTH_ERROR` | 401 | Login/session error |
| `UNAUTHORIZED` | 401 | Invalid or missing credentials |
| `NO_COMPANY` | 403 | User has no company membership |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `SYSTEM_ROLE` | 403 | Cannot modify system role |
| `VALIDATION_ERROR` | 422 | Request body validation failed |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `DB_ERROR` | 500 | Database insert/query failed |
| `SERVER_ERROR` | 500 | Unexpected internal error |
