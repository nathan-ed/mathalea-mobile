// Séances et résultats d'un élève. Tout reste dans le stockage local.
import { melange, type Parcours } from './catalogue'
import type { Stockage } from './stockage'

export interface Essai {
  etape: number
  question: number
  juste: boolean
  points: number
  total: number
  reponses: Record<string, string>
  le: string
}

export interface Seance {
  parcours: string
  contenu: Parcours // version figée du parcours : rejouer une séance ne dépend pas des modifications
  type: 'complet' | 'ciblee'
  etapes: number[] // étapes du parcours travaillées dans cette séance
  moteur: string // version du moteur qui a tiré les graines
  graines: Record<number, string>
  nbQuestions: Record<number, number>
  position: number // rang de la question affichée
  brouillons: Record<string, Record<string, string>> // clé « étape-question »
  essais: Essai[]
  debut: string
  fin?: string
  soumise?: boolean // validation à la fin du parcours : tentative soumise
  code?: string // session partagée : même code, mêmes exercices
  ordre?: string[] // questions mélangées (clés « étape-question »), tirées une fois
  // Questions sans réponse à saisir (exercice non interactif), à faire sur
  // papier : hors du score ; vrai quand l'élève a ouvert la correction
  papier?: Record<string, boolean>
  // Empreinte des énoncés vus, par étape (releve.ts) : en session partagée,
  // l'enseignant vérifie qu'il revérifie bien les mêmes questions
  empreintes?: Record<number, string>
  // Session « QR code avant la correction » : QR code montré, résultats visibles
  qrMontre?: boolean
}

/** Codes de session : 5 caractères faciles à dicter (sans 0/o ni 1/l/i) */
const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'

/**
 * QR code des réponses pour l'enseignant, choisi à la création de la session
 * et porté par le code lui-même : une empreinte du code entier désigne le
 * réglage, rien d'autre à transmettre aux élèves. Changer une lettre donne un
 * réglage imprévisible (et d'autres questions : les graines viennent du code).
 * - quand : aucun (pas de QR code), apres (correction comme prévu, puis
 *   « Montrer mes réponses » au bilan), avant (correction à la fin, QR code
 *   avant les résultats) ;
 * - prenom : l'élève ajoute son prénom au QR code.
 */
export type ModeQr = 'aucun' | 'apres' | 'avant'
export interface ReglageQr {
  quand: ModeQr
  prenom: boolean
}
const REGLAGES_QR: ReglageQr[] = [
  { quand: 'aucun', prenom: false },
  { quand: 'apres', prenom: false },
  { quand: 'avant', prenom: false },
  { quand: 'apres', prenom: true },
  { quand: 'avant', prenom: true },
]

/** Empreinte d'un code (FNV-1a, 32 bits) */
function empreinteCode(code: string) {
  let h = 0x811c9dc5
  for (const c of `session-qr|${code}`) {
    h ^= c.charCodeAt(0)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Réglage du QR code d'une session, lu dans son code (code tapé hors de ce format : aucun) */
export function reglageQr(code: string | undefined): ReglageQr {
  const c = normaliserCode(code ?? '')
  if (c.length !== 5 || ![...c].every((l) => ALPHABET.includes(l))) return REGLAGES_QR[0]
  return REGLAGES_QR[empreinteCode(c) % REGLAGES_QR.length]
}
export const modeQr = (code: string | undefined): ModeQr => reglageQr(code).quand

/** Nouveau code de session, tiré jusqu'à tomber sur le réglage voulu (un essai sur cinq en moyenne) */
export function nouveauCode(mode: ModeQr = 'aucun', prenom = false) {
  const voulu = mode !== 'aucun' && prenom
  for (;;) {
    const octets = crypto.getRandomValues(new Uint8Array(5))
    const code = Array.from(octets, (o) => ALPHABET[o % ALPHABET.length]).join('')
    const r = reglageQr(code)
    if (r.quand === mode && r.prenom === voulu) return code
  }
}
export const normaliserCode = (code: string) => code.trim().toLowerCase().replace(/\s+/g, '')

/** Graine d'une étape dans une session partagée : identique pour tous les participants */
export const graineDeSession = (code: string, p: Parcours, etape: number) => `${normaliserCode(code)}-${p.id}-v${p.version}-${etape}`

export interface ResultatEtape {
  points: number // somme des scores de questions (chacune entre 0 et 1)
  sur: number // nombre de questions
  complet: boolean
  le: string
  version?: number // version du parcours travaillée (un résultat repris garde la sienne)
}

export const cleQuestion = (etape: number, question: number) => `${etape}-${question}`

export function nouvelleSeance(
  parcours: Parcours,
  moteur: string,
  type: Seance['type'] = 'complet',
  etapes = parcours.etapes.map((_, i) => i),
  code?: string,
): Seance {
  const graines: Record<number, string> = {}
  if (code) for (const e of etapes) graines[e] = graineDeSession(code, parcours, e)
  const contenu: Parcours = JSON.parse(JSON.stringify(parcours))
  // QR code avant la correction : aucune correction pendant la session, tout à la fin
  if (code && modeQr(code) === 'avant') contenu.correction = 'parcours'
  return {
    parcours: parcours.id,
    contenu,
    type,
    etapes,
    moteur,
    graines,
    code: code ? normaliserCode(code) : undefined,
    nbQuestions: {},
    position: 0,
    brouillons: {},
    essais: [],
    debut: new Date().toISOString(),
  }
}

/** Liste ordonnée des questions de la séance */
export function questionsDe(s: Seance) {
  return s.etapes.flatMap((etape) =>
    Array.from({ length: s.nbQuestions[etape] ?? 0 }, (_, question) => ({ etape, question })),
  )
}

/** Nombre pseudo-aléatoire entre 0 et 1 tiré d'une graine (mulberry32) */
function generateur(graine: string) {
  let h = 1779033703
  for (let i = 0; i < graine.length; i++) h = Math.imul(h ^ graine.charCodeAt(i), 3432918353)
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Copie mélangée (Fisher-Yates) : même graine, même ordre */
export function melanger<T>(liste: T[], graine: string): T[] {
  const alea = generateur(graine)
  const t = [...liste]
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1))
    ;[t[i], t[j]] = [t[j], t[i]]
  }
  return t
}

