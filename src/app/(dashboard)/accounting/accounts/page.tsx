'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'

interface Account {
  id: string
  code: string
  name: string
  type: string
  description?: string
  parent_id?: string
}

const accountTypeColors: Record<string, string> = {
  asset: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  liability: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  equity: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  revenue: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  expense: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export default function ChartOfAccountsPage() {
  const t = useTranslations('acc')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    code: '', name: '', type: '', parent_id: '', description: '',
  })

  const accountTypes = [
    { value: '', label: t('accounts.select_type') },
    { value: 'asset', label: t('account_types.asset') },
    { value: 'liability', label: t('account_types.liability') },
    { value: 'equity', label: t('account_types.equity') },
    { value: 'revenue', label: t('account_types.revenue') },
    { value: 'expense', label: t('account_types.expense') },
  ]

  const fetchAccounts = () => {
    const params = new URLSearchParams({ limit: '100' })
    if (search) params.set('search', search)
    fetch(`/api/accounting/accounts?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || (d?.data) || (Array.isArray(d) ? d : [])
        setAccounts(Array.isArray(data) ? data : [])
      })
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAccounts()
  }, [search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body: Record<string, any> = {
        code: form.code,
        name: form.name,
        type: form.type,
      }
      if (form.parent_id) body.parent_id = form.parent_id
      if (form.description) body.description = form.description

      const res = await fetch('/api/accounting/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setForm({ code: '', name: '', type: '', parent_id: '', description: '' })
        setShowForm(false)
        toast.success(t('accounts.created_success'))
        fetchAccounts()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || t('accounts.create_failed'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('accounts.delete_confirm'))) return
    try {
      const res = await fetch(`/api/accounting/accounts/${id}`, { method: 'DELETE' })
      if (res.ok) fetchAccounts()
    } catch {}
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div>
      <PageHeader
        title={t('accounts.title')}
        description={t('accounts.description')}
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {showForm ? t('accounts.cancel') : t('accounts.new_account')}
          </button>
        }
      />

      {showForm && (
        <div className="max-w-2xl rounded-lg border bg-card p-6 mb-6">
          <h3 className="text-base font-semibold mb-4">{t('accounts.new_account')}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('accounts.code')} *</label>
                <input
                  type="text" required value={form.code}
                  onChange={e => update('code', e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder={t('accounts.code_placeholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('accounts.account_name')} *</label>
                <input
                  type="text" required value={form.name}
                  onChange={e => update('name', e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder={t('accounts.name_placeholder')}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('accounts.account_type')} *</label>
                <select required value={form.type} onChange={e => update('type', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  {accountTypes.map(at => (
                    <option key={at.value} value={at.value} disabled={!at.value}>{at.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('accounts.parent_account')}</label>
                <select value={form.parent_id} onChange={e => update('parent_id', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="">{t('accounts.none_top_level')}</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('accounts.description')}</label>
              <textarea
                rows={2} value={form.description}
                onChange={e => update('description', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={t('accounts.optional_description')}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {submitting ? t('accounts.creating') : t('accounts.create_account')}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">{t('accounts.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder={t('accounts.search_placeholder')}
          value={search}
          onChange={e => { setLoading(true); setSearch(e.target.value) }}
          className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto sm:min-w-[200px]"
        />
      </div>

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="h-5 w-48 bg-muted rounded mb-2" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          title={t('accounts.no_accounts')}
          description={t('accounts.no_accounts_hint')}
          action={
            <button onClick={() => setShowForm(true)} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              {t('accounts.new_account')}
            </button>
          }
        />
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('accounts.code')}</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('accounts.name')}</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('accounts.type')}</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('accounts.description')}</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('accounts.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(account => (
                <tr key={account.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="p-3 text-sm font-mono">{account.code}</td>
                  <td className="p-3 text-sm font-medium">{account.name}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${accountTypeColors[account.type] || ''}`}>
                      {t(`account_types.${account.type}`)}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{account.description || '-'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="text-sm text-muted-foreground hover:text-red-500"
                    >
                      {t('accounts.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}