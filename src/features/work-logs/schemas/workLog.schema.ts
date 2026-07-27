import { z } from 'zod'

export const createWorkLogSchema = z.object({
  employee_id: z.string().uuid(),
  task_id: z.string().uuid().optional(),
  log_date: z.string().datetime(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  hours: z.number().positive().max(24),
  description: z.string().optional(),
  progress_percentage: z.number().int().min(0).max(100).optional(),
  blockers: z.string().optional(),
  next_step: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional().default('draft'),
})

export const updateWorkLogSchema = z.object({
  employee_id: z.string().uuid().optional(),
  task_id: z.string().uuid().optional(),
  log_date: z.string().datetime().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  hours: z.number().positive().max(24).optional(),
  description: z.string().optional(),
  progress_percentage: z.number().int().min(0).max(100).optional(),
  blockers: z.string().optional(),
  next_step: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
})

export const workLogQuerySchema = z.object({
  employee_id: z.string().uuid().optional(),
  task_id: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
})

export type CreateWorkLogInput = z.infer<typeof createWorkLogSchema>
export type UpdateWorkLogInput = z.infer<typeof updateWorkLogSchema>
export type WorkLogQuery = z.infer<typeof workLogQuerySchema>
