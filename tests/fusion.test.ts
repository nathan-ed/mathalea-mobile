// Plusieurs appareils pour un même élève : la sauvegarde de l'autre appareil
// se fusionne avec celle-ci. Rien de terminé n'est perdu, les révisions et
// les pourcentages sont recalculés d'après les passages réunis, les réglages
// restent ceux de l'appareil.
import { describe, expect, it } from 'vitest'
import { type Parcours } from '../src/lib/catalogue'
import { parcoursVide } from '../src/lib/bibliotheque'
import { fusionnerDonnees, rejouerRevisions } from '../src/lib/fusion'
import { bilan, nouvelleSeance, type Seance } from '../src/lib/progression'
import { ID_REVISIONS, integrerPassages, jour, resultatsRevision, revisionsVides, tirerRevision } from '../src/lib/revisions'
import { CLE_AVANT_RESTAURATION, cleInvalide, exporterSauvegarde, fusionnerSauvegarde } from '../src/lib/sauvegarde'
import type { Stockage } from '../src/lib/stockage'

const etape = (uuid: string) => ({ uuid, id: uuid, titre: uuid, nbQuestions: 2, objectifs: [uuid] })
const parcours = (id: string): Parcours => ({ ...parcoursVide(), id, titre: id, niveau: '5e', theme: 'Nombres relatifs', etapes: [etape(`${id}1`), etape(`${id}2`)] })
const P = parcours('p')
const Q = parcours('q')

/** Passage le jour `j` (octobre 2026) : `bonnes` réponses justes, terminé ou non */
function passage(p: Parcours, j: number, bonnes = 4, fini = true, minute = 0): Seance {
  const s = nouvelleSeance(p, 'essai', 'complet')
  s.debut = new Date(2026, 9, j, 10, minute).toISOString()
  const le = new Date(2026, 9, j, 10, minute + 5).toISOString()
  let vues = 0
  for (const e of [0, 1]) {
    s.nbQuestions[e] = 2
    for (let q = 0; q < 2; q++) {
      const juste = vues++ < bonnes
      s.essais.push({ etape: e, question: q, juste, points: juste ? 1 : 0, total: 1, reponses: {}, le })
    }
  }
  if (fini) s.fin = le
  return s
}

const appareil = (historiques: Record<string, Seance[]>, autres: Record<string, unknown> = {}): Record<string, unknown> => ({
  profil: 'eleve',
  pays: 'FR',
  ...Object.fromEntries(Object.entries(historiques).map(([id, h]) => [`historique:${id}`, h])),
  ...autres,
})

describe('fusion de deux appareils', () => {
  it('passages des deux côtés réunis, pourcentage du plus récent', () => {
    const a = appareil({ p: [passage(P, 1, 2)] })
    const b = appareil({ p: [passage(P, 3, 4)], q: [passage(Q, 2, 3)] })
    const { donnees, bilan: f } = fusionnerDonnees(a, b)
    expect((donnees['historique:p'] as Seance[]).map((s) => bilan(s).pourcentage)).toEqual([50, 100])
    expect(donnees['historique:q']).toHaveLength(1)
    expect(donnees['complet:p']).toBe(100)
    expect(donnees['complet:q']).toBe(75)
    expect(f.passagesAjoutes).toBe(2)
    expect(cleInvalide(donnees)).toBeUndefined()
  })

  it('un même passage des deux côtés compte une fois, le plus avancé gardé', () => {
    const court = passage(P, 1, 2, false)
    const long = structuredClone(court)
    long.essais.push({ ...long.essais[0], le: new Date(2026, 9, 1, 11).toISOString() })
    long.fin = new Date(2026, 9, 1, 11).toISOString()
    const { donnees, bilan: f } = fusionnerDonnees(appareil({ p: [court] }), appareil({ p: [long] }))
    expect(donnees['historique:p']).toEqual([long])
    expect(f.passagesAjoutes).toBe(0)
  })

  it('séance en cours : la plus récente l’emporte, l’autre est comptée', () => {
    const vieille = passage(P, 1, 1, false)
    const recente = passage(P, 4, 1, false)
    let r = fusionnerDonnees(appareil({}, { 'seance:p': vieille }), appareil({}, { 'seance:p': recente }))
    expect((r.donnees['seance:p'] as Seance).debut).toBe(recente.debut)
    expect(r.bilan.seancesRemplacees).toBe(1)
    r = fusionnerDonnees(appareil({}, { 'seance:p': recente }), appareil({}, { 'seance:p': vieille }))
    expect((r.donnees['seance:p'] as Seance).debut).toBe(recente.debut)
    expect(r.bilan.seancesIgnorees).toBe(1)
  })

  it('réglages de cet appareil, listes réunies', () => {
    const a = appareil({}, { prenom: 'Alix', epingles: ['p'], classes: [{ lien: 'L1', nom: '5e A', disponibles: ['5e A'], parcours: [] }] })
    const b = appareil({}, { prenom: 'Autre', pays: 'CH', epingles: ['q', 'p'], classes: [{ lien: 'L2', nom: '5e B', disponibles: ['5e B'], parcours: [] }, { lien: 'L1', nom: 'x', disponibles: [], parcours: [] }] })
    const { donnees } = fusionnerDonnees(a, b)
    expect([donnees.prenom, donnees.pays, donnees.epingles]).toEqual(['Alix', 'FR', ['p', 'q']])
    expect((donnees.classes as { lien: string; nom: string }[]).map((c) => `${c.lien} ${c.nom}`)).toEqual(['L1 5e A', 'L2 5e B'])
  })

  it('fusionner deux fois la même sauvegarde ne change plus rien', () => {
    const a = appareil({ p: [passage(P, 1, 2)] })
    const b = appareil({ p: [passage(P, 3, 4)] })
    const une = fusionnerDonnees(a, b).donnees
    const deux = fusionnerDonnees(une, b)
    expect(deux.donnees).toEqual(une)
    expect(deux.bilan.passagesAjoutes).toBe(0)
  })
})

