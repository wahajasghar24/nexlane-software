import { ThemeProvider } from '@/shared/components/theme-provider'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Nexlane</h1>
            <span className="text-sm text-gray-500">Customer Portal</span>
          </div>
        </header>
        <main className="max-w-4xl mx-auto p-6">{children}</main>
      </div>
    </ThemeProvider>
  )
}
