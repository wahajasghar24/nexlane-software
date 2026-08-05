'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PageHeader } from '@/shared/components/page-header'
import { cleanFormPayload } from '@/core/utils/payload'

interface EntryLine {
  id: string
  account_id: string
  description: string
  debit: string
  credit: string
}

interface Account {
  id: string
  account_code: string
  name: string
  type: string
}

export default function NewJournalEntryPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [reference, setReference] = useState('')
  const [lines, setLines] = useState<EntryLine[]>([
    { id: '1', account_id: '', description: '', debit: '', credit: '' },
    { id: '2', account_id: '', description: '', debit: '', credit: '' },
  ])

  useEffect(() => {
    fetch('/api/accounting/accounts?limit=200')
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || (d?.data) || (Array.isArray(d) ? d : [])
        setAccounts(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
  }, [])

  const addLine = () => {
    const newId = String(Date.now())
    setLines(prev => [...prev, { id: newId, account_id: '', description: '', debit: '', credit: '' }])
  }

  const removeLine = (id: string) => {
    if (lines.length <= 2) return
    setLines(prev => prev.filter(l => l.id !== id))
  }

  const updateLine = (id: string, field: keyof EntryLine, value: string) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  const totalDebits = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0)
  const totalCredits = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0)
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.001
  const canSubmit = description.trim() && lines.some(l => l.account_id) && totalDebits > 0 && isBalanced

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      const body = {
        entry_date: new Date(date).toISOString(),
        description,
        reference: reference || undefined,
        lines: lines
          .filter(l => l.account_id)
          .map(l => ({
            account_id: l.account_id,
            description: l.description || undefined,
            debit: parseFloat(l.debit) || 0,
            credit: parseFloat(l.credit) || 0,
          })),
      }

      const res = await fetch('/api/accounting/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanFormPayload(body)),
      })
      if (res.ok) {
        toast.success('Journal entry created')
        router.push('/accounting/journal-entries')
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  return (
    <div>
      <PageHeader title="New Journal Entry" description="Create a new journal entry" />

      <div className="max-w-4xl rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input
                type="date" required value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <input
                type="text" required value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Transaction description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reference</label>
              <input
                type="text" value={reference}
                onChange={e => setReference(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Optional reference"
              />
            </div>
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Journal Lines</h3>
              <button
                type="button"
                onClick={addLine}
                className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                + Add Line
              </button>
            </div>

            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground">Account</th>
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground">Description</th>
                    <th className="text-right p-2 text-xs font-medium text-muted-foreground">Debit</th>
                    <th className="text-right p-2 text-xs font-medium text-muted-foreground">Credit</th>
                    <th className="w-10 p-2" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={line.id} className="border-b last:border-b-0">
                      <td className="p-2">
                        <select
                          value={line.account_id}
                          onChange={e => updateLine(line.id, 'account_id', e.target.value)}
                          className="w-full rounded-md border bg-background px-2 py-1.5 text-sm min-w-[160px]"
                        >
                          <option value="">Select account</option>
                          {accounts.map(a => (
                            <option key={a.id} value={a.id}>{a.account_code} - {a.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={line.description}
                          onChange={e => updateLine(line.id, 'description', e.target.value)}
                          className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                          placeholder={`Line ${idx + 1}`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.debit}
                          onChange={e => updateLine(line.id, 'debit', e.target.value)}
                          className="w-full rounded-md border bg-background px-2 py-1.5 text-sm text-right"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.credit}
                          onChange={e => updateLine(line.id, 'credit', e.target.value)}
                          className="w-full rounded-md border bg-background px-2 py-1.5 text-sm text-right"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="p-2">
                        {lines.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeLine(line.id)}
                            className="text-xs text-muted-foreground hover:text-red-500"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-muted/30">
                    <td colSpan={2} className="p-2 text-sm font-semibold text-right">Totals</td>
                    <td className={`p-2 text-sm font-semibold text-right ${totalDebits !== totalCredits ? 'text-red-500' : ''}`}>
                      {formatCurrency(totalDebits)}
                    </td>
                    <td className={`p-2 text-sm font-semibold text-right ${totalDebits !== totalCredits ? 'text-red-500' : ''}`}>
                      {formatCurrency(totalCredits)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {!isBalanced && totalDebits > 0 && (
              <p className="text-xs text-red-500 mt-2">
                Debits ({formatCurrency(totalDebits)}) must equal Credits ({formatCurrency(totalCredits)})
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Entry'}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
