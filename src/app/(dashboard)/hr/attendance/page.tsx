'use client'
import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'

interface AttendanceRow {
  id: string
  employee_id: string
  work_date: string
  check_in: string | null
  check_out: string | null
  status: string
  employee: { employee_code: string; full_name: string } | null
}

export default function AttendancePage() {
  const t = useTranslations('hr')
  const [rows, setRows] = useState<AttendanceRow[]>([])
  const [myStatus, setMyStatus] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [listRes, myRes] = await Promise.all([
        fetch('/api/hr/attendance?limit=50'),
        fetch('/api/hr/attendance?limit=1'),
      ])
      const list = await listRes.json()
      setRows(list.data?.data ?? [])
      const me = await myRes.json()
      const today = new Date().toISOString().slice(0, 10)
      const mine = (me.data?.data ?? []).filter((r: AttendanceRow) => r.work_date === today)
      setMyStatus(mine.length ? (mine[0].check_out ? 'out' : 'in') : 'none')
    } catch {
      setRows([])
    }
  }

  useEffect(() => {
    const boot = async () => {
      try {
        const [listRes, myRes] = await Promise.all([
          fetch('/api/hr/attendance?limit=50'),
          fetch('/api/hr/attendance?limit=1'),
        ])
        const list = await listRes.json()
        setRows(list.data?.data ?? [])
        const me = await myRes.json()
        const today = new Date().toISOString().slice(0, 10)
        const mine = (me.data?.data ?? []).filter((r: AttendanceRow) => r.work_date === today)
        setMyStatus(mine.length ? (mine[0].check_out ? 'out' : 'in') : 'none')
      } catch {
        setRows([])
      }
    }
    boot()
  }, [])

  const clock = async (action: 'in' | 'out') => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(action === 'in' ? '/api/hr/attendance' : '/api/hr/attendance/clock-out', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) setError(data.error || t('common.failed'))
      else await load()
    } catch { setError(t('common.network_error')) }
    setBusy(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('attendance.title')}
        description={t('attendance.description')}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => clock('in')}
              disabled={busy || myStatus !== 'none'}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
            >
              {t('attendance.clock_in')}
            </button>
            <button
              onClick={() => clock('out')}
              disabled={busy || myStatus !== 'in'}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-40"
            >
              {t('attendance.clock_out')}
            </button>
          </div>
        }
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {rows.length === 0 ? (
        <EmptyState title={t('attendance.no_records')} description={t('attendance.no_records_desc')} />
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3">{t('fields.employee')}</th>
                <th className="px-4 py-3">{t('common.date')}</th>
                <th className="px-4 py-3">{t('attendance.check_in')}</th>
                <th className="px-4 py-3">{t('attendance.check_out')}</th>
                <th className="px-4 py-3">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{r.employee?.full_name || r.employee?.employee_code || '—'}</td>
                  <td className="px-4 py-3">{r.work_date}</td>
                  <td className="px-4 py-3">{r.check_in ? new Date(r.check_in).toLocaleTimeString() : '—'}</td>
                  <td className="px-4 py-3">{r.check_out ? new Date(r.check_out).toLocaleTimeString() : '—'}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}