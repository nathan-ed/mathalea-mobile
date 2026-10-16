import { describe, expect, it } from 'vitest'
import { melange, paliersDe } from '../src/lib/catalogue'
import { parcoursVide } from '../src/lib/bibliotheque'
import type { ExerciceDuReferentiel } from '../src/lib/moteur'
import { cleQuestion, fixerOrdre, melanger, nouvelleSeance, questionsDe, questionsOrdonnees } from '../src/lib/progression'
import { cleInvalide } from '../src/lib/sauvegarde'
import { NIVEAUX_TEST, partie, sujetsDu, tirerTest, type SujetCan } from '../src/lib/testNiveau'
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

describe('teste ton niveau', () => {
  it('ne garde que les sujets officiels récents et interactifs du niveau', () => {
    expect(sujetsDu(niveau('6e'), referentiel).map((e) => e.id)).toEqual(['can6a-2024', 'can6a-2025'])
    expect(sujetsDu(niveau('cm1'), referentiel).map((e) => e.id)).toEqual(['canc3a-2025b'])
    expect(sujetsDu(niveau('cm2'), referentiel).map((e) => e.id)).toEqual(['canc3a-2025'])
    expect(sujetsDu(niveau('terminale'), referentiel).map((e) => e.id)).toEqual(['canTSpea-2025'])
  })

  const sujets: SujetCan[] = sujetsDu(niveau('6e'), referentiel).map((e) => ({ ...e, nbQuestions: 30 }))
  const numeros = (p: ReturnType<typeof tirerTest>, k: 0 | 1) =>
    partie(p, k).flatMap((i) => String(p.etapes[i].sup2).split('-').map((n) => `${p.etapes[i].uuid}:${n}`))

  it('tire 10 questions parmi les 10 premières et 20 parmi les suivantes, sans doublon', () => {
    const p = tirerTest(niveau('6e'), sujets, 'graine', 3)
    const r = numeros(p, 0)
    const v = numeros(p, 1)
    expect(r).toHaveLength(10)
    expect(v).toHaveLength(20)
    expect(new Set([...r, ...v]).size).toBe(30)
    expect(r.every((c) => Number(c.split(':')[1]) <= 10)).toBe(true)
    expect(v.every((c) => Number(c.split(':')[1]) > 10)).toBe(true)
    // Une étape par sujet et par partie, son nombre de questions suit la liste
    for (const e of p.etapes) expect(e.nbQuestions).toBe(String(e.sup2).split('-').length)
    expect(paliersDe(p).map((x) => x.etapes)).toEqual([partie(p, 0), partie(p, 1)])
    expect(p.version).toBe(3)
    expect(estParcours(p)).toBe(true)
  })

  it('même graine, même tirage ; autre graine, autre tirage', () => {
    const a = tirerTest(niveau('6e'), sujets, 'x', 1)
    expect(tirerTest(niveau('6e'), sujets, 'x', 1)).toEqual(a)
    expect(numeros(tirerTest(niveau('6e'), sujets, 'y', 1), 1)).not.toEqual(numeros(a, 1))
  })

  it('sujets de 20 questions : validation sur les questions 11 à 20', () => {
    const p = tirerTest(niveau('cm1'), [{ uuid: 'ce', id: 'canc3a-2025b', titre: 'CE', nbQuestions: 20 }], 'g', 1)
    expect(numeros(p, 0)).toHaveLength(10)
    expect(numeros(p, 1)).toHaveLength(10)
  })

  it('l’état du test est contrôlé dans une sauvegarde', () => {
    const p = tirerTest(niveau('6e'), sujets, 'g', 1)
    expect(cleInvalide({ 'test-niveau': { '6e': { tirage: p, reperage: true, valideLe: '2026-10-16' } } })).toBeUndefined()
    expect(cleInvalide({ 'test-niveau': { '6e': { tirage: { ...p, id: 'autre' } } } })).toBe('test-niveau')
    expect(cleInvalide({ 'test-niveau': { '6e': { reperage: 'oui' } } })).toBe('test-niveau')
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
