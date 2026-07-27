import { ThemeProvider } from '@/shared/components/theme-provider'
import { QueryProvider } from '@/shared/components/query-provider'
import { Sidebar } from '@/shared/layouts/sidebar'
import { Header } from '@/shared/layouts/header'
import { MobileNav } from '@/shared/layouts/mobile-nav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
              {children}
            </main>
          </div>
          <MobileNav />
        </div>
      </QueryProvider>
    </ThemeProvider>
  )
}
