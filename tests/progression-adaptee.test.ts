import { describe, expect, it } from 'vitest'
import { nouvelleSeance } from '../src/lib/progression'
import type { Parcours } from '../src/lib/catalogue'
import { estParcours } from '../src/lib/validation'
import { acquis, banqueDuParcours, choisir, cleDe, niveauAtteint, parcoursAdapte, tentativesDe, type Banque, type ExerciceBanque, type Tentative } from '../src/lib/progressionAdaptee'

const ex = (uuid: string, objectif: string, niveau: number): ExerciceBanque => ({ etape: { uuid, titre: uuid, nbQuestions: 1 }, objectif, niveau })
const banque: Banque = {
  objectifs: [
    { libelle: 'Usuelle' },
    { libelle: 'Composée', prerequis: ['Usuelle'] },
    { libelle: 'Tableau' },
  ],
  exercices: [ex('u0', 'Usuelle', 0), ex('c0', 'Composée', 0), ex('c0b', 'Composée', 0), ex('c1', 'Composée', 1), ex('c2', 'Composée', 2), ex('t0', 'Tableau', 0)],
}
const essai = (cle: string, objectif: string, niveau: number, reussi: boolean, jour = '2026-11-06'): Tentative => ({ cle: `${cle}||||`, objectif, niveau, reussi, jour })
// Usuelle acquis (deux réussites un jour, une autre le lendemain)
const usuelle = [essai('u0', 'Usuelle', 0, true, '2026-11-04'), essai('u0', 'Usuelle', 0, true, '2026-11-04'), essai('u0', 'Usuelle', 0, true, '2026-11-05')]

