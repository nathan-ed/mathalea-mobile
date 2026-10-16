import { describe, expect, it } from 'vitest'
import { melange, paliersDe } from '../src/lib/catalogue'
import { parcoursVide } from '../src/lib/bibliotheque'
import type { ExerciceDuReferentiel } from '../src/lib/moteur'
import { cleQuestion, fixerOrdre, melanger, nouvelleSeance, questionsDe, questionsOrdonnees } from '../src/lib/progression'
import { cleInvalide } from '../src/lib/sauvegarde'
import { NB_QUESTIONS, NIVEAUX_TEST, sujetsDu, tirerTest, type ClassementCan } from '../src/lib/testNiveau'
import { estParcours } from '../src/lib/validation'

const sujet = (id: string, titre = id, interactif = true): ExerciceDuReferentiel => ({ uuid: `u-${id}`, id, titre, niveau: 'CAN', theme: '6e', interactif })
const referentiel = [
  sujet('can6a-2023'), // trop ancien : ses questions ne se choisissent pas
  sujet('can6a-2024'),
  sujet('can6a-2025'),
  sujet('can6a-NY2025'), // spéciale année
  sujet('can6a-2026', 'can6a-2026', false),
  sujet('canc3a-2025', 'CAN CM2 sujet 2025'),
  sujet('canc3a-2025b', 'CAN CM1 sujet 2025'),
  sujet('canTSpea-2025'),
  sujet('can6C01'), // question isolée, pas un sujet
]
const niveau = (cle: string) => NIVEAUX_TEST.find((n) => n.cle === cle)!

// Classement fictif : 30 questions par sujet, 6 domaines ; les 10 premières
// de can6a-2025 reprennent celles de can6a-2024 (mêmes sources), un titre est
// partagé par deux sujets
const DOMAINES = ['nombres', 'mesures', 'geometrie', 'proportionnalite', 'donnees', 'algebre']
const fictives = (id: string, partage?: string): ClassementCan[string] =>
  Array.from({ length: 30 }, (_, i) => ({
    n: i + 1,
    source: partage && i < 10 ? `${partage}-Q${i + 1}` : `${id}-Q${i + 1}`,
    titre: i === 20 ? 'Calculer une moyenne' : `${id} question ${i + 1}`,
    domaine: i === 29 ? null : DOMAINES[i % 6],
  }))
const classement: ClassementCan = {
  'can6a-2024': fictives('can6a-2024'),
  'can6a-2025': fictives('can6a-2025', 'can6a-2024'),
  'canc3a-2025': fictives('canc3a-2025'),
  'canc3a-2025b': fictives('canc3a-2025b'),
  'canTSpea-2025': fictives('canTSpea-2025'),
}

