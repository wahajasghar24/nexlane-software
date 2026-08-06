'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

const FLAGS: Record<string, string> = { en: 'EN', ar: 'ع' }

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const switchTo = locale === 'ar' ? 'en' : 'ar'

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`
    startTransition(() => router.refresh())
  }

  return (
    <select
      value={locale}
      onChange={onChange}
      disabled={isPending}
      aria-label="Language"
      className="h-8 rounded-md border bg-background px-2 text-xs font-medium text-muted-foreground hover:bg-accent disabled:opacity-50"
    >
      <option value="en">EN 🇬🇧</option>
      <option value="ar">عربي 🇸🇦</option>
    </select>
  )
}
