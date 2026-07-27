import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import type { PaginatedResult } from '@/core/types/common'
import {
  createDealSchema,
  updateDealSchema,
  dealQuerySchema,
  wonDealSchema,
  lostDealSchema,
} from '@/features/crm/schemas'
import type { CreateDealInput, UpdateDealInput, DealQuery, WonDealInput, LostDealInput } from '@/features/crm/schemas'

export const dealService = {
  async list(companyId: string, query: DealQuery): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = dealQuerySchema.parse(query)
    const supabase = await createClient()

    let dbQuery = supabase
      .from('deals')
      .select(`
        *,
        lead:lead_id(*),
        crm_company:crm_company_id(*),
        owner:owner_id(id, full_name, email)
      `, { count: 'exact' })
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (parsed.search) {
      dbQuery = dbQuery.ilike('name', `%${parsed.search}%`)
    }
    if (parsed.stage) {
      dbQuery = dbQuery.eq('stage', parsed.stage)
    }
    if (parsed.owner_id) {
      dbQuery = dbQuery.eq('owner_id', parsed.owner_id)
    }

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

  async getById(companyId: string, dealId: string) {
    const supabase = await createClient()

    const { data: deal, error } = await supabase
      .from('deals')
      .select(`
        *,
        lead:lead_id(*),
        crm_company:crm_company_id(*),
        owner:owner_id(id, full_name, email)
      `)
      .eq('id', dealId)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .single()

    if (error) throw new DatabaseError(error)

    const { data: activity, error: actError } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('entity_type', 'deal')
      .eq('entity_id', dealId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (actError) throw new DatabaseError(actError)

    return {
      ...deal,
      activity: activity || [],
    }
  },

  async create(companyId: string, input: CreateDealInput, actorId: string) {
    const parsed = createDealSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('deals')
      .insert({
        company_id: companyId,
        lead_id: parsed.lead_id,
        crm_company_id: parsed.crm_company_id,
        name: parsed.name,
        value: parsed.value,
        probability: parsed.probability,
        stage: parsed.stage,
        expected_close_date: parsed.expected_close_date,
        owner_id: parsed.owner_id,
        notes: parsed.notes,
        created_by: actorId,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.DEAL_CREATED,
      entityType: 'deal',
      entityId: data.id,
      payload: { deal: data, actorId },
    })

    return data
  },

  async update(companyId: string, dealId: string, input: UpdateDealInput, actorId: string) {
    const parsed = updateDealSchema.parse(input)
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('deals')
      .select('stage')
      .eq('id', dealId)
      .single()

    const { data, error } = await supabase
      .from('deals')
      .update({ ...parsed, updated_by: actorId })
      .eq('id', dealId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    if (existing && parsed.stage && parsed.stage !== existing.stage) {
      await eventBus.emit({
        companyId,
        eventType: EventTypes.DEAL_STAGE_CHANGED,
        entityType: 'deal',
        entityId: dealId,
        payload: { deal: data, previousStage: existing.stage, actorId },
      })
    }

    await eventBus.emit({
      companyId,
      eventType: EventTypes.DEAL_UPDATED,
      entityType: 'deal',
      entityId: dealId,
      payload: { deal: data, actorId },
    })

    return data
  },

  async softDelete(companyId: string, dealId: string, actorId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('deals')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: actorId,
      })
      .eq('id', dealId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.DEAL_DELETED,
      entityType: 'deal',
      entityId: dealId,
      payload: { actorId },
    })
  },

  async markWon(companyId: string, dealId: string, input: WonDealInput, actorId: string) {
    const parsed = wonDealSchema.parse(input)
    const supabase = await createClient()

    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select(`
        *,
        lead:lead_id(*),
        crm_company:crm_company_id(*),
        owner:owner_id(id, full_name, email)
      `)
      .eq('id', dealId)
      .eq('company_id', companyId)
      .single()

    if (dealError) throw new DatabaseError(dealError)

    const companyName = deal.crm_company?.name || deal.lead?.company || deal.name
    const contactName = deal.lead?.name || deal.owner?.full_name || deal.name

    const { data: customer, error: custError } = await supabase
      .from('customers')
      .insert({
        company_id: companyId,
        lead_id: deal.lead_id,
        deal_id: dealId,
        company_name: companyName,
        contact_name: contactName,
        email: deal.lead?.email,
        phone: deal.lead?.phone,
        crm_company_id: deal.crm_company_id,
        created_by: actorId,
      })
      .select()
      .single()

    if (custError) throw new DatabaseError(custError)

    const { data, error } = await supabase
      .from('deals')
      .update({
        stage: 'won',
        actual_close_date: parsed.actual_close_date || new Date().toISOString(),
        probability: 100,
        updated_by: actorId,
      })
      .eq('id', dealId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.DEAL_WON,
      entityType: 'deal',
      entityId: dealId,
      payload: { deal: data, customer, actorId },
    })

    await eventBus.emit({
      companyId,
      eventType: EventTypes.CUSTOMER_CREATED,
      entityType: 'customer',
      entityId: customer.id,
      payload: { customer, deal: data, actorId },
    })

    return { deal: data, customer }
  },

  async markLost(companyId: string, dealId: string, input: LostDealInput, actorId: string) {
    const parsed = lostDealSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('deals')
      .update({
        stage: 'lost',
        notes: parsed.notes,
        updated_by: actorId,
      })
      .eq('id', dealId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.DEAL_LOST,
      entityType: 'deal',
      entityId: dealId,
      payload: { deal: data, actorId },
    })

    return data
  },
}
