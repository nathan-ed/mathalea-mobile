// Révisions espacées et mélangées, calculées sur l'appareil à partir de ce que
// l'élève a fait (aucun réglage de l'enseignant). Chaque exercice d'un passage
// terminé entre dans des boîtes (méthode de Leitner) qui fixent la date de sa
// prochaine révision ; il revient avec de nouvelles valeurs. Une séance de
// révision mélange des exercices de chapitres différents, sans leur titre :
// l'élève doit reconnaître seul le type de problème (pratique mélangée).
import type { Etape, Parcours } from './catalogue'
import { cleExercice } from './objectifs'
import { bilan, ID_REVISIONS, type Seance } from './progression'

export { ID_REVISIONS }
// Séance au choix de l'élève (3, 6 ou 10 questions), une question par
// exercice : jamais un stock à rattraper (« le but, c'est qu'il fasse des
// maths, pas qu'il soit surchargé », Nathan)
export const TAILLES = [3, 6, 10]
export const TAILLE_PAR_DEFAUT = 6
/** Jours avant la révision suivante, selon la boîte (1 à 5) */
export const INTERVALLES = [0, 1, 3, 7, 21, 56]

export interface ElementRevision {
  etape: Etape // l'exercice et ses réglages (copie), avec ses objectifs
  niveau: string
  theme: string // chapitre
  parcours: string // titre du dernier parcours où il a été travaillé
  boite: number
  prochaine: string // jour (AAAA-MM-JJ) de la prochaine révision
  revu?: string // dernier jour de révision
  historique: { le: string; reussi: boolean }[] // dernières révisions (10 au plus)
}

export interface Revisions {
  elements: Record<string, ElementRevision> // par exercice (cleExercice)
  traites: string[] // passages déjà pris en compte (parcours@début)
  chapitres?: string[] // chapitres choisis par l'élève (cleChapitre) ; absent : tous
  taille?: number // questions par séance choisies par l'élève (TAILLES)
}

export const revisionsVides = (): Revisions => ({ elements: {}, traites: [] })

/** Jour local au format AAAA-MM-JJ */
export function jour(d = new Date()) {
  const z = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}
export function plusJours(j: string, n: number) {
  const [a, m, d] = j.split('-').map(Number)
  return jour(new Date(a, m - 1, d + n))
}

export const cleChapitre = (e: Pick<ElementRevision, 'niveau' | 'theme'>) => `${e.niveau}|${e.theme}`
export const estRevision = (id: string | undefined) => id === ID_REVISIONS

/** Boîte d'entrée d'après la réussite au parcours */
const boiteDEntree = (pourcentage: number) => (pourcentage >= 80 ? 3 : pourcentage >= 50 ? 2 : 1)

function placer(e: ElementRevision, boite: number, aujourdhui: string): ElementRevision {
  const b = Math.min(5, Math.max(1, boite))
  return { ...e, boite: b, prochaine: plusJours(aujourdhui, INTERVALLES[b]) }
}

/** Exercice révisé : réussi, boîte suivante ; manqué, boîte précédente */
export function apresRevision(e: ElementRevision, reussi: boolean, aujourdhui: string): ElementRevision {
  const suite = placer(e, e.boite + (reussi ? 1 : -1), aujourdhui)
  return { ...suite, revu: aujourdhui, historique: [...e.historique, { le: aujourdhui, reussi }].slice(-10) }
}

const clePassage = (s: Seance) => `${s.parcours}@${s.debut}`

/**
 * Prend en compte les passages terminés pas encore vus : chaque exercice
 * vérifiable entre dans les révisions, ou, s'il y est déjà, avance ou recule
 * comme après une révision (seulement s'il était à revoir, ou s'il est manqué).
 * Les révisions elles-mêmes passent par resultatsRevision ; les tests de
 * niveau (diagnostics) n'entrent pas.
 */
