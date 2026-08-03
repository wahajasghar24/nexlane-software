'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import { useConfirm } from '@/shared/hooks/use-confirm-dialog'
import Link from 'next/link'

interface Order {
  id: string
  order_number: string
  vendor?: { id: string; name: string } | null
  status: string
  total: number
  created_at: string
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  sent: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  received: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const fmt = (n: number) =>
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const confirm = useConfirm()

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    fetch(`/api/purchase/orders?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || d.data || d || []
        setOrders(Array.isArray(data) ? data : [])
        setTotalPages(d.totalPages || Math.ceil((d.total || 0) / 20) || 1)
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [page, search, statusFilter])

  const handleDelete = async (id: string) => {
    if (!(await confirm('Delete this purchase order? Only draft orders can be deleted.'))) return
    try {
      const res = await fetch(`/api/purchase/orders/${id}`, { method: 'DELETE' })
      if (res.ok) setOrders(prev => prev.filter(o => o.id !== id))
    } catch {}
  }

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        description="Vendor orders and stock receipts"
        actions={
          <Link href="/purchase/orders/new" className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            New Purchase Order
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search orders..."
          className="max-w-xs rounded-md border bg-background px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="confirmed">Confirmed</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="rounded-lg border bg-card">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : orders.length === 0 ? (
          <EmptyState title="No purchase orders" description="Create a purchase order to order stock from vendors." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{o.order_number}</td>
                    <td className="px-4 py-3">{o.vendor?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[o.status] || statusColors.draft}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{fmt(o.total)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/purchase/orders/${o.id}`} className="text-xs text-primary hover:underline">View</Link>
                      {o.status === 'draft' && (
                        <>
                          <span className="mx-2 text-muted-foreground">·</span>
                          <button onClick={() => handleDelete(o.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-md border px-3 py-1.5 disabled:opacity-50">Previous</button>
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-md border px-3 py-1.5 disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  )
}
