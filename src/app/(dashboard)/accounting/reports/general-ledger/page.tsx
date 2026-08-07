'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface GLLine {
  id: string
  debit: number
  credit: number
  description: string
  journal_entry: {
    id: string
    entry_number: string
    entry_date: string
    description: string
    reference: string
    status: string
  }
  account: {
    code: string
    name: string
    type: string
  }
}

export default function GeneralLedgerPage() {
  const t = useTranslations('acc')
  const [lines, setLines] = useState<GLLine[]>([])
  const [accounts, setAccounts] = useState<{ id: string; code: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [accountId, setAccountId] = useState('')
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetch('/api/accounting/accounts?limit=200')
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || (d?.data) || (Array.isArray(d) ? d : [])
        setAccounts(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: '50' })
    if (accountId) params.set('account_id', accountId)
    if (fromDate) params.set('from_date', fromDate)
    if (toDate) params.set('to_date', toDate)

    fetch(`/api/accounting/reports/general-ledger?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || (d?.data) || (Array.isArray(d) ? d : [])
        setLines(Array.isArray(data) ? data : [])
        setTotalPages(d.totalPages || d.data?.totalPages || Math.ceil((d.total || 0) / 50) || 1)
      })
      .catch(() => setLines([]))
      .finally(() => setLoading(false))
  }, [page, accountId, fromDate, toDate])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  return (
    <div>
      <PageHeader
        title={t('general_ledger.title')}
        description={t('general_ledger.description')}
        actions={<Link href="/accounting/reports" className="rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">{t('general_ledger.back')}</Link>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">{t('general_ledger.account')}</label>
          <select value={accountId} onChange={e => { setLoading(true); setAccountId(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto">
            <option value="">{t('general_ledger.all_accounts')}</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">{t('general_ledger.from')}</label>
          <input type="date" value={fromDate} onChange={e => { setLoading(true); setFromDate(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">{t('general_ledger.to')}</label>
          <input type="date" value={toDate} onChange={e => { setLoading(true); setToDate(e.target.value); setPage(1) }} className="rounded-md border bg-background px-3 py-2 text-sm" />
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
      ) : lines.length === 0 ? (
        <EmptyState title={t('general_ledger.no_transactions')} description={t('general_ledger.no_transactions_hint')} />
      ) : (
        <>
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('general_ledger.date')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('general_ledger.entry_no')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('general_ledger.account')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('general_ledger.description')}</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('general_ledger.debit')}</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('general_ledger.credit')}</th>
                </tr>
              </thead>
              <tbody>
                {lines.map(line => (
                  <tr key={line.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="p-3 text-sm">{new Date(line.journal_entry.entry_date).toLocaleDateString()}</td>
                    <td className="p-3 text-sm font-mono">{line.journal_entry.entry_number}</td>
                    <td className="p-3 text-sm">{line.account?.code} - {line.account?.name}</td>
                    <td className="p-3 text-sm">{line.description || line.journal_entry.description}</td>
                    <td className="p-3 text-sm text-right">{line.debit > 0 ? formatCurrency(line.debit) : '-'}</td>
                    <td className="p-3 text-sm text-right">{line.credit > 0 ? formatCurrency(line.credit) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 mt-4">
            <p className="text-sm text-muted-foreground">{t('general_ledger.page_of', { page, total: totalPages })}</p>
            <div className="flex gap-2">
              <button onClick={() => { setLoading(true); setPage(p => Math.max(1, p - 1)) }} disabled={page <= 1} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50">{t('general_ledger.previous')}</button>
              <button onClick={() => { setLoading(true); setPage(p => p + 1) }} disabled={page >= totalPages} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50">{t('general_ledger.next')}</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}