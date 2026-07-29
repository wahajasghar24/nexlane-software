import { z } from 'zod'

export const journalLineSchema = z.object({
  account_id: z.string().uuid(),
  description: z.string().optional(),
  debit: z.number().positive().or(z.literal(0)).default(0),
  credit: z.number().positive().or(z.literal(0)).default(0),
})

export const createJournalEntrySchema = z.object({
  period_id: z.string().uuid().optional().nullable(),
  entry_date: z.string().optional(),
  description: z.string().min(1),
  reference: z.string().optional(),
  lines: z.array(journalLineSchema).min(2, 'Need at least 2 lines (debit and credit)'),
})

export const journalEntryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
  search: z.string().optional(),
})

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>
export type JournalLineInput = z.infer<typeof journalLineSchema>
