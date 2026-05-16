'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Tier } from '@/lib/supabase'

const PLANS = [
  {
    id: 'free' as Tier,
    name: 'Gratuit',
    price: '€0',
    period: 'pentru totdeauna',
    firme: '3 firme',
    features: ['Verificare zilnică', 'Email alerts', 'Dashboard'],
    color: 'var(--border)',
    cta: 'Plan curent',
    disabled: true,
  },
  {
    id: 'starter' as Tier,
    name: 'Starter',
    price: '€19',
    period: '/lună',
    firme: '25 firme',
    features: ['Verificare zilnică', 'Email alerts', 'Dashboard complet', 'Istoric alerte'],
    color: '#6366f1',
    cta: 'Upgrade la Starter',
    disabled: false,
  },
  {
    id: 'pro' as Tier,
    name: 'Pro',
    price: '€49',
    period: '/lună',
    firme: '200 firme',
    features: ['Verificare zilnică', 'Email alerts', 'Dashboard complet', 'Istoric alerte', 'Export raport CSV'],
    color: '#8b5cf6',
    cta: 'Upgrade la Pro',
    disabled: false,
  },
]

export default function UpgradePage() {
  const router = useRouter()
  const [tier, setTier] = useState<Tier>('free')
  const [email, setEmail] = useState('')
  const [selected, setSelected] = useState<'starter' | 'pro' | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setEmail(session.user.email ?? '')
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('tier')
        .eq('id', session.user.id)
        .single()
      setTier((profile?.tier ?? 'free') as Tier)
    })
  }, [router])

  async function requestUpgrade() {
    if (!selected) return
    setSending(true)
    setError('')
    const res = await fetch('/api/upgrade-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: selected, email }),
    })
    if (res.ok) {
      setSent(true)
    } else {
      setError('A apărut o eroare. Trimite un email la contact@monitor-anaf.ro.')
    }
    setSending(false)
  }

  const planPrice = selected === 'starter' ? '€19' : selected === 'pro' ? '€49' : ''

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}
          >
            ← Înapoi la dashboard
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Alege planul tău
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>
            Plan curent: <strong style={{ color: 'var(--indigo)', textTransform: 'capitalize' }}>{tier}</strong>
          </p>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 40 }}>
          {PLANS.map(plan => {
            const isCurrent = plan.id === tier
            const isSelected = selected === plan.id

            return (
              <div
                key={plan.id}
                onClick={() => { if (!plan.disabled && !isCurrent) setSelected(plan.id as 'starter' | 'pro') }}
                style={{
                  background: 'var(--surface)',
                  border: `2px solid ${isSelected ? plan.color : isCurrent ? plan.color + '60' : 'var(--border)'}`,
                  borderRadius: 14,
                  padding: '24px 20px',
                  cursor: plan.disabled || isCurrent ? 'default' : 'pointer',
                  transition: 'border-color 0.15s',
                  position: 'relative',
                }}
              >
                {isCurrent && (
                  <div style={{
                    position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                    background: plan.color, color: '#fff',
                    fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
                    letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    Plan curent
                  </div>
                )}

                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{plan.name}</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>{plan.price}</span>
                  <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 4 }}>{plan.period}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: plan.color, marginBottom: 18 }}>{plan.firme} monitorizate</div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#10b981', fontSize: 10 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>

                {!isCurrent && (
                  <button
                    onClick={e => { e.stopPropagation(); setSelected(plan.id as 'starter' | 'pro') }}
                    style={{
                      width: '100%', padding: '9px 0', borderRadius: 8,
                      background: isSelected ? plan.color : 'transparent',
                      border: `1px solid ${plan.color}`,
                      color: isSelected ? '#fff' : plan.color,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isSelected ? '✓ Selectat' : plan.cta}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Payment instructions */}
        {selected && !sent && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '28px 24px',
          }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              Activare plan {selected === 'starter' ? 'Starter' : 'Pro'} — {planPrice}/lună
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              Efectuează transferul bancar la datele de mai jos, apoi apasă <strong style={{ color: 'var(--text)' }}>„Am plătit"</strong>.
              Planul tău va fi activat manual în maxim 24 de ore.
            </p>

            {/* Transfer details */}
            <div style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '18px 20px',
              marginBottom: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              {[
                { label: 'Beneficiar', value: 'SC MONITOR ANAF SRL' },
                { label: 'IBAN', value: 'RO38 RNCB 0128 1413 8918 0002' },
                { label: 'Bancă', value: 'BCR' },
                { label: 'Sumă', value: planPrice + '/lună' },
                { label: 'Referință', value: email },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)', flexShrink: 0 }}>{row.label}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 600, color: 'var(--text)',
                    fontFamily: row.label === 'IBAN' || row.label === 'Referință' ? 'monospace' : 'inherit',
                    textAlign: 'right',
                  }}>{row.value}</span>
                </div>
              ))}
            </div>

            <p style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 20, lineHeight: 1.5 }}>
              ⚠️ Folosește emailul tău (<strong style={{ color: 'var(--text2)' }}>{email}</strong>) ca referință la transfer
              pentru a putea identifica plata.
            </p>

            {error && (
              <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#ef444415', borderRadius: 8 }}>
                {error}
              </div>
            )}

            <button
              onClick={requestUpgrade}
              disabled={sending}
              style={{
                background: '#6366f1', color: '#fff', border: 'none',
                borderRadius: 9, padding: '12px 28px',
                fontSize: 14, fontWeight: 700, cursor: sending ? 'default' : 'pointer',
                opacity: sending ? 0.7 : 1,
              }}
            >
              {sending ? 'Se trimite...' : 'Am efectuat plata'}
            </button>
          </div>
        )}

        {/* Success state */}
        {sent && (
          <div style={{
            background: '#10b98115',
            border: '1px solid #10b98130',
            borderRadius: 14,
            padding: '32px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>
              Cerere înregistrată!
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6 }}>
              Am primit notificarea. Planul tău va fi activat în maxim 24 de ore
              după confirmarea plății. Vei primi un email de confirmare.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                marginTop: 24, background: '#6366f1', color: '#fff',
                border: 'none', borderRadius: 8, padding: '10px 24px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Înapoi la dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