/**
 * Tire l'ordre des questions une fois qu'elles sont toutes préparées. En
 * session partagée, l'ordre vient du code : toute la classe a le même. Un
 * ordre déjà tiré qui correspond toujours aux questions est gardé.
 */
export function fixerOrdre(s: Seance) {
  if (!melange(s.contenu)) {
    s.ordre = undefined
    return
  }
  const cles = questionsDe(s).map((q) => cleQuestion(q.etape, q.question))
  const valide = s.ordre && s.ordre.length === cles.length && cles.every((c) => s.ordre!.includes(c))
  if (valide) return
  const graine = s.code ? `${s.code}-${s.contenu.id}-v${s.contenu.version}-ordre` : `${Math.random()}`
  s.ordre = s.contenu.id === ID_REVISIONS ? entrelacer(cles, graine) : melanger(cles, graine)
}

/** Séance de révision espacée (revisions.ts) : parcours généré sur l'appareil */
export const ID_REVISIONS = 'revisions'

/**
 * Pratique mélangée : exercices dans un ordre tiré, puis une question de
 * chacun à tour de rôle ; deux questions d'un même exercice ne se suivent
 * que s'il ne reste que lui.
 */
export function entrelacer(cles: string[], graine: string) {
  const parExercice = new Map<string, string[]>()
  for (const c of melanger(cles, graine)) {
    const e = c.split('-')[0]
    parExercice.set(e, [...(parExercice.get(e) ?? []), c])
  }
  const files = [...parExercice.values()]
  const ordre: string[] = []
  for (let i = 0; ordre.length < cles.length; i++) for (const f of files) if (f[i]) ordre.push(f[i])
  return ordre
}

/** Questions dans l'ordre d'affichage : mélangé si la séance a un ordre tiré */
export function questionsOrdonnees(s: Seance) {
  const questions = questionsDe(s)
  if (!s.ordre || s.ordre.length !== questions.length) return questions
  const rang = new Map(s.ordre.map((c, i) => [c, i]))
  if (questions.some((q) => !rang.has(cleQuestion(q.etape, q.question)))) return questions
  return [...questions].sort((a, b) => rang.get(cleQuestion(a.etape, a.question))! - rang.get(cleQuestion(b.etape, b.question))!)
}

/** Première vérification de chaque question : c'est elle qui compte */
export function premiersEssais(s: Seance) {
  const premiers = new Map<string, Essai>()
  for (const e of s.essais) {
    const cle = cleQuestion(e.etape, e.question)
    if (!premiers.has(cle)) premiers.set(cle, e)
  }
  return premiers
}

/** Score d'une question entre 0 et 1 */
export const valeur = (e: Essai | undefined) => (e && e.total > 0 ? e.points / e.total : e?.juste ? 1 : 0)

/** Question à faire sur papier : ni réponse ni score */
export const surPapier = (s: Seance, etape: number, question: number) => s.papier?.[cleQuestion(etape, question)] !== undefined

