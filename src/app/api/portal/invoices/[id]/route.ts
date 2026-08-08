import { NextResponse } from 'next/server'
import { createAdminClient } from '@/core/supabase/admin'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const admin = createAdminClient()

    const { data: invoice, error: invErr } = await admin
      .from('invoices')
      .select('*, companies!inner(name, email, phone)')
      .eq('id', id)
      .single()

    if (invErr || !invoice) {
      return NextResponse.json({ data: null, error: 'Invoice not found' }, { status: 404 })
    }

    const { data: items, error: itemErr } = await admin
      .from('invoice_items')
      .select('description, quantity, unit_price, amount, tax_rate, tax_amount')
      .eq('invoice_id', id)
      .order('sort_order')

    if (itemErr) {
      return NextResponse.json({ data: null, error: 'Failed to load items' }, { status: 500 })
    }

    // Strip sensitive fields, return only what the public needs
    const company = invoice.companies as Record<string, unknown>
    return NextResponse.json({
      data: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        status: invoice.status,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        discount: invoice.discount,
        total: invoice.total,
        currency: invoice.currency,
        notes: invoice.notes,
        company_name: company.name,
        company_email: company.email,
        company_phone: company.phone,
        items: items || [],
      },
      error: null,
    })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
