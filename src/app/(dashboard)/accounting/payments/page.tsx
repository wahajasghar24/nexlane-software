'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'

interface Payment {
  id: string
  invoice_id?: string
  customer_id?: string
  amount: number
  payment_date: string
  method: string
  reference?: string
  notes?: string
  invoice?: { invoice_number: string }
}

const paymentMethodColors: Record<string, string> = {
  cash: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  bank: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  check: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  credit_card: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

export default function PaymentsPage() {
  const t = useTranslations('acc')
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [form, setForm] = useState({
    invoice_id: '', amount: '', payment_date: new Date().toISOString().split('T')[0],
    method: 'bank', reference: '', notes: '',
  })

  const fetchPayments = () => {
    fetch(`/api/accounting/payments?page=${page}&limit=20`)
      .then(r => r.json())
      .then(d => {
        const data = d.data?.data || (d?.data) || (Array.isArray(d) ? d : [])
        setPayments(Array.isArray(data) ? data : [])
        setTotalPages(d.totalPages || d.data?.totalPages || Math.ceil((d.total || 0) / 20) || 1)
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPayments()
  }, [page])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body: Record<string, any> = {
        amount: parseFloat(form.amount),
        payment_date: new Date(form.payment_date).toISOString(),
        method: form.method,
      }
      if (form.invoice_id) body.invoice_id = form.invoice_id
      if (form.reference) body.reference = form.reference
      if (form.notes) body.notes = form.notes

      const res = await fetch('/api/accounting/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setForm({ invoice_id: '', amount: '', payment_date: new Date().toISOString().split('T')[0], method: 'bank', reference: '', notes: '' })
        setShowForm(false)
        fetchPayments()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  return (
    <div>
      <PageHeader
        title={t('payments.title')}
        description={t('payments.description')}
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {showForm ? t('payments.cancel') : t('payments.new_payment')}
          </button>
        }
      />

      {showForm && (
        <div className="max-w-2xl rounded-lg border bg-card p-6 mb-6">
          <h3 className="text-base font-semibold mb-4">{t('payments.record_payment')}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('payments.amount')}</label>
                <input
                  type="number" required min="0.01" step="0.01" value={form.amount}
                  onChange={e => update('amount', e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('payments.payment_date')}</label>
                <input
                  type="date" required value={form.payment_date}
                  onChange={e => update('payment_date', e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('payments.payment_method')}</label>
                <select value={form.method} onChange={e => update('method', e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="cash">{t('payment_methods.cash')}</option>
                  <option value="bank">{t('payment_methods.bank')}</option>
                  <option value="check">{t('payment_methods.check')}</option>
                  <option value="credit_card">{t('payment_methods.credit_card')}</option>
                  <option value="other">{t('payment_methods.other')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('payments.reference')}</label>
                <input
                  type="text" value={form.reference}
                  onChange={e => update('reference', e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder={t('payments.reference_placeholder')}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('payments.invoice_id')}</label>
              <input
                type="text" value={form.invoice_id}
                onChange={e => update('invoice_id', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={t('payments.invoice_id_placeholder')}
              />
              <p className="text-xs text-muted-foreground mt-1">{t('payments.invoice_id_hint')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('payments.notes')}</label>
              <textarea
                rows={2} value={form.notes}
                onChange={e => update('notes', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={t('payments.optional_notes')}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting || !form.amount} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {submitting ? t('payments.recording') : t('payments.record_payment')}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">{t('payments.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="h-5 w-48 bg-muted rounded mb-2" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          title={t('payments.no_payments')}
          description={t('payments.no_payments_hint')}
          action={
            <button onClick={() => setShowForm(true)} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              {t('payments.new_payment')}
            </button>
          }
        />
      ) : (
        <>
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('payments.date')}</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('payments.amount_col')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('payments.method')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('payments.invoice')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('payments.reference')}</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('payments.notes_col')}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(pmt => (
                  <tr key={pmt.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="p-3 text-sm">{new Date(pmt.payment_date).toLocaleDateString()}</td>
                    <td className="p-3 text-sm text-right font-medium">{formatCurrency(pmt.amount)}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${paymentMethodColors[pmt.method] || paymentMethodColors.other}`}>
                        {t(`payment_methods.${pmt.method}`)}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{pmt.invoice?.invoice_number || pmt.invoice_id || '-'}</td>
                    <td className="p-3 text-sm text-muted-foreground">{pmt.reference || '-'}</td>
                    <td className="p-3 text-sm text-muted-foreground max-w-[150px] truncate">{pmt.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <p className="text-sm text-muted-foreground">{t('payments.page_of', { page, total: totalPages })}</p>
            <div className="flex gap-2">
              <button
                onClick={() => { setLoading(true); setPage(p => Math.max(1, p - 1)) }}
                disabled={page <= 1}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
              >
                {t('payments.previous')}
              </button>
              <button
                onClick={() => { setLoading(true); setPage(p => p + 1) }}
                disabled={page >= totalPages}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
              >
                {t('payments.next')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}