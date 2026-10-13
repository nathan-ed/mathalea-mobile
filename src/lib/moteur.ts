// Chargement du moteur MathALÉA à l'exécution (paquet construit par
// `vite build -c vite.moteur.config.ts` dans MathALÉA). Le moteur n'est pas
// compilé dans l'app : une nouvelle version peut être installée sans mise à
// jour de l'app (voir RESULTATS.md, « moteur embarqué »).

export const API_ATTENDUE = 1

export interface ParamsExercice {
  uuid: string
  id?: string
  nbQuestions?: number
  sup?: string
  sup2?: string
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
  definirLangue(langue: 'fr-FR' | 'fr-CH'): void
}

export type Pays = 'FR' | 'CH'

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
}

interface Manifeste {
  version: string
  api: number
  entree: string
  css: string
}

let chargement: Promise<Moteur> | null = null

/** Dossier du moteur actif. Plus tard : version téléchargée dans les données de l'app. */
export const dossierMoteur = () => new URL('/moteur/', location.href).href

export function chargerMoteur(): Promise<Moteur> {
  chargement ??= (async () => {
    const base = dossierMoteur()
    const manifeste = (await (await fetch(base + 'manifest.json')).json()) as Manifeste
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
  })()
  chargement.catch(() => (chargement = null))
  return chargement
}
