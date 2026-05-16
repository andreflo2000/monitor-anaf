import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdmin } from '@/lib/supabase-server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { plan, email } = body

  if (!plan || !email) {
    return NextResponse.json({ error: 'Date lipsă' }, { status: 400 })
  }

  const planName = plan === 'starter' ? 'Starter (€19/lună)' : 'Pro (€49/lună)'

  try {
    await resend.emails.send({
      from: 'Monitor ANAF <alerte@monitor-anaf.ro>',
      to: 'florianparvu9@gmail.com',
      subject: `🔔 Cerere upgrade: ${planName} — ${email}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2 style="color:#6366f1;">Cerere upgrade Monitor ANAF</h2>
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0 0 8px;"><strong>Email client:</strong> ${email}</p>
            <p style="margin:0 0 8px;"><strong>Plan solicitat:</strong> ${planName}</p>
            <p style="margin:0;"><strong>User ID:</strong> ${user?.id ?? 'necunoscut'}</p>
          </div>
          <p>Verifică transferul bancar și activează planul manual în Supabase:</p>
          <pre style="background:#1e293b;color:#e2e8f0;padding:12px;border-radius:6px;font-size:12px;">UPDATE user_profiles SET tier = '${plan}' WHERE email = '${email}';</pre>
          <p style="color:#6b7280;font-size:13px;">Trimite confirmare clientului după activare.</p>
        </div>
      `,
    })

    await resend.emails.send({
      from: 'Monitor ANAF <alerte@monitor-anaf.ro>',
      to: email,
      subject: `✅ Cerere upgrade înregistrată — ${planName}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2 style="color:#6366f1;">Cerere upgrade înregistrată</h2>
          <p>Am primit cererea ta de upgrade la planul <strong>${planName}</strong>.</p>
          <p>Planul va fi activat în maxim 24 de ore după confirmarea plății.</p>
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0;font-size:13px;color:#6b7280;">
              Dacă ai întrebări, răspunde direct la acest email sau scrie la
              <a href="mailto:contact@monitor-anaf.ro">contact@monitor-anaf.ro</a>.
            </p>
          </div>
          <p style="color:#9ca3af;font-size:12px;">Monitor ANAF Pro</p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
