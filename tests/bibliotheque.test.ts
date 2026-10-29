import { describe, expect, it } from 'vitest'
import { aJour, completerEmpreinte, sansEcartDrive, adopter, definirLien, enregistrer, exporter, exporterChoix, exporterUn, aExporter, reprendre, attribuer, nbAExporter, parcoursVide, parcoursDeClasse } from '../src/lib/bibliotheque'
import { lireFichier } from '../src/lib/partage'
import { graineDeSession, nouveauCode, nouvelleSeance } from '../src/lib/progression'

const brouillon = (titre: string) => ({
  ...parcoursVide(),
  titre,
  niveau: '4e',
  theme: 'Fractions',
  etapes: [{ uuid: '5f429', id: '4C21', titre: 'Additionner', nbQuestions: 3 }],
})

describe('bibliothèque de l’enseignant', () => {
  it('donne un même parcours à deux classes ; un seul fichier contient les deux classes', () => {
    let b = enregistrer({ classes: [], parcours: [] }, ['3e A', '3e B'], brouillon('Fractions'))
    expect(b.classes.map((c) => c.nom)).toEqual(['3e A', '3e B'])
    expect(parcoursDeClasse(b, '3e B')).toHaveLength(1)
    expect(nbAExporter(b)).toBe(1)
    const { texte, bibliotheque } = exporter(b)
    b = bibliotheque
    expect(lireFichier(texte).classes.map((c) => c.nom)).toEqual(['3e A', '3e B'])
    expect(aExporter(b.parcours[0], '3e A') || aExporter(b.parcours[0], '3e B')).toBe(false)
    expect(nbAExporter(b)).toBe(0)
  })

  it('ouvre la version suivante seulement si un parcours exporté est modifié', () => {
    let b = enregistrer({ classes: [], parcours: [] }, ['3e A'], brouillon('Fractions'))
    const p1 = b.parcours[0].parcours
    b = enregistrer(b, ['3e A'], { ...p1, titre: 'Fractions !' })
    expect(b.parcours[0].parcours.version).toBe(1) // jamais exporté : pas de nouvelle version
    b = exporter(b).bibliotheque
    b = enregistrer(b, ['3e A'], b.parcours[0].parcours) // ouvert puis validé sans changement
    expect(b.parcours[0].parcours.version).toBe(1)
    b = enregistrer(b, ['3e A'], { ...b.parcours[0].parcours, objectif: 'Additionner' })
    expect(b.parcours[0].parcours.version).toBe(2)
    expect(lireFichier(exporter(b).texte).classes[0].parcours[0].version).toBe(2)
  })

  it('retrouve ses classes depuis un fichier exporté (nouvel appareil)', () => {
    const f = lireFichier(exporter(enregistrer({ classes: [], parcours: [] }, ['3e A', '3e B'], brouillon('F'))).texte)
    const b = reprendre({ classes: [], parcours: [] }, f)
    expect(b.classes.map((c) => c.nom)).toEqual(['3e A', '3e B'])
    expect(b.parcours).toHaveLength(1)
    expect(b.parcours[0].classes).toEqual(['3e A', '3e B'])
    expect(nbAExporter(b)).toBe(0)
  })

  it('reprend toute la bibliothèque : parcours sans classe et objectifs compris, sans rien perdre localement', () => {
    let source = enregistrer({ classes: [], parcours: [] }, ['3e A'], brouillon('Fractions'))
    source = enregistrer(source, [], { ...brouillon('Brouillon sans classe'), id: '' })
    const objectifs = [{ libelle: 'Additionner des fractions', niveau: '4e', theme: 'Fractions' }]
    const f = lireFichier(exporter(source, objectifs).texte)
    expect(f.classes.map((c) => c.parcours.length)).toEqual([1])
    expect(f.bibliotheque?.parcours).toHaveLength(2)
    expect(f.bibliotheque?.objectifs).toEqual(objectifs)
    // Appareil qui a déjà un parcours à lui : il le garde
    const local = enregistrer({ classes: [], parcours: [] }, [], { ...brouillon('À moi'), id: '' })
    const b = reprendre(local, f)
    expect(b.parcours.map((pe) => pe.parcours.titre)).toEqual(['À moi', 'Fractions', 'Brouillon sans classe'])
    expect(b.parcours.find((pe) => pe.parcours.titre === 'Brouillon sans classe')?.classes).toEqual([])
    // Reprendre deux fois ne crée aucun doublon ; une version locale plus récente est gardée
    const plusRecent = attribuer(enregistrer(b, ['3e A'], { ...b.parcours[1].parcours, version: 5 }), b.parcours[1].parcours.id, ['3e A'])
    const encore = reprendre(plusRecent, f)
    expect(encore.parcours).toHaveLength(3)
    expect(encore.parcours[1].parcours.version).toBe(5)
  })
})

