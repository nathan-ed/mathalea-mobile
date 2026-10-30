// Petites fonctions dont dépendent des écrans entiers : noms de ceintures,
// titres vus par l'élève, lien MathALÉA collé dans l'éditeur, codes de
// session, réponses relevées, fichiers partagés.
import { describe, expect, it } from 'vitest'
import { couleurCeinture, iconeProposee, nomPalier, organisationDe, titreEleve, CEINTURES, type Parcours } from '../src/lib/catalogue'
import { etapesDepuisLienMathalea } from '../src/lib/bibliotheque'
import { depuisBase64, normaliserReponse, texteReponse, versBase64 } from '../src/lib/releve'
import { etapesAAmeliorer, graineDeSession, normaliserCode } from '../src/lib/progression'
import { ceintureDu, couleurDu, estTest } from '../src/lib/testNiveau'
import { classesDuFichier, parcoursUniques } from '../src/lib/validation'
import { catalogue } from './parcours-de-test'

const base = catalogue[0]
const avecPaliers = (style: Parcours['style'], n: number, premiereCeinture?: number): Parcours => ({
  ...base,
  style,
  premiereCeinture,
  etapes: Array.from({ length: n }, (_, i) => ({ ...base.etapes[0], titre: `E${i}` })),
  paliers: Array.from({ length: n }, (_, k) => ({ titre: `P${k}`, nb: 1 })),
})

describe('ceintures et paliers', () => {
  it('nomme les paliers et les ceintures, au-delà de la noire en dan', () => {
    expect(nomPalier({}, 0)).toBe('Palier 1')
    expect(nomPalier({ style: 'paliers' }, 2)).toBe('Palier 3')
    expect(nomPalier({ style: 'ceintures' }, 0)).toBe('Ceinture blanche')
    expect(nomPalier({ style: 'ceintures', premiereCeinture: 2 }, 0)).toBe('Ceinture orange')
    expect(nomPalier({ style: 'ceintures' }, 6)).toBe('Ceinture noire')
    expect(nomPalier({ style: 'ceintures' }, 7)).toBe('Ceinture noire, 2e dan')
    expect(nomPalier({ style: 'ceintures' }, 8)).toBe('Ceinture noire, 3e dan')
  })

  it('les noms du test de niveau suivent ceux des parcours', () => {
    for (let r = 0; r < 10; r++) expect(ceintureDu(r)).toBe(nomPalier({ style: 'ceintures' }, r))
  })

  it('couleur : celle de la ceinture, la noire au-delà', () => {
    expect(couleurCeinture({ style: 'ceintures' }, 0)).toBe(CEINTURES[0].couleur)
    expect(couleurCeinture({ style: 'ceintures', premiereCeinture: 1 }, 0)).toBe(CEINTURES[1].couleur)
    expect(couleurCeinture({ style: 'ceintures' }, 12)).toBe(CEINTURES[6].couleur)
    expect(couleurDu(99)).toBe(CEINTURES[6].couleur)
  })

  it('résume l’organisation d’un parcours', () => {
    expect(organisationDe({ ...base, paliers: undefined })).toBe('')
    expect(organisationDe(avecPaliers('paliers', 3))).toBe('3 paliers')
    expect(organisationDe(avecPaliers('ceintures', 3))).toBe('Ceintures blanche à orange')
    expect(organisationDe(avecPaliers('ceintures', 8))).toBe('Ceintures blanche à noire, 2e dan')
    expect(organisationDe(avecPaliers('ceintures', 2, 3))).toBe('Ceintures verte à bleue')
  })

  it('paliers mal comptés : un seul bloc, aucun nom de ceinture', () => {
    const p = avecPaliers('ceintures', 3)
    expect(organisationDe({ ...p, paliers: [{ titre: 'A', nb: 1 }, { titre: 'B', nb: 5 }] })).toBe('')
  })
})

describe('titres vus par l’élève', () => {
  const e = { uuid: 'abcde', nbQuestions: 1, titre: 'Calculer $\\frac{a}{b}$ et $x^2$' }
  it('enlève les dollars, garde la formule', () => {
    expect(titreEleve(e, 0)).toBe('Calculer \\frac{a}{b} et x^2')
  })
  it('titre masqué : « Exercice n »', () => {
    expect(titreEleve({ ...e, titreMasque: true }, 2)).toBe('Exercice 3')
  })
})

describe('icône proposée d’après le chapitre', () => {
  it('reconnaît un chapitre, accents et majuscules compris', () => {
    expect(iconeProposee('')).toBe('bx-book-content')
    expect(iconeProposee('Chapitre sans rapport xyz')).toBe('bx-book-content')
    expect(iconeProposee('Fractions')).toBe(iconeProposee('FRACTIONS'))
    expect(iconeProposee('Géométrie')).toBe('bx-shape-triangle')
    expect(iconeProposee('Probabilités')).toBe('bx-dice-5')
    expect(iconeProposee('Équations')).toBe('bx-math')
  })
})

