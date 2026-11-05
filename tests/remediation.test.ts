import { describe, expect, it } from 'vitest'
import type { Etape, Parcours } from '../src/lib/catalogue'
import { etatsPaliers, objectifsTravailles, scoresParObjectif } from '../src/lib/objectifs'
import { nouvelleSeance, type Essai, type Seance } from '../src/lib/progression'
import {
  PROFONDEUR_MAX,
  detailDeVerification,
  diagnostiquer,
  lacunesDe,
  ouvertsParPositionnement,
  parcoursDePositionnement,
  parcoursDeRemediation,
  rangDePositionnement,
  rangReprise,
  remediationPour,
  repriseReussie,
  suiteDeRemediation,
} from '../src/lib/remediation'
import { cleInvalide } from '../src/lib/sauvegarde'
import { estParcours } from '../src/lib/validation'

const etape = (uuid: string, objectifs?: string[], plus: Partial<Etape> = {}): Etape => ({ uuid, id: uuid.toUpperCase(), titre: `Exercice ${uuid}`, nbQuestions: 2, objectifs, ...plus })

// Étude de fonction : points a) dérivée, b) signe, c) variations
const etude = etape('etu', ['Étudier une fonction'], {
  nbQuestions: 1,
  points: { '0:field0': ['Dériver'], '0:field1': ['Signe de la dérivée'], '0:field2': ['Variations'] },
})

const base: Parcours = {
  id: 'derivation-1re',
  version: 2,
  titre: 'Dérivation',
  objectif: 'Étudier les variations d’une fonction',
  niveau: '1re',
  theme: 'Dérivation',
  difficulte: 2,
  icone: 'bx-line-chart',
  presentation: 'une_question_par_page',
  correction: 'question',
  style: 'ceintures',
  paliers: [
    { titre: '', nb: 2 },
    { titre: '', nb: 2, acces: 'seuil', seuil: 80 },
    { titre: '', nb: 1, acces: 'seuil', seuil: 80 },
  ],
  etapes: [
    etape('der1', ['Dériver']),
    etape('sig1', ['Signe de la dérivée']),
    etape('der2', ['Dériver'], { remediation: [etape('rem-der', ['Dériver'])] }),
    etape('var', ['Variations', 'Dériver']),
    etude,
  ],
  remediations: [
    { objectif: 'Signe de la dérivée', etapes: [etape('trinome', ['Signe d’un trinôme'])], prerequis: ['Signe d’un trinôme'] },
    { objectif: 'Signe d’un trinôme', etapes: [etape('racines', ['Racines d’un trinôme'])] },
  ],
}

/** Séance terminée : une question par essai (rang, question, score, détail) */
function seance(p: Parcours, etapes: number[], essais: [number, number, number, Record<string, number>?][]): Seance {
  const s = nouvelleSeance(p, 'test', 'complet', etapes)
  for (const e of etapes) s.nbQuestions[e] = p.etapes[e].nbQuestions ?? 1
  s.essais = essais.map(([etape, question, score, detail]): Essai => ({
    etape,
    question,
    juste: score === 1,
    points: score,
    total: 1,
    reponses: {},
    le: '2026-11-06T08:00:00Z',
    ...(detail ? { detail } : {}),
  }))
  s.fin = '2026-11-06T08:10:00Z'
  return s
}

