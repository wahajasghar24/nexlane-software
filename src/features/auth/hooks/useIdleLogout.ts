'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLogout } from '@/features/auth/hooks/useAuth'

const IDLE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

/**
 * Zitadel-style idle session timeout: auto sign-out after 30 min of no
 * mouse/keyboard/touch activity anywhere on the page.
 */
export function useIdleLogout() {
  const router = useRouter()
  const { mutateAsync: logout } = useLogout()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(async () => {
        try {
          await logout()
        } catch {}
        router.push('/login')
      }, IDLE_TIMEOUT_MS)
    }

    const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      events.forEach(e => window.removeEventListener(e, reset))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [logout, router])
}
