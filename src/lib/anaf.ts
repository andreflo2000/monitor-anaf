const ANAF_URL = 'https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva'

export interface AnafStatus {
  cui: string
  denumire: string
  tva_activ: boolean
  inactiv: boolean
  are_datorii: boolean
  data_inregistrare_tva: string | null
  data_radiere_tva: string | null
  judet: string | null
  adresa: string | null
  raw: Record<string, unknown>
}

export async function queryAnaf(cuis: number[]): Promise<AnafStatus[]> {
  const today = new Date().toISOString().split('T')[0]
  const body = cuis.map(cui => ({ cui, data: today }))

  const res = await fetch(ANAF_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) throw new Error(`ANAF API error: ${res.status}`)

  const json = await res.json()
  const results: AnafStatus[] = []

  for (const item of json.found ?? []) {
    const general = item.date_generale ?? {}
    const tva = item.inregistrare_scop_Tva ?? {}
    const inactiv = item.stare_inactiv ?? {}
    const adresa = item.adresa_domiciliu_fiscal ?? item.adresa_sediu_social ?? {}

    results.push({
      cui: String(general.cui ?? ''),
      denumire: general.denumire ?? '',
      tva_activ: tva.scpTVA === true,
      inactiv: inactiv.statusInactivi === true,
      are_datorii: false, // v9 nu expune direct datorii — verificat separat
      data_inregistrare_tva: (tva.perioade_TVA?.[0]?.dataInceputPerioadaTVA) ?? null,
      data_radiere_tva: (tva.perioade_TVA?.[0]?.dataSfarsitPerioadaTVA) ?? null,
      judet: adresa.ddenumire_Judet ?? adresa.sdenumire_Judet ?? null,
      adresa: general.adresa ?? null,
      raw: item,
    })
  }

  return results
}

export function detectChanges(
  prev: AnafStatus | null,
  curr: AnafStatus
): string[] {
  if (!prev) return []
  const alerts: string[] = []

  if (prev.tva_activ && !curr.tva_activ)
    alerts.push('TVA radiat — firma nu mai este plătitoare de TVA')

  if (!prev.tva_activ && curr.tva_activ)
    alerts.push('TVA reactivat — firma este din nou plătitoare de TVA')

  if (!prev.inactiv && curr.inactiv)
    alerts.push('Firmă declarată INACTIVĂ de ANAF')

  if (prev.inactiv && !curr.inactiv)
    alerts.push('Firmă reactivată — nu mai este declarată inactivă')


  return alerts
}
