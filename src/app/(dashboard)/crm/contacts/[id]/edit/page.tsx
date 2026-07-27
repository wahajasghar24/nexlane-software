'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'

export default function EditContactPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', whatsapp: '', designation: '', crm_company_id: '', is_primary: false, notes: '' })

  useEffect(() => {
    fetch(`/api/crm/contacts/${id}`)
      .then(r => r.json())
      .then(d => {
        const c = d.data || d
        setForm({ name: c.name || '', email: c.email || '', phone: c.phone || '', whatsapp: c.whatsapp || '', designation: c.designation || '', crm_company_id: c.crm_company_id || '', is_primary: c.is_primary || false, notes: c.notes || '' })
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body: Record<string, any> = { name: form.name }
      if (form.email !== undefined) body.email = form.email
      if (form.phone !== undefined) body.phone = form.phone
      if (form.whatsapp !== undefined) body.whatsapp = form.whatsapp
      if (form.designation !== undefined) body.designation = form.designation
      if (form.crm_company_id !== undefined) body.crm_company_id = form.crm_company_id
      if (form.notes !== undefined) body.notes = form.notes
      body.is_primary = form.is_primary
      const res = await fetch(`/api/crm/contacts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) router.push(`/crm/contacts/${id}`)
    } finally { setSubmitting(false) }
  }

  const u = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>

  return (
    <div>
      <PageHeader title="Edit Contact" description="Update contact information" />
      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input type="text" required value={form.name} onChange={e => u('name', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.email} onChange={e => u('email', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Phone</label><input type="text" value={form.phone} onChange={e => u('phone', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">WhatsApp</label><input type="text" value={form.whatsapp} onChange={e => u('whatsapp', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Designation</label><input type="text" value={form.designation} onChange={e => u('designation', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Company ID</label><input type="text" value={form.crm_company_id} onChange={e => u('crm_company_id', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.is_primary} onChange={e => setForm(p => ({ ...p, is_primary: e.target.checked }))} /><label className="text-sm font-medium">Primary Contact</label></div>
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
