export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
export type JobQueue = 'default' | 'notifications' | 'webhooks' | 'reports' | 'ai'

export interface CreateJobInput {
  companyId: string
  type: string
  queue?: JobQueue
  payload: Record<string, unknown>
  priority?: number
  scheduledAt?: string
  maxRetries?: number
}
