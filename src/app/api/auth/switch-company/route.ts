import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/core/supabase/server'
import { createAdminClient } from '@/core/supabase/admin'

const switchCompanySchema = z.object({
  companyId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const body = switchCompanySchema.parse(await request.json())
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()
    await adminClient.from('company_members')
      .update({ is_default: false })
      .eq('profile_id', user.id)

    await adminClient.from('company_members')
      .update({ is_default: true })
      .eq('profile_id', user.id)
      .eq('company_id', body.companyId)

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'ZodError') {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid company ID' } },
        { status: 422 }
      )
    }
    return NextResponse.json(
      { data: null, error: { code: 'SERVER_ERROR', message: 'Failed to switch company' } },
      { status: 500 }
    )
  }
}
