import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import type { PaginatedResult } from '@/core/types/common'
import {
  createAccountSchema,
  updateAccountSchema,
  accountQuerySchema,
  createJournalEntrySchema,
  journalEntryQuerySchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  invoiceQuerySchema,
  createPaymentSchema,
  paymentQuerySchema,
} from '@/features/accounting/schemas'
import type {
  CreateAccountInput,
  UpdateAccountInput,
  AccountQuery,
  CreateJournalEntryInput,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  CreatePaymentInput,
} from '@/features/accounting/schemas'

function padNum(n: number, width: number): string {
  return String(n).padStart(width, '0')
}

export const accountingService = {
  // ========================================================================
  // CHART OF ACCOUNTS
  // ========================================================================

  async listAccounts(
    companyId: string,
    query: AccountQuery
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = accountQuerySchema.parse(query)
    const supabase = await createClient()

    let dbQuery = supabase
      .from('chart_of_accounts')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)

    if (parsed.search) {
      dbQuery = dbQuery.or(
        `code.ilike.%${parsed.search}%,name.ilike.%${parsed.search}%`
      )
    }

    if (parsed.type) {
      dbQuery = dbQuery.eq('type', parsed.type)
    }

    const offset = (parsed.page - 1) * parsed.limit

    const { data, error, count } = await dbQuery
      .order('code', { ascending: true })
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

  async getAccount(companyId: string, accountId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('company_id', companyId)
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async createAccount(companyId: string, input: CreateAccountInput, actorId: string) {
    const parsed = createAccountSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('chart_of_accounts')
      .insert({
        company_id: companyId,
        code: parsed.code,
        name: parsed.name,
        type: parsed.type,
        category: parsed.category || null,
        parent_id: parsed.parent_id || null,
        description: parsed.description || null,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: 'account.created',
      entityType: 'chart_of_account',
      entityId: data.id,
      payload: { account: data, actorId },
    })

    return data
  },

  async updateAccount(companyId: string, accountId: string, input: UpdateAccountInput) {
    const parsed = updateAccountSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('chart_of_accounts')
      .update(parsed)
      .eq('id', accountId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async deleteAccount(companyId: string, accountId: string, actorId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('chart_of_accounts')
      .update({ is_active: false })
      .eq('id', accountId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)
  },

  // ========================================================================
  // JOURNAL ENTRIES
  // ========================================================================

  async generateEntryNumber(companyId: string): Promise<string> {
    const supabase = await createClient()
    const now = new Date()
    const prefix = `JE-${now.getFullYear()}${padNum(now.getMonth() + 1, 2)}-`

    const { data, error } = await supabase
      .from('journal_entries')
      .select('entry_number')
      .eq('company_id', companyId)
      .ilike('entry_number', `${prefix}%`)
      .order('entry_number', { ascending: false })
      .limit(1)

    if (error) throw new DatabaseError(error)

    const lastSeq = data?.[0]?.entry_number
    const nextSeq = lastSeq
      ? parseInt(lastSeq.slice(prefix.length), 10) + 1
      : 1

    return `${prefix}${padNum(nextSeq, 5)}`
  },

  async listJournalEntries(
    companyId: string,
    query: { page?: number; limit?: number; status?: string; search?: string }
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = journalEntryQuerySchema.parse(query)
    const supabase = await createClient()

    let dbQuery = supabase
      .from('journal_entries')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .order('entry_date', { ascending: false })

    if (parsed.status) {
      dbQuery = dbQuery.eq('status', parsed.status)
    }

    if (parsed.search) {
      dbQuery = dbQuery.or(
        `description.ilike.%${parsed.search}%,entry_number.ilike.%${parsed.search}%`
      )
    }

    const offset = (parsed.page - 1) * parsed.limit

    const { data, error, count } = await dbQuery
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

  async getJournalEntry(companyId: string, entryId: string) {
    const supabase = await createClient()

    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', entryId)
      .eq('company_id', companyId)
      .single()

    if (entryError) throw new DatabaseError(entryError)

    const { data: lines, error: linesError } = await supabase
      .from('journal_entry_lines')
      .select('*, account:account_id!inner(code, name, type)')
      .eq('journal_entry_id', entryId)

    if (linesError) throw new DatabaseError(linesError)

    return {
      ...entry,
      lines: lines || [],
    }
  },

  async createJournalEntry(
    companyId: string,
    input: CreateJournalEntryInput,
    actorId: string
  ) {
    const parsed = createJournalEntrySchema.parse(input)
    const supabase = await createClient()

    // Validate debit = credit
    const totalDebit = parsed.lines.reduce((sum, l) => sum + l.debit, 0)
    const totalCredit = parsed.lines.reduce((sum, l) => sum + l.credit, 0)

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new DatabaseError({
        message: 'Debit and credit totals must be equal',
        code: 'UNBALANCED_ENTRY',
        details: `Debit: ${totalDebit}, Credit: ${totalCredit}`,
      })
    }

    const entryNumber = await this.generateEntryNumber(companyId)

    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .insert({
        company_id: companyId,
        period_id: parsed.period_id || null,
        entry_number: entryNumber,
        entry_date: parsed.entry_date || new Date().toISOString().slice(0, 10),
        description: parsed.description,
        reference: parsed.reference || null,
        created_by: actorId,
      })
      .select()
      .single()

    if (entryError) throw new DatabaseError(entryError)

    const lineInserts = parsed.lines.map((line) => ({
      journal_entry_id: entry.id,
      account_id: line.account_id,
      description: line.description || null,
      debit: line.debit,
      credit: line.credit,
    }))

    const { error: linesError } = await supabase
      .from('journal_entry_lines')
      .insert(lineInserts)

    if (linesError) {
      // Cleanup: delete the header if line insert fails
      await supabase.from('journal_entries').delete().eq('id', entry.id)
      throw new DatabaseError(linesError)
    }

    await eventBus.emit({
      companyId,
      eventType: 'journal_entry.created',
      entityType: 'journal_entry',
      entityId: entry.id,
      payload: { journalEntry: entry, actorId },
    })

    return this.getJournalEntry(companyId, entry.id)
  },

  async postJournalEntry(companyId: string, entryId: string, actorId: string) {
    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('journal_entries')
      .select('status')
      .eq('id', entryId)
      .eq('company_id', companyId)
      .single()

    if (fetchError) throw new DatabaseError(fetchError)

    if (existing.status !== 'draft') {
      throw new DatabaseError({
        message: `Cannot post entry with status "${existing.status}"`,
        code: 'INVALID_STATUS',
        details: `Expected "draft", got "${existing.status}"`,
      })
    }

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        status: 'posted',
        posted_at: now,
        posted_by: actorId,
      })
      .eq('id', entryId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: 'journal_entry.posted',
      entityType: 'journal_entry',
      entityId: entryId,
      payload: { actorId },
    })

    return data
  },

  async deleteJournalEntry(companyId: string, entryId: string, actorId: string) {
    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('journal_entries')
      .select('status')
      .eq('id', entryId)
      .eq('company_id', companyId)
      .single()

    if (fetchError) throw new DatabaseError(fetchError)

    if (existing.status === 'posted') {
      throw new DatabaseError({
        message: 'Cannot delete a posted journal entry. Void it instead.',
        code: 'ALREADY_POSTED',
        details: `Entry ${entryId} is posted`,
      })
    }

    const now = new Date().toISOString()

    const { error } = await supabase
      .from('journal_entries')
      .update({
        status: 'voided',
        voided_at: now,
        voided_by: actorId,
      })
      .eq('id', entryId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)
  },

  // ========================================================================
  // INVOICES
  // ========================================================================

  async generateInvoiceNumber(companyId: string): Promise<string> {
    const supabase = await createClient()
    const now = new Date()
    const prefix = `INV-${now.getFullYear()}${padNum(now.getMonth() + 1, 2)}-`

    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('company_id', companyId)
      .ilike('invoice_number', `${prefix}%`)
      .order('invoice_number', { ascending: false })
      .limit(1)

    if (error) throw new DatabaseError(error)

    const lastSeq = data?.[0]?.invoice_number
    const nextSeq = lastSeq
      ? parseInt(lastSeq.slice(prefix.length), 10) + 1
      : 1

    return `${prefix}${padNum(nextSeq, 5)}`
  },

  async listInvoices(
    companyId: string,
    query: { page?: number; limit?: number; status?: string; search?: string }
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = invoiceQuerySchema.parse(query)
    const supabase = await createClient()

    let dbQuery = supabase
      .from('invoices')
      .select('*, customer:customer_id!inner(name)', { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (parsed.status) {
      dbQuery = dbQuery.eq('status', parsed.status)
    }

    if (parsed.search) {
      dbQuery = dbQuery.or(
        `invoice_number.ilike.%${parsed.search}%,notes.ilike.%${parsed.search}%`
      )
    }

    const offset = (parsed.page - 1) * parsed.limit

    const { data, error, count } = await dbQuery
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

  async getInvoice(companyId: string, invoiceId: string) {
    const supabase = await createClient()

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('company_id', companyId)
      .single()

    if (invoiceError) throw new DatabaseError(invoiceError)

    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('sort_order')

    if (itemsError) throw new DatabaseError(itemsError)

    return {
      ...invoice,
      items: items || [],
    }
  },

  async createInvoice(
    companyId: string,
    input: CreateInvoiceInput,
    actorId: string
  ) {
    const parsed = createInvoiceSchema.parse(input)
    const supabase = await createClient()

    const invoiceNumber = await this.generateInvoiceNumber(companyId)

    // Calculate line totals
    let subtotal = 0
    let taxAmount = 0

    const itemRows = parsed.items.map((item, idx) => {
      const amount = item.quantity * item.unit_price
      const itemTax = amount * (item.tax_rate / 100)
      subtotal += amount
      taxAmount += itemTax
      return {
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount,
        tax_rate: item.tax_rate,
        tax_amount: itemTax,
        sort_order: idx,
      }
    })

    const total = subtotal + taxAmount

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        company_id: companyId,
        invoice_number: invoiceNumber,
        customer_id: parsed.customer_id,
        contact_id: parsed.contact_id || null,
        invoice_date: parsed.invoice_date || new Date().toISOString().slice(0, 10),
        due_date: parsed.due_date,
        subtotal,
        tax_amount: taxAmount,
        discount: 0,
        total,
        notes: parsed.notes || null,
        terms: parsed.terms || null,
        created_by: actorId,
      })
      .select()
      .single()

    if (invoiceError) throw new DatabaseError(invoiceError)

    const itemInserts = itemRows.map((item) => ({
      ...item,
      invoice_id: invoice.id,
    }))

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemInserts)

    if (itemsError) {
      await supabase.from('invoices').delete().eq('id', invoice.id)
      throw new DatabaseError(itemsError)
    }

    await eventBus.emit({
      companyId,
      eventType: 'invoice.created',
      entityType: 'invoice',
      entityId: invoice.id,
      payload: { invoice, actorId },
    })

    return this.getInvoice(companyId, invoice.id)
  },

  async updateInvoice(
    companyId: string,
    invoiceId: string,
    input: UpdateInvoiceInput
  ) {
    const parsed = updateInvoiceSchema.parse(input)
    const supabase = await createClient()

    const updateData: Record<string, unknown> = {}
    if (parsed.status !== undefined) updateData.status = parsed.status
    if (parsed.notes !== undefined) updateData.notes = parsed.notes
    if (parsed.terms !== undefined) updateData.terms = parsed.terms

    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async deleteInvoice(companyId: string, invoiceId: string) {
    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', invoiceId)
      .eq('company_id', companyId)
      .single()

    if (fetchError) throw new DatabaseError(fetchError)

    if (existing.status === 'paid') {
      throw new DatabaseError({
        message: 'Cannot cancel a paid invoice',
        code: 'ALREADY_PAID',
        details: `Invoice ${invoiceId} is paid`,
      })
    }

    const { error } = await supabase
      .from('invoices')
      .update({ status: 'cancelled' })
      .eq('id', invoiceId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)
  },

  // ========================================================================
  // PAYMENTS
  // ========================================================================

  async listPayments(
    companyId: string,
    query: { page?: number; limit?: number }
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = paymentQuerySchema.parse(query)
    const supabase = await createClient()

    const offset = (parsed.page - 1) * parsed.limit

    const { data, error, count } = await supabase
      .from('payments')
      .select('*, invoice:invoice_id!inner(invoice_number)', { count: 'exact' })
      .eq('company_id', companyId)
      .order('payment_date', { ascending: false })
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

  async getPayment(companyId: string, paymentId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('company_id', companyId)
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async createPayment(companyId: string, input: CreatePaymentInput, actorId: string) {
    const parsed = createPaymentSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('payments')
      .insert({
        company_id: companyId,
        invoice_id: parsed.invoice_id || null,
        customer_id: parsed.customer_id || null,
        amount: parsed.amount,
        payment_date: parsed.payment_date || new Date().toISOString().slice(0, 10),
        method: parsed.method,
        reference: parsed.reference || null,
        notes: parsed.notes || null,
        created_by: actorId,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    // If payment is linked to an invoice, update invoice status to 'paid'
    if (parsed.invoice_id) {
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', parsed.invoice_id)
        .eq('company_id', companyId)

      if (invoiceError) throw new DatabaseError(invoiceError)
    }

    await eventBus.emit({
      companyId,
      eventType: 'payment.created',
      entityType: 'payment',
      entityId: data.id,
      payload: { payment: data, actorId },
    })

    return data
  },

  // ========================================================================
  // DASHBOARD
  // ========================================================================

  async getStats(companyId: string) {
    const supabase = await createClient()

    const now = new Date()
    const firstOfMonth = now.toISOString().slice(0, 7) // YYYY-MM

    const [
      { data: arData, error: arError },
      { data: revenueData, error: revenueError },
      { data: expenseData, error: expenseError },
      { data: recentTransactions, error: recentError },
    ] = await Promise.all([
      // Total accounts receivable (sum of unpaid invoices)
      supabase
        .from('invoices')
        .select('total')
        .eq('company_id', companyId)
        .in('status', ['draft', 'sent', 'overdue']),
      // Total revenue this month (sum of credit amounts against revenue-type accounts)
      supabase
        .from('journal_entry_lines')
        .select('credit, journal_entries!inner(company_id, entry_date, status), chart_of_accounts!inner(type)')
        .eq('journal_entries.company_id', companyId)
        .gte('journal_entries.entry_date', `${firstOfMonth}-01`)
        .eq('journal_entries.status', 'posted')
        .eq('chart_of_accounts.type', 'revenue'),
      // Total expenses this month (sum of debit amounts against expense-type accounts)
      supabase
        .from('journal_entry_lines')
        .select('debit, journal_entries!inner(company_id, entry_date, status), chart_of_accounts!inner(type)')
        .eq('journal_entries.company_id', companyId)
        .gte('journal_entries.entry_date', `${firstOfMonth}-01`)
        .eq('journal_entries.status', 'posted')
        .eq('chart_of_accounts.type', 'expense'),
      // Recent transactions (last 10 journal entries)
      supabase
        .from('journal_entries')
        .select('id, entry_number, entry_date, description, status, created_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    if (arError) throw new DatabaseError(arError)
    if (revenueError) throw new DatabaseError(revenueError)
    if (expenseError) throw new DatabaseError(expenseError)
    if (recentError) throw new DatabaseError(recentError)

    const totalAR = (arData || []).reduce((sum, inv) => sum + Number(inv.total), 0)
    const totalRevenue = (revenueData || []).reduce((sum, l) => sum + Number(l.credit), 0)
    const totalExpenses = (expenseData || []).reduce((sum, l) => sum + Number(l.debit), 0)

    return {
      totalAccountsReceivable: totalAR,
      totalRevenueThisMonth: totalRevenue,
      totalExpensesThisMonth: totalExpenses,
      recentTransactions: recentTransactions || [],
    }
  },

  // ========================================================================
  // REPORTS
  // ========================================================================

  async getTrialBalance(companyId: string, asOfDate?: string) {
    const supabase = await createClient()

    let dbQuery = supabase
      .from('journal_entry_lines')
      .select(`
        debit, credit,
        journal_entry:journal_entry_id!inner(company_id, status, entry_date),
        account:account_id!inner(code, name, type)
      `)
      .eq('journal_entry.company_id', companyId)
      .eq('journal_entry.status', 'posted')

    if (asOfDate) {
      dbQuery = dbQuery.lte('journal_entry.entry_date', asOfDate)
    }

    const { data, error } = await dbQuery

    if (error) throw new DatabaseError(error)

    const accountMap = new Map<string, {
      code: string; name: string; type: string; totalDebit: number; totalCredit: number
    }>()

    for (const row of data || []) {
      const acc = row.account as any
      if (!acc) continue
      const key = acc.code
      if (!accountMap.has(key)) {
        accountMap.set(key, { code: acc.code, name: acc.name, type: acc.type, totalDebit: 0, totalCredit: 0 })
      }
      const entry = accountMap.get(key)!
      entry.totalDebit += Number(row.debit) || 0
      entry.totalCredit += Number(row.credit) || 0
    }

    return Array.from(accountMap.values()).sort((a, b) => a.code.localeCompare(b.code))
  },

  async getGeneralLedger(
    companyId: string,
    query: { account_id?: string; from_date?: string; to_date?: string; page?: number; limit?: number }
  ) {
    const supabase = await createClient()
    const page = query.page || 1
    const limit = query.limit || 50
    const offset = (page - 1) * limit

    let dbQuery = supabase
      .from('journal_entry_lines')
      .select(`
        id, debit, credit, description,
        journal_entry:journal_entry_id!inner(id, entry_number, entry_date, description, reference, status),
        account:account_id!inner(code, name, type)
      `, { count: 'exact' })
      .eq('journal_entry.company_id', companyId)
      .eq('journal_entry.status', 'posted')

    if (query.account_id) {
      dbQuery = dbQuery.eq('account_id', query.account_id)
    }
    if (query.from_date) {
      dbQuery = dbQuery.gte('journal_entry.entry_date', query.from_date)
    }
    if (query.to_date) {
      dbQuery = dbQuery.lte('journal_entry.entry_date', query.to_date)
    }

    const { data, error, count } = await dbQuery
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) throw new DatabaseError(error)

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize: limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  },

  async getProfitAndLoss(companyId: string, fromDate: string, toDate: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('journal_entry_lines')
      .select(`
        debit, credit,
        journal_entry:journal_entry_id!inner(company_id, status, entry_date),
        account:account_id!inner(code, name, type)
      `)
      .eq('journal_entry.company_id', companyId)
      .eq('journal_entry.status', 'posted')
      .gte('journal_entry.entry_date', fromDate)
      .lte('journal_entry.entry_date', toDate)

    if (error) throw new DatabaseError(error)

    let totalRevenue = 0
    let totalExpenses = 0
    const revenueAccounts: { code: string; name: string; balance: number }[] = []
    const expenseAccounts: { code: string; name: string; balance: number }[] = []

    const revenueMap = new Map<string, { code: string; name: string; balance: number }>()
    const expenseMap = new Map<string, { code: string; name: string; balance: number }>()

    for (const row of data || []) {
      const acc = row.account as any
      if (!acc) continue
      const debit = Number(row.debit) || 0
      const credit = Number(row.credit) || 0

      if (acc.type === 'revenue') {
        const balance = credit - debit
        totalRevenue += balance
        const existing = revenueMap.get(acc.code) || { code: acc.code, name: acc.name, balance: 0 }
        existing.balance += balance
        revenueMap.set(acc.code, existing)
      } else if (acc.type === 'expense') {
        const balance = debit - credit
        totalExpenses += balance
        const existing = expenseMap.get(acc.code) || { code: acc.code, name: acc.name, balance: 0 }
        existing.balance += balance
        expenseMap.set(acc.code, existing)
      }
    }

    return {
      revenueAccounts: Array.from(revenueMap.values()).sort((a, b) => a.code.localeCompare(b.code)),
      expenseAccounts: Array.from(expenseMap.values()).sort((a, b) => a.code.localeCompare(b.code)),
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      fromDate,
      toDate,
    }
  },

  async getBalanceSheet(companyId: string, asOfDate: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('journal_entry_lines')
      .select(`
        debit, credit,
        journal_entry:journal_entry_id!inner(company_id, status, entry_date),
        account:account_id!inner(code, name, type)
      `)
      .eq('journal_entry.company_id', companyId)
      .eq('journal_entry.status', 'posted')
      .lte('journal_entry.entry_date', asOfDate)

    if (error) throw new DatabaseError(error)

    let totalAssets = 0
    let totalLiabilities = 0
    let totalEquity = 0
    let totalRevenue = 0
    let totalExpenses = 0
    const assetAccounts: { code: string; name: string; balance: number }[] = []
    const liabilityAccounts: { code: string; name: string; balance: number }[] = []
    const equityAccounts: { code: string; name: string; balance: number }[] = []

    const assetMap = new Map<string, { code: string; name: string; balance: number }>()
    const liabilityMap = new Map<string, { code: string; name: string; balance: number }>()
    const equityMap = new Map<string, { code: string; name: string; balance: number }>()

    for (const row of data || []) {
      const acc = row.account as any
      if (!acc) continue
      const debit = Number(row.debit) || 0
      const credit = Number(row.credit) || 0

      if (acc.type === 'asset') {
        const balance = debit - credit
        totalAssets += balance
        const existing = assetMap.get(acc.code) || { code: acc.code, name: acc.name, balance: 0 }
        existing.balance += balance
        assetMap.set(acc.code, existing)
      } else if (acc.type === 'liability') {
        const balance = credit - debit
        totalLiabilities += balance
        const existing = liabilityMap.get(acc.code) || { code: acc.code, name: acc.name, balance: 0 }
        existing.balance += balance
        liabilityMap.set(acc.code, existing)
      } else if (acc.type === 'equity') {
        const balance = credit - debit
        totalEquity += balance
        const existing = equityMap.get(acc.code) || { code: acc.code, name: acc.name, balance: 0 }
        existing.balance += balance
        equityMap.set(acc.code, existing)
      } else if (acc.type === 'revenue') {
        const balance = credit - debit
        totalRevenue += balance
      } else if (acc.type === 'expense') {
        const balance = debit - credit
        totalExpenses += balance
      }
    }

    const netIncome = totalRevenue - totalExpenses

    // Add net income as retained earnings
    if (netIncome !== 0) {
      equityAccounts.push({
        code: '3100',
        name: 'Retained Earnings (Net Income)',
        balance: netIncome,
      })
    }

    return {
      assetAccounts,
      liabilityAccounts,
      equityAccounts,
      totalAssets,
      totalLiabilities,
      totalEquity: totalEquity + netIncome,
      netIncome,
      asOfDate,
    }
  },

  async getCashFlow(companyId: string, fromDate: string, toDate: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('journal_entry_lines')
      .select(`
        debit, credit,
        journal_entry:journal_entry_id!inner(entry_date, description, status),
        account:account_id!inner(code, name, type)
      `)
      .eq('journal_entry.company_id', companyId)
      .eq('journal_entry.status', 'posted')
      .gte('journal_entry.entry_date', fromDate)
      .lte('journal_entry.entry_date', toDate)
      .in('account.type', ['asset', 'revenue', 'expense', 'liability', 'equity'])
      .order('created_at', { ascending: true })

    if (error) throw new DatabaseError(error)

    let operatingCashFlow = 0
    const investingCashFlow = 0
    const financingCashFlow = 0
    const beginningCash = 0

    const transactions: any[] = []

    for (const row of data || []) {
      const acc = row.account as any
      const je = row.journal_entry as any
      if (!acc || !je) continue

      const debit = Number(row.debit) || 0
      const credit = Number(row.credit) || 0
      const isCashAccount = /cash|bank/i.test(acc.name)

      // Simplified cash flow categorization
      if (isCashAccount) {
        const netChange = debit - credit
        if (acc.type === 'asset') {
          operatingCashFlow += netChange // simplified
        }
        transactions.push({
          date: je.entry_date,
          description: je.description,
          accountName: acc.name,
          amount: netChange,
        })
      }
    }

    return {
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow: operatingCashFlow + investingCashFlow + financingCashFlow,
      beginningCash,
      endingCash: beginningCash + operatingCashFlow + investingCashFlow + financingCashFlow,
      transactions: transactions.slice(0, 50),
      fromDate,
      toDate,
    }
  },
}
