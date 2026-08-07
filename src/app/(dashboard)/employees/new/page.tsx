'use client'
import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PageHeader } from '@/shared/components/page-header'
import { cleanFormPayload } from '@/core/utils/payload'

export default function NewEmployeePage() {
  const t = useTranslations('hr')
  const router = useRouter()
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [designations, setDesignations] = useState<{ id: string; name: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    department_id: '', designation_id: '', position: '',
    hire_date: '', employment_status: 'active', bio: '', password: '',
  })

  useEffect(() => {
    fetch('/api/departments?limit=100').then(r => r.json()).then(d => setDepartments((d?.data) || (Array.isArray(d) ? d : []))).catch(() => {})
    fetch('/api/designations?limit=100').then(r => r.json()).then(d => setDesignations((d?.data) || (Array.isArray(d) ? d : []))).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanFormPayload(form)),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success(t('employees_new.created'))
        router.push(`/employees/${data.data?.id || data.id}`)
      } else {
        const message = data.error || t('employees_new.create_failed')
        setError(message)
        toast.error(message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.something_went_wrong')
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div>
      <PageHeader title={t('employees_new.title')} description={t('employees_new.description')} />
      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('fields.first_name')} *</label>
              <input type="text" required value={form.first_name} onChange={e => update('first_name', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('fields.last_name')} *</label>
              <input type="text" required value={form.last_name} onChange={e => update('last_name', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('fields.email')} *</label>
              <input type="email" required value={form.email} onChange={e => update('email', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('fields.phone')} *</label>
              <input type="text" required value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('fields.department')}</label>
              <select value={form.department_id} onChange={e => update('department_id', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="">{t('common.select_department')}</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('fields.designation')}</label>
              <select value={form.designation_id} onChange={e => update('designation_id', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="">{t('common.select_designation')}</option>
                {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('fields.position')} *</label>
              <input type="text" required value={form.position} onChange={e => update('position', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('fields.hire_date')}</label>
              <input type="date" value={form.hire_date} onChange={e => update('hire_date', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('employees_new.login_password')}</label>
            <input type="text" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Employee apni email + is password se login karega (min 6 chars; khali = random)" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('fields.employment_status')} *</label>
            <select value={form.employment_status} onChange={e => update('employment_status', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('fields.bio')}</label>
            <textarea rows={4} value={form.bio} onChange={e => update('bio', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {submitting ? t('common.creating') : t('employees_new.create')}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">{t('common.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
