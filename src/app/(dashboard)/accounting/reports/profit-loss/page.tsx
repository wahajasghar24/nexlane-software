'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface AccountLine {
  code: string
  name: string
  balance: number
}

interface PLData {
  revenueAccounts: AccountLine[]
  expenseAccounts: AccountLine[]
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  fromDate: string
  toDate: string
}

export default function ProfitLossPage() {
  const t = useTranslations('acc')
  const [data, setData] = useState<PLData | null>(null)
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [fromDate, setFromDate] = useState(new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0])
  const [toDate, setToDate] = useState(now.toISOString().split('T')[0])

  useEffect(() => {
    fetch(`/api/accounting/reports/profit-loss?from_date=${fromDate}&to_date=${toDate}`)
      .then(r => r.json())
      .then(d => setData(d.data || d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [fromDate, toDate])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  return (
    <div>
      <PageHeader
        title={t('profit_loss.title')}
        description={t('profit_loss.description')}
        actions={<Link href="/accounting/reports" className="rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">{t('profit_loss.back')}</Link>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">{t('profit_loss.from')}</label>
          <input type="date" value={fromDate} onChange={e => { setLoading(true); setFromDate(e.target.value) }} className="rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">{t('profit_loss.to')}</label>
          <input type="date" value={toDate} onChange={e => { setLoading(true); setToDate(e.target.value) }} className="rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-card p-6 animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-5 w-full bg-muted rounded" />
          ))}
        </div>
      ) : !data ? (
        <EmptyState title={t('profit_loss.no_data')} description={t('profit_loss.post_entries_hint')} />
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Revenue */}
          <div className="rounded-lg border bg-card">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold text-green-700 dark:text-green-400">{t('profit_loss.revenue')}</h3>
            </div>
            <div className="divide-y">
              {data.revenueAccounts.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">{t('profit_loss.no_revenue')}</p>
              ) : (
                data.revenueAccounts.map(acc => (
                  <div key={acc.code} className="flex justify-between px-4 py-2.5 text-sm">
                    <span>{acc.code} - {acc.name}</span>
                    <span className="font-medium">{formatCurrency(acc.balance)}</span>
                  </div>
                ))
              )}
              <div className="flex justify-between px-4 py-3 font-semibold border-t bg-muted/30 text-sm">
                <span>{t('profit_loss.total_revenue')}</span>
                <span className="text-green-700 dark:text-green-400">{formatCurrency(data.totalRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="rounded-lg border bg-card">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold text-red-700 dark:text-red-400">{t('profit_loss.expenses')}</h3>
            </div>
            <div className="divide-y">
              {data.expenseAccounts.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">{t('profit_loss.no_expenses')}</p>
              ) : (
                data.expenseAccounts.map(acc => (
                  <div key={acc.code} className="flex justify-between px-4 py-2.5 text-sm">
                    <span>{acc.code} - {acc.name}</span>
                    <span className="font-medium">{formatCurrency(acc.balance)}</span>
                  </div>
                ))
              )}
              <div className="flex justify-between px-4 py-3 font-semibold border-t bg-muted/30 text-sm">
                <span>{t('profit_loss.total_expenses')}</span>
                <span className="text-red-700 dark:text-red-400">{formatCurrency(data.totalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-card">
              <div className="flex justify-between px-4 py-4 text-base font-bold">
                <span>{t('profit_loss.net_income')}</span>
                <span className={data.netIncome >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                  {formatCurrency(data.netIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}