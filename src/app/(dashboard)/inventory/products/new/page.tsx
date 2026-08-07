'use client'

import { useTranslations } from 'next-intl'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'

export default function NewProductPage() {
  const router = useRouter()
  const t = useTranslations('inv')
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
      <PageHeader title={t('product_new_title')} description={t('product_new_description')} />
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-5">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={label}>{t('product_sku')} *</label>
            <input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className={field} placeholder={t('product_sku_placeholder')} />
          </div>
          <div className="space-y-1.5">
            <label className={label}>{t('product_name')} *</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={field} placeholder={t('product_name_placeholder')} />
          </div>
          <div className="space-y-1.5">
            <label className={label}>{t('product_category')}</label>
            <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={field} placeholder={t('product_category_placeholder')} />
          </div>
          <div className="space-y-1.5">
            <label className={label}>{t('product_unit')}</label>
            <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className={field}>
              {['pcs', 'kg', 'g', 'l', 'm', 'box', 'hour', 'day'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={label}>{t('product_purchase_price')}</label>
            <input type="number" step="0.01" min="0" value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: e.target.value })} className={field} />
          </div>
          <div className="space-y-1.5">
            <label className={label}>{t('product_sale_price')}</label>
            <input type="number" step="0.01" min="0" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} className={field} />
          </div>
          <div className="space-y-1.5">
            <label className={label}>{t('product_min_stock')}</label>
            <input type="number" step="0.01" min="0" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: e.target.value })} className={field} />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? t('product_saving') : t('product_create')}
          </button>
          <button type="button" onClick={() => router.back()} className="text-sm text-muted-foreground hover:underline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
