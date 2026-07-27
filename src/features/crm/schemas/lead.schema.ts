import { z } from 'zod'

export const leadStatusEnum = z.enum(['new', 'contacted', 'qualified', 'unqualified', 'converted'])
export const leadPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent'])

export const createLeadSchema = z.object({
  title: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  company: z.string().max(255).optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().max(100).optional().or(z.literal('')),
  source: z.string().max(100).optional().or(z.literal('')),
  status: leadStatusEnum.optional().default('new'),
  priority: leadPriorityEnum.optional().default('medium'),
  estimated_value: z.number().positive().optional(),
  notes: z.string().optional(),
  assigned_to: z.string().uuid().optional().nullable(),
  crm_company_id: z.string().uuid().optional().nullable(),
})

export const updateLeadSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(50).optional().nullable().or(z.literal('')),
  company: z.string().max(255).optional().nullable().or(z.literal('')),
  website: z.string().url().optional().nullable().or(z.literal('')),
  industry: z.string().max(100).optional().nullable().or(z.literal('')),
  source: z.string().max(100).optional().nullable().or(z.literal('')),
  status: leadStatusEnum.optional(),
  priority: leadPriorityEnum.optional(),
  estimated_value: z.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  crm_company_id: z.string().uuid().optional().nullable(),
})

export const leadQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  priority: leadPriorityEnum.optional(),
  source: z.string().max(100).optional(),
  assigned_to: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const assignLeadSchema = z.object({
  assigned_to: z.string().uuid(),
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
export type LeadQuery = z.infer<typeof leadQuerySchema>
export type AssignLeadInput = z.infer<typeof assignLeadSchema>
