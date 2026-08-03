import { z } from 'zod'

export const attendanceQuerySchema = z.object({
  work_date: z.string().optional(),
  employee_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const createTimeOffSchema = z.object({
  type: z.enum(['annual', 'sick', 'unpaid']),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  reason: z.string().max(1000).optional().nullable(),
})

export const approveTimeOffSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
})

export const timeOffQuerySchema = z.object({
  status: z.string().optional(),
  employee_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})