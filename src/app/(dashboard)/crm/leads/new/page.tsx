'use client'

import { useTranslations } from 'next-intl'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PageHeader } from '@/shared/components/page-header'
import { cleanFormPayload } from '@/core/utils/payload'

export default function NewLeadPage() {
  const router = useRouter()
  const t = useTranslations('crm')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', name: '', email: '', phone: '', company: '', website: '',
    industry: '', source: '', status: 'new', priority: 'medium',
    estimated_value: '', notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body: Record<string, any> = {
        title: form.title,
        name: form.name,
        status: form.status,
        priority: form.priority,
      }
      if (form.email) body.email = form.email
      if (form.phone) body.phone = form.phone
      if (form.company) body.company = form.company
      if (form.website) body.website = form.website
      if (form.industry) body.industry = form.industry
      if (form.source) body.source = form.source
      if (form.estimated_value) body.estimated_value = parseFloat(form.estimated_value)
      if (form.notes) body.notes = form.notes

      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanFormPayload(body)),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(t('lead_created'))
        router.push(`/crm/leads/${data.data?.id || data.id}`)
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || t('lead_failed'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div>
      <PageHeader title={t('lead_new_title')} description={t('lead_new_description')} />
      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('lead_title')} *</label>
              <input type="text" required value={form.title} onChange={e => update('title', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('lead_contact_name')} *</label>
              <input type="text" required value={form.name} onChange={e => update('name', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('lead_email')}</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('lead_phone')}</label>
              <input type="text" value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('lead_company')}</label>
              <input type="text" value={form.company} onChange={e => update('company', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('lead_website')}</label>
              <input type="text" value={form.website} onChange={e => update('website', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('lead_industry')}</label>
              <input type="text" value={form.industry} onChange={e => update('industry', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('lead_source')}</label>
              <select value={form.source} onChange={e => update('source', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="">{t('lead_select_source')}</option>
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
              <label className="block text-sm font-medium mb-1">{t('lead_status')}</label>
              <select value={form.status} onChange={e => update('status', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="unqualified">Unqualified</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('lead_priority')}</label>
              <select value={form.priority} onChange={e => update('priority', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('lead_estimated_value')}</label>
            <input type="number" min="0" step="0.01" value={form.estimated_value} onChange={e => update('estimated_value', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('lead_notes')}</label>
            <textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {submitting ? t('common_creating') : t('lead_create')}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">{t('common_cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
