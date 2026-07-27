import { z } from 'zod'

export const createTeamSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  lead_id: z.string().uuid().optional(),
  member_ids: z.array(z.string().uuid()).optional(),
})

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  lead_id: z.string().uuid().optional(),
})

export const addTeamMemberSchema = z.object({
  member_id: z.string().uuid(),
})

export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>
