'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'

export default function EditEmployeePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [designations, setDesignations] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    department_id: '', designation_id: '', position: '',
    hire_date: '', employment_status: 'active', bio: '',
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/employees/${id}`),
      fetch('/api/departments?limit=100'),
      fetch('/api/designations?limit=100'),
    ]).then(async ([empRes, depRes, desRes]) => {
      if (empRes.ok) {
        const empData = await empRes.json()
        const emp = empData.data || empData
        const e = emp.employee || emp
        const profileName = e.profile?.full_name || ''
        const nameParts = profileName.split(' ')
        setForm({
          first_name: nameParts.slice(0, -1).join(' ') || nameParts[0] || '',
          last_name: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
          email: e.profile?.email || '',
          phone: e.profile?.phone || '',
          department_id: e.department_id || '',
          designation_id: e.designation_id || '',
          position: e.position || '',
          hire_date: e.hire_date ? e.hire_date.split('T')[0] : '',
          employment_status: e.employment_status || 'active',
          bio: e.bio || '',
        })
      }
      if (depRes.ok) {
        const d = await depRes.json()
        setDepartments(d.data || d || [])
      }
      if (desRes.ok) {
        const d = await desRes.json()
        setDesignations(d.data || d || [])
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) router.push(`/employees/${id}`)
    } finally {
      setSubmitting(false)
    }
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-96 bg-muted rounded" /></div>

  return (
    <div>
      <PageHeader title="Edit Employee" description="Update employee information" />
      <div className="max-w-2xl rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input type="text" required value={form.first_name} onChange={e => update('first_name', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input type="text" required value={form.last_name} onChange={e => update('last_name', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input type="text" required value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <select value={form.department_id} onChange={e => update('department_id', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="">Select department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Designation</label>
              <select value={form.designation_id} onChange={e => update('designation_id', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="">Select designation</option>
                {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Position *</label>
              <input type="text" required value={form.position} onChange={e => update('position', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hire Date</label>
              <input type="date" value={form.hire_date} onChange={e => update('hire_date', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Employment Status *</label>
            <select value={form.employment_status} onChange={e => update('employment_status', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea rows={4} value={form.bio} onChange={e => update('bio', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
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
