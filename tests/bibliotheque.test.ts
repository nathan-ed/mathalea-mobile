// Bibliothèque d'un enseignant d'avant la 0.6 (export pour le site), sessions
// partagées, sauvegarde, fichiers partagés mal formés, parcours corrigé après coup.
import { describe, expect, it } from 'vitest'
import { exporter } from '../src/lib/bibliotheque'
import type { Parcours } from '../src/lib/catalogue'
import { lireFichier } from '../src/lib/partage'
import { graineDeSession, nouveauCode, nouvelleSeance } from '../src/lib/progression'

const brouillon = (titre: string): Parcours => ({
  id: '',
  version: 1,
  titre,
  objectif: '',
  niveau: '4e',
  theme: 'Fractions',
  difficulte: 1,
  icone: 'bx-book-content',
  presentation: 'une_question_par_page',
  correction: 'question',
  etapes: [{ uuid: '5f429', id: '4C21', titre: 'Additionner', nbQuestions: 3 }],
})

describe('bibliothèque d’un enseignant d’avant la 0.6', () => {
  it('exportée dans un fichier que le site ouvre : classes, parcours sans classe et objectifs', () => {
    const a = { ...brouillon('Fractions'), id: 'fractions-x' }
    const b = { ...brouillon('Relatifs'), id: 'relatifs-x' }
    const vide = { ...brouillon(''), id: 'vide-x' }
    const objectifs = [{ libelle: 'Additionner des fractions', niveau: '4e', theme: 'Fractions' }]
    const texte = exporter(
      {
        classes: [{ nom: '3A' }, { nom: '3B' }],
        parcours: [
          { parcours: a, classes: ['3A', '3B'], exportee: {} },
          { parcours: b, classes: [], exportee: {} },
          { parcours: vide, classes: ['3B'], exportee: {} },
        ],
      },
      objectifs,
    )
    const f = lireFichier(texte)
    expect(f.classes.map((c) => [c.nom, c.parcours.map((p) => p.id)])).toEqual([
      ['3A', ['fractions-x']],
      ['3B', ['fractions-x']],
    ])
    expect(f.bibliotheque?.parcours.map((p) => p.id)).toEqual(['fractions-x', 'relatifs-x', 'vide-x'])
    expect(f.bibliotheque?.objectifs).toEqual(objectifs)
  })
})

describe('sessions partagées', () => {
  it('même code et même version : mêmes graines ; autre code : autres graines', () => {
    const p = { ...brouillon('Fractions'), id: 'fractions-x' }
    const a = nouvelleSeance(p, 'm', 'complet', undefined, '1K3LR ')
    const b = nouvelleSeance(p, 'm', 'complet', undefined, '1k3lr')
    expect(a.code).toBe('1k3lr')
    expect(a.graines).toEqual(b.graines)
    expect(nouvelleSeance(p, 'm', 'complet', undefined, 'abcde').graines).not.toEqual(a.graines)
    expect(graineDeSession('1k3lr', { ...p, version: 2 }, 0)).not.toBe(a.graines[0])
  })
  it('génère des codes de 5 caractères sans caractères ambigus', () => {
    for (let i = 0; i < 200; i++) expect(nouveauCode()).toMatch(/^[2-9a-hjkmnp-z]{5}$/)
  })
})

