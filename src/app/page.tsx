import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold text-gray-900 text-lg">Monitor ANAF Pro</span>
          <div className="flex items-center gap-4">
            <a href="#preturi" className="text-sm text-gray-500 hover:text-gray-700">Prețuri</a>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Login
            </Link>
            <Link
              href="/login"
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Începe gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wide">
          Monitorizare automată ANAF
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Știi imediat când un partener<br />
          <span className="text-blue-600">pierde TVA-ul sau devine inactiv</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Adaugi CUI-urile partenerilor tăi o singură dată. Primești email automat
          când apare orice modificare fiscală — fără să mai intri manual pe ANAF.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Încearcă gratuit 30 de zile
          </Link>
          <a
            href="#cum-functioneaza"
            className="text-gray-500 font-medium hover:text-gray-700 text-lg"
          >
            Cum funcționează →
          </a>
        </div>
        <p className="text-sm text-gray-400 mt-4">Fără card de credit. Anulezi oricând.</p>
      </section>

      {/* Pain point */}
      <section className="bg-red-50 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-lg text-red-800 font-medium">
            ⚠️ Dacă un furnizor al tău este radiat din TVA și tu nu știi,{' '}
            <strong>pierzi deducerea retroactiv</strong> și riscă amenzi.
            Verifici manual pe ANAF? La câte firme ai în portofoliu, e imposibil să nu scapi ceva.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="cum-functioneaza" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Cum funcționează</h2>
        <p className="text-gray-500 text-center mb-14">3 pași, setup de 5 minute</p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              nr: '1',
              titlu: 'Adaugi CUI-urile',
              desc: 'Introduci CUI-urile firmelor pe care vrei să le monitorizezi. Poți adăuga oricând firme noi.',
            },
            {
              nr: '2',
              titlu: 'Monitorizăm automat',
              desc: 'În fiecare noapte verificăm statusul fiscal al fiecărei firme direct de la ANAF.',
            },
            {
              nr: '3',
              titlu: 'Primești alertă instant',
              desc: 'Dacă apare orice modificare — TVA radiat, firmă inactivă — primești email imediat.',
            },
          ].map(step => (
            <div key={step.nr} className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step.nr}
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{step.titlu}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ce monitorizăm */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">Ce monitorizăm</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: '🔴', titlu: 'TVA radiat', desc: 'Alertă când un partener pierde calitatea de plătitor TVA' },
              { icon: '⚪', titlu: 'TVA reactivat', desc: 'Știi imediat când un furnizor redevine plătitor TVA' },
              { icon: '🚫', titlu: 'Firmă declarată inactivă', desc: 'Alertă când ANAF declară o firmă ca inactivă fiscal' },
              { icon: '✅', titlu: 'Reactivare fiscală', desc: 'Știi când un partener iese din starea de inactivitate' },
            ].map(item => (
              <div key={item.titlu} className="bg-white rounded-xl p-5 flex gap-4 border border-gray-100">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.titlu}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pentru cine */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">Perfect pentru</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              rol: 'Contabili',
              desc: 'Gestionezi zeci de clienți cu sute de furnizori. O verificare automată nocturnă îți salvează ore de muncă și te protejează de greșeli.',
            },
            {
              rol: 'Directori financiari',
              desc: 'Știi în timp real dacă un furnizor important are probleme fiscale, înainte să aprobi o factură.',
            },
            {
              rol: 'Firme B2B',
              desc: 'Lucrezi cu mulți parteneri comerciali și vrei să minimizezi riscul fiscal fără efort suplimentar.',
            },
          ].map(item => (
            <div key={item.rol} className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-3">{item.rol}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="preturi" className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Prețuri simple</h2>
          <p className="text-gray-500 text-center mb-14">Fără surprize. Anulezi oricând.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                plan: 'Gratuit',
                pret: '€0',
                perioada: 'pentru totdeauna',
                firme: '3 firme monitorizate',
                features: ['Verificare zilnică', 'Email alerts', 'Dashboard basic'],
                cta: 'Începe gratuit',
                highlight: false,
              },
              {
                plan: 'Starter',
                pret: '€19',
                perioada: '/lună',
                firme: '25 firme monitorizate',
                features: ['Verificare zilnică', 'Email alerts', 'Dashboard complet', 'Istoric alerte'],
                cta: 'Alege Starter',
                highlight: false,
              },
              {
                plan: 'Pro',
                pret: '€49',
                perioada: '/lună',
                firme: '200 firme monitorizate',
                features: ['Verificare zilnică', 'Email alerts', 'Dashboard complet', 'Istoric alerte', 'Export raport'],
                cta: 'Alege Pro',
                highlight: true,
              },
            ].map(p => (
              <div
                key={p.plan}
                className={`rounded-2xl p-7 border ${
                  p.highlight
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                {p.highlight && (
                  <div className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-3">
                    Cel mai popular
                  </div>
                )}
                <div className="font-bold text-lg mb-1">{p.plan}</div>
                <div className="mb-1">
                  <span className="text-4xl font-bold">{p.pret}</span>
                  <span className={`text-sm ml-1 ${p.highlight ? 'text-blue-200' : 'text-gray-400'}`}>
                    {p.perioada}
                  </span>
                </div>
                <div className={`text-sm mb-6 font-medium ${p.highlight ? 'text-blue-100' : 'text-blue-600'}`}>
                  {p.firme}
                </div>
                <ul className="space-y-2 mb-8">
                  {p.features.map(f => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${p.highlight ? 'text-blue-100' : 'text-gray-500'}`}>
                      <span>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    p.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">
            Ai peste 200 de firme? <a href="mailto:contact@monitor-anaf.ro" className="text-blue-600 underline">Contactează-ne</a> pentru planul Agency.
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Gata să monitorizezi automat?
        </h2>
        <p className="text-gray-500 mb-8 text-lg">
          Setup în 5 minute. 3 firme gratuit, fără card de credit.
        </p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Începe gratuit acum
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
          <span>© 2026 Monitor ANAF Pro</span>
          <span>contact@monitor-anaf.ro</span>
        </div>
      </footer>

    </div>
  )
}
