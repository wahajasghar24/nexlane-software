'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface DashboardStats {
  totalAccountsReceivable: number
  totalRevenueThisMonth: number
  totalExpensesThisMonth: number
}

interface RecentEntry {
  id: string
  entry_number: string
  entry_date: string
  description: string
  status: string
}

export default function AccountingDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAccountsReceivable: 0,
    totalRevenueThisMonth: 0,
    totalExpensesThisMonth: 0,
  })
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/accounting/dashboard')
      .then(r => r.json())
      .then(d => {
        const data = d.data || d || {}
        setStats({
          totalAccountsReceivable: data.totalAccountsReceivable ?? 0,
          totalRevenueThisMonth: data.totalRevenueThisMonth ?? 0,
          totalExpensesThisMonth: data.totalExpensesThisMonth ?? 0,
        })
        setRecentEntries(Array.isArray(data.recentTransactions) ? data.recentTransactions : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const statCards = [
    { label: 'Total AR', value: stats.totalAccountsReceivable, href: '/accounting/accounts', color: 'bg-blue-500' },
    { label: 'Revenue (MTD)', value: stats.totalRevenueThisMonth, href: '/accounting/journal-entries', color: 'bg-green-500' },
    { label: 'Expenses (MTD)', value: stats.totalExpensesThisMonth, href: '/accounting/journal-entries', color: 'bg-amber-500' },
    { label: 'Invoices', value: '-', href: '/accounting/invoices', color: 'bg-purple-500', isCount: true },
  ]

  const quickLinks = [
    { label: 'Accounts', href: '/accounting/accounts', desc: 'Manage chart of accounts' },
    { label: 'Journal Entries', href: '/accounting/journal-entries', desc: 'Record transactions' },
    { label: 'Invoices', href: '/accounting/invoices', desc: 'Manage customer invoices' },
    { label: 'Payments', href: '/accounting/payments', desc: 'Record incoming payments' },
  ]

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      posted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      voided: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    }
    return colors[status] || colors.draft
  }

  return (
    <div>
      <PageHeader title="Accounting" description="Financial overview and management" />

      {loading ? (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 animate-pulse">
              <div className="h-3 w-20 bg-muted rounded mb-2" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map(card => (
            <Link key={card.label} href={card.href} className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className={`h-2.5 w-2.5 rounded-full ${card.color}`} />
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
              <p className="text-2xl font-bold">
                {card.isCount ? String(card.value) : formatCurrency(Number(card.value))}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {quickLinks.map(link => (
              <Link key={link.label} href={link.href} className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors">
                <h3 className="font-medium">{link.label}</h3>
                <p className="text-sm text-muted-foreground">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>
          {recentEntries.length === 0 ? (
            <EmptyState title="No transactions yet" description="Journal entries will appear here" />
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Description</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Entry #</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.map(entry => (
                    <tr key={entry.id} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="p-3 text-sm">{new Date(entry.entry_date).toLocaleDateString()}</td>
                      <td className="p-3 text-sm font-medium">{entry.description}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(entry.status)}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-right font-mono">{entry.entry_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
