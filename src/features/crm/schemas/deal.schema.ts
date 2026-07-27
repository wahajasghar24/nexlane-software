import { z } from 'zod'

export const dealStageEnum = z.enum(['new', 'contacted', 'demo_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost'])

export const createDealSchema = z.object({
  lead_id: z.string().uuid().optional().nullable(),
  crm_company_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(255),
  value: z.number().positive().optional().default(0),
  probability: z.number().int().min(0).max(100).optional().default(0),
  stage: dealStageEnum.optional().default('new'),
  expected_close_date: z.string().optional().nullable(),
  owner_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
})

export const updateDealSchema = z.object({
  lead_id: z.string().uuid().optional().nullable(),
  crm_company_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(255).optional(),
  value: z.number().positive().optional().nullable(),
  probability: z.number().int().min(0).max(100).optional().nullable(),
  stage: dealStageEnum.optional(),
  expected_close_date: z.string().optional().nullable(),
  owner_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const dealQuerySchema = z.object({
  search: z.string().optional(),
  stage: z.string().optional(),
  owner_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const wonDealSchema = z.object({
  actual_close_date: z.string().optional(),
})

export const lostDealSchema = z.object({
  notes: z.string().optional(),
})

export type CreateDealInput = z.infer<typeof createDealSchema>
export type UpdateDealInput = z.infer<typeof updateDealSchema>
export type DealQuery = z.infer<typeof dealQuerySchema>
export type WonDealInput = z.infer<typeof wonDealSchema>
export type LostDealInput = z.infer<typeof lostDealSchema>
