import { describe, expect, it } from 'vitest'
import { paliersDe, type Parcours } from '../src/lib/catalogue'
import { enregistrer, exporter, parcoursVide, reprendre } from '../src/lib/bibliotheque'
import { acquisDe, ceinturesObtenues, etatsPaliers } from '../src/lib/objectifs'
import { creerFichier, lireFichier } from '../src/lib/partage'
import { lireHistorique, lireResultats, nouvelleSeance, terminerSeance, type Seance } from '../src/lib/progression'
import type { Stockage } from '../src/lib/stockage'
import { exporterSauvegarde, restaurerSauvegarde, resumerSauvegarde } from '../src/lib/sauvegarde'

const etape = (uuid: string, nbQuestions = 2) => ({ uuid, id: uuid, titre: uuid, nbQuestions })

/** Trois ceintures : orange (a, b), verte (c), bleue (d) ; accès par seuil de 80 % pour les deux dernières */
const v1 = (): Parcours => ({
  ...parcoursVide(),
  id: 'relatifs',
  titre: 'Relatifs',
  niveau: '5e',
  theme: 'Nombres relatifs',
  style: 'ceintures',
  version: 1,
  etapes: [etape('a'), etape('b'), etape('c'), etape('d')],
  paliers: [
    { titre: '', nb: 2 },
    { titre: '', nb: 1, acces: 'seuil', seuil: 80 },
    { titre: '', nb: 1, acces: 'seuil', seuil: 80 },
  ],
})

// Deux passages commencés dans la même milliseconde se prendraient pour une reprise (même `debut`)
let n = 0

/** Passage terminé d'un palier : `bonnes` réponses justes sur le total des questions */
function passage(p: Parcours, etapes: number[], bonnes = Infinity): Seance {
  const s = nouvelleSeance(p, 'essai', 'complet', etapes)
  s.debut = new Date(Date.UTC(2026, 9, 13, 10, 0, n++)).toISOString()
  let vues = 0
  for (const e of etapes) {
    s.nbQuestions[e] = p.etapes[e].nbQuestions ?? 1
    for (let q = 0; q < s.nbQuestions[e]; q++) {
      const juste = vues++ < bonnes
      s.essais.push({ etape: e, question: q, juste, points: juste ? 1 : 0, total: 1, reponses: {}, le: '2026-10-13T10:00:00Z' })
    }
  }
  s.fin = '2026-10-13T10:05:00Z'
  return s
}

const stockage = (initial: Record<string, unknown> = {}) => {
  const d = new Map(Object.entries(initial))
  return {
    d,
    st: {
      lire: async (c: string) => (d.has(c) ? structuredClone(d.get(c)) : null),
      ecrire: async (c: string, v: unknown) => void d.set(c, structuredClone(v)),
      effacer: async (c: string) => void d.delete(c),
      cles: async () => [...d.keys()],
    } as unknown as Stockage,
  }
}

const obtenues = (p: Parcours, passages: Seance[]) => ceinturesObtenues(p, passages).map((c) => c.obtenue)

