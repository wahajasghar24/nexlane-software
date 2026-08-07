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
  const t = useTranslations('acc')
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
        title={t('balance_sheet.title')}
        description={t('balance_sheet.description')}
        actions={<Link href="/accounting/reports" className="rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">{t('balance_sheet.back')}</Link>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">{t('balance_sheet.as_of_date')}</label>
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
        <EmptyState title={t('balance_sheet.no_data')} description={t('balance_sheet.post_entries_hint')} />
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Assets */}
          <div className="rounded-lg border bg-card">
            <div className="border-b px-4 py-3 bg-blue-50 dark:bg-blue-950/30">
              <h3 className="font-semibold text-blue-700 dark:text-blue-400">{t('balance_sheet.assets')}</h3>
            </div>
            <div className="divide-y">
              {data.assetAccounts.map(acc => (
                <div key={acc.code} className="flex justify-between px-4 py-2.5 text-sm">
                  <span>{acc.code} - {acc.name}</span>
                  <span className="font-medium">{formatCurrency(acc.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 font-semibold border-t bg-muted/30 text-sm">
                <span>{t('balance_sheet.total_assets')}</span>
                <span className="text-blue-700 dark:text-blue-400">{formatCurrency(data.totalAssets)}</span>
              </div>
            </div>
          </div>

          {/* Liabilities */}
          <div className="rounded-lg border bg-card">
            <div className="border-b px-4 py-3 bg-purple-50 dark:bg-purple-950/30">
              <h3 className="font-semibold text-purple-700 dark:text-purple-400">{t('balance_sheet.liabilities')}</h3>
            </div>
            <div className="divide-y">
              {data.liabilityAccounts.map(acc => (
                <div key={acc.code} className="flex justify-between px-4 py-2.5 text-sm">
                  <span>{acc.code} - {acc.name}</span>
                  <span className="font-medium">{formatCurrency(acc.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 font-semibold border-t bg-muted/30 text-sm">
                <span>{t('balance_sheet.total_liabilities')}</span>
                <span className="text-purple-700 dark:text-purple-400">{formatCurrency(data.totalLiabilities)}</span>
              </div>
            </div>

            {/* Equity */}
            <div className="border-t">
              <div className="border-b px-4 py-3 bg-green-50 dark:bg-green-950/30">
                <h3 className="font-semibold text-green-700 dark:text-green-400">{t('balance_sheet.equity')}</h3>
              </div>
              <div className="divide-y">
                {data.equityAccounts.map(acc => (
                  <div key={acc.code} className="flex justify-between px-4 py-2.5 text-sm">
                    <span>{acc.code} - {acc.name}</span>
                    <span className="font-medium">{formatCurrency(acc.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between px-4 py-3 font-semibold border-t bg-muted/30 text-sm">
                  <span>{t('balance_sheet.total_equity')}</span>
                  <span className="text-green-700 dark:text-green-400">{formatCurrency(data.totalEquity)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg border bg-card">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold">{t('balance_sheet.summary')}</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('balance_sheet.total_assets')}</span>
                <span className="font-semibold text-blue-700 dark:text-blue-400">{formatCurrency(data.totalAssets)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('balance_sheet.total_liabilities')}</span>
                <span className="font-semibold text-purple-700 dark:text-purple-400">{formatCurrency(data.totalLiabilities)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('balance_sheet.total_equity')}</span>
                <span className="font-semibold text-green-700 dark:text-green-400">{formatCurrency(data.totalEquity)}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-sm font-bold">
                  <span>{t('balance_sheet.liabilities_equity')}</span>
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