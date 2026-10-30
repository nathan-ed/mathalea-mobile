import { describe, expect, it } from 'vitest'
import { parcoursVide } from '../src/lib/bibliotheque'
import type { Parcours } from '../src/lib/catalogue'
import { arborescence, reperesDu, reperesParDefaut } from '../src/lib/explorer'
import type { ExerciceDuReferentiel } from '../src/lib/moteur'

const ex = (niveau: string, libelle: string, theme: string): ExerciceDuReferentiel => ({
  uuid: `${niveau}-${theme}`,
  id: '',
  titre: '',
  niveau,
  theme,
  interactif: true,
  chemin: [{ code: niveau, titre: libelle, sousTheme: false }],
})
const parcours = (id: string, niveau: string, theme: string, difficulte: 1 | 2 | 3 = 1): Parcours => ({
  ...parcoursVide(),
  id,
  titre: id,
  niveau,
  theme,
  difficulte,
})

// Extrait des référentiels, dans l'ordre du menu du site
const CH = reperesDu([
  ex('11e', '11e', 'Fonctions'),
  ex('4e Collège', '4e Collège', 'Analyse'),
  ex('4e Collège', '4e Collège', 'Intégration'),
  ex('4e Collège', '4e Collège', 'Probabilités et statistiques'),
  ex('Non classés', 'Non classés', 'Exercices divers'),
])
const FR = reperesDu([ex('6e', 'Sixième', 'Nombres entiers'), ex('1e', 'Première', 'Suites'), ex('Terminale', 'Terminale', 'Intégration')])

describe('Explorer : degrés et chapitres du référentiel', () => {
  it('lit degrés, libellés et chapitres dans l’ordre du site', () => {
    expect(CH.map((r) => r.noms[0])).toEqual(['11e', '4e Collège', 'Non classés'])
    expect(CH[1].chapitres).toEqual(['Analyse', 'Intégration', 'Probabilités et statistiques'])
    expect(FR[1].noms).toEqual(['1e', 'Première'])
  })

  it('garde les parcours du pays choisi, deviné par le niveau', () => {
    const tous = [parcours('integrales', '4e Collège', 'Intégration'), parcours('suites', '1re', 'Suites'), parcours('fractions', '6e', 'Fractions')]
    expect(arborescence(tous, 'CH', CH).flatMap((n) => n.chapitres.flatMap((c) => c.parcours.map((p) => p.id)))).toEqual(['integrales'])
    expect(arborescence(tous, 'FR', FR).flatMap((n) => n.chapitres.flatMap((c) => c.parcours.map((p) => p.id)))).toEqual(['fractions', 'suites'])
  })

  it('ne montre que les degrés et chapitres qui ont des parcours, dans l’ordre du référentiel', () => {
    const tous = [
      parcours('probas', '4e Collège', 'Probabilités et statistiques'),
      parcours('integrales-plus', '4e Collège', 'Intégration', 3),
      parcours('fonctions', '11e', 'Fonctions'),
      parcours('integrales', '4e Collège', 'Intégration', 2),
    ]
    const a = arborescence(tous, 'CH', CH)
    expect(a.map((n) => n.niveau)).toEqual(['11e', '4e Collège'])
    expect(a[1].chapitres.map((c) => c.theme)).toEqual(['Intégration', 'Probabilités et statistiques'])
    expect(a[1].chapitres[0].parcours.map((p) => p.id)).toEqual(['integrales', 'integrales-plus'])
  })

  it('range après les autres, dans l’ordre du fichier, ce que le référentiel ne connaît pas', () => {
    const tous = [parcours('b', '4e Collège', 'Chapitre B'), parcours('a', '4e Collège', 'Chapitre A'), parcours('i', '4e Collège', 'Intégration')]
    expect(arborescence(tous, 'CH', CH)[0].chapitres.map((c) => c.theme)).toEqual(['Intégration', 'Chapitre B', 'Chapitre A'])
  })

  it('range le Préqualifiant en Suisse, après la 11e', () => {
    const tous = [parcours('integrales', '4e Collège', 'Intégration'), parcours('prq', 'Préqualifiant', 'Nombres'), parcours('evacom', '11e', 'EVACOM TAF')]
    expect(arborescence(tous, 'CH', CH).map((n) => n.niveau)).toEqual(['11e', 'Préqualifiant', '4e Collège'])
    expect(arborescence(tous, 'FR', FR)).toEqual([])
  })

  it('réunit un degré écrit avec son code ou son libellé', () => {
    const a = arborescence([parcours('x', '1re', 'Suites'), parcours('y', 'Première', 'Suites')], 'FR', FR)
    expect(a).toHaveLength(1)
    expect(a[0].chapitres[0].parcours).toHaveLength(2)
  })

  it('fonctionne sans moteur avec les niveaux de l’éditeur', () => {
    const a = arborescence([parcours('t', 'Terminale', 'Intégration'), parcours('s', '6e', 'Fractions')], 'FR', reperesParDefaut('FR'))
    expect(a.map((n) => n.niveau)).toEqual(['6e', 'Terminale'])
  })
})
