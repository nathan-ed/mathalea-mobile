import { describe, expect, it } from 'vitest'
import { elementsDeQuestion, type ExercicePrepare } from '../src/lib/moteur'

const exercice = (enonces: string[], formats: (string | null)[]): ExercicePrepare => ({
  uuid: 'x',
  titre: '',
  graine: 'g',
  numero: 3,
  questions: enonces.map((enonce) => ({ contexte: '', enonce, correction: '', interactive: true })),
  interne: { autoCorrection: formats.map((f) => (f ? { formatInteractif: f } : undefined)) },
})

describe('elementsDeQuestion', () => {
  it('question ordinaire : son seul élément', () => {
    const ex = exercice(['<math-field id="champTexteEx3Q0"></math-field>', '<math-field id="champTexteEx3Q1"></math-field>'], ['mathlive', 'mathlive'])
    expect(elementsDeQuestion(ex, 1)).toEqual([1])
  })
  it('plusieurs champs dans une question (6N3M, CM2N1D-2)', () => {
    const ex = exercice(['a', '<math-field id="champTexteEx3Q2"></math-field><math-field id="champTexteEx3Q3"></math-field>'], ['mathlive', 'mathlive', 'mathlive', 'mathlive'])
    expect(elementsDeQuestion(ex, 1)).toEqual([2, 3])
  })
  it('deux QCM dans une question (6AutoA1)', () => {
    const ex = exercice(['', '<input type="checkbox" id="checkEx3Q2R0"><input type="checkbox" id="checkEx3Q3R1">'], ['qcm', 'qcm', 'qcm', 'qcm'])
    expect(elementsDeQuestion(ex, 1)).toEqual([2, 3])
  })
  it('élément de MathALÉA, champ dans une figure', () => {
    const ex = exercice(['', '<mathalea-mathfield id="mathalea-mathfieldEx3Q1" mathfield-id="champTexteEx3Q1"></mathalea-mathfield><math-field id="MetaInteractif2dEx3Q2field0"></math-field>'], ['mathalea-mathfield', 'mathalea-mathfield', 'MetaInteractif2d'])
    expect(elementsDeQuestion(ex, 1)).toEqual([1, 2])
  })
  it("figure ou tableau gardant la numérotation d'un autre exercice (Automatismes) : ignorés", () => {
    const enonce = '<div id="M2DpenteAffineEx3Q0"><svg id="penteAffineEx3Q0"></svg></div><tableau-mathlive id="tableau-mathliveEx3Q0"></tableau-mathlive><mathalea-qcm id="mathalea-qcmEx3Q4"></mathalea-qcm><input type="radio" id="checkEx3Q4R0">'
    const ex = exercice(['', '', '', '', enonce], ['mathalea-qcm', null, null, null, 'mathalea-qcm'])
    expect(elementsDeQuestion(ex, 4)).toEqual([4])
  })
  it('rien de reconnu : la question de même rang', () => {
    const ex = exercice(['<div id="cliquefigure0Ex3Q0"></div>'], ['cliqueFigure'])
    expect(elementsDeQuestion(ex, 0)).toEqual([0])
  })
})
