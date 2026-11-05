// Remédiation (docs/remediation.md) : après un exercice manqué, l'app dit à
// l'élève quoi retravailler et lui propose des exercices plus simples ou plus
// ciblés, puis l'exercice manqué avec de nouvelles valeurs. Tout se calcule
// sur l'appareil, à partir de la séance (copie figée du parcours) :
//   1. diagnostic : pour chaque question manquée, le premier point de réponse
//      manqué (résultat par case du moteur) et ses objectifs (`Etape.points`,
//      sinon ceux de l'exercice) ;
//   2. remédiation : celle de l'enseignant pour cet objectif
//      (`Parcours.remediations`), celle de l'exercice (`Etape.remediation`),
//      sinon des exercices du parcours ou du catalogue qui visent le même
//      objectif (remédiation automatique) ;
//   3. séance de remédiation : parcours généré, hors score et hors ceintures,
//      qui finit par l'exercice manqué. Encore manqué : objectif prérequis,
//      au plus PROFONDEUR_MAX fois, puis l'élève est invité à demander de l'aide.
// Positionnement (paliers) : une question par palier, dans l'ordre ; les
// paliers réussis d'affilée depuis le premier s'ouvrent sans être obtenus.
import { paliersDe, titreEleve, type Etape, type Fiche, type Parcours } from './catalogue'
import { acquisDe, cleExercice, objectifsDuPoint } from './objectifs'
import {
  PREFIXE_POSITIONNEMENT,
  PREFIXE_REMEDIATION,
  cleQuestion,
  estPositionnement,
  estRemediation,
  premiersEssais,
  questionsOrdonnees,
  surPapier,
  valeur,
  type Essai,
  type Seance,
} from './progression'

export { PREFIXE_POSITIONNEMENT, PREFIXE_REMEDIATION, estPositionnement, estRemediation }
/** Remédiations enchaînées au plus (objectif, puis ses prérequis) avant d'inviter à demander de l'aide */
export const PROFONDEUR_MAX = 3
/** Questions par exercice de remédiation pris ailleurs (parcours, catalogue) et pour l'exercice manqué repris */
export const QUESTIONS_REPRISE = 3
/** Propositions montrées au bilan */
export const PROPOSITIONS_MAX = 3

/** Clé d'un point de réponse : « 0 », « 1 »… ou « 0:champ1 », « 0:field2 »… (moteur) */
export const estClePoint = (cle: string) => /^\d+(:[\w-]+)?$/.test(cle)

/** Détail d'un résultat du moteur, gardé seulement pour une question à plusieurs points */
export function detailDeVerification(detail: { cle: string; score: number }[] | undefined): Record<string, number> | undefined {
  if (!detail || detail.length < 2) return undefined
  return Object.fromEntries(detail.map((d) => [d.cle, d.score]))
}

export interface Lacune {
  etape: number
  question: number
  point?: string // premier point manqué, si la question en a plusieurs
  objectifs: string[]
  parPoint: boolean // objectifs posés sur le point lui-même (diagnostic sûr)
}

/** Premier point manqué d'un essai, dans l'ordre de l'énoncé */
export function premierPointManque(essai: Essai) {
  if (!essai.detail) return undefined
  return Object.entries(essai.detail).find(([, score]) => score < 1)?.[0]
}

/**
 * Questions manquées (premier essai incomplet), dans l'ordre où l'élève les a
 * vues, avec le premier point manqué et ses objectifs. Questions passées et
 * questions sur papier : rien à diagnostiquer.
 */
export function lacunesDe(s: Seance): Lacune[] {
  const premiers = premiersEssais(s)
  const lacunes: Lacune[] = []
  for (const q of questionsOrdonnees(s)) {
    if (surPapier(s, q.etape, q.question)) continue
    const essai = premiers.get(cleQuestion(q.etape, q.question))
    if (!essai || valeur(essai) >= 1) continue
    const etape = s.contenu.etapes[q.etape]
    if (!etape) continue
    const point = premierPointManque(essai)
    lacunes.push({ ...q, point, ...objectifsDuPoint(etape, point) })
  }
  return lacunes
}

