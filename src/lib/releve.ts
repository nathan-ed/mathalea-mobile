// Données de l'espace enseignant d'avant la 0.6 (réponses de sessions relevées
// par QR code) : plus rien ne les écrit, mais une sauvegarde qui en contient
// doit rester restaurable et fusionnable (sauvegarde.ts, fusion.ts).

/** Exercice d'une étape, de quoi le regénérer sans le parcours */
export interface ExerciceReleve {
  u: string // uuid MathALÉA
  n?: number
  s?: string
  s2?: string
  s3?: string
  s4?: string
}

/** Réponses d'un élève à une session partagée, telles que transportées par son QR code */
export interface ReponsesSession {
  c: string // code de session
  p: string // identifiant du parcours
  v: number // version du parcours
  t: string // titre du parcours
  m?: string
  d: string // identifiant du passage
  x: Record<number, ExerciceReleve>
  o?: 1
  e?: Record<number, string>
  r: Record<string, Record<string, string>>
  n?: string
}

export interface VerdictQuestion {
  juste: boolean
  score: number // entre 0 et 1
}

/** Une session relevée par l'enseignant */
export interface Releve {
  cle: string
  code: string
  parcours: string
  version: number
  titre: string
  le: string // dernier ajout
  recues: ReponsesSession[]
  calcul?: {
    moteur: string
    verdicts: Record<string, Record<string, VerdictQuestion>>
    hors: Record<string, number[]>
  }
  creee?: true
  invitation?: string
  classe?: string
}

const estChaine = (v: unknown): v is string => typeof v === 'string'
const estObjet = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

function estReponsesSession(o: unknown): o is ReponsesSession {
  if (!estObjet(o) || !estChaine(o.c) || !estChaine(o.p) || typeof o.v !== 'number' || !estChaine(o.d) || !estObjet(o.x) || !estObjet(o.r)) return false
  if (o.t !== undefined && !estChaine(o.t)) return false
  for (const e of Object.values(o.x)) if (!estObjet(e) || !estChaine(e.u)) return false
  for (const q of Object.values(o.r)) if (!estObjet(q) || !Object.values(q).every(estChaine)) return false
  if (o.e !== undefined && (!estObjet(o.e) || !Object.values(o.e).every(estChaine))) return false
  if (o.n !== undefined && (!estChaine(o.n) || o.n.length > 60)) return false
  return true
}

/** Relevés bien formés (sauvegarde) */
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
