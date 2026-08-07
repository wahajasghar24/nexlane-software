'use client'

import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'

interface ItemRow { product_id: string; description: string; quantity: string; unit_price: string }
interface Product { id: string; name: string; sku: string; sale_price: number }

export default function NewSalesOrderPage() {
  const router = useRouter()
  const t = useTranslations('trx')
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState({ customer_id: '', valid_until: '', notes: '', tax_rate: '0' })
  const [items, setItems] = useState<ItemRow[]>([{ product_id: '', description: '', quantity: '1', unit_price: '0' }])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/crm/companies?limit=100').then(r => r.json()).then(d => {
      const data = d.data?.data || d.data || []
      setCustomers(Array.isArray(data) ? data : [])
    }).catch(() => {})
    fetch('/api/inventory/products?limit=100').then(r => r.json()).then(d => {
      const data = d.data?.data || d.data || []
      setProducts(Array.isArray(data) ? data : [])
    }).catch(() => {})
  }, [])

  const onProductChange = (i: number, productId: string) => {
    const prod = products.find(p => p.id === productId)
    setItems(prev => prev.map((it, idx) =>
      idx === i ? { ...it, product_id: productId, description: prod ? `${prod.name} (${prod.sku})` : it.description, unit_price: prod ? String(prod.sale_price) : it.unit_price } : it
    ))
  }

  const addRow = () => setItems(prev => [...prev, { product_id: '', description: '', quantity: '1', unit_price: '0' }])
  const removeRow = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))

  const subtotal = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0)
  const tax = (subtotal * (Number(form.tax_rate) || 0)) / 100

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        customer_id: form.customer_id || null,
        valid_until: form.valid_until || null,
        notes: form.notes || null,
        tax_rate: Number(form.tax_rate) || 0,
        items: items.map(it => ({
          product_id: it.product_id || null,
          description: it.description,
          quantity: Number(it.quantity) || 0,
          unit_price: Number(it.unit_price) || 0,
        })),
      }
      const res = await fetch('/api/sales/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to create quotation')
      router.push(`/sales/orders/${d.data.id}`)
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  const field = 'rounded-md border bg-background px-3 py-2 text-sm w-full'
  const label = 'text-sm font-medium text-foreground'

  return (
    <div className="max-w-4xl">
      <PageHeader title={t('sales_new_title')} description={t('sales_new_desc')} />
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</p>}
        <div className="grid grid-cols-3 gap-4 rounded-lg border bg-card p-5">
          <div className="space-y-1.5">
            <label className={label}>{t('sales_new_customer')}</label>
            <select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })} className={field}>
              <option value="">{t('sales_new_no_customer')}</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={label}>{t('sales_new_valid_until')}</label>
            <input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} className={field} />
          </div>
          <div className="space-y-1.5">
            <label className={label}>{t('sales_new_tax_rate')}</label>
            <input type="number" step="0.01" min="0" value={form.tax_rate} onChange={e => setForm({ ...form, tax_rate: e.target.value })} className={field} />
          </div>
          <div className="col-span-3 space-y-1.5">
            <label className={label}>{t('sales_new_notes')}</label>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={field} placeholder={t('sales_new_optional')} />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t('sales_new_items')}</h3>
            <button type="button" onClick={addRow} className="text-sm text-primary hover:underline">+ Add Item</button>
          </div>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="w-48 space-y-1.5">
                  <label className={label}>{t('sales_new_product')}</label>
                  <select value={it.product_id} onChange={e => onProductChange(i, e.target.value)} className={field}>
                    <option value="">—</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className={label}>{t('sales_new_desc_label')} *</label>
                  <input required value={it.description} onChange={e => setItems(prev => prev.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))} className={field} />
                </div>
                <div className="w-24 space-y-1.5">
                  <label className={label}>{t('sales_new_qty')} *</label>
                  <input required type="number" step="0.01" min="0.01" value={it.quantity} onChange={e => setItems(prev => prev.map((x, idx) => idx === i ? { ...x, quantity: e.target.value } : x))} className={field} />
                </div>
                <div className="w-32 space-y-1.5">
                  <label className={label}>{t('sales_new_unit_price')} *</label>
                  <input required type="number" step="0.01" min="0" value={it.unit_price} onChange={e => setItems(prev => prev.map((x, idx) => idx === i ? { ...x, unit_price: e.target.value } : x))} className={field} />
                </div>
                <button type="button" onClick={() => removeRow(i)} disabled={items.length === 1} className="mb-1 text-sm text-red-600 hover:underline disabled:opacity-40">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-6 border-t pt-3 text-sm">
            <span>Subtotal: <strong>{subtotal.toFixed(2)}</strong></span>
            <span>Tax: <strong>{tax.toFixed(2)}</strong></span>
            <span>Total: <strong>{ (subtotal + tax).toFixed(2) }</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {saving ? t('sales_new_saving') : t('sales_new_create')}
          </button>
          <button type="button" onClick={() => router.back()} className="text-sm text-muted-foreground hover:underline">Cancel</button>
        </div>
      </form>
    </div>
  )
}
