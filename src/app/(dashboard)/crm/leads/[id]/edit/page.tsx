'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'
import { cleanFormPayload } from '@/core/utils/payload'

export default function EditLeadPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', name: '', email: '', phone: '', company: '', website: '',
    industry: '', source: '', status: 'new', priority: 'medium',
    estimated_value: '', notes: '',
  })

  useEffect(() => {
    fetch(`/api/crm/leads/${id}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data || d
        setForm({
          title: data.title || '',
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          company: data.company || '',
          website: data.website || '',
          industry: data.industry || '',
          source: data.source || '',
          status: data.status || 'new',
          priority: data.priority || 'medium',
          estimated_value: data.estimated_value ? String(data.estimated_value) : '',
          notes: data.notes || '',
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body: Record<string, any> = { ...form }
      if (body.estimated_value) body.estimated_value = parseFloat(body.estimated_value)
      else delete body.estimated_value
      if (!body.email) delete body.email
      if (!body.phone) delete body.phone
      if (!body.company) delete body.company
      if (!body.website) delete body.website
      if (!body.industry) delete body.industry
      if (!body.source) delete body.source
      if (!body.notes) delete body.notes

      const res = await fetch(`/api/crm/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanFormPayload(body)),
      })
      if (res.ok) router.push(`/crm/leads/${id}`)
    } finally {
      setSubmitting(false)
    }
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-96 bg-muted rounded" /></div>

  return (
    <div>
      <PageHeader title="Edit Lead" description="Update lead details" />
      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input type="text" required value={form.title} onChange={e => update('title', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Name *</label>
              <input type="text" required value={form.name} onChange={e => update('name', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <input type="text" value={form.company} onChange={e => update('company', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input type="text" value={form.website} onChange={e => update('website', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Industry</label>
              <input type="text" value={form.industry} onChange={e => update('industry', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Source</label>
              <select value={form.source} onChange={e => update('source', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="">Select source</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="cold_call">Cold Call</option>
                <option value="social_media">Social Media</option>
                <option value="email">Email</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.status} onChange={e => update('status', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="unqualified">Unqualified</option>
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
          <div>
            <label className="block text-sm font-medium mb-1">Estimated Value ($)</label>
            <input type="number" min="0" step="0.01" value={form.estimated_value} onChange={e => update('estimated_value', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
