import { describe, expect, it } from 'vitest'
import type { Parcours } from '../src/lib/catalogue'
import { nouvelleSeance, type Seance } from '../src/lib/progression'
import {
  aRevoir,
  chapitres,
  estRevisions,
  integrerPassages,
  plusJours,
  prochaineRevision,
  quand,
  resultatsRevision,
  revisionsVides,
  soliditeObjectif,
  tirerRevision,
  type Revisions,
} from '../src/lib/revisions'

const parcours = (id: string, theme: string, uuids: string[]): Parcours => ({
  id,
  version: 1,
  titre: `Parcours ${theme}`,
  objectif: '',
  niveau: '5e',
  theme,
  difficulte: 1,
  icone: 'bx-math',
  presentation: 'une_question_par_page',
  correction: 'question',
  etapes: uuids.map((u) => ({ uuid: u, id: u.toUpperCase(), titre: `Exercice ${u}`, nbQuestions: 3, objectifs: [`Objectif ${u}`] })),
})
const relatifs = parcours('relatifs', 'Nombres relatifs', ['a1', 'a2'])
const fractions = parcours('fractions', 'Fractions', ['f1', 'f2'])
const aires = parcours('aires', 'Aires', ['g1'])

/** Passage terminé le `le` : `justes[i]` questions correctes sur 2 à l'exercice i */
function passage(p: Parcours, justes: number[], le: string): Seance {
  const s = nouvelleSeance(p, 'test')
  s.debut = `${le}T08:00:00`
  justes.forEach((j, e) => {
    s.nbQuestions[e] = 2
    for (let q = 0; q < 2; q++) s.essais.push({ etape: e, question: q, juste: q < j, points: q < j ? 1 : 0, total: 1, reponses: {}, le })
  })
  s.fin = `${le}T09:00:00`
  return s
}

/** Séance de révision terminée : `reussis[uuid]` faux si une question de l'exercice est manquée */
function revision(p: Parcours, reussis: Record<string, boolean>, le: string): Seance {
  const s = nouvelleSeance(p, 'test')
  s.debut = `${le}T18:00:00`
  p.etapes.forEach((etape, e) => {
    const r = reussis[etape.uuid] ?? true
    s.nbQuestions[e] = 2
    for (let q = 0; q < 2; q++) s.essais.push({ etape: e, question: q, juste: r || q === 0, points: r || q === 0 ? 1 : 0, total: 1, reponses: {}, le })
  })
  s.fin = `${le}T18:30:00`
  return s
}

