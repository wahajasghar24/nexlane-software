'use client'

import { useUser } from '@/features/auth/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: userData, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !userData?.user) {
      router.push('/login')
    }
  }, [isLoading, userData, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!userData?.user) return null

  return <>{children}</>
}