describe('sauvegarde', async () => {
  const { exporterSauvegarde, restaurerSauvegarde } = await import('../src/lib/sauvegarde')
  const memoire = (initial: Record<string, unknown> = {}, panneA?: string) => {
    const d = new Map(Object.entries(initial))
    return {
      d,
      st: {
        lire: async (c: string) => (d.has(c) ? structuredClone(d.get(c)) : null),
        ecrire: async (c: string, v: unknown) => {
          if (c === panneA) throw new Error('disque plein')
          d.set(c, structuredClone(v))
        },
        effacer: async (c: string) => void d.delete(c),
        cles: async () => [...d.keys()],
      } as never,
    }
  }
  const seance = nouvelleSeance({ ...brouillon('Fractions'), id: 'fractions' }, 'essai')
  it('exporte puis restaure à l’identique', async () => {
    const donnees = { profil: 'eleve', 'historique:fractions': [seance], 'complet:fractions': 1 }
    const texte = await exporterSauvegarde(memoire(donnees).st)
    const b = memoire({ profil: 'enseignant', 'complet:autre': 1 })
    await restaurerSauvegarde(b.st, texte)
    const { 'avant-restauration': copie, ...restaure } = Object.fromEntries(b.d)
    expect(restaure).toEqual(JSON.parse(JSON.stringify(donnees)))
    // L'état remplacé est gardé : restaurer cette copie annule la restauration
    await restaurerSauvegarde(b.st, copie as string)
    const { 'avant-restauration': _, ...annule } = Object.fromEntries(b.d)
    expect(annule).toEqual({ profil: 'enseignant', 'complet:autre': 1 })
    expect(JSON.parse(await exporterSauvegarde(b.st)).donnees['avant-restauration']).toBeUndefined()
  })
  it('résume une sauvegarde avant de la restaurer', async () => {
    const { resumerSauvegarde } = await import('../src/lib/sauvegarde')
    const texte = await exporterSauvegarde(memoire({ profil: 'eleve', 'historique:fractions': [seance] }).st)
    expect(resumerSauvegarde(texte)).toMatchObject({ dossiers: 0, passages: 1, enCours: 0, enseignant: false })
    // Séance en cours : comptée, emportée et restaurée telle quelle (nouvel appareil vide)
    const enCours = { ...seance, position: 2 }
    const texte2 = await exporterSauvegarde(memoire({ profil: 'eleve', 'seance:fractions': enCours, 'seance:fini': null }).st)
    expect(resumerSauvegarde(texte2)).toMatchObject({ passages: 0, enCours: 1 })
    const neuf = memoire({})
    await restaurerSauvegarde(neuf.st, texte2)
    expect(neuf.d.get('seance:fractions')).toEqual(JSON.parse(JSON.stringify(enCours)))
    expect(neuf.d.get('profil')).toBe('eleve')
  })
  it('refuse une sauvegarde au bon format mais au contenu mal formé, sans rien effacer', async () => {
    const avant = { profil: 'eleve', 'historique:fractions': [seance] }
    const mauvaises = [
      { classes: { invalide: true } },
      { bibliotheque: { classes: [], parcours: [{ parcours: { id: 'x' } }] } },
      { 'historique:fractions': [{ debut: '1' }] },
      { 'seance:fractions': { ...seance, etapes: [7] } },
      { inconnue: 1 },
      // Retours de vérification : contenu imbriqué et doublons
      { classes: [{ lien: 'https://exemple.ch/s/a', nom: 'A', parcours: [], fichier: [null] }] },
      { bibliotheque: { classes: [{ nom: 'A' }, { nom: 'A' }], parcours: [] } },
      { classes: [{ lien: 'https://exemple.ch/s/a' }, { lien: 'https://exemple.ch/s/a' }] },
      { bibliotheque: { classes: [], parcours: [{ parcours: seance.contenu, classes: [], exportee: {} }, { parcours: seance.contenu, classes: [], exportee: {} }] } },
      { ajoutes: [seance.contenu, seance.contenu] },
      { ajoutes: [{ ...seance.contenu, theme: undefined }] },
      { chapitres: { x: { ordre: ['Fractions', 'Fractions'], fermes: [] } } },
      { 'historique:fractions': [seance, seance] },
      { 'seance:autre': seance },
      { 'seance:fractions': { ...seance, essais: [null] } },
      { 'resultats:fractions@1': { 0: { points: 1 } } },
    ]
    for (const donnees of mauvaises) {
      const b = memoire(avant)
      const texte = JSON.stringify({ format: 'sauvegarde-mathalea/1', creeeLe: '', donnees })
      await expect(restaurerSauvegarde(b.st, texte)).rejects.toThrow(/endommagée/)
      expect(Object.fromEntries(b.d)).toEqual(avant)
    }
  })
  it('refuse un fichier invalide sans rien toucher', async () => {
    const b = memoire({ profil: 'eleve' })
    await expect(restaurerSauvegarde(b.st, '{"format":"autre"}')).rejects.toThrow(/pas une sauvegarde/)
    expect(Object.fromEntries(b.d)).toEqual({ profil: 'eleve' })
  })
  it('remet l’état d’avant si l’écriture échoue en cours de route', async () => {
    const texte = await exporterSauvegarde(memoire({ 'complet:a': 1, 'complet:panne': 2 }).st)
    const b = memoire({ profil: 'eleve' }, 'complet:panne')
    await expect(restaurerSauvegarde(b.st, texte)).rejects.toThrow(/rien n’a changé/)
    expect(Object.fromEntries(b.d)).toEqual({ profil: 'eleve' })
  })
})

describe('fichiers partagés mal formés', () => {
  const p = { ...brouillon('Relatifs'), id: 'relatifs-5e' }
  const fichier = (classes: unknown) => JSON.stringify({ format: 'classes-mathalea/1', exporteLe: '', classes })
  it('refuse deux classes de même nom ou un parcours en double dans une classe', () => {
    expect(() => lireFichier(fichier([{ nom: 'A', parcours: [p] }, { nom: 'A', parcours: [] }]))).toThrow(/en double/)
    expect(() => lireFichier(fichier([{ nom: 'A', parcours: [p, p] }]))).toThrow(/en double/)
  })
  it('refuse un parcours auquel il manque un champ affiché', () => {
    expect(() => lireFichier(fichier([{ nom: 'A', parcours: [{ ...p, theme: undefined }] }]))).toThrow(/Parcours invalide/)
    expect(() => lireFichier(fichier([{ nom: 'A', parcours: [{ ...p, etapes: [null] }] }]))).toThrow(/Parcours invalide/)
  })
})

