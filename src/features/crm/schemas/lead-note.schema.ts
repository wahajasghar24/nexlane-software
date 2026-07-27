import { z } from 'zod'

export const createLeadNoteSchema = z.object({
  content: z.string().min(1),
})

export const updateLeadNoteSchema = z.object({
  content: z.string().min(1),
})

export type CreateLeadNoteInput = z.infer<typeof createLeadNoteSchema>
export type UpdateLeadNoteInput = z.infer<typeof updateLeadNoteSchema>
