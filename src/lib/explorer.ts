// Explorer : parcours de l'équipe MathALÉA rangés par degré puis par chapitre.
// Degrés, chapitres et leur ordre viennent du référentiel de MathALÉA (lu par
// le moteur) : s'il change, l'Explorer suit. Le pays d'un parcours se déduit
// de son niveau (« 4e Collège » est suisse) ; aucun champ de plus dans le fichier.
import type { Parcours } from './catalogue'
import { NIVEAUX, type ExerciceDuReferentiel, type Pays } from './moteur'

/** Un degré du référentiel : ses noms (code et libellé du menu) et ses chapitres dans l'ordre du site */
export interface Repere {
  noms: string[]
  chapitres: string[]
}

export interface ChapitreExplorer {
  theme: string
  parcours: Parcours[]
}

export interface NiveauExplorer {
  niveau: string
  chapitres: ChapitreExplorer[]
}

// Noms de l'éditeur qui diffèrent des codes du référentiel français
const ALIAS: Record<string, string> = { '1re': '1e' }
const normaliser = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
const cle = (t: string) => normaliser(ALIAS[t.trim()] ?? t)

/** Degrés et chapitres dans l'ordre du menu du site */
export function reperesDu(liste: ExerciceDuReferentiel[]): Repere[] {
  const reperes: Repere[] = []
  for (const e of liste) {
    let r = reperes.find((x) => x.noms.includes(e.niveau))
    if (!r) reperes.push((r = { noms: [e.niveau], chapitres: [] }))
    const libelle = e.chemin?.[0]?.titre
    if (libelle && !r.noms.includes(libelle)) r.noms.push(libelle)
    if (e.theme && !r.chapitres.includes(e.theme)) r.chapitres.push(e.theme)
  }
  return reperes
}

/** Sans moteur : niveaux de l'éditeur, chapitres dans l'ordre du fichier */
export const reperesParDefaut = (pays: Pays): Repere[] => NIVEAUX[pays].map((n) => ({ noms: [n], chapitres: [] }))

const rang = (liste: string[], nom: string) => {
  const i = liste.findIndex((x) => cle(x) === cle(nom))
  return i === -1 ? Infinity : i
}
// Inconnus (Infinity) à égalité : le tri stable garde l'ordre du fichier
const comparer = (x: number, y: number) => (x === y ? 0 : x - y)
const rangNiveau = (reperes: Repere[], niveau: string) => reperes.findIndex((r) => rang(r.noms, niveau) !== Infinity)

/**
 * Parcours du pays choisi, par degré puis par chapitre. Un parcours est suisse
 * si son niveau est un degré suisse, français sinon. Seuls les degrés et les
 * chapitres qui ont des parcours apparaissent ; ceux que le référentiel ne
 * connaît pas viennent après, dans l'ordre du fichier.
 */
export function arborescence(parcours: Parcours[], pays: Pays, reperes: Repere[]): NiveauExplorer[] {
  const suisses = pays === 'CH' ? [...reperes.flatMap((r) => r.noms), ...NIVEAUX.CH] : NIVEAUX.CH
  const estSuisse = (p: Parcours) => rang(suisses, p.niveau) !== Infinity
  const retenus = parcours.filter((p) => estSuisse(p) === (pays === 'CH'))

  const niveaux: NiveauExplorer[] = []
  for (const p of retenus) {
    const r = rangNiveau(reperes, p.niveau)
    // Même degré sous deux noms (« 1re » et « 1e ») : un seul groupe, au nom du premier parcours
    let n = niveaux.find((x) => (r !== -1 ? rangNiveau(reperes, x.niveau) === r : cle(x.niveau) === cle(p.niveau)))
    if (!n) niveaux.push((n = { niveau: p.niveau, chapitres: [] }))
    let c = n.chapitres.find((x) => cle(x.theme) === cle(p.theme))
    if (!c) n.chapitres.push((c = { theme: p.theme, parcours: [] }))
    c.parcours.push(p)
  }

  const ordre = (n: NiveauExplorer) => {
    const r = rangNiveau(reperes, n.niveau)
    return r === -1 ? Infinity : r
  }
  niveaux.sort((a, b) => comparer(ordre(a), ordre(b)))
  for (const n of niveaux) {
    const chapitres = reperes[rangNiveau(reperes, n.niveau)]?.chapitres ?? []
    const rc = (c: ChapitreExplorer) => rang(chapitres, c.theme)
    n.chapitres.sort((a, b) => comparer(rc(a), rc(b)))
    // Dans un chapitre : de Découverte à Approfondissement, l'ordre du fichier sinon
    for (const c of n.chapitres) c.parcours.sort((a, b) => a.difficulte - b.difficulte)
  }
  return niveaux
}
