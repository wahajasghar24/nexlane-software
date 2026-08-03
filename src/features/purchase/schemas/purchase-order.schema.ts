import { z } from 'zod'

export const purchaseOrderItemSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1).max(255),
  quantity: z.coerce.number().positive(),
  unit_price: z.coerce.number().nonnegative(),
})

export const createPurchaseOrderSchema = z.object({
  vendor_id: z.string().uuid().optional().nullable(),
  expected_date: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  tax_rate: z.coerce.number().nonnegative().default(0),
  items: z.array(purchaseOrderItemSchema).min(1),
})

export const updatePurchaseOrderSchema = z.object({
  vendor_id: z.string().uuid().optional().nullable(),
  expected_date: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  tax_rate: z.coerce.number().nonnegative().optional(),
  items: z.array(purchaseOrderItemSchema).min(1).optional(),
})

export const purchaseOrderQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>
export type PurchaseOrderQuery = z.infer<typeof purchaseOrderQuerySchema>
