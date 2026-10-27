import { describe, expect, it } from 'vitest'
import { fixerOrdre, modeQr, nouveauCode, nouvelleSeance, questionsOrdonnees, reglageQr, cleQuestion, type Seance } from '../src/lib/progression'
import {
  ajouterReponses,
  bilanDesEleves,
  bilanDesQuestions,
  elevesDe,
  decoderReponses,
  empreinteEnonces,
  encoderReponses,
  ordreDesQuestions,
  reponsesDeSeance,
  type Releve,
  type ReponsesSession,
} from '../src/lib/releve'
import type { Parcours } from '../src/lib/catalogue'

const parcours = (melanger = true): Parcours =>
  ({
    id: 'fractions-5e',
    version: 3,
    titre: 'Fractions',
    objectif: '',
    niveau: '5e',
    theme: 'Fractions',
    difficulte: 1,
    correction: 'question',
    melanger,
    presentation: 'une_question_par_page',
    etapes: [
      { uuid: 'a1b2c', id: '5N20', titre: 'Additionner', nbQuestions: 4, sup: '2' },
      { uuid: 'd3e4f', id: '5N21', titre: 'Comparer', nbQuestions: 3 },
    ],
  }) as unknown as Parcours

/** Séance d'une session partagée où l'élève a vérifié quelques questions */
function seanceDeSession(code = 'vu5qx', melanger = true): Seance {
  const s = nouvelleSeance(parcours(melanger), '2026-10-18+abc', 'complet', [0, 1], code)
  s.nbQuestions = { 0: 4, 1: 3 }
  s.empreintes = { 0: 'aaa', 1: 'bbb' }
  fixerOrdre(s)
  const essai = (etape: number, question: number, valeur: string, juste: boolean) => ({
    etape,
    question,
    juste,
    points: juste ? 1 : 0,
    total: 1,
    reponses: { [`champTexteEx${etape}Q${question}`]: valeur },
    le: s.debut,
  })
  s.essais = [essai(0, 0, '\\frac{3}{5}', true), essai(0, 1, '0,6', false), essai(0, 1, '1', true), essai(1, 2, '<', true)]
  return s
}

describe('QR code demandé par l’enseignant, porté par le code de session', () => {
  it('le code garde son mode, quelle que soit la façon de le taper', () => {
    for (const mode of ['aucun', 'apres', 'avant'] as const) {
      for (let i = 0; i < 50; i++) {
        const code = nouveauCode(mode)
        expect(code).toMatch(/^[2-9a-hj-km-np-z]{5}$/)
        expect(modeQr(code)).toBe(mode)
        expect(modeQr(` ${code.toUpperCase()} `)).toBe(mode)
      }
    }
    expect(modeQr(undefined)).toBe('aucun')
    expect(modeQr('1k3lr')).toBe('aucun') // code tapé à la main, hors alphabet
    expect(modeQr('cq7')).toBe('aucun') // autre longueur
  })

  it('changer une lettre ne permet pas de choisir son mode : les trois modes se mêlent', () => {
    const lettres = '23456789abcdefghjkmnpqrstuvwxyz'
    for (const mode of ['aucun', 'apres', 'avant'] as const) {
      const code = nouveauCode(mode)
      for (let i = 0; i < 5; i++) {
        const voisins = [...lettres].map((l) => code.slice(0, i) + l + code.slice(i + 1))
        const modes = new Set(voisins.map(modeQr))
        expect(modes.size).toBe(3)
      }
    }
  })

  it('cinq réglages : avec ou sans prénom, porté par le code', () => {
    for (const [quand, prenom] of [['aucun', false], ['apres', false], ['avant', false], ['apres', true], ['avant', true]] as const) {
      for (let i = 0; i < 30; i++) expect(reglageQr(nouveauCode(quand, prenom))).toEqual({ quand, prenom })
    }
    expect(reglageQr(nouveauCode('aucun', true))).toEqual({ quand: 'aucun', prenom: false }) // pas de prénom sans QR code
    expect(reglageQr('vu5qx')).toEqual({ quand: 'apres', prenom: false })
    expect(reglageQr('r54z4')).toEqual({ quand: 'apres', prenom: true })
  })

  it('le prénom n’entre dans le QR code que si le code le demande', () => {
    expect(reponsesDeSeance(seanceDeSession('r54z4'), '  Léa ')!.n).toBe('Léa')
    expect(reponsesDeSeance(seanceDeSession('vu5qx'), 'Léa')!.n).toBeUndefined()
    expect(reponsesDeSeance(seanceDeSession('r54z4'))!.n).toBeUndefined()
    const r = reponsesDeSeance(seanceDeSession('r54z4'), 'Léa')!
    expect(decoderReponses(encoderReponses(r))!.n).toBe('Léa')
  })

  it('sans QR code demandé : rien à relever', () => {
    expect(reponsesDeSeance(seanceDeSession(nouveauCode('aucun')))).toBeNull()
    expect(reponsesDeSeance(seanceDeSession(nouveauCode('avant')))).not.toBeNull()
  })

  it('QR code avant la correction : la séance garde la correction pour la fin', () => {
    const p = parcours()
    expect(p.correction).toBe('question')
    expect(nouvelleSeance(p, 'm', 'complet', [0, 1], nouveauCode('avant')).contenu.correction).toBe('parcours')
    expect(nouvelleSeance(p, 'm', 'complet', [0, 1], nouveauCode('apres')).contenu.correction).toBe('question')
    expect(nouvelleSeance(p, 'm', 'complet', [0, 1]).contenu.correction).toBe('question')
    expect(p.correction).toBe('question') // le parcours lui-même n'est pas modifié
  })
})

