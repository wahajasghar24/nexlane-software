'use client'

import { LoginForm } from '@/features/auth/components/login-form'
import { FadeIn } from '@/shared/components/motion'
import Link from 'next/link'

const brandPoints = [
  'Accounting, CRM, projects & teams in one platform',
  'Real-time dashboards with actionable insights',
  'Built for growing companies — secure & scalable',
]

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-gradient-to-br from-primary via-blue-800 to-blue-950 p-12 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur text-lg font-bold">
            N
          </span>
          <span className="text-xl font-bold tracking-tight">Nexlane</span>
        </div>
        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Run your entire company from one command center
          </h2>
          <ul className="mt-8 space-y-4">
            {brandPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-white/85">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-amber-400">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
                <span className="text-sm leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/50">© {new Date().getFullYear()} Nexlane Solutions</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12">
        <FadeIn className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center justify-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
              N
            </span>
            <span className="text-xl font-bold">Nexlane</span>
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account to continue</p>
          </div>
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </FadeIn>
      </div>
    </div>
  )
}
