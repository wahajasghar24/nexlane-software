import { z } from 'zod'

export const createProductSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  unit: z.string().max(20).default('pcs'),
  purchase_price: z.coerce.number().nonnegative().default(0),
  sale_price: z.coerce.number().nonnegative().default(0),
  min_stock: z.coerce.number().nonnegative().default(0),
})

export const updateProductSchema = createProductSchema.partial()

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  is_active: z.string().optional(), // 'true' | 'false'
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const stockAdjustSchema = z.object({
  quantity: z.coerce.number(), // signed: + add / - remove
  note: z.string().max(500).optional().nullable(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductQuery = z.infer<typeof productQuerySchema>
export type StockAdjustInput = z.infer<typeof stockAdjustSchema>
