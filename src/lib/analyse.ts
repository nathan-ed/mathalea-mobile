// Analyse des erreurs par une IA : ce qui ne demande pas le SDK (constante de
// stockage, mise en forme de la réponse). L'appel lui-même est dans ia.ts.

/** Clé de stockage du service d'IA de l'enseignant (avec sa clé d'API) : propre à l'appareil, exclue des sauvegardes */
export const CLE_IA = 'cle-ia'

export type ServiceIA = 'claude' | 'mistral' | 'openai' | 'locale' | 'autre'

/** Service choisi par l'enseignant ; tous sauf Claude parlent le format de l'API d'OpenAI */
export interface ConfigIA {
  service: ServiceIA
  cle?: string
  adresse?: string // services compatibles OpenAI : adresse de base, avant /chat/completions
  modele?: string
}

export const SERVICES_IA: Record<ServiceIA, { nom: string; libelle: string; adresse: string; modele: string; lienCle?: string; cleRequise: boolean }> = {
  claude: { nom: 'Claude', libelle: 'Claude (Anthropic)', adresse: 'https://api.anthropic.com', modele: 'claude-opus-5-5', lienCle: 'https://console.anthropic.com/settings/keys', cleRequise: true },
  mistral: { nom: 'Mistral', libelle: 'Mistral', adresse: 'https://api.mistral.ai/v1', modele: 'mistral-large-latest', lienCle: 'https://console.mistral.ai/api-keys', cleRequise: true },
  openai: { nom: 'OpenAI', libelle: 'OpenAI', adresse: 'https://api.openai.com/v1', modele: 'gpt-5', lienCle: 'https://platform.openai.com/api-keys', cleRequise: true },
  locale: { nom: 'l’IA locale', libelle: 'IA locale (Ollama, LM Studio…)', adresse: 'http://localhost:11434/v1', modele: '', cleRequise: false },
  autre: { nom: 'l’IA', libelle: 'Autre adresse compatible OpenAI', adresse: '', modele: '', cleRequise: false },
}

/** Réglage gardé, ou null ; une clé seule (avant 0.4.0) est une clé Claude */
export function lireConfigIA(v: unknown): ConfigIA | null {
  if (typeof v === 'string') return v.trim() ? { service: 'claude', cle: v.trim() } : null
  if (!v || typeof v !== 'object') return null
  const c = v as Record<string, unknown>
  if (typeof c.service !== 'string' || !(c.service in SERVICES_IA)) return null
  const texte = (x: unknown) => (typeof x === 'string' && x.trim() ? x.trim() : undefined)
  return { service: c.service as ServiceIA, cle: texte(c.cle), adresse: texte(c.adresse), modele: texte(c.modele) }
}

/** Adresse et modèle effectifs (valeurs par défaut du service) */
export function parametresIA(c: ConfigIA) {
  const s = SERVICES_IA[c.service]
  return { adresse: (c.service === 'claude' ? s.adresse : (c.adresse ?? s.adresse)).replace(/\/+$/, ''), modele: c.modele ?? s.modele, cle: c.cle ?? '' }
}

/** Ce qui manque pour pouvoir lancer une analyse (message), ou null */
export function configIncomplete(c: ConfigIA): string | null {
  const { adresse, modele, cle } = parametresIA(c)
  if (SERVICES_IA[c.service].cleRequise && !cle) return 'Clé d’API manquante.'
  if (!adresse) return 'Adresse manquante.'
  return erreurAdresse(adresse) ?? (modele ? null : 'Modèle manquant.')
}

/**
 * HTTPS partout ; HTTP seulement vers cet appareil ou le réseau local (une IA
 * locale) : les réponses des élèves ne passent jamais en clair sur internet.
 */
export function erreurAdresse(adresse: string): string | null {
  let url: URL
  try {
    url = new URL(adresse)
  } catch {
    return 'Adresse invalide : elle commence par https:// ou http://.'
  }
  if (url.protocol === 'https:') return null
  if (url.protocol !== 'http:') return 'Adresse invalide : elle commence par https:// ou http://.'
  const h = url.hostname.replace(/^\[|\]$/g, '')
  const locale =
    h === 'localhost' ||
    h.endsWith('.local') ||
    h === '::1' ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    /^f[cd][0-9a-f]{2}:/i.test(h)
  return locale ? null : 'Une adresse en http:// n’est acceptée que sur le réseau local : utilise https://.'
}

/** Raisonnement de certains modèles locaux (<think>…</think>) : pas pour l'enseignant */
export const sansReflexion = (t: string) => t.replace(/<think>[\s\S]*?(<\/think>\s*|$)/g, '').trimStart()

const echapper = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Mise en forme de la réponse (titres « ## », puces « - », listes numérotées,
 * gras) en HTML aux classes de MathALÉA ; les formules $…$ restent pour KaTeX.
 */
export function htmlAnalyse(texte: string) {
  const enLigne = (t: string) => echapper(t).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  const sortie: string[] = []
  let liste: 'ul' | 'ol' | null = null
  const fermer = () => {
    if (liste) sortie.push(`</${liste}>`)
    liste = null
  }
  for (const ligne of texte.split('\n')) {
    const l = ligne.trim()
    const titre = /^#{1,4}\s+(.*)$/.exec(l)
    const puce = /^[-*•]\s+(.*)$/.exec(l)
    const numero = /^\d+[.)]\s+(.*)$/.exec(l)
    if (titre) {
      fermer()
      sortie.push(`<p class="mt-3 font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">${enLigne(titre[1])}</p>`)
    } else if (puce || numero) {
      const voulue = puce ? 'ul' : 'ol'
      if (liste !== voulue) {
        fermer()
        sortie.push(voulue === 'ul' ? '<ul class="list-disc pl-5">' : '<ol class="list-decimal pl-5">')
        liste = voulue
      }
      sortie.push(`<li>${enLigne((puce ?? numero)![1])}</li>`)
    } else if (l) {
      fermer()
      sortie.push(`<p class="mt-2">${enLigne(l)}</p>`)
    } else fermer()
  }
  fermer()
  return sortie.join('')
}
