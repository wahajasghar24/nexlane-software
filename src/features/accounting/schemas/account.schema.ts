import { z } from 'zod'

export const createAccountSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  category: z.string().max(100).optional(),
  parent_id: z.string().uuid().optional().nullable(),
  description: z.string().optional(),
})

export const updateAccountSchema = createAccountSchema.partial()

export const accountQuerySchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export type CreateAccountInput = z.infer<typeof createAccountSchema>
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>
export type AccountQuery = z.infer<typeof accountQuerySchema>
