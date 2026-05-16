export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {}
  let allOk = true

  // 1. Supabase
  try {
    const db = createSupabaseAdmin()
    const { error } = await db.from('cron_logs').select('id').limit(1)
    checks.supabase = error ? { ok: false, detail: error.message } : { ok: true }
  } catch (e: any) {
    checks.supabase = { ok: false, detail: e.message }
  }

  // 2. ANAF API
  try {
    const res = await fetch('https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ cui: 4221187, data: new Date().toISOString().split('T')[0] }]),
      signal: AbortSignal.timeout(10000),
    })
    checks.anaf = res.ok ? { ok: true } : { ok: false, detail: `HTTP ${res.status}` }
  } catch (e: any) {
    checks.anaf = { ok: false, detail: e.message }
  }

  // 3. Cron ran in last 25 hours
  try {
    const db = createSupabaseAdmin()
    const { data } = await db
      .from('cron_logs')
      .select('ran_at, status')
      .order('ran_at', { ascending: false })
      .limit(1)
      .single()

    if (!data) {
      checks.cron = { ok: true, detail: 'no runs yet' }
    } else {
      const age = Date.now() - new Date(data.ran_at).getTime()
      const hoursAgo = age / 1000 / 60 / 60
      checks.cron = hoursAgo < 25 && data.status === 'success'
        ? { ok: true, detail: `last run ${hoursAgo.toFixed(1)}h ago` }
        : { ok: false, detail: `last run ${hoursAgo.toFixed(1)}h ago, status: ${data.status}` }
    }
  } catch (e: any) {
    checks.cron = { ok: false, detail: e.message }
  }

  allOk = Object.values(checks).every(c => c.ok)

  return NextResponse.json(
    { ok: allOk, checks, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 500 }
  )
}
