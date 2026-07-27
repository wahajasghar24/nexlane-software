import { createAdminClient } from '@/core/supabase/admin'
import { AppError } from '@/core/errors/app-error'
import { DatabaseError } from '@/core/errors/database-error'
import { eventBus } from '@/core/events/event-bus'
import { EventTypes } from '@/core/events/types'
import { createRoleSchema, assignPermissionsSchema } from '@/features/rbac/schemas/rbac.schema'
import type { CreateRoleInput } from '@/features/rbac/schemas/rbac.schema'

export const rbacService = {
  async listPermissions() {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('module')
      .order('code')
    if (error) throw new DatabaseError(error)
    return data
  },

  async listRoles(companyId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('roles')
      .select('*, role_permissions!inner(permission_id)')
      .eq('company_id', companyId)
      .is('deleted_at', null)
    if (error) throw new DatabaseError(error)
    return data
  },

  async createRole(companyId: string, input: CreateRoleInput, actorId: string) {
    const parsed = createRoleSchema.parse(input)
    const supabase = createAdminClient()

    const { data: role, error: roleError } = await supabase
      .from('roles')
      .insert({
        company_id: companyId,
        name: parsed.name,
        description: parsed.description,
        created_by: actorId,
      })
      .select()
      .single()

    if (roleError) throw new DatabaseError(roleError)

    const permissions = parsed.permissionIds.map(pid => ({
      role_id: role.id,
      permission_id: pid,
    }))

    const { error: permError } = await supabase
      .from('role_permissions')
      .insert(permissions)

    if (permError) throw new DatabaseError(permError)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.ROLE_CREATED,
      entityType: 'role',
      entityId: role.id,
      payload: { role, actorId },
    })

    return role
  },

  async updateRole(companyId: string, roleId: string, input: Record<string, unknown>, actorId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('roles')
      .update({ ...input, updated_by: actorId })
      .eq('id', roleId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.ROLE_UPDATED,
      entityType: 'role',
      entityId: roleId,
      payload: { role: data, actorId },
    })

    return data
  },

  async deleteRole(companyId: string, roleId: string, actorId: string) {
    const supabase = createAdminClient()

    const { data: role } = await supabase
      .from('roles')
      .select('is_system')
      .eq('id', roleId)
      .single()

    if (role?.is_system) {
      throw new AppError('SYSTEM_ROLE', 'Cannot delete system roles', 403)
    }

    const { error } = await supabase
      .from('roles')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: actorId,
      })
      .eq('id', roleId)
      .eq('company_id', companyId)

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.ROLE_DELETED,
      entityType: 'role',
      entityId: roleId,
      payload: { actorId },
    })
  },

  async getRoleWithPermissions(roleId: string, companyId: string) {
    const supabase = createAdminClient()

    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .eq('company_id', companyId)
      .single()

    if (roleError) throw new DatabaseError(roleError)

    const { data: permissions, error: permError } = await supabase
      .from('role_permissions')
      .select('permission:permission_id(*)')
      .eq('role_id', roleId)

    if (permError) throw new DatabaseError(permError)

    return { ...role, permissions: permissions?.map(rp => rp.permission) || [] }
  },

  async assignPermissions(companyId: string, roleId: string, permissionIds: string[], actorId: string) {
    const supabase = createAdminClient()

    await supabase.from('role_permissions').delete().eq('role_id', roleId)

    const permissions = permissionIds.map(pid => ({
      role_id: roleId,
      permission_id: pid,
    }))

    const { error } = await supabase.from('role_permissions').insert(permissions)
    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.PERMISSION_CHANGED,
      entityType: 'role',
      entityId: roleId,
      payload: { permissionIds, actorId },
    })
  },

  async assignUserRole(companyId: string, userId: string, roleId: string, assignedBy: string) {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role_id: roleId,
        company_id: companyId,
        assigned_by: assignedBy,
      }, { onConflict: 'user_id,role_id,company_id' })

    if (error) throw new DatabaseError(error)

    await eventBus.emit({
      companyId,
      eventType: EventTypes.USER_ROLE_ASSIGNED,
      entityType: 'user_role',
      entityId: `${userId}_${roleId}`,
      payload: { userId, roleId, assignedBy },
    })
  },

  async getUserRoles(companyId: string, userId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('user_roles')
      .select('*, role:role_id(*)')
      .eq('company_id', companyId)
      .eq('user_id', userId)

    if (error) throw new DatabaseError(error)
    return data
  },
}