describe('diagnostic', () => {
  it('garde le détail seulement pour une question à plusieurs points', () => {
    expect(detailDeVerification([{ cle: '0', score: 0 }])).toBeUndefined()
    expect(detailDeVerification([{ cle: '0:champ1', score: 1 }, { cle: '0:champ2', score: 0 }])).toEqual({ '0:champ1': 1, '0:champ2': 0 })
  })

  it('prend le premier point manqué et ses objectifs', () => {
    const s = seance(base, [4], [[4, 0, 0, { '0:field0': 1, '0:field1': 0, '0:field2': 0 }]])
    expect(lacunesDe(s)).toEqual([{ etape: 4, question: 0, point: '0:field1', objectifs: ['Signe de la dérivée'], parPoint: true }])
    const d = diagnostiquer(s)
    expect(d.propositions).toHaveLength(1)
    expect(d.propositions[0]).toMatchObject({ objectif: 'Signe de la dérivée', origine: 'objectif', etape: 4 })
    expect(d.propositions[0].etapes.map((e) => e.uuid)).toEqual(['trinome'])
  })

  it('sans point étiqueté, garde les objectifs de l’exercice', () => {
    const s = seance(base, [0], [[0, 0, 1], [0, 1, 0]])
    expect(lacunesDe(s)).toEqual([{ etape: 0, question: 1, point: undefined, objectifs: ['Dériver'], parPoint: false }])
  })

  it('remédiation automatique : un autre exercice du parcours sur le même objectif, paliers précédents d’abord', () => {
    // Rien de prévu pour « Dériver » : var manqué (ceinture jaune), der1 (blanche) puis der2 (même ceinture)
    const r = remediationPour(base, 3, 'Dériver')
    expect(r?.origine).toBe('parcours')
    expect(r?.etapes.map((e) => e.uuid)).toEqual(['der1', 'der2'])
    // Questions limitées, sans la remédiation de l'exercice repris
    expect(r?.etapes[1].nbQuestions).toBe(2)
    expect(r?.etapes[1].remediation).toBeUndefined()
  })

  it('jamais un exercice d’un palier suivant (plus difficile)', () => {
    // der1 manqué (blanche) : der2 et var sont plus loin, rien dans le parcours ni le catalogue
    expect(remediationPour(base, 0, 'Dériver')).toBeNull()
    // sig1 manqué : la remédiation prévue pour l'objectif
    expect(remediationPour(base, 1, 'Signe de la dérivée')?.origine).toBe('objectif')
  })

  it('remédiation propre à l’exercice avant l’automatique', () => {
    const r = remediationPour(base, 2, 'Dériver')
    expect(r).toMatchObject({ origine: 'exercice', objectif: 'Dériver' })
    expect(r?.etapes.map((e) => e.uuid)).toEqual(['rem-der'])
  })

  it('catalogue : un autre parcours du même niveau', () => {
    const p: Parcours = { ...base, id: 'seul', paliers: undefined, etapes: [etape('x', ['Limites'])], remediations: undefined }
    const autre: Parcours = { ...base, id: 'autre', paliers: undefined, etapes: [etape('lim', ['Limites']), etape('autre', ['Suites'])], remediations: undefined }
    const loin: Parcours = { ...autre, id: 'loin', niveau: 'Terminale', etapes: [etape('lim2', ['Limites'])] }
    expect(remediationPour(p, 0, 'Limites', [loin, autre])?.etapes.map((e) => e.uuid)).toEqual(['lim'])
    expect(remediationPour(p, 0, 'Limites', [loin])).toBeNull()
  })

  it('plusieurs objectifs sans résultat par point : l’élève précise', () => {
    const s = seance(base, [3], [[3, 0, 0], [3, 1, 1]])
    const d = diagnostiquer(s)
    expect(d.propositions).toEqual([])
    expect(d.aPreciser).toEqual([{ etape: 3, objectifs: ['Variations', 'Dériver'] }])
  })

  it('un objectif une seule fois, dans l’ordre des questions', () => {
    const s = seance(base, [0, 1, 2], [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0]])
    const d = diagnostiquer(s)
    // der1 (blanche) n'a rien pour « Dériver » ; der2, manqué plus loin, a sa remédiation
    expect(d.propositions.map((x) => x.objectif)).toEqual(['Signe de la dérivée', 'Dériver'])
    expect(d.propositions[1]).toMatchObject({ etape: 2, origine: 'exercice' })
  })

  it('tout réussi : rien à retravailler', () => {
    const s = seance(base, [0], [[0, 0, 1], [0, 1, 1]])
    expect(diagnostiquer(s)).toEqual({ propositions: [], aPreciser: [] })
  })
})

describe('séance de remédiation', () => {
  const prop = diagnostiquer(seance(base, [4], [[4, 0, 0, { '0:field0': 1, '0:field1': 0, '0:field2': 1 }]])).propositions[0]
  const p = parcoursDeRemediation(base, prop)

  it('un exemple corrigé, les exercices proposés, puis l’exercice manqué', () => {
    expect(p.id).toBe('remediation-derivation-1re')
    expect(estParcours(p)).toBe(true)
    expect(p.titre).toBe('Retravailler : Signe de la dérivée')
    expect(p.etapes.map((e) => e.uuid)).toEqual(['etu', 'trinome', 'etu'])
    // Exemple corrigé : une question, sans réponse à saisir ; la reprise, elle, se vérifie
    expect(p.etapes[0]).toMatchObject({ interactif: false, nbQuestions: 1, titre: 'Exemple corrigé · Exercice etu' })
    expect(p.etapes[2].interactif).toBeUndefined()
    expect(p.etapes[2].titre).toBe('Exercice etu')
    expect(p.correction).toBe('question')
    // Remédiation qui suit une remédiation : même identifiant
    expect(parcoursDeRemediation(p, { ...prop, etape: 1 }).id).toBe(p.id)
  })

  // Étape 0 : exemple corrigé (correction vue) ; 1 : trinôme ; 2 : l'étude reprise
  function remediation(essais: [number, number, number][], profondeur = 1) {
    const s = seance(p, p.etapes.map((_, i) => i), essais)
    s.papier = { '0-0': true }
    s.remediation = { parcours: base.id, version: base.version, etape: 4, objectif: 'Signe de la dérivée', profondeur }
    return s
  }

  it('reprise réussie : rien ne suit', () => {
    const s = remediation([[1, 0, 1], [1, 1, 1], [2, 0, 1]])
    expect(rangReprise(s)).toBe(2)
    expect(repriseReussie(s)).toBe(true)
    expect(suiteDeRemediation(s)).toBeNull()
  })

  it('reprise manquée : le prérequis prévu par l’enseignant', () => {
    const s = remediation([[1, 0, 1], [1, 1, 0], [2, 0, 0]])
    expect(repriseReussie(s)).toBe(false)
    expect(suiteDeRemediation(s)).toMatchObject({ objectif: 'Signe d’un trinôme', origine: 'objectif' })
  })

  it('au plus PROFONDEUR_MAX remédiations', () => {
    const s = remediation([[1, 0, 0], [2, 0, 0]], PROFONDEUR_MAX)
    expect(suiteDeRemediation(s)).toBeNull()
  })

  it('la séance se sauvegarde', () => {
    const s = remediation([[1, 0, 1], [2, 0, 1]])
    const essai = { ...s.essais[0], detail: { '0:field0': 1 } }
    expect(cleInvalide({ [`seance:${p.id}`]: { ...s, essais: [essai] } })).toBeUndefined()
    expect(cleInvalide({ [`seance:${p.id}`]: { ...s, remediation: { ...s.remediation, profondeur: 0 } } })).toBe(`seance:${p.id}`)
  })
})

