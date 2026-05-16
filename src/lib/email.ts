import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAlertEmail({
  to,
  companyName,
  cui,
  alerts,
}: {
  to: string
  companyName: string
  cui: string
  alerts: string[]
}) {
  const alertList = alerts.map(a => `<li style="margin:8px 0;">⚠️ ${a}</li>`).join('')

  await resend.emails.send({
    from: 'Monitor ANAF <alerte@monitor-anaf.ro>',
    to,
    subject: `⚠️ Alertă ANAF: ${companyName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#dc2626;">Alertă Monitor ANAF</h2>
        <p>Au fost detectate modificări pentru firma:</p>
        <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
          <strong>${companyName}</strong><br/>
          <span style="color:#6b7280;">CUI: ${cui}</span>
        </div>
        <p><strong>Modificări detectate:</strong></p>
        <ul style="padding-left:20px;">${alertList}</ul>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;"/>
        <p style="color:#6b7280;font-size:14px;">
          Verifică situația completă pe
          <a href="https://www.anaf.ro/RegistruTVA/" style="color:#2563eb;">ANAF.ro</a>
        </p>
        <p style="color:#9ca3af;font-size:12px;">
          Monitor ANAF Pro ·
          <a href="https://monitor-anaf.ro/dashboard" style="color:#9ca3af;">Vezi dashboard</a>
        </p>
      </div>
    `,
  })
}
