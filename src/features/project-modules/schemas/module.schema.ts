import { z } from 'zod'

export const createModuleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).optional().default('planned'),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  sort_order: z.number().int().nonnegative().optional(),
})

export const updateModuleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  sort_order: z.number().int().nonnegative().optional(),
})

export type CreateModuleInput = z.infer<typeof createModuleSchema>
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>
