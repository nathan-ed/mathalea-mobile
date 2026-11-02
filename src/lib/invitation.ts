// QR code de session affiché par l'enseignant (au tableau) : l'élève le scanne
// et arrive directement dans la session, sur le bon parcours. Le code porte
// une copie du parcours (version figée) : rien d'autre à installer ni à
// chercher. Il porte aussi la version des exercices de l'enseignant, pour
// prévenir un élève dont l'app est plus ancienne.
import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate'
import type { Parcours } from './catalogue'
import { normaliserCode } from './progression'
import { depuisBase64, versBase64 } from './releve'
import { estParcours } from './validation'

export const PREFIXE_SESSION = 'MASES1.'

export interface InvitationSession {
  c: string // code de session
  p: Parcours
  e?: number[] // palier ouvert : ses exercices
  m: string // version du moteur de l'enseignant
}

/** Le parcours sans ce qui ne sert pas à la séance (pauses, ressources), pour un QR code plus petit */
function allege(p: Parcours): Parcours {
  const { paliers, ...reste } = p
  return paliers ? { ...reste, paliers: paliers.map(({ pause: _p, ressource: _r, ...x }) => x) } : reste
}

/** Sans les fiches de cours (souvent des images) : l'élève qui a le parcours garde les siennes (rejoindreSession) */
function sansFiches(p: Parcours): Parcours {
  const { fiche: _f, paliers, ...reste } = p
  return paliers ? { ...reste, paliers: paliers.map(({ fiche: _x, ...x }) => x) } : reste
}
const sansObjectifs = (p: Parcours): Parcours => ({ ...p, etapes: p.etapes.map(({ objectifs: _o, ...e }) => e) })
function sansPresentation(p: Parcours): Parcours {
  const { auteurs: _a, descriptionEleves: _e, descriptionEnseignant: _d, ...reste } = p
  return reste
}

/** Octets d'un QR code au plus (version 40, correction L, mode octet) */
export const TAILLE_QR = 2953

/**
 * Texte du QR code de session. Le parcours entier s'il tient dans un QR code,
 * sinon allégé dans l'ordre : fiches de cours, objectifs, auteurs et
 * descriptions. Les exercices et leurs réglages restent toujours.
 */
export function encoderInvitation(i: InvitationSession) {
  const texte = (p: Parcours) => PREFIXE_SESSION + versBase64(deflateSync(strToU8(JSON.stringify({ ...i, p })), { level: 9 }))
  let p = allege(i.p)
  let t = texte(p)
  for (const reduire of [sansFiches, sansObjectifs, sansPresentation]) {
    if (t.length <= TAILLE_QR) break
    p = reduire(p)
    t = texte(p)
  }
  return t
}

export function decoderInvitation(texte: string): InvitationSession | null {
  const t = texte.trim()
  if (!t.startsWith(PREFIXE_SESSION)) return null
  try {
    const o = JSON.parse(strFromU8(inflateSync(depuisBase64(t.slice(PREFIXE_SESSION.length)))))
    if (!o || typeof o !== 'object' || typeof o.c !== 'string' || typeof o.m !== 'string' || !estParcours(o.p)) return null
    const c = normaliserCode(o.c)
    if (c.length !== 5) return null
    const n = o.p.etapes.length
    if (o.e !== undefined && !(Array.isArray(o.e) && o.e.length && o.e.every((k: unknown) => Number.isInteger(k) && (k as number) >= 0 && (k as number) < n))) return null
    return { c, p: o.p, m: o.m, ...(o.e ? { e: o.e } : {}) }
  } catch {
    return null
  }
}

/** Date d'une version du moteur (« 2026-10-17+… ») */
const dateMoteur = (v: string) => /^\d{4}-\d{2}-\d{2}/.exec(v)?.[0] ?? ''

/** L'app de l'élève a-t-elle des exercices plus anciens que ceux de l'enseignant ? */
export function moteurPlusAncien(eleve: string, enseignant: string) {
  const a = dateMoteur(eleve)
  const b = dateMoteur(enseignant)
  return !!a && !!b && a < b
}

// QR code d'une classe ou du dossier entier, affiché par l'enseignant : l'élève
// le scanne et l'app ajoute le dossier partagé de l'enseignant, avec sa classe
// déjà choisie s'il y en a une, sans lien à saisir.
export const PREFIXE_CLASSE = 'MACLA1.'

export interface InvitationClasse {
  l: string // lien du dossier partagé
  c: string // nom de la classe ; vide : tout le dossier, l'élève choisit sa classe
}

export function encoderClasse(i: InvitationClasse) {
  return PREFIXE_CLASSE + versBase64(strToU8(JSON.stringify({ l: i.l, c: i.c })))
}

export function decoderClasse(texte: string): InvitationClasse | null {
  const t = texte.trim()
  if (!t.startsWith(PREFIXE_CLASSE)) return null
  try {
    const o = JSON.parse(strFromU8(depuisBase64(t.slice(PREFIXE_CLASSE.length))))
    if (!o || typeof o.l !== 'string' || typeof o.c !== 'string' || !/^https?:\/\//.test(o.l.trim())) return null
    return { l: o.l.trim(), c: o.c.trim() }
  } catch {
    return null
  }
}
