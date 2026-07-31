'use client'

import { ThemeToggle } from '@/shared/components/theme-toggle'
import { useUser } from '@/features/auth/hooks/useAuth'

export function Header() {
  const { data: userData } = useUser()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex-1" />
      <ThemeToggle />
      <div className="flex items-center gap-2.5 text-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-700 text-xs font-semibold text-primary-foreground shadow-sm">
          {userData?.profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="hidden md:block leading-tight">
          <p className="text-sm font-medium">{userData?.profile?.full_name || 'User'}</p>
          <p className="text-xs text-muted-foreground">{userData?.profile?.email}</p>
        </div>
      </div>
    </header>
  )
}
