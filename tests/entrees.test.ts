// Ce qui arrive de l'extérieur : sauvegardes, catalogue en ligne, heure des
// serveurs. Un contenu abîmé ou piégé est refusé sans
// planter, un serveur qui ment ou ne répond pas n'ouvre jamais un palier trop tôt.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { estReleves, type ReponsesSession } from '../src/lib/releve'
import { catalogue } from './parcours-de-test'

const bonnes: ReponsesSession = { c: 'k3lr2', p: 'fractions', v: 2, d: '2026-10-30T08:00:00Z', t: 'Fractions', x: { 0: { u: 'abc' } }, r: { 0: { 0: '3' } } }

describe('relevés de l’enseignant (avant la 0.6) dans une sauvegarde', () => {
  const releve = { cle: 'k3lr2|fractions|2', code: 'k3lr2', parcours: 'fractions', version: 2, titre: 'Fractions', le: '2026-10-30T08:00:00Z', recues: [bonnes] }

  it('accepte un relevé complet, avec ses verdicts recalculés', () => {
    expect(estReleves([releve, { ...releve, creee: true, classe: '5e A', calcul: { moteur: 'm1', verdicts: { 0: { 0: { juste: true, score: 1 } } }, hors: { 0: [1] } } }])).toBe(true)
  })

  it.each([
    ['pas une liste', releve],
    ['une réponse reçue abîmée', { ...releve, recues: [{ ...bonnes, v: 'x' }] }],
    ['verdict sans score', { ...releve, calcul: { moteur: 'm1', verdicts: { 0: { 0: { juste: true } } }, hors: {} } }],
    ['étapes hors en texte', { ...releve, calcul: { moteur: 'm1', verdicts: {}, hors: { 0: ['1'] } } }],
    ['creee à faux', { ...releve, creee: false }],
    ['nom de classe trop long', { ...releve, classe: 'x'.repeat(101) }],
  ])('refuse : %s', (_, r) => {
    expect(estReleves(Array.isArray(r) ? r : r === releve ? r : [r])).toBe(false)
  })
})

describe('catalogue de l’Explorer en ligne', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('un parcours présent dans deux classes est gardé à sa version la plus haute', async () => {
    vi.stubEnv('VITE_URL_EXPLORER', 'https://exemple.fr/explorer.json')
    vi.resetModules()
    const { lireExplorer } = await import('../src/lib/partage')
    const p = catalogue[0]
    const fichier = { format: 'classes-mathalea/1', classes: [{ nom: 'A', parcours: [{ ...p, version: 3 }] }, { nom: 'B', parcours: [{ ...p, version: 1 }] }] }
    const recu = await lireExplorer([{ lien: 'https://exemple.fr/explorer.json' }], async () => new Response(JSON.stringify(fichier)))
    expect(recu.parcours.map((x) => [x.id, x.version])).toEqual([[p.id, 3]])
    expect(recu.complet).toBe(true)
  })

  it('sans adresse d’essai, le sous-dossier du pays choisi, seul (le dossier décide du pays)', async () => {
    vi.stubEnv('VITE_URL_EXPLORER', '')
    vi.resetModules()
    const { DOSSIER_EXPLORER, sourcesExplorer } = await import('../src/lib/partage')
    expect(sourcesExplorer('CH')).toEqual([{ lien: DOSSIER_EXPLORER, sousDossier: 'CH' }])
    expect(sourcesExplorer('FR')).toEqual([{ lien: DOSSIER_EXPLORER, sousDossier: 'FR' }])
  })

  it('avec une adresse d’essai, elle seule, quel que soit le pays', async () => {
    vi.stubEnv('VITE_URL_EXPLORER', 'https://exemple.fr/explorer.json')
    vi.resetModules()
    const { sourcesExplorer } = await import('../src/lib/partage')
    expect(sourcesExplorer('CH')).toEqual([{ lien: 'https://exemple.fr/explorer.json' }])
  })
})

describe('heure qui fait foi pour l’ouverture des paliers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  // Le relais du serveur de dev (/__heure) donne la date lue sur chaque serveur
  const serveurs = (dates: Record<string, string | null | 'panne'>) =>
    vi.stubGlobal('fetch', async (url: string) => {
      const cible = decodeURIComponent(url.split('url=')[1])
      const d = dates[cible]
      if (d === 'panne') throw new Error('hors ligne')
      return new Response(JSON.stringify({ date: d ?? undefined }))
    })

  const charger = async () => {
    vi.resetModules()
    return import('../src/lib/heure.svelte')
  }

  it('garde la plus petite des heures lues : un serveur en avance n’ouvre rien trop tôt', async () => {
    const { heure, synchroniserHeure, SERVEURS_HEURE } = await charger()
    serveurs({ [SERVEURS_HEURE[0]]: 'Thu, 12 Nov 2026 08:30:00 GMT', [SERVEURS_HEURE[1]]: 'Thu, 12 Nov 2026 07:00:00 GMT' })
    await synchroniserHeure()
    expect(Math.abs(heure.maintenant! - Date.parse('2026-11-12T07:00:00Z'))).toBeLessThan(1000)
  })

  it('un serveur en panne ou à l’heure illisible : l’autre suffit', async () => {
    const { heure, synchroniserHeure, SERVEURS_HEURE } = await charger()
    serveurs({ [SERVEURS_HEURE[0]]: 'panne', [SERVEURS_HEURE[1]]: 'Thu, 12 Nov 2026 07:00:00 GMT' })
    await synchroniserHeure()
    expect(Math.abs(heure.maintenant! - Date.parse('2026-11-12T07:00:00Z'))).toBeLessThan(1000)
    const second = await charger()
    serveurs({ [SERVEURS_HEURE[0]]: 'demain matin', [SERVEURS_HEURE[1]]: 'Thu, 12 Nov 2026 07:00:00 GMT' })
    await second.synchroniserHeure()
    expect(Math.abs(second.heure.maintenant! - Date.parse('2026-11-12T07:00:00Z'))).toBeLessThan(1000)
  })

  it('hors ligne : aucune heure (palier fermé), jamais celle du téléphone', async () => {
    const { heure, synchroniserHeure, SERVEURS_HEURE } = await charger()
    serveurs({ [SERVEURS_HEURE[0]]: 'panne', [SERVEURS_HEURE[1]]: null })
    await synchroniserHeure()
    expect(heure.maintenant).toBeNull()
  })

  it('une relecture ratée garde l’heure déjà lue', async () => {
    const { heure, synchroniserHeure, SERVEURS_HEURE } = await charger()
    serveurs({ [SERVEURS_HEURE[0]]: 'Thu, 12 Nov 2026 07:00:00 GMT', [SERVEURS_HEURE[1]]: 'panne' })
    await synchroniserHeure()
    serveurs({ [SERVEURS_HEURE[0]]: 'panne', [SERVEURS_HEURE[1]]: 'panne' })
    await synchroniserHeure()
    expect(Math.abs(heure.maintenant! - Date.parse('2026-11-12T07:00:00Z'))).toBeLessThan(2000)
  })
})