describe('édition d’un parcours existant', () => {
  it('garde l’identifiant et passe à la version suivante si on le modifie', () => {
    const existant = { ...brouillon('Relatifs'), id: 'relatifs-5e', version: 3 }
    let b = adopter({ classes: [], parcours: [] }, existant)
    b = enregistrer(b, ['3e A'], { ...b.parcours[0].parcours })
    expect(b.parcours[0].parcours).toMatchObject({ id: 'relatifs-5e', version: 3 })
    b = enregistrer(b, ['3e A'], { ...b.parcours[0].parcours, titre: 'Relatifs (révisé)' })
    expect(b.parcours[0].parcours).toMatchObject({ id: 'relatifs-5e', version: 4 })
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

describe('téléchargements après la création', () => {
  it('enregistrer garde le lien du dossier partagé', () => {
    const b = enregistrer(definirLien({ classes: [], parcours: [] }, 'https://exemple.ch/s/x'), ['3e A'], brouillon('Fractions'))
    expect(b.lien).toBe('https://exemple.ch/s/x')
  })

  it('un parcours seul, dans ses classes et à sa version, sans compter comme exporté dans la banque', () => {
    let b = enregistrer({ classes: [], parcours: [] }, ['3e A', '3e B'], brouillon('Fractions'))
    b = exporter(b).bibliotheque
    const id = b.parcours[0].parcours.id
    b = enregistrer(b, ['3e A', '3e B'], { ...b.parcours[0].parcours, titre: 'Fractions (corrigé)' })
    const f = exporterUn(b, id)!
    const lu = lireFichier(f.texte)
    expect(f.nom).toMatch(/^parcours-fractions-corrige-\d{4}-\d{2}-\d{2}-\d{2}h\d{2}-\d{2}\.json$/)
    expect(lu.classes.map((c) => c.nom)).toEqual(['3e A', '3e B'])
    expect(lu.classes[0].parcours[0].version).toBe(2)
    expect(nbAExporter(b)).toBe(1)
  })

  it('un parcours seul déposé aux élèves : la modification suivante ouvre une nouvelle version', () => {
    let b = enregistrer({ classes: [], parcours: [] }, ['3e A'], brouillon('Fractions'))
    const id = b.parcours[0].parcours.id
    b = exporterUn(b, id)!.bibliotheque
    b = enregistrer(b, ['3e A'], { ...b.parcours[0].parcours, titre: 'Fractions (corrigé)' })
    expect(b.parcours[0].parcours.version).toBe(2)
    expect(exporterUn(b, id)!.nom).toMatch(/^parcours-fractions-corrige-/)
  })

  it('un parcours repris d’un dossier garde ses classes et passe à la version suivante si modifié', () => {
    const p = { ...brouillon('Relatifs'), id: 'relatifs-5e', version: 3 }
    let b = adopter({ classes: [], parcours: [] }, p, ['Classe test'])
    expect(b.parcours[0].classes).toEqual(['Classe test'])
    b = enregistrer(b, ['Classe test'], { ...p, titre: 'Relatifs (repris)' })
    expect(b.parcours[0].parcours.version).toBe(4)
  })

  it('signale toute modification absente du dernier fichier complet, parcours sans classe compris', () => {
    let b = enregistrer({ classes: [], parcours: [] }, [], brouillon('Sans classe'))
    expect(aJour(b)).toBe(false)
    b = exporter(b).bibliotheque
    expect(aJour(b)).toBe(true)
    b = enregistrer(b, [], { ...b.parcours[0].parcours, objectif: 'Additionner' })
    expect(aJour(b)).toBe(false)
    b = exporter(b).bibliotheque
    b = attribuer(b, b.parcours[0].parcours.id, ['3e A'])
    expect(aJour(b)).toBe(false)
    b = exporter(b).bibliotheque
    const objectifs = [{ libelle: 'Additionner des fractions', niveau: '4e', theme: 'Fractions' }]
    expect(aJour(b, objectifs)).toBe(false)
    // Un export de quelques parcours ne remplace pas le fichier complet
    b = exporterChoix(exporter(b, objectifs).bibliotheque, [b.parcours[0].parcours.id])!.bibliotheque
    expect(aJour(b, objectifs)).toBe(true)
  })

  it('bibliothèque d’une version précédente : pas de fausse alerte si elle a déjà été exportée', () => {
    let b = exporter(enregistrer({ classes: [], parcours: [] }, ['3e A'], brouillon('Fractions'))).bibliotheque
    const ancienne = { ...b, empreinte: undefined }
    expect(aJour(ancienne)).toBe(false)
    expect(aJour(completerEmpreinte(ancienne))).toBe(true)
    // Jamais exportée, ou un parcours en attente : l'alerte reste
    const jamais = enregistrer({ classes: [], parcours: [] }, ['3e A'], brouillon('Fractions'))
    expect(completerEmpreinte(jamais)).toBe(jamais)
    b = enregistrer(ancienne, ['3e A'], { ...b.parcours[0].parcours, objectif: 'Additionner' })
    expect(aJour(completerEmpreinte(b))).toBe(false)
  })

  it('la démonstration ne rend pas le drive différent, sauf s’il l’était déjà', () => {
    const avant = exporter(enregistrer({ classes: [], parcours: [] }, ['3e A'], brouillon('Fractions'))).bibliotheque
    const demo = enregistrer(avant, ['Démonstration'], { ...brouillon('Essai'), id: '' })
    expect(aJour(sansEcartDrive(avant, [], demo, []))).toBe(true)
    const modifiee = enregistrer(avant, [], { ...brouillon('Nouveau'), id: '' })
    expect(aJour(sansEcartDrive(modifiee, [], enregistrer(modifiee, [], { ...brouillon('Essai'), id: '' }), []))).toBe(false)
  })

  it('exporte plusieurs parcours choisis dans un fichier, chacun dans ses classes', () => {
    let b = enregistrer({ classes: [], parcours: [] }, ['3e A'], brouillon('Fractions'))
    b = enregistrer(b, [], { ...brouillon('Brouillon'), id: '' })
    b = enregistrer(b, ['3e B'], { ...brouillon('Autre'), id: '' })
    const ids = b.parcours.map((pe) => pe.parcours.id)
    const f = exporterChoix(b, [ids[0], ids[1]])!
    expect(f.nom).toMatch(/^parcours-choisis-2-/)
    const lu = lireFichier(f.texte)
    expect(lu.banque).toBeUndefined()
    expect(lu.classes.map((c) => [c.nom, c.parcours.map((p) => p.titre)])).toEqual([
      ['3e A', ['Fractions']],
      ['Parcours', ['Brouillon']],
    ])
    expect(exporterChoix(b, [])).toBeNull()
  })
})

describe('ordre et copie', async () => {
  const { deplacer, copie } = await import('../src/lib/bibliotheque')
  it('déplace un parcours dans sa classe sans toucher aux autres classes', () => {
    let b = enregistrer({ classes: [], parcours: [] }, ['A'], brouillon('Un'))
    b = enregistrer(b, ['B'], brouillon('Autre'))
    b = enregistrer(b, ['A'], brouillon('Deux'))
    const id = b.parcours[2].parcours.id
    b = deplacer(b, id, 'A', -1)
    expect(parcoursDeClasse(b, 'A').map((pe) => pe.parcours.titre)).toEqual(['Deux', 'Un'])
    expect(parcoursDeClasse(b, 'B').map((pe) => pe.parcours.titre)).toEqual(['Autre'])
    expect(deplacer(b, id, 'A', -1)).toBe(b) // déjà en tête
  })
  it('une copie devient un nouveau parcours en V1', () => {
    let b = enregistrer({ classes: [], parcours: [] }, ['A'], brouillon('Un'))
    b = exporter(b).bibliotheque
    b = enregistrer(b, ['A'], { ...b.parcours[0].parcours, objectif: 'x' })
    b = enregistrer(b, ['B'], copie(b.parcours[0].parcours))
    expect(b.parcours).toHaveLength(2)
    expect(b.parcours[1].parcours).toMatchObject({ titre: 'Un (copie)', version: 1 })
    expect(b.parcours[1].parcours.id).not.toBe(b.parcours[0].parcours.id)
  })
})

describe('doublons et versions à la reprise', () => {
  const p = { ...brouillon('Relatifs'), id: 'relatifs-5e', version: 2 }
  it('reprendre deux fois le même parcours ne crée pas de doublon', () => {
    let b = adopter({ classes: [], parcours: [] }, p, ['Classe test'])
    b = adopter(b, p, ['Classe test'])
    expect(b.parcours).toHaveLength(1)
  })
  it('une version plus récente reçue pour une autre classe ajoute cette classe à la bibliothèque', () => {
    let b = adopter({ classes: [], parcours: [] }, p, ['A'])
    b = adopter(b, { ...p, version: 3 }, ['B'])
    expect(b.classes.map((c) => c.nom)).toEqual(['A', 'B'])
    expect(lireFichier(exporter(b).texte).classes.map((c) => c.nom)).toEqual(['A', 'B'])
  })
  it('une version plus récente du dossier remplace la copie locale, une plus ancienne non', () => {
    let b = adopter({ classes: [], parcours: [] }, p, ['Classe test'])
    b = adopter(b, { ...p, version: 1, titre: 'Ancienne' }, ['Classe test'])
    expect(b.parcours[0].parcours.version).toBe(2)
    b = adopter(b, { ...p, version: 3, titre: 'Nouvelle' }, ['Autre classe'])
    expect(b.parcours).toHaveLength(1)
    expect(b.parcours[0].parcours.titre).toBe('Nouvelle')
    expect(b.parcours[0].classes).toEqual(['Classe test', 'Autre classe'])
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

  it('l’enregistrement date le marqueur de la version ouverte et efface celui d’une version antérieure', () => {
    const b = { ...enregistrer({ classes: [], parcours: [] } as never, [], v1) }
    const exporte = { ...b, parcours: [{ ...b.parcours[0], exportee: { '': 1 } }] }
    const modif = { ...v1, etapes: [{ ...v1.etapes[0], remiseAZero: true as const }, v1.etapes[1]] }
    const v2 = enregistrer(exporte as never, [], modif).parcours[0].parcours
    expect(v2.version).toBe(2)
    expect(v2.etapes[0].remiseAZero).toBe(2)
    expect(v2.etapes[1].remiseAZero).toBeUndefined()
    // Nouvelle modification après un export de la V2 : la V3 ne remet rien à zéro
    const v3 = enregistrer({ ...exporte, parcours: [{ parcours: v2, classes: [], exportee: { '': 2 } }] } as never, [], { ...v2, titre: 'Autre' }).parcours[0].parcours
    expect(v3.version).toBe(3)
    expect(v3.etapes[0].remiseAZero).toBeUndefined()
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
