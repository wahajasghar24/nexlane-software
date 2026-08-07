'use client'

import { useTranslations } from 'next-intl'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PageHeader } from '@/shared/components/page-header'

export default function NewDealPage() {
  const router = useRouter()
  const t = useTranslations('crm')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', value: '', probability: '', stage: 'new',
    expected_close_date: '', owner_id: '', lead_id: '', crm_company_id: '', notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body: Record<string, any> = {
        name: form.name,
        stage: form.stage,
      }
      if (form.value) body.value = parseFloat(form.value)
      if (form.probability) body.probability = parseInt(form.probability)
      if (form.expected_close_date) body.expected_close_date = new Date(form.expected_close_date).toISOString()
      if (form.owner_id) body.owner_id = form.owner_id
      if (form.lead_id) body.lead_id = form.lead_id
      if (form.crm_company_id) body.crm_company_id = form.crm_company_id
      if (form.notes) body.notes = form.notes

      const res = await fetch('/api/crm/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(t('deal_created'))
        router.push(`/crm/deals/${data.data?.id || data.id}`)
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || t('deal_failed'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div>
      <PageHeader title={t('deal_new_title')} description={t('deal_new_description')} />
      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('deal_name')} *</label>
            <input type="text" required value={form.name} onChange={e => update('name', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('deal_value')}</label>
              <input type="number" min="0" step="0.01" value={form.value} onChange={e => update('value', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('deal_probability')}</label>
              <input type="number" min="0" max="100" value={form.probability} onChange={e => update('probability', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('deal_stage')}</label>
              <select value={form.stage} onChange={e => update('stage', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="demo_scheduled">Demo Scheduled</option>
                <option value="proposal_sent">Proposal Sent</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('deal_expected_close')}</label>
              <input type="date" value={form.expected_close_date} onChange={e => update('expected_close_date', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('deal_owner_id')}</label>
              <input type="text" value={form.owner_id} onChange={e => update('owner_id', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('deal_lead_id')}</label>
              <input type="text" value={form.lead_id} onChange={e => update('lead_id', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('deal_company_id')}</label>
            <input type="text" value={form.crm_company_id} onChange={e => update('crm_company_id', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('deal_notes')}</label>
            <textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {submitting ? t('common_creating') : t('deal_create')}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">{t('common_cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
