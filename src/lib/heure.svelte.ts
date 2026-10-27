// Heure qui fait foi pour les dates d'ouverture des paliers : celle des
// serveurs (en-tête Date d'une réponse HTTPS), jamais l'horloge du téléphone,
// que l'élève peut avancer. Deux serveurs : un serveur à l'heure fausse existe
// (coopmaths.fr avait 22 minutes de retard le 27 octobre 2026) ; on garde la
// plus petite des heures lues, un palier ne s'ouvre jamais trop tôt. L'heure
// reste en mémoire et avance avec performance.now(), horloge monotone que le
// réglage de l'heure du téléphone ne change pas ; elle est relue au lancement,
// au retour dans l'app et toutes les 10 minutes, seulement si un parcours a
// des dates (`exigerHeure`). Seule une requête HEAD part, sans aucune donnée.
import { dansTauri } from './stockage'

export const SERVEURS_HEURE = ['https://mathalea.fr/', 'https://forge.apps.education.fr/']
const DELAI = 8000

export const heure = $state({ maintenant: null as number | null })

let base: { serveur: number; monotone: number } | null = null
let enCours: Promise<void> | null = null
let utile = false

async function dateDe(url: string): Promise<number> {
  const f: typeof fetch = dansTauri ? ((await import('@tauri-apps/plugin-http')).fetch as typeof fetch) : fetch
  const controle = new AbortController()
  const minuteur = setTimeout(() => controle.abort(), DELAI)
  try {
    // Navigateur (pnpm dev) : l'en-tête Date d'un autre site n'est pas lisible
    // (CORS) ; le serveur de développement le lit pour nous
    const r = dansTauri
      ? await f(url, { method: 'HEAD', cache: 'no-store', signal: controle.signal })
      : await f(`/__heure?url=${encodeURIComponent(url)}`, { cache: 'no-store', signal: controle.signal })
    const date = dansTauri ? r.headers.get('date') : ((await r.json()) as { date?: string }).date
    const t = date ? Date.parse(date) : NaN
    if (!Number.isFinite(t)) throw new Error(`Heure illisible : ${url}`)
    return t
  } finally {
    clearTimeout(minuteur)
  }
}

function avancer() {
  if (base) heure.maintenant = base.serveur + (performance.now() - base.monotone)
}

/** Relit l'heure des serveurs ; sans réponse, garde la précédente (ou aucune) */
export function synchroniserHeure() {
  enCours ??= (async () => {
    const debut = performance.now()
    const lues = (await Promise.allSettled(SERVEURS_HEURE.map(dateDe))).flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
    if (lues.length) {
      base = { serveur: Math.min(...lues), monotone: debut }
      avancer()
    }
  })().finally(() => (enCours = null))
  return enCours
}

/** Un parcours affiché a des dates d'ouverture : l'heure est lue (une fois) et suivie */
export function exigerHeure() {
  utile = true
  if (!base) void synchroniserHeure()
}

/** Avance l'heure ; la relit au retour dans l'app et toutes les 10 minutes si elle sert ; renvoie l'arrêt */
export function suivreHeure() {
  const minute = setInterval(avancer, 30_000)
  const relecture = setInterval(() => utile && void synchroniserHeure(), 10 * 60_000)
  const retour = () => {
    if (utile && document.visibilityState === 'visible') void synchroniserHeure()
  }
  document.addEventListener('visibilitychange', retour)
  return () => {
    clearInterval(minute)
    clearInterval(relecture)
    document.removeEventListener('visibilitychange', retour)
  }
}
