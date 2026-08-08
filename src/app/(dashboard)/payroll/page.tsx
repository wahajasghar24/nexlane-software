'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'

interface PayslipRow {
  id: string
  employee_id: string
  period_start: string
  period_end: string
  base_salary: number
  allowances: number
  deductions: number
  tax: number
  net_pay: number
  currency: string
  status: string
  employee_name: string
}

export default function PayrollPage() {
  const [rows, setRows] = useState<PayslipRow[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/payroll/payslips?limit=100')
      const data = await res.json()
      setRows(data.data?.data ?? [])
    } catch {
      setRows([])
    }
  }, [])

  useEffect(() => {
    ;(async () => { await load() })()
  }, [load])

  const generate = async () => {
    if (!periodStart || !periodEnd) { setError('Select period start and end'); return }
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/payroll/payslips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period_start: periodStart, period_end: periodEnd }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); return }
      alert(`Generated ${data.data.generated} payslips, skipped ${data.data.skipped}`)
      await load()
    } catch { setError('Network error') }
    setBusy(false)
  }

  const approve = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/payslips/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      if (res.ok) await load()
    } catch { /* noop */ }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Manage payslips and payroll structures"
        actions={
          <div className="flex items-center gap-2">
            <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm" />
            <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm" />
            <button onClick={generate} disabled={busy} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40">
              {busy ? 'Generating…' : 'Generate Payslips'}
            </button>
          </div>
        }
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {rows.length === 0 ? (
        <EmptyState title="No payslips" description="Generate payslips for a period to get started." />
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Base Salary</th>
                <th className="px-4 py-3">Allowances</th>
                <th className="px-4 py-3">Deductions</th>
                <th className="px-4 py-3">Tax</th>
                <th className="px-4 py-3">Net Pay</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{r.employee_name}</td>
                  <td className="px-4 py-3">{r.period_start} → {r.period_end}</td>
                  <td className="px-4 py-3">{r.currency} {Number(r.base_salary).toLocaleString()}</td>
                  <td className="px-4 py-3">{r.currency} {Number(r.allowances).toLocaleString()}</td>
                  <td className="px-4 py-3">{r.currency} {Number(r.deductions).toLocaleString()}</td>
                  <td className="px-4 py-3">{r.currency} {Number(r.tax).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">{r.currency} {Number(r.net_pay).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{r.status}</span></td>
                  <td className="px-4 py-3">
                    {r.status === 'draft' && (
                      <button onClick={() => approve(r.id)} className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700">Approve</button>
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
