'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageHeader } from '@/shared/components/page-header'
import { toast } from 'sonner'

interface Permission {
  id: string
  module: string
  code: string
}

interface Role {
  id: string
  name: string
  description?: string
  role_permissions?: { permission_id: string }[]
}

interface UserRole {
  user_id: string
  role_id: string
  role: { id: string; name: string }
}

interface CompanyUser {
  id: string
  profile_id: string
  profile?: { id: string; email: string; full_name?: string }
  full_name?: string
  email?: string
}

export default function RolesPage() {
  const t = useTranslations('misc')
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles')
  const [showNewRole, setShowNewRole] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())
  const [roleUserAssign, setRoleUserAssign] = useState<Record<string, string>>({})
  const [userRoles, setUserRoles] = useState<Record<string, UserRole[]>>({})

  const loadAll = async () => {
    setLoading(true)
    try {
      const [rolesRes, permsRes, usersRes] = await Promise.all([
        fetch('/api/rbac/roles').then(r => r.json()),
        fetch('/api/rbac/permissions').then(r => r.json()),
        fetch('/api/company/users').then(r => r.json()),
      ])
      setRoles(rolesRes.data || [])
      setPermissions(permsRes.data || [])
      const usersData = usersRes.data || []
      setUsers(usersData)

      // Load roles for each user
      const rolesMap: Record<string, UserRole[]> = {}
      for (const u of usersData) {
        const res = await fetch(`/api/rbac/users/${u.profile_id || u.id}/roles`).then(r => r.json())
        if (res.data) rolesMap[u.profile_id || u.id] = res.data
      }
      setUserRoles(rolesMap)
    } catch {
      toast.error(t('settings_load_failed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const createRole = async () => {
    if (!newRoleName.trim()) return
    const res = await fetch('/api/rbac/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newRoleName,
        permissionIds: [...selectedPerms],
      }),
    })
    const data = await res.json()
    if (data.error) toast.error(data.error.message || data.error)
    else {
      toast.success(t('settings_saved'))
      setNewRoleName('')
      setSelectedPerms(new Set())
      setShowNewRole(false)
      loadAll()
    }
  }

  const saveRolePerms = async (roleId: string, permissionIds: string[]) => {
    const res = await fetch(`/api/rbac/roles/${roleId}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissionIds }),
    })
    const data = await res.json()
    if (data.error) toast.error(data.error.message || data.error)
    else toast.success(t('settings_saved'))
  }

  const assignRole = async (userId: string, roleId: string) => {
    if (!roleId) return
    const res = await fetch(`/api/rbac/users/${userId}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId }),
    })
    const data = await res.json()
    if (data.error) toast.error(data.error.message || data.error)
    else {
      toast.success(t('settings_saved'))
      setRoleUserAssign(s => ({ ...s, [userId]: '' }))
    }
  }

  const removeRole = async (userId: string, roleId: string) => {
    const res = await fetch(`/api/rbac/users/${userId}/roles?roleId=${roleId}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.error) toast.error(data.error.message || data.error)
    else toast.success(t('settings_saved'))
    loadAll()
  }

  const permsByModule = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    ;(acc[p.module] = acc[p.module] || []).push(p)
    return acc
  }, {})

  return (
    <div>
      <PageHeader title={t('settings_roles_title') || 'Roles & Permissions'} description={t('settings_roles_desc') || 'Manage roles, permissions and user assignments'} />

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-6">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
        >
          {t('settings_roles_title') || 'Roles'}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
        >
          {t('settings_users_title') || 'Users'}
        </button>
        <div className="ml-auto">
          <button
            onClick={() => setShowNewRole(!showNewRole)}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            + {t('settings_new_role') || 'New Role'}
          </button>
        </div>
      </div>

      {/* New role form */}
      {showNewRole && (
        <div className="rounded-lg border bg-card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('settings_new_role') || 'New Role'}</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{t('settings_role_name') || 'Role Name'}</label>
            <input
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              className="w-full max-w-md rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Accounting Manager"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto mb-4">
            {permissions.map(p => (
              <label key={p.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedPerms.has(p.id)}
                  onChange={e => {
                    const next = new Set(selectedPerms)
                    if (e.target.checked) next.add(p.id)
                    else next.delete(p.id)
                    setSelectedPerms(next)
                  }}
                  className="rounded border"
                />
                {p.code}
              </label>
            ))}
          </div>
          <button onClick={createRole} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
            {t('settings_save_role') || 'Create Role'}
          </button>
        </div>
      )}

      {/* Roles tab */}
      {activeTab === 'roles' && !loading && (
        <div className="space-y-4">
          {roles.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              {t('settings_no_roles') || 'No roles yet — create your first role'}
            </div>
          )}
          {roles.filter(r => r.id !== '00000000-0000-0000-0000-000000000001').map(role => {
            const rolePerms = new Set((role.role_permissions || []).map(rp => rp.permission_id))
            return (
              <div key={role.id} className="rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{role.name}</h3>
                    {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground">{rolePerms.size} permissions</span>
                </div>
                <details className="text-sm">
                  <summary className="cursor-pointer text-primary">{t('settings_edit_permissions') || 'Edit permissions'}</summary>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4 max-h-64 overflow-y-auto">
                    {permissions.map(p => (
                      <label key={p.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked={rolePerms.has(p.id)}
                          className="rounded border"
                          onChange={e => {
                            const next = new Set(rolePerms)
                            if (e.target.checked) next.add(p.id)
                            else next.delete(p.id)
                            saveRolePerms(role.id, [...next])
                          }}
                        />
                        <span className="text-xs">{p.code}</span>
                      </label>
                    ))}
                  </div>
                </details>
              </div>
            )
          })}
        </div>
      )}

      {/* Users tab */}
      {activeTab === 'users' && !loading && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">{t('settings_roles_title') || 'Roles'}</th>
                <th className="text-left px-4 py-3 font-medium">{t('settings_assign_role') || 'Assign Role'}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(user => {
                const userId = user.profile_id || user.id
                return (
                  <tr key={userId}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{user.full_name || user.profile?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user.email || user.profile?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(userRoles[userId] || []).map(ur => (
                          <span key={ur.role_id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            {ur.role?.name || ur.role_id.slice(0, 8)}
                            <button
                              onClick={() => removeRole(userId, ur.role_id)}
                              className="hover:text-destructive"
                              title={t('settings_remove_role') || 'Remove'}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        {(userRoles[userId] || []).length === 0 && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <select
                          value=""
                          onChange={e => assignRole(userId, e.target.value)}
                          className="rounded-md border bg-background px-2 py-1.5 text-xs"
                        >
                          <option value="">+ {t('settings_assign_role') || 'Assign'}</option>
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Helper: fetch all users of the company (extend /api/settings/company or add here)