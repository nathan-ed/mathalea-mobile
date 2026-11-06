// Bibliothèque d'un enseignant d'avant la 0.6, quand l'app avait un espace
// enseignant (branche mode-enseignant). Elle reste sur l'appareil : les
// Réglages l'exportent dans le fichier que la page Parcours du site sait ouvrir.
import type { Parcours } from './catalogue'
import { creerFichier } from './partage'
import type { Objectif } from './objectifs'
import type { Stockage } from './stockage'

export interface ParcoursEnseignant {
  parcours: Parcours
  classes: string[] // un même parcours pouvait être donné à plusieurs classes
  exportee: Record<string, number> // par classe : dernière version exportée
}

export interface Bibliotheque {
  lien?: string
  classes: { nom: string }[]
  parcours: ParcoursEnseignant[] // dans l'ordre présenté aux élèves
  publieLe?: string
  verifieLe?: string
  empreinte?: string
}

export async function lireBibliotheque(st: Stockage): Promise<Bibliotheque> {
  const b = await st.lire<Bibliotheque>('bibliotheque')
  return b && Array.isArray(b.classes) && Array.isArray(b.parcours) ? b : { classes: [], parcours: [] }
}

const pret = (pe: ParcoursEnseignant) => pe.parcours.etapes.length > 0 && pe.parcours.titre.trim() !== ''

/** Fichier complet : les classes et leurs parcours, et toute la bibliothèque (parcours sans classe, objectifs) */
export function exporter(b: Bibliotheque, objectifs: Objectif[] = []): string {
  const classes = b.classes
    .map((c) => ({ nom: c.nom, parcours: b.parcours.filter((pe) => pe.classes.includes(c.nom) && pret(pe)).map((pe) => pe.parcours) }))
    .filter((c) => c.parcours.length > 0)
  return creerFichier(classes, true, { parcours: b.parcours.map((pe) => pe.parcours), ...(objectifs.length ? { objectifs } : {}) })
}