describe('ceintures obtenues après correction du parcours', () => {
  const p1 = v1()
  const passages = [passage(p1, [0, 1]), passage(p1, [2])] // orange et verte réussies

  it('sans correction : deux ceintures sur trois', () => {
    expect(obtenues(p1, passages)).toEqual([true, true, false])
  })

  it('un exercice ajouté au premier palier décale les rangs sans retirer de ceinture', () => {
    const p2: Parcours = {
      ...p1,
      version: 2,
      etapes: [etape('a'), etape('b'), etape('nouveau'), etape('c'), etape('d')],
      paliers: [{ titre: '', nb: 3 }, { titre: '', nb: 1, acces: 'seuil', seuil: 80 }, { titre: '', nb: 1, acces: 'seuil', seuil: 80 }],
    }
    expect(obtenues(p2, passages)).toEqual([true, true, false])
  })

  it('un exercice retiré, remplacé ou réglé autrement ne retire rien', () => {
    const retire: Parcours = { ...p1, version: 2, etapes: [etape('a'), etape('c'), etape('d')], paliers: [{ titre: '', nb: 1 }, { titre: '', nb: 1, acces: 'seuil', seuil: 80 }, { titre: '', nb: 1, acces: 'seuil', seuil: 80 }] }
    expect(obtenues(retire, passages)).toEqual([true, true, false])
    const remplace: Parcours = { ...p1, version: 2, etapes: [etape('a'), etape('z'), etape('c', 5), etape('d')] }
    expect(obtenues(remplace, passages)).toEqual([true, true, false])
  })

  it('un seuil relevé ensuite ne retire pas une ceinture déjà obtenue, mais s’applique aux nouveaux passages', () => {
    const p2: Parcours = { ...p1, version: 2, paliers: [{ titre: '', nb: 2 }, { titre: '', nb: 1, acces: 'seuil', seuil: 95 }, { titre: '', nb: 1, acces: 'seuil', seuil: 80 }] }
    // Orange obtenue avec 100 % sous le seuil de 80 % de la V1 ; avec 3 sur 4 (75 %) elle ne l'aurait pas été
    expect(obtenues(p2, passages)).toEqual([true, true, false])
    const moyens = [passage(p1, [0, 1], 3)] // 75 % : sous 80 %
    expect(obtenues(p1, moyens)).toEqual([false, false, false])
  })

  it('une ceinture non obtenue ne le devient pas par une correction', () => {
    const p2: Parcours = { ...p1, version: 2, etapes: [etape('a'), etape('b'), etape('c'), etape('d'), etape('e')], paliers: [{ titre: '', nb: 2 }, { titre: '', nb: 1, acces: 'seuil', seuil: 80 }, { titre: '', nb: 2, acces: 'seuil', seuil: 80 }] }
    expect(obtenues(p2, passages)[2]).toBe(false)
    // Passage incomplet (une question non faite) : ne compte pas
    const incomplet = passage(p1, [0, 1])
    incomplet.essais.pop()
    expect(obtenues(p1, [incomplet])[0]).toBe(false)
    // Tentative non terminée : ne compte pas
    const enCours = { ...passage(p1, [0, 1]), fin: undefined }
    expect(obtenues(p1, [enCours])[0]).toBe(false)
  })

  it('un palier déplacé garde sa ceinture grâce à ses exercices', () => {
    const p2: Parcours = {
      ...p1,
      version: 2,
      etapes: [etape('c'), etape('a'), etape('b'), etape('d')],
      paliers: [{ titre: '', nb: 1 }, { titre: '', nb: 2, acces: 'seuil', seuil: 80 }, { titre: '', nb: 1, acces: 'seuil', seuil: 80 }],
    }
    expect(obtenues(p2, passages)).toEqual([true, true, false])
  })

  it('un autre parcours n’est pas compté', () => {
    expect(obtenues({ ...p1, id: 'autre' }, passages)).toEqual([false, false, false])
  })
})

