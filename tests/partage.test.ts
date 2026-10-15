import { strToU8, zipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import type { Parcours } from '../src/lib/catalogue'
import { creerFichier, fusionner, lireFichier, lireFichierDistant, NOM_FICHIER, nomHorodate, serviceDuLien, synchroniserClasse } from '../src/lib/partage'

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
    // Comme le zip réel de Dropbox : les fichiers du dossier à la racine
    const zip = zipSync({ [NOM_FICHIER]: strToU8(fichier(3)), 'autre.txt': strToU8('x') })
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
    await expect(lireFichierDistant('https://cloud.exemple.ch/s/xyz', s.req)).rejects.toThrow(/pas un fichier de parcours MathALÉA valide/)
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

describe('dossier avec plusieurs fichiers (parcours seuls et banques)', () => {
  const autre = { ...p(1, 'Puissances'), id: 'puissances-4e' }
  const banque = creerFichier([{ nom: '3e A', parcours: [p(1), autre] }])
  const seul = creerFichier([{ nom: '3e A', parcours: [p(2, 'Fractions V2')] }, { nom: '3e B', parcours: [p(2, 'Fractions V2')] }])
  const api = 'https://kdrive.infomaniak.com/2/app/123/share/0f5c2e9a-1b2c-4d5e-8f90-123456789abc'
  const lien = 'https://kdrive.infomaniak.com/app/share/123/0f5c2e9a-1b2c-4d5e-8f90-123456789abc'

  it('kDrive : lit les .json du dossier et garde la version la plus récente', async () => {
    const s = serveur({
      [`${api}/init`]: () => reponse(JSON.stringify({ data: { file_id: 7 } })),
      [`${api}/files/7/files`]: () =>
        reponse(
          JSON.stringify({
            data: [
              { id: 8, name: NOM_FICHIER, type: 'file' },
              { id: 9, name: 'parcours-fractions-v2.json', type: 'file' },
              { id: 10, name: 'notes.txt', type: 'file' },
              { id: 11, name: '3e B', type: 'dir' },
            ],
          }),
        ),

      [`${api}/files/8/download`]: () => reponse(banque),
      [`${api}/files/9/download`]: () => reponse(seul),
    })
    const f = await lireFichierDistant(lien, s.req)
    const a = f.classes.find((c) => c.nom === '3e A')!
    expect(a.parcours.map((x) => [x.id, x.version])).toEqual([
      ['fractions-4e', 2],
      ['puissances-4e', 1],
    ])
    expect(f.classes.find((c) => c.nom === '3e B')!.parcours.map((x) => x.titre)).toEqual(['Fractions V2'])
    // Ni les autres fichiers ni les sous-dossiers ne sont lus
    expect(s.demandees.some((u) => u.includes('/files/10/') || u.includes('/files/11/'))).toBe(false)
  })

  it('Dropbox : lit les .json du dossier, ignore les sous-dossiers et ce qui n’est pas un parcours', async () => {
    const zip = zipSync({
      [NOM_FICHIER]: strToU8(banque),
      'parcours-fractions-v2.json': strToU8(seul),
      'config.json': strToU8('{"autre": true}'),
      'archives/ancien.json': strToU8(creerFichier([{ nom: 'Archives', parcours: [p(9)] }])),
    })
    const s = serveur({ 'https://www.dropbox.com/scl/fo/abc': () => reponse(zip) })
    const f = await lireFichierDistant('https://www.dropbox.com/scl/fo/abc/def?rlkey=x&dl=0', s.req)
    expect(f.classes.find((c) => c.nom === '3e A')!.parcours.find((x) => x.id === 'fractions-4e')!.version).toBe(2)
    expect(f.classes.some((c) => c.nom === 'Archives')).toBe(false)
  })

  it('classes triées par nom, quel que soit l’ordre des fichiers', () => {
    const f = fusionner([
      lireFichier(creerFichier([{ nom: '10e A', parcours: [] }])),
      lireFichier(creerFichier([{ nom: 'Classe test', parcours: [] }, { nom: '3e B', parcours: [] }])),
    ])
    expect(f.classes.map((c) => c.nom)).toEqual(['3e B', '10e A', 'Classe test'])
  })

  it('une version plus ancienne ne remplace pas une plus récente, quel que soit l’ordre', () => {
    const f = fusionner([lireFichier(seul), lireFichier(banque)])
    expect(f.classes.find((c) => c.nom === '3e A')!.parcours.find((x) => x.id === 'fractions-4e')!.version).toBe(2)
  })
})

describe('publications horodatées (nom libre, la plus récente compte)', () => {
  const autre = { ...p(1, 'Puissances'), id: 'puissances-4e' }
  const banque = (exporteLe: string, parcours: Parcours[]) =>
    JSON.stringify({ ...JSON.parse(creerFichier([{ nom: '3e A', parcours }], true)), exporteLe })

  it('nom horodaté à la minute, jamais renommé « (1) »', () => {
    expect(nomHorodate('parcours-mathalea', new Date(2026, 9, 14, 9, 5, 7))).toBe('parcours-mathalea-2026-10-14-09h05-07.json')
  })

  it('seule la banque la plus récente compte : un parcours retiré disparaît, un parcours seul s’ajoute', () => {
    const ancienne = lireFichier(banque('2026-10-01T08:00:00Z', [p(1), autre]))
    const recente = lireFichier(banque('2026-10-14T08:00:00Z', [p(2)]))
    const seul = lireFichier(creerFichier([{ nom: '3e B', parcours: [{ ...p(1), id: 'seul', titre: 'Seul' }] }]))
    const f = fusionner([recente, seul, ancienne])
    expect(f.classes.find((c) => c.nom === '3e A')!.parcours.map((x) => [x.id, x.version])).toEqual([['fractions-4e', 2]])
    expect(f.classes.find((c) => c.nom === '3e B')!.parcours.map((x) => x.id)).toEqual(['seul'])
  })

  it('Nextcloud : le dossier arrive en zip sous un dossier de tête, noms de fichiers libres', async () => {
    const zip = zipSync({
      'Maths 3e/': new Uint8Array(),
      'Maths 3e/parcours-mathalea-2026-10-01-08h00.json': strToU8(banque('2026-10-01T08:00:00Z', [p(1), autre])),
      'Maths 3e/parcours-mathalea-2026-10-14-08h00.json': strToU8(banque('2026-10-14T08:00:00Z', [p(2)])),
      'Maths 3e/archives/vieux.json': strToU8(creerFichier([{ nom: 'Archives', parcours: [p(9)] }])),
    })
    const s = serveur({ 'https://nuage.example.fr/s/AbC123/download': () => reponse(zip) })
    const f = await lireFichierDistant('https://nuage.example.fr/s/AbC123', s.req)
    expect(f.classes.map((c) => c.nom)).toEqual(['3e A'])
    expect(f.classes[0].parcours.map((x) => [x.id, x.version])).toEqual([['fractions-4e', 2]])
  })

  it('Nextcloud : partage d’un seul fichier, puis repli sur parcours-mathalea.json hors Nextcloud', async () => {
    const s = serveur({ 'https://nuage.example.fr/index.php/s/Zz9/download': () => reponse(fichier(4)) })
    expect((await lireFichierDistant('https://nuage.example.fr/index.php/s/Zz9/', s.req)).classes[0].parcours[0].version).toBe(4)
    const local = serveur({ [`http://127.0.0.1:8702/s/Xk42demo/test/${NOM_FICHIER}`]: () => reponse(fichier(5)) })
    expect((await lireFichierDistant('http://127.0.0.1:8702/s/Xk42demo/test/', local.req)).classes[0].parcours[0].version).toBe(5)
  })

  it('Dropbox : un sous-dossier seul n’est jamais lu', async () => {
    const zip = zipSync({ 'archives/vieux.json': strToU8(fichier(9)) })
    const s = serveur({ 'https://www.dropbox.com/scl/fo/abc': () => reponse(zip) })
    await expect(lireFichierDistant('https://www.dropbox.com/scl/fo/abc/def?dl=0', s.req)).rejects.toThrow('pas encore de fichier')
  })
})
