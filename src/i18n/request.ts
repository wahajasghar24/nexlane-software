import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { cookies } from 'next/headers'
import { routing } from './routing'

export default getRequestConfig(async () => {
  // Cookie-based locale (no middleware): NEXT_LOCALE set by LanguageSwitcher.
  // Accept-Language negotiation skipped — default en until user switches.
  const cookieLocale = (await cookies()).get('NEXT_LOCALE')?.value
  const locale = hasLocale(routing.locales, cookieLocale) ? cookieLocale : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
