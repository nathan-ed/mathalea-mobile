// Séances et résultats d'un élève. Tout reste dans le stockage local.
import type { Parcours } from './catalogue'
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
}

/** Codes de session : 5 caractères faciles à dicter (sans 0/o ni 1/l/i) */
const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'
export function nouveauCode() {
  const octets = crypto.getRandomValues(new Uint8Array(5))
  return Array.from(octets, (o) => ALPHABET[o % ALPHABET.length]).join('')
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
  return {
    parcours: parcours.id,
    contenu: JSON.parse(JSON.stringify(parcours)),
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

export function bilan(s: Seance) {
  const premiers = premiersEssais(s)
  const questions = questionsDe(s)
  const parEtape = s.etapes.map((etape) => {
    const qs = questions.filter((q) => q.etape === etape)
    const faites = qs.filter((q) => premiers.has(cleQuestion(q.etape, q.question)))
    const points = faites.reduce((a, q) => a + valeur(premiers.get(cleQuestion(q.etape, q.question))), 0)
    return { etape, points, sur: qs.length, faites: faites.length }
  })
  const points = parEtape.reduce((a, e) => a + e.points, 0)
  const sur = parEtape.reduce((a, e) => a + e.sur, 0)
  const reussies = [...premiers.values()].filter((e) => valeur(e) === 1).length
  return {
    parEtape,
    points,
    sur,
    pourcentage: sur > 0 ? Math.round((100 * points) / sur) : 0,
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
 * parcours ne remet pas l'élève à zéro. Un exercice ajouté part de zéro.
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
