'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
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

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
}

export default function PayrollPage() {
  const t = useTranslations('hr')
  const [rows, setRows] = useState<PayslipRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')

  const load = useCallback(async () => {
    fetch('/api/payroll/payslips?limit=100')
      .then(r => r.json())
      .then(d => { setRows(d.data?.data ?? []) })
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const generate = async () => {
    if (!periodStart || !periodEnd) { toast.error(t('payroll.select_period')); return }
    setBusy(true)
    try {
      const res = await fetch('/api/payroll/payslips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period_start: periodStart, period_end: periodEnd }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || t('common.failed')); return }
      toast.success(t('payroll.generated', { generated: data.data.generated, skipped: data.data.skipped }))
      setPeriodStart('')
      setPeriodEnd('')
      await load()
    } catch { toast.error(t('common.network_error')) }
    setBusy(false)
  }

  const approve = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/payslips/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      if (res.ok) {
        toast.success(t('payroll.approved_success'))
        await load()
      }
    } catch { /* noop */ }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('payroll.title')}
        description={t('payroll.description')}
        actions={
          <div className="flex items-center gap-2">
            <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm" />
            <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm" />
            <button onClick={generate} disabled={busy} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40">
              {busy ? t('payroll.generating') : t('payroll.generate_payslips')}
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="h-5 w-48 bg-muted rounded mb-2" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title={t('payroll.no_payslips')} description={t('payroll.no_payslips_hint')} />
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3">{t('payroll.employee')}</th>
                <th className="px-4 py-3">{t('payroll.period')}</th>
                <th className="px-4 py-3">{t('payroll.base_salary')}</th>
                <th className="px-4 py-3">{t('payroll.allowances')}</th>
                <th className="px-4 py-3">{t('payroll.deductions')}</th>
                <th className="px-4 py-3">{t('payroll.tax')}</th>
                <th className="px-4 py-3">{t('payroll.net_pay')}</th>
                <th className="px-4 py-3">{t('payroll.status_col')}</th>
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
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[r.status] || 'bg-muted'}`}>
                      {t(`status.${r.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'draft' && (
                      <button onClick={() => approve(r.id)} className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700">
                        {t('common.approve')}
                      </button>
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
