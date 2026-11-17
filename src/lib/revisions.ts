// Révisions espacées et mélangées, calculées sur l'appareil à partir de ce que
// l'élève a fait (aucun réglage de l'enseignant). Chaque exercice d'un passage
// terminé entre dans des boîtes (méthode de Leitner) qui fixent la date de sa
// prochaine révision ; il revient avec de nouvelles valeurs. Une séance de
// révision mélange des exercices de chapitres différents, sans leur titre :
// l'élève doit reconnaître seul le type de problème (pratique mélangée).
// Avant une évaluation, l'élève choisit les parcours concernés et sa date :
// jusqu'à ce jour, les séances ne portent que sur eux, sans attendre les
// dates de révision (les autres exercices attendent, sans pénalité).
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
  sommet?: number // boîte la plus haute atteinte : les barrettes d'une ceinture ne se retirent pas (absent : la boîte)
  prochaine: string // jour (AAAA-MM-JJ) de la prochaine révision
  revu?: string // dernier jour de révision
  historique: { le: string; reussi: boolean }[] // dernières révisions (10 au plus)
  origines?: string[] // parcours (id) où l'exercice a été travaillé : choix des révisions d'une évaluation
  reussiLe?: string // dernier jour où il a été réussi (parcours ou révision)
  rattrapage?: boolean // manqué puis rétrogradé : réussi le lendemain, il garde sa boîte au lieu de monter
}

/** Parcours d'où viennent les exercices (dernière copie vue) : titre et chapitre */
export interface SourceRevision {
  titre: string
  niveau: string
  theme: string
}

/** Évaluation préparée par l'élève : parcours concernés, jour de l'évaluation */
export interface Evaluation {
  parcours: string[]
  date: string // AAAA-MM-JJ ; le lendemain, les révisions habituelles reprennent
  titre?: string // donné par l'enseignant
  annonce?: string // id de l'évaluation annoncée par l'enseignant (partage.ts) : elle suit ses changements
  modifiee?: boolean // l'élève a changé le jour ou les parcours : ses choix restent
}

/** Évaluation annoncée par l'enseignant à la classe de l'élève (EvaluationAnnoncee de partage.ts) */
export interface Annonce {
  id: string
  date: string
  parcours: string[]
  titre?: string
}

