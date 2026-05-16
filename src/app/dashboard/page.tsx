'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, TIER_LIMITS, Tier } from '@/lib/supabase'

interface Company {
  id: string
  cui: string
  name: string
  created_at: string
  company_status?: {
    tva_activ: boolean
    inactiv: boolean
    are_datorii: boolean
    last_checked: string
  }
}

interface Alert {
  id: string
  company_name: string
  cui: string
  changes: string[]
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tier, setTier] = useState<Tier>('free')
  const [companies, setCompanies] = useState<Company[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [cui, setCui] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'companies' | 'alerts'>('companies')

  const fetchData = useCallback(async () => {
    const [companiesRes, alertsRes] = await Promise.all([
      fetch('/api/companies'),
      fetch('/api/alerts'),
    ])
    if (companiesRes.ok) setCompanies(await companiesRes.json())
    if (alertsRes.ok) setAlerts(await alertsRes.json())
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('tier')
        .eq('id', session.user.id)
        .single()
      setTier((profile?.tier ?? 'free') as Tier)
      await fetchData()
      setLoading(false)
    })
  }, [router, fetchData])

  async function addCompany(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')
    setAdding(true)
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cui: cui.trim() }),
    })
    const data = await res.json()
    if (!res.ok) { setAddError(data.error); setAdding(false); return }
    setCui('')
    setAdding(false)
    await fetchData()
  }

  async function removeCompany(id: string) {
    await fetch('/api/companies', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await fetchData()
  }

  const limit = TIER_LIMITS[tier]
  const used = companies.length

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text3)' }}>
          <div style={{ width: 16, height: 16, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 14 }}>Se încarcă...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>

      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface)',
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff',
          }}>M</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: 0.3 }}>Monitor ANAF</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px' }}>
          {[
            { id: 'companies', label: 'Firme', count: used },
            { id: 'alerts', label: 'Alerte', count: alerts.length, highlight: alerts.length > 0 },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', borderRadius: 7, marginBottom: 2,
                background: activeTab === item.id ? 'var(--surface2)' : 'transparent',
                border: activeTab === item.id ? '1px solid var(--border)' : '1px solid transparent',
                color: activeTab === item.id ? 'var(--text)' : 'var(--text3)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              {item.label}
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 10,
                background: item.highlight ? '#ef444420' : 'var(--border)',
                color: item.highlight ? '#ef4444' : 'var(--text3)',
              }}>
                {item.count}
              </span>
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          {tier === 'free' && (
            <a href="/upgrade" style={{
              display: 'block', textAlign: 'center', marginBottom: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', textDecoration: 'none',
              padding: '8px', borderRadius: 7, fontSize: 12, fontWeight: 600,
            }}>
              ↑ Upgrade plan
            </a>
          )}
          <div style={{ padding: '4px 6px', marginBottom: 4 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{tier}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
            style={{
              width: '100%', padding: '7px 10px', borderRadius: 7,
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text3)', fontSize: 12, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Ieșire
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <header style={{
          borderBottom: '1px solid var(--border)',
          padding: '0 28px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface)',
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            {activeTab === 'companies' ? 'Firme monitorizate' : 'Alerte'}
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Firme active</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                {used}<span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 400 }}>/{limit === 999999 ? '∞' : limit}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Alerte</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{alerts.length}</div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, padding: 28, overflowY: 'auto' }}>

          {/* ── Tab: Firme ── */}
          {activeTab === 'companies' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Add form */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                  Adaugă firmă nouă
                </div>
                <form onSubmit={addCompany} style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    value={cui}
                    onChange={e => setCui(e.target.value)}
                    placeholder="CUI — ex: 4221187"
                    pattern="\d{6,10}"
                    style={{
                      flex: 1, background: 'var(--surface2)',
                      border: '1px solid var(--border)', borderRadius: 8,
                      padding: '9px 14px', color: 'var(--text)', fontSize: 13, outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={adding || used >= limit}
                    style={{
                      background: adding || used >= limit ? 'var(--border)' : '#6366f1',
                      color: '#fff', border: 'none', borderRadius: 8,
                      padding: '9px 20px', fontSize: 13, fontWeight: 600,
                      cursor: adding || used >= limit ? 'default' : 'pointer',
                      opacity: adding || used >= limit ? 0.6 : 1,
                    }}
                  >
                    {adding ? 'Se adaugă...' : '+ Adaugă'}
                  </button>
                </form>
                {addError && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>{addError}</p>}
                {used >= limit && tier === 'free' && (
                  <p style={{ color: '#f59e0b', fontSize: 12, marginTop: 8 }}>
                    Limită atinsă. <a href="/upgrade" style={{ color: '#6366f1' }}>Fă upgrade</a> pentru mai multe firme.
                  </p>
                )}
              </div>

              {/* Table */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                {companies.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 12 }}>🏢</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Nicio firmă monitorizată</div>
                    <div style={{ fontSize: 13, color: 'var(--text3)' }}>Introdu un CUI mai sus pentru a începe</div>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Firmă', 'TVA', 'Status', 'Verificat', ''].map(h => (
                          <th key={h} style={{
                            padding: '10px 20px', textAlign: 'left',
                            fontSize: 11, fontWeight: 600, color: 'var(--text3)',
                            textTransform: 'uppercase', letterSpacing: 0.5,
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((c, i) => {
                        const s = c.company_status
                        return (
                          <tr key={c.id} style={{
                            borderBottom: i < companies.length - 1 ? '1px solid var(--border)' : 'none',
                          }}>
                            <td style={{ padding: '14px 20px' }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{c.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace' }}>CUI {c.cui}</div>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              {s ? (
                                <span style={{
                                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                                  background: s.tva_activ ? '#10b98118' : '#ef444418',
                                  color: s.tva_activ ? '#10b981' : '#ef4444',
                                  border: `1px solid ${s.tva_activ ? '#10b98130' : '#ef444430'}`,
                                }}>
                                  {s.tva_activ ? '● Activ' : '● Radiat'}
                                </span>
                              ) : <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>}
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              {s ? (
                                <span style={{
                                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                                  background: !s.inactiv ? '#10b98118' : '#ef444418',
                                  color: !s.inactiv ? '#10b981' : '#ef4444',
                                  border: `1px solid ${!s.inactiv ? '#10b98130' : '#ef444430'}`,
                                }}>
                                  {s.inactiv ? '● Inactiv' : '● Activ'}
                                </span>
                              ) : <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>}
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text3)' }}>
                              {s?.last_checked ? new Date(s.last_checked).toLocaleDateString('ro-RO') : 'Curând'}
                            </td>
                            <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                              <button
                                onClick={() => removeCompany(c.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 12, cursor: 'pointer' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
                              >
                                Șterge
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── Tab: Alerte ── */}
          {activeTab === 'alerts' && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              {alerts.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>✅</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Nicio alertă</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)' }}>Vei fi notificat când apare o modificare fiscală</div>
                </div>
              ) : (
                <div>
                  {alerts.map((a, i) => (
                    <div key={a.id} style={{
                      padding: '16px 20px',
                      borderBottom: i < alerts.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{a.company_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace', marginBottom: 8 }}>CUI {a.cui}</div>
                          {a.changes.map((ch, j) => (
                            <div key={j} style={{
                              display: 'flex', alignItems: 'flex-start', gap: 6,
                              fontSize: 12, color: '#f59e0b', marginBottom: 4,
                            }}>
                              <span>⚠</span><span>{ch}</span>
                            </div>
                          ))}
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                          {new Date(a.created_at).toLocaleDateString('ro-RO')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
