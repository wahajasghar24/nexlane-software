'use client'
import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'

interface TimeOffRow {
  id: string
  type: string
  start_date: string
  end_date: string
  days: number
  status: string
  reason: string | null
  employee: { employee_code: string; full_name: string } | null
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-muted text-muted-foreground',
}

export default function TimeOffPage() {
  const t = useTranslations('hr')
  const [rows, setRows] = useState<TimeOffRow[]>([])
  const [type, setType] = useState('annual')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const res = await fetch('/api/hr/time-off?limit=50')
      const data = await res.json()
      setRows(data.data?.data ?? [])
    } catch { setRows([]) }
  }

  useEffect(() => {
    const boot = async () => {
      try {
        const res = await fetch('/api/hr/time-off?limit=50')
        const data = await res.json()
        setRows(data.data?.data ?? [])
      } catch { setRows([]) }
    }
    boot()
  }, [])

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/hr/time-off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, start_date: start, end_date: end, reason: reason || null }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || t('common.failed'))
      else { setStart(''); setEnd(''); setReason(''); await load() }
    } catch { setError(t('common.network_error')) }
    setBusy(false)
  }

  const decide = async (id: string, decision: string) => {
    const res = await fetch(`/api/hr/time-off/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    })
    if (res.ok) await load()
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('time_off.title')} description={t('time_off.description')} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="rounded-lg border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm">
            <option value="annual">{t('time_off.annual')}</option>
            <option value="sick">{t('time_off.sick')}</option>
            <option value="unpaid">{t('time_off.unpaid')}</option>
          </select>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm" />
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm" />
          <button onClick={submit} disabled={busy || !start || !end} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40">
            {t('time_off.request')}
          </button>
        </div>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('time_off.reason_placeholder')} className="mt-3 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
      </div>
      {rows.length === 0 ? (
        <EmptyState title={t('time_off.no_requests')} description={t('time_off.no_requests_desc')} />
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3">{t('fields.employee')}</th>
                <th className="px-4 py-3">{t('time_off.type')}</th>
                <th className="px-4 py-3">{t('time_off.dates')}</th>
                <th className="px-4 py-3">{t('time_off.days')}</th>
                <th className="px-4 py-3">{t('common.status')}</th>
                <th className="px-4 py-3">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{r.employee?.full_name || r.employee?.employee_code || '—'}</td>
                  <td className="px-4 py-3 capitalize">{r.type}</td>
                  <td className="px-4 py-3">{r.start_date} → {r.end_date}</td>
                  <td className="px-4 py-3">{r.days}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusColor[r.status]}`}>{r.status}</span></td>
                  <td className="px-4 py-3">
                    {r.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => decide(r.id, 'approved')} className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700">{t('common.approve')}</button>
                        <button onClick={() => decide(r.id, 'rejected')} className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700">{t('common.reject')}</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}