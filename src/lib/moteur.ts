// Chargement du moteur MathALÉA à l'exécution (paquet construit par
// `vite build -c vite.moteur.config.ts` dans MathALÉA). Le moteur n'est pas
// compilé dans l'app : une mise à jour signée peut le remplacer sans nouvelle
// version de l'app (voir src-tauri/src/moteur.rs).
import { dansTauri } from './stockage'

export const API_ATTENDUE = 1

export interface ParamsExercice {
  uuid: string
  id?: string
  nbQuestions?: number
  sup?: string
  sup2?: string
  sup3?: string
  sup4?: string
  alea?: string
}

export interface QuestionPreparee {
  contexte: string
  enonce: string
  correction: string
  interactive: boolean
}

export interface ExercicePrepare {
  uuid: string
  titre: string
  graine: string
  numero: number
  questions: QuestionPreparee[]
  interne: unknown
}

export interface ResultatVerification {
  juste: boolean
  points: number
  total: number
  retour: string
  reponses: Record<string, string>
}

export interface Moteur {
  API_MOTEUR: number
  VERSION_MOTEUR: string
  initialiser(): Promise<void>
  preparerExercice(params: ParamsExercice, numero: number): Promise<ExercicePrepare>
  afficher(element: HTMLElement): Promise<void>
  ajusterFigures(element: HTMLElement): void
  ecrireReponses(reponses: Record<string, string>): Promise<void>
  verifier(exercice: ExercicePrepare, question: number): ResultatVerification
  monterClavier(cible: HTMLElement): () => void
  listerExercices(pays?: Pays): Promise<ExerciceDuReferentiel[]>
  /** Absent des moteurs antérieurs au 2026-10-13 */
  decrireExercice?(uuid: string): Promise<DescriptionExercice>
  /** Absent des moteurs antérieurs au 2026-10-18 */
  titreHtml?(titre: string): string
  definirLangue(langue: 'fr-FR' | 'fr-CH'): void
}

export type Pays = 'FR' | 'CH'

/** Paramètre réglable d'un exercice (formulaire du site MathALÉA) */
export interface ParametreExercice {
  cle: 'sup' | 'sup2' | 'sup3' | 'sup4'
  titre: string
  type: 'nombre' | 'liste' | 'case' | 'texte'
  max?: number
  options?: { valeur: string; libelle: string }[]
  aide?: string
  defaut: string
}

export interface DescriptionExercice {
  uuid: string
  titre: string
  nbQuestions: number
  nbQuestionsModifiable: boolean
  parametres: ParametreExercice[]
}

/** Niveaux proposés dans l'éditeur, selon les référentiels de MathALÉA */
export const NIVEAUX: Record<Pays, string[]> = {
  FR: ['6e', '5e', '4e', '3e', '2e', '1re', 'Terminale'],
  CH: ['9e', '10e', '11e', '1re Collège', '2e Collège', '3e Collège', '4e Collège'],
}

export interface ExerciceDuReferentiel {
  uuid: string
  id: string
  titre: string
  niveau: string
  theme: string
  interactif: boolean
  objectif?: { code: string; libelle: string } // moteurs postérieurs au 2026-10-15
  chemin?: NoeudDuReferentiel[] // nœuds du menu du site, moteurs postérieurs au 2026-10-18
}

/** Nœud du menu du site : niveau, chapitre, sous-chapitre… */
export interface NoeudDuReferentiel {
  code: string
  titre: string // « 2N : Calcul numérique », « Seconde »
  sousTheme: boolean // le site le montre déplié, en intertitre
}

interface Manifeste {
  version: string
  api: number
  entree: string
  css: string
}

// Moteur téléchargé par une mise à jour (src-tauri/src/moteur.rs)
interface MoteurTelecharge {
  version: string
  publieLe: string
  dossier: string
}

export interface InfoMoteur {
  version: string
  source: 'livré' | 'téléchargé'
  publieLe: string // date de référence pour chercher une version plus récente
}

let info: InfoMoteur | null = null
export const infoMoteur = () => info

const baseLivree = () => new URL('/moteur/', location.href).href

async function lireManifeste(base: string): Promise<Manifeste> {
  return (await (await fetch(base + 'manifest.json')).json()) as Manifeste
}

