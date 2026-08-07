'use client'
import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'

export default function WorkLogsPage() {
  const t = useTranslations('hr')
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])
  const [employeeFilter, setEmployeeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [employees, setEmployees] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    employee_id: '', task_id: '', hours: '', description: '', status: 'draft', log_date: currentDate,
  })

  const load = () => {
    const params = new URLSearchParams({ limit: '50' })
    if (currentDate) {
      params.set('date_from', new Date(currentDate).toISOString())
      params.set('date_to', new Date(currentDate + 'T23:59:59').toISOString())
    }
    if (employeeFilter) params.set('employee_id', employeeFilter)
    if (statusFilter) params.set('status', statusFilter)

    Promise.all([
      fetch(`/api/work-logs?${params}`).then(r => r.json()),
      fetch('/api/employees?limit=200').then(r => r.json()),
    ]).then(([wlData, empData]) => {
      setLogs(Array.isArray(wlData.data) ? wlData.data : (wlData.data?.data || []))
      setEmployees(Array.isArray(empData.data) ? empData.data : (empData.data?.data || []))
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [currentDate, employeeFilter, statusFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body = {
        employee_id: form.employee_id,
        task_id: form.task_id || undefined,
        hours: parseFloat(form.hours),
        description: form.description || undefined,
        status: form.status,
        log_date: new Date(form.log_date || currentDate).toISOString(),
      }
      const res = await fetch('/api/work-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setShowModal(false)
        setForm({ employee_id: '', task_id: '', hours: '', description: '', status: 'draft', log_date: currentDate })
        load()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const prevDay = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 1)
    setCurrentDate(d.toISOString().split('T')[0])
  }

  const nextDay = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 1)
    setCurrentDate(d.toISOString().split('T')[0])
  }

  const getDisplayName = (e: any) => e.profile?.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim() || t('common.unnamed')

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/work-logs/${id}/${action}`, { method: 'POST' })
    if (res.ok) load()
  }

  const totalHours = logs.reduce((sum, l) => sum + (l.hours || 0), 0)

  return (
    <div>
      <PageHeader
        title={t('work_logs.title')}
        description={t('work_logs.description')}
        actions={
          <button onClick={() => { setForm(prev => ({ ...prev, log_date: currentDate })); setShowModal(true) }} className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {t('work_logs.log_work')}
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 rounded-lg border bg-card p-1 self-start">
          <button onClick={prevDay} className="rounded-md px-2 py-1 text-sm hover:bg-accent">&larr;</button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {new Date(currentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button onClick={nextDay} className="rounded-md px-2 py-1 text-sm hover:bg-accent">&rarr;</button>
        </div>
        <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto">
          <option value="">{t('common.all_employees')}</option>
          {employees.map((emp: any) => (
            <option key={emp.id} value={emp.id}>{getDisplayName(emp)}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto">
          <option value="">{t('common.all_statuses')}</option>
          <option value="draft">{t('status.draft')}</option>
          <option value="submitted">{t('status.submitted')}</option>
          <option value="approved">{t('status.approved')}</option>
          <option value="rejected">{t('status.rejected')}</option>
        </select>
        <span className="text-sm text-muted-foreground sm:ml-auto">{t('work_logs.total', { hours: totalHours })}</span>
      </div>

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="h-5 w-48 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded mt-1" />
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          title={t('work_logs.no_logs')}
          description={t('work_logs.no_logs_desc')}
          action={<button onClick={() => { setForm(prev => ({ ...prev, log_date: currentDate })); setShowModal(true) }} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t('work_logs.log_work')}</button>}
        />
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {logs.map((log: any) => (
              <div key={log.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{log.employee_name || (log.employee ? getDisplayName(log.employee) : 'Unknown')}</p>
                    <p className="text-sm text-muted-foreground">{log.task_title || log.task?.title || '-'}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    log.status === 'approved' ? 'bg-green-100 text-green-800' :
                    log.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    log.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{log.status}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t text-sm">
                  <span className="font-medium">{log.hours}h</span>
                  <span className="text-muted-foreground truncate max-w-[200px]">{log.description || '-'}</span>
                </div>
                {log.status === 'submitted' && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleReview(log.id, 'approve')} className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">{t('common.approve')}</button>
                    <button onClick={() => handleReview(log.id, 'reject')} className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">{t('common.reject')}</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Desktop table view */}
          <div className="rounded-lg border overflow-x-auto hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('fields.employee')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('fields.task')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('common.hours')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('common.description')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('common.status')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="p-3 text-sm font-medium">
                      {log.employee_name || (log.employee ? getDisplayName(log.employee) : 'Unknown')}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{log.task_title || log.task?.title || '-'}</td>
                    <td className="p-3 text-sm font-medium">{log.hours}h</td>
                    <td className="p-3 text-sm text-muted-foreground max-w-[200px] truncate">{log.description || '-'}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        log.status === 'approved' ? 'bg-green-100 text-green-800' :
                        log.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        log.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {log.status === 'submitted' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleReview(log.id, 'approve')} className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">Approve</button>
                          <button onClick={() => handleReview(log.id, 'reject')} className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">{t('work_logs.log_work')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.employee')} *</label>
                <select required value={form.employee_id} onChange={e => setForm(prev => ({ ...prev, employee_id: e.target.value }))} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="">{t('common.select_employee')}</option>
                  {employees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>{getDisplayName(emp)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('common.hours')} *</label>
                <input type="number" required min="0" step="0.5" value={form.hours} onChange={e => setForm(prev => ({ ...prev, hours: e.target.value }))} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('common.description')}</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('common.status')}</label>
                <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="draft">{t('status.draft')}</option>
                  <option value="submitted">{t('status.submitted')}</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {submitting ? t('common.saving') : t('work_logs.log_work')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
