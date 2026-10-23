import { describe, expect, it } from 'vitest'
import { trouDansLatex } from '../src/lib/moteur'

describe('trouDansLatex', () => {
  it('lit le trou, sans ce qui suit (unité, exposant)', () => {
    expect(trouDansLatex('\\placeholder[champ1]{6}\\text{ cm}^2', 'champ1')).toBe('6')
  })
  it('garde les accolades imbriquées du trou', () => {
    expect(trouDansLatex('A=\\placeholder[champ1]{\\frac{3}{4}}\\text{ m}', 'champ1')).toBe('\\frac{3}{4}')
  })
  it('passe les options du trou et les accolades échappées', () => {
    expect(trouDansLatex('\\placeholder[champ1][correct]{\\{1;2\\}}x', 'champ1')).toBe('\\{1;2\\}')
  })
  it('trou absent ou vide', () => {
    expect(trouDansLatex('\\placeholder[champ1]{}\\text{ cm}', 'champ1')).toBe('')
    expect(trouDansLatex('12', 'champ1')).toBe('')
    expect(trouDansLatex('\\placeholder[champ2]{5}', 'champ1')).toBe('')
  })
})

import { resultatNormalise } from '../src/lib/moteur'
describe('resultatNormalise', () => {
  const base = { retour: '', reponses: {} }
  it('points absents : total si juste, 0 sinon', () => {
    expect(resultatNormalise({ ...base, juste: true, points: null as unknown as number, total: 1 }).points).toBe(1)
    expect(resultatNormalise({ ...base, juste: false, points: null as unknown as number, total: 2 }).points).toBe(0)
    expect(resultatNormalise({ ...base, juste: true, points: NaN, total: NaN })).toMatchObject({ points: 1, total: 0 })
  })
  it('résultat ordinaire inchangé', () => {
    expect(resultatNormalise({ ...base, juste: false, points: 1, total: 3 })).toMatchObject({ points: 1, total: 3 })
  })
})

import { preparerSansPlantage } from '../src/lib/moteur'
import type { ExercicePrepare, ParamsExercice } from '../src/lib/moteur'
describe('preparerSansPlantage', () => {
  const faux = (plantages: (string | undefined)[]) => {
    const vus: (string | undefined)[] = []
    const preparer = async (p: ParamsExercice) => {
      vus.push(p.alea)
      if (plantages.includes(p.alea) || plantages.includes('*')) throw new Error(`plante ${p.alea}`)
      return { graine: p.alea ?? 'tiree' } as ExercicePrepare
    }
    return { vus, preparer }
  }
  it('graine qui plante : graines dérivées, les mêmes à chaque fois', async () => {
    const { vus, preparer } = faux(['g', 'g~1'])
    expect((await preparerSansPlantage(preparer, { uuid: 'x', alea: 'g' })).graine).toBe('g~2')
    expect(vus).toEqual(['g', 'g~1', 'g~2'])
  })
  it('sans plantage : un seul essai, graine inchangée', async () => {
    const { vus, preparer } = faux([])
    expect((await preparerSansPlantage(preparer, { uuid: 'x', alea: 'g' })).graine).toBe('g')
    expect(vus).toEqual(['g'])
  })
  it('sans graine : nouveaux tirages', async () => {
    const { vus, preparer } = faux([])
    await preparerSansPlantage(preparer, { uuid: 'x' })
    expect(vus).toEqual([undefined])
  })
  it('plante toujours : première erreur', async () => {
    const { vus, preparer } = faux(['*'])
    await expect(preparerSansPlantage(preparer, { uuid: 'x', alea: 'g' })).rejects.toThrow('plante g')
    expect(vus).toHaveLength(4)
  })
})