describe('réponses d’une session partagée', () => {
  it('ne garde que la première vérification de chaque question, sans rien d’identifiant', () => {
    const r = reponsesDeSeance(seanceDeSession())!
    expect(r.c).toBe('vu5qx')
    expect(Object.keys(r.r).sort()).toEqual(['0-0', '0-1', '1-2'])
    expect(r.r['0-1']).toEqual({ champTexteEx0Q1: '0,6' })
    expect(r.x[0]).toEqual({ u: 'a1b2c', n: 4, s: '2' })
    expect(r.e).toEqual({ 0: 'aaa', 1: 'bbb' })
    expect(r.o).toBe(1)
    expect(JSON.stringify(r)).not.toMatch(/nom|eleve|appareil/i)
  })

  it('rien à relever hors session ou sans réponse vérifiée', () => {
    const s = seanceDeSession()
    expect(reponsesDeSeance({ ...s, code: undefined })).toBeNull()
    expect(reponsesDeSeance({ ...s, essais: [] })).toBeNull()
  })

  it('passe par le texte du QR code et revient à l’identique, en peu de caractères', () => {
    const r = reponsesDeSeance(seanceDeSession())!
    const texte = encoderReponses(r)
    expect(texte.startsWith('MAREP1.')).toBe(true)
    expect(texte).toMatch(/^[A-Za-z0-9._-]+$/)
    expect(decoderReponses(texte)).toEqual(r)
    expect(texte.length).toBeLessThan(400)
  })

  it('un parcours de 40 questions tient dans un QR code lisible (moins de 1 200 caractères)', () => {
    const s = seanceDeSession()
    s.essais = Array.from({ length: 40 }, (_, i) => ({
      etape: i % 2,
      question: Math.floor(i / 2),
      juste: i % 3 === 0,
      points: 0,
      total: 1,
      reponses: { [`champTexteEx${i % 2}Q${Math.floor(i / 2)}`]: `\\frac{${i * 7}}{${i + 13}}` },
      le: s.debut,
    }))
    expect(encoderReponses(reponsesDeSeance(s)!).length).toBeLessThan(1200)
  })

  it('refuse ce qui n’est pas un QR code de réponses', () => {
    expect(decoderReponses('https://exemple.fr')).toBeNull()
    expect(decoderReponses('MAREP1.nimportequoi')).toBeNull()
    expect(decoderReponses('MAREP1.' + btoa('{"c":1}'))).toBeNull()
  })

  it('compte un passage une seule fois, même scanné deux fois', () => {
    const r = reponsesDeSeance(seanceDeSession())!
    let releves: Releve[] = []
    let ajout = ajouterReponses(releves, r)
    expect(ajout.nouveau).toBe(true)
    releves = ajout.releves
    ajout = ajouterReponses(releves, r)
    expect(ajout.nouveau).toBe(false)
    const autre = reponsesDeSeance({ ...seanceDeSession(), debut: '2026-10-18T09:00:00.000Z' })!
    ajout = ajouterReponses(ajout.releves, autre)
    expect(ajout.nouveau).toBe(true)
    expect(ajout.releves).toHaveLength(1)
    expect(ajout.releves[0].recues).toHaveLength(2)
    // Autre code : autre session
    const ailleurs = ajouterReponses(ajout.releves, { ...autre, c: 'zzzzz' })
    expect(ailleurs.releves).toHaveLength(2)
  })

  it('retrouve l’ordre des questions vu par les élèves (mélangé par le code)', () => {
    const s = seanceDeSession()
    const r = reponsesDeSeance(s)!
    const vu = questionsOrdonnees(s).map((q) => cleQuestion(q.etape, q.question))
    expect(ordreDesQuestions(r, { 0: 4, 1: 3 }, [0, 1])).toEqual(vu)
    const sansMelange = reponsesDeSeance(seanceDeSession('vu5qx', false))!
    expect(ordreDesQuestions(sansMelange, { 0: 4, 1: 3 }, [0, 1])).toEqual(['0-0', '0-1', '0-2', '0-3', '1-0', '1-1', '1-2'])
  })

  it('regroupe les mauvaises réponses écrites de la même façon, les plus fréquentes d’abord', () => {
    const passage = (d: string, rep: string): ReponsesSession => ({ c: 'x', p: 'p', v: 1, t: '', d, x: { 0: { u: 'u' } }, r: { '0-0': { champTexteEx0Q0: rep } } })
    const recues = [passage('a', '9/10'), passage('b', '9 / 10'), passage('c', '1'), passage('d', '0.6'), passage('e', '0,6'), passage('f', '9/10')]
    const verdicts = Object.fromEntries(recues.map((r) => [r.d, { '0-0': { juste: r.d === 'c', score: r.d === 'c' ? 1 : 0 } }]))
    const [q] = bilanDesQuestions(['0-0'], recues, verdicts, () => false)
    expect(q.repondu).toBe(6)
    expect(q.reussi).toBe(1)
    expect(q.erreurs).toEqual([
      { reponse: '9/10', nb: 3 },
      { reponse: '0.6', nb: 2 },
    ])
  })

  it('réponse en plusieurs étapes : regroupée sur la réponse finale', () => {
    const passage = (d: string, lignes: string[]): ReponsesSession => ({
      c: 'x', p: 'p', v: 1, t: '', d, x: { 0: { u: 'u' } },
      r: { '0-0': { champTexteEx0Q0: lignes.at(-1)!, ...(lignes.length > 1 ? { 'possible-multi-lines-answerEx0Q0': JSON.stringify(lignes) } : {}) } },
    })
    const recues = [passage('a', ['-22+16', '-6']), passage('b', ['-6'])]
    const [q] = bilanDesQuestions(['0-0'], recues, { a: { '0-0': { juste: false, score: 0 } }, b: { '0-0': { juste: false, score: 0 } } }, () => false)
    expect(q.erreurs).toEqual([{ reponse: '-6', nb: 2 }])
  })

  it('met à part les réponses à des questions différentes (autre version du moteur)', () => {
    const r: ReponsesSession = { c: 'x', p: 'p', v: 1, t: '', d: 'a', x: { 0: { u: 'u' } }, r: { '0-0': { c: '2' } } }
    const [q] = bilanDesQuestions(['0-0'], [r], { a: { '0-0': { juste: false, score: 0 } } }, () => true)
    expect(q.horsVersion).toBe(1)
    expect(q.repondu).toBe(0)
  })

  it('empreinte des énoncés : ignore balises et identifiants, change avec le texte', () => {
    const a = empreinteEnonces([{ contexte: '', enonce: '<p id="x1">Calculer $\\frac{1}{2}$</p><math-field id="champTexteEx0Q0"></math-field>' }])
    const b = empreinteEnonces([{ contexte: '', enonce: '<p id="y9">Calculer   $\\frac{1}{2}$</p>' }])
    const c = empreinteEnonces([{ contexte: '', enonce: '<p>Calculer $\\frac{1}{3}$</p>' }])
    expect(a).toBe(b)
    expect(a).not.toBe(c)
  })

  it('élèves : prénom ou « Élève N », score et réponses revérifiées ; toutes les réponses par question', () => {
    const passage = (d: string, rep: string, n?: string): ReponsesSession => ({ c: 'x', p: 'p', v: 1, t: '', d, x: { 0: { u: 'u' } }, r: { '0-0': { champTexteEx0Q0: rep }, '0-1': { champTexteEx0Q1: '2' } }, ...(n ? { n } : {}) })
    const recues = [passage('a', '9/10', 'Léa'), passage('b', '1'), passage('c', '9/10', 'Tom')]
    const v = (j: boolean) => ({ juste: j, score: j ? 1 : 0 })
    const verdicts = { a: { '0-0': v(false), '0-1': v(true) }, b: { '0-0': v(true), '0-1': v(true) }, c: { '0-0': v(false), '0-1': v(false) } }
    expect(elevesDe(recues).map((e) => [e.nom, e.numero])).toEqual([['Léa', 1], ['Élève 2', 2], ['Tom', 3]])
    const eleves = bilanDesEleves(['0-0', '0-1'], recues, verdicts, () => false)
    expect(eleves.map((e) => `${e.nom} ${e.points}/${e.sur}`)).toEqual(['Léa 1/2', 'Élève 2 2/2', 'Tom 0/2'])
    expect(eleves[0].details[0]).toEqual({ cle: '0-0', rang: 1, reponse: '9/10', juste: false })
    const [q] = bilanDesQuestions(['0-0'], recues, verdicts, () => false)
    expect(q.reponses).toEqual([
      { reponse: '1', nb: 1, juste: true, passages: ['b'] },
      { reponse: '9/10', nb: 2, juste: false, passages: ['a', 'c'] },
    ])
  })
})

