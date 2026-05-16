export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdmin } from '@/lib/supabase-server'
import { queryAnaf } from '@/lib/anaf'
import { TIER_LIMITS } from '@/lib/supabase'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createSupabaseAdmin()

  const { data: companies } = await db
    .from('monitored_companies')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!companies?.length) return NextResponse.json([])

  const cuis = companies.map(c => c.cui)
  const { data: statuses } = await db
    .from('company_status')
    .select('cui, tva_activ, inactiv, are_datorii, last_checked')
    .in('cui', cuis)

  const statusMap = Object.fromEntries((statuses ?? []).map(s => [s.cui, s]))

  const result = companies.map(c => ({
    ...c,
    company_status: statusMap[c.cui] ?? null,
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createSupabaseAdmin()

  // Check tier + role din DB (nu din token)
  const { data: profile } = await db
    .from('user_profiles')
    .select('tier, role')
    .eq('id', user.id)
    .single()

  const tier = (profile?.tier ?? 'free') as keyof typeof TIER_LIMITS
  const role = profile?.role ?? 'user'
  const limit = (role === 'owner' || role === 'admin') ? 999999 : TIER_LIMITS[tier]

  const { count } = await db
    .from('monitored_companies')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= limit) {
    return NextResponse.json(
      { error: `Ai atins limita de ${limit} firme pentru planul ${tier}. Fă upgrade pentru a adăuga mai multe.` },
      { status: 403 }
    )
  }

  const { cui } = await req.json()
  if (!cui || isNaN(parseInt(cui))) {
    return NextResponse.json({ error: 'CUI invalid' }, { status: 400 })
  }

  // Query ANAF immediately
  let anafData = null
  let name = `Firma CUI ${cui}`
  try {
    const results = await queryAnaf([parseInt(cui)])
    if (results[0]) {
      anafData = results[0]
      name = anafData.denumire || name
    }
  } catch {}

  // Check if already monitored
  const { data: existing } = await db
    .from('monitored_companies')
    .select('id')
    .eq('user_id', user.id)
    .eq('cui', String(cui))
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Această firmă este deja monitorizată' }, { status: 409 })
  }

  const { data: company, error } = await db
    .from('monitored_companies')
    .insert({ user_id: user.id, cui: String(cui), name })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Save initial status
  if (anafData) {
    await db.from('company_status').upsert({
      cui: String(cui),
      tva_activ: anafData.tva_activ,
      inactiv: anafData.inactiv,
      are_datorii: anafData.are_datorii,
      last_checked: new Date().toISOString(),
      data: anafData,
    }, { onConflict: 'cui' })
  }

  return NextResponse.json({ ...company, status: anafData })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  const db = createSupabaseAdmin()

  await db
    .from('monitored_companies')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
