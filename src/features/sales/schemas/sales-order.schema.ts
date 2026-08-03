import { z } from 'zod'

export const salesOrderItemSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1).max(255),
  quantity: z.coerce.number().positive(),
  unit_price: z.coerce.number().nonnegative(),
})

export const createSalesOrderSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  contact_id: z.string().uuid().optional().nullable(),
  valid_until: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  tax_rate: z.coerce.number().nonnegative().default(0),
  items: z.array(salesOrderItemSchema).min(1),
})

export const updateSalesOrderSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  contact_id: z.string().uuid().optional().nullable(),
  valid_until: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  tax_rate: z.coerce.number().nonnegative().optional(),
  items: z.array(salesOrderItemSchema).min(1).optional(),
})

export const salesOrderQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>
export type UpdateSalesOrderInput = z.infer<typeof updateSalesOrderSchema>
export type SalesOrderQuery = z.infer<typeof salesOrderQuerySchema>
