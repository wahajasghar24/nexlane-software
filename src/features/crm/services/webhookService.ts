import { createAdminClient } from '@/core/supabase/admin'
import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'

interface WebhookInvoiceItem {
  description: string
  quantity?: number
  unit_price?: number
  tax_rate?: number
}

interface WebhookCustomer {
  name: string
  email?: string
  phone?: string
}

interface WebhookInvoiceBody {
  type: 'invoice'
  customer: WebhookCustomer
  items: WebhookInvoiceItem[]
  currency?: string
  due_date?: string
  notes?: string
}

function parseDate(val: string | undefined, defaultDays: number): string {
  if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val
  const d = new Date()
  d.setDate(d.getDate() + defaultDays)
  return d.toISOString().slice(0, 10)
}

async function findOrCreateCustomer(
  supabase: ReturnType<typeof createAdminClient extends () => infer R ? () => R : never>,
  companyId: string,
  customer: WebhookCustomer
): Promise<string> {
  // Try find by email first
  if (customer.email) {
    const { data } = await supabase
      .from('crm_companies')
      .select('id')
      .eq('company_id', companyId)
      .ilike('email', customer.email)
      .single()
    if (data) return data.id
  }

  // Try find by name
  const { data: existing } = await supabase
    .from('crm_companies')
    .select('id')
    .eq('company_id', companyId)
    .ilike('name', customer.name)
    .single()
  if (existing) return existing.id

  // Create new company
  const { data: newCompany, error } = await supabase
    .from('crm_companies')
    .insert({
      company_id: companyId,
      name: customer.name,
      email: customer.email || null,
      phone: customer.phone || null,
      status: 'active',
    })
    .select('id')
    .single()

  if (error) throw new DatabaseError(error)
  return newCompany.id
}

async function createInvoiceFromWebhook(
  companyId: string,
  body: WebhookInvoiceBody,
  actorId: string | null
): Promise<{ invoice_id: string; invoice_number: string }> {
  const supabase = createAdminClient()

  // Find or create customer
  const customerId = await findOrCreateCustomer(supabase, companyId, body.customer)

  // Generate invoice number
  const now = new Date()
  const prefix = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const { count } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .like('invoice_number', `${prefix}%`)

  const seq = (count || 0) + 1
  const invoiceNumber = `${prefix}-${String(seq).padStart(4, '0')}`

  // Calculate totals
  let subtotal = 0
  let taxAmount = 0

  const itemRows = body.items.map((item, idx) => {
    const qty = item.quantity || 1
    const price = item.unit_price || 0
    const taxRate = item.tax_rate || 0
    const amount = qty * price
    const itemTax = amount * (taxRate / 100)
    subtotal += amount
    taxAmount += itemTax
    return {
      description: item.description,
      quantity: qty,
      unit_price: price,
      amount,
      tax_rate: taxRate,
      tax_amount: itemTax,
      sort_order: idx,
    }
  })

  const total = subtotal + taxAmount

  // Insert invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      company_id: companyId,
      invoice_number: invoiceNumber,
      customer_id: customerId,
      invoice_date: now.toISOString().slice(0, 10),
      due_date: parseDate(body.due_date, 30),
      subtotal,
      tax_amount: taxAmount,
      discount: 0,
      total,
      notes: body.notes || null,
      currency: body.currency || 'AED',
      status: 'draft',
      created_by: actorId,
    })
    .select('id, invoice_number')
    .single()

  if (invoiceError) throw new DatabaseError(invoiceError)

  // Insert invoice items
  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemRows.map((item) => ({
      ...item,
      invoice_id: invoice.id,
    })))

  if (itemsError) throw new DatabaseError(itemsError)

  // Log activity
  await supabase.from('activity_logs').insert({
    company_id: companyId,
    actor_id: actorId,
    entity_type: 'invoice',
    entity_id: invoice.id,
    action: 'invoice_created_via_webhook',
    new_data: {
      invoice_number: invoiceNumber,
      customer: body.customer.name,
      total,
      currency: body.currency || 'AED',
    },
  })

  return { invoice_id: invoice.id, invoice_number: invoiceNumber }
}

export const n8nWebhookService = {
  async receive(companyId: string, headers: Record<string, string>, body: Record<string, unknown>) {
    const supabase = createAdminClient()

    // Verify n8n API key
    const { data: settings, error } = await supabase
      .from('company_settings')
      .select('value')
      .eq('company_id', companyId)
      .eq('key', 'n8n_api_key')
      .single()
    if (error) throw new DatabaseError(error)
    const apiKey = settings?.value as string | null
    const incomingKey = headers['x-n8n-api-key']
    if (!apiKey || incomingKey !== apiKey) {
      throw new Error('Invalid n8n API key')
    }

    const bodyType = body.type as string | undefined

    // Route to handler based on body type
    if (bodyType === 'invoice') {
      const invoiceBody = body as unknown as WebhookInvoiceBody
      if (!invoiceBody.customer?.name || !invoiceBody.items?.length) {
        throw new Error('Invoice webhook requires customer.name and items[]')
      }
      const result = await createInvoiceFromWebhook(companyId, invoiceBody, null)
      return { received: true, ...result }
    }

    // Fallback: log as activity (backward compatible)
    const { error: logError } = await supabase
      .from('activity_logs')
      .insert({
        company_id: companyId,
        actor_id: null,
        entity_type: 'system',
        entity_id: companyId,
        action: 'n8n_webhook_received',
        new_data: { headers: { 'content-type': headers['content-type'] }, body: { type: body.type, action: body.action } },
      })
    if (logError) throw new DatabaseError(logError)
    return { received: true }
  },

  async getApiKey(companyId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('company_settings')
      .select('value')
      .eq('company_id', companyId)
      .eq('key', 'n8n_api_key')
      .single()
    if (error) return null
    return data?.value as string | null
  },

  async setWebhookUrl(companyId: string, url: string) {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('company_settings')
      .upsert({
        company_id: companyId,
        key: 'n8n_webhook_url',
        value: url,
      }, { onConflict: 'company_id,key' })
    if (error) throw new DatabaseError(error)
  },
}
