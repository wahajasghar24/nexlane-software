'use client'

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
      if (!res.ok) setError(data.error || 'Failed')
      else { setStart(''); setEnd(''); setReason(''); await load() }
    } catch { setError('Network error') }
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
      <PageHeader title="Time Off" description="Request and manage leave" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="rounded-lg border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm">
            <option value="annual">Annual</option>
            <option value="sick">Sick</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm" />
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm" />
          <button onClick={submit} disabled={busy || !start || !end} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40">
            Request
          </button>
        </div>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" className="mt-3 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No time-off requests" description="Request leave using the form above." />
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
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
                        <button onClick={() => decide(r.id, 'approved')} className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700">Approve</button>
                        <button onClick={() => decide(r.id, 'rejected')} className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700">Reject</button>
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