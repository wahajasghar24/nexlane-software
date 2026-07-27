import { NextResponse } from 'next/server'
import { createClient } from '@/core/supabase/server'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.json({ data: { success: true }, error: null })
}
