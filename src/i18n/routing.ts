import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'never', // URLs stay the same; locale from cookie only
})

export type Locale = (typeof routing.locales)[number]
