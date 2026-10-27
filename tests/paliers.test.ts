import { describe, expect, it } from 'vitest'
import { estJour, estOuverture, jourEnLettres, jourLocal, jourOuverture, momentOuverture, ouvertureDuJour, paliersDe, type Parcours } from '../src/lib/catalogue'
import {
  ajouterClasse,
  attribuer,
  chapitres,
  enregistrer,
  parcoursPourClasse,
  parcoursVide,
  preferencesDe,
  renommerClasse,
  retirerClasse,
} from '../src/lib/bibliotheque'
import { ceinturesObtenues, cleExercice, completerListe, conditionPalier, etatsPaliers, maitrise, objectifsTravailles, fusionnerObjectifs, lireObjectifs, memoriser, objectifsEnCsv, resultatsParObjectif } from '../src/lib/objectifs'
import { lireFichier, creerFichier } from '../src/lib/partage'
import { estParcours } from '../src/lib/validation'
import { cleInvalide } from '../src/lib/sauvegarde'
import { bilan, nouvelleSeance, type ResultatEtape, type Seance } from '../src/lib/progression'

const etape = (uuid: string, objectifs?: string[]) => ({ uuid, id: uuid, titre: uuid, nbQuestions: 2, ...(objectifs ? { objectifs } : {}) })

const parcoursAPaliers = (): Parcours => ({
  ...parcoursVide(),
  id: 'relatifs',
  titre: 'Relatifs',
  niveau: '5e',
  theme: 'Nombres relatifs',
  etapes: [etape('a', ['Additionner']), etape('b', ['Additionner']), etape('c', ['Soustraire']), etape('d')],
  paliers: [
    { titre: 'Additionner', nb: 2, pause: { texte: 'On corrige ensemble.' } },
    { titre: 'Soustraire', nb: 1, acces: 'seuil', seuil: 80 },
    { titre: 'Problèmes', nb: 1, acces: 'libre' },
  ],
})

const r = (points: number, sur = 2, complet = true): ResultatEtape => ({ points, sur, complet, le: '2026-10-15' })

