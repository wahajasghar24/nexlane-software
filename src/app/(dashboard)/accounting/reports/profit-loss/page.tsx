'use client'

import { useState, useEffect } from 'react'
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
  const [data, setData] = useState<PLData | null>(null)
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [fromDate, setFromDate] = useState(new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0])
  const [toDate, setToDate] = useState(now.toISOString().split('T')[0])

  useEffect(() => {
    setLoading(true)
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
        title="Profit & Loss"
        description="Revenue and expense summary"
        actions={<Link href="/accounting/reports" className="rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">Back</Link>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">From</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">To</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-card p-6 animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-5 w-full bg-muted rounded" />
          ))}
        </div>
      ) : !data ? (
        <EmptyState title="No data" description="Post some journal entries first" />
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Revenue */}
          <div className="rounded-lg border bg-card">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold text-green-700 dark:text-green-400">Revenue</h3>
            </div>
            <div className="divide-y">
              {data.revenueAccounts.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No revenue accounts</p>
              ) : (
                data.revenueAccounts.map(acc => (
                  <div key={acc.code} className="flex justify-between px-4 py-2.5 text-sm">
                    <span>{acc.code} - {acc.name}</span>
                    <span className="font-medium">{formatCurrency(acc.balance)}</span>
                  </div>
                ))
              )}
              <div className="flex justify-between px-4 py-3 font-semibold border-t bg-muted/30 text-sm">
                <span>Total Revenue</span>
                <span className="text-green-700 dark:text-green-400">{formatCurrency(data.totalRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="rounded-lg border bg-card">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold text-red-700 dark:text-red-400">Expenses</h3>
            </div>
            <div className="divide-y">
              {data.expenseAccounts.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No expense accounts</p>
              ) : (
                data.expenseAccounts.map(acc => (
                  <div key={acc.code} className="flex justify-between px-4 py-2.5 text-sm">
                    <span>{acc.code} - {acc.name}</span>
                    <span className="font-medium">{formatCurrency(acc.balance)}</span>
                  </div>
                ))
              )}
              <div className="flex justify-between px-4 py-3 font-semibold border-t bg-muted/30 text-sm">
                <span>Total Expenses</span>
                <span className="text-red-700 dark:text-red-400">{formatCurrency(data.totalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-card">
              <div className="flex justify-between px-4 py-4 text-base font-bold">
                <span>Net Income</span>
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
