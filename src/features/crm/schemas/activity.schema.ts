import { z } from 'zod'

export const activityTypeEnum = z.enum(['call', 'meeting', 'email', 'follow_up', 'task'])
export const activityEntityTypeEnum = z.enum(['lead', 'deal', 'contact', 'crm_company'])

export const createActivitySchema = z.object({
  entity_type: activityEntityTypeEnum,
  entity_id: z.string().uuid(),
  type: activityTypeEnum,
  subject: z.string().min(1).max(255),
  description: z.string().optional(),
  scheduled_at: z.string().datetime().optional().nullable(),
  completed_at: z.string().datetime().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
})

export const updateActivitySchema = z.object({
  type: activityTypeEnum.optional(),
  subject: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  scheduled_at: z.string().datetime().optional().nullable(),
  completed_at: z.string().datetime().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
})

export const activityQuerySchema = z.object({
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  type: activityTypeEnum.optional(),
  assigned_to: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateActivityInput = z.infer<typeof createActivitySchema>
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>
export type ActivityQuery = z.infer<typeof activityQuerySchema>