describe('paliers ouverts après correction du parcours', () => {
  const p1 = v1()
  const passages = [passage(p1, [0, 1]), passage(p1, [2])]
  const r = (points: number, sur = 2) => ({ points, sur, complet: true, le: '2026-10-13' })
  // Résultats de la V1 transposés sur une V2 où un exercice a été ajouté au deuxième palier (verte)
  const p2: Parcours = { ...p1, version: 2, etapes: [etape('a'), etape('b'), etape('c'), etape('nouveau'), etape('d')], paliers: [{ titre: '', nb: 2 }, { titre: '', nb: 2, acces: 'seuil', seuil: 80 }, { titre: '', nb: 1, acces: 'seuil', seuil: 80 }] }
  const transposes = { 0: r(2), 1: r(2), 2: r(2) }

  it('sans mémoire des ceintures, le palier suivant se refermait', () => {
    expect(etatsPaliers(p2, transposes, null).map((x) => x.ouvert)).toEqual([true, true, false])
  })

  it('avec les ceintures obtenues, il reste ouvert ; le palier modifié est à finir', () => {
    const e = etatsPaliers(p2, transposes, null, Date.now(), acquisDe(p2, passages))
    expect(e.map((x) => x.ouvert)).toEqual([true, true, true])
    expect(e[1].fini).toBe(false)
    expect(e[1].faits).toBe(1)
  })

  it('un palier jamais atteint reste fermé', () => {
    const seul = [passage(p1, [0, 1])]
    const e = etatsPaliers(p2, { 0: r(2), 1: r(2) }, null, Date.now(), acquisDe(p2, seul))
    expect(e.map((x) => x.ouvert)).toEqual([true, true, false])
  })

  it('une date d’ouverture pas arrivée garde le palier fermé même si la ceinture précédente est acquise', () => {
    const date: Parcours = { ...p2, paliers: [{ titre: '', nb: 2 }, { titre: '', nb: 2, acces: 'seuil', seuil: 80 }, { titre: '', nb: 1, acces: 'seuil', seuil: 80, ouverture: '2030-01-01T08:00:00+01:00' }] }
    const e = etatsPaliers(date, transposes, Date.parse('2026-10-29T10:00:00Z'), Date.now(), acquisDe(date, passages))
    expect(e[2].ouvert).toBe(false)
    expect(e[2].avantOuverture).toBe(true)
  })

  it('sans passage, `acquis` vide : comportement d’avant', () => {
    expect(paliersDe(p2)).toHaveLength(3)
    expect(etatsPaliers(p2, {}, null).map((x) => x.ouvert)).toEqual([true, false, false])
  })
})

