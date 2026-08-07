'use client'

import { useTranslations } from 'next-intl'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PageHeader } from '@/shared/components/page-header'

export default function NewCompanyPage() {
  const router = useRouter()
  const t = useTranslations('crm')
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
        toast.success(t('company_created'))
        router.push(`/crm/companies/${data.data?.id || data.id}`)
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || t('company_failed'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div>
      <PageHeader title={t('company_new_title')} description={t('company_new_description')} />
      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('company_name')} *</label>
            <input type="text" required value={form.name} onChange={e => update('name', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('company_industry')}</label>
              <input type="text" value={form.industry} onChange={e => update('industry', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('company_website')}</label>
              <input type="text" value={form.website} onChange={e => update('website', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('company_phone')}</label>
              <input type="text" value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('company_email')}</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('company_address')}</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder={t('company_street')} value={form.address_street} onChange={e => update('address_street', e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input type="text" placeholder={t('company_city')} value={form.address_city} onChange={e => update('address_city', e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input type="text" placeholder={t('company_state')} value={form.address_state} onChange={e => update('address_state', e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input type="text" placeholder={t('company_zip')} value={form.address_zip} onChange={e => update('address_zip', e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input type="text" placeholder={t('company_country')} value={form.address_country} onChange={e => update('address_country', e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm col-span-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('company_notes')}</label>
            <textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {submitting ? t('common_creating') : t('company_create')}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">{t('common_cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