describe('positionnement', () => {
  const t = parcoursDePositionnement(base)!

  it('une question du premier exercice de chaque palier, sans titre', () => {
    expect(t.etapes.map((e) => e.uuid)).toEqual(['der1', 'der2', 'etu'])
    expect(t.etapes.every((e) => e.nbQuestions === 1)).toBe(true)
    expect(t.etapes.map((e) => e.titre)).toEqual(['Ceinture blanche', 'Ceinture jaune', 'Ceinture orange'])
    expect(t.correction).toBe('parcours')
    expect(estParcours(t)).toBe(true)
  })

  it('pas de test sans paliers', () => {
    expect(parcoursDePositionnement({ ...base, paliers: undefined })).toBeNull()
  })

  it('ouvre les paliers réussis d’affilée, jamais le dernier', () => {
    const s = (scores: number[]) => seance(t, [0, 1, 2], scores.map((x, k) => [k, 0, x]))
    expect(rangDePositionnement(s([1, 0, 1]))).toBe(1)
    expect(rangDePositionnement(s([0, 1, 1]))).toBe(0)
    expect(rangDePositionnement(s([1, 1, 1]))).toBe(2)
  })

  it('les paliers s’ouvrent sans ceinture obtenue', () => {
    const ouverts = ouvertsParPositionnement(base, { version: 2, rang: 2, le: '2026-11-06' })
    expect(ouverts).toEqual([true, true, false])
    const etats = etatsPaliers(base, {}, Date.now(), Date.now(), ouverts)
    expect(etats.map((x) => x.ouvert)).toEqual([true, true, true])
    // Autre version : le test ne vaut plus
    expect(ouvertsParPositionnement(base, { version: 1, rang: 2, le: '2026-11-06' })).toEqual([false, false, false])
  })

  it('se sauvegarde', () => {
    expect(cleInvalide({ positionnement: { [base.id]: { version: 2, rang: 1, le: 'x' } } })).toBeUndefined()
    expect(cleInvalide({ positionnement: { [base.id]: { version: 2, rang: -1, le: 'x' } } })).toBe('positionnement')
  })
})

describe('maîtrise par objectif', () => {
  it('chaque point compte pour ses objectifs', () => {
    const s = seance(base, [4], [[4, 0, 0, { '0:field0': 1, '0:field1': 0, '0:field2': 0.5 }]])
    expect(Object.fromEntries(scoresParObjectif(s, 4))).toEqual({
      Dériver: { points: 1, sur: 1 },
      'Signe de la dérivée': { points: 0, sur: 1 },
      Variations: { points: 0.5, sur: 1 },
    })
    const o = objectifsTravailles([s])
    expect(o.map((x) => [x.libelle, x.meilleur])).toEqual([
      ['Dériver', 100],
      ['Signe de la dérivée', 0],
      ['Variations', 50],
    ])
  })

  it('sans résultat par point : la question pour les objectifs de l’exercice', () => {
    const s = seance(base, [3], [[3, 0, 1]])
    expect(Object.fromEntries(scoresParObjectif(s, 3))).toEqual({ Variations: { points: 1, sur: 2 }, Dériver: { points: 1, sur: 2 } })
  })

  it('une remédiation ne compte pas', () => {
    const prop = remediationPour(base, 3, 'Dériver')!
    const p = parcoursDeRemediation(base, prop)
    const s = seance(p, [0], [[0, 0, 1], [0, 1, 1]])
    expect(objectifsTravailles([s])).toEqual([])
  })
})

describe('fichier du parcours', () => {
  it('accepte points, remédiations et positionnement', () => {
    expect(estParcours({ ...base, positionnement: true })).toBe(true)
  })
  it('refuse une clé de point inconnue, une remédiation imbriquée, un objectif en double', () => {
    expect(estParcours({ ...base, etapes: [{ ...etude, points: { 'a b': ['x'] } }] })).toBe(false)
    expect(estParcours({ ...base, etapes: [etape('a', [], { remediation: [etape('b', [], { remediation: [etape('c')] })] })] })).toBe(false)
    expect(estParcours({ ...base, remediations: [base.remediations![0], base.remediations![0]] })).toBe(false)
  })
})
