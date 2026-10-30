// Fichiers de parcours livrés avec le dépôt (Explorer, démonstration, exemple
// du guide), lus par le vrai lecteur de l'app. Un palier dont le nombre
// d'exercices ne tombe pas juste est ignoré sans bruit par paliersDe : les
// ceintures disparaîtraient chez les élèves sans qu'aucun écran ne le signale.
import { describe, expect, it } from 'vitest'
import { auteursTexte, decouperAuteurs, paliersDe, type Parcours } from '../src/lib/catalogue'
import { arborescence, reperesParDefaut } from '../src/lib/explorer'
import { lireFichier } from '../src/lib/partage'

const fs = 'node:fs'
const { readFileSync, readdirSync } = await import(/* @vite-ignore */ fs)
const lire = (chemin: string) => lireFichier(readFileSync(chemin, 'utf8') as string)

const EXPLORER = (readdirSync('explorer') as string[]).filter((f) => f.endsWith('.json')).map((f) => `explorer/${f}`)
const FICHIERS = [...EXPLORER, 'static/demo/parcours-demonstration.json', 'docs/guide/exemple-parcours.json']
const parcoursDe = (chemin: string) => {
  const f = lire(chemin)
  return [...f.classes.flatMap((c) => c.parcours), ...(f.bibliotheque?.parcours ?? [])]
}
const catalogue = EXPLORER.flatMap(parcoursDe)

describe('fichiers de parcours livrés', () => {
  it.each(FICHIERS)('%s est lu sans erreur par l’app', (chemin) => {
    expect(() => lire(chemin)).not.toThrow()
    expect(parcoursDe(chemin).length).toBeGreaterThan(0)
  })

  it.each(FICHIERS)('%s : chaque palier compte exactement ses exercices', (chemin) => {
    for (const p of parcoursDe(chemin)) {
      if (!p.paliers) continue
      expect(p.paliers.reduce((a, x) => a + x.nb, 0), p.id).toBe(p.etapes.length)
      expect(paliersDe(p).length, p.id).toBe(p.paliers.length)
      for (const x of p.paliers) expect(x.nb, `${p.id} : ${x.titre}`).toBeGreaterThan(0)
    }
  })

  it.each(FICHIERS)('%s : chaque exercice a un uuid, un titre et des questions', (chemin) => {
    for (const p of parcoursDe(chemin))
      for (const e of p.etapes) {
        expect(e.uuid, p.id).toMatch(/^[0-9a-z]{5,}$/)
        expect(e.titre.trim(), `${p.id} : ${e.uuid}`).not.toBe('')
        expect(e.nbQuestions, `${p.id} : ${e.uuid}`).toBeGreaterThan(0)
      }
  })
})

describe('catalogue de l’Explorer', () => {
  it('aucun identifiant de parcours en double d’un fichier à l’autre', () => {
    const ids = catalogue.map((p) => p.id)
    expect(ids.length).toBe(new Set(ids).size)
  })

  it('chaque parcours dit qui l’a rédigé', () => {
    for (const p of catalogue) {
      expect(p.auteurs?.length, p.id).toBeGreaterThan(0)
      expect(auteursTexte(p), p.id).not.toBe('')
    }
  })

  it('les parcours suisses ne sont vus qu’en Suisse, les français qu’en France', () => {
    const ch = arborescence(catalogue, 'CH', reperesParDefaut('CH')).flatMap((n) => n.chapitres.flatMap((c) => c.parcours.map((p) => p.id)))
    const fr = arborescence(catalogue, 'FR', reperesParDefaut('FR')).flatMap((n) => n.chapitres.flatMap((c) => c.parcours.map((p) => p.id)))
    expect(ch.length + fr.length).toBe(catalogue.length)
    expect(ch.filter((id) => fr.includes(id))).toEqual([])
    const niveau = (id: string) => catalogue.find((p) => p.id === id)!.niveau
    for (const id of ch) expect(['9e', '10e', '11e', 'Préqualifiant', '1re Collège', '2e Collège', '3e Collège', '4e Collège']).toContain(niveau(id))
  })

  it('degrés suisses dans l’ordre : 11e, Préqualifiant, puis le Collège', () => {
    const degres = arborescence(catalogue, 'CH', reperesParDefaut('CH')).map((n) => n.niveau)
    expect(degres.indexOf('11e')).toBeLessThan(degres.indexOf('Préqualifiant'))
    expect(degres.indexOf('Préqualifiant')).toBeLessThan(degres.indexOf('4e Collège'))
  })
})

describe('auteurs', () => {
  const avec = (auteurs?: string[]) => ({ auteurs }) as Pick<Parcours, 'auteurs'>
  it('écrit la liste en une phrase', () => {
    expect(auteursTexte(avec())).toBe('')
    expect(auteursTexte(avec([]))).toBe('')
    expect(auteursTexte(avec(['Ana']))).toBe('Ana')
    expect(auteursTexte(avec(['Ana', 'Ben']))).toBe('Ana et Ben')
    expect(auteursTexte(avec(['Ana', 'Ben', 'Chloé']))).toBe('Ana, Ben et Chloé')
  })

  it('découpe la saisie aux virgules et points-virgules, sans vides ni doublons', () => {
    expect(decouperAuteurs('')).toEqual([])
    expect(decouperAuteurs(' , ; ')).toEqual([])
    expect(decouperAuteurs('Ana, Ben; ')).toEqual(['Ana', 'Ben'])
    expect(decouperAuteurs('Ana,Ana , Ben')).toEqual(['Ana', 'Ben'])
    expect(decouperAuteurs('Équipe CoopMaths')).toEqual(['Équipe CoopMaths'])
  })

  it('un fichier avec des auteurs mal formés est refusé', () => {
    const base = parcoursDe('docs/guide/exemple-parcours.json')[0]
    const fichier = (p: unknown) => JSON.stringify({ format: 'classes-mathalea/1', exporteLe: '', classes: [{ nom: 'A', parcours: [p] }] })
    expect(() => lireFichier(fichier({ ...base, auteurs: ['Ana'], descriptionEleves: 'x', descriptionEnseignant: 'y' }))).not.toThrow()
    expect(() => lireFichier(fichier({ ...base, auteurs: 'Ana' }))).toThrow()
    expect(() => lireFichier(fichier({ ...base, auteurs: [1] }))).toThrow()
    expect(() => lireFichier(fichier({ ...base, descriptionEleves: 3 }))).toThrow()
  })
})

describe('catalogue intégré à l’app', () => {
  it('reprend tous les parcours des fichiers explorer/*.json', async () => {
    const { catalogueIntegre } = await import('../src/lib/catalogueIntegre')
    const integre = await catalogueIntegre()
    expect(integre.map((p) => p.id).sort()).toEqual(catalogue.map((p) => p.id).sort())
  })

  it('une version plus récente reçue en ligne remplace celle de l’app, pas une plus ancienne', async () => {
    const { fusionnerCatalogues } = await import('../src/lib/catalogueIntegre')
    const [a, b] = catalogue
    const recu = [{ ...a, version: a.version + 1, titre: 'Nouveau' }, { ...b, version: b.version - 1, titre: 'Ancien' }]
    const f = fusionnerCatalogues(catalogue, recu)
    expect(f.length).toBe(catalogue.length)
    expect(f.find((p) => p.id === a.id)!.titre).toBe('Nouveau')
    expect(f.find((p) => p.id === b.id)!.titre).toBe(b.titre)
    expect(f.map((p) => p.id)).toEqual(catalogue.map((p) => p.id))
  })
})
