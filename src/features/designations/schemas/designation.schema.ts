import { z } from 'zod'

export const createDesignationSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
})

export const updateDesignationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
})

export type CreateDesignationInput = z.infer<typeof createDesignationSchema>
export type UpdateDesignationInput = z.infer<typeof updateDesignationSchema>
