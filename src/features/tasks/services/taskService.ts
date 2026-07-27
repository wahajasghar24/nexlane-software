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

    let countQuery = supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .is('deleted_at', null)

    let dataQuery = supabase
      .from('tasks')
      .select('*, task_assignees(*)')
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (parsed.archived) {
      countQuery = countQuery.eq('is_archived', true)
      dataQuery = dataQuery.eq('is_archived', true)
    } else {
      countQuery = countQuery.eq('is_archived', false)
      dataQuery = dataQuery.eq('is_archived', false)
    }

    if (parsed.search) {
      const filter = `%${parsed.search}%`
      countQuery = countQuery.ilike('title', filter)
      dataQuery = dataQuery.ilike('title', filter)
    }

    if (parsed.project_id) {
      countQuery = countQuery.eq('project_id', parsed.project_id)
      dataQuery = dataQuery.eq('project_id', parsed.project_id)
    }

    if (parsed.module_id) {
      countQuery = countQuery.eq('module_id', parsed.module_id)
      dataQuery = dataQuery.eq('module_id', parsed.module_id)
    }

    if (parsed.status) {
      countQuery = countQuery.eq('status', parsed.status)
      dataQuery = dataQuery.eq('status', parsed.status)
    }

    if (parsed.priority) {
      countQuery = countQuery.eq('priority', parsed.priority)
      dataQuery = dataQuery.eq('priority', parsed.priority)
    }

    if (parsed.assignee_id) {
      countQuery = countQuery.contains('assignee_ids', [parsed.assignee_id])
      dataQuery = dataQuery.contains('assignee_ids', [parsed.assignee_id])
    }

    if (parsed.due_date_from) {
      countQuery = countQuery.gte('due_date', parsed.due_date_from)
      dataQuery = dataQuery.gte('due_date', parsed.due_date_from)
    }

    if (parsed.due_date_to) {
      countQuery = countQuery.lte('due_date', parsed.due_date_to)
      dataQuery = dataQuery.lte('due_date', parsed.due_date_to)
    }

    const { count, error: countError } = await countQuery
    if (countError) throw new DatabaseError(countError)

    const offset = (parsed.page - 1) * parsed.limit

    const { data, error } = await dataQuery
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

    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('company_id', companyId)
      .single()

    if (error) throw new DatabaseError(error)

    const { data: assignees, error: assigneesError } = await supabase
      .from('task_assignees')
      .select('*, employee:employee_id(*)')
      .eq('task_id', taskId)

    if (assigneesError) throw new DatabaseError(assigneesError)

    const { data: mappings, error: labelsError } = await supabase
      .from('task_label_mappings')
      .select('label_id')
      .eq('task_id', taskId)

    if (labelsError) throw new DatabaseError(labelsError)

    const labelIds = (mappings || []).map((m: { label_id: string }) => m.label_id)
    const labels = labelIds.length > 0
      ? (await supabase.from('task_labels').select('*').in('id', labelIds)).data || []
      : []

    const { data: checklists, error: checklistsError } = await supabase
      .from('task_checklist_items')
      .select('*')
      .eq('task_id', taskId)
      .order('sort_order')

    if (checklistsError) throw new DatabaseError(checklistsError)

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('entity_type', 'task')
      .eq('entity_id', taskId)
      .order('created_at', { ascending: true })

    if (commentsError) throw new DatabaseError(commentsError)

    const { data: attachments, error: attachmentsError } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('task_id', taskId)

    if (attachmentsError) throw new DatabaseError(attachmentsError)

    const { data: watchers, error: watchersError } = await supabase
      .from('task_watchers')
      .select('*, employee:employee_id(*)')
      .eq('task_id', taskId)

    if (watchersError) throw new DatabaseError(watchersError)

    const { data: dependencies, error: dependenciesError } = await supabase
      .from('task_dependencies')
      .select('*')
      .eq('task_id', taskId)

    if (dependenciesError) throw new DatabaseError(dependenciesError)

    return {
      ...task,
      assignees: assignees || [],
      labels: labels || [],
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
      for (const labelName of labels) {
        const { data: existing } = await supabase
          .from('task_labels')
          .select('id')
          .eq('company_id', companyId)
          .eq('name', labelName)
          .maybeSingle()

        let labelId = existing?.id
        if (!labelId) {
          const { data: newLabel, error: createError } = await supabase
            .from('task_labels')
            .insert({ company_id: companyId, name: labelName })
            .select('id')
            .single()
          if (createError) throw new DatabaseError(createError)
          labelId = newLabel.id
        }

        const { error: mapError } = await supabase
          .from('task_label_mappings')
          .insert({ task_id: task.id, label_id: labelId })
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

      for (const labelName of labels) {
        const { data: existing } = await supabase
          .from('task_labels')
          .select('id')
          .eq('company_id', companyId)
          .eq('name', labelName)
          .maybeSingle()

        let labelId = existing?.id
        if (!labelId) {
          const { data: newLabel, error: createError } = await supabase
            .from('task_labels')
            .insert({ company_id: companyId, name: labelName })
            .select('id')
            .single()
          if (createError) throw new DatabaseError(createError)
          labelId = newLabel.id
        }

        const { error: mapError } = await supabase
          .from('task_label_mappings')
          .insert({ task_id: taskId, label_id: labelId })
        if (mapError) throw new DatabaseError(mapError)
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