describe('parcours corrigé, puis données récupérées après une sauvegarde', () => {
  const termine = async (st: Stockage, p: Parcours, etapes: number[], bonnes = Infinity) => {
    const s = passage(p, etapes, bonnes)
    s.fin = undefined // terminerSeance pose la fin
    await terminerSeance(st, s)
  }

  it('l’élève garde résultats et ceintures après la sauvegarde, la restauration et la V2', async () => {
    const p1 = v1()
    const a = stockage()
    await termine(a.st, p1, [0, 1])
    await termine(a.st, p1, [2]) // verte
    const texte = await exporterSauvegarde(a.st)
    expect(resumerSauvegarde(texte)).toMatchObject({ passages: 2, enCours: 0 })

    // Nouvel appareil
    const b = stockage()
    await restaurerSauvegarde(b.st, texte)
    expect((await lireHistorique(b.st, 'relatifs')).length).toBe(2)
    expect(await lireResultats(b.st, p1)).toEqual(await lireResultats(a.st, p1))

    // L'enseignant corrige : exercice ajouté au premier palier, exercice « c » refait à zéro
    const p2: Parcours = {
      ...p1,
      version: 2,
      etapes: [etape('a'), etape('b'), etape('nouveau'), { ...etape('c'), remiseAZero: 2 }, etape('d')],
      paliers: [{ titre: '', nb: 3 }, { titre: '', nb: 1, acces: 'seuil', seuil: 80 }, { titre: '', nb: 1, acces: 'seuil', seuil: 80 }],
    }
    const res = await lireResultats(b.st, p2)
    expect(res[0]).toMatchObject({ points: 2, sur: 2 })
    expect(res[1]).toMatchObject({ points: 2, sur: 2 })
    expect(res[2]).toBeUndefined() // exercice ajouté
    expect(res[3]).toBeUndefined() // remis à zéro
    // La ceinture orange reste obtenue (passages restaurés lus avec la V2)
    const historique = await lireHistorique(b.st, 'relatifs')
    expect(obtenues(p2, historique)[0]).toBe(true)
    // Les paliers sont ouverts d'après les ceintures, pas seulement les résultats actuels
    const e = etatsPaliers(p2, res, null, Date.now(), acquisDe(p2, historique))
    expect(e[1].ouvert).toBe(true)
    // « Parcours mis à jour » : tous les passages sont d'une version antérieure
    expect(historique.every((s) => s.contenu.version < p2.version)).toBe(true)
  })

  it('après un passage en V2, la sauvegarde restaure aussi les résultats de la V2 et la V1 reste lisible', async () => {
    const p1 = v1()
    const a = stockage()
    await termine(a.st, p1, [0, 1])
    const p2: Parcours = { ...p1, version: 2, etapes: [etape('b'), etape('a', 3), etape('c'), etape('d')] }
    await termine(a.st, p2, [0, 1], 2)
    const b = stockage()
    await restaurerSauvegarde(b.st, await exporterSauvegarde(a.st))
    const h = await lireHistorique(b.st, 'relatifs')
    expect(h.map((s) => s.contenu.version)).toEqual([1, 2])
    expect(await lireResultats(b.st, p2)).toEqual(await lireResultats(a.st, p2))
    // Les clés par version sont validées à la restauration
    expect([...b.d.keys()].filter((k) => k.startsWith('resultats:')).sort()).toEqual(['resultats:relatifs@1', 'resultats:relatifs@2'])
  })

  it('une séance en cours sur la V1 revient telle quelle sur le nouvel appareil et reste sur la V1', async () => {
    const p1 = v1()
    const a = stockage()
    const s = nouvelleSeance(p1, 'essai', 'complet', [0, 1])
    s.position = 2
    await a.st.ecrire('seance:relatifs', s)
    const b = stockage()
    await restaurerSauvegarde(b.st, await exporterSauvegarde(a.st))
    const reprise = (await b.st.lire('seance:relatifs')) as Seance
    expect(reprise.contenu.version).toBe(1)
    expect(reprise.position).toBe(2)
  })

  it('le marqueur « repartir de zéro » survit à la sauvegarde de la bibliothèque, au fichier exporté et à sa relecture', async () => {
    const vide = { classes: [{ nom: '5A' }], parcours: [] as never[], objectifs: [] }
    let bib = enregistrer(vide as never, ['5A'], v1())
    // Export : la V1 est diffusée, la correction ouvre la V2 avec le marqueur
    bib = exporter(bib).bibliotheque
    const corrige = { ...bib.parcours[0].parcours, etapes: bib.parcours[0].parcours.etapes.map((e, i) => (i === 1 ? { ...e, remiseAZero: true as const } : e)) }
    bib = enregistrer(bib, ['5A'], corrige)
    const p2 = bib.parcours[0].parcours
    expect(p2.version).toBe(2)
    expect(p2.etapes[1].remiseAZero).toBe(2)

    // Sauvegarde et restauration de la bibliothèque de l'enseignant
    const a = stockage({ bibliotheque: bib })
    const b = stockage()
    await restaurerSauvegarde(b.st, await exporterSauvegarde(a.st))
    expect(((await b.st.lire('bibliotheque')) as typeof bib).parcours[0].parcours.etapes[1].remiseAZero).toBe(2)

    // Fichier déposé sur le drive, relu par l'élève
    const { texte } = exporter(bib)
    const lu = lireFichier(texte)
    expect(lu.classes[0].parcours[0].etapes[1].remiseAZero).toBe(2)
    expect(lu.bibliotheque?.parcours?.[0].etapes[1].remiseAZero).toBe(2)
    // Fichier d'une seule classe, valeur booléenne d'un éditeur qui n'a pas encore enregistré
    expect(() => lireFichier(creerFichier([{ nom: '5A', parcours: [{ ...p2, etapes: [{ ...p2.etapes[0], remiseAZero: true }, ...p2.etapes.slice(1)] }] }]))).not.toThrow()
    // Valeur absurde refusée
    const mauvais = { ...p2, etapes: [{ ...p2.etapes[0], remiseAZero: 'oui' }, ...p2.etapes.slice(1)] }
    expect(() => lireFichier(creerFichier([{ nom: '5A', parcours: [mauvais as never] }]))).toThrow()
    // La reprise par un collègue garde le marqueur
    const repris = reprendre({ classes: [], parcours: [] } as never, lu as never)
    expect(JSON.stringify(repris)).toContain('"remiseAZero":2')
  })
})
