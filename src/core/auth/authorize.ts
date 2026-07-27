import { createClient } from '@/core/supabase/server'
import { AppError } from '@/core/errors/app-error'
import type { UserContext } from '@/core/types/common'

export async function authorize(context: UserContext, ...requiredPermissions: string[]): Promise<void> {
  if (requiredPermissions.length === 0) return

  const supabase = await createClient()

  const { data: userRoles } = await supabase
    .from('user_roles')
    .select(`
      role_id,
      roles!inner(
        role_permissions(
          permissions!inner(code)
        )
      )
    `)
    .eq('user_id', context.userId)
    .eq('company_id', context.companyId)

  if (!userRoles || userRoles.length === 0) {
    throw new AppError('FORBIDDEN', 'Access denied: no roles assigned', 403)
  }

  const userPermissions = new Set<string>()
  for (const ur of userRoles) {
    const role = ur.roles as unknown as {
      role_permissions: Array<{ permissions: { code: string } }>
    }
    if (!role?.role_permissions) continue
    for (const rp of role.role_permissions) {
      if (rp?.permissions?.code) userPermissions.add(rp.permissions.code)
    }
  }

  const hasAll = requiredPermissions.every(p => userPermissions.has(p))
  if (!hasAll) {
    throw new AppError('FORBIDDEN', `Access denied: missing permission "${requiredPermissions.find(p => !userPermissions.has(p))}"`, 403)
  }
}
