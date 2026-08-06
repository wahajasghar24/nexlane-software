import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { cookies } from 'next/headers'
import { routing } from './routing'

export default getRequestConfig(async () => {
  // Cookie-based locale (no middleware): NEXT_LOCALE set by LanguageSwitcher.
  // Accept-Language negotiation skipped — default en until user switches.
  const cookieLocale = (await cookies()).get('NEXT_LOCALE')?.value
  const locale = hasLocale(routing.locales, cookieLocale) ? cookieLocale : routing.defaultLocale

  const [base, acc, auth, hr, crm, inv, trx, misc] = await Promise.all([
    import(`../../messages/${locale}.json`),
    import(`../../messages/${locale}/acc.json`),
    import(`../../messages/${locale}/auth.json`),
    import(`../../messages/${locale}/hr.json`),
    import(`../../messages/${locale}/crm.json`),
    import(`../../messages/${locale}/inv.json`),
    import(`../../messages/${locale}/trx.json`),
    import(`../../messages/${locale}/misc.json`),
  ])

  return {
    locale,
    messages: {
      ...base.default,
      ...acc.default,
      ...auth.default,
      ...hr.default,
      ...crm.default,
      ...inv.default,
      ...trx.default,
      ...misc.default,
    },
  }
})
