'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

const columns = [
  { key: 'todo', label: 'Todo', color: 'bg-gray-200 dark:bg-gray-700' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-200 dark:bg-blue-800' },
  { key: 'blocked', label: 'Blocked', color: 'bg-red-200 dark:bg-red-800' },
  { key: 'review', label: 'Review', color: 'bg-yellow-200 dark:bg-yellow-800' },
  { key: 'testing', label: 'Testing', color: 'bg-purple-200 dark:bg-purple-800' },
  { key: 'completed', label: 'Completed', color: 'bg-green-200 dark:bg-green-800' },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-gray-300 dark:bg-gray-600' },
]

const priorityColors: Record<string, string> = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-500',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-500',
}

interface TaskCard {
  id: string
  title: string
  priority: string
  status: string
  assignee_avatars?: string[]
  task_assignees?: any[]
}

export default function TaskBoardPage() {
  const [tasks, setTasks] = useState<TaskCard[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = new URLSearchParams({ limit: '100' })
    if (search) params.set('search', search)
    fetch(`/api/tasks?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data || d || []
        setTasks(Array.isArray(data) ? data : [])
      })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
  }, [search])

  const handleDragStart = (e: React.DragEvent, taskId: string, currentStatus: string) => {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.setData('fromStatus', currentStatus)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    const fromStatus = e.dataTransfer.getData('fromStatus')
    if (!taskId || fromStatus === newStatus) return

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
  }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const getAssigneeAvatars = (task: TaskCard) => {
    if (task.task_assignees?.length) {
      return task.task_assignees.map((a: any) => {
        const emp = a.employee || a
        const name = emp?.profile?.full_name || `${emp?.first_name || ''} ${emp?.last_name || ''}`.trim() || '?'
        return name.charAt(0).toUpperCase()
      }).slice(0, 3)
    }
    return []
  }

  return (
    <div>
      <PageHeader
        title="Task Board"
        description="Kanban-style task management"
        actions={
          <div className="flex gap-2">
            <Link href="/tasks" className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">List View</Link>
            <Link href="/tasks/new" className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">New Task</Link>
          </div>
        }
      />

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto sm:min-w-[200px]"
        />
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(col => (
            <div key={col.key} className="min-w-[260px] flex-shrink-0">
              <div className="h-8 w-24 bg-muted rounded mb-3 animate-pulse" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks"
          description="Create your first task to see it on the board"
          action={<Link href="/tasks/new" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">New Task</Link>}
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key)
            return (
              <div
                key={col.key}
                className="min-w-[260px] flex-shrink-0"
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, col.key)}
              >
                <div className={`rounded-t-lg px-3 py-2 text-sm font-semibold ${col.color}`}>
                  {col.label}
                  <span className="ml-2 text-xs opacity-70">({colTasks.length})</span>
                </div>
                <div className="bg-muted/30 rounded-b-lg p-2 space-y-2 min-h-[200px]">
                  {colTasks.map(task => {
                    const avatars = getAssigneeAvatars(task)
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={e => handleDragStart(e, task.id, task.status)}
                        className={`rounded-md border bg-card p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border-l-4 ${priorityColors[task.priority] || 'border-l-gray-400'}`}
                      >
                        <Link href={`/tasks/${task.id}`} className="text-sm font-medium hover:text-primary block mb-2">
                          {task.title}
                        </Link>
                        <div className="flex items-center justify-between">
                          <span className="text-xs capitalize text-muted-foreground">{task.priority}</span>
                          <div className="flex -space-x-1.5">
                            {avatars.map((initial: string, i: number) => (
                              <div key={i} className="h-5 w-5 rounded-full bg-primary/10 border border-background flex items-center justify-center text-[9px] font-medium">
                                {initial}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
