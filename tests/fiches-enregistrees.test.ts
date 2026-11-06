// Onglet Fiches : toutes les fiches des parcours de l'élève par chapitre,
// et les siennes, enregistrées dans l'ordre qu'il choisit.
import { describe, expect, it } from 'vitest'
import { type Fiche, type Parcours } from '../src/lib/catalogue'
import { parcoursVide } from './parcours-de-test'
import { basculer, deplacer, estFichesEnregistrees, fichesDes, parChapitre } from '../src/lib/fiches'
import { fusionnerDonnees } from '../src/lib/fusion'
import { cleInvalide } from '../src/lib/sauvegarde'

const fiche = (titre: string): Fiche => ({ titre, blocs: [{ type: 'texte', texte: titre }] })
const etape = (uuid: string) => ({ uuid, id: uuid, titre: uuid, nbQuestions: 1 })
const P: Parcours = {
  ...parcoursVide(),
  id: 'p',
  titre: 'Relatifs',
  niveau: '5e',
  theme: 'Nombres relatifs',
  etapes: [etape('a'), etape('b')],
  paliers: [
    { titre: '', nb: 1, fiche: fiche('Additionner') },
    { titre: '', nb: 1, fiche: fiche('Soustraire') },
  ],
}
const Q: Parcours = { ...parcoursVide(), id: 'q', titre: 'Relatifs encore', niveau: '5e', theme: 'nombres relatifs', etapes: [etape('c')], fiche: fiche('Additionner') }
const R: Parcours = { ...parcoursVide(), id: 'r', titre: 'Fractions', niveau: '4e', theme: 'Fractions', etapes: [etape('d')], fiche: fiche('Simplifier') }

describe('fiches de l’élève', () => {
  it('chaque fiche une fois, par chapitre', () => {
    const fiches = fichesDes([P, Q, R, { ...parcoursVide(), id: 's', titre: 'Sans fiche', etapes: [etape('e')] }])
    expect(fiches.map((f) => `${f.cle} ${f.fiche.titre}`)).toEqual(['p#0 Additionner', 'p#1 Soustraire', 'r#0 Simplifier'])
    expect(parChapitre(fiches).map((c) => `${c.theme}: ${c.fiches.length}`)).toEqual(['Nombres relatifs: 2', 'Fractions: 1'])
  })

  it('enregistrer, réordonner, retirer', () => {
    const [a, b, c] = fichesDes([P, R])
    let liste = basculer(basculer(basculer([], a), b), c)
    liste = deplacer(liste, c.cle, -1)
    expect(liste.map((f) => f.cle)).toEqual(['p#0', 'r#0', 'p#1'])
    expect(deplacer(liste, 'p#0', -1)).toBe(liste) // déjà en haut
    liste = basculer(liste, a)
    expect(liste.map((f) => f.cle)).toEqual(['r#0', 'p#1'])
    expect(estFichesEnregistrees(liste)).toBe(true)
    expect(estFichesEnregistrees([...liste, liste[0]])).toBe(false)
  })

  it('dans la sauvegarde et la fusion : contrôlées, ordre de cet appareil puis celles de l’autre', () => {
    const [a, b, c] = fichesDes([P, R])
    const ici = { profil: 'eleve', 'fiches-enregistrees': [b, a] }
    const la = { profil: 'eleve', 'fiches-enregistrees': [c, a] }
    const { donnees } = fusionnerDonnees(ici, la)
    expect((donnees['fiches-enregistrees'] as { cle: string }[]).map((f) => f.cle)).toEqual(['p#1', 'p#0', 'r#0'])
    expect(cleInvalide(donnees)).toBeUndefined()
    expect(cleInvalide({ 'fiches-enregistrees': [{ cle: 'x' }] })).toBe('fiches-enregistrees')
  })
})

describe('onglet Fiches : recherche et parcours dépliables', () => {
  const fiches = fichesDes([P, Q, R])
  it('range les fiches d’un chapitre par parcours', async () => {
    const { parParcours } = await import('../src/lib/fiches')
    const [relatifs] = parChapitre(fiches)
    expect(parParcours(relatifs.fiches).map((g) => `${g.id} ${g.titre} ${g.fiches.length}`)).toEqual(['p Relatifs 2'])
  })
  it('cherche par début de mot, sans accents ni majuscules', async () => {
    const { chercherFiches } = await import('../src/lib/fiches')
    expect(chercherFiches(fiches, 'soustr').map((f) => f.fiche.titre)).toEqual(['Soustraire'])
    expect(chercherFiches(fiches, 'aire')).toEqual([])
    expect(chercherFiches(fiches, 'fractions simpl').map((f) => f.fiche.titre)).toEqual(['Simplifier'])
    expect(chercherFiches(fiches, 'RELATIFS').map((f) => f.cle)).toEqual(['p#0', 'p#1'])
    expect(chercherFiches(fiches, '  ')).toEqual([])
  })
})