async function chargerDepuis(base: string): Promise<Moteur> {
  const manifeste = await lireManifeste(base)
  if (manifeste.api !== API_ATTENDUE) {
    throw new Error(`Moteur ${manifeste.version} incompatible (API ${manifeste.api})`)
  }
  await new Promise<void>((ok, ko) => {
    const lien = document.createElement('link')
    lien.rel = 'stylesheet'
    lien.href = base + manifeste.css
    lien.onload = () => ok()
    lien.onerror = () => ko(new Error('Feuille de style du moteur introuvable'))
    // Avant nos propres styles : l'app garde la main sur sa mise en page
    document.head.prepend(lien)
  })
  const module = (await import(/* @vite-ignore */ base + manifeste.entree)) as Moteur
  const moteur: Moteur = { ...module, preparerExercice: (params, numero) => preparerComplet(module, params, numero) }
  // Les tracés à main levée de MathALÉA (MainLevee) s'appuient sur le conteneur
  // du site : sans lui, leurs segments disparaissent. Le moteur le crée depuis
  // la 0.3.2, pas celui publié par mathalea.fr (version Google Play)
  if (!document.getElementById('appMathalea')) {
    const conteneur = document.createElement('div')
    conteneur.id = 'appMathalea'
    conteneur.hidden = true
    document.body.appendChild(conteneur)
  }
  await moteur.initialiser()
  // MathLive cherche ses polices et ses sons à côté de ses modules
  // (morceaux/fonts, morceaux/sounds : introuvables) ; les polices KaTeX du
  // moteur sont dans fonts/. Sans sons : il n'y en a pas dans le moteur.
  const champ = (globalThis as { MathfieldElement?: { fontsDirectory: string | null; soundsDirectory: string | null } }).MathfieldElement
  if (champ) {
    champ.fontsDirectory = new URL('fonts/', new URL(base, location.href)).href
    champ.soundsDirectory = null
  }
  return moteur
}

/**
 * Exercices qui chargent leurs questions après coup (Automatismes 6e, 3e, 2de,
 * 1re, CAN 6e aléatoire) : la première génération ne contient que
 * « chargement... », le site attend l'événement updateAsyncEx pour réafficher.
 * Ici : attendre la fin du chargement, puis régénérer avec la même graine
 * (questions alors en cache). Sans cela, la question restait « chargement... ».
 */
async function preparerComplet(module: Moteur, params: ParamsExercice, numero: number): Promise<ExercicePrepare> {
  const ex = await module.preparerExercice(params, numero)
  const statut = () => (ex.interne as { generationStatus?: string }).generationStatus
  if (statut() !== 'loading') return ex
  const debut = Date.now()
  while (statut() === 'loading' && Date.now() - debut < 60_000) await new Promise((ok) => setTimeout(ok, 100))
  if (statut() !== 'ready') throw new Error(`Exercice ${params.uuid} : questions non chargées`)
  return module.preparerExercice({ ...params, alea: ex.graine }, numero)
}

/** « 2026-10-13+commit » → « 2026-10-13T00:00:00Z » : date du moteur livré */
const dateDeVersion = (version: string) => `${version.slice(0, 10)}T00:00:00Z`

let chargement: Promise<Moteur> | null = null

/**
 * Charge le moteur le plus récent entre celui livré avec l'app et celui
 * téléchargé par une mise à jour ; en cas d'échec du second, le premier.
 */
export function chargerMoteur(): Promise<Moteur> {
  chargement ??= (async () => {
    const livre = await lireManifeste(baseLivree())
    let telecharge: MoteurTelecharge | null = null
    let baseTelechargee = ''
    if (dansTauri) {
      const { invoke, convertFileSrc } = await import('@tauri-apps/api/core')
      telecharge = await invoke<MoteurTelecharge | null>('moteur_telecharge').catch(() => null)
      baseTelechargee = convertFileSrc('', 'moteur').replace(/\/?$/, '/')
    }
    if (telecharge && telecharge.publieLe > dateDeVersion(livre.version)) {
      try {
        const moteur = await chargerDepuis(baseTelechargee)
        info = { version: telecharge.version, source: 'téléchargé', publieLe: telecharge.publieLe }
        return moteur
      } catch (e) {
        console.warn('Moteur téléchargé inutilisable, moteur livré utilisé', e)
      }
    }
    const moteur = await chargerDepuis(baseLivree())
    info = { version: livre.version, source: 'livré', publieLe: dateDeVersion(livre.version) }
    return moteur
  })()
  chargement.catch(() => (chargement = null))
  return chargement
}

/**
 * Le moteur se met-il à jour sans l'app ? Non dans les versions des boutiques
 * (Google Play, App Store), dont les règles l'interdisent : elles gardent le
 * moteur livré, mis à jour avec l'app.
 */
export async function misesAJourMoteur(): Promise<boolean> {
  if (!dansTauri) return false
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<boolean>('mises_a_jour_moteur').catch(() => false)
}

/**
 * Cherche et installe une version plus récente du moteur (signée, même API).
 * Elle sera utilisée au prochain lancement. Renvoie sa version, ou null.
 */
export async function chercherMiseAJourMoteur(): Promise<string | null> {
  if (!dansTauri || !info) return null
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<string | null>('mettre_a_jour_moteur', { api: API_ATTENDUE, publieActuel: info.publieLe })
}

/**
 * Éléments corrigés par MathALÉA (rangs de `autoCorrection`) d'une question
 * affichée. D'ordinaire un seul, de même rang. Mais certains exercices placent
 * plusieurs éléments dans une question (6AutoA1 : la deuxième affiche les cases
 * Q2 et Q3, 6N3M trois champs) : ce sont ceux dont elle affiche les champs.
 * Vérifier le seul élément de même rang laissait des réponses de côté et
 * comptait faux des questions justes (élément affiché dans une autre question).
 */
