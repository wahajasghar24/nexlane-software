'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import { useConfirm } from '@/shared/hooks/use-confirm-dialog'
import Link from 'next/link'

interface Product {
  id: string
  sku: string
  name: string
  category?: string | null
  unit: string
  purchase_price: number
  sale_price: number
  stock_qty: number
  min_stock: number
  is_active: boolean
}

const fmt = (n: number) =>
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const confirm = useConfirm()

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    fetch(`/api/inventory/products?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || d.data || d || []
        setProducts(Array.isArray(data) ? data : [])
        setTotalPages(d.totalPages || Math.ceil((d.total || 0) / 20) || 1)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [page, search])

  const handleDelete = async (id: string) => {
    if (!(await confirm('Delete this product?'))) return
    try {
      await fetch(`/api/inventory/products/${id}`, { method: 'DELETE' })
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch {}
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="Inventory catalog with stock levels"
        actions={
          <Link href="/inventory/products/new" className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            New Product
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search products..."
          className="max-w-xs rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-lg border bg-card">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : products.length === 0 ? (
          <EmptyState title="No products" description="Create your first product to start tracking inventory." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-right">Min</th>
                  <th className="px-4 py-3 text-right">Purchase</th>
                  <th className="px-4 py-3 text-right">Sale</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const low = p.min_stock > 0 && p.stock_qty <= p.min_stock
                  return (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/inventory/products/${p.id}`} className="hover:underline">{p.name}</Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.category || '—'}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${low ? 'text-red-600' : ''}`}>
                        {fmt(p.stock_qty)} {p.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{fmt(p.min_stock)}</td>
                      <td className="px-4 py-3 text-right">{fmt(p.purchase_price)}</td>
                      <td className="px-4 py-3 text-right">{fmt(p.sale_price)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-md border px-3 py-1.5 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-md border px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