describe('correction d’un parcours déjà travaillé', async () => {
  const { lireResultats, terminerSeance } = await import('../src/lib/progression')
  const d = new Map<string, unknown>()
  const st = {
    lire: async (c: string) => (d.has(c) ? structuredClone(d.get(c)) : null),
    ecrire: async (c: string, v: unknown) => void d.set(c, structuredClone(v)),
    effacer: async (c: string) => void d.delete(c),
    cles: async () => [...d.keys()],
  } as never
  const v1 = {
    ...brouillon('Fractions'),
    id: 'fractions',
    etapes: [
      { uuid: 'aaa', titre: 'Simplifier', nbQuestions: 1 },
      { uuid: 'bbb', titre: 'Additionner', nbQuestions: 1 },
    ],
  }
  const essai = (etape: number, juste: boolean) => ({ etape, question: 0, juste, points: juste ? 1 : 0, total: 1, reponses: {}, le: '2026-10-13T10:00:00Z' })

  it('garde les résultats des exercices restés, corrigés ou déplacés ; un exercice ajouté part de zéro', async () => {
    const s = nouvelleSeance(v1, 'essai')
    s.nbQuestions = { 0: 1, 1: 1 }
    s.essais = [essai(0, true), essai(1, false)]
    await terminerSeance(st, s)
    // V2 : titre corrigé, réglage changé, exercices échangés, un exercice ajouté
    const v2 = {
      ...v1,
      version: 2,
      etapes: [{ uuid: 'bbb', titre: 'Additionner deux fractions', nbQuestions: 2 }, { uuid: 'ccc', titre: 'Nouveau' }, v1.etapes[0]],
    }
    const r = await lireResultats(st, v2)
    // Nombre de questions changé (1 → 2) : le résultat garde sa version et son total
    expect(r[0]).toMatchObject({ points: 0, sur: 1, version: 1 })
    expect(r[1]).toBeUndefined()
    expect(r[2]).toMatchObject({ points: 1, sur: 1 })
    // Et d'une version à la suivante (V1 → V2 → V3 sans passage en V2)
    expect((await lireResultats(st, { ...v2, version: 3 }))[2]).toMatchObject({ points: 1 })
  })

  it('un exercice marqué « repartir de zéro » pour cette version perd son ancien résultat, pas les autres', async () => {
    const v2 = { ...v1, version: 2, etapes: [{ ...v1.etapes[0], remiseAZero: 2 }, v1.etapes[1]] }
    const r = await lireResultats(st, v2)
    expect(r[0]).toBeUndefined()
    expect(r[1]).toMatchObject({ points: 0, sur: 1 })
    // Le marqueur ne vaut que pour la version qui le porte : la V3 reprend à nouveau
    expect((await lireResultats(st, { ...v2, version: 3 }))[0]).toMatchObject({ points: 1 })
  })

  it('la relecture d’un passage V1 rejoue la V1 (copie figée, nombre de questions d’alors)', async () => {
    const { lireHistorique, questionsDe } = await import('../src/lib/progression')
    const [passage] = await lireHistorique(st, 'fractions')
    expect(passage.contenu.version).toBe(1)
    expect(passage.contenu.etapes[1]).toMatchObject({ uuid: 'bbb', nbQuestions: 1 })
    expect(questionsDe(passage)).toHaveLength(2)
  })

  it('supprimer la tentative en cours garde les passages terminés et les résultats', async () => {
    const { ecrireSeance, lireHistorique, lireSeance, supprimerSeance } = await import('../src/lib/progression')
    const avant = await lireResultats(st, v1)
    // Reprise d'un passage terminé (questions passées), puis nouvelle réponse
    const reprise = (await lireHistorique(st, 'fractions'))[0]
    reprise.fin = undefined
    reprise.essais.push(essai(1, true))
    await ecrireSeance(st, reprise)
    expect(await lireSeance(st, 'fractions')).not.toBeNull()
    await supprimerSeance(st, 'fractions')
    expect(await lireSeance(st, 'fractions')).toBeNull()
    expect(await lireHistorique(st, 'fractions')).toHaveLength(1)
    expect((await lireHistorique(st, 'fractions'))[0].essais).toHaveLength(2)
    expect(await lireResultats(st, v1)).toEqual(avant)
  })
})
