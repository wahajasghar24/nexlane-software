import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Fira_Code, Fira_Sans } from 'next/font/google'
import { ThemeProvider } from '@/shared/components/theme-provider'
import { QueryProvider } from '@/shared/components/query-provider'
import { ConfirmProvider } from '@/shared/hooks/use-confirm-dialog'

// Register event handlers at app startup
import '@/core/events/register'

const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fira-sans',
  display: 'swap',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fira-code',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Nexlane',
  description: 'Enterprise Company Management Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-background font-sans antialiased ${firaSans.variable} ${firaCode.variable}`}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ConfirmProvider>
              {children}
              <Toaster position="bottom-right" richColors closeButton />
            </ConfirmProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
