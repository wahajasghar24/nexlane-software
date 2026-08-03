'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'

export default function NewProductPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    sku: '',
    name: '',
    category: '',
    unit: 'pcs',
    purchase_price: '0',
    sale_price: '0',
    min_stock: '0',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/inventory/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          purchase_price: Number(form.purchase_price) || 0,
          sale_price: Number(form.sale_price) || 0,
          min_stock: Number(form.min_stock) || 0,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to create product')
      router.push('/inventory/products')
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  const field = 'rounded-md border bg-background px-3 py-2 text-sm w-full'
  const label = 'text-sm font-medium text-foreground'

  return (
    <div className="max-w-2xl">
      <PageHeader title="New Product" description="Add a product to your inventory catalog" />
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-5">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={label}>SKU *</label>
            <input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className={field} placeholder="e.g. SKU-001" />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Name *</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={field} placeholder="Product name" />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Category</label>
            <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={field} placeholder="e.g. Electronics" />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Unit</label>
            <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className={field}>
              {['pcs', 'kg', 'g', 'l', 'm', 'box', 'hour', 'day'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={label}>Purchase Price</label>
            <input type="number" step="0.01" min="0" value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: e.target.value })} className={field} />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Sale Price</label>
            <input type="number" step="0.01" min="0" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} className={field} />
          </div>
          <div className="space-y-1.5">
            <label className={label}>Min Stock (reorder alert)</label>
            <input type="number" step="0.01" min="0" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: e.target.value })} className={field} />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Create Product'}
          </button>
          <button type="button" onClick={() => router.back()} className="text-sm text-muted-foreground hover:underline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
