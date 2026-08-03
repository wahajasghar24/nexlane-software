import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import type { PaginatedResult } from '@/core/types/common'
import { createProductSchema, updateProductSchema, productQuerySchema, stockAdjustSchema } from '@/features/inventory/schemas/product.schema'
import type { CreateProductInput, UpdateProductInput, ProductQuery, StockAdjustInput } from '@/features/inventory/schemas/product.schema'

export const productService = {
  async list(companyId: string, query: ProductQuery): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = productQuerySchema.parse(query)
    const supabase = await createClient()

    let dbQuery = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (parsed.search) {
      dbQuery = dbQuery.or(`name.ilike.%${parsed.search}%,sku.ilike.%${parsed.search}%,category.ilike.%${parsed.search}%`)
    }
    if (parsed.category) dbQuery = dbQuery.eq('category', parsed.category)
    if (parsed.is_active === 'true') dbQuery = dbQuery.eq('is_active', true)
    if (parsed.is_active === 'false') dbQuery = dbQuery.eq('is_active', false)

    const offset = (parsed.page - 1) * parsed.limit
    const { data, error, count } = await dbQuery
      .order('name', { ascending: true })
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

  async getById(companyId: string, productId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .single()
    if (error) throw new DatabaseError(error)
    return data
  },

  async create(companyId: string, input: CreateProductInput, actorId: string) {
    const parsed = createProductSchema.parse(input)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .insert({
        company_id: companyId,
        sku: parsed.sku,
        name: parsed.name,
        description: parsed.description,
        category: parsed.category,
        unit: parsed.unit,
        purchase_price: parsed.purchase_price,
        sale_price: parsed.sale_price,
        min_stock: parsed.min_stock,
        created_by: actorId,
      })
      .select()
      .single()
    if (error) throw new DatabaseError(error)
    return data
  },

  async update(companyId: string, productId: string, input: UpdateProductInput, actorId: string) {
    const parsed = updateProductSchema.parse(input)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .update({ ...parsed, updated_by: actorId })
      .eq('id', productId)
      .eq('company_id', companyId)
      .select()
      .single()
    if (error) throw new DatabaseError(error)
    return data
  },

  async softDelete(companyId: string, productId: string, actorId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString(), deleted_by: actorId })
      .eq('id', productId)
      .eq('company_id', companyId)
    if (error) throw new DatabaseError(error)
  },

  /** Manual stock adjustment — writes a stock_movement and updates product.stock_qty. */
  async adjustStock(companyId: string, productId: string, input: StockAdjustInput, actorId: string) {
    const parsed = stockAdjustSchema.parse(input)
    const supabase = await createClient()

    const { data: movement, error: mvErr } = await supabase
      .from('stock_movements')
      .insert({
        company_id: companyId,
        product_id: productId,
        quantity: parsed.quantity,
        movement_type: 'adjustment',
        note: parsed.note,
        created_by: actorId,
      })
      .select('id')
      .single()
    if (mvErr) throw new DatabaseError(mvErr)

    const { error: upErr } = await supabase.rpc('adjust_product_stock', {
      p_company_id: companyId,
      p_product_id: productId,
      p_delta: parsed.quantity,
    })
    if (upErr) throw new DatabaseError(upErr)

    return movement
  },
}
