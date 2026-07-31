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

interface BSData {
  assetAccounts: AccountLine[]
  liabilityAccounts: AccountLine[]
  equityAccounts: AccountLine[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  netIncome: number
  asOfDate: string
}

export default function BalanceSheetPage() {
  const [data, setData] = useState<BSData | null>(null)
  const [loading, setLoading] = useState(true)
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetch(`/api/accounting/reports/balance-sheet?asOfDate=${asOfDate}`)
      .then(r => r.json())
      .then(d => setData(d.data || d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [asOfDate])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  return (
    <div>
      <PageHeader
        title="Balance Sheet"
        description="Snapshot of assets, liabilities, and equity"
        actions={<Link href="/accounting/reports" className="rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">Back</Link>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">As of Date</label>
          <input type="date" value={asOfDate} onChange={e => { setLoading(true); setAsOfDate(e.target.value) }} className="rounded-md border bg-background px-3 py-2 text-sm" />
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
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Assets */}
          <div className="rounded-lg border bg-card">
            <div className="border-b px-4 py-3 bg-blue-50 dark:bg-blue-950/30">
              <h3 className="font-semibold text-blue-700 dark:text-blue-400">Assets</h3>
            </div>
            <div className="divide-y">
              {data.assetAccounts.map(acc => (
                <div key={acc.code} className="flex justify-between px-4 py-2.5 text-sm">
                  <span>{acc.code} - {acc.name}</span>
                  <span className="font-medium">{formatCurrency(acc.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 font-semibold border-t bg-muted/30 text-sm">
                <span>Total Assets</span>
                <span className="text-blue-700 dark:text-blue-400">{formatCurrency(data.totalAssets)}</span>
              </div>
            </div>
          </div>

          {/* Liabilities */}
          <div className="rounded-lg border bg-card">
            <div className="border-b px-4 py-3 bg-purple-50 dark:bg-purple-950/30">
              <h3 className="font-semibold text-purple-700 dark:text-purple-400">Liabilities</h3>
            </div>
            <div className="divide-y">
              {data.liabilityAccounts.map(acc => (
                <div key={acc.code} className="flex justify-between px-4 py-2.5 text-sm">
                  <span>{acc.code} - {acc.name}</span>
                  <span className="font-medium">{formatCurrency(acc.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 font-semibold border-t bg-muted/30 text-sm">
                <span>Total Liabilities</span>
                <span className="text-purple-700 dark:text-purple-400">{formatCurrency(data.totalLiabilities)}</span>
              </div>
            </div>

            {/* Equity */}
            <div className="border-t">
              <div className="border-b px-4 py-3 bg-green-50 dark:bg-green-950/30">
                <h3 className="font-semibold text-green-700 dark:text-green-400">Equity</h3>
              </div>
              <div className="divide-y">
                {data.equityAccounts.map(acc => (
                  <div key={acc.code} className="flex justify-between px-4 py-2.5 text-sm">
                    <span>{acc.code} - {acc.name}</span>
                    <span className="font-medium">{formatCurrency(acc.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between px-4 py-3 font-semibold border-t bg-muted/30 text-sm">
                  <span>Total Equity</span>
                  <span className="text-green-700 dark:text-green-400">{formatCurrency(data.totalEquity)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg border bg-card">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold">Summary</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Assets</span>
                <span className="font-semibold text-blue-700 dark:text-blue-400">{formatCurrency(data.totalAssets)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Liabilities</span>
                <span className="font-semibold text-purple-700 dark:text-purple-400">{formatCurrency(data.totalLiabilities)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Equity</span>
                <span className="font-semibold text-green-700 dark:text-green-400">{formatCurrency(data.totalEquity)}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-sm font-bold">
                  <span>Liabilities + Equity</span>
                  <span>{formatCurrency(data.totalLiabilities + data.totalEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
