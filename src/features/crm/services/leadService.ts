import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import type { PaginatedResult } from '@/core/types/common'
import {
  createLeadSchema,
  updateLeadSchema,
  leadQuerySchema,
  assignLeadSchema,
  createLeadNoteSchema,
} from '@/features/crm/schemas'
import type { CreateLeadInput, UpdateLeadInput, LeadQuery, CreateLeadNoteInput } from '@/features/crm/schemas'

export const leadService = {
  async list(companyId: string, query: LeadQuery): Promise<PaginatedResult<Record<string, unknown>>> {
    const parsed = leadQuerySchema.parse(query)
    const supabase = await createClient()

    let dbQuery = supabase
      .from('leads')
      .select(`
        *,
        crm_company:crm_company_id(*),
        assigned:assigned_to(id, employee_code, profile:profile_id(full_name, email))
      `, { count: 'exact' })
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (parsed.search) {
      dbQuery = dbQuery.or(`title.ilike.%${parsed.search}%,name.ilike.%${parsed.search}%,company.ilike.%${parsed.search}%`)
    }
    if (parsed.status) {
      dbQuery = dbQuery.eq('status', parsed.status)
    }
    if (parsed.priority) {
      dbQuery = dbQuery.eq('priority', parsed.priority)
    }
    if (parsed.source) {
      dbQuery = dbQuery.eq('source', parsed.source)
    }
    if (parsed.assigned_to) {
      dbQuery = dbQuery.eq('assigned_to', parsed.assigned_to)
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

  async getById(companyId: string, leadId: string) {
    const supabase = await createClient()

    const { data: lead, error } = await supabase
      .from('leads')
      .select(`
        *,
        crm_company:crm_company_id(*),
        assigned:assigned_to(id, employee_code, profile:profile_id(full_name, email))
      `)
      .eq('id', leadId)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .single()

    if (error) throw new DatabaseError(error)

    const { data: notes, error: notesError } = await supabase
      .from('lead_notes')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (notesError) throw new DatabaseError(notesError)

    const { data: activity, error: actError } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('entity_type', 'lead')
      .eq('entity_id', leadId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (actError) throw new DatabaseError(actError)

    return {
      ...lead,
      notes: notes || [],
      activity: activity || [],
    }
  },

  async create(companyId: string, input: CreateLeadInput, actorId: string) {
    const parsed = createLeadSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('leads')
      .insert({
        company_id: companyId,
        title: parsed.title,
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        company: parsed.company,
        website: parsed.website,
        industry: parsed.industry,
        source: parsed.source,
        status: parsed.status,
        priority: parsed.priority,
        estimated_value: parsed.estimated_value,
        notes: parsed.notes,
        assigned_to: parsed.assigned_to,
        crm_company_id: parsed.crm_company_id,
        created_by: actorId,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.LEAD_CREATED,
      entityType: 'lead',
      entityId: data.id,
      payload: { lead: data, actorId },
    })

    return data
  },

  async update(companyId: string, leadId: string, input: UpdateLeadInput, actorId: string) {
    const parsed = updateLeadSchema.parse(input)
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('leads')
      .select('status')
      .eq('id', leadId)
      .single()

    const { data, error } = await supabase
      .from('leads')
      .update({ ...parsed, updated_by: actorId })
      .eq('id', leadId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    if (existing && parsed.status && parsed.status !== existing.status) {
      await eventBus.emit({
        companyId,
        eventType: EventTypes.LEAD_STATUS_CHANGED,
        entityType: 'lead',
        entityId: leadId,
        payload: { lead: data, previousStatus: existing.status, actorId },
      })
    }

    await eventBus.emit({
      companyId,
      eventType: EventTypes.LEAD_UPDATED,
      entityType: 'lead',
      entityId: leadId,
      payload: { lead: data, actorId },
    })

    return data
  },

  async softDelete(companyId: string, leadId: string, actorId: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('leads')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: actorId,
      })
      .eq('id', leadId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.LEAD_DELETED,
      entityType: 'lead',
      entityId: leadId,
      payload: { actorId },
    })
  },

  async assign(companyId: string, leadId: string, assignedTo: string, actorId: string) {
    const parsed = assignLeadSchema.parse({ assigned_to: assignedTo })
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('leads')
      .update({ assigned_to: parsed.assigned_to, updated_by: actorId })
      .eq('id', leadId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.LEAD_ASSIGNED,
      entityType: 'lead',
      entityId: leadId,
      payload: { lead: data, assignedTo: parsed.assigned_to, actorId },
    })

    return data
  },

  async addNote(companyId: string, leadId: string, content: string, actorId: string) {
    const parsed = createLeadNoteSchema.parse({ content })
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('lead_notes')
      .insert({
        company_id: companyId,
        lead_id: leadId,
        content: parsed.content,
        created_by: actorId,
      })
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.LEAD_NOTE_ADDED,
      entityType: 'lead',
      entityId: leadId,
      payload: { note: data, actorId },
    })

    return data
  },

  async getNotes(companyId: string, leadId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('lead_notes')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error)

    return data || []
  },

  async convert(companyId: string, leadId: string, actorId: string) {
    const supabase = await createClient()

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('company_id', companyId)
      .single()

    if (leadError) throw new DatabaseError(leadError)

    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .insert({
        company_id: companyId,
        lead_id: leadId,
        crm_company_id: lead.crm_company_id,
        name: lead.title || lead.name,
        value: lead.estimated_value || 0,
        stage: 'new',
        owner_id: lead.assigned_to,
        created_by: actorId,
      })
      .select()
      .single()

    if (dealError) throw new DatabaseError(dealError)

    const { error: updateError } = await supabase
      .from('leads')
      .update({
        status: 'converted',
        converted_to_deal_id: deal.id,
        updated_by: actorId,
      })
      .eq('id', leadId)

    if (updateError) throw new DatabaseError(updateError)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.LEAD_CONVERTED,
      entityType: 'lead',
      entityId: leadId,
      payload: { lead: { ...lead, status: 'converted', converted_to_deal_id: deal.id }, deal, actorId },
    })

    return deal
  },
}
