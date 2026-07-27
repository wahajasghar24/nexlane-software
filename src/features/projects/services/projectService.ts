import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import type { PaginatedResult } from '@/core/types/common'
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
} from '@/features/projects/schemas/project.schema'
import type { CreateProjectInput, UpdateProjectInput, ProjectQuery } from '@/features/projects/schemas/project.schema'

export const projectService = {
  async list(companyId: string, query: ProjectQuery): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = projectQuerySchema.parse(query)
    const supabase = await createClient()

    let q = supabase
      .from('projects')
      .select('*, project_members(count), tasks(count)', { count: 'exact' })
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (parsed.archive) {
      q = q.eq('is_archived', true)
    } else {
      q = q.eq('is_archived', false)
    }

    if (parsed.search) {
      q = q.ilike('name', `%${parsed.search}%`)
    }

    if (parsed.status) {
      q = q.eq('status', parsed.status)
    }

    if (parsed.priority) {
      q = q.eq('priority', parsed.priority)
    }

    const offset = (parsed.page - 1) * parsed.limit

    const { data, error, count } = await q
      .order('created_at', { ascending: false })
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

  async getById(companyId: string, projectId: string) {
    const supabase = await createClient()

    const [
      { data: project, error },
      { data: members, error: membersError },
      { data: modules, error: modulesError },
      { data: milestones, error: milestonesError },
    ] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('company_id', companyId)
        .single(),
      supabase
        .from('project_members')
        .select('*, employee:employee_id!inner(*, profile:profile_id(*))')
        .eq('project_id', projectId),
      supabase
        .from('project_modules')
        .select('*')
        .eq('project_id', projectId)
        .eq('company_id', companyId)
        .order('sort_order'),
      supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .eq('company_id', companyId),
    ])

    if (error) throw new DatabaseError(error)
    if (membersError) throw new DatabaseError(membersError)
    if (modulesError) throw new DatabaseError(modulesError)
    if (milestonesError) throw new DatabaseError(milestonesError)

    return {
      ...project,
      members: members || [],
      modules: modules || [],
      milestones: milestones || [],
    }
  },

  async create(companyId: string, input: CreateProjectInput, actorId: string) {
    const parsed = createProjectSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .insert({
        company_id: companyId,
        name: parsed.name,
        description: parsed.description,
        client_name: parsed.client_name,
        status: parsed.status,
        priority: parsed.priority,
        start_date: parsed.start_date,
        end_date: parsed.end_date,
        budget: parsed.budget,
        color: parsed.color,
        created_by: actorId,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.PROJECT_CREATED,
      entityType: 'project',
      entityId: data.id,
      payload: { project: data, actorId },
    })

    return data
  },

  async update(companyId: string, projectId: string, input: UpdateProjectInput, actorId: string) {
    const parsed = updateProjectSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .update({ ...parsed, updated_by: actorId })
      .eq('id', projectId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.PROJECT_UPDATED,
      entityType: 'project',
      entityId: projectId,
      payload: { project: data, actorId },
    })

    return data
  },

  async softDelete(companyId: string, projectId: string, actorId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('projects')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: actorId,
      })
      .eq('id', projectId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.PROJECT_DELETED,
      entityType: 'project',
      entityId: projectId,
      payload: { actorId },
    })
  },

  async archive(companyId: string, projectId: string) {
    const supabase = await createClient()

    const { data: current } = await supabase
      .from('projects')
      .select('is_archived')
      .eq('id', projectId)
      .eq('company_id', companyId)
      .single()

    const { error } = await supabase
      .from('projects')
      .update({ is_archived: !current?.is_archived })
      .eq('id', projectId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)
  },

  async addMember(companyId: string, projectId: string, employeeId: string, role: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        employee_id: employeeId,
        role,
        company_id: companyId,
      })

    if (error) throw new DatabaseError(error)
  },

  async removeMember(companyId: string, projectId: string, employeeId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('employee_id', employeeId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)
  },

  async getStats(companyId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .select('status, priority')
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (error) throw new DatabaseError(error)

    const statusCounts: Record<string, number> = {}
    const priorityCounts: Record<string, number> = {}

    for (const p of data || []) {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1
      priorityCounts[p.priority] = (priorityCounts[p.priority] || 0) + 1
    }

    return {
      total: data?.length || 0,
      byStatus: statusCounts,
      byPriority: priorityCounts,
    }
  },
}
