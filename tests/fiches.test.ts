import { describe, expect, it } from 'vitest'
import { compiler, integrale } from '../src/lib/expression'
import { texteRiche, titreRiche } from '../src/lib/texteRiche'

const valeur = (texte: string, x: number, autres: Record<string, number> = {}) => compiler(texte, ['x', ...Object.keys(autres)])!({ x, ...autres })

describe('Expressions des graphiques', () => {
  it('calcule comme en mathématiques', () => {
    expect(valeur('x^2/4+1/2', 2)).toBe(1.5)
    expect(valeur('2x+1', 3)).toBe(7)
    expect(valeur('-x^2', 3)).toBe(-9)
    expect(valeur('2^3^2', 0)).toBe(512)
    expect(valeur('3(x+1)', 1)).toBe(6)
    expect(valeur('2e^(-x)', 0)).toBe(2)
    expect(valeur('sqrt(x)+ln(e)', 4)).toBe(3)
    expect(valeur('x sin(x)', Math.PI / 2)).toBeCloseTo(Math.PI / 2)
    expect(valeur('2pi', 0)).toBeCloseTo(2 * Math.PI)
    expect(valeur('a*cos x', 0, { a: 3 })).toBe(3)
  })

  it('refuse une expression mal écrite ou une variable inconnue', () => {
    for (const t of ['', 'x+', '(x', 'x)', '2*/x', 'y+1', 'alert(1)', 'x;1']) expect(compiler(t), t).toBeNull()
  })

  it('intègre par la méthode de Simpson', () => {
    expect(integrale((x) => 3 * x * x, 0, 2)).toBeCloseTo(8, 10)
    expect(integrale(Math.cos, 0, Math.PI / 2)).toBeCloseTo(1, 8)
  })
})

describe('Texte des fiches', () => {
  const rendu = (latex: string, centree: boolean) => `[${centree ? 'C' : 'L'}:${latex}]`

  it('paragraphes, listes, gras, italique', () => {
    expect(texteRiche('Un **mot** et *un autre*.\n\nSuite')).toBe('<p>Un <strong>mot</strong> et <em>un autre</em>.</p><p>Suite</p>')
    expect(texteRiche('- un\n- deux')).toBe('<ul><li>un</li><li>deux</li></ul>')
    expect(texteRiche('- un :\n$$x$$\n- deux', rendu)).toBe('<ul><li>un :<span class="formule-centree">[C:x]</span></li><li>deux</li></ul>')
  })

  it('formules dans la ligne et centrées, sans toucher à leur contenu', () => {
    expect(texteRiche('Si $a*b$ alors\n$$\\int_a^b f(x)\\,dx$$', rendu)).toBe('<p>Si [L:a*b] alors<span class="formule-centree">[C:\\int_a^b f(x)\\,dx]</span></p>')
  })

  it('titres : formules entre $, le reste échappé', () => {
    expect(titreRiche('Forme $f(ax+b)$ <b>', rendu)).toBe('Forme [L:f(ax+b)] &lt;b&gt;')
  })

  it('échappe le HTML', () => {
    expect(texteRiche('<img src=x onerror=alert(1)> & "')).toBe('<p>&lt;img src=x onerror=alert(1)&gt; &amp; &quot;</p>')
  })
})

describe('Fiches dans les fichiers', async () => {
  const { estFiche } = await import('../src/lib/validation')
  const { ficheDe } = await import('../src/lib/catalogue')
  const { parcoursVide } = await import('../src/lib/bibliotheque')
  const graphique = { type: 'graphique', fonctions: ['a*x^2'], x: [0, 4], y: [0, 5], aire: { de: 0, a: 'b' }, curseurs: { a: [0, 2, 1], b: [0, 4, 3, 0.5] } }
  const fiche = (...blocs: unknown[]) => ({ titre: 'Fiche', avant: true, blocs })

  it('accepte chaque type de bloc bien formé', () => {
    expect(
      estFiche(
        fiche(
          { type: 'texte', texte: 'Un $x$' },
          { type: 'retenir', texte: '$$x$$' },
          { type: 'exemple', enonce: 'E', etapes: ['a', 'b'] },
          { type: 'question', enonce: 'Q', choix: ['1', '2'], bonne: 1, explication: 'X' },
          { type: 'question', enonce: 'Q', reponse: -7, explication: 'X' },
          graphique,
          { type: 'image', src: 'data:image/svg+xml;base64,PHN2Zy8+', alt: 'Figure' },
          { type: 'lien', titre: 'Cours', lien: 'https://exemple.ch/cours.pdf' },
        ),
      ),
    ).toBe(true)
  })

  it('refuse un bloc mal formé', () => {
    for (const bloc of [
      { type: 'video', lien: 'https://x' },
      { type: 'question', enonce: 'Q', choix: ['1', '2'], bonne: 2, explication: 'X' },
      { type: 'question', enonce: 'Q', explication: 'X' },
      { ...graphique, fonctions: ['y^2'] },
      { ...graphique, aire: { de: 0, a: 'c' } },
      { ...graphique, curseurs: { x: [0, 1, 0] } },
      { ...graphique, x: [4, 0] },
      { type: 'image', src: 'https://exemple.ch/image.png', alt: '' },
      { type: 'lien', titre: 'Cours', lien: 'javascript:alert(1)' },
    ])
      expect(estFiche(fiche(bloc)), JSON.stringify(bloc)).toBe(false)
  })

  it('trouve la fiche d’un palier, celle du parcours pour le premier', () => {
    const f1 = fiche({ type: 'texte', texte: '1' }) as never
    const f2 = fiche({ type: 'texte', texte: '2' }) as never
    const etape = { uuid: 'u', titre: 't' }
    const p = { ...parcoursVide(), id: 'p', fiche: f1, etapes: [etape, etape, etape], paliers: [{ titre: 'A', nb: 1 }, { titre: 'B', nb: 2, fiche: f2 }] }
    expect(ficheDe(p, [0])).toEqual({ fiche: f1, cle: 'p#0' })
    expect(ficheDe(p, [1, 2])).toEqual({ fiche: f2, cle: 'p#1' })
    expect(ficheDe({ ...p, paliers: undefined })).toEqual({ fiche: f1, cle: 'p#0' })
  })
})
