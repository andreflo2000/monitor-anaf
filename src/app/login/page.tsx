'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'signup' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (tab === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess('Email trimis! Verifică inbox-ul pentru linkul de resetare.')
      setLoading(false)
      return
    }

    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('Email sau parolă incorectă.'); setLoading(false); return }
      router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess('Cont creat! Verifică emailul pentru confirmare.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Stânga — brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-12 text-white">
        <div>
          <span className="text-xl font-bold tracking-tight">Monitor ANAF Pro</span>
        </div>
        <div className="space-y-8">
          <div>
            <p className="text-4xl font-bold leading-tight mb-4">
              Știi imediat când un partener are probleme fiscale.
            </p>
            <p className="text-blue-300 text-lg">
              Monitorizare automată ANAF pentru contabili și firme B2B.
            </p>
          </div>
          <div className="space-y-4">
            {[
              'Alertă instant când TVA-ul unui partener e radiat',
              'Verificare nocturnă automată — fără efort manual',
              'Setup în 5 minute, 3 firme gratuit',
            ].map(item => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5 shrink-0">✓</span>
                <span className="text-blue-100 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-500 text-sm">© 2026 Monitor ANAF Pro</p>
      </div>

      {/* Dreapta — formular */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {tab === 'login' && 'Bun venit înapoi'}
              {tab === 'signup' && 'Creează cont gratuit'}
              {tab === 'reset' && 'Resetează parola'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {tab === 'login' && 'Intră în contul tău Monitor ANAF'}
              {tab === 'signup' && '3 firme monitorizate gratuit, fără card'}
              {tab === 'reset' && 'Îți trimitem un link pe email'}
            </p>
          </div>

          {tab !== 'reset' && (
            <div className="flex bg-gray-200 rounded-lg p-1 mb-6">
              {(['login', 'signup'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); setSuccess('') }}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t === 'login' ? 'Autentificare' : 'Cont nou'}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="nume@firma.ro"
              />
            </div>

            {tab !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Parolă</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setTab('reset'); setError(''); setSuccess('') }}
                    className="text-xs text-blue-600 hover:underline mt-1.5 float-right"
                  >
                    Ai uitat parola?
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? 'Se procesează...' : (
                tab === 'login' ? 'Autentificare' :
                tab === 'signup' ? 'Creare cont gratuit' :
                'Trimite link de resetare'
              )}
            </button>

            {tab === 'reset' && (
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); setSuccess('') }}
                className="w-full text-gray-500 text-sm hover:text-gray-700 py-2"
              >
                ← Înapoi la autentificare
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
