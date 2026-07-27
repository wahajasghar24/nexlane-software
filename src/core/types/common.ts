export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
  meta?: PaginationMeta
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface UserContext {
  userId: string
  companyId: string
  email: string
  ip?: string
  userAgent?: string
}

export interface DomainEvent {
  id?: string
  companyId: string
  eventType: string
  entityType: string
  entityId: string
  payload: Record<string, unknown>
  status?: 'pending' | 'processing' | 'processed' | 'failed'
  createdAt?: string
  processedAt?: string
}

export interface Job {
  id: string
  companyId: string
  type: string
  queue: string
  payload: Record<string, unknown>
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  priority: number
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  retryCount: number
  maxRetries: number
  error?: string
  createdAt: string
}

export type EntityType =
  | 'employee'
  | 'project'
  | 'task'
  | 'lead'
  | 'customer'
  | 'invoice'
  | 'expense'
  | 'payment'
  | 'file'
  | 'comment'
  | 'role'
  | 'company'
  | 'sheet_table'
  | 'sheet_row'
  | 'crm_company'
  | 'contact'
  | 'deal'
  | 'activity'
  | 'lead_note'
