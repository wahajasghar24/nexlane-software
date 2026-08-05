'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface JournalEntry {
  id: string
  entry_number: string
  entry_date: string
  description: string
  reference?: string
  status: string
  total_debit: number
  total_credit: number
}

const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    posted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    voided: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }
  return colors[status] || colors.draft
}

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 20

  useEffect(() => {
    fetch(`/api/accounting/journal-entries?page=${page}&limit=${limit}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || (d?.data) || (Array.isArray(d) ? d : [])
        setEntries(Array.isArray(data) ? data : [])
        setTotalPages(d.totalPages || Math.ceil((d.total || 0) / limit) || 1)
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [page])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const voidEntry = async (id: string) => {
    if (!confirm('Are you sure you want to void this journal entry?')) return
    try {
      const res = await fetch(`/api/accounting/journal-entries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'voided' }),
      })
      if (res.ok) {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'voided' } : e))
      }
    } catch {}
  }

  return (
    <div>
      <PageHeader
        title="Journal Entries"
        description="View and manage journal entries"
        actions={
          <Link
            href="/accounting/journal-entries/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            New Entry
          </Link>
        }
      />

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="h-5 w-48 bg-muted rounded mb-2" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          title="No journal entries"
          description="Create your first journal entry to record transactions"
          action={
            <Link href="/accounting/journal-entries/new" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              New Entry
            </Link>
          }
        />
      ) : (
        <>
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Entry #</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Description</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Reference</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="p-3 text-sm font-mono">{entry.entry_number}</td>
                    <td className="p-3 text-sm">{new Date(entry.entry_date).toLocaleDateString()}</td>
                    <td className="p-3 text-sm font-medium">{entry.description}</td>
                    <td className="p-3 text-sm text-muted-foreground">{entry.reference || '-'}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-right">{formatCurrency(entry.total_debit || 0)}</td>
                    <td className="p-3 text-right">
                      {entry.status === 'draft' && (
                        <button
                          onClick={() => voidEntry(entry.id)}
                          className="text-sm text-muted-foreground hover:text-red-500"
                        >
                          Void
                        </button>
                      )}
                      {entry.status === 'posted' && (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => { setLoading(true); setPage(p => Math.max(1, p - 1)) }}
                disabled={page <= 1}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => { setLoading(true); setPage(p => p + 1) }}
                disabled={page >= totalPages}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
