// Analyse des erreurs de la classe par une IA choisie par l'enseignant
// (facultatif) : Claude par l'API Messages d'Anthropic, les autres (Mistral,
// OpenAI, IA locale…) par l'API au format d'OpenAI. Simples requêtes HTTP,
// aucune bibliothèque d'un fournisseur dans l'app. La clé reste sur
// l'appareil : jamais dans une sauvegarde ni dans un fichier publié. Le texte
// envoyé ne contient aucun prénom (élèves en « Élève N »).
import { parametresIA, SERVICES_IA, type ConfigIA } from './analyse'
import { CONSIGNE_PSEUDONYMES } from './releve'
import { dansTauri } from './stockage'

const CONSIGNE = `Tu aides un enseignant de mathématiques à préparer son prochain cours à partir des réponses anonymes de sa classe à une série de questions.
Réponds en français, de façon concise et concrète, sans préambule ni formule de politesse.
Mise en forme simple : titres courts commençant par « ## », listes à puces commençant par « - », formules en LaTeX entre $…$. Pas de tableau.
${CONSIGNE_PSEUDONYMES}`

export class ErreurIA extends Error {}

// Dans l'app, les requêtes partent du côté natif (plugin HTTP) : pas de
// règles CORS du WebView, et une IA locale en http:// reste joignable
const fetchIA = async (): Promise<typeof fetch> => (dansTauri ? ((await import('@tauri-apps/plugin-http')).fetch as typeof fetch) : (...a) => fetch(...a))

/**
 * Demande l'analyse au service choisi ; le texte arrive au fur et à mesure
 * (surTexte). Renvoie le texte complet, ou lève une ErreurIA au message lisible.
 */
export async function analyserAvecIA(config: ConfigIA, texte: string, surTexte: (morceau: string) => void, signal?: AbortSignal): Promise<string> {
  return config.service === 'claude' ? analyserAvecClaude(config, texte, surTexte, signal) : analyserCompatibleOpenAI(config, texte, surTexte, signal)
}

/** Lit un flux d'événements (lignes « data: {…} ») et passe chaque objet à surDonnee ; fin = « [DONE] » */
async function lireFlux(rep: Response, surDonnee: (j: any) => void) {
  const traiter = (bloc: string) => {
    for (const ligne of bloc.split('\n')) {
      const l = ligne.trim()
      if (!l.startsWith('data:')) continue
      const donnee = l.slice(5).trim()
      if (!donnee || donnee === '[DONE]') continue
      let j: unknown
      try {
        j = JSON.parse(donnee)
      } catch {
        continue // ligne incomplète
      }
      surDonnee(j)
    }
  }
  let reste = ''
  const lecteur = rep.body!.getReader()
  const decodeur = new TextDecoder()
  for (;;) {
    const { done, value } = await lecteur.read()
    reste += done ? '\n' : decodeur.decode(value, { stream: true })
    const fin = reste.lastIndexOf('\n')
    if (fin >= 0) {
      traiter(reste.slice(0, fin))
      reste = reste.slice(fin + 1)
    }
    if (done) break
  }
}

/** Détail d'une réponse d'erreur (JSON), ou '' */
async function detailErreur(rep: Response) {
  try {
    const j = await rep.json()
    return String(j?.error?.message ?? j?.message ?? j?.detail ?? '')
  } catch {
    return '' // corps illisible
  }
}

/** Message clair selon la réponse d'Anthropic */
async function erreurClaude(rep: Response) {
  const detail = await detailErreur(rep)
  if (rep.status === 401) return 'Clé d’API refusée par Anthropic : vérifie-la dans « Réglages de l’IA ».'
  if (rep.status === 403) return 'Cette clé d’API n’a pas accès à ce modèle.'
  if (rep.status === 429) return 'Trop de demandes pour le moment : réessaie dans une minute.'
  if (rep.status === 400) return `Demande refusée par Anthropic${detail ? ` (${detail})` : ''}. Vérifie le crédit du compte de la clé.`
  return `Anthropic ne répond pas correctement (erreur ${rep.status}) : réessaie plus tard.`
}

const attendre = (ms: number) => new Promise((ok) => setTimeout(ok, ms))

