import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { AppError } from '@/core/errors/app-error'
import type { PaginatedResult } from '@/core/types/common'
import {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  purchaseOrderQuerySchema,
} from '@/features/purchase/schemas/purchase-order.schema'
import type {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  PurchaseOrderQuery,
} from '@/features/purchase/schemas/purchase-order.schema'

const padNum = (n: number, w: number) => String(n).padStart(w, '0')

export const purchaseOrderService = {
  async generateOrderNumber(companyId: string): Promise<string> {
    const supabase = await createClient()
    const now = new Date()
    const prefix = `PO-${now.getFullYear()}${padNum(now.getMonth() + 1, 2)}-`
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('order_number')
      .eq('company_id', companyId)
      .ilike('order_number', `${prefix}%`)
      .order('order_number', { ascending: false })
      .limit(1)
    if (error) throw new DatabaseError(error)
    const lastSeq = data?.[0]?.order_number
    const nextSeq = lastSeq ? parseInt(lastSeq.slice(prefix.length), 10) + 1 : 1
    return `${prefix}${padNum(nextSeq, 5)}`
  },

  async list(companyId: string, query: PurchaseOrderQuery): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = purchaseOrderQuerySchema.parse(query)
    const supabase = await createClient()

    let dbQuery = supabase
      .from('purchase_orders')
      .select(`
        *,
        vendor:vendor_id(id, name, email, phone)
      `, { count: 'exact' })
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (parsed.search) {
      dbQuery = dbQuery.or(`order_number.ilike.%${parsed.search}%,notes.ilike.%${parsed.search}%`)
    }
    if (parsed.status) dbQuery = dbQuery.eq('status', parsed.status)

    const offset = (parsed.page - 1) * parsed.limit
    const { data, error, count } = await dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + parsed.limit - 1)
    if (error) throw new DatabaseError(error)

    return {
      data: data || [],
      total: count || 0,
      page: parsed.page,
      pageSize: parsed.limit,
      totalPages: Math.ceil((count || 0) / parsed.limit),
    }
  },

  async getById(companyId: string, orderId: string) {
    const supabase = await createClient()
    const { data: order, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        vendor:vendor_id(id, name, email, phone)
      `)
      .eq('id', orderId)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .single()
    if (error) throw new DatabaseError(error)

    const { data: items, error: itemsError } = await supabase
      .from('purchase_order_items')
      .select(`
        *,
        product:product_id(id, sku, name, unit, stock_qty)
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
    if (itemsError) throw new DatabaseError(itemsError)

    return { ...order, items: items || [] }
  },

  async create(companyId: string, input: CreatePurchaseOrderInput, actorId: string) {
    const parsed = createPurchaseOrderSchema.parse(input)
    const supabase = await createClient()

    const orderNumber = await this.generateOrderNumber(companyId)
    const subtotal = parsed.items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
    const taxAmount = (subtotal * parsed.tax_rate) / 100

    const { data: order, error } = await supabase
      .from('purchase_orders')
      .insert({
        company_id: companyId,
        order_number: orderNumber,
        vendor_id: parsed.vendor_id,
        expected_date: parsed.expected_date,
        notes: parsed.notes,
        subtotal,
        tax_amount: taxAmount,
        total: subtotal + taxAmount,
        created_by: actorId,
      })
      .select()
      .single()
    if (error) throw new DatabaseError(error)

    const items = parsed.items.map((i) => ({
      company_id: companyId,
      order_id: order.id,
      product_id: i.product_id,
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total: i.quantity * i.unit_price,
    }))
    const { error: itemsError } = await supabase.from('purchase_order_items').insert(items)
    if (itemsError) throw new DatabaseError(itemsError)

    return this.getById(companyId, order.id)
  },

  async update(companyId: string, orderId: string, input: UpdatePurchaseOrderInput, actorId: string) {
    const parsed = updatePurchaseOrderSchema.parse(input)
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('purchase_orders')
      .select('status, subtotal')
      .eq('id', orderId)
      .eq('company_id', companyId)
      .single()
    if (!existing) throw new AppError('NOT_FOUND', 'Purchase order not found', 404)
    if (existing.status !== 'draft') {
      throw new AppError('CONFLICT', 'Only draft purchase orders can be edited', 409)
    }

    let subtotal = existing.subtotal
    if (parsed.items) {
      subtotal = parsed.items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
    }
    const taxRate = parsed.tax_rate ?? 0
    const taxAmount = (subtotal * taxRate) / 100

    const { data: order, error } = await supabase
      .from('purchase_orders')
      .update({
        vendor_id: parsed.vendor_id,
        expected_date: parsed.expected_date,
        notes: parsed.notes,
        tax_amount: taxAmount,
        subtotal,
        total: subtotal + taxAmount,
        updated_by: actorId,
      })
      .eq('id', orderId)
      .eq('company_id', companyId)
      .select()
      .single()
    if (error) throw new DatabaseError(error)

    if (parsed.items) {
      const { error: delErr } = await supabase.from('purchase_order_items').delete().eq('order_id', orderId)
      if (delErr) throw new DatabaseError(delErr)

      const items = parsed.items.map((i) => ({
        company_id: companyId,
        order_id: orderId,
        product_id: i.product_id,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total: i.quantity * i.unit_price,
      }))
      const { error: itemsError } = await supabase.from('purchase_order_items').insert(items)
      if (itemsError) throw new DatabaseError(itemsError)
    }

    return this.getById(companyId, orderId)
  },

  async cancel(companyId: string, orderId: string, actorId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({ status: 'cancelled', updated_by: actorId })
      .eq('id', orderId)
      .eq('company_id', companyId)
      .eq('status', 'draft')
      .select()
      .single()
    if (error) throw new DatabaseError(error)
    return data
  },

  async softDelete(companyId: string, orderId: string, actorId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('purchase_orders')
      .update({ deleted_at: new Date().toISOString(), deleted_by: actorId })
      .eq('id', orderId)
      .eq('company_id', companyId)
      .eq('status', 'draft')
    if (error) throw new DatabaseError(error)
  },

  /** Odoo-style receive: confirmed -> received; each item writes a +qty
   *  stock_movement and stock is added to the product. */
  async receive(companyId: string, orderId: string, actorId: string) {
    const supabase = await createClient()

    const { data: order, error: orderError } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', orderId)
      .eq('company_id', companyId)
      .in('status', ['draft', 'sent', 'confirmed'])
      .single()
    if (orderError) throw new DatabaseError(orderError)
    if (!order) throw new AppError('CONFLICT', 'Only draft/sent/confirmed purchase orders can be received', 409)

    const { data: items, error: itemsError } = await supabase
      .from('purchase_order_items')
      .select('*')
      .eq('order_id', orderId)
    if (itemsError) throw new DatabaseError(itemsError)

    for (const item of items) {
      if (!item.product_id) continue
      const { error: mvErr } = await supabase.from('stock_movements').insert({
        company_id: companyId,
        product_id: item.product_id,
        quantity: item.quantity,
        movement_type: 'purchase_receipt',
        reference_type: 'purchase_order',
        reference_id: orderId,
        created_by: actorId,
      })
      if (mvErr) throw new DatabaseError(mvErr)

      const { error: rpcErr } = await supabase.rpc('adjust_product_stock', {
        p_company_id: companyId,
        p_product_id: item.product_id,
        p_delta: item.quantity,
      })
      if (rpcErr) throw new DatabaseError(rpcErr)
    }

    const { data: updated, error: upErr } = await supabase
      .from('purchase_orders')
      .update({ status: 'received', updated_by: actorId })
      .eq('id', orderId)
      .eq('company_id', companyId)
      .select()
      .single()
    if (upErr) throw new DatabaseError(upErr)

    return this.getById(companyId, orderId)
  },
}
