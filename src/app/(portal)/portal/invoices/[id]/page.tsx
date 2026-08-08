'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'

interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
  tax_rate: number
  tax_amount: number
}

interface InvoiceData {
  id: string
  invoice_number: string
  status: string
  invoice_date: string
  due_date: string
  subtotal: number
  tax_amount: number
  discount: number
  total: number
  currency: string | null
  notes: string | null
  company_name: string
  company_email: string | null
  company_phone: string | null
  items: InvoiceItem[]
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/portal/invoices/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Invoice not found')
        const json = await res.json()
        if (json.error) throw new Error(json.error)
        setInvoice(json.data)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading invoice…</div>
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>
  if (!invoice) return null

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</h2>
          <p className="text-sm text-gray-500 mt-1">From {invoice.company_name}</p>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[invoice.status] ?? 'bg-gray-100 text-gray-800'}`}>
          {invoice.status}
        </span>
      </div>

      {/* Dates & Contact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Invoice Date</p>
          <p className="font-medium">{invoice.invoice_date}</p>
        </div>
        <div>
          <p className="text-gray-500">Due Date</p>
          <p className="font-medium">{invoice.due_date}</p>
        </div>
        {invoice.company_email && (
          <div>
            <p className="text-gray-500">Contact</p>
            <p className="font-medium">{invoice.company_email}</p>
          </div>
        )}
        {invoice.company_phone && (
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium">{invoice.company_phone}</p>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-3 pr-4">Description</th>
              <th className="py-3 pr-4 text-right">Qty</th>
              <th className="py-3 pr-4 text-right">Unit Price</th>
              <th className="py-3 pr-4 text-right">Tax</th>
              <th className="py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3 pr-4">{item.description}</td>
                <td className="py-3 pr-4 text-right">{item.quantity}</td>
                <td className="py-3 pr-4 text-right">{fmt(item.unit_price)}</td>
                <td className="py-3 pr-4 text-right">{item.tax_rate}%</td>
                <td className="py-3 text-right font-medium">{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{fmt(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tax</span>
            <span>{fmt(invoice.tax_amount)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Discount</span>
              <span>-{fmt(invoice.discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
            <span>Total</span>
            <span>{invoice.currency ?? ''} {fmt(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
          <p className="font-medium text-gray-700 mb-1">Notes</p>
          <p>{invoice.notes}</p>
        </div>
      )}

      {/* Pay Now */}
      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
        <div className="text-center pt-4">
          <Link
            href={`/portal/invoices/${id}/pay`}
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Pay Now
          </Link>
        </div>
      )}
    </div>
  )
}
