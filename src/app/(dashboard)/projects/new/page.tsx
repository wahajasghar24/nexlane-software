'use client'
import { useTranslations } from 'next-intl'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PageHeader } from '@/shared/components/page-header'

export default function NewProjectPage() {
  const t = useTranslations('hr')
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', client_name: '',
    status: 'planning', priority: 'medium',
    start_date: '', end_date: '', budget: '', color: '#6366f1',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body: Record<string, any> = {
        name: form.name,
        description: form.description || undefined,
        client_name: form.client_name || undefined,
        status: form.status,
        priority: form.priority,
        color: form.color,
      }
      if (form.start_date) body.start_date = new Date(form.start_date).toISOString()
      if (form.end_date) body.end_date = new Date(form.end_date).toISOString()
      if (form.budget) body.budget = parseFloat(form.budget)

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(t('projects_new.created'))
        router.push(`/projects/${data.data?.id || data.id}`)
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || t('common.failed'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div>
      <PageHeader title={t('projects_new.title')} description={t('projects_new.description')} />
      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('fields.project_name')} *</label>
            <input type="text" required value={form.name} onChange={e => update('name', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('common.description')}</label>
            <textarea rows={3} value={form.description} onChange={e => update('description', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('fields.client_name')}</label>
              <input type="text" value={form.client_name} onChange={e => update('client_name', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('fields.color')}</label>
              <input type="color" value={form.color} onChange={e => update('color', e.target.value)} className="w-full h-9 rounded-md border bg-background px-1" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('common.status')}</label>
              <select value={form.status} onChange={e => update('status', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="planning">{t('status.planning')}</option>
                <option value="active">{t('status.active')}</option>
                <option value="on_hold">{t('status.on_hold')}</option>
                <option value="completed">{t('status.completed')}</option>
                <option value="cancelled">{t('status.cancelled')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('common.priority')}</label>
              <select value={form.priority} onChange={e => update('priority', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="low">{t('priority.low')}</option>
                <option value="medium">{t('priority.medium')}</option>
                <option value="high">{t('priority.high')}</option>
                <option value="urgent">{t('priority.urgent')}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('fields.start_date')}</label>
              <input type="date" value={form.start_date} onChange={e => update('start_date', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('fields.end_date')}</label>
              <input type="date" value={form.end_date} onChange={e => update('end_date', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('fields.budget')}</label>
            <input type="number" min="0" step="0.01" value={form.budget} onChange={e => update('budget', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {submitting ? t('common.creating') : t('projects_new.create')}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">{t('common.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
