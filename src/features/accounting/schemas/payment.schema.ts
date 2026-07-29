import { z } from 'zod'

export const createPaymentSchema = z.object({
  invoice_id: z.string().uuid().optional().nullable(),
  customer_id: z.string().uuid().optional().nullable(),
  amount: z.number().positive(),
  payment_date: z.string().optional(),
  method: z.enum(['cash', 'bank', 'check', 'credit_card', 'other']).default('bank'),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export const paymentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
