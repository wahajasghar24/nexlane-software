import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import { createEmployeeSchema, updateEmployeeSchema, employeeQuerySchema } from '@/features/employees/schemas/employee.schema'
import type { CreateEmployeeInput, UpdateEmployeeInput } from '@/features/employees/schemas/employee.schema'

export const employeeService = {
  async list(companyId: string, query: Record<string, unknown>) {
    const parsed = employeeQuerySchema.parse(query)
    const supabase = await createClient()

    let dbQuery = supabase
      .from('employees')
      .select(`
        *,
        profile:profile_id(*),
        department:department_id(id, name),
        designation:designation_id(id, name)
      `, { count: 'exact' })
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (parsed.search) {
      dbQuery = dbQuery.ilike('employee_code', `%${parsed.search}%`)
    }
    if (parsed.department_id) {
      dbQuery = dbQuery.eq('department_id', parsed.department_id)
    }
    if (parsed.designation_id) {
      dbQuery = dbQuery.eq('designation_id', parsed.designation_id)
    }
    if (parsed.status) {
      dbQuery = dbQuery.eq('employment_status', parsed.status)
    }

    const from = (parsed.page - 1) * parsed.limit
    const to = from + parsed.limit - 1

    const { data, error, count } = await dbQuery
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error)

    return { data, total: count, page: parsed.page, limit: parsed.limit }
  },

  async getById(companyId: string, employeeId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        profile:profile_id(*),
        department:department_id(id, name),
        designation:designation_id(id, name)
      `)
      .eq('id', employeeId)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async create(companyId: string, input: CreateEmployeeInput, actorId: string) {
    const parsed = createEmployeeSchema.parse(input)
    const supabase = await createClient()

    const updateData: Record<string, string> = {}
    if (parsed.first_name || parsed.last_name) {
      updateData.full_name = `${parsed.first_name || ''} ${parsed.last_name || ''}`.trim()
    }
    if (parsed.email) updateData.email = parsed.email
    if (parsed.phone) updateData.phone = parsed.phone

    if (Object.keys(updateData).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', parsed.profile_id)

      if (profileError) throw new DatabaseError(profileError)
    }

    const { data, error } = await supabase
      .from('employees')
      .insert({
        company_id: companyId,
        profile_id: parsed.profile_id,
        department_id: parsed.department_id,
        designation_id: parsed.designation_id,
        employment_status: parsed.employment_status,
        employee_code: parsed.employee_code,
        position: parsed.position,
        hire_date: parsed.hire_date,
        salary: parsed.salary,
        bio: parsed.bio,
        emergency_contact: parsed.emergency_contact,
        created_by: actorId,
      })
      .select(`
        *,
        profile:profile_id(*),
        department:department_id(id, name),
        designation:designation_id(id, name)
      `)
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.EMPLOYEE_CREATED,
      entityType: 'employee',
      entityId: data.id,
      payload: { employee: data, actorId },
    })

    return data
  },

  async update(companyId: string, employeeId: string, input: UpdateEmployeeInput, actorId: string) {
    const parsed = updateEmployeeSchema.parse(input)
    const supabase = await createClient()

    const { first_name, last_name, email, phone, ...rest } = parsed

    const profileUpdate: Record<string, string> = {}
    if (first_name !== undefined || last_name !== undefined) {
      const existing = await supabase
        .from('employees')
        .select('profile:profile_id(full_name, email, phone)')
        .eq('id', employeeId)
        .single()
      if (existing.data) {
        const p = existing.data.profile as any
        profileUpdate.full_name = `${first_name ?? p?.full_name?.split(' ')[0] ?? ''} ${last_name ?? p?.full_name?.split(' ').slice(1).join(' ') ?? ''}`.trim()
      }
    }
    if (email !== undefined) profileUpdate.email = email
    if (phone !== undefined) profileUpdate.phone = phone

    if (Object.keys(profileUpdate).length > 0) {
      const { data: emp } = await supabase
        .from('employees')
        .select('profile_id')
        .eq('id', employeeId)
        .single()

      if (emp) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', emp.profile_id)

        if (profileError) throw new DatabaseError(profileError)
      }
    }

    const { data, error } = await supabase
      .from('employees')
      .update({ ...rest, updated_by: actorId })
      .eq('id', employeeId)
      .eq('company_id', companyId)
      .select(`
        *,
        profile:profile_id(*),
        department:department_id(id, name),
        designation:designation_id(id, name)
      `)
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.EMPLOYEE_UPDATED,
      entityType: 'employee',
      entityId: employeeId,
      payload: { employee: data, actorId },
    })

    return data
  },

  async softDelete(companyId: string, employeeId: string, actorId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('employees')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: actorId,
      })
      .eq('id', employeeId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.EMPLOYEE_DELETED,
      entityType: 'employee',
      entityId: employeeId,
      payload: { actorId },
    })
  },

  async getProfile(companyId: string, employeeId: string) {
    const supabase = await createClient()

    const [
      { data: employee, error: empError },
      { data: projects, error: projError },
      { data: tasks, error: taskError },
      { data: workLogs, error: wlError },
      { data: activity, error: actError },
    ] = await Promise.all([
      supabase
        .from('employees')
        .select(`
          *,
          profile:profile_id(*),
          department:department_id(id, name),
          designation:designation_id(id, name)
        `)
        .eq('id', employeeId)
        .eq('company_id', companyId)
        .single(),
      supabase
        .from('project_members')
        .select('project:project_id(*)')
        .eq('employee_id', employeeId),
      supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', employeeId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('work_logs')
        .select('*')
        .eq('employee_id', employeeId)
        .order('date', { ascending: false })
        .limit(10),
      supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_type', 'employee')
        .eq('entity_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    if (empError) throw new DatabaseError(empError)
    if (projError) throw new DatabaseError(projError)
    if (taskError) throw new DatabaseError(taskError)
    if (wlError) throw new DatabaseError(wlError)
    if (actError) throw new DatabaseError(actError)

    return {
      employee,
      projects: projects?.map((pm: { project: unknown }) => pm.project) || [],
      tasks: tasks || [],
      work_logs: workLogs || [],
      activity: activity || [],
    }
  },
}
