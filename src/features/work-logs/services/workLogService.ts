import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import type { PaginatedResult } from '@/core/types/common'
import {
  createWorkLogSchema,
  updateWorkLogSchema,
  workLogQuerySchema,
} from '@/features/work-logs/schemas/workLog.schema'
import type { CreateWorkLogInput, UpdateWorkLogInput, WorkLogQuery } from '@/features/work-logs/schemas/workLog.schema'

export const workLogService = {
  async list(companyId: string, query: WorkLogQuery): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = workLogQuerySchema.parse(query)
    const supabase = await createClient()

    let dbQuery = supabase
      .from('work_logs')
      .select(`
        *,
        employee:employee_id(*, profile:profile_id(full_name)),
        task:task_id(title)
      `, { count: 'exact' })
      .eq('company_id', companyId)

    if (parsed.employee_id) {
      dbQuery = dbQuery.eq('employee_id', parsed.employee_id)
    }

    if (parsed.task_id) {
      dbQuery = dbQuery.eq('task_id', parsed.task_id)
    }

    if (parsed.date_from) {
      dbQuery = dbQuery.gte('log_date', parsed.date_from)
    }

    if (parsed.date_to) {
      dbQuery = dbQuery.lte('log_date', parsed.date_to)
    }

    if (parsed.status) {
      dbQuery = dbQuery.eq('status', parsed.status)
    }

    const offset = (parsed.page - 1) * parsed.limit

    const { data, error, count } = await dbQuery
      .order('log_date', { ascending: false })
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

  async getToday(companyId: string, employeeId: string) {
    const supabase = await createClient()

    const today = new Date().toISOString().split('T')[0]
    const startOfDay = `${today}T00:00:00.000Z`
    const endOfDay = `${today}T23:59:59.999Z`

    const { data, error } = await supabase
      .from('work_logs')
      .select('*')
      .eq('company_id', companyId)
      .eq('employee_id', employeeId)
      .gte('log_date', startOfDay)
      .lte('log_date', endOfDay)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error)
    return data
  },

  async getByDateRange(companyId: string, employeeId: string, from: string, to: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('work_logs')
      .select('*')
      .eq('company_id', companyId)
      .eq('employee_id', employeeId)
      .gte('log_date', from)
      .lte('log_date', to)
      .order('log_date', { ascending: true })

    if (error) throw new DatabaseError(error)
    return data
  },

  async create(companyId: string, input: CreateWorkLogInput, actorId: string) {
    const parsed = createWorkLogSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('work_logs')
      .insert({
        company_id: companyId,
        employee_id: parsed.employee_id,
        task_id: parsed.task_id,
        log_date: parsed.log_date,
        start_time: parsed.start_time,
        end_time: parsed.end_time,
        hours: parsed.hours,
        description: parsed.description,
        progress_percentage: parsed.progress_percentage,
        blockers: parsed.blockers,
        next_step: parsed.next_step,
        status: parsed.status,
        created_by: actorId,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async update(companyId: string, id: string, input: UpdateWorkLogInput, actorId: string) {
    const parsed = updateWorkLogSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('work_logs')
      .update({ ...parsed, updated_by: actorId })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async softDelete(companyId: string, id: string, actorId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('work_logs')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: actorId,
      })
      .eq('id', id)
      .eq('company_id', companyId)
    if (error) throw new DatabaseError(error)
  },

  async approve(companyId: string, id: string, approvedBy: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('work_logs')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async reject(companyId: string, id: string, rejectedBy: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('work_logs')
      .update({
        status: 'rejected',
        rejected_by: rejectedBy,
        rejected_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async getSummary(companyId: string, query: Record<string, unknown>) {
    const supabase = await createClient()
    let dbQuery = supabase
      .from('work_logs')
      .select('*')
      .eq('company_id', companyId)

    if (query.date_from) {
      dbQuery = dbQuery.gte('log_date', query.date_from as string)
    }
    if (query.date_to) {
      dbQuery = dbQuery.lte('log_date', query.date_to as string)
    }
    if (query.employee_id) {
      dbQuery = dbQuery.eq('employee_id', query.employee_id as string)
    }

    const { data, error } = await dbQuery.order('log_date', { ascending: false })
    if (error) throw new DatabaseError(error)

    const logs = data || []
    const totalHours = logs.reduce((sum: number, log: { hours?: number }) => sum + (log.hours || 0), 0)
    const approvedLogs = logs.filter((log: { status?: string }) => log.status === 'approved')
    const approvedHours = approvedLogs.reduce((sum: number, log: { hours?: number }) => sum + (log.hours || 0), 0)

    return {
      totalLogs: logs.length,
      totalHours,
      approvedLogs: approvedLogs.length,
      approvedHours,
      logs,
    }
  },

  async getWeeklySummary(companyId: string, employeeId: string, date: string) {
    const supabase = await createClient()

    const logDate = new Date(date)
    const dayOfWeek = logDate.getDay()
    const diff = logDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const monday = new Date(logDate.setDate(diff))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const weekStart = monday.toISOString().split('T')[0]
    const weekEnd = sunday.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('work_logs')
      .select('*')
      .eq('company_id', companyId)
      .eq('employee_id', employeeId)
      .gte('log_date', `${weekStart}T00:00:00.000Z`)
      .lte('log_date', `${weekEnd}T23:59:59.999Z`)
      .order('log_date', { ascending: true })

    if (error) throw new DatabaseError(error)

    const logs = data || []
    const totalHours = logs.reduce((sum: number, log: { hours?: number }) => sum + (log.hours || 0), 0)
    const dailyBreakdown: Record<string, number> = {}

    for (const log of logs) {
      const day = log.log_date?.split('T')[0]
      if (day) {
        dailyBreakdown[day] = (dailyBreakdown[day] || 0) + (log.hours || 0)
      }
    }

    return {
      weekStart,
      weekEnd,
      totalHours,
      totalLogs: logs.length,
      dailyBreakdown,
      logs,
    }
  },

  async getMonthlySummary(companyId: string, employeeId: string, month: number, year: number) {
    const supabase = await createClient()

    const monthStr = month.toString().padStart(2, '0')
    const startDate = `${year}-${monthStr}-01T00:00:00.000Z`

    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${monthStr}-${lastDay}T23:59:59.999Z`

    const { data, error } = await supabase
      .from('work_logs')
      .select('*')
      .eq('company_id', companyId)
      .eq('employee_id', employeeId)
      .gte('log_date', startDate)
      .lte('log_date', endDate)
      .order('log_date', { ascending: true })

    if (error) throw new DatabaseError(error)

    const logs = data || []
    const totalHours = logs.reduce((sum: number, log: { hours?: number }) => sum + (log.hours || 0), 0)
    const approvedLogs = logs.filter((log: { status?: string }) => log.status === 'approved')
    const approvedHours = approvedLogs.reduce((sum: number, log: { hours?: number }) => sum + (log.hours || 0), 0)

    return {
      month,
      year,
      totalHours,
      approvedHours,
      totalLogs: logs.length,
      approvedLogs: approvedLogs.length,
      logs,
    }
  },

  async getProductivity(companyId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('work_logs')
      .select('employee_id, hours, status, log_date')
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)

    const logs = data || []
    const employeeMap: Record<string, { totalHours: number; totalLogs: number; approvedHours: number }> = {}

    for (const log of logs) {
      if (!employeeMap[log.employee_id]) {
        employeeMap[log.employee_id] = { totalHours: 0, totalLogs: 0, approvedHours: 0 }
      }
      employeeMap[log.employee_id].totalHours += log.hours || 0
      employeeMap[log.employee_id].totalLogs += 1
      if (log.status === 'approved') {
        employeeMap[log.employee_id].approvedHours += log.hours || 0
      }
    }

    const employees = Object.entries(employeeMap).map(([employeeId, stats]) => ({
      employeeId,
      ...stats,
    }))

    const totalHours = employees.reduce((sum, e) => sum + e.totalHours, 0)
    const averageHours = employees.length > 0 ? totalHours / employees.length : 0

    return {
      totalEmployees: employees.length,
      totalHours,
      averageHours,
      employees,
    }
  },
}
