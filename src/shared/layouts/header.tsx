'use client'

import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/shared/components/theme-toggle'
import { useUser, useLogout } from '@/features/auth/hooks/useAuth'

export function Header() {
  const router = useRouter()
  const { data: userData } = useUser()
  const logout = useLogout()

  const handleLogout = async () => {
    await logout.mutateAsync()
    router.push('/login')
    router.refresh()
  }

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
        <button
          onClick={handleLogout}
          disabled={logout.isPending}
          className="ml-2 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-destructive hover:text-white disabled:opacity-50"
        >
          {logout.isPending ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </header>
  )
}
