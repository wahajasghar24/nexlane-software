import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  project_id: z.string().uuid().optional(),
  module_id: z.string().uuid().optional(),
  parent_task_id: z.string().uuid().optional(),
  assigned_to: z.array(z.string().uuid()).optional().default([]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  status: z.enum(['todo', 'in_progress', 'blocked', 'review', 'testing', 'completed', 'cancelled']).optional().default('todo'),
  due_date: z.string().datetime().optional(),
  estimated_hours: z.number().positive().optional(),
  labels: z.array(z.string()).optional().default([]),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  project_id: z.string().uuid().optional(),
  module_id: z.string().uuid().optional(),
  parent_task_id: z.string().uuid().optional(),
  assigned_to: z.array(z.string().uuid()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['todo', 'in_progress', 'blocked', 'review', 'testing', 'completed', 'cancelled']).optional(),
  due_date: z.string().datetime().optional(),
  estimated_hours: z.number().positive().optional(),
  labels: z.array(z.string()).optional(),
})

export const taskQuerySchema = z.object({
  search: z.string().optional(),
  project_id: z.string().uuid().optional(),
  module_id: z.string().uuid().optional(),
  status: z.enum(['todo', 'in_progress', 'blocked', 'review', 'testing', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignee_id: z.string().uuid().optional(),
  due_date_from: z.string().datetime().optional(),
  due_date_to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  archived: z.coerce.boolean().optional().default(false),
})

export const createTaskLabelSchema = z.object({
  name: z.string().min(1, 'Label name is required'),
  color: z.string().optional(),
})
export type CreateTaskLabelInput = z.infer<typeof createTaskLabelSchema>

export const updateTaskLabelSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
})
export type UpdateTaskLabelInput = z.infer<typeof updateTaskLabelSchema>

export const createTaskChecklistItemSchema = z.object({
  content: z.string().min(1, 'Content is required'),
})
export type CreateTaskChecklistItemInput = z.infer<typeof createTaskChecklistItemSchema>

export const updateTaskChecklistItemSchema = z.object({
  is_completed: z.boolean().optional(),
  content: z.string().min(1).optional(),
})
export type UpdateTaskChecklistItemInput = z.infer<typeof updateTaskChecklistItemSchema>

export const addTaskDependencySchema = z.object({
  depends_on_task_id: z.string().uuid('Invalid task ID'),
  dependency_type: z.enum(['blocks', 'is_blocked_by', 'related_to']).default('is_blocked_by'),
})
export type AddTaskDependencyInput = z.infer<typeof addTaskDependencySchema>

export const addTaskAssigneeSchema = z.object({
  assignee_id: z.string().uuid(),
})
export type AddTaskAssigneeInput = z.infer<typeof addTaskAssigneeSchema>

export const addTaskWatcherSchema = z.object({
  watcher_id: z.string().uuid(),
})
export type AddTaskWatcherInput = z.infer<typeof addTaskWatcherSchema>

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type TaskQuery = z.infer<typeof taskQuerySchema>
