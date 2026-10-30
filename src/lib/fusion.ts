// Un élève sur plusieurs appareils (téléphone, tablette, ordinateur de
// l'école) : la sauvegarde de l'autre appareil se fusionne avec celle-ci au
// lieu de la remplacer (Nathan, 2026-10-30). Rien n'est perdu de ce qui est
// terminé : les passages des deux côtés sont réunis, et ce qui se déduit des
// passages (révisions, dernier pourcentage, ceintures) est recalculé
// d'après eux, dans l'ordre où ils ont eu lieu. Les réglages restent ceux de
// cet appareil.
import type { Parcours } from './catalogue'
import { CLE_FICHES, type FicheDuParcours } from './fiches'
import { bilan, type ResultatEtape, type Seance } from './progression'
import type { Releve } from './releve'
import { ID_REVISIONS, integrerPassages, jour, resultatsRevision, revisionsVides, type Revisions } from './revisions'
import { estTest } from './testNiveau'

type Donnees = Record<string, unknown>

export interface BilanFusion {
  passagesAjoutes: number // passages terminés venus de l'autre appareil
  seancesRemplacees: number // séances en cours de cet appareil remplacées par une plus récente de l'autre
  seancesIgnorees: number // séances en cours de l'autre appareil, plus anciennes que celles d'ici
}

const parId = <T extends { id: string; version: number }>(a: T[] = [], b: T[] = []) => {
  const m = new Map(a.map((p) => [p.id, p]))
  for (const p of b) if (!m.has(p.id) || p.version > m.get(p.id)!.version) m.set(p.id, p)
  return [...m.values()]
}
const union = (a: string[] = [], b: string[] = []) => [...new Set([...a, ...b])]

/** Dernière activité d'une séance : dernière réponse, fin ou début */
const activite = (s: Seance) => [s.debut, s.fin ?? '', ...s.essais.map((e) => e.le)].reduce((a, b) => (a > b ? a : b))

/** Révisions recalculées d'après tous les passages, dans l'ordre de leur fin */
export function rejouerRevisions(historiques: Seance[][], reglages: Pick<Revisions, 'chapitres' | 'taille'> = {}): Revisions {
  let r: Revisions = { ...revisionsVides(), ...reglages }
  const termines = historiques
    .flat()
    .filter((s) => s.fin)
    .sort((a, b) => a.fin!.localeCompare(b.fin!))
  for (const s of termines) {
    if (s.parcours === ID_REVISIONS) r = resultatsRevision(r, s, jour(new Date(s.fin!))).revisions
    else r = integrerPassages(r, [s], estTest)
  }
  return r
}

/**
 * Données de cet appareil (`ici`) fusionnées avec celles d'un autre (`la`).
 * Le résultat passe par le même contrôle qu'une sauvegarde avant d'être écrit.
 */
