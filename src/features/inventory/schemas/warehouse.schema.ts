import { z } from 'zod'

export const warehouseSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  location: z.string().max(255).optional().nullable(),
  is_active: z.boolean().optional().default(true),
})

export const warehouseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateWarehouseInput = z.infer<typeof warehouseSchema>
export type UpdateWarehouseInput = z.infer<typeof warehouseSchema>
export type WarehouseQuery = z.infer<typeof warehouseQuerySchema>