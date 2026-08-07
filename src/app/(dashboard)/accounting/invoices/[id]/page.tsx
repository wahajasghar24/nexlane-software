'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { PageHeader } from '@/shared/components/page-header'
import Link from 'next/link'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  amount: number
}

interface Invoice {
  id: string
  invoice_number: string
  customer_id: string
  invoice_date: string
  due_date: string
  status: string
  notes?: string
  subtotal: number
  tax_amount: number
  total: number
  items: InvoiceItem[]
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

export default function InvoiceDetailPage() {
  const t = useTranslations('acc')
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const id = params.id as string

  const fetchInvoice = () => {
    fetch(`/api/accounting/invoices/${id}`)
      .then(r => r.json())
      .then(d => {
        const data = d.data || d
        setInvoice(data)
      })
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (id) fetchInvoice()
  }, [id])

  const updateStatus = async (status: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/accounting/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setInvoice(prev => prev ? { ...prev, status } : prev)
      }
    } finally {
      setUpdating(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  if (loading) {
    return (
      <div>
        <PageHeader title={t('invoice_detail.title')} />
        <div className="rounded-lg border bg-card p-6 animate-pulse space-y-4">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
          <div className="h-20 w-full bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div>
        <PageHeader title={t('invoice_detail.not_found')} />
        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="text-muted-foreground mb-4">{t('invoice_detail.not_found_hint')}</p>
          <Link href="/accounting/invoices" className="text-sm text-primary hover:underline">
            {t('invoice_detail.back_to_invoices')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`Invoice #${invoice.invoice_number}`}
        description={t('invoice_detail.status_label', { status: t(`status.${invoice.status}`) })}
        actions={
          <div className="flex items-center gap-2">
            {invoice.status === 'draft' && (
              <button
                onClick={() => updateStatus('sent')}
                disabled={updating}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {updating ? t('invoice_detail.updating') : t('invoice_detail.mark_as_sent')}
              </button>
            )}
            {(invoice.status === 'sent' || invoice.status === 'overdue') && (
              <button
                onClick={() => updateStatus('paid')}
                disabled={updating}
                className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {updating ? t('invoice_detail.updating') : t('invoice_detail.record_payment')}
              </button>
            )}
            <Link
              href="/accounting/invoices"
              className="rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              {t('invoice_detail.back')}
            </Link>
          </div>
        }
      />

      <div className="rounded-lg border bg-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(invoice.status)}`}>
            {t(`status.${invoice.status}`)}
          </span>
          <span className="text-sm text-muted-foreground">Invoice #{invoice.invoice_number}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('invoice_detail.customer_id')}</p>
            <p className="text-sm font-mono">{invoice.customer_id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('invoice_detail.invoice_date')}</p>
            <p className="text-sm">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('invoice_detail.due_date')}</p>
            <p className="text-sm">{new Date(invoice.due_date).toLocaleDateString()}</p>
          </div>
        </div>

        {invoice.notes && (
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-1">{t('invoice_detail.notes')}</p>
            <p className="text-sm">{invoice.notes}</p>
          </div>
        )}

        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('invoice_detail.description')}</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('invoice_detail.qty')}</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('invoice_detail.unit_price')}</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('invoice_detail.tax')}</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('invoice_detail.amount')}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item: InvoiceItem) => (
                <tr key={item.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="p-3 text-sm">{item.description}</td>
                  <td className="p-3 text-sm text-right">{item.quantity}</td>
                  <td className="p-3 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="p-3 text-sm text-right">{item.tax_rate}%</td>
                  <td className="p-3 text-sm text-right font-medium">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/30">
                <td colSpan={4} className="p-3 text-sm text-right text-muted-foreground">{t('invoice_detail.subtotal')}</td>
                <td className="p-3 text-sm text-right font-medium">{formatCurrency(invoice.subtotal)}</td>
              </tr>
              <tr className="bg-muted/30">
                <td colSpan={4} className="p-3 text-sm text-right text-muted-foreground">{t('invoice_detail.tax_total')}</td>
                <td className="p-3 text-sm text-right font-medium">{formatCurrency(invoice.tax_amount)}</td>
              </tr>
              <tr className="bg-muted/30 border-t">
                <td colSpan={4} className="p-3 text-sm text-right font-semibold">{t('invoice_detail.total')}</td>
                <td className="p-3 text-sm text-right font-bold">{formatCurrency(invoice.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}