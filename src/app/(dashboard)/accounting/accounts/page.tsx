'use client'

import { useState, useEffect } from 'react'
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

const accountTypes = [
  { value: '', label: 'Select type' },
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'expense', label: 'Expense' },
]

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    code: '', name: '', type: '', parent_id: '', description: '',
  })

  const fetchAccounts = () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '100' })
    if (search) params.set('search', search)
    fetch(`/api/accounting/accounts?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || d.data || d || []
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
        fetchAccounts()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return
    try {
      const res = await fetch(`/api/accounting/accounts/${id}`, { method: 'DELETE' })
      if (res.ok) fetchAccounts()
    } catch {}
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div>
      <PageHeader
        title="Chart of Accounts"
        description="Manage your chart of accounts"
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {showForm ? 'Cancel' : 'New Account'}
          </button>
        }
      />

      {showForm && (
        <div className="max-w-2xl rounded-lg border bg-card p-6 mb-6">
          <h3 className="text-base font-semibold mb-4">New Account</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <input
                  type="text" required value={form.code}
                  onChange={e => update('code', e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="e.g. 1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Account Name *</label>
                <input
                  type="text" required value={form.name}
                  onChange={e => update('name', e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="e.g. Cash"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Account Type *</label>
                <select required value={form.type} onChange={e => update('type', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  {accountTypes.map(t => (
                    <option key={t.value} value={t.value} disabled={!t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parent Account</label>
                <select value={form.parent_id} onChange={e => update('parent_id', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="">None (Top-level)</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                rows={2} value={form.description}
                onChange={e => update('description', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Account'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search accounts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
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
          title="No accounts found"
          description="Create your first account to build the chart of accounts"
          action={
            <button onClick={() => setShowForm(true)} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              New Account
            </button>
          }
        />
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Code</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Description</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(account => (
                <tr key={account.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="p-3 text-sm font-mono">{account.code}</td>
                  <td className="p-3 text-sm font-medium">{account.name}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${accountTypeColors[account.type] || ''}`}>
                      {account.type}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{account.description || '-'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="text-sm text-muted-foreground hover:text-red-500"
                    >
                      Delete
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
