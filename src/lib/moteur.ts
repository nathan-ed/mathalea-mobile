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
  const moteur = (await import(/* @vite-ignore */ base + manifeste.entree)) as Moteur
  await moteur.initialiser()
  return moteur
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
