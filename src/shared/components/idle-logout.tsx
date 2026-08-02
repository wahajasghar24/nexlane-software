'use client'

import { useIdleLogout } from '@/features/auth/hooks/useIdleLogout'

export function IdleLogout() {
  useIdleLogout()
  return null
}
