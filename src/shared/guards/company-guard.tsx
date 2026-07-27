'use client'

import { useUser } from '@/features/auth/hooks/useAuth'

export function CompanyGuard({ children }: { children: React.ReactNode }) {
  const { data: userData, isLoading } = useUser()

  if (isLoading) return null

  if (!userData?.companies?.length) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold">No Company Found</h2>
          <p className="text-sm text-muted-foreground">You are not associated with any company.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
