'use client'

import { useTranslations } from 'next-intl'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/shared/components/page-header'
import { useConfirm } from '@/shared/hooks/use-confirm-dialog'

const fmt = (n: number) =>
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function SalesOrderDetailPage() {
  const t = useTranslations('trx')
  const { id } = useParams()
  const router = useRouter()
  const confirm = useConfirm()
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    fetch(`/api/sales/orders/${id}`)
      .then(r => r.json())
      .then(d => setOrder(d.data))
      .catch(() => setError(t('sales_detail_failed_load')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const handleConfirm = async () => {
    if (!(await confirm(t('sales_detail_confirm_confirm')))) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/sales/orders/${id}/confirm`, { method: 'POST' })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || t('sales_detail_confirm_failed'))
      load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="p-8 text-sm text-muted-foreground">{t('sales_detail_loading')}</div>
  if (!order) return <div className="p-8 text-sm text-red-600">{error || t('sales_detail_not_found')}</div>

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={order.order_number}
        description={`${order.customer?.name || t('sales_detail_no_customer')} · ${new Date(order.created_at).toLocaleDateString()}`}
        actions={
          <button onClick={() => router.push('/sales/orders')} className="text-sm text-muted-foreground hover:underline">
            Back to Sales Orders
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[order.status] || statusColors.draft}`}>
          {order.status}
        </span>
        {order.invoice && (
          <span className="text-xs text-muted-foreground">
            Invoice: <button onClick={() => router.push(`/accounting/invoices/${order.invoice.id}`)} className="font-mono text-primary hover:underline">{order.invoice.invoice_number}</button>
          </span>
        )}
        {order.status === 'draft' && (
          <button
            onClick={handleConfirm}
            disabled={busy}
            className="ml-auto rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? t('sales_detail_confirming') : t('sales_detail_confirm_order')}
          </button>
        )}
      </div>

      {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</p>}

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3">{t('sales_detail_col_product')}</th>
                <th className="px-4 py-3">{t('sales_detail_col_description')}</th>
                <th className="px-4 py-3 text-right">{t('sales_detail_col_qty')}</th>
                <th className="px-4 py-3 text-right">{t('sales_detail_col_unit_price')}</th>
                <th className="px-4 py-3 text-right">{t('sales_detail_col_total')}</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((it: any) => (
                <tr key={it.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{it.product?.sku || '—'}</td>
                  <td className="px-4 py-3">{it.description}</td>
                  <td className="px-4 py-3 text-right">{it.quantity}</td>
                  <td className="px-4 py-3 text-right">{fmt(it.unit_price)}</td>
                  <td className="px-4 py-3 text-right font-medium">{fmt(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-6 border-t px-4 py-3 text-sm">
          <span>Subtotal: <strong>{fmt(order.subtotal)}</strong></span>
          <span>Tax: <strong>{fmt(order.tax_amount)}</strong></span>
          <span className="text-base">Total: <strong>{fmt(order.total)}</strong></span>
        </div>
      </div>

      {order.notes && (
        <p className="mt-4 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{t('sales_detail_notes_label')}</span> {order.notes}
        </p>
      )}
    </div>
  )
}
