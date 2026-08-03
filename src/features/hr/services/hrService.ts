import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { AppError } from '@/core/errors/app-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import type { PaginatedResult } from '@/core/types/common'

// Resolve the current user's employee row for a company
async function resolveEmployeeId(companyId: string, actorId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('id')
    .eq('company_id', companyId)
    .eq('profile_id', actorId)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw new DatabaseError(error)
  return data?.id ?? null
}

export interface EmployeeBrief { id: string; employee_code: string; full_name: string }

async function fetchEmployeeBriefs(companyId: string): Promise<Map<string, EmployeeBrief>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('id, employee_code, profiles!employees_profile_id_fkey(full_name)')
    .eq('company_id', companyId)
    .is('deleted_at', null)
  if (error) throw new DatabaseError(error)
  const map = new Map<string, EmployeeBrief>()
  for (const e of data ?? []) {
    const profile = Array.isArray(e.profiles) ? e.profiles[0] : e.profiles
    map.set(e.id, { id: e.id, employee_code: e.employee_code, full_name: profile?.full_name ?? '' })
  }
  return map
}

export const hrService = {
  async listAttendance(
    companyId: string,
    query: { work_date?: string; employee_id?: string; page: number; limit: number },
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const supabase = await createClient()
    let q = supabase.from('attendance').select('*', { count: 'exact' })
    q = q.eq('company_id', companyId)
    if (query.work_date) q = q.eq('work_date', query.work_date)
    if (query.employee_id) q = q.eq('employee_id', query.employee_id)
    const { data, count, error } = await q
      .order('work_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range((query.page - 1) * query.limit, query.page * query.limit - 1)
    if (error) throw new DatabaseError(error)
    const briefs = await fetchEmployeeBriefs(companyId)
    const rows = (data ?? []).map((r) => ({ ...r, employee: briefs.get(r.employee_id) ?? null }))
    return { data: rows, total: count ?? 0, page: query.page, pageSize: query.limit, totalPages: Math.ceil((count ?? 0) / query.limit) }
  },

  async clockIn(companyId: string, actorId: string): Promise<Record<string, unknown>> {
    const supabase = await createClient()
    const employeeId = await resolveEmployeeId(companyId, actorId)
    if (!employeeId) throw new AppError('VALIDATION', 'No employee profile linked to your user', 400)
    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('attendance')
      .select('id, check_in')
      .eq('company_id', companyId)
      .eq('employee_id', employeeId)
      .eq('work_date', today)
      .maybeSingle()
    if (error) throw new DatabaseError(error)
    if (data?.check_in) throw new AppError('CONFLICT', 'Already clocked in today', 409)
    const { data: row, error: insErr } = await supabase
      .from('attendance')
      .insert({ company_id: companyId, employee_id: employeeId, work_date: today, check_in: new Date().toISOString(), created_by: actorId })
      .select()
      .single()
    if (insErr) throw new DatabaseError(insErr)
    await eventBus.emit({
      companyId,
      eventType: EventTypes.ATTENDANCE_CLOCKED_IN,
      entityType: 'attendance',
      entityId: row.id,
      payload: { work_date: row.work_date },
    })
    return row
  },

  async clockOut(companyId: string, actorId: string): Promise<Record<string, unknown>> {
    const supabase = await createClient()
    const employeeId = await resolveEmployeeId(companyId, actorId)
    if (!employeeId) throw new AppError('VALIDATION', 'No employee profile linked to this user', 400)
    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('attendance')
      .select('id, check_in, check_out')
      .eq('company_id', companyId)
      .eq('employee_id', employeeId)
      .eq('work_date', today)
      .maybeSingle()
    if (error) throw new DatabaseError(error)
    if (!data?.check_in) throw new AppError('CONFLICT', 'Clock in first', 409)
    if (data.check_out) throw new AppError('CONFLICT', 'Already clocked out today', 409)
    const { data: row, error: updErr } = await supabase
      .from('attendance')
      .update({ check_out: new Date().toISOString() })
      .eq('id', data.id)
      .select()
      .single()
    if (updErr) throw new DatabaseError(updErr)
    await eventBus.emit({
      companyId,
      eventType: EventTypes.ATTENDANCE_CLOCKED_OUT,
      entityType: 'attendance',
      entityId: row.id,
      payload: { work_date: row.work_date },
    })
    return row
  },

  async listTimeOff(
    companyId: string,
    query: { status?: string; employee_id?: string; page: number; limit: number },
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const supabase = await createClient()
    let q = supabase.from('time_off_requests').select('*', { count: 'exact' })
    q = q.eq('company_id', companyId)
    if (query.status) q = q.eq('status', query.status)
    if (query.employee_id) q = q.eq('employee_id', query.employee_id)
    const { data, count, error } = await q
      .order('created_at', { ascending: false })
      .range((query.page - 1) * query.limit, query.page * query.limit - 1)
    if (error) throw new DatabaseError(error)
    const briefs = await fetchEmployeeBriefs(companyId)
    const rows = (data ?? []).map((r) => ({ ...r, employee: briefs.get(r.employee_id) ?? null }))
    return { data: rows, total: count ?? 0, page: query.page, pageSize: query.limit, totalPages: Math.ceil((count ?? 0) / query.limit) }
  },

  async requestTimeOff(
    companyId: string,
    input: { type: 'annual' | 'sick' | 'unpaid'; start_date: string; end_date: string; reason?: string | null },
    actorId: string,
  ): Promise<Record<string, unknown>> {
    const supabase = await createClient()
    const employeeId = await resolveEmployeeId(companyId, actorId)
    if (!employeeId) throw new AppError('VALIDATION', 'No employee profile linked to this user', 400)
    if (input.end_date < input.start_date) throw new AppError('VALIDATION', 'End date must be after start date', 400)
    const start = new Date(input.start_date).getTime()
    const end = new Date(input.end_date).getTime()
    const days = Math.round((end - start) / 86400000) + 1
    const { data, error } = await supabase
      .from('time_off_requests')
      .insert({
        company_id: companyId,
        employee_id: employeeId,
        type: input.type,
        start_date: input.start_date,
        end_date: input.end_date,
        days,
        reason: input.reason ?? null,
        created_by: actorId,
      })
      .select()
      .single()
    if (error) throw new DatabaseError(error)
    await eventBus.emit({
      companyId,
      eventType: EventTypes.TIMEOFF_REQUESTED,
      entityType: 'time_off_request',
      entityId: data.id,
      payload: { type: data.type, start_date: data.start_date, end_date: data.end_date, days: data.days },
    })
    return data
  },

  async decideTimeOff(
    companyId: string,
    id: string,
    decision: 'approved' | 'rejected',
    actorId: string,
  ): Promise<Record<string, unknown>> {
    const supabase = await createClient()
    const { data: existing, error } = await supabase
      .from('time_off_requests')
      .select('id, status')
      .eq('company_id', companyId)
      .eq('id', id)
      .in('status', ['pending'])
      .maybeSingle()
    if (error) throw new DatabaseError(error)
    if (!existing) throw new AppError('CONFLICT', 'Only pending requests can be approved or rejected', 409)
    const { data: row, error: updErr } = await supabase
      .from('time_off_requests')
      .update({ status: decision, approved_by: actorId, approved_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (updErr) throw new DatabaseError(updErr)
    await eventBus.emit({
      companyId,
      eventType: EventTypes.TIMEOFF_DECIDED,
      entityType: 'time_off_request',
      entityId: id,
      payload: { decision },
    })
    return row
  },

  async removeTimeOff(companyId: string, id: string, actorId: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.from('time_off_requests').delete().eq('company_id', companyId).eq('id', id)
    if (error) throw new DatabaseError(error)
  },
}