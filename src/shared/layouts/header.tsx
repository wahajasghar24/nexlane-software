'use client'

import { ThemeToggle } from '@/shared/components/theme-toggle'
import { useUser } from '@/features/auth/hooks/useAuth'

export function Header() {
  const { data: userData } = useUser()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4">
      <div className="flex-1" />
      <ThemeToggle />
      <div className="flex items-center gap-2 text-sm">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
          {userData?.profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium">{userData?.profile?.full_name || 'User'}</p>
          <p className="text-xs text-muted-foreground">{userData?.profile?.email}</p>
        </div>
      </div>
    </header>
  )
}
