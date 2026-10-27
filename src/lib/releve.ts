// Réponses d'une session partagée, relevées par l'enseignant en classe (QR
// code ou fichier). Rien d'identifiant : ni nom, ni appareil. L'enseignant ne
// croit pas les scores : son app regénère les questions de la session et
// revérifie chaque réponse (voir ReponsesClasse.svelte).
import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate'
import { cleQuestion, melanger, modeQr, premiersEssais, reglageQr, surPapier, type Seance } from './progression'

/** Début du texte d'un QR code de réponses (version du format) */
export const PREFIXE_REPONSES = 'MAREP1.'

/** Exercice d'une étape, de quoi le regénérer sans le parcours */
export interface ExerciceReleve {
  u: string // uuid MathALÉA
  n?: number // nombre de questions
  s?: string
  s2?: string
  s3?: string
  s4?: string
}

/** Réponses d'un élève à une session partagée, telles que transportées par le QR code */
export interface ReponsesSession {
  c: string // code de session
  p: string // identifiant du parcours
  v: number // version du parcours
  t: string // titre du parcours
  m?: string // version du moteur (anciens QR codes) : l'empreinte des énoncés suffit
  d: string // identifiant du passage (tiré de son début) : compté une seule fois
  x: Record<number, ExerciceReleve> // exercices des étapes travaillées
  o?: 1 // questions mélangées (ordre tiré du code)
  e?: Record<number, string> // empreinte des énoncés vus, par étape
  r: Record<string, Record<string, string>> // première réponse vérifiée, par question (« étape-question »)
  n?: string // prénom, seulement si le code de session le demande
}

