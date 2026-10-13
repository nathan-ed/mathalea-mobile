import { describe, expect, it } from 'vitest'
import { adopter, enregistrer, exporter, aExporter, ajouterClasses, nbAExporter, parcoursVide, parcoursDeClasse } from '../src/lib/bibliotheque'
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
    const b = ajouterClasses({ classes: [], parcours: [] }, f)
    expect(b.classes.map((c) => c.nom)).toEqual(['3e A', '3e B'])
    expect(b.parcours).toHaveLength(1)
    expect(b.parcours[0].classes).toEqual(['3e A', '3e B'])
    expect(nbAExporter(b)).toBe(0)
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
  it('exporte puis restaure à l’identique', async () => {
    const a = memoire({ profil: 'eleve', 'historique:x': [{ debut: '1' }] })
    const texte = await exporterSauvegarde(a.st)
    const b = memoire({ profil: 'enseignant', autre: 1 })
    await restaurerSauvegarde(b.st, texte)
    expect(Object.fromEntries(b.d)).toEqual({ profil: 'eleve', 'historique:x': [{ debut: '1' }] })
  })
  it('refuse un fichier invalide sans rien toucher', async () => {
    const b = memoire({ profil: 'eleve' })
    await expect(restaurerSauvegarde(b.st, '{"format":"autre"}')).rejects.toThrow(/pas une sauvegarde/)
    expect(Object.fromEntries(b.d)).toEqual({ profil: 'eleve' })
  })
  it('remet l’état d’avant si l’écriture échoue en cours de route', async () => {
    const texte = await exporterSauvegarde(memoire({ a: 1, panne: 2 }).st)
    const b = memoire({ profil: 'eleve' }, 'panne')
    await expect(restaurerSauvegarde(b.st, texte)).rejects.toThrow(/rien n’a changé/)
    expect(Object.fromEntries(b.d)).toEqual({ profil: 'eleve' })
  })
})
