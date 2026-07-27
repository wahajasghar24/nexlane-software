import { z } from 'zod'

export const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  permissionIds: z.array(z.string().uuid()).min(1),
})

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
})

export const assignPermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()),
})

export const assignUserRoleSchema = z.object({
  roleId: z.string().uuid(),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>