export function integrerPassages(r: Revisions, passages: Seance[], exclure: (parcours: string) => boolean = () => false): Revisions {
  const traites = new Set(r.traites)
  const elements = { ...r.elements }
  let change = false
  const termines = passages
    .filter((s) => s.fin && !estRevision(s.parcours) && !exclure(s.parcours))
    .sort((a, b) => a.fin!.localeCompare(b.fin!))
  for (const s of termines) {
    const le = jour(new Date(s.fin!))
    for (const e of bilan(s).parEtape) {
      // Chaque exercice une fois, quand il est complet (questions passées reprises plus tard)
      const fait = `${clePassage(s)}#${e.etape}`
      if (traites.has(fait) || !e.sur || e.faites < e.sur) continue // déjà compté, sur papier ou pas terminé
      const etape = s.contenu.etapes[e.etape]
      if (!etape) continue
      const cle = cleExercice(etape)
      const pourcentage = (100 * e.points) / e.sur
      const avant = elements[cle]
      const base = { etape, niveau: s.contenu.niveau, theme: s.contenu.theme, parcours: s.contenu.titre }
      if (!avant) elements[cle] = placer({ ...base, boite: 1, prochaine: le, historique: [] }, boiteDEntree(pourcentage), le)
      else if (avant.prochaine <= le || pourcentage < 50) elements[cle] = { ...apresRevision(avant, pourcentage >= 80, le), ...base, revu: avant.revu }
      else elements[cle] = { ...avant, ...base }
      traites.add(fait)
      change = true
    }
  }
  return change ? { ...r, elements, traites: [...traites] } : r
}

/** Exercices dans les chapitres choisis */
export function choisis(r: Revisions) {
  const filtre = r.chapitres ? new Set(r.chapitres) : null
  return Object.entries(r.elements).filter(([, e]) => !filtre || filtre.has(cleChapitre(e)))
}

/** Exercices à revoir aujourd'hui (chapitres choisis) */
export const aRevoir = (r: Revisions, aujourdhui = jour()) => choisis(r).filter(([, e]) => e.prochaine <= aujourdhui)

/** Prochain jour de révision quand rien n'est à revoir */
export function prochaineRevision(r: Revisions) {
  const jours = choisis(r).map(([, e]) => e.prochaine)
  return jours.length ? jours.reduce((a, b) => (a < b ? a : b)) : null
}

/** Chapitres où l'élève a des exercices, avec leur nombre */
export function chapitres(r: Revisions) {
  const parCle = new Map<string, { cle: string; niveau: string; theme: string; nb: number; aRevoir: number }>()
  const aujourdhui = jour()
  for (const e of Object.values(r.elements)) {
    const cle = cleChapitre(e)
    const c = parCle.get(cle) ?? { cle, niveau: e.niveau, theme: e.theme, nb: 0, aRevoir: 0 }
    c.nb++
    if (e.prochaine <= aujourdhui) c.aRevoir++
    parCle.set(cle, c)
  }
  return [...parCle.values()].sort((a, b) => a.niveau.localeCompare(b.niveau, 'fr') || a.theme.localeCompare(b.theme, 'fr'))
}

/**
 * Séance de révision : `nb` exercices (une question chacun), les plus fragiles
 * d'abord (boîte la plus basse) puis les plus en retard, pris à tour de rôle
 * dans des chapitres différents (mélange). Le reste attend la séance suivante,
 * sans pénalité. Parcours généré sur l'appareil, sans titre d'exercice.
 */
export function tirerRevision(r: Revisions, aujourdhui = jour(), nb = r.taille ?? TAILLE_PAR_DEFAUT): Parcours | null {
  const dus = aRevoir(r, aujourdhui).sort(([, a], [, b]) => a.boite - b.boite || a.prochaine.localeCompare(b.prochaine))
  if (!dus.length) return null
  // À tour de rôle par chapitre, chacun dans son ordre de retard
  const parChapitre = new Map<string, [string, ElementRevision][]>()
  for (const x of dus) parChapitre.set(cleChapitre(x[1]), [...(parChapitre.get(cleChapitre(x[1])) ?? []), x])
  const files = [...parChapitre.values()]
  const pris: [string, ElementRevision][] = []
  for (let i = 0; pris.length < nb && files.some((f) => f.length > i); i++) for (const f of files) if (f[i] && pris.length < nb) pris.push(f[i])
  return {
    id: ID_REVISIONS,
    version: Number(aujourdhui.replace(/-/g, '')),
    titre: 'Révisions',
    objectif: '',
    niveau: '',
    theme: '',
    difficulte: 2,
    icone: 'bx-revision',
    presentation: 'une_question_par_page',
    correction: 'question',
    melanger: true,
    enTetesMasques: true,
    etapes: pris.map(([, e]) => ({ ...e.etape, nbQuestions: 1, titreMasque: true })),
  }
}