import { cleInvalide, exporterSauvegarde, lireSauvegarde, restaurerSauvegarde } from '../src/lib/sauvegarde'
import type { Stockage } from '../src/lib/stockage'

/** Stockage en mémoire, comme celui de l'app */
function memoire(depart: Record<string, unknown> = {}): Stockage & { donnees: Map<string, string> } {
  const donnees = new Map(Object.entries(depart).map(([k, v]) => [k, JSON.stringify(v)]))
  return {
    donnees,
    async lire(cle) {
      const v = donnees.get(cle)
      return v === undefined ? null : JSON.parse(v)
    },
    async ecrire(cle, valeur) {
      donnees.set(cle, JSON.stringify(valeur))
    },
    async effacer(cle) {
      donnees.delete(cle)
    },
    async cles() {
      return [...donnees.keys()]
    },
  }
}

describe('relevés dans la sauvegarde, clé d’API (ancienne version) jamais exportée', () => {
  const r = reponsesDeSeance(seanceDeSession())!
  const releves = ajouterReponses([], r).releves
  const avecCalcul: Releve[] = [
    { ...releves[0], calcul: { moteur: 'm', verdicts: { [r.d]: { '0-0': { juste: true, score: 1 } } }, hors: {} } },
  ]

  it('les relevés et l’empreinte des énoncés d’une séance passent le contrôle', () => {
    expect(cleInvalide({ releves: avecCalcul })).toBeUndefined()
    expect(cleInvalide({ 'seance:fractions-5e': seanceDeSession() })).toBeUndefined()
    expect(cleInvalide({ releves: [{ ...avecCalcul[0], recues: [{ c: 1 }] }] })).toBe('releves')
    expect(cleInvalide({ releves: 'non' })).toBe('releves')
  })

  it('la clé d’API n’est jamais exportée, et une restauration la garde', async () => {
    const st = memoire({ profil: 'enseignant', releves: avecCalcul, 'cle-ia': 'sk-ant-secret' })
    const texte = await exporterSauvegarde(st)
    expect(texte).not.toContain('sk-ant-secret')
    expect(lireSauvegarde(texte).donnees.releves).toEqual(avecCalcul)
    // Restauration d'une autre sauvegarde : la clé reste, le reste est remplacé
    const autre = await exporterSauvegarde(memoire({ profil: 'eleve' }))
    await restaurerSauvegarde(st, autre)
    expect(await st.lire('cle-ia')).toBe('sk-ant-secret')
    expect(await st.lire('profil')).toBe('eleve')
    expect(await st.lire('releves')).toBeNull()
  })
})