describe('révisions espacées', () => {
  it('chaque exercice d’un parcours terminé entre dans une boîte selon sa réussite', () => {
    const r = integrerPassages(revisionsVides(), [passage(relatifs, [2, 1], '2026-10-01'), passage(fractions, [0, 2], '2026-10-01')])
    const e = (u: string) => Object.values(r.elements).find((x) => x.etape.uuid === u)!
    expect(e('a1').boite).toBe(3) // 100 % : dans une semaine
    expect(e('a1').prochaine).toBe('2026-10-08')
    expect(e('a2').boite).toBe(2) // 50 % : dans 3 jours
    expect(e('a2').prochaine).toBe('2026-10-04')
    expect(e('f1').boite).toBe(1) // 0 % : le lendemain
    expect(e('f1').prochaine).toBe('2026-10-02')
    expect(r.traites.length).toBe(4) // un repère par exercice
    // Un passage n'est compté qu'une fois
    expect(integrerPassages(r, [passage(relatifs, [2, 1], '2026-10-01')])).toBe(r)
  })

  it('exercice sur papier, test de niveau et révisions n’entrent pas', () => {
    const s = passage(relatifs, [2, 2], '2026-10-01')
    s.papier = { '0-0': true, '0-1': false }
    const r = integrerPassages(revisionsVides(), [s, passage(aires, [2], '2026-10-01')], (id) => id === 'aires')
    expect(Object.values(r.elements).map((e) => e.etape.uuid)).toEqual(['a2'])
  })

  it('séance du jour : les plus en retard, à tour de rôle dans des chapitres différents, sans titre', () => {
    let r: Revisions = integrerPassages(revisionsVides(), [
      passage(relatifs, [0, 0], '2026-10-01'),
      passage(fractions, [0, 0], '2026-10-02'),
      passage(aires, [0], '2026-10-03'),
    ])
    expect(aRevoir(r, '2026-10-01').length).toBe(0)
    expect(prochaineRevision(r)).toBe('2026-10-02')
    const p = tirerRevision(r, '2026-10-10', 4)!
    expect(p.etapes.map((e) => e.uuid)).toEqual(['a1', 'f1', 'g1', 'a2'])
    expect(p.melanger && p.enTetesMasques).toBe(true)
    expect(p.etapes.every((e) => e.nbQuestions === 1 && e.titreMasque)).toBe(true)
    expect(p.etapes[0].objectifs).toEqual(['Objectif a1'])
    // Chapitres choisis par l'élève
    r = { ...r, chapitres: ['5e|Fractions'] }
    expect(tirerRevision(r, '2026-10-10')!.etapes.map((e) => e.uuid)).toEqual(['f1', 'f2'])
    expect(chapitres(r).map((c) => `${c.theme} ${c.nb}`)).toEqual(['Aires 1', 'Fractions 2', 'Nombres relatifs 2'])
    expect(tirerRevision(r, '2026-10-01')).toBeNull()
  })

  it('réussi : boîte suivante ; manqué : boîte précédente ; jusqu’à « durable »', () => {
    let r = integrerPassages(revisionsVides(), [passage(relatifs, [2, 0], '2026-10-01')])
    let le = '2026-10-08'
    // a1 : boîte 3 → 4 (3 semaines) → 5 (2 mois) ; a2 : boîte 1 → manqué, reste en 1
    let { revisions, issues } = resultatsRevision(r, revision(tirerRevision(r, le)!, { a1: true, a2: false }, le), le)
    const a1 = (x: Revisions) => Object.values(x.elements).find((e) => e.etape.uuid === 'a1')!
    expect(Object.values(issues).map((i) => `${i.apres.etape.uuid} ${i.avant}→${i.apres.boite}`).sort()).toEqual(['a1 3→4', 'a2 1→1'])
    expect(a1(revisions).prochaine).toBe(plusJours(le, 21))
    expect(soliditeObjectif(revisions, 'Objectif a1')).toBe(1)
    r = revisions
    le = a1(r).prochaine
    ;({ revisions } = resultatsRevision(r, revision(tirerRevision(r, le)!, {}, le), le))
    expect(a1(revisions).boite).toBe(5)
    expect(soliditeObjectif(revisions, 'Objectif a1')).toBe(2)
    expect(a1(revisions).historique.map((h) => h.reussi)).toEqual([true, true])
    // Manqué en boîte 5 : retour en boîte 4, pas au début
    le = a1(revisions).prochaine
    const s = revision(tirerRevision(revisions, le)!, { a1: false }, le)
    expect(a1(resultatsRevision(revisions, s, le).revisions).boite).toBe(4)
  })

  it('une séance terminée deux fois (questions passées reprises) ne compte chaque exercice qu’une fois', () => {
    const r = integrerPassages(revisionsVides(), [passage(relatifs, [2, 2], '2026-10-01')])
    const le = '2026-10-08'
    const p = tirerRevision(r, le)!
    const s = revision(p, {}, le)
    // Première fin : le second exercice a une question passée
    const incomplete = { ...s, essais: s.essais.filter((x) => !(x.etape === 1 && x.question === 1)) }
    const un = resultatsRevision(r, incomplete, le)
    expect(Object.keys(un.issues)).toEqual(['0'])
    const deux = resultatsRevision(un.revisions, s, le)
    expect(Object.keys(deux.issues)).toEqual(['0', '1'])
    expect(Object.values(deux.revisions.elements).map((e) => e.boite)).toEqual([4, 4])
    expect(Object.values(deux.revisions.elements).every((e) => e.historique.length === 1)).toBe(true)
  })

  it('un nouveau passage manqué ramène l’exercice au lendemain', () => {
    let r = integrerPassages(revisionsVides(), [passage(relatifs, [2, 2], '2026-10-01')])
    r = integrerPassages(r, [passage(relatifs, [0, 2], '2026-10-03')])
    const a1 = Object.values(r.elements).find((e) => e.etape.uuid === 'a1')!
    expect(a1.boite).toBe(2)
    expect(a1.prochaine).toBe('2026-10-06')
  })

  it('jamais de stock : la séance a la taille choisie, les plus fragiles d’abord', () => {
    // Trois semaines sans réviser : 5 exercices à revoir
    let r = integrerPassages(revisionsVides(), [
      passage(relatifs, [2, 2], '2026-10-01'),
      passage(fractions, [0, 2], '2026-10-01'),
      passage(aires, [1], '2026-10-01'),
    ])
    expect(aRevoir(r, '2026-10-22').length).toBe(5)
    r = { ...r, taille: 3 }
    const p = tirerRevision(r, '2026-10-22')!
    // f1 (boîte 1), g1 (boîte 2), puis un exercice en boîte 3 d'un autre chapitre
    expect(p.etapes.length).toBe(3)
    expect(p.etapes.slice(0, 2).map((e) => e.uuid)).toEqual(['f1', 'g1'])
    expect(p.etapes[2].uuid).toBe('a1')
    expect(estRevisions({ ...r, taille: 7 })).toBe(false)
  })

  it('dates en mots simples, contrôle de la sauvegarde', () => {
    expect(quand('2026-10-20', '2026-10-19')).toBe('demain')
    expect(quand('2026-10-22', '2026-10-19')).toBe('dans 3 jours')
    expect(quand('2026-10-26', '2026-10-19')).toBe('dans 1 semaine')
    expect(quand('2026-11-09', '2026-10-19')).toBe('dans 3 semaines')
    expect(quand('2026-12-14', '2026-10-19')).toBe('dans 2 mois')
    const r = integrerPassages(revisionsVides(), [passage(relatifs, [2, 1], '2026-10-01')])
    expect(estRevisions(r)).toBe(true)
    expect(estRevisions({ ...r, chapitres: ['5e|Fractions'] })).toBe(true)
    expect(estRevisions({ elements: { x: { boite: 9 } }, traites: [] })).toBe(false)
  })
})

import { entrelacer } from '../src/lib/progression'

describe('pratique mélangée', () => {
  it('une question de chaque exercice à tour de rôle, jamais deux à la suite du même', () => {
    const cles = ['0-0', '0-1', '1-0', '1-1', '2-0', '2-1']
    for (const g of ['a', 'b', 'c', 'd', 'e']) {
      const o = entrelacer(cles, g)
      expect([...o].sort()).toEqual(cles)
      expect(o.every((c, i) => i === 0 || c.split('-')[0] !== o[i - 1].split('-')[0])).toBe(true)
    }
    // Un exercice a plus de questions : les dernières se suivent
    expect(entrelacer(['0-0', '0-1', '0-2', '1-0'], 'x').filter((c) => c.startsWith('1')).length).toBe(1)
  })
})
