// Toutes les fiches de cours à un endroit (Nathan, 2026-10-30) : celles des
// parcours de l'élève, rangées par chapitre, et les siennes, enregistrées pour
// y revenir vite, dans l'ordre qu'il choisit. Une fiche enregistrée est une
// copie : elle reste même si son parcours quitte l'appareil.
import { paliersDe, type Fiche, type Parcours } from './catalogue'
import { cleChapitre } from './explorer'
import { estFiche, estObjet, estTexte, listeDe, sansDoublon } from './validation'

export const CLE_FICHES = 'fiches-enregistrees'

export interface FicheDuParcours {
  cle: string // « parcours#palier », comme les fiches montrées d'office
  parcours: string // titre du parcours
  niveau: string
  theme: string
  fiche: Fiche
}

/** Fiches des parcours, une seule fois chacune (même fiche dans deux parcours : la première) */
export function fichesDes(parcours: Parcours[]): FicheDuParcours[] {
  const vues = new Set<string>()
  const liste: FicheDuParcours[] = []
  for (const p of parcours)
    paliersDe(p).forEach((x, k) => {
      if (!x.fiche) return
      const contenu = JSON.stringify(x.fiche)
      if (vues.has(contenu)) return
      vues.add(contenu)
      liste.push({ cle: `${p.id}#${k}`, parcours: p.titre, niveau: p.niveau, theme: p.theme, fiche: x.fiche })
    })
  return liste
}

/** Par chapitre (degré et chapitre, comme l'Explorer), dans l'ordre des parcours */
export function parChapitre(fiches: FicheDuParcours[]) {
  const chapitres = new Map<string, { niveau: string; theme: string; fiches: FicheDuParcours[] }>()
  for (const f of fiches) {
    const cle = cleChapitre(f)
    if (!chapitres.has(cle)) chapitres.set(cle, { niveau: f.niveau, theme: f.theme, fiches: [] })
    chapitres.get(cle)!.fiches.push(f)
  }
  return [...chapitres.values()]
}

export const estEnregistree = (liste: FicheDuParcours[], cle: string) => liste.some((f) => f.cle === cle)

/** Enregistre la fiche (à la fin) ou la retire si elle y est déjà */
export const basculer = (liste: FicheDuParcours[], f: FicheDuParcours) =>
  estEnregistree(liste, f.cle) ? liste.filter((x) => x.cle !== f.cle) : [...liste, f]

/** Déplace la fiche d'un rang vers le haut (-1) ou vers le bas (+1) */
export function deplacer(liste: FicheDuParcours[], cle: string, sens: -1 | 1) {
  const i = liste.findIndex((f) => f.cle === cle)
  const j = i + sens
  if (i < 0 || j < 0 || j >= liste.length) return liste
  const r = [...liste]
  ;[r[i], r[j]] = [r[j], r[i]]
  return r
}

/** Fiches enregistrées bien formées (sauvegarde) */
export const estFichesEnregistrees = (v: unknown) =>
  listeDe(v, (f) => estObjet(f) && estTexte(f.cle) && estTexte(f.parcours) && estTexte(f.niveau) && estTexte(f.theme) && estFiche(f.fiche)) &&
  sansDoublon((v as FicheDuParcours[]).map((f) => f.cle))
