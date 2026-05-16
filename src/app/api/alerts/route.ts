export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createSupabaseAdmin()
  const { data } = await db
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json(data ?? [])
}
