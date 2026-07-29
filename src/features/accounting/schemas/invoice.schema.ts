import { z } from 'zod'

export const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive().default(1),
  unit_price: z.number().min(0).default(0),
  tax_rate: z.number().min(0).max(100).default(0),
})

export const createInvoiceSchema = z.object({
  customer_id: z.string().uuid(),
  contact_id: z.string().uuid().optional().nullable(),
  invoice_date: z.string().optional(),
  due_date: z.string().min(1),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'Need at least 1 item'),
})

export const updateInvoiceSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
})

export const invoiceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
  search: z.string().optional(),
})

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>
