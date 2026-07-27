'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  status: string
  priority: string
  due_date?: string
  project_id?: string
  project?: { id: string; name: string; color?: string } | null
  task_assignees?: { employee: { id: string; first_name?: string; last_name?: string; profile?: { full_name?: string } } | null }[]
}

const statusColors: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  done: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const priorityColors: Record<string, string> = {
  low: 'text-gray-500',
  medium: 'text-blue-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    if (priorityFilter) params.set('priority', priorityFilter)
    fetch(`/api/tasks?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data || d || []
        setTasks(Array.isArray(data) ? data : [])
        setTotalPages(d.totalPages || Math.ceil((d.total || 0) / 20) || 1)
      })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
  }, [page, search, statusFilter, priorityFilter])

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    }
  }

  const getAssigneeNames = (task: Task) => {
    if (!task.task_assignees?.length) return []
    return task.task_assignees.map((a: any) => {
      const emp = a.employee || a
      return emp?.profile?.full_name || `${emp?.first_name || ''} ${emp?.last_name || ''}`.trim() || 'Unnamed'
    })
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Manage and track tasks"
        actions={
          <div className="flex gap-2">
            <Link href="/tasks/board" className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">Board View</Link>
            <Link href="/tasks/new" className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">New Task</Link>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Search tasks..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto sm:min-w-[200px]" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto">
          <option value="">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </select>
        <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="h-5 w-64 bg-muted rounded" />
              <div className="flex gap-2 mt-2">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="Create your first task"
          action={<Link href="/tasks/new" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">New Task</Link>}
        />
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {tasks.map(task => {
              const assignees = getAssigneeNames(task)
              return (
                <div key={task.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Link href={`/tasks/${task.id}`} className="font-medium hover:text-primary">{task.title}</Link>
                    <div className="flex gap-1 shrink-0">
                      <span className={`text-sm font-medium capitalize ${priorityColors[task.priority] || ''}`}>{task.priority}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground mb-2">
                    <span>{task.project?.name ? (
                      <span className="flex items-center gap-1">
                        {task.project.color && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: task.project.color }} />}
                        {task.project.name}
                      </span>
                    ) : '-'}</span>
                    <span className="text-right">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t text-sm">
                    <div className="flex items-center gap-2">
                      {assignees.length > 0 && (
                        <div className="flex -space-x-1.5">
                          {assignees.slice(0, 3).map((name: string, i: number) => (
                            <div key={i} className="h-6 w-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[10px] font-medium" title={name}>
                              {name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {assignees.length > 3 && <span className="text-xs text-muted-foreground ml-1">+{assignees.length - 3}</span>}
                        </div>
                      )}
                    </div>
                    <select
                      value={task.status}
                      onChange={e => handleStatusChange(task.id, e.target.value)}
                      className={`rounded-md border bg-background px-2 py-1 text-xs font-medium ${statusColors[task.status] || ''}`}
                    >
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Desktop table view */}
          <div className="rounded-lg border overflow-x-auto hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Title</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Project</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Assignees</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Priority</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="p-3">
                      <Link href={`/tasks/${task.id}`} className="font-medium hover:text-primary">{task.title}</Link>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {task.project?.name ? (
                        <span className="flex items-center gap-1">
                          {task.project.color && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: task.project.color }} />}
                          {task.project.name}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      <div className="flex -space-x-1.5">
                        {getAssigneeNames(task).slice(0, 3).map((name: string, i: number) => (
                          <div key={i} className="h-6 w-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[10px] font-medium" title={name}>
                            {name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {getAssigneeNames(task).length > 3 && <span className="text-xs text-muted-foreground ml-1">+{getAssigneeNames(task).length - 3}</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <select
                        value={task.status}
                        onChange={e => handleStatusChange(task.id, e.target.value)}
                        className={`rounded-md border bg-background px-2 py-1 text-xs font-medium ${statusColors[task.status] || ''}`}
                      >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span className={`text-sm font-medium capitalize ${priorityColors[task.priority] || ''}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50">Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