import { noterSession } from '../src/lib/releve'

describe('sessions créées par l’enseignant', () => {
  const s = { parcours: 'fractions-5e', version: 2, titre: 'Fractions' }
  it('notée sans réponse, remplacée si le réglage change, gardée une fois les réponses reçues', () => {
    let l = noterSession([], { ...s, code: 'abcde' }, null, '2026-10-19')
    expect(l).toEqual([{ cle: 'abcde|fractions-5e|2', code: 'abcde', parcours: 'fractions-5e', version: 2, titre: 'Fractions', le: '2026-10-19', recues: [], creee: true }])
    l = noterSession(l, { ...s, code: 'fghij' }, 'abcde')
    expect(l.map((r) => r.code)).toEqual(['fghij'])
    // Autre palier, même code : son QR code est mis à jour
    l = noterSession(l, { ...s, code: 'fghij', invitation: 'MASES1.x' }, 'fghij')
    expect(l.length).toBe(1)
    expect(l[0].invitation).toBe('MASES1.x')
    // Une session qui a reçu des réponses n'est jamais retirée ainsi
    const recu = ajouterReponses(l, { ...reponsesDeSeance(seanceDeSession())!, c: 'fghij', p: 'fractions-5e', v: 2 }).releves
    expect(recu.length).toBe(1)
    expect(recu[0].recues.length).toBe(1)
    expect(recu[0].creee).toBe(true)
    expect(noterSession(recu, { ...s, code: 'klmnp' }, 'fghij').length).toBe(2)
    expect(cleInvalide({ releves: l })).toBeUndefined()
  })
  it('classe choisie au lancement : gardée et acceptée dans une sauvegarde', () => {
    const l = noterSession([], { ...s, code: 'abcde', classe: '5e B' }, null, '2026-10-20')
    expect(l[0].classe).toBe('5e B')
    expect(noterSession([], { ...s, code: 'abcde' }, null)[0]).not.toHaveProperty('classe')
    expect(cleInvalide({ releves: l })).toBeUndefined()
    expect(cleInvalide({ releves: [{ ...l[0], classe: 3 }] })).toBe('releves')
  })
})

