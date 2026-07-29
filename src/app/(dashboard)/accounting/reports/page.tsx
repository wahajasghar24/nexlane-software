'use client'

import { PageHeader } from '@/shared/components/page-header'
import Link from 'next/link'

const reports = [
  { label: 'Trial Balance', href: '/accounting/reports/trial-balance', desc: 'Summary of all account balances' },
  { label: 'General Ledger', href: '/accounting/reports/general-ledger', desc: 'Detailed transaction history by account' },
  { label: 'Profit & Loss', href: '/accounting/reports/profit-loss', desc: 'Revenue and expenses over a period' },
  { label: 'Balance Sheet', href: '/accounting/reports/balance-sheet', desc: 'Assets, liabilities, and equity snapshot' },
  { label: 'Cash Flow', href: '/accounting/reports/cash-flow', desc: 'Cash inflows and outflows' },
]

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Financial Reports" description="View accounting reports and summaries" />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map(report => (
          <Link
            key={report.href}
            href={report.href}
            className="rounded-lg border bg-card p-5 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-1">{report.label}</h3>
            <p className="text-sm text-muted-foreground">{report.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
