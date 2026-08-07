'use client'
import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface ChecklistItem {
  id: string
  content: string
  is_completed: boolean
}

interface Comment {
  id: string
  content: string
  created_at: string
  author_name?: string
}

interface Attachment {
  id: string
  name: string
  file_url: string
  file_size?: number
}

interface Watcher {
  id: string
  employee?: { id: string; first_name?: string; last_name?: string; profile?: { full_name?: string } }
}

interface Dependency {
  id: string
  depends_on_task_id: string
  type: string
}

export default function TaskDetailPage() {
  const t = useTranslations('hr')
  const params = useParams()
  const id = params.id as string
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [checklists, setChecklists] = useState<ChecklistItem[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [watchers, setWatchers] = useState<Watcher[]>([])
  const [dependencies, setDependencies] = useState<Dependency[]>([])
  const [assignees, setAssignees] = useState<any[]>([])
  const [labels, setLabels] = useState<any[]>([])

  const [newComment, setNewComment] = useState('')
  const [newChecklist, setNewChecklist] = useState('')
  const [timeHours, setTimeHours] = useState('')
  const [timeDesc, setTimeDesc] = useState('')


  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const res = await fetch(`/api/tasks/${id}`)
        if (res.ok) {
          const d = await res.json()
          const data = d.data || d
          if (!ignore) {
            setTask(data)
            setAssignees(data.assignees || [])
            setLabels(data.labels || [])
            setChecklists(data.checklists || [])
            setComments(data.comments || [])
            setAttachments(data.attachments || [])
            setWatchers(data.watchers || [])
            setDependencies(data.dependencies || [])
          }
        }
      } catch {} finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [id])


  const toggleChecklist = async (itemId: string, is_completed: boolean) => {
    const res = await fetch(`/api/tasks/${id}/checklist/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed: !is_completed }),
    })
    if (res.ok) {
      setChecklists(prev => prev.map(c => c.id === itemId ? { ...c, is_completed: !is_completed } : c))
    }
  }

  const addChecklist = async () => {
    if (!newChecklist.trim()) return
    const res = await fetch(`/api/tasks/${id}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newChecklist }),
    })
    if (res.ok) {
      const data = await res.json()
      setChecklists(prev => [...prev, data.data || data])
      setNewChecklist('')
    }
  }

  const addComment = async () => {
    if (!newComment.trim()) return
    const res = await fetch(`/api/tasks/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment }),
    })
    if (res.ok) {
      const data = await res.json()
      setComments(prev => [...prev, data.data || data])
      setNewComment('')
    }
  }

  const logTime = async () => {
    if (!timeHours) return
    const res = await fetch(`/api/work-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: id, hours: parseFloat(timeHours), description: timeDesc, log_date: new Date().toISOString() }),
    })
    if (res.ok) {
      setTimeHours('')
      setTimeDesc('')
    }
  }

  const priorityColors: Record<string, string> = {
    low: 'text-gray-500', medium: 'text-blue-600', high: 'text-orange-600', urgent: 'text-red-600',
  }
  const statusColors: Record<string, string> = {
    todo: 'bg-gray-100 text-gray-800', in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-yellow-100 text-yellow-800', done: 'bg-green-100 text-green-800',
    blocked: 'bg-red-100 text-red-800',
  }

  const getAssigneeName = (a: any) => {
    const emp = a.employee || a
    return emp?.profile?.full_name || `${emp?.first_name || ''} ${emp?.last_name || ''}`.trim() || t('common.unnamed')
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-96 bg-muted rounded" /></div>
  if (!task) return <EmptyState title={t('tasks_detail.not_found')} />

  return (
    <div>
      <PageHeader
        title={task.title}
        actions={
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status] || ''}`}>
            {task.status?.replace(/_/g, ' ')}
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {task.description && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-2">{t('common.description')}</h3>
              <p className="text-sm whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">{t('tasks_detail.checklist', { done: checklists.filter(c => c.is_completed).length, total: checklists.length })}</h3>
            <div className="space-y-2 mb-3">
              {checklists.map(item => (
                <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.is_completed}
                    onChange={() => toggleChecklist(item.id, item.is_completed)}
                    className="rounded"
                  />
                  <span className={item.is_completed ? 'line-through text-muted-foreground' : ''}>{item.content}</span>
                </label>
              ))}
              {checklists.length === 0 && <p className="text-sm text-muted-foreground">{t('tasks_detail.no_checklist_items')}</p>}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder={t('tasks_detail.add_checklist_placeholder')} value={newChecklist} onChange={e => setNewChecklist(e.target.value)} className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm" />
              <button onClick={addChecklist} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t('common.add')}</button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">{t('tasks_detail.comments')}</h3>
            <div className="space-y-3 mb-3 max-h-64 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="border-b pb-2 last:border-b-0">
                  <p className="text-sm">{c.content}</p>
                  <p className="text-xs text-muted-foreground">{c.author_name || t('common.user')} &middot; {new Date(c.created_at).toLocaleString()}</p>
                </div>
              ))}
              {comments.length === 0 && <p className="text-sm text-muted-foreground">{t('tasks_detail.no_comments')}</p>}
            </div>
            <div className="flex gap-2">
              <textarea rows={2} placeholder={t('tasks_detail.comment_placeholder')} value={newComment} onChange={e => setNewComment(e.target.value)} className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm" />
              <button onClick={addComment} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 self-end">{t('tasks_detail.post')}</button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">{t('tasks_detail.attachments')}</h3>
            {attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('tasks_detail.no_attachments')}</p>
            ) : (
              <div className="space-y-2">
                {attachments.map(a => (
                  <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    {a.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">{t('tasks_detail.details')}</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('common.status')}</dt><dd className="capitalize">{task.status?.replace(/_/g, ' ')}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('common.priority')}</dt><dd className={`capitalize font-medium ${priorityColors[task.priority] || ''}`}>{task.priority}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('common.due_date')}</dt><dd>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('fields.est_hours')}</dt><dd>{task.estimated_hours || '-'}</dd></div>
            </dl>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">{t('tasks_detail.assignees')}</h3>
            {assignees.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('tasks_detail.no_assignees')}</p>
            ) : (
              <div className="space-y-2">
                {assignees.map((a: any) => (
                  <div key={a.id} className="flex items-center gap-2 text-sm">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium">
                      {getAssigneeName(a).charAt(0).toUpperCase()}
                    </div>
                    <span>{getAssigneeName(a)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {labels.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-3">{t('tasks_detail.labels')}</h3>
              <div className="flex flex-wrap gap-1.5">
                {labels.map((l: any) => (
                  <span key={l.id} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {l.name || l}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">{t('tasks_detail.time_tracking')}</h3>
            <div className="flex gap-2 mb-2">
              <input type="number" placeholder={t('common.hours')} value={timeHours} onChange={e => setTimeHours(e.target.value)} className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm" min="0" step="0.5" />
              <button onClick={logTime} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t('tasks_detail.log')}</button>
            </div>
            <input type="text" placeholder="Description" value={timeDesc} onChange={e => setTimeDesc(e.target.value)} className="w-full rounded-md border bg-background px-3 py-1.5 text-sm" />
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">{t('tasks_detail.watchers')}</h3>
            {watchers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('tasks_detail.no_watchers')}</p>
            ) : (
              <div className="space-y-2">
                {watchers.map((w: any) => (
                  <div key={w.id} className="text-sm">{getAssigneeName(w)}</div>
                ))}
              </div>
            )}
          </div>

          {dependencies.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-3">{t('tasks_detail.dependencies')}</h3>
              <div className="space-y-1 text-sm">
                {dependencies.map((d: any) => (
                  <div key={d.id}>
                    <Link href={`/tasks/${d.depends_on_task_id}`} className="text-primary hover:underline">
                      {t('tasks_detail.task_ref', { id: d.depends_on_task_id?.slice(0, 8) })}
                    </Link>
                    <span className="text-muted-foreground ml-1">({d.type})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