describe('lien MathALÉA collé dans l’éditeur', () => {
  it('lit chaque exercice et ses réglages, dans l’ordre', () => {
    const lien = 'https://coopmaths.fr/alea/?uuid=cbc26&id=5N2G&n=4&s=2&s2=true&uuid=0a2b3&id=4C10&s3=1-3&s4=false&v=eleve&alea=AbCd'
    expect(etapesDepuisLienMathalea(lien)).toEqual([
      { uuid: 'cbc26', id: '5N2G', nbQuestions: 4, sup: '2', sup2: 'true' },
      { uuid: '0a2b3', id: '4C10', sup3: '1-3', sup4: 'false' },
    ])
  })
  it('ignore ce qui précède le premier exercice et les nombres de questions invalides', () => {
    expect(etapesDepuisLienMathalea('https://coopmaths.fr/alea/?n=3&s=1&uuid=abcde&n=0')).toEqual([{ uuid: 'abcde' }])
    expect(etapesDepuisLienMathalea('https://coopmaths.fr/alea/?v=eleve')).toEqual([])
  })
  it('lève une erreur sur un texte qui n’est pas une adresse', () => {
    expect(() => etapesDepuisLienMathalea('pas un lien')).toThrow()
  })
})

describe('codes de session', () => {
  it('majuscules et espaces ne comptent pas', () => {
    expect(normaliserCode(' 1K3 LR ')).toBe('1k3lr')
    expect(graineDeSession(' 1K3LR', base, 2)).toBe(graineDeSession('1k3lr', base, 2))
  })
  it('la graine change avec la version du parcours et l’étape', () => {
    expect(graineDeSession('abcde', base, 0)).not.toBe(graineDeSession('abcde', base, 1))
    expect(graineDeSession('abcde', base, 0)).not.toBe(graineDeSession('abcde', { ...base, version: base.version + 1 }, 0))
  })
})

describe('réponses relevées', () => {
  it('base64 pour URL : aller-retour sur tous les octets', () => {
    const o = Uint8Array.from({ length: 256 }, (_, i) => i)
    const t = versBase64(o)
    expect(t).not.toMatch(/[+/=]/)
    expect([...depuisBase64(t)]).toEqual([...o])
  })
  it('réponse normalisée : espaces, virgule de MathLive, point décimal', () => {
    expect(normaliserReponse(' 3{,}5 ')).toBe('3,5')
    expect(normaliserReponse('3.5')).toBe('3,5')
    expect(normaliserReponse('1 000')).toBe('1000')
  })
  it('champs dans l’ordre numérique, vides et lignes multiples ignorés', () => {
    expect(texteReponse({ champ10: 'c', champ2: ' b ', champ1: 'a', champ3: '  ', 'possible-multi-lines-answer': 'x' })).toBe('a ; b ; c')
  })
})

describe('étapes à améliorer', () => {
  const p = { ...base, etapes: [base.etapes[0], base.etapes[0], base.etapes[0]] }
  it('garde les étapes incomplètes ou imparfaites, pas celles jamais faites', () => {
    expect(
      etapesAAmeliorer(p, {
        0: { points: 3, sur: 3, complet: true, le: '' },
        1: { points: 2, sur: 3, complet: true, le: '' },
      } as never),
    ).toEqual([1])
    expect(etapesAAmeliorer(p, { 2: { points: 0, sur: 0, complet: false, le: '' } } as never)).toEqual([2])
  })
})

describe('tests de niveau', () => {
  it('reconnaît leur identifiant', () => {
    expect(estTest(undefined)).toBe(false)
    expect(estTest(base.id)).toBe(false)
    expect(estTest('test-niveau-6e')).toBe(true)
  })
})

describe('fichiers partagés', () => {
  it('refuse deux parcours de même identifiant', () => {
    expect(parcoursUniques([base, { ...base, titre: 'Autre' }])).toBe(false)
    expect(parcoursUniques([base])).toBe(true)
  })
  it('refuse deux classes de même nom, ou un parcours deux fois dans une classe', () => {
    expect(classesDuFichier([{ nom: 'A', parcours: [base] }, { nom: 'B', parcours: [base] }])).toBe(true)
    expect(classesDuFichier([{ nom: 'A', parcours: [] }, { nom: 'A', parcours: [] }])).toBe(false)
    expect(classesDuFichier([{ nom: 'A', parcours: [base, base] }])).toBe(false)
  })
})