export interface Revisions {
  elements: Record<string, ElementRevision> // par exercice (cleExercice)
  traites: string[] // passages déjà pris en compte (parcours@début)
  chapitres?: string[] // avant la 0.7.3 : chapitres choisis (remplacé par sansChapitres, voir migrerChapitres)
  sansChapitres?: string[] // chapitres écartés par l'élève (cleChapitre) : un nouveau chapitre est toujours révisé
  sources?: Record<string, SourceRevision> // par parcours (id)
  evaluation?: Evaluation
  annonces?: string[] // évaluations annoncées déjà reprises ou arrêtées : jamais reproposées
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

/**
 * Parcours d'un exercice, avec leur chapitre. Un exercice d'avant les
 * origines, dont les passages ne sont plus là, garde le parcours et le
 * chapitre notés sur lui.
 */
export function sourcesDe(r: Revisions, e: ElementRevision): ({ id: string } & SourceRevision)[] {
  const connues = (e.origines ?? []).flatMap((id) => (r.sources?.[id] ? [{ id, ...r.sources[id] }] : []))
  return connues.length ? connues : [{ id: `~${cleChapitre(e)}|${e.parcours}`, titre: e.parcours, niveau: e.niveau, theme: e.theme }]
}
export const estRevision = (id: string | undefined) => id === ID_REVISIONS

/** Boîte d'entrée d'après la réussite au parcours */
const boiteDEntree = (pourcentage: number) => (pourcentage >= 80 ? 3 : pourcentage >= 50 ? 2 : 1)

function placer(e: ElementRevision, boite: number, aujourdhui: string): ElementRevision {
  const b = Math.min(5, Math.max(1, boite))
  return { ...e, boite: b, sommet: Math.max(b, e.sommet ?? e.boite), prochaine: plusJours(aujourdhui, INTERVALLES[b]) }
}

/**
 * Exercice révisé.
 * - Manqué : boîte précédente, et il revient dès le lendemain (pas après
 *   l'intervalle de sa nouvelle boîte : trois semaines sans revoir une erreur).
 * - Réussi le jour prévu ou après : boîte suivante ; s'il venait d'être
 *   manqué (rattrapage), il garde sa boîte et repart sur son intervalle.
 * - Réussi en avance (révisions d'une évaluation) : rien ne bouge, réviser
 *   beaucoup la veille ne rend pas un exercice « durable ».
 */
export function apresRevision(e: ElementRevision, reussi: boolean, aujourdhui: string): ElementRevision {
  const { rattrapage, ...sans } = e
  let suite: ElementRevision
  if (!reussi) suite = { ...placer(sans, e.boite - 1, aujourdhui), prochaine: plusJours(aujourdhui, 1), ...(e.boite > 1 || rattrapage ? { rattrapage: true } : {}) }
  else if (e.prochaine > aujourdhui) suite = e
  else suite = placer(sans, e.boite + (rattrapage ? 0 : 1), aujourdhui)
  return { ...suite, revu: aujourdhui, ...(reussi ? { reussiLe: aujourdhui } : {}), historique: [...e.historique, { le: aujourdhui, reussi }].slice(-10) }
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
  const sources = { ...r.sources }
  let change = false
  const termines = passages
    .filter((s) => s.fin && !estRevision(s.parcours) && !exclure(s.parcours))
    .sort((a, b) => a.fin!.localeCompare(b.fin!))
  for (const s of termines) {
    const le = jour(new Date(s.fin!))
    let rattache = false
    for (const e of bilan(s).parEtape) {
      // Chaque exercice une fois, quand il est complet (questions passées reprises plus tard)
      const fait = `${clePassage(s)}#${e.etape}`
      if (!e.sur || e.faites < e.sur) continue // sur papier ou pas terminé
      const etape = s.contenu.etapes[e.etape]
      if (!etape) continue
      const cle = cleExercice(etape)
      if (!traites.has(fait)) {
        const pourcentage = (100 * e.points) / e.sur
        const avant = elements[cle]
        const base = { etape, niveau: s.contenu.niveau, theme: s.contenu.theme, parcours: s.contenu.titre }
        const acquis = pourcentage >= 80 ? { reussiLe: le } : {}
        if (!avant) elements[cle] = { ...placer({ ...base, boite: 1, prochaine: le, historique: [] }, boiteDEntree(pourcentage), le), ...acquis }
        else if (avant.prochaine <= le || pourcentage < 50) elements[cle] = { ...apresRevision(avant, pourcentage >= 80, le), ...base, revu: avant.revu }
        else elements[cle] = { ...avant, ...base, ...acquis }
        traites.add(fait)
        change = true
      }
      // Parcours d'origine : aussi pour les passages comptés avant que les origines existent
      const x = elements[cle]
      if (x && !x.origines?.includes(s.parcours)) {
        elements[cle] = { ...x, origines: [...(x.origines ?? []), s.parcours] }
        change = true
      }
      if (x) rattache = true
    }
    const avant = sources[s.parcours]
    const { titre, niveau, theme } = s.contenu
    if (rattache && (!avant || avant.titre !== titre || avant.niveau !== niveau || avant.theme !== theme)) {
      sources[s.parcours] = { titre, niveau, theme }
      change = true
    }
  }
  return change ? { ...r, elements, traites: [...traites], sources } : r
}

/**
 * Données d'avant la 0.7.3 : la liste des chapitres choisis écartait sans le
 * dire tout chapitre commencé ensuite. On garde les chapitres écartés.
 */
export function migrerChapitres(r: Revisions): Revisions {
  if (!r.chapitres) return r
  const { chapitres: choisisAvant, ...reste } = r
  const sans = chapitres(r).map((c) => c.cle).filter((c) => !choisisAvant.includes(c))
  return sans.length ? { ...reste, sansChapitres: sans } : reste
}

/** Chapitres d'un exercice : ceux de ses parcours */
const chapitresDe = (r: Revisions, e: ElementRevision) => [...new Set(sourcesDe(r, e).map(cleChapitre))]

/** Exercices dans les chapitres gardés par l'élève */
export function choisis(r: Revisions) {
  const sans = new Set(r.sansChapitres ?? [])
  const garde = r.chapitres ? new Set(r.chapitres) : null
  return Object.entries(r.elements).filter(([, e]) => chapitresDe(r, e).some((c) => !sans.has(c) && (!garde || garde.has(c))))
}

/** Exercices à revoir aujourd'hui (chapitres choisis) */
export const aRevoir = (r: Revisions, aujourdhui = jour()) => choisis(r).filter(([, e]) => e.prochaine <= aujourdhui)

/** Prochain jour de révision quand rien n'est à revoir */
export function prochaineRevision(r: Revisions) {
  const jours = choisis(r).map(([, e]) => e.prochaine)
  return jours.length ? jours.reduce((a, b) => (a < b ? a : b)) : null
}

/** Chapitres où l'élève a des exercices, avec leur nombre et leur solidité (boîte la plus basse) */
export function chapitres(r: Revisions) {
  const parCle = new Map<string, { cle: string; niveau: string; theme: string; nb: number; boite: number }>()
  for (const e of Object.values(r.elements)) {
    const vus = new Set<string>()
    for (const s of sourcesDe(r, e)) {
      const cle = cleChapitre(s)
      if (vus.has(cle)) continue
      vus.add(cle)
      const c = parCle.get(cle) ?? { cle, niveau: s.niveau, theme: s.theme, nb: 0, boite: 5 }
      c.nb++
      c.boite = Math.min(c.boite, e.boite)
      parCle.set(cle, c)
    }
  }
  return [...parCle.values()].sort((a, b) => a.niveau.localeCompare(b.niveau, 'fr') || a.theme.localeCompare(b.theme, 'fr'))
}

// ---------- Préparer une évaluation ----------

/** Évaluation en préparation : jusqu'au jour de l'évaluation compris */
export const evaluationEnCours = (r: Revisions, aujourdhui = jour()) => (r.evaluation && r.evaluation.date >= aujourdhui ? r.evaluation : null)

/**
 * Évaluation annoncée à proposer : la plus proche à venir que l'élève n'a ni
 * reprise ni arrêtée, quand il n'en prépare pas déjà une.
 */
export function annonceAProposer(r: Revisions, annonces: Annonce[], aujourdhui = jour()): Annonce | null {
  if (evaluationEnCours(r, aujourdhui)) return null
  const vues = new Set(r.annonces ?? [])
  return annonces.filter((a) => a.date >= aujourdhui && a.parcours.length && !vues.has(a.id)).sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
}

const depuisAnnonce = (a: Annonce): Evaluation => ({ parcours: [...a.parcours], date: a.date, annonce: a.id, ...(a.titre ? { titre: a.titre } : {}) })

/** L'élève prépare l'évaluation annoncée : rien à choisir, le jour et les parcours sont ceux de l'enseignant */
export const preparerAnnonce = (r: Revisions, a: Annonce): Revisions => ({ ...r, evaluation: depuisAnnonce(a), annonces: [...new Set([...(r.annonces ?? []), a.id])] })

/**
 * L'évaluation en préparation suit son annonce : jour ou parcours changés
 * par l'enseignant, annonce retirée (la préparation s'arrête). Pas si
 * l'élève a modifié la sienne.
 */
export function suivreAnnonces(r: Revisions, annonces: Annonce[]): Revisions {
  const e = r.evaluation
  if (!e?.annonce || e.modifiee) return r
  const a = annonces.find((x) => x.id === e.annonce)
  if (!a) {
    const { evaluation: _retiree, ...reste } = r
    return reste
  }
  if (a.date === e.date && (a.titre ?? '') === (e.titre ?? '') && a.parcours.join('\n') === e.parcours.join('\n')) return r
  return { ...r, evaluation: depuisAnnonce(a) }
}

/** Exercices des parcours de l'évaluation */
export function dansEvaluation(r: Revisions, ev: Evaluation) {
  const voulus = new Set(ev.parcours)
  return Object.entries(r.elements).filter(([, e]) => sourcesDe(r, e).some((s) => voulus.has(s.id)))
}

/** Exercices de l'évaluation pas encore réussis aujourd'hui */
export const aReviserPourEvaluation = (r: Revisions, ev: Evaluation, aujourdhui = jour()) => dansEvaluation(r, ev).filter(([, e]) => e.reussiLe !== aujourdhui)

/**
 * Parcours que l'élève peut cocher pour une évaluation, par chapitre : ceux où
 * il a des exercices à réviser (`nb`) et, parmi ses parcours (`autres`), ceux
 * qu'il n'a pas commencés (`nb` = 0 : rien à réviser tant qu'ils ne sont pas faits).
 */
export function parcoursParChapitre(r: Revisions, autres: (SourceRevision & { id: string })[] = []) {
  const parId = new Map<string, { id: string; titre: string; niveau: string; theme: string; nb: number }>()
  for (const e of Object.values(r.elements))
    for (const s of sourcesDe(r, e)) {
      const p = parId.get(s.id) ?? { ...s, nb: 0 }
      p.nb++
      parId.set(s.id, p)
    }
  for (const p of autres) if (!parId.has(p.id)) parId.set(p.id, { id: p.id, titre: p.titre, niveau: p.niveau, theme: p.theme, nb: 0 })
  const groupes = new Map<string, { cle: string; niveau: string; theme: string; parcours: { id: string; titre: string; nb: number }[] }>()
  for (const p of parId.values()) {
    const cle = cleChapitre(p)
    const g = groupes.get(cle) ?? { cle, niveau: p.niveau, theme: p.theme, parcours: [] }
    g.parcours.push({ id: p.id, titre: p.titre, nb: p.nb })
    groupes.set(cle, g)
  }
  for (const g of groupes.values()) g.parcours.sort((a, b) => a.titre.localeCompare(b.titre, 'fr'))
  return [...groupes.values()].sort((a, b) => a.niveau.localeCompare(b.niveau, 'fr') || a.theme.localeCompare(b.theme, 'fr'))
}

/** Dernier jour où l'exercice a été vu (révision ou réussite) */
const dernier = (e: ElementRevision) => ((e.revu ?? '') > (e.reussiLe ?? '') ? e.revu! : (e.reussiLe ?? ''))

/** `nb` exercices pris à tour de rôle dans les groupes (chapitres ou parcours), chacun dans l'ordre donné */
function aTourDeRole(tries: [string, ElementRevision][], groupe: (e: ElementRevision) => string, nb: number) {
  const parGroupe = new Map<string, [string, ElementRevision][]>()
  for (const x of tries) parGroupe.set(groupe(x[1]), [...(parGroupe.get(groupe(x[1])) ?? []), x])
  const files = [...parGroupe.values()]
  const pris: [string, ElementRevision][] = []
  for (let i = 0; pris.length < nb && files.some((f) => f.length > i); i++) for (const f of files) if (f[i] && pris.length < nb) pris.push(f[i])
  return pris
}

/**
 * Séance de révision : `nb` exercices (une question chacun), les plus fragiles
 * d'abord (boîte la plus basse) puis les plus en retard, pris à tour de rôle
 * dans des chapitres différents (mélange). Le reste attend la séance suivante,
 * sans pénalité. Parcours généré sur l'appareil, sans titre d'exercice.
 * Évaluation en préparation : seulement ses parcours, sans attendre les dates
 * de révision ; d'abord ce qui n'a pas été réussi aujourd'hui, les plus
 * fragiles, puis ce qui n'a pas été vu depuis le plus longtemps.
 */
export function tirerRevision(r: Revisions, aujourdhui = jour(), nb = r.taille ?? TAILLE_PAR_DEFAUT): Parcours | null {
  const ev = evaluationEnCours(r, aujourdhui)
  let pris: [string, ElementRevision][]
  if (ev) {
    const voulus = new Set(ev.parcours)
    const fait = (e: ElementRevision) => (e.reussiLe === aujourdhui ? 1 : 0)
    const tries = dansEvaluation(r, ev).sort(([, a], [, b]) => fait(a) - fait(b) || a.boite - b.boite || dernier(a).localeCompare(dernier(b)))
    pris = aTourDeRole(tries, (e) => sourcesDe(r, e).find((s) => voulus.has(s.id))!.id, nb)
  } else {
    const dus = aRevoir(r, aujourdhui).sort(([, a], [, b]) => a.boite - b.boite || a.prochaine.localeCompare(b.prochaine))
    pris = aTourDeRole(dus, (e) => chapitresDe(r, e)[0], nb)
  }
  if (!pris.length) return null
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

/**
 * Barrettes d'une ceinture, comme au judo : une quand tous ses exercices ont
 * été réussis de nouveau après une semaine (boîte 4), deux après trois
 * semaines de plus (boîte 5, « durable »). D'après la boîte la plus haute
 * atteinte : une barrette gagnée n'est jamais retirée, comme la ceinture.
 * Exercices sur papier : hors révisions, ils ne comptent pas.
 */
export const BARRETTES = 2
export function barrettes(r: Revisions | null | undefined, etapes: Etape[]) {
  const sommets = etapes.flatMap((e) => {
    const x = r?.elements[cleExercice(e)]
    return x ? [x.sommet ?? x.boite] : []
  })
  return sommets.length ? Math.max(0, Math.min(...sommets) - (5 - BARRETTES)) : 0
}
/**
 * Révisions réussies d'un objectif, comptées comme les barrettes (0, 1 ou 2) :
 * d'après la boîte la plus haute atteinte par chacun de ses exercices, jamais
 * retirées. Null si l'objectif n'est pas en révision.
 */
export function revisionsObjectif(r: Revisions, libelle: string) {
  const sommets = Object.values(r.elements)
    .filter((e) => e.etape.objectifs?.includes(libelle))
    .map((e) => e.sommet ?? e.boite)
  return sommets.length ? Math.min(BARRETTES, Math.max(0, Math.min(...sommets) - (5 - BARRETTES))) : null
}
/** « 1 barrette sur 2 », « 2 barrettes sur 2 : ceinture durable » */
export const texteBarrettes = (n: number) => `${n} barrette${n > 1 ? 's' : ''} sur ${BARRETTES}${n >= BARRETTES ? ' : ceinture durable' : ''}`

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

/** Jour en mots simples : « aujourd’hui », « demain », « jeudi », « le 28 novembre » */
export function jourEnMots(j: string, aujourdhui = jour()) {
  const [a, m, d] = j.split('-').map(Number)
  const [a2, m2, d2] = aujourdhui.split('-').map(Number)
  const date = new Date(a, m - 1, d)
  const n = Math.round((date.getTime() - new Date(a2, m2 - 1, d2).getTime()) / 86400000)
  if (n === 0) return 'aujourd’hui'
  if (n === 1) return 'demain'
  if (n > 1 && n < 7) return date.toLocaleDateString('fr-FR', { weekday: 'long' })
  return `le ${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
}

/** Révisions bien formées (sauvegarde) */
export function estRevisions(v: unknown): v is Revisions {
  if (!v || typeof v !== 'object') return false
  const r = v as Revisions
  const jourValide = (j: unknown) => typeof j === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(j)
  const listeDeTextes = (l: unknown) => Array.isArray(l) && l.every((c) => typeof c === 'string')
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
        (e.sommet === undefined || (Number.isInteger(e.sommet) && e.sommet >= 1 && e.sommet <= 5)) &&
        jourValide(e.prochaine) &&
        (e.revu === undefined || jourValide(e.revu)) &&
        Array.isArray(e.historique) &&
        e.historique.every((h) => jourValide(h.le) && typeof h.reussi === 'boolean') &&
        (e.origines === undefined || listeDeTextes(e.origines)) &&
        (e.reussiLe === undefined || jourValide(e.reussiLe)) &&
        (e.rattrapage === undefined || typeof e.rattrapage === 'boolean'),
    ) &&
    Array.isArray(r.traites) &&
    r.traites.every((t) => typeof t === 'string') &&
    (r.chapitres === undefined || listeDeTextes(r.chapitres)) &&
    (r.sansChapitres === undefined || listeDeTextes(r.sansChapitres)) &&
    (r.sources === undefined ||
      (!!r.sources &&
        typeof r.sources === 'object' &&
        Object.values(r.sources).every((s) => !!s && typeof s.titre === 'string' && typeof s.niveau === 'string' && typeof s.theme === 'string'))) &&
    (r.evaluation === undefined ||
      (!!r.evaluation &&
        typeof r.evaluation === 'object' &&
        listeDeTextes(r.evaluation.parcours) &&
        jourValide(r.evaluation.date) &&
        (r.evaluation.titre === undefined || typeof r.evaluation.titre === 'string') &&
        (r.evaluation.annonce === undefined || typeof r.evaluation.annonce === 'string') &&
        (r.evaluation.modifiee === undefined || typeof r.evaluation.modifiee === 'boolean'))) &&
    (r.annonces === undefined || listeDeTextes(r.annonces)) &&
    (r.taille === undefined || TAILLES.includes(r.taille))
  )
}