async function analyserAvecClaude(config: ConfigIA, texte: string, surTexte: (morceau: string) => void, signal?: AbortSignal): Promise<string> {
  const { adresse, cle, modele } = parametresIA(config)
  const f = await fetchIA()
  const requete = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': cle,
      'anthropic-version': '2023-06-01',
      // Refus d'un classifieur de sécurité : le serveur relance sur le modèle de repli recommandé
      'anthropic-beta': 'server-side-fallback-2026-07-01',
      // Requête directe depuis le navigateur (pnpm dev) ; sans effet dans l'app
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: modele,
      max_tokens: 16000,
      stream: true,
      output_config: { effort: 'medium' },
      fallbacks: 'default',
      system: CONSIGNE,
      messages: [{ role: 'user', content: texte }],
    }),
    signal,
  }
  // Deux nouveaux essais sur une coupure, une surcharge ou trop de demandes
  let rep: Response | undefined
  for (let essai = 0; ; essai++) {
    try {
      rep = await f(`${adresse}/v1/messages`, requete)
    } catch {
      if (signal?.aborted) throw new ErreurIA('Analyse interrompue.')
      rep = undefined
    }
    const passager = !rep || rep.status === 429 || rep.status >= 500
    if (!passager || essai === 2) break
    await attendre(1000 * 2 ** essai)
    if (signal?.aborted) throw new ErreurIA('Analyse interrompue.')
  }
  if (!rep) throw new ErreurIA('Pas de connexion avec Anthropic : vérifie la connexion internet.')
  if (!rep.ok) throw new ErreurIA(await erreurClaude(rep))
  let complet = ''
  let fin = ''
  try {
    await lireFlux(rep, (j) => {
      if (j?.type === 'content_block_delta' && j.delta?.type === 'text_delta' && typeof j.delta.text === 'string') {
        complet += j.delta.text
        surTexte(j.delta.text)
      } else if (j?.type === 'message_delta' && j.delta?.stop_reason) fin = j.delta.stop_reason
      else if (j?.type === 'error') throw new ErreurIA(`Anthropic ne répond pas correctement (${j.error?.message ?? j.error?.type ?? 'erreur'}) : réessaie plus tard.`)
    })
  } catch (e) {
    if (e instanceof ErreurIA) throw e
    if (signal?.aborted) throw new ErreurIA('Analyse interrompue.')
    throw new ErreurIA(`Analyse impossible : ${(e as Error)?.message ?? e}`)
  }
  if (fin === 'refusal') throw new ErreurIA('L’assistant n’a pas pu analyser ce texte.')
  if (!complet.trim()) throw new ErreurIA('L’IA n’a rien répondu : réessaie plus tard.')
  return complet
}

/** Message clair selon la réponse d'un service compatible OpenAI */
async function erreurCompatible(rep: Response, nom: string) {
  const detail = await detailErreur(rep)
  if (rep.status === 401 || rep.status === 403) return `Clé d’API refusée par ${nom} : vérifie-la dans « Réglages de l’IA ».`
  if (rep.status === 404) return `Adresse ou modèle introuvable${detail ? ` (${detail})` : ''} : vérifie-les dans « Réglages de l’IA ».`
  if (rep.status === 429) return 'Trop de demandes pour le moment, ou crédit épuisé : réessaie plus tard.'
  if (rep.status === 400) return `Demande refusée${detail ? ` (${detail})` : ''}. Vérifie le modèle et le crédit du compte.`
  return `${nom} ne répond pas correctement (erreur ${rep.status}) : réessaie plus tard.`
}

async function analyserCompatibleOpenAI(config: ConfigIA, texte: string, surTexte: (morceau: string) => void, signal?: AbortSignal): Promise<string> {
  const { adresse, modele, cle } = parametresIA(config)
  const nom = SERVICES_IA[config.service].nom
  const f = await fetchIA()
  let rep: Response
  try {
    rep = await f(`${adresse}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(cle ? { authorization: `Bearer ${cle}` } : {}) },
      body: JSON.stringify({
        model: modele,
        stream: true,
        messages: [
          { role: 'system', content: CONSIGNE },
          { role: 'user', content: texte },
        ],
      }),
      signal,
    })
  } catch (e) {
    if (signal?.aborted) throw new ErreurIA('Analyse interrompue.')
    throw new ErreurIA(
      config.service === 'locale' || config.service === 'autre'
        ? `Pas de réponse de ${adresse} : l’IA doit être lancée et joignable depuis cet appareil.`
        : `Pas de connexion avec ${nom} : vérifie la connexion internet.`,
    )
  }
  if (!rep.ok) throw new ErreurIA(await erreurCompatible(rep, nom))
  try {
    // Réponse d'un bloc (service qui ignore le flux)
    if ((rep.headers.get('content-type') ?? '').includes('application/json')) {
      const j = await rep.json()
      const t = String(j?.choices?.[0]?.message?.content ?? '')
      surTexte(t)
      return t
    }
    let complet = ''
    await lireFlux(rep, (j) => {
      const t = j?.choices?.[0]?.delta?.content
      if (typeof t !== 'string') return
      complet += t
      surTexte(t)
    })
    if (!complet.trim()) throw new ErreurIA('L’IA n’a rien répondu : vérifie le modèle choisi.')
    return complet
  } catch (e) {
    if (e instanceof ErreurIA) throw e
    if (signal?.aborted) throw new ErreurIA('Analyse interrompue.')
    throw new ErreurIA(`Analyse impossible : ${(e as Error)?.message ?? e}`)
  }
}

/** Modèles proposés par un service compatible OpenAI (IA locale surtout) ; [] si rien */
export async function listerModeles(config: ConfigIA, signal?: AbortSignal): Promise<string[]> {
  const { adresse, cle } = parametresIA(config)
  try {
    const f = await fetchIA()
    const rep = await f(`${adresse}/models`, { headers: cle ? { authorization: `Bearer ${cle}` } : {}, signal })
    if (!rep.ok) return []
    const j = await rep.json()
    return Array.isArray(j?.data) ? j.data.map((m: { id?: unknown }) => m?.id).filter((id: unknown): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}
