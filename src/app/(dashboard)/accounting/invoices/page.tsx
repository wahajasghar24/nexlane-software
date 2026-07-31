'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import Link from 'next/link'

interface Invoice {
  id: string
  invoice_number: string
  customer?: { name: string }
  invoice_date: string
  due_date: string
  total: number
  status: string
}

const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }
  return colors[status] || colors.draft
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    fetch(`/api/accounting/invoices?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || d.data || d || []
        setInvoices(Array.isArray(data) ? data : [])
        setTotalPages(d.totalPages || d.data?.totalPages || Math.ceil((d.total || 0) / 20) || 1)
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false))
  }, [page, search])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Manage customer invoices"
        actions={
          <Link
            href="/accounting/invoices/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            New Invoice
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search invoices..."
          value={search}
          onChange={e => { setLoading(true); setSearch(e.target.value); setPage(1) }}
          className="rounded-md border bg-background px-3 py-2 text-sm w-full sm:w-auto sm:min-w-[200px]"
        />
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
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description="Create your first invoice"
          action={
            <Link href="/accounting/invoices/new" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              New Invoice
            </Link>
          }
        />
      ) : (
        <>
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Invoice #</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Due Date</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="p-3 text-sm font-mono">{inv.invoice_number}</td>
                    <td className="p-3 text-sm">{inv.customer?.name || '-'}</td>
                    <td className="p-3 text-sm">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                    <td className="p-3 text-sm">{new Date(inv.due_date).toLocaleDateString()}</td>
                    <td className="p-3 text-sm text-right font-medium">{formatCurrency(inv.total)}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link href={`/accounting/invoices/${inv.id}`} className="text-sm text-muted-foreground hover:text-primary">
                        View
                      </Link>
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
