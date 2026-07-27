import { NextResponse } from 'next/server'
import { createClient } from '@/core/supabase/server'
import { createAdminClient } from '@/core/supabase/admin'
import { signupSchema } from '@/features/auth/schemas/auth.schema'
import { syncProfile, ensureEmployee, syncEmployeeForUser } from '@/core/auth/profile-sync'

export async function POST(request: Request) {
  try {
    const body = await request.json()
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

        // 2. Grant Owner role
        const { data: ownerRole } = await adminClient
          .from('roles')
          .select('id')
          .eq('company_id', company.id)
          .eq('name', 'Owner')
          .single()

        if (ownerRole) {
          await adminClient.from('user_roles').insert({
            user_id: authData.user.id,
            role_id: ownerRole.id,
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
      const employeeCount = await syncEmployeeForUser(
        authData.user.id,
        parsed.fullName,
      )
      if (employeeCount > 0) {
        console.log(
          `[sync] Signup: created ${employeeCount} employee record(s) for user ${authData.user.id}`,
        )
      }
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
