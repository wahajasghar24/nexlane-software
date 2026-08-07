'use client'
import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PageHeader } from '@/shared/components/page-header'
import { cleanFormPayload } from '@/core/utils/payload'

export default function NewTaskPage() {
  const t = useTranslations('hr')
  const router = useRouter()
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', project_id: '', module_id: '',
    priority: 'medium', status: 'todo',
    due_date: '', estimated_hours: '', labels: '',
    assignee_ids: [] as string[],
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/projects?limit=100').then(r => r.json()),
      fetch('/api/employees?limit=200').then(r => r.json()),
    ]).then(([pData, eData]) => {
      setProjects(pData.data || pData || [])
      setEmployees(eData.data || eData || [])
    }).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body: Record<string, any> = {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        status: form.status,
        assigned_to: form.assignee_ids,
        labels: form.labels ? form.labels.split(',').map(l => l.trim()).filter(Boolean) : [],
      }
      if (form.project_id) body.project_id = form.project_id
      if (form.module_id) body.module_id = form.module_id
      if (form.due_date) body.due_date = new Date(form.due_date).toISOString()
      if (form.estimated_hours) body.estimated_hours = parseFloat(form.estimated_hours)

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanFormPayload(body)),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(t('tasks_new.created'))
        router.push(`/tasks/${data.data?.id || data.id}`)
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || t('common.failed'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const toggleAssignee = (id: string) => {
    setForm(prev => ({
      ...prev,
      assignee_ids: prev.assignee_ids.includes(id)
        ? prev.assignee_ids.filter(a => a !== id)
        : [...prev.assignee_ids, id],
    }))
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const [modules, setModules] = useState<{ id: string; name: string }[]>([])
  useEffect(() => {
    if (!form.project_id) return
      fetch(`/api/projects/${form.project_id}`).then(r => r.json()).then(d => {
        const data = d.data || d
        setModules(data.modules || [])
      }).catch(() => {})
  }, [form.project_id])

  const getDisplayName = (e: any) => e.profile?.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim() || e.name || t('common.unnamed')

  return (
    <div>
      <PageHeader title={t('tasks_new.title')} description={t('tasks_new.description')} />
      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('common.title')} *</label>
            <input type="text" required value={form.title} onChange={e => update('title', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('common.description')}</label>
            <textarea rows={3} value={form.description} onChange={e => update('description', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('fields.project')}</label>
              <select value={form.project_id} onChange={e => { update('project_id', e.target.value); setModules([]) }} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="">{t('fields.no_project')}</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('fields.module')}</label>
              <select value={form.module_id} onChange={e => update('module_id', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" disabled={!form.project_id}>
                <option value="">{t('fields.no_module')}</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('common.priority')}</label>
              <select value={form.priority} onChange={e => update('priority', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="low">{t('priority.low')}</option>
                <option value="medium">{t('priority.medium')}</option>
                <option value="high">{t('priority.high')}</option>
                <option value="urgent">{t('priority.urgent')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('common.status')}</label>
              <select value={form.status} onChange={e => update('status', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="todo">{t('status.todo')}</option>
                <option value="in_progress">{t('status.in_progress')}</option>
                <option value="review">{t('status.review')}</option>
                <option value="done">{t('status.done')}</option>
                <option value="blocked">{t('status.blocked')}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('common.due_date')}</label>
              <input type="date" value={form.due_date} onChange={e => update('due_date', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('fields.est_hours')}</label>
              <input type="number" min="0" step="0.5" value={form.estimated_hours} onChange={e => update('estimated_hours', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('fields.labels')}</label>
            <input type="text" placeholder={t('fields.labels_placeholder')} value={form.labels} onChange={e => update('labels', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('fields.assignees')}</label>
            <div className="max-h-40 overflow-y-auto rounded-md border p-2 space-y-1">
              {employees.map((emp: any) => (
                <label key={emp.id} className="flex items-center gap-2 text-sm p-1 hover:bg-accent rounded cursor-pointer">
                  <input type="checkbox" checked={form.assignee_ids.includes(emp.id)} onChange={() => toggleAssignee(emp.id)} className="rounded" />
                  {getDisplayName(emp)}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {submitting ? t('common.creating') : t('tasks_new.create')}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">{t('common.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
