'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { PageHeader } from '@/shared/components/page-header'

interface InvoiceItem {
  id: string
  description: string
  quantity: string
  unit_price: string
  tax_rate: string
}

export default function NewInvoicePage() {
  const t = useTranslations('acc')
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [fxRate, setFxRate] = useState('1')
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: '1', unit_price: '', tax_rate: '0' },
  ])

  const addItem = () => {
    setItems(prev => [...prev, { id: String(Date.now()), description: '', quantity: '1', unit_price: '', tax_rate: '0' }])
  }

  const removeItem = (id: string) => {
    if (items.length <= 1) return
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const calcAmount = (item: InvoiceItem) => {
    const qty = parseFloat(item.quantity) || 0
    const price = parseFloat(item.unit_price) || 0
    return qty * price
  }

  const calcTax = (item: InvoiceItem) => {
    const amount = calcAmount(item)
    const taxRate = parseFloat(item.tax_rate) || 0
    return amount * (taxRate / 100)
  }

  const subtotal = items.reduce((sum, i) => sum + calcAmount(i), 0)
  const totalTax = items.reduce((sum, i) => sum + calcTax(i), 0)
  const total = subtotal + totalTax

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId.trim() || !invoiceDate || !dueDate || submitting) return
    setSubmitting(true)
    try {
      const body = {
        customer_id: customerId,
        invoice_date: new Date(invoiceDate).toISOString(),
        due_date: new Date(dueDate).toISOString(),
        notes: notes || undefined,
        currency,
        fx_rate: parseFloat(fxRate) || undefined,
        items: items
          .filter(i => i.description)
          .map(i => ({
            description: i.description,
            quantity: parseFloat(i.quantity) || 1,
            unit_price: parseFloat(i.unit_price) || 0,
            tax_rate: parseFloat(i.tax_rate) || 0,
          })),
      }

      const res = await fetch('/api/accounting/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(t('new_invoice.created_success'))
        router.push('/accounting/invoices')
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || t('new_invoice.failed'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title={t('new_invoice.title')} description={t('new_invoice.description')} />

      <div className="max-w-4xl rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('new_invoice.customer_id')}</label>
              <input
                type="text" required value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={t('new_invoice.customer_id_placeholder')}
              />
              <p className="text-xs text-muted-foreground mt-1">{t('new_invoice.customer_id_hint')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('new_invoice.invoice_date')}</label>
              <input
                type="date" required value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('new_invoice.due_date')}</label>
              <input
                type="date" required value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('new_invoice.currency')}</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {['PKR', 'USD', 'AED', 'QAR'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('new_invoice.fx_rate')}</label>
              <input
                type="number" min="0" step="any" value={fxRate}
                onChange={e => setFxRate(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={t('new_invoice.fx_rate_placeholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('new_invoice.notes')}</label>
            <textarea
              rows={2} value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder={t('new_invoice.optional_notes')}
            />
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{t('new_invoice.invoice_items')}</h3>
              <button
                type="button"
                onClick={addItem}
                className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                {t('new_invoice.add_item')}
              </button>
            </div>

            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground min-w-[200px]">{t('new_invoice.description')}</th>
                    <th className="text-right p-2 text-xs font-medium text-muted-foreground">{t('new_invoice.qty')}</th>
                    <th className="text-right p-2 text-xs font-medium text-muted-foreground">{t('new_invoice.unit_price')}</th>
                    <th className="text-right p-2 text-xs font-medium text-muted-foreground">{t('new_invoice.tax_pct')}</th>
                    <th className="text-right p-2 text-xs font-medium text-muted-foreground">{t('new_invoice.amount')}</th>
                    <th className="w-10 p-2" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="border-b last:border-b-0">
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => updateItem(item.id, 'description', e.target.value)}
                          className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                          placeholder={t('new_invoice.item_placeholder', { n: idx + 1 })}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.quantity}
                          onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                          className="w-20 rounded-md border bg-background px-2 py-1.5 text-sm text-right"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                          className="w-24 rounded-md border bg-background px-2 py-1.5 text-sm text-right"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.tax_rate}
                          onChange={e => updateItem(item.id, 'tax_rate', e.target.value)}
                          className="w-20 rounded-md border bg-background px-2 py-1.5 text-sm text-right"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-2 text-sm text-right font-medium">
                        {formatCurrency(calcAmount(item) + calcTax(item))}
                      </td>
                      <td className="p-2">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
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
                    <td colSpan={4} className="p-2 text-sm text-right text-muted-foreground">{t('new_invoice.subtotal')}</td>
                    <td className="p-2 text-sm text-right font-medium">{formatCurrency(subtotal)}</td>
                    <td />
                  </tr>
                  <tr className="bg-muted/30">
                    <td colSpan={4} className="p-2 text-sm text-right text-muted-foreground">{t('new_invoice.tax_total')}</td>
                    <td className="p-2 text-sm text-right font-medium">{formatCurrency(totalTax)}</td>
                    <td />
                  </tr>
                  <tr className="bg-muted/30 border-t">
                    <td colSpan={4} className="p-2 text-sm text-right font-semibold">{t('new_invoice.total')}</td>
                    <td className="p-2 text-sm text-right font-bold">{formatCurrency(total)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!customerId.trim() || !dueDate || submitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? t('new_invoice.creating') : t('new_invoice.create_invoice')}
            </button>
            <button type="button" onClick={() => router.back()} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
              {t('new_invoice.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}