// QR codes que l'app lit : session partagée et classe. Des textes courts, pour
// une lecture facile à la caméra (un QR code qui portait tout le parcours ne se
// lisait pas, novembre 2026).
//
// Session : `MATHALEA-SESSION?c=<code>&p=<parcours>&v=<version>[&e=<étapes>][&m=<moteur>][&l=<lien>]`.
// Le parcours n'y est pas : chacun le prend dans ses classes ou dans l'Explorer
// (le lien de dossier, s'il y est, ajoute d'abord la classe). Même code, même
// parcours, même version : mêmes questions (graineDeSession).
// Classe : le lien du dossier partagé (avec `?classe=…`), ou l'ancien format
// `MACLA1.` des QR codes déjà affichés par l'app enseignant (0.5 et avant).
import { strFromU8 } from 'fflate'
import { normaliserCode } from './progression'

export const PREFIXE_SESSION = 'MATHALEA-SESSION?'

export interface InvitationSession {
  c: string // code de session
  p: string // identifiant du parcours
  v: number // sa version
  e?: number[] // palier de la session : ses exercices
  m?: string // date du moteur de qui a créé la session (« 2026-11-05 »)
  l?: string // lien du dossier partagé du parcours (avec sa classe)
}

/** Date d'une version du moteur (« 2026-10-17+… ») */
export const dateMoteur = (v: string) => /^\d{4}-\d{2}-\d{2}/.exec(v)?.[0] ?? ''

/** Texte du QR code de session */
export function encoderInvitation(i: InvitationSession) {
  const q = new URLSearchParams({ c: i.c, p: i.p, v: String(i.v) })
  if (i.e) q.set('e', i.e.join('-'))
  const m = i.m ? dateMoteur(i.m) : ''
  if (m) q.set('m', m)
  if (i.l) q.set('l', i.l)
  return PREFIXE_SESSION + q.toString()
}

export function decoderInvitation(texte: string): InvitationSession | null {
  const t = texte.trim()
  if (!t.startsWith(PREFIXE_SESSION)) return null
  const q = new URLSearchParams(t.slice(PREFIXE_SESSION.length))
  const c = normaliserCode(q.get('c') ?? '')
  const p = q.get('p') ?? ''
  const v = Number(q.get('v'))
  if (c.length !== 5 || !/^[a-z0-9-]+$/.test(p) || !Number.isInteger(v) || v < 1) return null
  const i: InvitationSession = { c, p, v }
  const e = q.get('e')
  if (e !== null) {
    if (!/^\d+(-\d+)*$/.test(e)) return null
    i.e = e.split('-').map(Number)
  }
  const m = dateMoteur(q.get('m') ?? '')
  if (m) i.m = m
  const l = q.get('l')?.trim()
  if (l) {
    if (!/^https?:\/\/\S+$/.test(l)) return null
    i.l = l
  }
  return i
}

/** L'app de l'élève a-t-elle des exercices plus anciens que ceux de qui a créé la session ? */
export function moteurPlusAncien(eleve: string, createur: string | undefined) {
  const a = dateMoteur(eleve)
  const b = dateMoteur(createur ?? '')
  return !!a && !!b && a < b
}

// Ancien QR code de classe (app enseignant jusqu'à la 0.5) : lu pour les codes
// déjà imprimés ou projetés
const PREFIXE_CLASSE = 'MACLA1.'

export interface InvitationClasse {
  l: string // lien du dossier partagé
  c: string // nom de la classe ; vide : tout le dossier, l'élève choisit sa classe
}

export function decoderClasse(texte: string): InvitationClasse | null {
  const t = texte.trim()
  if (!t.startsWith(PREFIXE_CLASSE)) return null
  try {
    const b = atob(t.slice(PREFIXE_CLASSE.length).replace(/-/g, '+').replace(/_/g, '/'))
    const o = JSON.parse(strFromU8(Uint8Array.from(b, (x) => x.charCodeAt(0))))
    if (!o || typeof o.l !== 'string' || typeof o.c !== 'string' || !/^https?:\/\//.test(o.l.trim())) return null
    return { l: o.l.trim(), c: o.c.trim() }
  } catch {
    return null
  }
}