/**
 * Fin d'une séance de révision : chaque exercice terminé avance (sa question
 * correcte) ou recule, une seule fois (questions passées reprises
 * ensuite : l'exercice compte quand il est complet). `issues` : par rang
 * d'exercice dans la séance, y compris ceux comptés lors d'une fin précédente.
 */
export function resultatsRevision(r: Revisions, s: Seance, aujourdhui = jour()) {
  const elements = { ...r.elements }
  const traites = [...r.traites]
  const issues: Record<number, { reussi: boolean; avant: number; apres: ElementRevision }> = {}
  for (const e of bilan(s).parEtape) {
    const etape = s.contenu.etapes[e.etape]
    const cle = etape && cleExercice(etape)
    const avant = cle && elements[cle]
    if (!avant || !e.sur || e.faites < e.sur) continue
    const reussi = e.points >= e.sur
    const fait = `${clePassage(s)}#${e.etape}`
    if (traites.includes(fait)) {
      issues[e.etape] = { reussi, avant: avant.boite, apres: avant }
      continue
    }
    elements[cle] = apresRevision(avant, reussi, aujourdhui)
    traites.push(fait)
    issues[e.etape] = { reussi, avant: avant.boite, apres: elements[cle] }
  }
  return { revisions: { ...r, elements, traites }, issues }
}

/** Solidité dans le temps : d'après la boîte la plus basse des exercices de l'objectif */
export const SOLIDITES = ['À consolider', 'En bonne voie', 'Durable'] as const
export const solidite = (boite: number) => (boite >= 5 ? 2 : boite >= 3 ? 1 : 0)
export function soliditeObjectif(r: Revisions, libelle: string) {
  const boites = Object.values(r.elements)
    .filter((e) => e.etape.objectifs?.includes(libelle))
    .map((e) => e.boite)
  return boites.length ? solidite(Math.min(...boites)) : null
}

/** Quand l'exercice reviendra, en mots simples */
export function quand(prochaine: string, aujourdhui = jour()) {
  const [a, m, d] = aujourdhui.split('-').map(Number)
  const [a2, m2, d2] = prochaine.split('-').map(Number)
  const n = Math.round((new Date(a2, m2 - 1, d2).getTime() - new Date(a, m - 1, d).getTime()) / 86400000)
  if (n <= 0) return 'aujourd’hui'
  if (n === 1) return 'demain'
  if (n < 7) return `dans ${n} jours`
  if (n < 14) return 'dans 1 semaine'
  if (n < 31) return `dans ${Math.round(n / 7)} semaines`
  return `dans ${Math.round(n / 30)} mois`
}

/** Révisions bien formées (sauvegarde) */
export function estRevisions(v: unknown): v is Revisions {
  if (!v || typeof v !== 'object') return false
  const r = v as Revisions
  const jourValide = (j: unknown) => typeof j === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(j)
  return (
    !!r.elements &&
    typeof r.elements === 'object' &&
    Object.values(r.elements).every(
      (e) =>
        !!e &&
        typeof e === 'object' &&
        !!e.etape &&
        typeof e.etape.uuid === 'string' &&
        typeof e.niveau === 'string' &&
        typeof e.theme === 'string' &&
        typeof e.parcours === 'string' &&
        Number.isInteger(e.boite) &&
        e.boite >= 1 &&
        e.boite <= 5 &&
        jourValide(e.prochaine) &&
        (e.revu === undefined || jourValide(e.revu)) &&
        Array.isArray(e.historique) &&
        e.historique.every((h) => jourValide(h.le) && typeof h.reussi === 'boolean'),
    ) &&
    Array.isArray(r.traites) &&
    r.traites.every((t) => typeof t === 'string') &&
    (r.chapitres === undefined || (Array.isArray(r.chapitres) && r.chapitres.every((c) => typeof c === 'string'))) &&
    (r.taille === undefined || TAILLES.includes(r.taille))
  )
}