export function bilan(s: Seance) {
  const premiers = premiersEssais(s)
  const toutes = questionsDe(s)
  const questions = toutes.filter((q) => !surPapier(s, q.etape, q.question))
  const parEtape = s.etapes.map((etape) => {
    const qs = questions.filter((q) => q.etape === etape)
    const faites = qs.filter((q) => premiers.has(cleQuestion(q.etape, q.question)))
    const points = faites.reduce((a, q) => a + valeur(premiers.get(cleQuestion(q.etape, q.question))), 0)
    const papier = toutes.filter((q) => q.etape === etape && surPapier(s, q.etape, q.question))
    const vues = papier.filter((q) => s.papier![cleQuestion(q.etape, q.question)]).length
    return { etape, points, sur: qs.length, faites: faites.length, papier: papier.length, vues }
  })
  const points = parEtape.reduce((a, e) => a + e.points, 0)
  const sur = parEtape.reduce((a, e) => a + e.sur, 0)
  const reussies = [...premiers.values()].filter((e) => valeur(e) === 1).length
  return {
    parEtape,
    points,
    sur,
    // Rien à réussir (tout sur papier) : rien de manqué
    pourcentage: sur > 0 ? Math.round((100 * points) / sur) : 100,
    reussies,
    faites: premiers.size,
    passees: questions.filter((q) => !premiers.has(cleQuestion(q.etape, q.question))),
  }
}

/** Étapes dont le dernier essai terminé est incomplet ou inférieur à 100 %, dans l'ordre */
export function etapesAAmeliorer(parcours: Parcours, resultats: Record<number, ResultatEtape>) {
  return parcours.etapes
    .map((_, i) => i)
    .filter((i) => resultats[i] && (!resultats[i].complet || resultats[i].points < resultats[i].sur))
}

const cleSeance = (p: string) => `seance:${p}`
const cleHistorique = (p: string) => `historique:${p}`

/** Passages terminés d'un parcours, du plus ancien au plus récent */
export async function lireHistorique(st: Stockage, parcours: string) {
  return ((await st.lire<Seance[]>(cleHistorique(parcours))) ?? []).filter((s) => s && s.contenu)
}
// Résultats par version : une étape modifiée ne reprend pas les résultats de l'ancienne
const cleResultats = (p: Parcours) => `resultats:${p.id}@${p.version}`

export async function lireSeance(st: Stockage, parcours: string) {
  const s = await st.lire<Seance>(cleSeance(parcours))
  // Séance d'une version antérieure, sans copie du parcours : ignorée
  return s && s.contenu ? s : null
}

export async function ecrireSeance(st: Stockage, s: Seance) {
  await st.ecrire(cleSeance(s.parcours), s)
}

/** Supprime la tentative en cours ; les passages terminés et les résultats restent */
export async function supprimerSeance(st: Stockage, parcours: string) {
  await st.effacer(cleSeance(parcours))
}

/**
 * Résultats d'une version. Une version sans résultats reprend ceux de la
 * précédente pour chaque exercice resté dans le parcours (même exercice
 * MathALÉA, même s'il a été déplacé ou ses réglages corrigés) : corriger un
 * parcours ne remet pas l'élève à zéro. Un exercice ajouté, ou marqué
 * `remiseAZero` par l'enseignant, part de zéro.
 */
export async function lireResultats(st: Stockage, parcours: Parcours): Promise<Record<number, ResultatEtape>> {
  const propres = await st.lire<Record<number, ResultatEtape>>(cleResultats(parcours))
  if (propres) return propres
  // Version précédente connue par les passages terminés (copie figée du parcours)
  const precedente = (await lireHistorique(st, parcours.id))
    .map((h) => h.contenu)
    .filter((c) => c.version < parcours.version)
    .sort((a, b) => b.version - a.version)[0]
  if (!precedente) return {}
  return reprendreResultats(precedente, await lireResultats(st, precedente), parcours)
}

/** Résultats d'une version transposés sur une autre, exercice par exercice */
export function reprendreResultats(avant: Parcours, resultats: Record<number, ResultatEtape>, apres: Parcours) {
  const repris: Record<number, ResultatEtape> = {}
  const pris = new Set<number>()
  apres.etapes.forEach((e, i) => {
    // L'enseignant a demandé de repartir de zéro pour cet exercice dans cette version
    if (e.remiseAZero === apres.version) return
    // Même rang d'abord, sinon le premier exercice identique pas encore repris
    const candidats = avant.etapes.map((a, j) => j).filter((j) => avant.etapes[j].uuid === e.uuid && !pris.has(j) && resultats[j])
    const j = candidats.includes(i) ? i : candidats[0]
    if (j === undefined) return
    pris.add(j)
    // Version d'origine conservée : `sur` reste le nombre de questions de cette version
    repris[i] = { version: avant.version, ...resultats[j] }
  })
  return repris
}

/** Clôt la séance et met à jour le dernier résultat de chaque étape travaillée */
export async function terminerSeance(st: Stockage, s: Seance) {
  s.fin = new Date().toISOString()
  const resultats = await lireResultats(st, s.contenu)
  for (const e of bilan(s).parEtape) {
    resultats[e.etape] = { points: e.points, sur: e.sur, complet: e.faites === e.sur, le: s.fin, version: s.contenu.version }
  }
  await st.ecrire(cleResultats(s.contenu), resultats)
  await ecrireSeance(st, s)
  // Un passage repris (questions passées) remplace sa version précédente
  const historique = (await lireHistorique(st, s.parcours)).filter((h) => h.debut !== s.debut)
  await st.ecrire(cleHistorique(s.parcours), [...historique, s])
  return resultats
}
