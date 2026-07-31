import { z } from 'zod'

export const createEmployeeSchema = z.object({
  profile_id: z.string().uuid().optional(),
  first_name: z.string().min(1).max(255),
  last_name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone: z.string().min(1).max(50),
  department_id: z.string().uuid().optional(),
  designation_id: z.string().uuid().optional(),
  employment_status: z.enum(['active', 'inactive', 'on_leave', 'terminated']),
  employee_code: z.string().max(50).optional(),
  position: z.string().min(1).max(255),
  hire_date: z.string().optional(),
  salary: z.number().positive().optional(),
  bio: z.string().max(2000).optional(),
  emergency_contact: z.object({
    name: z.string().min(1).max(255),
    phone: z.string().min(1).max(50),
    relationship: z.string().min(1).max(255),
  }).optional(),
})

export const updateEmployeeSchema = z.object({
  first_name: z.string().min(1).max(255).optional(),
  last_name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).max(50).optional(),
  department_id: z.string().uuid().optional(),
  designation_id: z.string().uuid().optional(),
  employment_status: z.enum(['active', 'inactive', 'on_leave', 'terminated']).optional(),
  employee_code: z.string().max(50).optional(),
  position: z.string().min(1).max(255).optional(),
  hire_date: z.string().optional(),
  salary: z.number().positive().optional(),
  bio: z.string().max(2000).optional(),
  emergency_contact: z.object({
    name: z.string().min(1).max(255),
    phone: z.string().min(1).max(50),
    relationship: z.string().min(1).max(255),
  }).optional(),
})

export const employeeQuerySchema = z.object({
  search: z.string().optional(),
  department_id: z.string().uuid().optional(),
  designation_id: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive', 'on_leave', 'terminated']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
