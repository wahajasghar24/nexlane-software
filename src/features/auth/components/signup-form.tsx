'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/core/supabase/client'
import { useRouter } from 'next/navigation'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  companyName: z.string().min(1, 'Company name is required'),
})

type SignupForm = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(data: SignupForm) {
    setError(null)
    try {
      const supabase = createClient()
      const { error: signupError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName },
        },
      })
      if (signupError) throw new Error(signupError.message)
      router.push('/login?registered=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-1">Full Name</label>
        <input id="fullName" {...register('fullName')} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <input id="email" type="email" {...register('email')} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
        <input id="password" type="password" {...register('password')} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
      </div>
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium mb-1">Company Name</label>
        <input id="companyName" {...register('companyName')} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.companyName && <p className="text-xs text-destructive mt-1">{errors.companyName.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}
