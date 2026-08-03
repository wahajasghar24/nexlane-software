import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import { warehouseSchema, warehouseQuerySchema } from '@/features/inventory/schemas/warehouse.schema'
import type { CreateWarehouseInput, UpdateWarehouseInput, WarehouseQuery } from '@/features/inventory/schemas/warehouse.schema'
import type { PaginatedResult } from '@/core/types/common'

export const warehouseService = {
  async list(companyId: string, query: WarehouseQuery): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = warehouseQuerySchema.parse(query)
    const supabase = await createClient()
    const { data, count, error } = await supabase
      .from('warehouses')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: true })
      .range((parsed.page - 1) * parsed.limit, parsed.page * parsed.limit - 1)
    if (error) throw new DatabaseError(error)
    return { data: data || [], total: count || 0, page: parsed.page, pageSize: parsed.limit, totalPages: Math.ceil((count || 0) / parsed.limit) }
  },

  async create(companyId: string, input: CreateWarehouseInput, actorId: string) {
    const parsed = warehouseSchema.parse(input)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('warehouses')
      .insert({ company_id: companyId, ...parsed, created_by: actorId })
      .select()
      .single()
    if (error) throw new DatabaseError(error)
    await eventBus.emit({
      companyId,
      eventType: EventTypes.PRODUCT_UPDATED,
      entityType: 'warehouse',
      entityId: data.id,
      payload: { name: data.name, code: data.code },
    })
    return data
  },

  async update(companyId: string, warehouseId: string, input: UpdateWarehouseInput, actorId: string) {
    const parsed = warehouseSchema.parse(input)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('warehouses')
      .update({ ...parsed })
      .eq('id', warehouseId)
      .eq('company_id', companyId)
      .select()
      .single()
    if (error) throw new DatabaseError(error)
    return data
  },

  async remove(companyId: string, warehouseId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('warehouses').delete().eq('id', warehouseId).eq('company_id', companyId)
    if (error) throw new DatabaseError(error)
  },
}