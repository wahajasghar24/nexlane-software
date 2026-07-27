import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import type { PaginatedResult } from '@/core/types/common'
import {
  createCrmCompanySchema,
  updateCrmCompanySchema,
  crmCompanyQuerySchema,
} from '@/features/crm/schemas'
import type { CreateCrmCompanyInput, UpdateCrmCompanyInput, CrmCompanyQuery } from '@/features/crm/schemas'

export const crmCompanyService = {
  async list(companyId: string, query: CrmCompanyQuery): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = crmCompanyQuerySchema.parse(query)
    const supabase = await createClient()

    let dbQuery = supabase
      .from('crm_companies')
      .select('*, contacts(count)', { count: 'exact' })
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (parsed.search) {
      dbQuery = dbQuery.ilike('name', `%${parsed.search}%`)
    }
    if (parsed.industry) {
      dbQuery = dbQuery.eq('industry', parsed.industry)
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

  async getById(companyId: string, companyIdCrm: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('crm_companies')
      .select('*, contacts(*)')
      .eq('id', companyIdCrm)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .single()

    if (error) throw new DatabaseError(error)

    return data
  },

  async create(companyId: string, input: CreateCrmCompanyInput, actorId: string) {
    const parsed = createCrmCompanySchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('crm_companies')
      .insert({
        company_id: companyId,
        name: parsed.name,
        industry: parsed.industry,
        website: parsed.website,
        phone: parsed.phone,
        email: parsed.email,
        address: parsed.address,
        notes: parsed.notes,
        created_by: actorId,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.CRM_COMPANY_CREATED,
      entityType: 'crm_company',
      entityId: data.id,
      payload: { crmCompany: data, actorId },
    })

    return data
  },

  async update(companyId: string, companyIdCrm: string, input: UpdateCrmCompanyInput, actorId: string) {
    const parsed = updateCrmCompanySchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('crm_companies')
      .update({ ...parsed, updated_by: actorId })
      .eq('id', companyIdCrm)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.CRM_COMPANY_UPDATED,
      entityType: 'crm_company',
      entityId: companyIdCrm,
      payload: { crmCompany: data, actorId },
    })

    return data
  },

  async softDelete(companyId: string, companyIdCrm: string, actorId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('crm_companies')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: actorId,
      })
      .eq('id', companyIdCrm)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.CRM_COMPANY_DELETED,
      entityType: 'crm_company',
      entityId: companyIdCrm,
      payload: { actorId },
    })
  },
}
