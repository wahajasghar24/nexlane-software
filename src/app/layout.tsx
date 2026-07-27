import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/shared/components/theme-provider'
import { QueryProvider } from '@/shared/components/query-provider'
import { ConfirmProvider } from '@/shared/hooks/use-confirm-dialog'

// Register event handlers at app startup
import '@/core/events/register'

export const metadata: Metadata = {
  title: 'Nexlane',
  description: 'Enterprise Company Management Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ConfirmProvider>
              {children}
            </ConfirmProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
