import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import type { PaginatedResult } from '@/core/types/common'

type TaxReturnRow = Record<string, unknown>

export const taxService = {
  // ========================================================================
  // CALCULATE VAT
  // ========================================================================

  async calculateVAT(
    companyId: string,
    periodStart: string,
    periodEnd: string,
    taxRate?: number
  ) {
    const supabase = await createClient()
    const rate = taxRate ?? 5

    // Output tax: sum tax_amount from sales invoices (not cancelled)
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('tax_amount, subtotal, total')
      .eq('company_id', companyId)
      .not('status', 'eq', 'cancelled')
      .gte('invoice_date', periodStart)
      .lte('invoice_date', periodEnd)

    if (invoiceError) throw new DatabaseError(invoiceError)

    // Input tax: sum tax_amount from purchase orders (not cancelled)
    const { data: poData, error: poError } = await supabase
      .from('purchase_orders')
      .select('tax_amount, subtotal, total')
      .eq('company_id', companyId)
      .not('status', 'eq', 'cancelled')
      .gte('order_date', periodStart)
      .lte('order_date', periodEnd)

    if (poError) throw new DatabaseError(poError)

    const totalSales = (invoiceData || []).reduce((s, r) => s + Number(r.subtotal || 0), 0)
    const outputTax = (invoiceData || []).reduce((s, r) => s + Number(r.tax_amount || 0), 0)
    const totalPurchases = (poData || []).reduce((s, r) => s + Number(r.subtotal || 0), 0)
    const inputTax = (poData || []).reduce((s, r) => s + Number(r.tax_amount || 0), 0)
    const netTax = outputTax - inputTax

    return {
      period_start: periodStart,
      period_end: periodEnd,
      tax_rate: rate,
      total_sales: totalSales,
      total_purchases: totalPurchases,
      output_tax: outputTax,
      input_tax: inputTax,
      net_tax: netTax,
      currency: 'AED',
    }
  },

  // ========================================================================
  // LIST TAX RETURNS
  // ========================================================================

  async listTaxReturns(
    companyId: string,
    query: { page?: number; limit?: number; status?: string; year?: string }
  ): Promise<PaginatedResult<TaxReturnRow>> {
    const supabase = await createClient()
    const page = query.page || 1
    const limit = query.limit || 20
    const offset = (page - 1) * limit

    let dbQuery = supabase
      .from('tax_returns')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .order('period_start', { ascending: false })

    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status)
    }
    if (query.year) {
      dbQuery = dbQuery
        .gte('period_start', `${query.year}-01-01`)
        .lte('period_end', `${query.year}-12-31`)
    }

    const { data, error, count } = await dbQuery
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

  // ========================================================================
  // CREATE TAX RETURN
  // ========================================================================

  async createTaxReturn(
    companyId: string,
    data: {
      period_start: string
      period_end: string
      output_tax: number
      input_tax: number
      net_tax: number
      total_sales: number
      total_purchases: number
      tax_rate?: number
      currency?: string
      notes?: string
    }
  ) {
    const supabase = await createClient()

    const { data: row, error } = await supabase
      .from('tax_returns')
      .insert({
        company_id: companyId,
        period_start: data.period_start,
        period_end: data.period_end,
        output_tax: data.output_tax,
        input_tax: data.input_tax,
        net_tax: data.net_tax,
        total_sales: data.total_sales,
        total_purchases: data.total_purchases,
        tax_rate: data.tax_rate ?? 5,
        currency: data.currency ?? 'AED',
        notes: data.notes ?? null,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return row
  },

  // ========================================================================
  // GET TAX RETURN BY ID
  // ========================================================================

  async getTaxReturn(companyId: string, id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('tax_returns')
      .select('*')
      .eq('id', id)
      .eq('company_id', companyId)
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  // ========================================================================
  // UPDATE TAX RETURN STATUS
  // ========================================================================

  async updateTaxReturnStatus(
    companyId: string,
    id: string,
    status: 'draft' | 'filed' | 'paid'
  ) {
    const supabase = await createClient()

    const update: Record<string, unknown> = { status }
    if (status === 'filed') update.filed_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('tax_returns')
      .update(update)
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  // ========================================================================
  // TAX SUMMARY — monthly breakdown for a year
  // ========================================================================

  async getTaxSummary(companyId: string, year: number) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('tax_returns')
      .select('period_start, period_end, output_tax, input_tax, net_tax, total_sales, total_purchases, status')
      .eq('company_id', companyId)
      .gte('period_start', `${year}-01-01`)
      .lte('period_end', `${year}-12-31`)
      .order('period_start', { ascending: true })

    if (error) throw new DatabaseError(error)

    // Group by month
    const months: Record<string, typeof data> = {}
    for (const row of data || []) {
      const month = (row.period_start as string).slice(0, 7) // YYYY-MM
      if (!months[month]) months[month] = []
      months[month].push(row)
    }

    const summary = Object.entries(months).map(([month, returns]) => {
      const totals = returns.reduce(
        (acc, r) => ({
          output_tax: acc.output_tax + Number(r.output_tax),
          input_tax: acc.input_tax + Number(r.input_tax),
          net_tax: acc.net_tax + Number(r.net_tax),
          total_sales: acc.total_sales + Number(r.total_sales),
          total_purchases: acc.total_purchases + Number(r.total_purchases),
        }),
        { output_tax: 0, input_tax: 0, net_tax: 0, total_sales: 0, total_purchases: 0 }
      )
      return { month, returns, ...totals }
    })

    return { year, months: summary }
  },
}
