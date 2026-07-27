'use client'

import { useUser } from '@/features/auth/hooks/useAuth'

interface PermissionGuardProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { data: userData } = useUser()

  if (!userData?.user) return null

  return <>{children}</>
}
