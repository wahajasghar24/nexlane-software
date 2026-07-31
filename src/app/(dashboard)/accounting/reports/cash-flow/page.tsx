'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface CFData {
  operatingCashFlow: number
  investingCashFlow: number
  financingCashFlow: number
  netCashFlow: number
  beginningCash: number
  endingCash: number
  fromDate: string
  toDate: string
}

export default function CashFlowPage() {
  const [data, setData] = useState<CFData | null>(null)
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [fromDate, setFromDate] = useState(new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0])
  const [toDate, setToDate] = useState(now.toISOString().split('T')[0])

  useEffect(() => {
    fetch(`/api/accounting/reports/cash-flow?from_date=${fromDate}&to_date=${toDate}`)
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
        title="Cash Flow Statement"
        description="Cash inflows and outflows"
        actions={<Link href="/accounting/reports" className="rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">Back</Link>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">From</label>
          <input type="date" value={fromDate} onChange={e => { setLoading(true); setFromDate(e.target.value) }} className="rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">To</label>
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
        <EmptyState title="No data" description="Post some journal entries first" />
      ) : (
        <div className="max-w-2xl rounded-lg border bg-card divide-y">
          {/* Operating */}
          <div className="px-4 py-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-blue-700 dark:text-blue-400">Operating Activities</h3>
              <span className={`text-sm font-semibold ${data.operatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.operatingCashFlow)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Cash generated from core business operations</p>
          </div>

          {/* Investing */}
          <div className="px-4 py-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-purple-700 dark:text-purple-400">Investing Activities</h3>
              <span className={`text-sm font-semibold ${data.investingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.investingCashFlow)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Cash used in investing activities</p>
          </div>

          {/* Financing */}
          <div className="px-4 py-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-amber-700 dark:text-amber-400">Financing Activities</h3>
              <span className={`text-sm font-semibold ${data.financingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.financingCashFlow)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Cash from financing activities</p>
          </div>

          {/* Net Cash Flow */}
          <div className="px-4 py-4 bg-muted/30">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Net Cash Flow</h3>
              <span className={`font-bold text-base ${data.netCashFlow >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {formatCurrency(data.netCashFlow)}
              </span>
            </div>
          </div>

          <div className="px-4 py-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Beginning Cash</span>
              <span className="text-sm font-medium">{formatCurrency(data.beginningCash)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">Ending Cash</span>
              <span className="text-sm font-bold">{formatCurrency(data.endingCash)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