import { decoderInvitation, encoderInvitation, moteurPlusAncien } from '../src/lib/invitation'
describe('QR code de session (enseignant → élèves)', () => {
  const p: Parcours = {
    id: 'relatifs-5e',
    version: 3,
    icone: 'bx-math',
    titre: 'Relatifs',
    objectif: '',
    niveau: '5e',
    theme: 'Nombres relatifs',
    difficulte: 1,
    presentation: 'une_question_par_page',
    correction: 'question',
    etapes: [
      { uuid: 'cbc26', id: '5N2G', titre: 'Additionner', nbQuestions: 3 },
      { uuid: '36e2a', id: '5N2H', titre: 'Soustraire', nbQuestions: 3, sup: '2' },
    ],
    paliers: [{ titre: 'Palier 1', nb: 1, pause: { texte: 'Bravo ! '.repeat(200) } }, { titre: 'Palier 2', nb: 1 }],
  }
  it('code, parcours figé, palier et version des exercices ; pauses retirées', () => {
    const texte = encoderInvitation({ c: 'abcde', p, e: [1], m: '2026-10-18+f0f11dca8.b3675bc' })
    expect(texte.startsWith('MASES1.')).toBe(true)
    expect(texte.length).toBeLessThan(700)
    const i = decoderInvitation(texte)!
    expect(i.c).toBe('abcde')
    expect(i.e).toEqual([1])
    expect(i.m).toBe('2026-10-18+f0f11dca8.b3675bc')
    expect(i.p.etapes).toEqual(p.etapes)
    expect(i.p.version).toBe(3)
    expect(i.p.paliers?.[0].pause).toBeUndefined()
  })
  it('refuse ce qui n’est pas un QR code de session bien formé', () => {
    expect(decoderInvitation('MAREP1.xxx')).toBeNull()
    expect(decoderInvitation('MASES1.!!!')).toBeNull()
    expect(decoderInvitation(encoderInvitation({ c: 'abcde', p, e: [5], m: 'x' }))).toBeNull()
    expect(decoderInvitation(encoderInvitation({ c: 'ab', p, m: 'x' }))).toBeNull()
    expect(decoderInvitation(encoderInvitation({ c: 'abcde', p: { ...p, id: 'A B' }, m: 'x' }))).toBeNull()
  })
  it('app de l’élève plus ancienne que celle de l’enseignant', () => {
    expect(moteurPlusAncien('2026-10-10+a.b', '2026-10-18+c.d')).toBe(true)
    expect(moteurPlusAncien('2026-10-18+a.b', '2026-10-18+c.d')).toBe(false)
    expect(moteurPlusAncien('2026-10-20+a.b', '2026-10-18+c.d')).toBe(false)
    expect(moteurPlusAncien('dev', '2026-10-18+c.d')).toBe(false)
  })
})
