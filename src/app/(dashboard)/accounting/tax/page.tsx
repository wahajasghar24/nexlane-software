'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'

interface TaxResult {
  period_start: string
  period_end: string
  tax_rate: number
  total_sales: number
  total_purchases: number
  output_tax: number
  input_tax: number
  net_tax: number
  currency: string
}

interface TaxReturn {
  id: string
  period_start: string
  period_end: string
  output_tax: number
  input_tax: number
  net_tax: number
  total_sales: number
  total_purchases: number
  tax_rate: number
  status: string
  created_at: string
}

export default function TaxPage() {
  const t = useTranslations('acc')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [result, setResult] = useState<TaxResult | null>(null)
  const [returns, setReturns] = useState<TaxReturn[]>([])
  const [calculating, setCalculating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loadingReturns, setLoadingReturns] = useState(true)

  const loadReturns = useCallback(async () => {
    try {
      const res = await fetch('/api/accounting/tax/returns')
      const d = await res.json()
      const rows = d?.data?.data || (Array.isArray(d?.data) ? d.data : []) || []
      setReturns(Array.isArray(rows) ? rows : [])
    } catch {
      setReturns([])
    } finally {
      setLoadingReturns(false)
    }
  }, [])

  useEffect(() => {
    ;(async () => { await loadReturns() })()
  }, [loadReturns])

  const calculate = async () => {
    if (!periodStart || !periodEnd) { setMessage(t('tax.select_period')); return }
    setCalculating(true); setMessage('')
    try {
      const res = await fetch('/api/accounting/tax/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period_start: periodStart, period_end: periodEnd }),
      })
      const d = await res.json()
      if (!res.ok) { setMessage(d.error || 'Failed'); return }
      setResult(d.data)
    } catch { setMessage('Network error') }
    setCalculating(false)
  }

  const saveReturn = async () => {
    if (!result) return
    setSaving(true); setMessage('')
    try {
      const res = await fetch('/api/accounting/tax/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period_start: result.period_start,
          period_end: result.period_end,
          output_tax: result.output_tax,
          input_tax: result.input_tax,
          net_tax: result.net_tax,
          total_sales: result.total_sales,
          total_purchases: result.total_purchases,
          tax_rate: result.tax_rate,
        }),
      })
      if (!res.ok) { const d = await res.json(); setMessage(d.error || 'Failed'); return }
      setMessage(t('tax.return_saved'))
      setResult(null)
      await loadReturns()
    } catch { setMessage('Network error') }
    setSaving(false)
  }

  const fmt = (n: number) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('tax.title')}
        description={t('tax.description')}
      />

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.includes('Error') || message.includes('Failed') || message.includes('error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message}
        </div>
      )}

      {/* Period selector + Calculate */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">{t('tax.calculate_vat')}</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">{t('tax.from')}</label>
            <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('tax.to')}</label>
            <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <button onClick={calculate} disabled={calculating}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {calculating ? t('tax.calculating') : t('tax.calculate')}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t('tax.result')}</h3>
            <button onClick={saveReturn} disabled={saving}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
              {saving ? t('tax.saving') : t('tax.save_return')}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: t('tax.total_sales'), value: fmt(result.total_sales) },
              { label: t('tax.total_purchases'), value: fmt(result.total_purchases) },
              { label: t('tax.output_tax'), value: fmt(result.output_tax) },
              { label: t('tax.input_tax'), value: fmt(result.input_tax) },
              { label: t('tax.net_tax'), value: fmt(result.net_tax) },
              { label: t('tax.tax_rate'), value: `${result.tax_rate}%` },
            ].map(item => (
              <div key={item.label} className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved returns */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">{t('tax.returns')}</h3>
        {loadingReturns ? (
          <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-12 rounded bg-muted animate-pulse" />)}</div>
        ) : returns.length === 0 ? (
          <EmptyState title={t('tax.no_returns')} description={t('tax.no_returns_hint')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3">{t('tax.period')}</th>
                  <th className="px-4 py-3">{t('tax.output_tax')}</th>
                  <th className="px-4 py-3">{t('tax.input_tax')}</th>
                  <th className="px-4 py-3">{t('tax.net_tax')}</th>
                  <th className="px-4 py-3">{t('tax.status')}</th>
                </tr>
              </thead>
              <tbody>
                {returns.map(r => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{r.period_start} → {r.period_end}</td>
                    <td className="px-4 py-3">{fmt(r.output_tax)}</td>
                    <td className="px-4 py-3">{fmt(r.input_tax)}</td>
                    <td className="px-4 py-3 font-medium">{fmt(r.net_tax)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                        r.status === 'paid' ? 'bg-green-100 text-green-700' :
                        r.status === 'filed' ? 'bg-blue-100 text-blue-700' :
                        'bg-muted text-muted-foreground'
                      }`}>{t(`status.${r.status}`)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
