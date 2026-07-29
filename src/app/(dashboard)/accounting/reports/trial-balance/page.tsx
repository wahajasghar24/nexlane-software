'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface AccountBalance {
  code: string
  name: string
  type: string
  totalDebit: number
  totalCredit: number
}

export default function TrialBalancePage() {
  const [accounts, setAccounts] = useState<AccountBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    setLoading(true)
    const params = asOfDate ? `?asOfDate=${asOfDate}` : ''
    fetch(`/api/accounting/reports/trial-balance${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data || d || []
        setAccounts(Array.isArray(data) ? data : [])
      })
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false))
  }, [asOfDate])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const totalDebit = accounts.reduce((s, a) => s + a.totalDebit, 0)
  const totalCredit = accounts.reduce((s, a) => s + a.totalCredit, 0)

  return (
    <div>
      <PageHeader
        title="Trial Balance"
        description="Summary of all general ledger account balances"
        actions={<Link href="/accounting/reports" className="rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">Back</Link>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">As of Date</label>
          <input type="date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="h-5 w-48 bg-muted rounded mb-2" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState title="No data" description="Post some journal entries first to see the trial balance" />
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Code</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Account</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Debit</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Credit</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => (
                <tr key={acc.code} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="p-3 text-sm font-mono">{acc.code}</td>
                  <td className="p-3 text-sm font-medium">{acc.name}</td>
                  <td className="p-3 text-sm capitalize">{acc.type}</td>
                  <td className="p-3 text-sm text-right">{formatCurrency(acc.totalDebit)}</td>
                  <td className="p-3 text-sm text-right">{formatCurrency(acc.totalCredit)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/30 font-semibold">
                <td colSpan={3} className="p-3 text-sm text-right">Totals</td>
                <td className="p-3 text-sm text-right">{formatCurrency(totalDebit)}</td>
                <td className="p-3 text-sm text-right">{formatCurrency(totalCredit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
