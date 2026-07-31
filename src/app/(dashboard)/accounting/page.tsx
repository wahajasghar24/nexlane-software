'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import { StaggerGroup, StaggerItem } from '@/shared/components/motion'
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

const statIcons = {
  ar: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  revenue: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  expenses: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>,
  invoices: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
  arrow: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
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
    { label: 'Total AR', value: stats.totalAccountsReceivable, href: '/accounting/accounts', chip: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: statIcons.ar },
    { label: 'Revenue (MTD)', value: stats.totalRevenueThisMonth, href: '/accounting/journal-entries', chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: statIcons.revenue },
    { label: 'Expenses (MTD)', value: stats.totalExpensesThisMonth, href: '/accounting/journal-entries', chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: statIcons.expenses },
    { label: 'Invoices', value: '-', href: '/accounting/invoices', chip: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', icon: statIcons.invoices, isCount: true },
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
        <StaggerGroup className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map(card => (
            <StaggerItem key={card.label}>
              <Link href={card.href} className="group block rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-bold tracking-tight mt-1 tabular-nums">
                      {card.isCount ? String(card.value) : formatCurrency(Number(card.value))}
                    </p>
                  </div>
                  <span className={`rounded-lg p-2.5 ${card.chip}`}>{card.icon}</span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {quickLinks.map(link => (
              <Link key={link.label} href={link.href} className="group rounded-xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{link.label}</h3>
                  <span className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">{statIcons.arrow}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>
          {recentEntries.length === 0 ? (
            <EmptyState title="No transactions yet" description="Journal entries will appear here" />
          ) : (
            <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
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
                    <tr key={entry.id} className="border-b last:border-b-0 transition-colors hover:bg-primary/5">
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
