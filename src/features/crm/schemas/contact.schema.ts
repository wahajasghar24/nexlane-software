import { z } from 'zod'

export const createContactSchema = z.object({
  crm_company_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(255),
  designation: z.string().max(255).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  whatsapp: z.string().max(50).optional().or(z.literal('')),
  is_primary: z.boolean().optional().default(false),
  notes: z.string().optional(),
})

export const updateContactSchema = z.object({
  crm_company_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(255).optional(),
  designation: z.string().max(255).optional().nullable().or(z.literal('')),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(50).optional().nullable().or(z.literal('')),
  whatsapp: z.string().max(50).optional().nullable().or(z.literal('')),
  is_primary: z.boolean().optional(),
  notes: z.string().optional().nullable(),
})

export const contactQuerySchema = z.object({
  search: z.string().optional(),
  crm_company_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateContactInput = z.infer<typeof createContactSchema>
export type UpdateContactInput = z.infer<typeof updateContactSchema>
export type ContactQuery = z.infer<typeof contactQuerySchema>