/** Empreinte courte (FNV-1a, base 36) */
export function empreinte(texte: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

/**
 * Empreinte des énoncés d'un exercice préparé : leur texte seul (sans balises
 * ni attributs, qui peuvent porter des identifiants tirés au hasard). Même
 * empreinte chez l'élève et chez l'enseignant : mêmes questions.
 */
export function empreinteEnonces(questions: { contexte: string; enonce: string }[]) {
  const texte = questions
    .map((q) => `${q.contexte}\n${q.enonce}`)
    .join('\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return empreinte(texte)
}

/** Réponses d'une séance de session partagée, ou null (pas de session, rien de vérifié) */
export function reponsesDeSeance(s: Seance, prenom?: string): ReponsesSession | null {
  // Seulement si l'enseignant l'a demandé en créant la session (voir modeQr)
  if (!s.code || modeQr(s.code) === 'aucun') return null
  const premiers = premiersEssais(s)
  const r: ReponsesSession['r'] = {}
  for (const [cle, e] of premiers) if (!surPapier(s, e.etape, e.question)) r[cle] = e.reponses
  if (!Object.keys(r).length) return null
  const x: ReponsesSession['x'] = {}
  for (const etape of s.etapes) {
    const e = s.contenu.etapes[etape]
    x[etape] = {
      u: e.uuid,
      ...(s.nbQuestions[etape] ? { n: s.nbQuestions[etape] } : e.nbQuestions ? { n: e.nbQuestions } : {}),
      ...(e.sup !== undefined ? { s: e.sup } : {}),
      ...(e.sup2 !== undefined ? { s2: e.sup2 } : {}),
      ...(e.sup3 !== undefined ? { s3: e.sup3 } : {}),
      ...(e.sup4 !== undefined ? { s4: e.sup4 } : {}),
    }
  }
  return {
    c: s.code,
    p: s.contenu.id,
    v: s.contenu.version,
    t: s.contenu.titre,
    d: empreinte(`${s.debut}|${s.code}`),
    x,
    ...(s.ordre ? { o: 1 as const } : {}),
    ...(s.empreintes && Object.keys(s.empreintes).length ? { e: s.empreintes } : {}),
    r,
    ...(reglageQr(s.code).prenom && prenom?.trim() ? { n: prenom.trim().slice(0, 40) } : {}),
  }
}

export const versBase64 = (o: Uint8Array) => btoa(Array.from(o, (c) => String.fromCharCode(c)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
export const depuisBase64 = (t: string) => {
  const b = atob(t.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(b, (c) => c.charCodeAt(0))
}

/** Texte du QR code : préfixe, puis JSON compressé en base64 (sûr dans une adresse) */
export function encoderReponses(r: ReponsesSession) {
  return PREFIXE_REPONSES + versBase64(deflateSync(strToU8(JSON.stringify(r)), { level: 9 }))
}

const estChaine = (v: unknown): v is string => typeof v === 'string'
const estObjet = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

/** Réponses d'un élève bien formées (QR code, fichier, sauvegarde) */
export function estReponsesSession(o: unknown): o is ReponsesSession {
  if (!estObjet(o) || !estChaine(o.c) || !estChaine(o.p) || typeof o.v !== 'number' || !estChaine(o.d) || !estObjet(o.x) || !estObjet(o.r)) return false
  if (o.t !== undefined && !estChaine(o.t)) return false
  for (const e of Object.values(o.x)) if (!estObjet(e) || !estChaine(e.u)) return false
  for (const q of Object.values(o.r)) if (!estObjet(q) || !Object.values(q).every(estChaine)) return false
  if (o.e !== undefined && (!estObjet(o.e) || !Object.values(o.e).every(estChaine))) return false
  if (o.n !== undefined && (!estChaine(o.n) || o.n.length > 60)) return false
  return true
}

/** Lit un QR code ou un fichier de réponses ; null si ce n'en est pas un */
export function decoderReponses(texte: string): ReponsesSession | null {
  const t = texte.trim()
  if (!t.startsWith(PREFIXE_REPONSES)) return null
  try {
    const o = JSON.parse(strFromU8(inflateSync(depuisBase64(t.slice(PREFIXE_REPONSES.length)))))
    return estReponsesSession(o) ? { ...o, t: o.t ?? '' } : null
  } catch {
    return null
  }
}

/** Relevés gardés par l'enseignant bien formés (sauvegarde) */
export function estReleves(v: unknown): v is Releve[] {
  if (!Array.isArray(v)) return false
  return v.every(
    (r) =>
      estObjet(r) &&
      estChaine(r.cle) &&
      estChaine(r.code) &&
      estChaine(r.parcours) &&
      typeof r.version === 'number' &&
      estChaine(r.titre) &&
      estChaine(r.le) &&
      Array.isArray(r.recues) &&
      r.recues.every(estReponsesSession) &&
      (r.calcul === undefined ||
        (estObjet(r.calcul) &&
          estChaine(r.calcul.moteur) &&
          estObjet(r.calcul.verdicts) &&
          Object.values(r.calcul.verdicts).every(
            (q) => estObjet(q) && Object.values(q).every((v) => estObjet(v) && typeof v.juste === 'boolean' && typeof v.score === 'number'),
          ) &&
          estObjet(r.calcul.hors) &&
          Object.values(r.calcul.hors).every((l) => Array.isArray(l) && l.every((e) => typeof e === 'number')))) &&
      (r.creee === undefined || r.creee === true) &&
      (r.classe === undefined || (estChaine(r.classe) && r.classe.length <= 100)) &&
      (r.invitation === undefined || estChaine(r.invitation)),
  )
}

/** Une session relevée : toutes les réponses reçues pour un même code, parcours et version */
export interface Releve {
  cle: string
  code: string
  parcours: string
  version: number
  titre: string
  le: string // dernier ajout
  recues: ReponsesSession[]
  // Verdicts recalculés par l'app de l'enseignant (gardés pour ne pas tout
  // revérifier à chaque ouverture ; refaits si le moteur change)
  calcul?: {
    moteur: string
    verdicts: Record<string, Record<string, VerdictQuestion>> // passage → question → verdict
    hors: Record<string, number[]> // passage → étapes aux questions différentes (autre version du moteur)
  }
  creee?: true // session créée sur cet appareil (gardée même sans réponse)
  invitation?: string // son QR code pour les élèves (invitation.ts), à réafficher
  classe?: string // classe choisie au lancement (sessions rangées par classe)
}

export const cleReleve = (r: Pick<ReponsesSession, 'c' | 'p' | 'v'>) => `${r.c}|${r.p}|${r.v}`

/**
 * Session créée par l'enseignant : gardée dans la liste, même sans réponse,
 * pour la lancer et la relever plus tard. `precedent` : code noté juste avant
 * par le même panneau (réglage changé), retiré s'il n'a rien reçu. Un même
 * code noté de nouveau (autre palier) met son QR code à jour.
 */
export function noterSession(
  releves: Releve[],
  s: { code: string; parcours: string; version: number; titre: string; invitation?: string; classe?: string },
  precedent: string | null,
  le = new Date().toISOString(),
): Releve[] {
  const cle = (code: string) => cleReleve({ c: code, p: s.parcours, v: s.version })
  const ici = cle(s.code)
  let liste = precedent && precedent !== s.code ? releves.filter((r) => !(r.cle === cle(precedent) && r.creee && !r.recues.length)) : releves
  const existant = liste.find((r) => r.cle === ici)
  if (!existant) {
    const r: Releve = { cle: ici, code: s.code, parcours: s.parcours, version: s.version, titre: s.titre, le, recues: [], creee: true, ...(s.classe ? { classe: s.classe } : {}) }
    liste = [s.invitation ? { ...r, invitation: s.invitation } : r, ...liste]
  } else if (s.invitation && existant.invitation !== s.invitation) {
    liste = liste.map((r) => (r.cle === ici ? { ...r, invitation: s.invitation } : r))
  }
  return liste
}

/** Ajoute des réponses ; un même passage n'est compté qu'une fois (le plus complet gardé) */
export function ajouterReponses(releves: Releve[], r: ReponsesSession, le = new Date().toISOString()): { releves: Releve[]; nouveau: boolean } {
  const cle = cleReleve(r)
  const existant = releves.find((x) => x.cle === cle)
  if (!existant) {
    return { releves: [{ cle, code: r.c, parcours: r.p, version: r.v, titre: r.t, le, recues: [r] }, ...releves], nouveau: true }
  }
  const deja = existant.recues.find((x) => x.d === r.d)
  if (deja && Object.keys(deja.r).length >= Object.keys(r.r).length) return { releves, nouveau: false }
  const recues = [...existant.recues.filter((x) => x.d !== r.d), r]
  return { releves: releves.map((x) => (x.cle === cle ? { ...x, le, recues } : x)), nouveau: !deja }
}

/**
 * Questions de la session dans l'ordre vu par les élèves : par étape, ou
 * mélangées par le code, comme dans la séance (progression.ts, fixerOrdre).
 */
export function ordreDesQuestions(r: Pick<ReponsesSession, 'c' | 'p' | 'v' | 'o'>, nbQuestions: Record<number, number>, etapes: number[]) {
  const cles = etapes.flatMap((e) => Array.from({ length: nbQuestions[e] ?? 0 }, (_, q) => cleQuestion(e, q)))
  return r.o ? melanger(cles, `${r.c}-${r.p}-v${r.v}-ordre`) : cles
}

/**
 * Réponse lisible d'une question : ses champs dans l'ordre, séparés par « ; ».
 * Réponse en plusieurs étapes de calcul : la réponse finale seule (les étapes,
 * rangées à part par MathALÉA, restent pour la revérification).
 */
export function texteReponse(champs: Record<string, string>) {
  return Object.keys(champs)
    .filter((k) => !k.startsWith('possible-multi-lines-answer'))
    .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))
    .map((k) => champs[k].trim())
    .filter(Boolean)
    .join(' ; ')
}

/** Même réponse écrite autrement (espaces, virgule ou point décimal) : regroupées */
export const normaliserReponse = (t: string) => t.replace(/\s+/g, '').replace(/\{,\}/g, ',').replace(/\./g, ',')

export interface VerdictQuestion {
  juste: boolean
  score: number // entre 0 et 1
}

export interface Erreur {
  reponse: string
  nb: number
}

/** Une même réponse donnée par plusieurs élèves */
export interface GroupeReponses {
  reponse: string
  nb: number
  juste: boolean
  passages: string[] // qui l'a donnée (identifiants de passage, voir elevesDe)
}

export interface BilanQuestion {
  cle: string
  rang: number // numéro vu par les élèves (1, 2, 3…)
  repondu: number
  reussi: number // somme des scores
  erreurs: Erreur[] // mauvaises réponses regroupées, les plus fréquentes d'abord
  reponses: GroupeReponses[] // toutes les réponses : justes d'abord, puis les plus fréquentes
  horsVersion: number // réponses à des questions différentes (autre version du moteur)
}

/** Réussite et mauvaises réponses de chaque question, d'après les verdicts recalculés */
export function bilanDesQuestions(
  ordre: string[],
  recues: ReponsesSession[],
  verdicts: Record<string, Record<string, VerdictQuestion>>, // passage → question → verdict
  horsVersion: (r: ReponsesSession, cle: string) => boolean,
): BilanQuestion[] {
  return ordre.map((cle, i) => {
    let repondu = 0
    let reussi = 0
    let hors = 0
    const groupes = new Map<string, GroupeReponses>()
    for (const r of recues) {
      const champs = r.r[cle]
      if (!champs) continue
      if (horsVersion(r, cle)) {
        hors++
        continue
      }
      const v = verdicts[r.d]?.[cle]
      if (!v) continue
      repondu++
      reussi += v.score
      const texte = texteReponse(champs) || '(vide)'
      const n = `${v.juste ? 'j' : 'f'}|${normaliserReponse(texte)}`
      const g = groupes.get(n)
      if (g) {
        g.nb++
        g.passages.push(r.d)
      } else groupes.set(n, { reponse: texte, nb: 1, juste: v.juste, passages: [r.d] })
    }
    const reponses = [...groupes.values()].sort((a, b) => Number(b.juste) - Number(a.juste) || b.nb - a.nb)
    const erreurs = reponses.filter((g) => !g.juste).map((g) => ({ reponse: g.reponse, nb: g.nb }))
    return { cle, rang: i + 1, repondu, reussi, erreurs, reponses, horsVersion: hors }
  })
}

/** Un élève de la session : prénom s'il l'a donné, sinon « Élève N » (N : ordre de réception) */
export interface Eleve {
  d: string
  numero: number
  nom: string // prénom, ou « Élève N »
}

export function elevesDe(recues: ReponsesSession[]): Eleve[] {
  return recues.map((r, i) => ({ d: r.d, numero: i + 1, nom: r.n?.trim() || `Élève ${i + 1}` }))
}

export interface DetailEleve {
  cle: string
  rang: number
  reponse: string | null // null : pas de réponse
  juste: boolean | null // null : non vérifiable (autre version) ou sans réponse
}

export interface BilanEleve extends Eleve {
  points: number
  sur: number // questions revérifiées
  details: DetailEleve[]
}

/** Score et réponses de chaque élève, d'après les verdicts recalculés */
export function bilanDesEleves(
  ordre: string[],
  recues: ReponsesSession[],
  verdicts: Record<string, Record<string, VerdictQuestion>>,
  horsVersion: (r: ReponsesSession, cle: string) => boolean,
): BilanEleve[] {
  return elevesDe(recues).map((e, i) => {
    const r = recues[i]
    let points = 0
    let sur = 0
    const details = ordre.map((cle, k) => {
      const champs = r.r[cle]
      const v = champs && !horsVersion(r, cle) ? verdicts[r.d]?.[cle] : undefined
      if (v) {
        sur++
        points += v.score
      }
      return { cle, rang: k + 1, reponse: champs ? texteReponse(champs) || '(vide)' : null, juste: v ? v.juste : null }
    })
    return { ...e, points, sur, details }
  })
}