export type Origine = 'objectif' | 'exercice' | 'parcours' | 'catalogue'

export interface Proposition {
  etape: number // exercice manqué (rang dans le parcours de la séance)
  objectif?: string // absent : remédiation propre à l'exercice
  etapes: Etape[]
  fiche?: Fiche
  origine: Origine
}

/** Un exercice de remédiation pris ailleurs : quelques questions, objectifs gardés */
const reprise = (e: Etape): Etape => ({ ...e, nbQuestions: Math.min(e.nbQuestions ?? QUESTIONS_REPRISE, QUESTIONS_REPRISE), remediation: undefined, remiseAZero: undefined })

const vise = (e: Etape, objectif: string) => (e.objectifs ?? []).includes(objectif) || Object.values(e.points ?? {}).some((l) => l.includes(objectif))

/**
 * Exercices du parcours qui visent l'objectif, autres que l'exercice manqué :
 * ceux des paliers précédents d'abord (plus simples), puis ceux d'avant dans
 * le même palier, puis les suivants. Deux au plus.
 */
function dansLeParcours(p: Parcours, etape: number, objectif: string) {
  const paliers = paliersDe(p)
  const palier = paliers.findIndex((x) => x.etapes.includes(etape))
  const rangPalier = (i: number) => paliers.findIndex((x) => x.etapes.includes(i))
  const cle = cleExercice(p.etapes[etape])
  return p.etapes
    .map((e, i) => ({ e, i }))
    .filter(({ e, i }) => i !== etape && cleExercice(e) !== cle && vise(e, objectif))
    .sort((a, b) => {
      const avant = (i: number) => (rangPalier(i) < palier ? 0 : i < etape ? 1 : 2)
      return avant(a.i) - avant(b.i) || a.i - b.i
    })
    .slice(0, 2)
    .map(({ e }) => reprise(e))
}

/** Exercices d'autres parcours (catalogue de l'Explorer, classes) du même niveau qui visent l'objectif : deux au plus */
function dansLeCatalogue(p: Parcours, etape: number, objectif: string, autres: Parcours[]) {
  const deja = new Set([cleExercice(p.etapes[etape])])
  const trouves: Etape[] = []
  const candidats = autres.filter((a) => a.id !== p.id && a.niveau === p.niveau).sort((a, b) => a.difficulte - b.difficulte)
  for (const a of candidats)
    for (const e of a.etapes) {
      if (trouves.length >= 2) return trouves
      if (!vise(e, objectif) || deja.has(cleExercice(e))) continue
      deja.add(cleExercice(e))
      trouves.push(reprise(e))
    }
  return trouves
}

/**
 * Remédiation d'un exercice manqué pour un objectif : celle que l'enseignant a
 * prévue pour l'objectif, sinon des exercices qui le visent (parcours, puis
 * catalogue). Sans objectif : la remédiation propre à l'exercice.
 * `exerciceDabord` : diagnostic par l'exercice (pas par le point manqué),
 * la remédiation de l'exercice passe avant celle de l'objectif.
 */
export function remediationPour(p: Parcours, etape: number, objectif: string | undefined, autres: Parcours[] = [], exerciceDabord = false): Proposition | null {
  const e = p.etapes[etape]
  if (!e) return null
  const propre: Proposition | null = e.remediation?.length ? { etape, etapes: e.remediation.map((x) => ({ ...x, remediation: undefined })), origine: 'exercice' } : null
  if (objectif === undefined) return propre
  const r = p.remediations?.find((x) => x.objectif === objectif)
  const prevue: Proposition | null = r?.etapes.length ? { etape, objectif, etapes: r.etapes.map((x) => ({ ...x, remediation: undefined })), fiche: r.fiche, origine: 'objectif' } : null
  if (exerciceDabord && propre) return { ...propre, objectif }
  if (prevue) return prevue
  if (propre) return { ...propre, objectif }
  const parcours = dansLeParcours(p, etape, objectif)
  if (parcours.length) return { etape, objectif, etapes: parcours, fiche: r?.fiche, origine: 'parcours' }
  const catalogue = dansLeCatalogue(p, etape, objectif, autres)
  if (catalogue.length) return { etape, objectif, etapes: catalogue, fiche: r?.fiche, origine: 'catalogue' }
  return null
}

