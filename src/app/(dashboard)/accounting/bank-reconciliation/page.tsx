'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'

interface BankAccount {
  id: string
  name: string
  bank_name: string
  account_number: string
  currency: string
  balance: number
}

interface BankTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: string
  matched: boolean
  journal_entry_id?: string
}

interface ReconciliationSession {
  id: string
  bank_account_id: string
  period_start: string
  period_end: string
  status: string
  matched_count: number
  unmatched_count: number
}

const currencies = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP']

export default function BankReconciliationPage() {
  const t = useTranslations('acc')
  const [activeTab, setActiveTab] = useState<'accounts' | 'reconciliation'>('accounts')
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', bank_name: '', account_number: '', currency: 'USD',
  })

  // Reconciliation state
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [transactions, setTransactions] = useState<BankTransaction[]>([])
  const [txLoading, setTxLoading] = useState(true)
  const [sessions, setSessions] = useState<ReconciliationSession[]>([])
  const [creatingSession, setCreatingSession] = useState(false)
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')

  const fetchAccounts = () => {
    fetch('/api/accounting/bank-accounts?limit=100')
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || d?.data || (Array.isArray(d) ? d : [])
        setAccounts(Array.isArray(data) ? data : [])
      })
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAccounts() }, [])

  const fetchTransactions = (accountId: string) => {
    if (!accountId) { setTransactions([]); return }
    fetch(`/api/accounting/bank-accounts/${accountId}/transactions`)
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || d?.data || (Array.isArray(d) ? d : [])
        setTransactions(Array.isArray(data) ? data : [])
      })
      .catch(() => setTransactions([]))
      .finally(() => setTxLoading(false))
  }

  const fetchSessions = (accountId: string) => {
    if (!accountId) { setSessions([]); return }
    fetch(`/api/accounting/reconciliation?bank_account_id=${accountId}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || d?.data || (Array.isArray(d) ? d : [])
        setSessions(Array.isArray(data) ? data : [])
      })
      .catch(() => setSessions([]))
  }

  useEffect(() => {
    if (activeTab === 'reconciliation' && selectedAccountId) {
      setTxLoading(true)
      fetchTransactions(selectedAccountId)
      fetchSessions(selectedAccountId)
    }
  }, [activeTab, selectedAccountId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/accounting/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setForm({ name: '', bank_name: '', account_number: '', currency: 'USD' })
        setShowForm(false)
        toast.success(t('bank_accounts.created_success'))
        fetchAccounts()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || t('bank_accounts.create_failed'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const createReconciliationSession = async () => {
    if (!selectedAccountId || !periodStart || !periodEnd) return
    setCreatingSession(true)
    try {
      const res = await fetch('/api/accounting/reconciliation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_account_id: selectedAccountId,
          period_start: periodStart,
          period_end: periodEnd,
        }),
      })
      if (res.ok) {
        toast.success(t('reconciliation.session_created'))
        setPeriodStart('')
        setPeriodEnd('')
        fetchSessions(selectedAccountId)
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || t('reconciliation.create_failed'))
      }
    } finally {
      setCreatingSession(false)
    }
  }

  const matchTransaction = async (txId: string, journalEntryId: string) => {
    try {
      const res = await fetch(`/api/accounting/bank-accounts/${selectedAccountId}/transactions/${txId}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journal_entry_id: journalEntryId }),
      })
      if (res.ok) {
        toast.success(t('reconciliation.matched'))
        fetchTransactions(selectedAccountId)
      }
    } catch { /* noop */ }
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const formatCurrency = (amount: number, currency: string) =>
    `${currency} ${Number(amount).toLocaleString()}`

  return (
    <div>
      <PageHeader
        title={t('bank_accounts.title')}
        description={t('bank_accounts.description')}
        actions={
          activeTab === 'accounts' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {showForm ? t('bank_accounts.cancel') : t('bank_accounts.new_account')}
            </button>
          )
        }
      />

      {/* Tab Bar */}
      <div className="flex gap-1 border-b mb-6">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'accounts'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('bank_accounts.tab_accounts')}
        </button>
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'reconciliation'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('bank_accounts.tab_reconciliation')}
        </button>
      </div>

      {/* Bank Accounts Tab */}
      {activeTab === 'accounts' && (
        <>
          {showForm && (
            <div className="max-w-2xl rounded-lg border bg-card p-6 mb-6">
              <h3 className="text-base font-semibold mb-4">{t('bank_accounts.new_account')}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('bank_accounts.account_name')} *</label>
                    <input
                      type="text" required value={form.name}
                      onChange={e => update('name', e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      placeholder={t('bank_accounts.name_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('bank_accounts.bank_name')} *</label>
                    <input
                      type="text" required value={form.bank_name}
                      onChange={e => update('bank_name', e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      placeholder={t('bank_accounts.bank_name_placeholder')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('bank_accounts.account_number')} *</label>
                    <input
                      type="text" required value={form.account_number}
                      onChange={e => update('account_number', e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      placeholder={t('bank_accounts.account_number_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('bank_accounts.currency')} *</label>
                    <select required value={form.currency} onChange={e => update('currency', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                      {currencies.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    {submitting ? t('bank_accounts.creating') : t('bank_accounts.create_account')}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">{t('bank_accounts.cancel')}</button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="rounded-lg border">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
                  <div className="h-5 w-48 bg-muted rounded mb-2" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState
              title={t('bank_accounts.no_accounts')}
              description={t('bank_accounts.no_accounts_hint')}
              action={
                <button onClick={() => setShowForm(true)} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  {t('bank_accounts.new_account')}
                </button>
              }
            />
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('bank_accounts.name')}</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('bank_accounts.bank_name')}</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('bank_accounts.account_number')}</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('bank_accounts.currency')}</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('bank_accounts.balance')}</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(account => (
                    <tr key={account.id} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="p-3 text-sm font-medium">{account.name}</td>
                      <td className="p-3 text-sm">{account.bank_name}</td>
                      <td className="p-3 text-sm font-mono">{account.account_number}</td>
                      <td className="p-3 text-sm">{account.currency}</td>
                      <td className="p-3 text-sm text-right font-medium">{formatCurrency(account.balance, account.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Reconciliation Tab */}
      {activeTab === 'reconciliation' && (
        <>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto sm:min-w-[200px]"
            >
              <option value="">{t('reconciliation.select_account')}</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.bank_name})</option>
              ))}
            </select>
          </div>

          {!selectedAccountId ? (
            <EmptyState
              title={t('reconciliation.select_account_title')}
              description={t('reconciliation.select_account_hint')}
            />
          ) : (
            <>
              {/* Create Session */}
              <div className="max-w-2xl rounded-lg border bg-card p-4 mb-6">
                <h3 className="text-sm font-semibold mb-3">{t('reconciliation.new_session')}</h3>
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div>
                    <label className="block text-xs font-medium mb-1">{t('reconciliation.period_start')}</label>
                    <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">{t('reconciliation.period_end')}</label>
                    <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <button
                    onClick={createReconciliationSession}
                    disabled={creatingSession || !periodStart || !periodEnd}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {creatingSession ? t('reconciliation.creating') : t('reconciliation.create_session')}
                  </button>
                </div>
              </div>

              {/* Sessions */}
              {sessions.length > 0 && (
                <div className="rounded-lg border overflow-x-auto mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('reconciliation.period')}</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('reconciliation.status')}</th>
                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('reconciliation.matched')}</th>
                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('reconciliation.unmatched')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map(session => (
                        <tr key={session.id} className="border-b last:border-b-0 hover:bg-muted/30">
                          <td className="p-3 text-sm">{session.period_start} → {session.period_end}</td>
                          <td className="p-3">
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{session.status}</span>
                          </td>
                          <td className="p-3 text-sm text-right">{session.matched_count}</td>
                          <td className="p-3 text-sm text-right">{session.unmatched_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Transactions */}
              <h3 className="text-sm font-semibold mb-3">{t('reconciliation.transactions')}</h3>
              {txLoading ? (
                <div className="rounded-lg border">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
                      <div className="h-5 w-48 bg-muted rounded mb-2" />
                      <div className="h-4 w-24 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <EmptyState
                  title={t('reconciliation.no_transactions')}
                  description={t('reconciliation.no_transactions_hint')}
                />
              ) : (
                <div className="rounded-lg border overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('reconciliation.date')}</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('reconciliation.description')}</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('reconciliation.type')}</th>
                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('reconciliation.amount')}</th>
                        <th className="text-center p-3 text-sm font-medium text-muted-foreground">{t('reconciliation.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx.id} className="border-b last:border-b-0 hover:bg-muted/30">
                          <td className="p-3 text-sm">{tx.date}</td>
                          <td className="p-3 text-sm">{tx.description}</td>
                          <td className="p-3 text-sm capitalize">{tx.type}</td>
                          <td className="p-3 text-sm text-right font-medium">{formatCurrency(tx.amount, selectedAccountId ? accounts.find(a => a.id === selectedAccountId)?.currency || '' : '')}</td>
                          <td className="p-3 text-center">
                            {tx.matched ? (
                              <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 text-xs font-medium">
                                {t('reconciliation.matched_label')}
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  const jeId = prompt(t('reconciliation.enter_journal_entry_id'))
                                  if (jeId) matchTransaction(tx.id, jeId)
                                }}
                                className="text-xs text-primary hover:underline"
                              >
                                {t('reconciliation.match')}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
