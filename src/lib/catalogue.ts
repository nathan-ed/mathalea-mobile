// Types des parcours. Les parcours arrivent par les dossiers partagés
// (fichier parcours-mathalea.json, voir partage.ts) ; aucun n'est intégré à l'app.
import type { ParamsExercice } from './moteur'

export interface Etape extends ParamsExercice {
  titre: string
}

/** Mêmes valeurs que le presMode de MathALÉA */
export type Presentation = 'une_question_par_page' | 'un_exo_par_page' | 'liste_exos'

export type Validation = 'question' | 'page' | 'parcours'

export interface Parcours {
  id: string
  version: number // augmente à chaque export modifié ; les séances gardent la leur
  titre: string
  objectif: string
  niveau: string
  theme: string
  difficulte: 1 | 2 | 3
  icone: string // classe boxicons
  presentation: Presentation
  // Validation (et correction) après chaque question, à la fin de chaque page, ou à la fin du parcours
  correction: Validation
  etapes: Etape[]
}
