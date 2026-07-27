import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import type { PaginatedResult } from '@/core/types/common'
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from '@/features/tasks/schemas/task.schema'
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQuery,
  CreateTaskLabelInput,
  UpdateTaskLabelInput,
  CreateTaskChecklistItemInput,
  AddTaskDependencyInput,
  AddTaskAssigneeInput,
  AddTaskWatcherInput,
} from '@/features/tasks/schemas/task.schema'

export const taskService = {
  async list(companyId: string, query: TaskQuery): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = taskQuerySchema.parse(query)
    const supabase = await createClient()

    let dbQuery = supabase
      .from('tasks')
      .select(`
        *,
        project:project_id(id, name, color),
        task_assignees(
          *,
          employee:employee_id(*, profile:profile_id(full_name))
        )
      `, { count: 'exact' })
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (parsed.archived) {
      dbQuery = dbQuery.eq('is_archived', true)
    } else {
      dbQuery = dbQuery.eq('is_archived', false)
    }

    if (parsed.search) {
      const filter = `%${parsed.search}%`
      dbQuery = dbQuery.ilike('title', filter)
    }

    if (parsed.project_id) {
      dbQuery = dbQuery.eq('project_id', parsed.project_id)
    }

    if (parsed.module_id) {
      dbQuery = dbQuery.eq('module_id', parsed.module_id)
    }

    if (parsed.status) {
      dbQuery = dbQuery.eq('status', parsed.status)
    }

    if (parsed.priority) {
      dbQuery = dbQuery.eq('priority', parsed.priority)
    }

    if (parsed.assignee_id) {
      dbQuery = dbQuery.contains('assignee_ids', [parsed.assignee_id])
    }

    if (parsed.due_date_from) {
      dbQuery = dbQuery.gte('due_date', parsed.due_date_from)
    }

    if (parsed.due_date_to) {
      dbQuery = dbQuery.lte('due_date', parsed.due_date_to)
    }

    const offset = (parsed.page - 1) * parsed.limit

    const { data, error, count } = await dbQuery
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

  async getById(companyId: string, taskId: string) {
    const supabase = await createClient()

    const [
      { data: task, error },
      { data: assignees, error: assigneesError },
      { data: labelMappings, error: labelsError },
      { data: checklists, error: checklistsError },
      { data: comments, error: commentsError },
      { data: attachments, error: attachmentsError },
      { data: watchers, error: watchersError },
      { data: dependencies, error: dependenciesError },
    ] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .eq('company_id', companyId)
        .single(),
      supabase
        .from('task_assignees')
        .select('*, employee:employee_id(*)')
        .eq('task_id', taskId),
      supabase
        .from('task_label_mappings')
        .select('label:label_id(*)')
        .eq('task_id', taskId),
      supabase
        .from('task_checklist_items')
        .select('*')
        .eq('task_id', taskId)
        .order('sort_order'),
      supabase
        .from('comments')
        .select('*')
        .eq('entity_type', 'task')
        .eq('entity_id', taskId)
        .order('created_at', { ascending: true }),
      supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', taskId),
      supabase
        .from('task_watchers')
        .select('*, employee:employee_id(*)')
        .eq('task_id', taskId),
      supabase
        .from('task_dependencies')
        .select('*')
        .eq('task_id', taskId),
    ])

    if (error) throw new DatabaseError(error)
    if (assigneesError) throw new DatabaseError(assigneesError)
    if (labelsError) throw new DatabaseError(labelsError)
    if (checklistsError) throw new DatabaseError(checklistsError)
    if (commentsError) throw new DatabaseError(commentsError)
    if (attachmentsError) throw new DatabaseError(attachmentsError)
    if (watchersError) throw new DatabaseError(watchersError)
    if (dependenciesError) throw new DatabaseError(dependenciesError)

    return {
      ...task,
      assignees: assignees || [],
      labels: (labelMappings || []).map((m: { label: unknown }) => m.label).filter(Boolean),
      checklists: checklists || [],
      comments: comments || [],
      attachments: attachments || [],
      watchers: watchers || [],
      dependencies: dependencies || [],
    }
  },

  async create(companyId: string, input: CreateTaskInput, actorId: string) {
    const parsed = createTaskSchema.parse(input)
    const supabase = await createClient()

    const { assigned_to: assignees, labels, ...taskData } = parsed

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        company_id: companyId,
        title: taskData.title,
        description: taskData.description,
        project_id: taskData.project_id,
        module_id: taskData.module_id,
        parent_task_id: taskData.parent_task_id,
        priority: taskData.priority,
        status: taskData.status,
        due_date: taskData.due_date,
        estimated_hours: taskData.estimated_hours,
        created_by: actorId,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    if (assignees && assignees.length > 0) {
      const assigneeRows = assignees.map(employeeId => ({
        task_id: task.id,
        employee_id: employeeId,
        company_id: companyId,
        assigned_by: actorId,
      }))

      const { error: assignError } = await supabase
        .from('task_assignees')
        .insert(assigneeRows)

      if (assignError) throw new DatabaseError(assignError)

      for (const employeeId of assignees) {
        await eventBus.emit({
          companyId,
          eventType: EventTypes.TASK_ASSIGNED,
          entityType: 'task',
          entityId: task.id,
          payload: { taskId: task.id, employeeId, actorId },
        })
      }
    }

    if (labels && labels.length > 0) {
      // Batch resolve label IDs: fetch existing + create missing in one pass
      const { data: existingLabels } = await supabase
        .from('task_labels')
        .select('id, name')
        .eq('company_id', companyId)
        .in('name', labels)

      const labelMap = new Map<string, string>()
      for (const lbl of existingLabels || []) {
        labelMap.set(lbl.name, lbl.id)
      }

      // Create labels that don't exist yet (batch upsert)
      const newNames = labels.filter(n => !labelMap.has(n))
      if (newNames.length > 0) {
        const { data: createdLabels } = await supabase
          .from('task_labels')
          .insert(newNames.map(name => ({ company_id: companyId, name })))
          .select('id, name')

        for (const lbl of createdLabels || []) {
          labelMap.set(lbl.name, lbl.id)
        }
      }

      // Batch insert all mappings
      const mappingRows = labels
        .map(name => labelMap.get(name))
        .filter(Boolean)
        .map(labelId => ({ task_id: task.id, label_id: labelId }))

      if (mappingRows.length > 0) {
        const { error: mapError } = await supabase
          .from('task_label_mappings')
          .insert(mappingRows)
        if (mapError) throw new DatabaseError(mapError)
      }
    }

    await eventBus.emit({
      companyId,
      eventType: EventTypes.TASK_CREATED,
      entityType: 'task',
      entityId: task.id,
      payload: { task, actorId },
    })

    return task
  },

  async update(companyId: string, taskId: string, input: UpdateTaskInput, actorId: string) {
    const parsed = updateTaskSchema.parse(input)
    const supabase = await createClient()

    const { data: previous, error: prevError } = await supabase
      .from('tasks')
      .select('status')
      .eq('id', taskId)
      .single()

    if (prevError) throw new DatabaseError(prevError)

    const { assigned_to: assignees, labels, ...updateData } = parsed

    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updateData, updated_by: actorId })
      .eq('id', taskId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    if (assignees) {
      await supabase.from('task_assignees').delete().eq('task_id', taskId)

      if (assignees.length > 0) {
        const assigneeRows = assignees.map(employeeId => ({
          task_id: taskId,
          employee_id: employeeId,
          company_id: companyId,
          assigned_by: actorId,
        }))

        const { error: assignError } = await supabase
          .from('task_assignees')
          .insert(assigneeRows)

        if (assignError) throw new DatabaseError(assignError)
      }
    }

    if (labels) {
      await supabase.from('task_label_mappings').delete().eq('task_id', taskId)

      if (labels.length > 0) {
        // Batch resolve label IDs: fetch existing + create missing in one pass
        const { data: existingLabels } = await supabase
          .from('task_labels')
          .select('id, name')
          .eq('company_id', companyId)
          .in('name', labels)

        const labelMap = new Map<string, string>()
        for (const lbl of existingLabels || []) {
          labelMap.set(lbl.name, lbl.id)
        }

        // Create labels that don't exist yet (batch)
        const newNames = labels.filter(n => !labelMap.has(n))
        if (newNames.length > 0) {
          const { data: createdLabels } = await supabase
            .from('task_labels')
            .insert(newNames.map(name => ({ company_id: companyId, name })))
            .select('id, name')

          for (const lbl of createdLabels || []) {
            labelMap.set(lbl.name, lbl.id)
          }
        }

        // Batch insert all mappings
        const mappingRows = labels
          .map(name => labelMap.get(name))
          .filter(Boolean)
          .map(labelId => ({ task_id: taskId, label_id: labelId }))

        if (mappingRows.length > 0) {
          const { error: mapError } = await supabase
            .from('task_label_mappings')
            .insert(mappingRows)
          if (mapError) throw new DatabaseError(mapError)
        }
      }
    }

    const events: Array<{
      companyId: string
      eventType: string
      entityType: string
      entityId: string
      payload: Record<string, unknown>
    }> = [
      {
        companyId,
        eventType: EventTypes.TASK_UPDATED,
        entityType: 'task',
        entityId: taskId,
        payload: { task: data, actorId },
      },
    ]

    if (parsed.status && parsed.status !== previous?.status) {
      events.push({
        companyId,
        eventType: EventTypes.TASK_STATUS_CHANGED,
        entityType: 'task' as const,
        entityId: taskId,
        payload: { from: previous?.status, to: parsed.status, actorId },
      })
    }

    for (const event of events) {
      await eventBus.emit(event)
    }

    return data
  },

  async softDelete(companyId: string, taskId: string, actorId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('tasks')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: actorId,
      })
      .eq('id', taskId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.TASK_DELETED,
      entityType: 'task',
      entityId: taskId,
      payload: { actorId },
    })
  },

  async updateChecklistItem(itemId: string, is_completed: boolean, actorId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('task_checklist_items')
      .update({
        is_completed,
        completed_by: is_completed ? actorId : null,
        completed_at: is_completed ? new Date().toISOString() : null,
      })
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async listLabels(companyId: string, query: Record<string, unknown>) {
    const supabase = await createClient()
    let dbQuery = supabase
      .from('task_labels')
      .select('*')
      .eq('company_id', companyId)

    if (query.search) {
      dbQuery = dbQuery.ilike('name', `%${query.search}%`)
    }

    const { data, error } = await dbQuery.order('name')
    if (error) throw new DatabaseError(error)
    return data || []
  },

  async createLabel(companyId: string, input: CreateTaskLabelInput, actorId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('task_labels')
      .insert({
        company_id: companyId,
        name: input.name,
        color: input.color,
        created_by: actorId,
      })
      .select()
      .single()
    if (error) throw new DatabaseError(error)
    return data
  },

  async updateLabel(companyId: string, id: string, input: UpdateTaskLabelInput, actorId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('task_labels')
      .update({ ...input, updated_by: actorId })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single()
    if (error) throw new DatabaseError(error)
    return data
  },

  async deleteLabel(companyId: string, id: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('task_labels')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId)
    if (error) throw new DatabaseError(error)
  },

  async listChecklist(companyId: string, taskId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('task_checklist_items')
      .select('*')
      .eq('task_id', taskId)
      .eq('company_id', companyId)
      .order('sort_order')
    if (error) throw new DatabaseError(error)
    return data || []
  },

  async addChecklistItem(companyId: string, taskId: string, input: CreateTaskChecklistItemInput, actorId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('task_checklist_items')
      .insert({
        task_id: taskId,
        company_id: companyId,
        content: input.content,
        created_by: actorId,
      })
      .select()
      .single()
    if (error) throw new DatabaseError(error)
    return data
  },

  async toggleChecklistItem(companyId: string, taskId: string, itemId: string) {
    const supabase = await createClient()
    const { data: current, error: getError } = await supabase
      .from('task_checklist_items')
      .select('is_completed')
      .eq('id', itemId)
      .eq('task_id', taskId)
      .single()
    if (getError) throw new DatabaseError(getError)

    const { data, error } = await supabase
      .from('task_checklist_items')
      .update({
        is_completed: !current.is_completed,
        completed_at: !current.is_completed ? new Date().toISOString() : null,
      })
      .eq('id', itemId)
      .eq('company_id', companyId)
      .select()
      .single()
    if (error) throw new DatabaseError(error)
    return data
  },

  async listDependencies(companyId: string, taskId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('task_dependencies')
      .select('*')
      .eq('task_id', taskId)
      .eq('company_id', companyId)
    if (error) throw new DatabaseError(error)
    return data || []
  },

  async addDependency(companyId: string, taskId: string, input: AddTaskDependencyInput, actorId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('task_dependencies')
      .insert({
        task_id: taskId,
        company_id: companyId,
        depends_on_task_id: input.depends_on_task_id,
        type: input.dependency_type,
        created_by: actorId,
      })
    if (error) throw new DatabaseError(error)
  },

  async removeDependency(companyId: string, taskId: string, depId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('task_dependencies')
      .delete()
      .eq('id', depId)
      .eq('task_id', taskId)
      .eq('company_id', companyId)
    if (error) throw new DatabaseError(error)
  },

  async addAssignee(companyId: string, taskId: string, input: AddTaskAssigneeInput, actorId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('task_assignees')
      .insert({
        task_id: taskId,
        company_id: companyId,
        employee_id: input.assignee_id,
        assigned_by: actorId,
      })
    if (error) throw new DatabaseError(error)
  },

  async removeAssignee(companyId: string, taskId: string, assigneeId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('task_assignees')
      .delete()
      .eq('task_id', taskId)
      .eq('employee_id', assigneeId)
      .eq('company_id', companyId)
    if (error) throw new DatabaseError(error)
  },

  async addWatcher(companyId: string, taskId: string, input: AddTaskWatcherInput, actorId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('task_watchers')
      .insert({
        task_id: taskId,
        company_id: companyId,
        employee_id: input.watcher_id,
      })
    if (error) throw new DatabaseError(error)
  },

  async getTimeStats(companyId: string, employeeId?: string) {
    const supabase = await createClient()

    let query = supabase
      .from('work_logs')
      .select('hours, status')
      .eq('company_id', companyId)

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error } = await query

    if (error) throw new DatabaseError(error)

    const logs = data || []
    const totalHours = logs.reduce((sum: number, log: { hours?: number }) => sum + (log.hours || 0), 0)
    const completedTasks = logs.filter((log: { status?: string }) => log.status === 'approved').length

    return {
      totalHours,
      totalLogs: logs.length,
      completedTasks,
      averageHoursPerLog: logs.length > 0 ? totalHours / logs.length : 0,
    }
  },
}
