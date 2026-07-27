import { createAdminClient } from '@/core/supabase/admin'
import { DatabaseError } from '@/core/errors/database-error'
import type { CreateJobInput } from './types'
import type { Job } from '@/core/types/common'

export const jobRepository = {
  async create(input: CreateJobInput): Promise<Job> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        company_id: input.companyId,
        type: input.type,
        queue: input.queue || 'default',
        payload: input.payload,
        priority: input.priority || 0,
        scheduled_at: input.scheduledAt || new Date().toISOString(),
        max_retries: input.maxRetries || 3,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return mapJob(data)
  },

  async updateStatus(id: string, status: string, error?: string): Promise<void> {
    const supabase = createAdminClient()
    const update: Record<string, unknown> = { status }
    if (status === 'processing') update.started_at = new Date().toISOString()
    if (status === 'completed') update.completed_at = new Date().toISOString()
    if (status === 'failed' && error) update.error = error

    const { error: dbError } = await supabase
      .from('jobs')
      .update(update)
      .eq('id', id)

    if (dbError) throw new DatabaseError(dbError)
  },

  async incrementRetry(id: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase.rpc('increment_job_retry', { job_id: id })
    if (error) throw new DatabaseError(error)
  },

  async findPending(limit: number = 20): Promise<Job[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw new DatabaseError(error)
    return (data || []).map(mapJob)
  },
}

function mapJob(data: Record<string, unknown>): Job {
  return {
    id: data.id as string,
    companyId: data.company_id as string,
    type: data.type as string,
    queue: data.queue as string,
    payload: data.payload as Record<string, unknown>,
    status: data.status as Job['status'],
    priority: data.priority as number || 0,
    scheduledAt: data.scheduled_at as string,
    startedAt: data.started_at as string,
    completedAt: data.completed_at as string,
    retryCount: data.retry_count as number || 0,
    maxRetries: data.max_retries as number || 3,
    error: data.error as string,
    createdAt: data.created_at as string,
  }
}