describe('teste ton niveau', () => {
  it('ne garde que les sujets officiels récents, interactifs et classés du niveau', () => {
    expect(sujetsDu(niveau('6e'), referentiel, classement).map((e) => e.id)).toEqual(['can6a-2024', 'can6a-2025'])
    expect(sujetsDu(niveau('cm1'), referentiel, classement).map((e) => e.id)).toEqual(['canc3a-2025b'])
    expect(sujetsDu(niveau('cm2'), referentiel, classement).map((e) => e.id)).toEqual(['canc3a-2025'])
    expect(sujetsDu(niveau('terminale'), referentiel, classement).map((e) => e.id)).toEqual(['canTSpea-2025'])
    // Sujet absent du classement : ignoré
    expect(sujetsDu(niveau('6e'), referentiel, { 'can6a-2024': classement['can6a-2024'] }).map((e) => e.id)).toEqual(['can6a-2024'])
  })

  const sujets = sujetsDu(niveau('6e'), referentiel, classement)
  const tirees = (p: ReturnType<typeof tirerTest>) =>
    p.etapes.flatMap((e) => String(e.sup2).split('-').map((n) => classement[e.id!].find((q) => q.n === Number(n))!))

  it('tire 15 questions : 5 automatismes et 10 autres, sans doublon de source ni de titre, domaines alternés', () => {
    for (const graine of ['a', 'b', 'c', 'd']) {
      const p = tirerTest(niveau('6e'), sujets, graine, 3, classement)
      const qs = tirees(p)
      expect(qs).toHaveLength(NB_QUESTIONS)
      expect(qs.filter((q) => q.n <= 10)).toHaveLength(5)
      expect(new Set(qs.map((q) => q.source)).size).toBe(15)
      expect(new Set(qs.map((q) => q.titre)).size).toBe(15)
      // 5 automatismes de 5 domaines différents ; au plus 2 questions par domaine dans les 10 autres
      expect(new Set(qs.filter((q) => q.n <= 10).map((q) => q.domaine)).size).toBe(5)
      const parDomaine = new Map<string, number>()
      for (const q of qs.filter((q) => q.n > 10)) parDomaine.set(String(q.domaine), (parDomaine.get(String(q.domaine)) ?? 0) + 1)
      expect(Math.max(...parDomaine.values())).toBeLessThanOrEqual(2)
      expect(parDomaine.has('null')).toBe(false) // sans domaine : seulement pour compléter
      for (const e of p.etapes) expect(e.nbQuestions).toBe(String(e.sup2).split('-').length)
      expect(p.paliers).toBeUndefined()
      expect(p.version).toBe(3)
      expect(estParcours(p)).toBe(true)
    }
  })

  it('même graine, même tirage ; autre graine, autre tirage', () => {
    const a = tirerTest(niveau('6e'), sujets, 'x', 1, classement)
    expect(tirerTest(niveau('6e'), sujets, 'x', 1, classement)).toEqual(a)
    expect(tirees(tirerTest(niveau('6e'), sujets, 'y', 1, classement))).not.toEqual(tirees(a))
  })

  it('peu de questions : le test est plus court, sans doublon', () => {
    const petit: ClassementCan = { 'can6a-2024': fictives('can6a-2024').slice(0, 12) }
    const p = tirerTest(niveau('6e'), sujetsDu(niveau('6e'), referentiel, petit), 'g', 1, petit)
    const qs = p.etapes.flatMap((e) => String(e.sup2).split('-'))
    expect(qs).toHaveLength(7) // 5 parmi 1 à 10, 2 parmi 11 et 12
    expect(new Set(qs).size).toBe(7)
  })

  it('le classement livré couvre les neuf niveaux', async () => {
    const livre = (await import('../src/lib/questionsCan.json')).default as ClassementCan
    // Référentiel tel que le moteur le donne : les sujets CM1 se distinguent par leur titre
    const ref = Object.keys(livre).map((id) => sujet(id, /^canc3a-.*b$/.test(id) ? 'CAN CM1' : 'CAN CM2'))
    for (const n of NIVEAUX_TEST) expect(sujetsDu(n, ref, livre).length, n.nom).toBeGreaterThan(0)
  })

  it('l’état du test est contrôlé dans une sauvegarde', () => {
    const p = tirerTest(niveau('6e'), sujets, 'g', 1, classement)
    expect(cleInvalide({ 'test-niveau': { '6e': { tirage: p, valideLe: '2026-10-16' } } })).toBeUndefined()
    expect(cleInvalide({ 'test-niveau': { '6e': { tirage: p, reperage: true } } })).toBeUndefined() // état de la 0.3.0
    expect(cleInvalide({ 'test-niveau': { '6e': { tirage: { ...p, id: 'autre' } } } })).toBe('test-niveau')
    expect(cleInvalide({ 'test-niveau': { '6e': { valideLe: 3 } } })).toBe('test-niveau')
  })
})

describe('questions mélangées', () => {
  const parcours = () => ({
    ...parcoursVide(),
    id: 'p',
    titre: 'P',
    presentation: 'liste_exos' as const,
    etapes: ['a', 'b', 'c'].map((uuid) => ({ uuid, titre: uuid, nbQuestions: 3 })),
  })
  const seance = (code?: string) => {
    const s = nouvelleSeance(parcours(), 'm', 'complet', undefined, code)
    s.nbQuestions = { 0: 3, 1: 3, 2: 3 }
    return s
  }

  it('nouveau parcours : en-têtes masqués et ordre mélangé, sauf un exercice par page', () => {
    expect(parcoursVide()).toMatchObject({ enTetesMasques: true, melanger: true })
    expect(melange({ melanger: true, presentation: 'un_exo_par_page' })).toBe(false)
    expect(melange({ melanger: undefined, presentation: 'liste_exos' })).toBe(false)
  })

  it('mélange de façon reproductible', () => {
    const l = Array.from({ length: 20 }, (_, i) => i)
    expect(melanger(l, 'a')).toEqual(melanger(l, 'a'))
    expect(melanger(l, 'a')).not.toEqual(l)
    expect([...melanger(l, 'a')].sort((x, y) => x - y)).toEqual(l)
  })

  it('tire l’ordre une fois et le garde à la reprise', () => {
    const s = seance()
    fixerOrdre(s)
    const ordre = questionsOrdonnees(s).map((q) => cleQuestion(q.etape, q.question))
    expect([...ordre].sort()).toEqual(questionsDe(s).map((q) => cleQuestion(q.etape, q.question)).sort())
    expect(ordre).not.toEqual(questionsDe(s).map((q) => cleQuestion(q.etape, q.question)))
    const reprise = JSON.parse(JSON.stringify(s))
    fixerOrdre(reprise)
    expect(questionsOrdonnees(reprise).map((q) => cleQuestion(q.etape, q.question))).toEqual(ordre)
    expect(cleInvalide({ 'seance:p': s })).toBeUndefined()
  })

  it('session partagée : le même ordre pour tous', () => {
    const a = seance('ab12c')
    const b = seance('ab12c')
    fixerOrdre(a)
    fixerOrdre(b)
    expect(a.ordre).toEqual(b.ordre)
  })

  it('sans mélange : l’ordre des exercices', () => {
    const s = seance()
    s.contenu.melanger = false
    fixerOrdre(s)
    expect(s.ordre).toBeUndefined()
    expect(questionsOrdonnees(s)).toEqual(questionsDe(s))
  })
})
