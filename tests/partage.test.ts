import { strToU8, zipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import type { Parcours } from '../src/lib/catalogue'
import { creerFichier, lireFichierDistant, NOM_FICHIER, serviceDuLien, synchroniserClasse } from '../src/lib/partage'

const p = (version: number, titre = 'Fractions'): Parcours => ({
  id: 'fractions-4e',
  version,
  titre,
  objectif: '',
  niveau: '4e',
  theme: 'Nombres et calculs',
  difficulte: 2,
  icone: 'bx-calculator',
  presentation: 'un_exo_par_page',
  correction: 'question',
  etapes: [{ uuid: '5f429', id: '4C21', titre: 'Additionner', nbQuestions: 3 }],
})
const fichier = (version: number) => creerFichier([{ nom: '3e A', parcours: [p(version)] }])
const reponse = (corps: string | Uint8Array, status = 200) => new Response(corps, { status })

/** Faux serveur : URL → réponse, et liste des URL demandées */
function serveur(routes: Record<string, () => Response>) {
  const demandees: string[] = []
  const req = async (url: string) => {
    demandees.push(url)
    const route = Object.keys(routes).find((r) => url.startsWith(r))
    return route ? routes[route]() : reponse('', 404)
  }
  return { req, demandees }
}

describe('reconnaissance du service', () => {
  it.each([
    ['https://kdrive.infomaniak.com/app/share/123/0f5c2e9a-1b2c-4d5e-8f90-123456789abc', 'kdrive'],
    ['https://www.dropbox.com/scl/fo/abc/def?rlkey=x&dl=0', 'dropbox'],
    ['https://drive.google.com/drive/folders/1AbC', 'google'],
    ['https://cloud.exemple.ch/s/xyz', 'autre'],
  ])('%s → %s', (lien, service) => expect(serviceDuLien(lien)).toBe(service))
})

describe('kDrive (service de la page de partage)', () => {
  const api = 'https://kdrive.infomaniak.com/2/app/123/share/0f5c2e9a-1b2c-4d5e-8f90-123456789abc'
  const lien = 'https://kdrive.infomaniak.com/app/share/123/0f5c2e9a-1b2c-4d5e-8f90-123456789abc'
  it('trouve le fichier dans le dossier partagé', async () => {
    const s = serveur({
      [`${api}/init`]: () => reponse(JSON.stringify({ data: { file_id: 7 } })),
      [`${api}/files/7/files`]: () =>
        reponse(JSON.stringify({ data: [{ id: 8, name: 'cours.pdf', type: 'file' }, { id: 9, name: NOM_FICHIER, type: 'file' }] })),
      [`${api}/files/9/download`]: () => reponse(fichier(2)),
    })
    const f = await lireFichierDistant(lien, s.req)
    expect(f.classes[0].parcours[0].version).toBe(2)
    expect(s.demandees.at(-1)).toBe(`${api}/files/9/download`)
  })
  it('signale un dossier sans fichier', async () => {
    const s = serveur({
      [`${api}/init`]: () => reponse(JSON.stringify({ data: { file_id: 7 } })),
      [`${api}/files/7/files`]: () => reponse(JSON.stringify({ data: [] })),
    })
    await expect(lireFichierDistant(lien, s.req)).rejects.toThrow(/ne contient pas encore/)
  })
  it('signale un lien supprimé', async () => {
    const s = serveur({})
    await expect(lireFichierDistant(lien, s.req)).rejects.toThrow(/introuvable ou expiré/)
  })
})

describe('Dropbox', () => {
  it('lit le fichier dans le zip d’un lien de dossier (dl=1)', async () => {
    const zip = zipSync({ [`Classe 3A/${NOM_FICHIER}`]: strToU8(fichier(3)), 'Classe 3A/autre.txt': strToU8('x') })
    const s = serveur({ 'https://www.dropbox.com/scl/fo/abc': () => reponse(zip) })
    const f = await lireFichierDistant('https://www.dropbox.com/scl/fo/abc/def?rlkey=x&dl=0', s.req)
    expect(f.classes[0].parcours[0].version).toBe(3)
    expect(s.demandees[0]).toContain('dl=1')
  })
  it('lit un lien de fichier', async () => {
    const s = serveur({ 'https://www.dropbox.com/scl/fi/abc': () => reponse(fichier(1)) })
    expect((await lireFichierDistant('https://www.dropbox.com/scl/fi/abc/parcours-mathalea.json?rlkey=x', s.req)).classes[0].nom).toBe('3e A')
  })
})

describe('Google Drive', () => {
  it('lit un lien de fichier sans clé', async () => {
    const s = serveur({ 'https://drive.google.com/uc?export=download&id=1XyZ': () => reponse(fichier(1)) })
    expect((await lireFichierDistant('https://drive.google.com/file/d/1XyZ/view?usp=sharing', s.req)).classes[0].parcours).toHaveLength(1)
  })
  it('explique quoi faire pour un lien de dossier sans clé d’API', async () => {
    await expect(lireFichierDistant('https://drive.google.com/drive/folders/1AbC', serveur({}).req)).rejects.toThrow(/partagez directement le fichier/)
  })
})

describe('validation et synchronisation', () => {
  it('refuse un fichier qui n’est pas un fichier de classe', async () => {
    const s = serveur({ 'https://cloud.exemple.ch/s/xyz/': () => reponse('{"format":"autre"}') })
    await expect(lireFichierDistant('https://cloud.exemple.ch/s/xyz', s.req)).rejects.toThrow(/pas un parcours-mathalea.json valide/)
  })
  it('ne reprend que les parcours dont la version a augmenté', async () => {
    let version = 2
    const s = serveur({ 'https://cloud.exemple.ch/s/xyz/': () => reponse(creerFichier([{ nom: '3e A', parcours: [p(version, `v${version}`)] }])) })
    const c1 = await synchroniserClasse({ lien: 'https://cloud.exemple.ch/s/xyz', nom: '', disponibles: [], parcours: [p(2, 'local')] }, s.req)
    expect(c1.parcours[0].titre).toBe('local')
    version = 3
    const c2 = await synchroniserClasse(c1, s.req)
    expect(c2.parcours[0].titre).toBe('v3')
  })
  it('garde les parcours en cas d’échec', async () => {
    const c = await synchroniserClasse({ lien: 'https://cloud.exemple.ch/s/xyz', nom: '3e A', disponibles: ['3e A'], parcours: [p(2)] }, serveur({}).req)
    expect(c.parcours).toHaveLength(1)
    expect(c.erreur).toMatch(/introuvable/)
  })
})

describe('dossier commun à plusieurs classes', () => {
  const lien = 'https://cloud.exemple.ch/s/meta'
  const deux = creerFichier([
    { nom: '3e A', parcours: [p(1, 'A')] },
    { nom: '3e B', parcours: [{ ...p(1, 'B'), id: 'autre' }] },
  ])
  const s = serveur({ [`${lien}/`]: () => reponse(deux) })
  it('demande la classe quand le fichier en contient plusieurs', async () => {
    const c = await synchroniserClasse({ lien, nom: '', disponibles: [], parcours: [] }, s.req)
    expect(c.disponibles).toEqual(['3e A', '3e B'])
    expect(c.nom).toBe('')
    expect(c.parcours).toEqual([])
  })
  it('ne garde que les parcours de la classe choisie', async () => {
    const c = await synchroniserClasse({ lien, nom: '3e B', disponibles: [], parcours: [] }, s.req)
    expect(c.parcours.map((x) => x.titre)).toEqual(['B'])
  })
  it('lit encore l’ancien format à une seule classe', async () => {
    const ancien = JSON.stringify({ format: 'classe-mathalea/1', classe: 'Classe test', exporteLe: '', parcours: [p(1)] })
    const c = await synchroniserClasse({ lien: 'https://x.ch/s/a', nom: '', disponibles: [], parcours: [] }, serveur({ 'https://x.ch/s/a/': () => reponse(ancien) }).req)
    expect(c.nom).toBe('Classe test')
    expect(c.parcours).toHaveLength(1)
  })
})
