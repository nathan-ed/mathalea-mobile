// Analyse des erreurs de la classe par une IA choisie par l'enseignant
// (facultatif) : Claude par le SDK d'Anthropic, les autres (Mistral, OpenAI,
// IA locale…) par l'API au format d'OpenAI. Chargé seulement au moment d'une
// analyse (le SDK n'alourdit pas le démarrage). La clé reste sur l'appareil :
// jamais dans une sauvegarde ni dans un fichier publié. Le texte envoyé ne
// contient aucun prénom (élèves en « Élève N »).
import Anthropic from '@anthropic-ai/sdk'
import { parametresIA, SERVICES_IA, type ConfigIA } from './analyse'
import { CONSIGNE_PSEUDONYMES } from './releve'
import { dansTauri } from './stockage'

const CONSIGNE = `Tu aides un enseignant de mathématiques à préparer son prochain cours à partir des réponses anonymes de sa classe à une série de questions.
Réponds en français, de façon concise et concrète, sans préambule ni formule de politesse.
Mise en forme simple : titres courts commençant par « ## », listes à puces commençant par « - », formules en LaTeX entre $…$. Pas de tableau.
${CONSIGNE_PSEUDONYMES}`

export class ErreurIA extends Error {}

/** Message clair pour l'enseignant, selon l'erreur de l'API */
function messageErreur(e: unknown) {
  if (e instanceof Anthropic.AuthenticationError) return 'Clé d’API refusée par Anthropic : vérifie-la dans « Réglages de l’IA ».'
  if (e instanceof Anthropic.PermissionDeniedError) return 'Cette clé d’API n’a pas accès à ce modèle.'
  if (e instanceof Anthropic.RateLimitError) return 'Trop de demandes pour le moment : réessaie dans une minute.'
  if (e instanceof Anthropic.APIConnectionError) return 'Pas de connexion avec Anthropic : vérifie la connexion internet.'
  if (e instanceof Anthropic.BadRequestError) return `Demande refusée par Anthropic (${e.message}). Vérifie le crédit du compte de la clé.`
  if (e instanceof Anthropic.APIError) return `Anthropic ne répond pas correctement (erreur ${e.status ?? 'inconnue'}) : réessaie plus tard.`
  return `Analyse impossible : ${(e as Error)?.message ?? e}`
}

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

async function analyserAvecClaude(config: ConfigIA, texte: string, surTexte: (morceau: string) => void, signal?: AbortSignal): Promise<string> {
  const { cle, modele } = parametresIA(config)
  const options: NonNullable<ConstructorParameters<typeof Anthropic>[0]> = { apiKey: cle, dangerouslyAllowBrowser: true, maxRetries: 2 }
  options.fetch = await fetchIA()
  const client = new Anthropic(options)
  try {
    const flux = client.beta.messages.stream(
      {
        model: modele,
        max_tokens: 16000,
        output_config: { effort: 'medium' },
        // Refus d'un classifieur de sécurité : le serveur relance sur le modèle de repli recommandé
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: CONSIGNE,
        messages: [{ role: 'user', content: texte }],
      },
      { signal },
    )
    flux.on('text', (morceau) => surTexte(morceau))
    const message = await flux.finalMessage()
    if (message.stop_reason === 'refusal') throw new ErreurIA('L’assistant n’a pas pu analyser ce texte.')
    return message.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
  } catch (e) {
    if (e instanceof ErreurIA) throw e
    if (signal?.aborted) throw new ErreurIA('Analyse interrompue.')
    throw new ErreurIA(messageErreur(e))
  }
}

/** Message clair selon la réponse d'un service compatible OpenAI */
async function erreurCompatible(rep: Response, nom: string) {
  let detail = ''
  try {
    const j = await rep.json()
    detail = String(j?.error?.message ?? j?.message ?? j?.detail ?? '')
  } catch {
    /* corps illisible */
  }
  if (rep.status === 401 || rep.status === 403) return `Clé d’API refusée par ${nom} : vérifie-la dans « Réglages de l’IA ».`
  if (rep.status === 404) return `Adresse ou modèle introuvable${detail ? ` (${detail})` : ''} : vérifie-les dans « Réglages de l’IA ».`
  if (rep.status === 429) return 'Trop de demandes pour le moment, ou crédit épuisé : réessaie plus tard.'
  if (rep.status === 400) return `Demande refusée${detail ? ` (${detail})` : ''}. Vérifie le modèle et le crédit du compte.`
  return `${nom} ne répond pas correctement (erreur ${rep.status}) : réessaie plus tard.`
}

/** Texte des lignes « data: {…} » d'un flux (format OpenAI) ; fin = « [DONE] » */
function morceauxDuFlux(bloc: string) {
  const sortie: string[] = []
  for (const ligne of bloc.split('\n')) {
    const l = ligne.trim()
    if (!l.startsWith('data:')) continue
    const donnee = l.slice(5).trim()
    if (!donnee || donnee === '[DONE]') continue
    try {
      const j = JSON.parse(donnee)
      const t = j?.choices?.[0]?.delta?.content
      if (typeof t === 'string') sortie.push(t)
    } catch {
      /* ligne incomplète ou autre événement */
    }
  }
  return sortie
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
    let reste = ''
    const lecteur = rep.body!.getReader()
    const decodeur = new TextDecoder()
    for (;;) {
      const { done, value } = await lecteur.read()
      reste += done ? '\n' : decodeur.decode(value, { stream: true })
      const fin = reste.lastIndexOf('\n')
      if (fin >= 0) {
        for (const m of morceauxDuFlux(reste.slice(0, fin))) {
          complet += m
          surTexte(m)
        }
        reste = reste.slice(fin + 1)
      }
      if (done) break
    }
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
