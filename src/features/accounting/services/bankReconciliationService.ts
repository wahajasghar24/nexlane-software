import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import type { PaginatedResult } from '@/core/types/common'
import {
  createBankAccountSchema,
  updateBankAccountSchema,
  bankTransactionQuerySchema,
  importTransactionsSchema,
  createReconciliationSessionSchema,
  reconcileTransactionSchema,
} from '@/features/accounting/schemas'
import type {
  CreateBankAccountInput,
  UpdateBankAccountInput,
  BankTransactionQuery,
  BankTransactionInput,
  CreateReconciliationSessionInput,
} from '@/features/accounting/schemas'

export const bankReconciliationService = {
  // ========================================================================
  // BANK ACCOUNTS
  // ========================================================================

  async listBankAccounts(companyId: string): Promise<PaginatedResult<Record<string, unknown>>> {
    const supabase = await createClient()

    const { data, error, count } = await supabase
      .from('bank_accounts')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error)

    return {
      data: data || [],
      total: count || 0,
      page: 1,
      pageSize: count || 0,
      totalPages: 1,
    }
  },

  async createBankAccount(companyId: string, input: CreateBankAccountInput) {
    const parsed = createBankAccountSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert({
        company_id: companyId,
        name: parsed.name,
        bank_name: parsed.bank_name || null,
        account_number: parsed.account_number || null,
        currency: parsed.currency,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async getBankAccount(companyId: string, accountId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('company_id', companyId)
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async updateBankAccount(companyId: string, accountId: string, input: UpdateBankAccountInput) {
    const parsed = updateBankAccountSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('bank_accounts')
      .update({ ...parsed, updated_at: new Date().toISOString() })
      .eq('id', accountId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  // ========================================================================
  // BANK TRANSACTIONS
  // ========================================================================

  async listBankTransactions(
    companyId: string,
    bankAccountId: string,
    query: BankTransactionQuery
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = bankTransactionQuerySchema.parse(query)
    const supabase = await createClient()

    let dbQuery = supabase
      .from('bank_transactions')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('bank_account_id', bankAccountId)

    if (parsed.search) {
      dbQuery = dbQuery.or(
        `description.ilike.%${parsed.search}%,reference.ilike.%${parsed.search}%`
      )
    }

    if (parsed.type) {
      dbQuery = dbQuery.eq('type', parsed.type)
    }

    if (parsed.is_reconciled !== undefined) {
      dbQuery = dbQuery.eq('is_reconciled', parsed.is_reconciled)
    }

    if (parsed.start_date) {
      dbQuery = dbQuery.gte('transaction_date', parsed.start_date)
    }

    if (parsed.end_date) {
      dbQuery = dbQuery.lte('transaction_date', parsed.end_date)
    }

    const offset = (parsed.page - 1) * parsed.limit

    const { data, error, count } = await dbQuery
      .order('transaction_date', { ascending: false })
      .range(offset, offset + parsed.limit - 1)

    if (error) throw new DatabaseError(error)

    return {
      data: data || [],
      total: count || 0,
      page: parsed.page,
      pageSize: parsed.limit,
      totalPages: Math.ceil((count || 0) / parsed.limit),
    }
  },

  async importTransactions(
    companyId: string,
    bankAccountId: string,
    transactions: BankTransactionInput[]
  ) {
    const parsed = importTransactionsSchema.parse(transactions)
    const supabase = await createClient()

    const rows = parsed.map((t) => ({
      company_id: companyId,
      bank_account_id: bankAccountId,
      transaction_date: t.transaction_date,
      description: t.description,
      amount: t.amount,
      currency: t.currency,
      type: t.type,
      reference: t.reference || null,
      category: t.category || null,
    }))

    const { data, error } = await supabase
      .from('bank_transactions')
      .insert(rows)
      .select()

    if (error) throw new DatabaseError(error)
    return data
  },

  async reconcileTransaction(
    companyId: string,
    transactionId: string,
    journalEntryId?: string
  ) {
    const parsed = reconcileTransactionSchema.parse({
      transaction_id: transactionId,
      journal_entry_id: journalEntryId,
    })
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('bank_transactions')
      .update({
        is_reconciled: true,
        reconciled_entry_id: parsed.journal_entry_id || null,
        reconciled_at: new Date().toISOString(),
      })
      .eq('id', parsed.transaction_id)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  // ========================================================================
  // RECONCILIATION SESSIONS
  // ========================================================================

  async createReconciliationSession(
    companyId: string,
    input: CreateReconciliationSessionInput
  ) {
    const parsed = createReconciliationSessionSchema.parse(input)
    const supabase = await createClient()

    // Calculate book balance: sum of all transactions for this account
    const { data: txns, error: txErr } = await supabase
      .from('bank_transactions')
      .select('amount, type')
      .eq('company_id', companyId)
      .eq('bank_account_id', parsed.bank_account_id)
      .gte('transaction_date', parsed.period_start)
      .lte('transaction_date', parsed.period_end)

    if (txErr) throw new DatabaseError(txErr)

    let bookBalance = 0
    for (const txn of txns || []) {
      if (txn.type === 'credit') bookBalance += Number(txn.amount)
      else bookBalance -= Number(txn.amount)
    }

    const difference = Number(parsed.statement_balance) - bookBalance

    const { data, error } = await supabase
      .from('reconciliation_sessions')
      .insert({
        company_id: companyId,
        bank_account_id: parsed.bank_account_id,
        period_start: parsed.period_start,
        period_end: parsed.period_end,
        statement_balance: parsed.statement_balance,
        book_balance: bookBalance,
        difference,
        status: difference === 0 ? 'reconciled' : 'discrepancy',
        notes: parsed.notes || null,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async listReconciliationSessions(
    companyId: string,
    bankAccountId: string
  ) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('reconciliation_sessions')
      .select('*')
      .eq('company_id', companyId)
      .eq('bank_account_id', bankAccountId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error)
    return data || []
  },

  async getReconciliationSummary(
    companyId: string,
    bankAccountId: string,
    sessionId: string
  ) {
    const supabase = await createClient()

    const { data: session, error: sErr } = await supabase
      .from('reconciliation_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('company_id', companyId)
      .eq('bank_account_id', bankAccountId)
      .single()

    if (sErr) throw new DatabaseError(sErr)

    // Get reconciled and unreconciled counts
    const { data: reconciled, error: rErr } = await supabase
      .from('bank_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('bank_account_id', bankAccountId)
      .eq('is_reconciled', true)
      .gte('transaction_date', session.period_start)
      .lte('transaction_date', session.period_end)

    if (rErr) throw new DatabaseError(rErr)

    const { data: unreconciled, error: uErr } = await supabase
      .from('bank_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('bank_account_id', bankAccountId)
      .eq('is_reconciled', false)
      .gte('transaction_date', session.period_start)
      .lte('transaction_date', session.period_end)

    if (uErr) throw new DatabaseError(uErr)

    return {
      session,
      reconciled_count: reconciled?.length ?? 0,
      unreconciled_count: unreconciled?.length ?? 0,
    }
  },
}
