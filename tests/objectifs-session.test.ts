import { describe, expect, it } from 'vitest'
import type { Parcours } from '../src/lib/catalogue'
import { objectifsDeLaSession } from '../src/lib/objectifsSession'
import { estReleves, type ReponsesSession, type VerdictQuestion } from '../src/lib/releve'

const p: Parcours = {
  id: 'etude',
  version: 1,
  titre: 'Étude',
  objectif: '',
  niveau: 'Terminale',
  theme: 'Dérivation',
  difficulte: 2,
  icone: 'bx-line-chart',
  presentation: 'une_question_par_page',
  correction: 'question',
  etapes: [
    { uuid: 'a', titre: 'Dériver', nbQuestions: 1, objectifs: ['Dériver'] },
    { uuid: 'b', titre: 'Étudier', nbQuestions: 1, objectifs: ['Dériver', 'Variations'], points: { 0: ['Dériver'], 1: ['Variations'] } },
  ],
}

const eleve = (d: string): ReponsesSession => ({ c: 'code', p: 'etude', v: 1, t: 'Étude', d, x: {}, r: { '0-0': { x: '1' }, '1-0': { y: '2' } } })
const ordre = ['0-0', '1-0']

describe('objectifs d’une session', () => {
  it('chaque point compte pour ses objectifs ; le premier manqué dit par où commencer', () => {
    const verdicts: Record<string, Record<string, VerdictQuestion>> = {
      // Dérivée juste, tableau faux
      A: { '0-0': { juste: true, score: 1 }, '1-0': { juste: false, score: 0.5, detail: { '0': 1, '1': 0 } } },
      // Tout faux : le premier point manqué est la dérivée de l'exercice 1
      B: { '0-0': { juste: false, score: 0 }, '1-0': { juste: false, score: 0, detail: { '0': 0, '1': 0 } } },
    }
    const o = objectifsDeLaSession(p, ordre, [eleve('A'), eleve('B')], verdicts)
    expect(o).toEqual([
      { libelle: 'Variations', reussite: 0, eleves: 2, premier: 1 },
      { libelle: 'Dériver', reussite: 50, eleves: 2, premier: 1 },
    ])
  })

  it('sans détail par point : la question pour les objectifs de l’exercice ; question d’un autre tirage ignorée', () => {
    const verdicts = { A: { '0-0': { juste: true, score: 1 }, '1-0': { juste: false, score: 0 } } }
    const o = objectifsDeLaSession(p, ordre, [eleve('A')], verdicts, (_, cle) => cle === '0-0')
    expect(o).toEqual([
      { libelle: 'Dériver', reussite: 0, eleves: 1, premier: 1 },
      { libelle: 'Variations', reussite: 0, eleves: 1, premier: 1 },
    ])
  })

  it('réponses enchaînées : le tableau manqué après la dérivée manquée ne compte pas', () => {
    const q: Parcours = { ...p, etapes: p.etapes.map((e, i) => (i === 1 ? { ...e, enchainees: true } : e)) }
    const verdicts = { B: { '0-0': { juste: true, score: 1 }, '1-0': { juste: false, score: 0, detail: { '0': 0, '1': 0 } } } }
    expect(objectifsDeLaSession(q, ordre, [eleve('B')], verdicts)).toEqual([{ libelle: 'Dériver', reussite: 50, eleves: 1, premier: 1 }])
  })

  it('les verdicts avec détail se sauvegardent', () => {
    const releve = {
      cle: 'code|etude|1',
      code: 'code',
      parcours: 'etude',
      version: 1,
      titre: 'Étude',
      le: 'x',
      recues: [eleve('A')],
      calcul: { moteur: 'm', verdicts: { A: { '1-0': { juste: false, score: 0.5, detail: { '0': 1, '1': 0 } } } }, hors: {} },
    }
    expect(estReleves([releve])).toBe(true)
    expect(estReleves([{ ...releve, calcul: { ...releve.calcul, verdicts: { A: { '1-0': { juste: false, score: 0.5, detail: { '0': 'oui' } } } } } }])).toBe(false)
  })
})
