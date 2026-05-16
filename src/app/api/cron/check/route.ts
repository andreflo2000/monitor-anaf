export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { queryAnaf, detectChanges, AnafStatus } from '@/lib/anaf'
import { sendAlertEmail } from '@/lib/email'
import { sendTelegramAlert } from '@/lib/notify'

export const maxDuration = 60

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createSupabaseAdmin()
  const start = Date.now()
  let companiesChecked = 0
  let alertsSent = 0

  try {
    // Fetch all monitored companies with their owner email
    const { data: monitored } = await db
      .from('monitored_companies')
      .select('id, cui, name, user_id, user_profiles(email)')

    if (!monitored?.length) {
      return NextResponse.json({ ok: true, checked: 0, alerts: 0 })
    }

    // Process in batches of 500 (ANAF API limit)
    const BATCH = 500
    for (let i = 0; i < monitored.length; i += BATCH) {
      const batch = monitored.slice(i, i + BATCH)
      const cuis = batch.map(c => parseInt(c.cui))

      let anafResults: AnafStatus[] = []
      try {
        anafResults = await queryAnaf(cuis)
      } catch (e) {
        console.error('ANAF batch error:', e)
        continue
      }

      const anafMap = new Map(anafResults.map(r => [r.cui, r]))

      for (const company of batch) {
        const curr = anafMap.get(company.cui)
        if (!curr) continue

        companiesChecked++

        // Get previous status
        const { data: prev } = await db
          .from('company_status')
          .select('*')
          .eq('cui', company.cui)
          .single()

        const changes = detectChanges(prev?.data ?? null, curr)

        // Upsert current status
        await db.from('company_status').upsert({
          cui: company.cui,
          tva_activ: curr.tva_activ,
          inactiv: curr.inactiv,
          are_datorii: curr.are_datorii,
          last_checked: new Date().toISOString(),
          data: curr,
        }, { onConflict: 'cui' })

        if (changes.length === 0) continue

        // Save alert to DB
        await db.from('alerts').insert({
          user_id: company.user_id,
          company_id: company.id,
          cui: company.cui,
          company_name: company.name,
          changes,
        })

        // Send email
        const email = (company as any).user_profiles?.email
        if (email) {
          try {
            await sendAlertEmail({
              to: email,
              companyName: company.name,
              cui: company.cui,
              alerts: changes,
            })
            alertsSent++
          } catch (e) {
            console.error(`Email error for ${company.cui}:`, e)
          }
        }
      }
    }

    const duration = Date.now() - start
    await db.from('cron_logs').insert({
      companies_checked: companiesChecked,
      alerts_sent: alertsSent,
      duration_ms: duration,
      status: 'success',
    })

    await sendTelegramAlert(
      `✅ Cron OK — ${companiesChecked} firme verificate, ${alertsSent} alerte trimise (${(duration/1000).toFixed(1)}s)`
    )

    return NextResponse.json({ ok: true, checked: companiesChecked, alerts: alertsSent, duration_ms: duration })

  } catch (e: any) {
    const duration = Date.now() - start
    await db.from('cron_logs').insert({
      companies_checked: companiesChecked,
      alerts_sent: alertsSent,
      duration_ms: duration,
      status: 'error',
      error: e.message,
    })
    await sendTelegramAlert(`❌ Cron EȘUAT\nEroare: ${e.message}`)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
