import { z } from 'zod'

export const createEmployeeSkillSchema = z.object({
  skill: z.string().min(1).max(255),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
})

export const updateEmployeeSkillSchema = z.object({
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
})

export type CreateEmployeeSkillInput = z.infer<typeof createEmployeeSkillSchema>
export type UpdateEmployeeSkillInput = z.infer<typeof updateEmployeeSkillSchema>

export const addSkillSchema = createEmployeeSkillSchema
export type AddSkillInput = CreateEmployeeSkillInput
