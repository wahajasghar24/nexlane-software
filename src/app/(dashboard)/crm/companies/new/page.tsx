'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'

export default function NewCompanyPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', industry: '', website: '', phone: '', email: '',
    address_street: '', address_city: '', address_state: '', address_zip: '', address_country: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body: Record<string, any> = { name: form.name }
      if (form.industry) body.industry = form.industry
      if (form.website) body.website = form.website
      if (form.phone) body.phone = form.phone
      if (form.email) body.email = form.email
      if (form.notes) body.notes = form.notes
      const addr: Record<string, string> = {}
      if (form.address_street) addr.street = form.address_street
      if (form.address_city) addr.city = form.address_city
      if (form.address_state) addr.state = form.address_state
      if (form.address_zip) addr.zip = form.address_zip
      if (form.address_country) addr.country = form.address_country
      if (Object.keys(addr).length) body.address = addr

      const res = await fetch('/api/crm/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/crm/companies/${data.data?.id || data.id}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div>
      <PageHeader title="New Company" description="Add a new company" />
      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name *</label>
            <input type="text" required value={form.name} onChange={e => update('name', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Industry</label>
              <input type="text" value={form.industry} onChange={e => update('industry', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input type="text" value={form.website} onChange={e => update('website', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Street" value={form.address_street} onChange={e => update('address_street', e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input type="text" placeholder="City" value={form.address_city} onChange={e => update('address_city', e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input type="text" placeholder="State" value={form.address_state} onChange={e => update('address_state', e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input type="text" placeholder="ZIP" value={form.address_zip} onChange={e => update('address_zip', e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input type="text" placeholder="Country" value={form.address_country} onChange={e => update('address_country', e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm col-span-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Company'}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
