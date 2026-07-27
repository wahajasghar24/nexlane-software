import { z } from 'zod'

export const createCrmCompanySchema = z.object({
  name: z.string().min(1).max(255),
  industry: z.string().max(100).optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  address: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
})

export const updateCrmCompanySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  industry: z.string().max(100).optional().nullable().or(z.literal('')),
  website: z.string().url().optional().nullable().or(z.literal('')),
  phone: z.string().max(50).optional().nullable().or(z.literal('')),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.record(z.unknown()).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const crmCompanyQuerySchema = z.object({
  search: z.string().optional(),
  industry: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateCrmCompanyInput = z.infer<typeof createCrmCompanySchema>
export type UpdateCrmCompanyInput = z.infer<typeof updateCrmCompanySchema>
export type CrmCompanyQuery = z.infer<typeof crmCompanyQuerySchema>
