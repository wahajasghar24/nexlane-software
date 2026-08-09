import { NextResponse } from 'next/server'
import { createClient } from '@/core/supabase/server'
import { createAdminClient } from '@/core/supabase/admin'
import { signupSchema } from '@/features/auth/schemas/auth.schema'
import { syncProfile, ensureEmployee, syncEmployeeForUser } from '@/core/auth/profile-sync'
import { rateLimit, rateLimitKey } from '@/core/security/rate-limit'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    // Rate limit: 5 attempts / 15 min per IP+email
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    const body = await request.json()
    const email = (body?.email || '').toString().toLowerCase()
    const rl = rateLimit(rateLimitKey('signup', ip, email), 5, 15 * 60 * 1000)
    if (!rl.ok) {
      return NextResponse.json(
        { data: null, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please wait a few minutes.' } },
        { status: 429 }
      )
    }

    const parsed = signupSchema.parse(body)

    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: parsed.email,
      password: parsed.password,
      options: { data: { full_name: parsed.fullName } },
    })

    if (authError) {
      return NextResponse.json(
        { data: null, error: { code: 'AUTH_ERROR', message: authError.message } },
        { status: 400 }
      )
    }

    if (authData.user) {
      // 1. Ensure profile exists (defensive — DB trigger should also do this)
      await syncProfile(authData.user.id, parsed.email, {
        full_name: parsed.fullName,
      })

      const adminClient = createAdminClient()
      const companyName = parsed.companyName || `${parsed.fullName}'s Company`
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'company'

      const { data: company, error: companyError } = await adminClient
        .from('companies')
        .insert({ name: companyName, slug, created_by: authData.user.id })
        .select()
        .single()

      if (!companyError && company) {
        await adminClient.from('company_members').insert({
          company_id: company.id,
          profile_id: authData.user.id,
          is_default: true,
        })

        // 1.5 Seed default roles for the new company (Owner, Admin, Manager, Employee, Accountant)
        const defaultRoles = ['Owner', 'Admin', 'Manager', 'Employee', 'Accountant']
        const roleRows: Record<string, string> = {}
        for (const roleName of defaultRoles) {
          const { data: roleRow } = await adminClient
            .from('roles')
            .insert({ company_id: company.id, name: roleName, is_system: true })
            .select('id, name')
            .single()
          if (roleRow) roleRows[roleName] = roleRow.id
        }

        // 2. Grant Owner role
        const ownerRoleId = roleRows['Owner']
        if (ownerRoleId) {
          await adminClient.from('user_roles').insert({
            user_id: authData.user.id,
            role_id: ownerRoleId,
            company_id: company.id,
            assigned_by: authData.user.id,
          })
        }

        // 3. Create employee record so the founder can be assigned work
        await ensureEmployee(
          adminClient,
          authData.user.id,
          company.id,
          authData.user.id,
          parsed.fullName,
        )
      }

      // 4. Safety net: ensure employee records exist for ALL user's companies
      //    (handles rare edge cases where the above flows partially fail)
      await syncEmployeeForUser(
        authData.user.id,
        parsed.fullName,
      )
    }

    return NextResponse.json({ data: { user: authData.user }, error: null })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: err } },
        { status: 422 }
      )
    }
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
