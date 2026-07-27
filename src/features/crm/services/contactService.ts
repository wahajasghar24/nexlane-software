import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import type { PaginatedResult } from '@/core/types/common'
import {
  createContactSchema,
  updateContactSchema,
  contactQuerySchema,
} from '@/features/crm/schemas'
import type { CreateContactInput, UpdateContactInput, ContactQuery } from '@/features/crm/schemas'

export const contactService = {
  async list(companyId: string, query: ContactQuery): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = contactQuerySchema.parse(query)
    const supabase = await createClient()

    let dbQuery = supabase
      .from('contacts')
      .select('*, crm_company:crm_company_id(*)', { count: 'exact' })
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (parsed.search) {
      dbQuery = dbQuery.ilike('name', `%${parsed.search}%`)
    }
    if (parsed.crm_company_id) {
      dbQuery = dbQuery.eq('crm_company_id', parsed.crm_company_id)
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

  async getById(companyId: string, contactId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contacts')
      .select('*, crm_company:crm_company_id(*)')
      .eq('id', contactId)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .single()

    if (error) throw new DatabaseError(error)
    return data
  },

  async create(companyId: string, input: CreateContactInput, actorId: string) {
    const parsed = createContactSchema.parse(input)
    const supabase = await createClient()

    if (parsed.is_primary && parsed.crm_company_id) {
      await supabase
        .from('contacts')
        .update({ is_primary: false })
        .eq('crm_company_id', parsed.crm_company_id)
        .eq('company_id', companyId)
        .is('deleted_at', null)
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        company_id: companyId,
        crm_company_id: parsed.crm_company_id,
        name: parsed.name,
        designation: parsed.designation,
        email: parsed.email,
        phone: parsed.phone,
        whatsapp: parsed.whatsapp,
        is_primary: parsed.is_primary,
        notes: parsed.notes,
        created_by: actorId,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.CONTACT_CREATED,
      entityType: 'contact',
      entityId: data.id,
      payload: { contact: data, actorId },
    })

    return data
  },

  async update(companyId: string, contactId: string, input: UpdateContactInput, actorId: string) {
    const parsed = updateContactSchema.parse(input)
    const supabase = await createClient()

    if (parsed.is_primary && parsed.crm_company_id) {
      await supabase
        .from('contacts')
        .update({ is_primary: false })
        .eq('crm_company_id', parsed.crm_company_id)
        .eq('company_id', companyId)
        .is('deleted_at', null)
    }

    const { data, error } = await supabase
      .from('contacts')
      .update({ ...parsed, updated_by: actorId })
      .eq('id', contactId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.CONTACT_UPDATED,
      entityType: 'contact',
      entityId: contactId,
      payload: { contact: data, actorId },
    })

    return data
  },

  async softDelete(companyId: string, contactId: string, actorId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('contacts')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: actorId,
      })
      .eq('id', contactId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.CONTACT_DELETED,
      entityType: 'contact',
      entityId: contactId,
      payload: { actorId },
    })
  },
}
