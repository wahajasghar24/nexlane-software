'use client'

import { PageHeader } from '@/shared/components/page-header'
import { StaggerGroup, StaggerItem } from '@/shared/components/motion'
import Link from 'next/link'

const reports = [
  { label: 'Trial Balance', href: '/accounting/reports/trial-balance', desc: 'Summary of all account balances' },
  { label: 'General Ledger', href: '/accounting/reports/general-ledger', desc: 'Detailed transaction history by account' },
  { label: 'Profit & Loss', href: '/accounting/reports/profit-loss', desc: 'Revenue and expenses over a period' },
  { label: 'Balance Sheet', href: '/accounting/reports/balance-sheet', desc: 'Assets, liabilities, and equity snapshot' },
  { label: 'Cash Flow', href: '/accounting/reports/cash-flow', desc: 'Cash inflows and outflows' },
]

const arrow = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Financial Reports" description="View accounting reports and summaries" />

      <StaggerGroup className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map(report => (
          <StaggerItem key={report.href}>
            <Link
              href={report.href}
              className="group block rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{report.label}</h3>
                <span className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">{arrow}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{report.desc}</p>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  )
}
