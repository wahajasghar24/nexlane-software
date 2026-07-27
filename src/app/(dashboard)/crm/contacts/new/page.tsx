'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'

export default function NewContactPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', whatsapp: '', designation: '', crm_company_id: '', is_primary: false, notes: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body: Record<string, any> = { name: form.name }
      if (form.email) body.email = form.email
      if (form.phone) body.phone = form.phone
      if (form.whatsapp) body.whatsapp = form.whatsapp
      if (form.designation) body.designation = form.designation
      if (form.crm_company_id) body.crm_company_id = form.crm_company_id
      if (form.notes) body.notes = form.notes
      body.is_primary = form.is_primary
      const res = await fetch('/api/crm/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { const d = await res.json(); router.push(`/crm/contacts/${d.data?.id || d.id}`) }
    } finally { setSubmitting(false) }
  }

  const u = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  return (
    <div>
      <PageHeader title="New Contact" description="Create a new contact" />
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
            <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Creating...' : 'Create Contact'}</button>
            <button type="button" onClick={() => router.back()} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