export function elementsDeQuestion(ex: ExercicePrepare, i: number): number[] {
  const q = ex.questions[i]
  const corriges = (ex.interne as { autoCorrection?: ({ formatInteractif?: string } | undefined)[] }).autoCorrection ?? []
  const vus = new Set<number>()
  const motif = new RegExp(`\\b(?:id|mathfield-id)=["']([A-Za-z0-9-]*?)Ex${ex.numero}Q(\\d+)(R\\d+|field\\d+)?["']`, 'g')
  for (const m of q?.enonce.matchAll(motif) ?? []) {
    const k = Number(m[2])
    const format = corriges[k]?.formatInteractif
    if (format && elementDeReponse(m[1], m[3] ?? '', format)) vus.add(k)
  }
  return vus.size ? [...vus].sort((a, b) => a - b) : [i]
}

/**
 * Élément qui porte la réponse d'une question de ce format : champ, case de
 * QCM, élément de MathALÉA du même nom. Pas une figure ni un tableau affiché
 * pour l'exemple : dans les Automatismes, leurs identifiants gardent la
 * numérotation de leur exercice d'origine (« M2DpenteAffineEx0Q0 » dans la
 * cinquième question) ; la cinquième question était alors vérifiée avec la
 * première, et sa réponse vide effaçait celle de la première au bilan.
 */
function elementDeReponse(prefixe: string, suffixe: string, format: string): boolean {
  const norme = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^mathalea/, '')
  const qcm = norme(format) === 'qcm'
  if (prefixe === 'check') return qcm && suffixe.startsWith('R')
  if (prefixe === 'champTexte') return !qcm && suffixe === ''
  return norme(prefixe) === norme(format)
}

/**
 * Correction prête à insérer. Celle d'un QCM reprend ses boutons radio, bonne
 * réponse cochée, sous le même nom que ceux de l'énoncé : insérée telle quelle,
 * elle décochait le choix de l'élève (un seul bouton coché par groupe), au
 * bilan comme après « Vérifier ». Construite hors du document, ses boutons
 * forment leur propre groupe.
 */
export function fragmentCorrection(html: string): DocumentFragment {
  const modele = document.createElement('template')
  modele.innerHTML = html
  for (const bouton of modele.content.querySelectorAll<HTMLInputElement>('input[type=radio][name]')) bouton.name += '-correction'
  return modele.content
}

/**
 * Figures réduites à la largeur de leur propre bloc. ajusterFigures prend la
 * largeur de tout l'élément : une figure dans une liste en retrait (correction
 * en étapes 1., 2.…) en sortait encore de 5 à 25 px.
 */
export function ajusterFiguresEnRetrait(moteur: Moteur, element: HTMLElement) {
  moteur.ajusterFigures(element)
  const droite = element.getBoundingClientRect().right
  for (const figure of element.querySelectorAll('.mathalea2d')) {
    const bloc = figure.closest<HTMLElement>('.svgContainer')
    if (bloc && element.contains(bloc) && figure.getBoundingClientRect().right > droite + 1) moteur.ajusterFigures(bloc)
  }
}

/**
 * Contenu d'un trou (\placeholder[id]{…}) lu dans la valeur LaTeX d'un champ
 * MathLive, accolades imbriquées comprises : « \placeholder[champ1]{6}\text{ cm}^2 »
 * donne « 6 », et non « 6}\text{ cm » (réponse juste comptée fausse).
 */
export function trouDansLatex(latex: string, id: string): string {
  const debut = new RegExp(`\\\\placeholder\\[${id}\\](?:\\[[^\\]]*\\])*\\{`).exec(latex)
  if (!debut) return ''
  let profondeur = 1
  for (let i = debut.index + debut[0].length; i < latex.length; i++) {
    const c = latex[i]
    if (c === '\\') i++
    else if (c === '{') profondeur++
    else if (c === '}' && --profondeur === 0) return latex.slice(debut.index + debut[0].length, i)
  }
  return ''
}

/** Vérifie une question affichée : tous ses éléments corrigés, scores additionnés */
export function verifierQuestion(moteur: Moteur, ex: ExercicePrepare, i: number): ResultatVerification {
  const elements = elementsDeQuestion(ex, i)
  if (elements.length === 1) return moteur.verifier(ex, elements[0])
  const r = elements.map((k) => moteur.verifier(ex, k))
  return {
    juste: r.every((v) => v.juste),
    // Un élément sans barème compte pour une réponse
    points: r.reduce((a, v) => a + (v.total > 0 ? v.points : v.juste ? 1 : 0), 0),
    total: r.reduce((a, v) => a + (v.total > 0 ? v.total : 1), 0),
    retour: r.map((v) => v.retour).filter(Boolean).join(' '),
    reponses: Object.assign({}, ...r.map((v) => v.reponses)),
  }
}
