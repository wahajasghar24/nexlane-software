import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { AppError } from '@/core/errors/app-error'
import type { PaginatedResult } from '@/core/types/common'

export const payrollService = {
  async listPayrollStructures(companyId: string): Promise<Record<string, unknown>[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('payroll_structures')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) throw new DatabaseError(error)
    return data ?? []
  },

  async createPayrollStructure(
    companyId: string,
    data: { name: string; description?: string; components?: unknown[] },
  ): Promise<Record<string, unknown>> {
    const supabase = await createClient()
    const { data: row, error } = await supabase
      .from('payroll_structures')
      .insert({ company_id: companyId, ...data })
      .select()
      .single()
    if (error) throw new DatabaseError(error)
    return row
  },

  async listPayslips(
    companyId: string,
    query: { period_start?: string; period_end?: string; employee_id?: string; status?: string; page?: number; limit?: number },
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const supabase = await createClient()
    const page = query.page ?? 1
    const limit = query.limit ?? 50
    let q = supabase.from('payslips').select('*, employees!payslips_employee_id_fkey(employee_code, profiles!employees_profile_id_fkey(full_name))', { count: 'exact' })
    q = q.eq('company_id', companyId)
    if (query.period_start) q = q.gte('period_start', query.period_start)
    if (query.period_end) q = q.lte('period_end', query.period_end)
    if (query.employee_id) q = q.eq('employee_id', query.employee_id)
    if (query.status) q = q.eq('status', query.status)
    const { data, count, error } = await q
      .order('period_start', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    if (error) throw new DatabaseError(error)
    const rows = (data ?? []).map((r: Record<string, unknown>) => {
      const emp = r.employees as Record<string, unknown> | null
      const profile = emp?.profiles as Record<string, unknown> | null
      return { ...r, employee_name: profile?.full_name ?? emp?.employee_code ?? '—' }
    })
    return { data: rows, total: count ?? 0, page, pageSize: limit, totalPages: Math.ceil((count ?? 0) / limit) }
  },

  async generatePayslips(
    companyId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<{ generated: number; skipped: number }> {
    const supabase = await createClient()

    // Fetch active employees
    const { data: employees, error: empErr } = await supabase
      .from('employees')
      .select('id, salary')
      .eq('company_id', companyId)
      .is('deleted_at', null)
    if (empErr) throw new DatabaseError(empErr)

    const existing = await supabase
      .from('payslips')
      .select('employee_id')
      .eq('company_id', companyId)
      .eq('period_start', periodStart)
      .eq('period_end', periodEnd)
    if (existing.error) throw new DatabaseError(existing.error)
    const existingIds = new Set((existing.data ?? []).map((e) => e.employee_id))

    const toInsert = (employees ?? [])
      .filter((e) => e.salary && !existingIds.has(e.id))
      .map((e) => ({
        company_id: companyId,
        employee_id: e.id,
        period_start: periodStart,
        period_end: periodEnd,
        base_salary: Number(e.salary) || 0,
        allowances: 0,
        deductions: 0,
        tax: 0,
        net_pay: Number(e.salary) || 0,
        status: 'draft' as const,
      }))

    if (toInsert.length === 0) return { generated: 0, skipped: employees?.length ?? 0 }

    const { error: insErr } = await supabase.from('payslips').insert(toInsert)
    if (insErr) throw new DatabaseError(insErr)

    return { generated: toInsert.length, skipped: existingIds.size }
  },

  async approvePayslip(companyId: string, payslipId: string): Promise<Record<string, unknown>> {
    const supabase = await createClient()
    const { data, error: findErr } = await supabase
      .from('payslips')
      .select('id, status')
      .eq('company_id', companyId)
      .eq('id', payslipId)
      .eq('status', 'draft')
      .maybeSingle()
    if (findErr) throw new DatabaseError(findErr)
    if (!data) throw new AppError('CONFLICT', 'Only draft payslips can be approved', 409)
    const { data: row, error: updErr } = await supabase
      .from('payslips')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', payslipId)
      .select()
      .single()
    if (updErr) throw new DatabaseError(updErr)
    return row
  },

  async getPayslipDetail(companyId: string, payslipId: string): Promise<Record<string, unknown>> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('payslips')
      .select('*, employees!payslips_employee_id_fkey(employee_code, designation, department, profiles!employees_profile_id_fkey(full_name, email))')
      .eq('company_id', companyId)
      .eq('id', payslipId)
      .maybeSingle()
    if (error) throw new DatabaseError(error)
    if (!data) throw new AppError('NOT_FOUND', 'Payslip not found', 404)
    return data
  },

  async getPayslipSummary(
    companyId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<Record<string, unknown>> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('payslips')
      .select('base_salary, allowances, deductions, tax, net_pay, currency')
      .eq('company_id', companyId)
      .eq('period_start', periodStart)
      .eq('period_end', periodEnd)
    if (error) throw new DatabaseError(error)
    const rows = data ?? []
    return {
      total_employees: rows.length,
      total_base_salary: rows.reduce((s, r) => s + Number(r.base_salary), 0),
      total_allowances: rows.reduce((s, r) => s + Number(r.allowances), 0),
      total_deductions: rows.reduce((s, r) => s + Number(r.deductions), 0),
      total_tax: rows.reduce((s, r) => s + Number(r.tax), 0),
      total_net_pay: rows.reduce((s, r) => s + Number(r.net_pay), 0),
      currency: rows[0]?.currency ?? 'AED',
    }
  },
}