describe('révisions recalculées', () => {
  it('rejouer les passages d’un seul appareil redonne exactement ses révisions', () => {
    // Comme l'app : chaque fin de séance intègre le passage ou applique la révision
    const p1 = passage(P, 1, 2)
    const q1 = passage(Q, 2, 4)
    let r = integrerPassages(integrerPassages(revisionsVides(), [p1]), [q1])
    const rev = tirerRevision(r, '2026-10-30')!
    const s = passage(rev, 30, 1)
    s.parcours = ID_REVISIONS
    s.etapes = rev.etapes.map((_, i) => i)
    s.essais = rev.etapes.map((_, i) => ({ etape: i, question: 0, juste: i === 0, points: i === 0 ? 1 : 0, total: 1, reponses: {}, le: s.fin! }))
    s.nbQuestions = Object.fromEntries(rev.etapes.map((_, i) => [i, 1]))
    r = resultatsRevision(r, s, jour(new Date(s.fin!))).revisions
    const p2 = passage(P, 31, 4)
    r = integrerPassages(r, [p2])
    expect(rejouerRevisions([[p1, p2], [q1], [s]])).toEqual({ ...r, traites: expect.arrayContaining(r.traites) })
    expect(rejouerRevisions([[p1, p2], [q1], [s]]).traites).toHaveLength(r.traites.length)
  })

  it('passages des deux appareils : chaque exercice avance d’après tous les passages', () => {
    const a = appareil({ p: [passage(P, 1, 0)] }) // tout faux : boîte 1
    const b = appareil({ p: [passage(P, 20, 4)] }) // tout juste plus tard : avance
    const ici = { ...a, revisions: { ...integrerPassages(revisionsVides(), a['historique:p'] as Seance[]), taille: 3 } }
    const { donnees } = fusionnerDonnees(ici, b)
    const r = donnees.revisions as ReturnType<typeof revisionsVides>
    expect(Object.values(r.elements).map((e) => e.boite)).toEqual([2, 2])
    expect(r.taille).toBe(3) // réglage de l'élève gardé
  })
})

describe('fusion dans le stockage', () => {
  const stockage = (initial: Record<string, unknown>) => {
    const d = new Map(Object.entries(initial))
    return {
      d,
      st: {
        lire: async (c: string) => (d.has(c) ? structuredClone(d.get(c)) : null),
        ecrire: async (c: string, v: unknown) => void d.set(c, structuredClone(v)),
        effacer: async (c: string) => void d.delete(c),
        cles: async () => [...d.keys()],
      } as unknown as Stockage,
    }
  }

  it('écrit la fusion et garde l’état d’avant pour l’annuler', async () => {
    const { d, st } = stockage(appareil({ p: [passage(P, 1, 2)] }))
    const autre = stockage(appareil({ q: [passage(Q, 2, 4)] }))
    const avant = await exporterSauvegarde(st)
    const f = await fusionnerSauvegarde(st, await exporterSauvegarde(autre.st))
    expect(f.passagesAjoutes).toBe(1)
    expect([...d.keys()].filter((k) => k.startsWith('historique:')).sort()).toEqual(['historique:p', 'historique:q'])
    expect(JSON.parse(d.get(CLE_AVANT_RESTAURATION) as string).donnees).toEqual(JSON.parse(avant).donnees)
  })

  it('une sauvegarde endommagée ne change rien', async () => {
    const { d, st } = stockage(appareil({ p: [passage(P, 1, 2)] }))
    const avant = structuredClone(Object.fromEntries(d))
    const abime = JSON.stringify({ format: 'sauvegarde-mathalea/1', creeeLe: '2026-10-30', donnees: { 'historique:q': [{ debut: 1 }] } })
    await expect(fusionnerSauvegarde(st, abime)).rejects.toThrow('endommagée')
    expect(Object.fromEntries(d)).toEqual(avant)
  })
})