export interface Diagnostic {
  /** Remédiations à proposer, dans l'ordre des questions manquées (un objectif une fois) */
  propositions: Proposition[]
  /**
   * Exercice manqué qui vise plusieurs objectifs, sans résultat par point :
   * l'élève dit ce qui l'a bloqué (« Qu'est-ce qui t'a bloqué ? »).
   */
  aPreciser: { etape: number; objectifs: string[] }[]
}

/**
 * Ce qu'il faut retravailler après une séance : un objectif par question
 * manquée (son premier point manqué), et sa remédiation. Un exercice manqué
 * sans objectif propose sa propre remédiation, s'il en a une.
 */
export function diagnostiquer(s: Seance, autres: Parcours[] = []): Diagnostic {
  const p = s.contenu
  const propositions: Proposition[] = []
  const aPreciser: Diagnostic['aPreciser'] = []
  const vus = new Set<string>()
  for (const l of lacunesDe(s)) {
    if (!l.parPoint && l.objectifs.length > 1) {
      if (!aPreciser.some((x) => x.etape === l.etape) && !l.objectifs.every((o) => vus.has(o))) aPreciser.push({ etape: l.etape, objectifs: l.objectifs })
      continue
    }
    const objectif = l.objectifs[0]
    const cle = objectif ?? `#${l.etape}`
    if (vus.has(cle)) continue
    vus.add(cle)
    const r = remediationPour(p, l.etape, objectif, autres, !l.parPoint)
    if (r) propositions.push(r)
  }
  return { propositions: propositions.slice(0, PROPOSITIONS_MAX), aPreciser: aPreciser.filter((x) => !x.objectifs.every((o) => vus.has(o))) }
}

/** Libellé d'une proposition pour l'élève : l'objectif, sinon le titre de l'exercice manqué */
export const libelleProposition = (p: Parcours, x: Proposition) => x.objectif ?? titreEleve(p.etapes[x.etape], x.etape)

/**
 * Parcours de la séance de remédiation : les exercices proposés, puis
 * l'exercice manqué avec de nouvelles valeurs. Correction à chaque question,
 * une question par page. L'identifiant ne dépend que du parcours d'origine :
 * une remédiation commencée se reprend, une nouvelle la remplace.
 */
export function parcoursDeRemediation(p: Parcours, x: Proposition): Parcours {
  const manque = p.etapes[x.etape]
  return {
    // Remédiation qui en suit une autre : même identifiant
    id: estRemediation(p.id) ? p.id : `${PREFIXE_REMEDIATION}${p.id}`,
    version: p.version,
    titre: `Retravailler : ${libelleProposition(p, x)}`,
    objectif: x.objectif ?? '',
    niveau: p.niveau,
    theme: p.theme,
    difficulte: 1,
    icone: p.icone,
    presentation: 'une_question_par_page',
    correction: 'question',
    etapes: [...x.etapes, { ...reprise(manque), objectifs: manque.objectifs, points: manque.points }],
    ...(x.fiche ? { fiche: { ...x.fiche, avant: false } } : {}),
    remediations: p.remediations,
  }
}

/** Rang de l'exercice manqué repris à la fin de la séance de remédiation */
export const rangReprise = (s: Seance) => s.contenu.etapes.length - 1