export function fusionnerDonnees(ici: Donnees, la: Donnees): { donnees: Donnees; bilan: BilanFusion } {
  const d: Donnees = { ...ici }
  const b: BilanFusion = { passagesAjoutes: 0, seancesRemplacees: 0, seancesIgnorees: 0 }
  const cles = union(Object.keys(ici), Object.keys(la))

  for (const cle of cles) {
    const a = ici[cle] as never
    const x = la[cle] as never
    if (x == null) continue
    if (a == null) {
      d[cle] = x
      if (cle.startsWith('historique:')) b.passagesAjoutes += (x as Seance[]).length
      continue
    }
    if (cle.startsWith('historique:')) {
      // Un même passage (même début) des deux côtés : le plus avancé
      const m = new Map((a as Seance[]).map((s) => [s.debut, s]))
      for (const s of x as Seance[]) {
        const deja = m.get(s.debut)
        if (!deja) b.passagesAjoutes++
        if (!deja || activite(s) > activite(deja)) m.set(s.debut, s)
      }
      d[cle] = [...m.values()].sort((s, t) => s.debut.localeCompare(t.debut))
    } else if (cle.startsWith('seance:')) {
      // Une seule séance par parcours : la plus récente ; l'autre, si elle
      // était terminée, reste dans l'historique
      const s = a as Seance
      const t = x as Seance
      if (s.debut === t.debut) d[cle] = activite(t) > activite(s) ? t : s
      else if (activite(t) > activite(s)) {
        d[cle] = t
        if (!s.fin) b.seancesRemplacees++
      } else if (!t.fin) b.seancesIgnorees++
    } else if (cle.startsWith('resultats:')) {
      // Par exercice : le résultat le plus récent
      const r: Record<string, ResultatEtape> = { ...(a as Record<string, ResultatEtape>) }
      for (const [k, v] of Object.entries(x as Record<string, ResultatEtape>)) if (!r[k] || v.le > r[k].le) r[k] = v
      d[cle] = r
    } else if (['explorer', 'ajoutes', 'importes'].includes(cle)) d[cle] = parId(a, x)
    else if (['epingles', 'fiches-vues'].includes(cle)) d[cle] = union(a, x)
    else if (cle === 'classes') {
      const liens = new Set((a as { lien: string }[]).map((c) => c.lien))
      d[cle] = [...(a as { lien: string }[]), ...(x as { lien: string }[]).filter((c) => !liens.has(c.lien))]
    } else if (cle === 'importes-classes' || cle === 'etiquettes') {
      const r: Record<string, string[]> = { ...(a as Record<string, string[]>) }
      for (const [k, v] of Object.entries(x as Record<string, string[]>)) r[k] = union(r[k], v)
      d[cle] = r
    } else if (cle === CLE_FICHES) {
      // Ordre de cet appareil, puis les fiches enregistrées seulement là-bas
      const vues = new Set((a as FicheDuParcours[]).map((f) => f.cle))
      d[cle] = [...(a as FicheDuParcours[]), ...(x as FicheDuParcours[]).filter((f) => !vues.has(f.cle))]
    } else if (cle === 'objectifs') {
      const vus = new Set((a as { libelle: string }[]).map((o) => o.libelle))
      d[cle] = [...(a as { libelle: string }[]), ...(x as { libelle: string }[]).filter((o) => !vus.has(o.libelle))]
    } else if (cle === 'test-niveau') {
      // Par niveau : un test réussi l'emporte, le plus ancien s'ils le sont tous deux
      const r: Record<string, { valideLe?: string }> = { ...(a as Record<string, { valideLe?: string }>) }
      for (const [k, v] of Object.entries(x as Record<string, { valideLe?: string }>)) {
        const w = r[k]
        if (!w || (v.valideLe && (!w.valideLe || v.valideLe < w.valideLe))) r[k] = v
      }
      d[cle] = r
    } else if (cle === 'releves') d[cle] = fusionnerReleves(a, x)
    else if (cle === 'bibliotheque') {
      const bi = a as { parcours: { parcours: Parcours }[]; classes: { nom: string }[] }
      const bx = x as typeof bi
      const parcours = new Map(bi.parcours.map((pe) => [pe.parcours.id, pe]))
      for (const pe of bx.parcours) {
        const deja = parcours.get(pe.parcours.id)
        if (!deja || pe.parcours.version > deja.parcours.version) parcours.set(pe.parcours.id, pe)
      }
      const noms = new Set(bi.classes.map((c) => c.nom))
      d[cle] = { ...bi, parcours: [...parcours.values()], classes: [...bi.classes, ...bx.classes.filter((c) => !noms.has(c.nom))] }
    } else if (cle === 'chapitres') d[cle] = { ...(x as object), ...(a as object) }
    // Autres clés (profil, pays, prénom, préférences) : celles de cet appareil
  }

  // Recalculé d'après les passages réunis
  const historiques = Object.keys(d)
    .filter((c) => c.startsWith('historique:'))
    .map((c) => d[c] as Seance[])
  if (d.revisions || historiques.length) {
    const r = (ici.revisions ?? la.revisions ?? {}) as Partial<Revisions>
    d.revisions = rejouerRevisions(historiques, {
      ...(r.chapitres ? { chapitres: r.chapitres } : {}),
      ...(r.taille ? { taille: r.taille } : {}),
    })
  }
  for (const c of Object.keys(d).filter((c) => c.startsWith('historique:'))) {
    // Pourcentage du dernier passage sur tout le parcours
    const dernier = (d[c] as Seance[])
      .filter((s) => s.fin && s.type === 'complet' && s.etapes.length === s.contenu.etapes.length)
      .sort((s, t) => s.fin!.localeCompare(t.fin!))
      .at(-1)
    if (dernier) d[`complet:${c.slice('historique:'.length)}`] = bilan(dernier).pourcentage
  }
  return { donnees: d, bilan: b }
}

/** Sessions de l'enseignant : réunies par code, réponses reçues des deux côtés */
function fusionnerReleves(a: Releve[], x: Releve[]): Releve[] {
  const m = new Map(a.map((r) => [r.cle, r]))
  for (const r of x) {
    const s = m.get(r.cle)
    if (!s) {
      m.set(r.cle, r)
      continue
    }
    const vues = new Set(s.recues.map((q) => JSON.stringify(q)))
    const nouvelles = r.recues.filter((q) => !vues.has(JSON.stringify(q)))
    // Verdicts recalculés par l'app si des réponses s'ajoutent
    const { calcul, ...reste } = s
    m.set(r.cle, nouvelles.length ? { ...reste, recues: [...s.recues, ...nouvelles], le: r.le > s.le ? r.le : s.le } : { ...reste, ...(calcul ? { calcul } : {}) })
  }
  return [...m.values()]
}
