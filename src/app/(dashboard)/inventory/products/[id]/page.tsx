'use client'

import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'

const fmt = (n: number) =>
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function ProductDetailPage() {
  const t = useTranslations('inv')
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/inventory/products/${id}`)
      .then(r => r.json())
      .then(d => setProduct(d.data))
      .catch(() => setError(t('product_detail_failed_load')))
      .finally(() => setLoading(false))
  }, [id])

  const adjust = async (delta: number) => {
    const q = Number(qty)
    if (!q || q <= 0) return setError(t('product_detail_enter_qty'))
    setError('')
    setMsg('')
    const res = await fetch(`/api/inventory/products/${id}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: delta * q, note: note || null }),
    })
    const d = await res.json()
    if (!res.ok) return setError(d.error || t('product_detail_adjust_failed'))
    setMsg(delta > 0 ? t('product_detail_stock_added', { qty: q, unit: product.unit }) : t('product_detail_stock_removed', { qty: q, unit: product.unit }))
    setQty('')
    setNote('')
    const r = await fetch(`/api/inventory/products/${id}`)
    const dd = await r.json()
    setProduct(dd.data)
  }

  if (loading) return <div className="p-8 text-sm text-muted-foreground">{t('product_detail_loading')}</div>
  if (!product) return <div className="p-8 text-sm text-red-600">{error || t('product_detail_not_found')}</div>

  const low = product.min_stock > 0 && product.stock_qty <= product.min_stock

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={product.name}
        description={`SKU ${product.sku} · ${product.category || t('product_detail_uncategorized')} · ${product.unit}`}
        actions={
          <button onClick={() => router.push('/inventory/products')} className="text-sm text-muted-foreground hover:underline">
            Back to Products
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: t('product_detail_stock'), value: `${fmt(product.stock_qty)} ${product.unit}`, danger: low },
          { label: t('product_detail_min_stock'), value: fmt(product.min_stock) },
          { label: t('product_detail_purchase_price'), value: fmt(product.purchase_price) },
          { label: t('product_detail_sale_price'), value: fmt(product.sale_price) },
        ].map(s => (
          <div key={s.label} className="rounded-lg border bg-card p-4">
            <p className="text-xs uppercase text-muted-foreground">{s.label}</p>
            <p className={`mt-1 text-lg font-bold ${s.danger ? 'text-red-600' : ''}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">{t('product_detail_adjustment')}</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('product_detail_quantity')}</label>
            <input
              type="number"
              step="0.01"
              value={qty}
              onChange={e => setQty(e.target.value)}
              className="w-32 rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5 flex-1">
            <label className="text-sm font-medium">{t('product_detail_note_optional')}</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder={t('product_detail_note_placeholder')}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => adjust(1)} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              + Add
            </button>
            <button onClick={() => adjust(-1)} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              − Remove
            </button>
          </div>
        </div>
        {msg && <p className="mt-3 text-sm text-green-600">{msg}</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
