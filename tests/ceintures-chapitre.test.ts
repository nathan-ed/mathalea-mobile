// Ceintures par chapitre : plusieurs parcours d'un même chapitre du référentiel
// donnent les mêmes ceintures ; une ceinture du chapitre est obtenue dès
// qu'un de ses parcours l'a donnée.
import { describe, expect, it } from 'vitest'
import { type Parcours } from '../src/lib/catalogue'
import { parcoursVide } from '../src/lib/bibliotheque'
import { ceinturesParChapitre } from '../src/lib/objectifs'
import { nouvelleSeance, type Seance } from '../src/lib/progression'

const etape = (uuid: string) => ({ uuid, id: uuid, titre: uuid, nbQuestions: 2 })

/** Parcours en ceintures, un exercice par ceinture, à partir de `premiere` (0 : blanche) */
const enCeintures = (id: string, nb: number, premiere = 0, chapitre: Partial<Parcours> = {}): Parcours => ({
  ...parcoursVide(),
  id,
  titre: id,
  niveau: '5e',
  theme: 'Nombres relatifs',
  style: 'ceintures',
  premiereCeinture: premiere,
  etapes: Array.from({ length: nb }, (_, k) => etape(`${id}${k}`)),
  paliers: Array.from({ length: nb }, () => ({ titre: '', nb: 1 })),
  ...chapitre,
})

let n = 0
/** Passage terminé du palier k, tout juste ou tout faux */
function passage(p: Parcours, k: number, juste = true): Seance {
  const s = nouvelleSeance(p, 'essai', 'complet', [k])
  s.debut = new Date(Date.UTC(2026, 9, 30, 10, 0, n++)).toISOString()
  s.nbQuestions[k] = 2
  for (let q = 0; q < 2; q++) s.essais.push({ etape: k, question: q, juste, points: juste ? 1 : 0, total: 1, reponses: {}, le: s.debut })
  s.fin = s.debut
  return s
}

const resume = (c: ReturnType<typeof ceinturesParChapitre>[number]) => c.ceintures.map((x) => `${x.nom.replace('Ceinture ', '')}${x.obtenue ? ' ✓' : ''}`)

describe('ceintures par chapitre', () => {
  it('deux parcours du même chapitre : une seule rangée, une ceinture obtenue par l’un compte pour le chapitre', () => {
    const a = enCeintures('a', 3) // blanche, jaune, orange
    const b = enCeintures('b', 2, 1) // jaune, orange
    const chapitres = ceinturesParChapitre([a, b], { a: [passage(a, 0)], b: [passage(b, 0), passage(b, 1)] })
    expect(chapitres).toHaveLength(1)
    expect(resume(chapitres[0])).toEqual(['blanche ✓', 'jaune ✓', 'orange ✓'])
    expect(chapitres[0].ceintures[1].par).toEqual(['b'])
    expect(chapitres[0].parcours.map((x) => [x.p.id, x.obtenues, x.total])).toEqual([
      ['a', 1, 3],
      ['b', 2, 2],
    ])
  })

  it('même chapitre écrit autrement (accents, casse, 1re et 1e) : même rangée ; autre degré : autre rangée', () => {
    const a = enCeintures('a', 2, 0, { niveau: '1re', theme: 'Suites numériques' })
    const b = enCeintures('b', 2, 0, { niveau: '1e', theme: 'suites numeriques' })
    const c = enCeintures('c', 2, 0, { niveau: 'Terminale', theme: 'Suites numériques' })
    const chapitres = ceinturesParChapitre([a, b, c], {})
    expect(chapitres.map((x) => [x.niveau, x.parcours.length])).toEqual([
      ['1re', 2],
      ['Terminale', 1],
    ])
  })

  it('rangée de la plus basse à la plus haute, trous compris seulement s’ils existent dans un parcours', () => {
    const a = enCeintures('a', 2, 3) // verte, bleue
    const b = enCeintures('b', 2, 0) // blanche, jaune
    expect(resume(ceinturesParChapitre([a, b], {})[0])).toEqual(['blanche', 'jaune', 'verte', 'bleue'])
  })

  it('un palier manqué ne donne rien ; au-delà de la noire, des dan', () => {
    const a = enCeintures('a', 3, 6) // noire, 2e dan, 3e dan
    const chapitres = ceinturesParChapitre([a], { a: [passage(a, 0, false), passage(a, 1)] })
    expect(resume(chapitres[0])).toEqual(['noire', 'noire, 2e dan ✓', 'noire, 3e dan'])
  })

  it('parcours en paliers numérotés ou à un seul palier : pas de ceinture de chapitre', () => {
    const paliers = { ...enCeintures('p', 2), style: 'paliers' as const }
    const un = enCeintures('u', 1)
    expect(ceinturesParChapitre([paliers, un], {})).toEqual([])
  })
})