/** Exercice manqué réussi à la reprise : toutes ses questions correctes */
export function repriseReussie(s: Seance) {
  const premiers = premiersEssais(s)
  const k = rangReprise(s)
  const n = s.nbQuestions[k] ?? 0
  return n > 0 && Array.from({ length: n }, (_, q) => valeur(premiers.get(cleQuestion(k, q)))).every((v) => v >= 1)
}

/**
 * Suite d'une séance de remédiation manquée : un objectif prérequis de celui
 * retravaillé (prévu par l'enseignant) ou un objectif d'une question manquée
 * de la séance, avec sa remédiation, tant que la profondeur le permet.
 */
export function suiteDeRemediation(s: Seance, autres: Parcours[] = []): Proposition | null {
  const o = s.remediation
  if (!o || repriseReussie(s) || o.profondeur >= PROFONDEUR_MAX) return null
  const p = s.contenu
  const k = rangReprise(s)
  const prerequis = p.remediations?.find((r) => r.objectif === o.objectif)?.prerequis ?? []
  for (const objectif of prerequis) {
    const r = p.remediations?.find((x) => x.objectif === objectif)
    if (r?.etapes.length) return { etape: k, objectif, etapes: r.etapes.map((e) => ({ ...e, remediation: undefined })), fiche: r.fiche, origine: 'objectif' }
  }
  // Question manquée dans un exercice de remédiation : son objectif, s'il diffère
  for (const l of lacunesDe(s)) {
    const objectif = l.objectifs.find((x) => x !== o.objectif)
    if (l.etape === k || !objectif) continue
    const r = remediationPour(p, l.etape, objectif, autres)
    if (r && r.etapes.length) return { ...r, etape: k }
  }
  return null
}

/** Ouverture des paliers : ceinture obtenue, ou palier ouvert par le test de positionnement */
export function ouverturesDe(p: Parcours, passages: Seance[], x: Positionnement | undefined) {
  const test = ouvertsParPositionnement(p, x)
  return acquisDe(p, passages).map((obtenue, k) => obtenue || test[k])
}

// ---------- Positionnement (paliers) ----------

export interface Positionnement {
  version: number // version du parcours positionné
  rang: number // paliers ouverts par le test (les `rang` premiers)
  le: string
}

/** Test de positionnement : la première question du premier exercice de chaque palier, dans l'ordre, correction à la fin */
export function parcoursDePositionnement(p: Parcours): Parcours | null {
  const paliers = paliersDe(p)
  if (paliers.length < 2) return null
  const etapes = paliers.map((x) => p.etapes[x.etapes[0]]).filter(Boolean)
  if (etapes.length !== paliers.length) return null
  return {
    id: `${PREFIXE_POSITIONNEMENT}${p.id}`,
    version: p.version,
    titre: p.titre,
    objectif: p.objectif,
    niveau: p.niveau,
    theme: p.theme,
    difficulte: p.difficulte,
    icone: p.icone,
    presentation: 'une_question_par_page',
    correction: 'parcours',
    // Sans titre : le nom d'un exercice donnerait la méthode
    etapes: etapes.map((e) => ({ ...e, nbQuestions: 1, titreMasque: true, remediation: undefined })),
    enTetesMasques: true,
  }
}

/**
 * Paliers ouverts par le test : ceux réussis d'affilée depuis le premier. Le
 * dernier palier n'est jamais compté (il n'ouvre rien) ; une question passée
 * arrête le compte.
 */
export function rangDePositionnement(s: Seance) {
  const premiers = premiersEssais(s)
  let rang = 0
  for (let k = 0; k < s.contenu.etapes.length - 1; k++) {
    if (valeur(premiers.get(cleQuestion(k, 0))) < 1) break
    rang++
  }
  return rang
}

/** Paliers ouverts par un positionnement (pour `etatsPaliers`) : vrai pour les `rang` premiers, s'il vaut pour cette version */
export function ouvertsParPositionnement(p: Parcours, x: Positionnement | undefined) {
  const n = paliersDe(p).length
  return Array.from({ length: n }, (_, k) => !!x && x.version === p.version && k < x.rang)
}
