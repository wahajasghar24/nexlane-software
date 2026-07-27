import { createClient } from '@/core/supabase/server'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import { createTeamSchema, updateTeamSchema } from '@/features/teams/schemas/team.schema'
import type { CreateTeamInput, UpdateTeamInput } from '@/features/teams/schemas/team.schema'

export const teamService = {
  async list(companyId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('teams')
      .select('*, lead:lead_id(id, full_name), members:team_members(*, employee:employee_id(*))')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('name')
    if (error) throw new DatabaseError(error)
    return data
  },

  async getById(companyId: string, teamId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('teams')
      .select('*, lead:lead_id(id, full_name), members:team_members(*, employee:employee_id(*))')
      .eq('id', teamId)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .single()
    if (error) throw new DatabaseError(error)
    return data
  },

  async create(companyId: string, input: CreateTeamInput, actorId: string) {
    const parsed = createTeamSchema.parse(input)
    const supabase = await createClient()

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        company_id: companyId,
        name: parsed.name,
        description: parsed.description,
        lead_id: parsed.lead_id,
        created_by: actorId,
      })
      .select()
      .single()

    if (teamError) throw new DatabaseError(teamError)

    if (parsed.member_ids && parsed.member_ids.length > 0) {
      const members = parsed.member_ids.map(employeeId => ({
        team_id: team.id,
        employee_id: employeeId,
        company_id: companyId,
      }))
      const { error: memberError } = await supabase
        .from('team_members')
        .insert(members)
      if (memberError) throw new DatabaseError(memberError)
    }

    await eventBus.emit({
      companyId,
      eventType: 'team.created',
      entityType: 'team',
      entityId: team.id,
      payload: { team, actorId },
    })

    return team
  },

  async update(companyId: string, teamId: string, input: UpdateTeamInput, actorId: string) {
    const parsed = updateTeamSchema.parse(input)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('teams')
      .update({ ...parsed, updated_by: actorId })
      .eq('id', teamId)
      .eq('company_id', companyId)
      .select()
      .single()
    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: 'team.updated',
      entityType: 'team',
      entityId: teamId,
      payload: { team: data, actorId },
    })

    return data
  },

  async softDelete(companyId: string, teamId: string, actorId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('teams')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: actorId,
      })
      .eq('id', teamId)
      .eq('company_id', companyId)
    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: 'team.deleted',
      entityType: 'team',
      entityId: teamId,
      payload: { actorId },
    })
  },

  async addMember(companyId: string, teamId: string, employeeId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        employee_id: employeeId,
        company_id: companyId,
      })
      .select()
      .single()
    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: 'team.member_added',
      entityType: 'team_member',
      entityId: data.id,
      payload: { teamId, employeeId },
    })

    return data
  },

  async removeMember(companyId: string, teamId: string, employeeId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('employee_id', employeeId)
    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: 'team.member_removed',
      entityType: 'team_member',
      entityId: `${teamId}_${employeeId}`,
      payload: { teamId, employeeId },
    })
  },
}