describe('progression adaptée', () => {
  it('commence par le premier objectif, au plus bas niveau', () => {
    expect(choisir(banque, [], '2026-11-06')).toMatchObject({ raison: 'commencer', exercice: { objectif: 'Usuelle', niveau: 0 } })
  })

  it('un objectif s’ouvre quand ses prérequis sont acquis', () => {
    expect(acquis(banque, usuelle, 'Usuelle')).toBe(true)
    expect(choisir(banque, usuelle, '2026-11-06')).toMatchObject({ raison: 'commencer', exercice: { objectif: 'Composée', niveau: 0 } })
  })

  it('monte d’un niveau après deux réussites d’affilée, change d’exercice', () => {
    const t = [...usuelle, essai('c0', 'Composée', 0, true)]
    expect(choisir(banque, t, '2026-11-06')).toMatchObject({ raison: 'continuer', exercice: { etape: { uuid: 'c0b' } } })
    const t2 = [...t, essai('c0b', 'Composée', 0, true)]
    expect(niveauAtteint(t2, 'Composée')).toBe(0)
    expect(choisir(banque, t2, '2026-11-06')).toMatchObject({ raison: 'monter', exercice: { niveau: 1 } })
  })

  it('après un échec, un cran en dessous ; deux échecs au plus bas, le prérequis', () => {
    const t = [...usuelle, essai('c0', 'Composée', 0, true), essai('c0b', 'Composée', 0, true), essai('c1', 'Composée', 1, false)]
    expect(choisir(banque, t, '2026-11-06')).toMatchObject({ raison: 'consolider', exercice: { niveau: 0 } })
    const t2 = [...usuelle, essai('c0', 'Composée', 0, false), essai('c0b', 'Composée', 0, false)]
    expect(choisir(banque, t2, '2026-11-06')).toMatchObject({ raison: 'remedier', exercice: { objectif: 'Usuelle' } })
  })

  it('le plus haut niveau se confirme un autre jour ; en attendant, l’objectif suivant', () => {
    const haut = [essai('c2', 'Composée', 2, true), essai('c2', 'Composée', 2, true)]
    const t = [...usuelle, ...haut]
    expect(acquis(banque, t, 'Composée')).toBe(false)
    expect(choisir(banque, t, '2026-11-06')).toMatchObject({ exercice: { objectif: 'Tableau' }, raison: 'commencer' })
    expect(choisir(banque, t, '2026-11-07')).toMatchObject({ exercice: { objectif: 'Composée', niveau: 2 }, raison: 'confirmer' })
    const confirme = [...t, essai('c2', 'Composée', 2, true, '2026-11-07')]
    expect(acquis(banque, confirme, 'Composée')).toBe(true)
  })

  it('tout acquis : plus rien à proposer', () => {
    const tableau = [essai('t0', 'Tableau', 0, true, '2026-11-04'), essai('t0', 'Tableau', 0, true, '2026-11-04'), essai('t0', 'Tableau', 0, true, '2026-11-05')]
    const composee = [essai('c2', 'Composée', 2, true, '2026-11-04'), essai('c2', 'Composée', 2, true, '2026-11-04'), essai('c2', 'Composée', 2, true, '2026-11-05')]
    expect(choisir(banque, [...usuelle, ...composee, ...tableau], '2026-11-06')).toBeNull()
    expect(cleDe(banque.exercices[0])).toBe('u0||||')
  })

  it('une banque se déduit d’un parcours à ceintures', () => {
    const b = banqueDuParcours({
      id: 'p', version: 1, titre: 'P', objectif: '', niveau: 'Terminale', theme: 'D', difficulte: 2, icone: 'x',
      presentation: 'une_question_par_page', correction: 'question', style: 'ceintures',
      paliers: [{ titre: '', nb: 1 }, { titre: '', nb: 1 }],
      etapes: [
        { uuid: 'a', titre: 'a', objectifs: ['Usuelle'] },
        { uuid: 'b', titre: 'b', objectifs: ['Composée'], points: { 1: ['Tableau'] } },
      ],
      remediations: [{ objectif: 'Composée', etapes: [], prerequis: ['Usuelle', 'Inconnu'] }],
    })
    expect(b.objectifs).toEqual([{ libelle: 'Usuelle', prerequis: [] }, { libelle: 'Composée', prerequis: ['Usuelle'] }, { libelle: 'Tableau', prerequis: [] }])
    expect(b.exercices.map((e) => `${e.etape.uuid}:${e.objectif}:${e.niveau}`)).toEqual(['a:Usuelle:0', 'b:Composée:1', 'b:Tableau:1'])
  })

  it('tentatives : passages des paliers et exercices de la progression adaptée', () => {
    const p: Parcours = {
      id: 'p', version: 1, titre: 'P', objectif: '', niveau: 'Terminale', theme: 'D', difficulte: 2, icone: 'x',
      presentation: 'une_question_par_page', correction: 'question', style: 'ceintures', adaptatif: true,
      paliers: [{ titre: '', nb: 1 }, { titre: '', nb: 1 }],
      etapes: [
        { uuid: 'a', titre: 'a', nbQuestions: 2, objectifs: ['Usuelle'] },
        { uuid: 'b', titre: 'b', nbQuestions: 1, objectifs: ['Composée', 'Tableau'], points: { 0: ['Composée'], 1: ['Tableau'] } },
      ],
    }
    expect(estParcours(p)).toBe(true)
    const essai = (etape: number, question: number, score: number, detail?: Record<string, number>) => ({ etape, question, juste: score === 1, points: score, total: 1, reponses: {}, le: 'x', ...(detail ? { detail } : {}) })
    // Palier 2 joué : composée juste, tableau faux
    const s1 = nouvelleSeance(p, 'm', 'complet', [1])
    s1.nbQuestions = { 1: 1 }
    s1.essais = [essai(1, 0, 0.5, { '0': 1, '1': 0 })]
    s1.fin = '2026-11-05T10:00:00Z'
    // Exercice proposé par la progression adaptée
    const choix = choisir(banqueDuParcours(p), tentativesDe(p, [s1]), '2026-11-06')!
    expect(choix).toMatchObject({ exercice: { objectif: 'Usuelle' }, raison: 'commencer' })
    const q = parcoursAdapte(p, choix)
    expect(q.id).toBe('adapte-p')
    expect(q.etapes).toHaveLength(1)
    expect(q.etapes[0].nbQuestions).toBe(2)
    const s2 = nouvelleSeance(q, 'm', 'complet')
    s2.adapte = { parcours: 'p', objectif: 'Usuelle', niveau: 0, raison: 'commencer' }
    s2.nbQuestions = { 0: 2 }
    s2.essais = [essai(0, 0, 1), essai(0, 1, 1)]
    s2.fin = '2026-11-06T10:00:00Z'
    expect(tentativesDe(p, [s2, s1]).map((x) => `${x.objectif}:${x.niveau}:${x.reussi}:${x.jour}`)).toEqual([
      'Composée:1:true:2026-11-05',
      'Tableau:1:false:2026-11-05',
      'Usuelle:0:true:2026-11-06',
    ])
  })
})
