# Nexlane — Development Guidelines

## 1. Code Conventions

### TypeScript
- **Strict mode** enabled (`strict: true`)
- Prefer `interface` over `type` for object shapes
- Use `type` for unions, intersections, primitives
- Avoid `any` — use `unknown` and narrow with guards
- All functions must have explicit return types
- Use `as const` for literal constants
- No business logic inside UI components
- Thin API routes — delegate to services immediately

### Naming
| Construct | Convention | Example |
|-----------|-----------|---------|
| Files | kebab-case | `create-task-form.tsx` |
| Components | PascalCase | `TaskCard` |
| Hooks | camelCase, `use` prefix | `useTasks` |
| Services | camelCase | `taskService` |
| Repositories | camelCase | `taskRepository` |
| Functions | camelCase | `getTaskById` |
| Constants | UPPER_SNAKE | `PAGE_SIZE` |
| Types/Interfaces | PascalCase | `CreateTaskInput` |
| DB columns | snake_case | `company_id` |
| Permission codes | dot-notation | `task.create`, `invoice.delete` |
| Event types | dot-notation | `lead.created`, `task.assigned` |

### Imports Order
1. Node built-ins / external libraries
2. `@/core/` modules
3. `@/infrastructure/` modules
4. `@/shared/` modules
5. `@/features/` modules
6. Relative imports

## 2. Multi-Tenant Pattern

```typescript
// company_id is ALWAYS derived from the authenticated user's session
// NEVER accept company_id from client input

export async function createTask(input: CreateTaskInput, context: UserContext) {
  const data = { ...input, company_id: context.companyId, created_by: context.userId }
  return await taskRepository.create(data)
}
```

## 3. Repository Pattern

```typescript
// Each repository method takes company_id as first param for RLS
export const taskRepository = {
  async findAll(companyId: string, filters: TaskFilters): Promise<PaginatedResult<Task>> {
    const supabase = await createClient()
    let query = supabase.from('tasks').select('*', { count: 'exact' }).eq('company_id', companyId)
    // ... filters
    const { data, count, error } = await query.range(offset, offset + limit - 1)
    if (error) throw new DatabaseError(error)
    return { data, total: count ?? 0 }
  },
}
```

## 4. Service Pattern with Events

```typescript
export const taskService = {
  async create(input: CreateTaskInput, context: UserContext) {
    const parsed = createTaskSchema.parse(input)
    const task = await taskRepository.create({ ...parsed, company_id: context.companyId, created_by: context.userId })

    await eventBus.emit({
      companyId: context.companyId,
      eventType: 'task.created',
      entityType: 'task',
      entityId: task.id,
      payload: { task, actorId: context.userId },
    })

    return task
  }
}
```

## 5. Thin API Routes

```typescript
export async function POST(request: Request) {
  const context = await authenticate(request)       // auth + company
  const body = await request.json()
  const result = await taskService.create(body, context)
  return created(result)
}
```

## 6. Event Bus Pattern

Events are persisted in `domain_events` table. Handlers are registered independently:

```typescript
eventBus.on('lead.created', activityHandler)     // always
eventBus.on('lead.created', notificationHandler)  // if pref configured
eventBus.on('lead.created', webhookHandler)       // if n8n enabled
```

All handlers are async-safe. If one fails, others still process. Failed events can be replayed via admin API.

## 7. Dynamic RBAC

```typescript
// In middleware or route handler
await authorize(context, 'tasks.create')

// In UI
<PermissionGuard permission="tasks.create">
  <Button>Create Task</Button>
</PermissionGuard>
```

## 8. Feature Flags

```typescript
// Check if a feature is enabled for the current company
const flags = await featureFlagService.getEnabled(context.companyId)
if (!flags.includes('module.accounting')) {
  throw new AppError('FEATURE_DISABLED', 'Accounting is not enabled', 403)
}
```

## 9. Soft Delete Pattern

```typescript
async softDelete(companyId: string, id: string, deletedBy: string) {
  const { error } = await supabase
    .from('tasks')
    .update({ deleted_at: new Date().toISOString(), deleted_by: deletedBy })
    .eq('id', id)
    .eq('company_id', companyId)
  if (error) throw new DatabaseError(error)
}

// Queries always filter out deleted
// Add .is('deleted_at', null) to every query
```

## 10. No Hardcoded Values

- Permission codes → defined in `permissions.ts` constants, stored in DB
- Event types → defined in `events/types.ts`, stored in DB
- Settings keys → defined as constants, values in DB
- Feature flag codes → defined as constants, toggles in DB

## 11. Testing Strategy

| Layer | Tool | Coverage |
|-------|------|----------|
| Zod schemas | Vitest | 100% |
| Services | Vitest + mocks | 90%+ |
| Components | Vitest + Testing Library | 80%+ |
| API routes | Vitest + supertest | 90%+ |
| E2E | Playwright | Critical paths |

## 12. Every Migration Must Be Reversible

Each migration file must have both `up` (apply) and `down` (rollback) sections:

```sql
-- UP
CREATE TABLE tasks (...)

-- DOWN
DROP TABLE IF EXISTS tasks;
```

## 13. Dependency Injection

- Services receive repositories via parameters or constructor functions
- Repositories receive Supabase client via factory functions
- This enables unit testing with mocked dependencies
