'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PageHeader } from '@/shared/components/page-header'

export default function NewProjectPage() {
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
        toast.success('Project created')
        router.push(`/projects/${data.data?.id || data.id}`)
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div>
      <PageHeader title="New Project" description="Create a new project" />
      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name *</label>
            <input type="text" required value={form.name} onChange={e => update('name', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => update('description', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Client Name</label>
              <input type="text" value={form.client_name} onChange={e => update('client_name', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input type="color" value={form.color} onChange={e => update('color', e.target.value)} className="w-full h-9 rounded-md border bg-background px-1" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.status} onChange={e => update('status', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select value={form.priority} onChange={e => update('priority', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => update('start_date', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" value={form.end_date} onChange={e => update('end_date', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Budget ($)</label>
            <input type="number" min="0" step="0.01" value={form.budget} onChange={e => update('budget', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
