'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'

export default function EditDealPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', value: '', probability: '', stage: 'new', expected_close_date: '', owner_id: '', notes: '' })

  useEffect(() => {
    fetch(`/api/crm/deals/${id}`)
      .then(r => r.json())
      .then(d => {
        const deal = d.data || d
        setForm({
          name: deal.name || '',
          value: deal.value?.toString() || '',
          probability: deal.probability?.toString() || '',
          stage: deal.stage || 'new',
          expected_close_date: deal.expected_close_date ? deal.expected_close_date.slice(0, 10) : '',
          owner_id: deal.owner_id || '',
          notes: deal.notes || '',
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body: Record<string, any> = { name: form.name, stage: form.stage }
      if (form.value) body.value = parseFloat(form.value)
      if (form.probability) body.probability = parseInt(form.probability)
      if (form.expected_close_date) body.expected_close_date = new Date(form.expected_close_date).toISOString()
      if (form.owner_id) body.owner_id = form.owner_id
      if (form.notes !== undefined) body.notes = form.notes
      const res = await fetch(`/api/crm/deals/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) router.push(`/crm/deals/${id}`)
    } finally { setSubmitting(false) }
  }

  const u = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>

  return (
    <div>
      <PageHeader title="Edit Deal" description="Update deal information" />
      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Deal Name *</label><input type="text" required value={form.name} onChange={e => u('name', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Value ($)</label><input type="number" min="0" step="0.01" value={form.value} onChange={e => u('value', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Probability (%)</label><input type="number" min="0" max="100" value={form.probability} onChange={e => u('probability', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stage</label>
              <select value={form.stage} onChange={e => u('stage', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="demo_scheduled">Demo Scheduled</option>
                <option value="proposal_sent">Proposal Sent</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Expected Close Date</label><input type="date" value={form.expected_close_date} onChange={e => u('expected_close_date', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Owner ID</label><input type="text" value={form.owner_id} onChange={e => u('owner_id', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Notes</label><textarea rows={3} value={form.notes} onChange={e => u('notes', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" onClick={() => router.back()} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
