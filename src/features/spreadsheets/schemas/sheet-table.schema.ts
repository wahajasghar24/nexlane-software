import { z } from 'zod'

export const createSheetTableSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional().or(z.literal('')),
})

export const updateSheetTableSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
})

export const sheetTableQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const createSheetColumnSchema = z.object({
  sheet_table_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  key: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  options: z.any().optional(),
  position: z.number().int().min(0),
  width: z.number().int().min(50).default(200),
  required: z.boolean().default(false),
  default_value: z.string().optional(),
})

export const updateSheetColumnSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  key: z.string().min(1).max(100).optional(),
  type: z.string().min(1).max(50).optional(),
  options: z.any().optional(),
  position: z.number().int().min(0).optional(),
  width: z.number().int().min(50).optional(),
  required: z.boolean().optional(),
  default_value: z.string().optional().nullable(),
})

export const createSheetRowSchema = z.object({
  sheet_table_id: z.string().uuid(),
  cells: z.record(z.string(), z.any()).optional(),
})

export const updateSheetCellSchema = z.object({
  value: z.any(),
})

export type CreateSheetTableInput = z.infer<typeof createSheetTableSchema>
export type UpdateSheetTableInput = z.infer<typeof updateSheetTableSchema>
export type SheetTableQuery = z.infer<typeof sheetTableQuerySchema>
export type CreateSheetColumnInput = z.infer<typeof createSheetColumnSchema>
export type UpdateSheetColumnInput = z.infer<typeof updateSheetColumnSchema>
export type CreateSheetRowInput = z.infer<typeof createSheetRowSchema>
export type UpdateSheetCellInput = z.infer<typeof updateSheetCellSchema>