describe('paliers', () => {
  it('découpe les étapes dans l’ordre ; sans paliers valides, un seul palier', () => {
    const p = parcoursAPaliers()
    expect(paliersDe(p).map((x) => x.etapes)).toEqual([[0, 1], [2], [3]])
    expect(paliersDe({ ...p, paliers: [{ titre: '', nb: 3 }, { titre: '', nb: 3 }] })).toHaveLength(1)
    expect(paliersDe({ ...p, paliers: undefined })[0].etapes).toEqual([0, 1, 2, 3])
  })

  it('ouvre le palier suivant au seuil choisi, pas avant ; un palier ouvert reste ouvert', () => {
    const p = parcoursAPaliers()
    let e = etatsPaliers(p, {}, null)
    expect(e.map((x) => x.ouvert)).toEqual([true, false, true])
    // 3 points sur 4 : 75 %, sous le seuil de 80 %
    e = etatsPaliers(p, { 0: r(2), 1: r(1) }, null)
    expect(e[0].fini && e[0].pourcentage).toBe(75)
    expect(e[1].ouvert).toBe(false)
    expect(e[0].aRevoir).toBe(true)
    e = etatsPaliers(p, { 0: r(2), 1: r(2) }, null)
    expect(e[1].ouvert).toBe(true)
    expect(e[0].aRevoir).toBe(false)
    // Un palier commencé sans être fini ne compte pas
    expect(etatsPaliers(p, { 0: r(2), 1: r(2, 2, false) }, null)[1].ouvert).toBe(false)
  })

  // Instants écrits avec le décalage de l'enseignant (Suisse, heure d'hiver)
  const t = (iso: string) => Date.parse(iso)
  const JAUNE = '2026-11-12T08:00:00+01:00'
  const ORANGE = '2026-11-20T08:00:00+01:00'

  it('date d’ouverture : fermé avant 8 h chez l’enseignant, en plus du seuil', () => {
    const p = parcoursAPaliers()
    p.paliers![1].ouverture = JAUNE
    p.paliers![2].ouverture = ORANGE
    const reussi = { 0: r(2), 1: r(2) }
    // Seuil atteint, le jour même à 7 h 59 59 (heure de l'enseignant) : fermé
    let e = etatsPaliers(p, reussi, t('2026-11-12T06:59:59Z'))
    expect(e.map((x) => x.ouvert)).toEqual([true, false, false])
    expect(e.map((x) => x.avantOuverture)).toEqual([false, true, true])
    // 8 h chez l'enseignant = 7 h UTC
    e = etatsPaliers(p, reussi, t('2026-11-12T07:00:00Z'))
    expect(e.map((x) => x.ouvert)).toEqual([true, true, false])
    // Date passée mais seuil pas atteint : toujours fermé
    expect(etatsPaliers(p, { 0: r(2), 1: r(1) }, t('2026-12-01T10:00:00Z'))[1].ouvert).toBe(false)
    // Accès libre : la date seule compte
    expect(etatsPaliers(p, {}, t('2026-11-20T06:59:00Z'))[2].ouvert).toBe(false)
    expect(etatsPaliers(p, {}, t('2026-11-20T07:00:00Z'))[2].ouvert).toBe(true)
    expect(etatsPaliers(p, {}, t('2027-01-02T10:00:00Z'))[2].ouvert).toBe(true)
  })

  it('heure des serveurs inconnue : fermé, même si le téléphone dit que la date est passée', () => {
    const p = parcoursAPaliers()
    p.paliers![2].ouverture = ORANGE
    // Téléphone avancé par l'élève, pas d'heure des serveurs
    let e = etatsPaliers(p, {}, null, t('2026-12-25T10:00:00Z'))
    expect(e[2].ouvert).toBe(false)
    expect(e[2].heureAVerifier).toBe(true)
    // Téléphone avant la date : rien à vérifier, la date suffit
    e = etatsPaliers(p, {}, null, t('2026-11-15T10:00:00Z'))
    expect(e[2].heureAVerifier).toBe(false)
    // L'heure des serveurs fait foi, pas celle du téléphone
    e = etatsPaliers(p, {}, t('2026-11-15T10:00:00Z'), t('2026-12-25T10:00:00Z'))
    expect(e[2].ouvert).toBe(false)
    expect(e[2].heureAVerifier).toBe(false)
  })

  it('date d’ouverture du premier palier : tout le parcours attend', () => {
    const p = parcoursAPaliers()
    p.paliers![0].ouverture = '2026-11-02T08:00:00+01:00'
    p.paliers![1].acces = 'seuil'
    const e = etatsPaliers(p, {}, t('2026-11-01T12:00:00Z'))
    // Le palier libre reste ouvert : sa date à lui n'est pas fixée
    expect(e.map((x) => x.ouvert)).toEqual([false, false, true])
    expect(etatsPaliers(p, {}, t('2026-11-02T07:00:00Z'))[0].ouvert).toBe(true)
  })

  it('dit ce qui manque pour ouvrir un palier', () => {
    const p = parcoursAPaliers()
    p.paliers![1].ouverture = JAUNE
    p.paliers![2].ouverture = JAUNE
    const avant = t('2026-11-01T10:00:00Z')
    let e = etatsPaliers(p, { 0: r(2), 1: r(1) }, avant)
    expect(conditionPalier(e[1], e[0])).toBe('à partir du jeudi 12 novembre à 8 h, avec au moins 80 % (tu as 75 %)')
    expect(conditionPalier(e[2], e[1])).toBe('à partir du jeudi 12 novembre à 8 h')
    e = etatsPaliers(p, { 0: r(2), 1: r(2) }, avant)
    expect(conditionPalier(e[1], e[0])).toBe('à partir du jeudi 12 novembre à 8 h')
    e = etatsPaliers(p, { 0: r(2), 1: r(1) }, t('2026-11-12T07:00:00Z'))
    expect(conditionPalier(e[1], e[0])).toBe('au moins 80 % (tu as 75 %)')
    e = etatsPaliers(p, { 0: r(2), 1: r(2) }, null, t('2026-11-13T10:00:00Z'))
    expect(conditionPalier(e[1], e[0])).toBe('à partir du jeudi 12 novembre à 8 h (connexion à internet nécessaire pour vérifier la date)')
    expect(jourEnLettres('2027-01-04', '2026-12-20')).toBe('lundi 4 janvier 2027')
    expect(momentOuverture('2026-11-12T08:30:00+01:00', '2026-11-01')).toBe('jeudi 12 novembre à 8 h 30')
  })

  it('instant d’ouverture : 8 h chez l’enseignant, format contrôlé', () => {
    expect(jourLocal(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
    for (const jour of ['2026-11-12', '2026-07-01', '2026-03-29']) {
      const o = ouvertureDuJour(jour)
      expect(estOuverture(o)).toBe(true)
      expect(jourOuverture(o)).toBe(jour)
      // 8 h locale de l'enseignant, heure d'été comprise
      const [a, m, j] = jour.split('-').map(Number)
      expect(Date.parse(o)).toBe(new Date(a, m - 1, j, 8).getTime())
      expect(o.slice(10, 19)).toBe('T08:00:00')
    }
    expect(estJour('2028-02-29')).toBe(true)
    for (const v of ['2026-02-29', '2026-13-01', '2026-11-1', '12/11/2026', '', 20261112, null]) expect(estJour(v)).toBe(false)
    expect(estOuverture('2026-11-12T00:00:00Z')).toBe(true)
    expect(estOuverture('2026-11-12T00:00:00-05:00')).toBe(true)
    for (const v of ['2026-11-12', '2026-11-31T00:00:00+01:00', '2026-11-12T00:00:00', '2026-11-12T25:00:00+01:00', '2026-11-12 00:00:00+01:00', ''])
      expect(estOuverture(v)).toBe(false)
  })

  it('valide les paliers d’un fichier partagé et garde leurs pauses', () => {
    const p = parcoursAPaliers()
    expect(estParcours(p)).toBe(true)
    expect(estParcours({ ...p, paliers: [{ titre: 'x', nb: 1, acces: 'pause' }] })).toBe(false)
    expect(estParcours({ ...p, paliers: [{ titre: 'x', nb: 1, seuil: 120 }] })).toBe(false)
    expect(estParcours({ ...p, paliers: [{ titre: 'x', nb: 1, ouverture: '2026-11-12' }] })).toBe(false)
    expect(estParcours({ ...p, paliers: [{ titre: 'x', nb: 1, ouverture: '' }] })).toBe(false)
    p.paliers![1].ouverture = '2026-11-12T00:00:00+01:00'
    expect(estParcours(p)).toBe(true)
    expect(lireFichier(creerFichier([{ nom: '5e A', parcours: [p] }])).classes[0].parcours[0].paliers?.[1].ouverture).toBe('2026-11-12T00:00:00+01:00')
    const relu = lireFichier(creerFichier([{ nom: '5e A', parcours: [p] }])).classes[0].parcours[0]
    expect(relu.paliers?.[0].pause?.texte).toBe('On corrige ensemble.')
  })
})

describe('objectifs', () => {
  it('retient les objectifs par exercice et réglages, pas par nombre de questions', () => {
    const e1 = { ...etape('a', ['Additionner']), sup: '2' }
    const memo = memoriser({}, [e1])
    expect(memo[cleExercice({ uuid: 'a', sup: '2' })]).toEqual(['Additionner'])
    expect(memo[cleExercice({ uuid: 'a', sup: '3' })]).toBeUndefined()
    expect(cleExercice({ ...e1, nbQuestions: 9 } as never)).toBe(cleExercice(e1))
    // Un exercice jamais étiqueté ne change rien ; des objectifs retirés effacent la mémoire
    expect(memoriser(memo, [{ ...e1, objectifs: undefined }])).toEqual(memo)
    expect(memoriser(memo, [{ ...e1, objectifs: [] }])).toEqual({})
  })

  it('lit une liste collée ou un fichier objectifs-mathalea/1, sans doublon', () => {
    const colles = lireObjectifs('- Additionner\n\n• Soustraire  \n', '5e', 'Relatifs')
    expect(colles).toEqual([
      { libelle: 'Additionner', niveau: '5e', theme: 'Relatifs' },
      { libelle: 'Soustraire', niveau: '5e', theme: 'Relatifs' },
    ])
    const fichier = lireObjectifs(JSON.stringify({ format: 'objectifs-mathalea/1', objectifs: [{ libelle: 'Additionner deux nombres décimaux relatifs', code: '5N2G' }] }), '5e', 'Relatifs')
    expect(fichier[0].code).toBe('5N2G')
    expect(() => lireObjectifs('{"format":"autre"}', '5e', 'x')).toThrow()
    expect(fusionnerObjectifs(colles, [...colles, ...fichier])).toHaveLength(3)
    expect(completerListe(colles, ['Additionner', ' Multiplier '], '5e', 'Relatifs').map((o) => o.libelle)).toEqual(['Additionner', 'Soustraire', 'Multiplier'])
  })

  it('lit un tableau CSV (en-tête, point-virgule, tabulation, guillemets) et le relit après export', () => {
    const csv = 'Code;Libellé;Niveau;Chapitre\n5N2G;Additionner deux nombres décimaux relatifs;5e;Nombres relatifs\n;"Lire ; écrire";;\n'
    expect(lireObjectifs(csv, '4e', 'Fractions')).toEqual([
      { libelle: 'Additionner deux nombres décimaux relatifs', code: '5N2G', niveau: '5e', theme: 'Nombres relatifs' },
      { libelle: 'Lire ; écrire', niveau: '4e', theme: 'Fractions' },
    ])
    // Sans en-tête : code ; libellé ; niveau ; chapitre, ou une colonne de libellés
    expect(lireObjectifs('5N2G\tAdditionner\t5e\tRelatifs', '', '')[0]).toEqual({ libelle: 'Additionner', code: '5N2G', niveau: '5e', theme: 'Relatifs' })
    // Virgule seulement avec un en-tête : une phrase avec une virgule reste un libellé
    expect(lireObjectifs('Additionner, soustraire', '5e', 'R')[0].libelle).toBe('Additionner, soustraire')
    expect(lireObjectifs('libelle,niveau\nMultiplier,4e', '5e', 'R')[0]).toEqual({ libelle: 'Multiplier', niveau: '4e', theme: 'R' })
    const liste = lireObjectifs(csv, '4e', 'Fractions')
    expect(lireObjectifs('\uFEFF' + objectifsEnCsv(liste), '', '')).toEqual(liste)
  })

  it('donne la réussite par objectif d’après les derniers résultats', () => {
    const o = resultatsParObjectif(parcoursAPaliers(), { 0: r(2), 1: r(1) })
    expect(o.find((x) => x.libelle === 'Additionner')?.pourcentage).toBe(75)
    expect(o.find((x) => x.libelle === 'Soustraire')?.pourcentage).toBeNull()
  })
})

describe('bibliothèque par niveau, classes à part', () => {
  it('propose d’abord les chapitres du niveau', () => {
    const c = chapitres(
      [
        { niveau: '5e', theme: 'Relatifs' },
        { niveau: '4e', theme: 'Fractions' },
      ],
      '5e',
    )
    expect(c).toEqual({ duNiveau: ['Relatifs'], autres: ['Fractions'] })
  })

  it('crée sans classe, puis attribue, choisit par classe, renomme et retire', () => {
    let b = enregistrer({ classes: [], parcours: [] }, [], parcoursAPaliers())
    expect(b.parcours[0].classes).toEqual([])
    b = attribuer(b, 'relatifs', ['5e A'])
    expect(b.classes.map((c) => c.nom)).toEqual(['5e A'])
    b = ajouterClasse(b, '5e B')
    b = parcoursPourClasse(b, '5e B', ['relatifs'])
    expect(b.parcours[0].classes).toEqual(['5e A', '5e B'])
    b = { ...b, parcours: [{ ...b.parcours[0], exportee: { '5e A': 1 } }] }
    b = renommerClasse(b, '5e A', '5e C')
    expect(b.parcours[0].classes).toEqual(['5e C', '5e B'])
    expect(b.parcours[0].exportee).toEqual({ '5e C': 1 })
    expect(renommerClasse(b, '5e C', '5e B')).toBe(b)
    b = retirerClasse(b, '5e B')
    expect(b.classes.map((c) => c.nom)).toEqual(['5e C'])
    expect(b.parcours).toHaveLength(1)
    b = parcoursPourClasse(b, '5e C', [])
    expect(b.parcours[0].classes).toEqual([])
  })

  it('reprend les derniers choix pour un nouveau parcours', () => {
    const pref = preferencesDe({ ...parcoursAPaliers(), presentation: 'liste_exos', correction: 'parcours', difficulte: 2 })
    const p = parcoursVide(pref)
    expect([p.niveau, p.presentation, p.correction, p.difficulte]).toEqual(['5e', 'liste_exos', 'parcours', 2])
    expect(p.titre).toBe('')
  })

  it('accepte les nouvelles clés dans une sauvegarde et refuse une forme inattendue', () => {
    const pref = preferencesDe(parcoursAPaliers())
    expect(
      cleInvalide({
        objectifs: [{ libelle: 'Additionner', code: '5N2G', niveau: '5e', theme: 'Relatifs' }],
        etiquettes: { 'a||||': ['Additionner'] },
        'preferences-creation': pref,
      }),
    ).toBeUndefined()
    expect(cleInvalide({ objectifs: [{ libelle: 'x', niveau: '5e', theme: 't' }, { libelle: 'x', niveau: '5e', theme: 't' }] })).toBe('objectifs')
    expect(cleInvalide({ 'preferences-creation': { ...pref, correction: 'jamais' } })).toBe('preferences-creation')
  })
})

/** Passage terminé : `justes` questions correctes sur 2 à chaque exercice */
function passage(p: Parcours, etapes: number[], justes: number, fin: string): Seance {
  const s = nouvelleSeance(p, 'test', 'complet', etapes)
  for (const e of etapes) {
    s.nbQuestions[e] = 2
    for (let q = 0; q < 2; q++) s.essais.push({ etape: e, question: q, juste: q < justes, points: q < justes ? 1 : 0, total: 1, reponses: {}, le: fin })
  }
  s.fin = fin
  return s
}

describe('suivi de l’élève', () => {
  it('donne pour chaque objectif la meilleure réussite et la dernière fois travaillé', () => {
    const p = parcoursAPaliers()
    const o = objectifsTravailles([passage(p, [0, 1], 2, '2026-10-01T10:00:00Z'), passage(p, [0, 1], 1, '2026-10-12T10:00:00Z')])
    const add = o.find((x) => x.libelle === 'Additionner')!
    expect(add.meilleur).toBe(100)
    expect(add.dernier).toBe('2026-10-12T10:00:00Z')
    expect(add.passages).toBe(4) // deux exercices par passage
    expect(o.find((x) => x.libelle === 'Soustraire')).toBeUndefined()
    expect([maitrise(30), maitrise(50), maitrise(75), maitrise(95)]).toEqual([0, 1, 2, 3])
  })

  it('donne les ceintures obtenues, à partir de la première choisie', () => {
    const p = { ...parcoursAPaliers(), style: 'ceintures' as const, premiereCeinture: 2 }
    // Ceinture orange (palier 1) réussie à 50 % : le palier suivant demande 80 %, elle n’est pas obtenue
    let c = ceinturesObtenues(p, [passage(p, [0, 1], 1, '2026-10-01T10:00:00Z')])
    expect(c.map((x) => x.nom)).toEqual(['Ceinture orange', 'Ceinture verte', 'Ceinture bleue'])
    expect(c[0].obtenue).toBe(false)
    c = ceinturesObtenues(p, [passage(p, [0, 1], 2, '2026-10-02T10:00:00Z'), passage(p, [2], 2, '2026-10-03T10:00:00Z')])
    expect(c.map((x) => x.obtenue)).toEqual([true, true, false])
  })
})

describe('exercice sans réponse à saisir (sur papier)', () => {
  it('reste hors du score, des questions passées et des seuils', () => {
    const p = parcoursAPaliers()
    // Exercice 0 : deux questions correctes ; exercice 1 : deux questions sur papier, une correction vue
    const s = passage(p, [0], 2, '2026-10-17T10:00:00Z')
    s.etapes = [0, 1]
    s.nbQuestions[1] = 2
    s.papier = { '1-0': true, '1-1': false }
    const b = bilan(s)
    expect([b.points, b.sur, b.pourcentage, b.passees.length]).toEqual([2, 2, 100, 0])
    expect(b.parEtape[1]).toMatchObject({ sur: 0, papier: 2, vues: 1 })
    // Tout sur papier : rien de manqué
    const t = nouvelleSeance(p, 'test', 'complet', [1])
    t.nbQuestions[1] = 2
    t.papier = { '1-0': false, '1-1': false }
    expect([bilan(t).sur, bilan(t).pourcentage, bilan(t).passees.length]).toEqual([0, 100, 0])
    expect(cleInvalide({ 'seance:relatifs': s })).toBeUndefined()
    expect(cleInvalide({ 'seance:relatifs': { ...s, papier: { '1-0': 'oui' } } })).toBe('seance:relatifs')
  })
})
