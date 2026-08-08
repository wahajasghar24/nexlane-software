import { z } from 'zod'
import { CURRENCY_CODES } from './journal.schema'

export const createBankAccountSchema = z.object({
  name: z.string().min(1).max(255),
  bank_name: z.string().max(255).optional(),
  account_number: z.string().max(50).optional(),
  currency: z.enum(CURRENCY_CODES).default('AED'),
})

export const updateBankAccountSchema = createBankAccountSchema.partial()

export const bankTransactionSchema = z.object({
  transaction_date: z.string(),
  description: z.string().min(1),
  amount: z.number(),
  currency: z.enum(CURRENCY_CODES).default('AED'),
  type: z.enum(['credit', 'debit']),
  reference: z.string().optional(),
  category: z.string().optional(),
})

export const importTransactionsSchema = z.array(bankTransactionSchema)

export const bankTransactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().optional(),
  type: z.enum(['credit', 'debit']).optional(),
  is_reconciled: z.coerce.boolean().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

export const createReconciliationSessionSchema = z.object({
  bank_account_id: z.string().uuid(),
  period_start: z.string(),
  period_end: z.string(),
  statement_balance: z.number(),
  notes: z.string().optional(),
})

export const reconcileTransactionSchema = z.object({
  transaction_id: z.string().uuid(),
  journal_entry_id: z.string().uuid().optional(),
})

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>
export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>
export type BankTransactionInput = z.infer<typeof bankTransactionSchema>
export type BankTransactionQuery = z.infer<typeof bankTransactionQuerySchema>
export type CreateReconciliationSessionInput = z.infer<typeof createReconciliationSessionSchema>
