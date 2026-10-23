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
