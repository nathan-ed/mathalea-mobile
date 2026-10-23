// Partage des parcours sans identifiants : l'enseignant publie un fichier daté
// (parcours-mathalea-<date>.json) et le dépose dans un dossier partagé par
// lien public. L'app de l'élève relit tous les .json du dossier (la
// publication la plus récente fait foi) et reprend chaque parcours dont la
// version a augmenté.
import { strFromU8, unzipSync } from 'fflate'
import type { Parcours } from './catalogue'
import type { Objectif } from './objectifs'
import { dansTauri, type Stockage } from './stockage'
import { classesDuFichier, estObjet, estParcours, estTexte, listeDe, optionnel, parcoursUniques } from './validation'

export const NOM_FICHIER = 'parcours-mathalea.json'

/**
 * Nom d'une publication : horodaté, pour qu'un nouveau dépôt ne soit jamais
 * renommé « (1) » ni confondu avec le précédent. L'app lit tous les .json du
 * dossier, quel que soit leur nom (voir lireFichierDistant).
 */
export function nomHorodate(base: string, date = new Date()) {
  const z = (n: number) => String(n).padStart(2, '0')
  // Secondes comprises : deux publications dans la même minute gardent des noms distincts
  return `${base}-${date.getFullYear()}-${z(date.getMonth() + 1)}-${z(date.getDate())}-${z(date.getHours())}h${z(date.getMinutes())}-${z(date.getSeconds())}.json`
}
// Un fichier contient toutes les classes d'un enseignant (dossier commun) ;
// l'ancien format à une seule classe reste lisible.
const FORMAT = 'classes-mathalea/1'
const FORMAT_UNE_CLASSE = 'classe-mathalea/1'

export interface ClasseDuFichier {
  nom: string
  parcours: Parcours[] // dans l'ordre choisi par l'enseignant
}

export interface FichierClasses {
  format: typeof FORMAT
  exporteLe: string
  classes: ClasseDuFichier[]
  // Publication complète d'un enseignant (toutes ses classes) : dans un
  // dossier, seule la plus récente compte, un parcours retiré disparaît
  banque?: boolean
  // Toute la bibliothèque de l'enseignant (parcours sans classe compris,
  // objectifs) : un autre appareil ou la page du site la reprend. Les élèves l'ignorent.
  bibliotheque?: BibliothequeDuFichier
}

export interface BibliothequeDuFichier {
  parcours: Parcours[]
  objectifs?: Objectif[]
}

/** Dossier partagé suivi par l'élève (ou par l'enseignant : collègues, ressources) */
export interface Classe {
  lien: string
  nom: string // classe retenue dans le fichier ('' tant que l'élève n'a pas choisi)
  disponibles: string[] // classes présentes dans le fichier
  parcours: Parcours[]
  fichier?: ClasseDuFichier[] // tout le fichier : l'enseignant reprend les parcours de toutes les classes
  maj?: string
  erreur?: string
}

type Requete = (url: string, init?: RequestInit) => Promise<Response>

/**
 * Dans Tauri, la commande Rust « telecharger » : sans en-tête Origin, que
 * kDrive refuse (redirection vers une page d'erreur). Dans le navigateur en
 * développement, le relais du serveur Vite (vite.config.js). Sinon fetch.
 */
export const requete: Requete = async (url, init) => {
  if (dansTauri) {
    const { invoke } = await import('@tauri-apps/api/core')
    const r = await invoke<{ statut: number; corps: number[] }>('telecharger', { url })
    return new Response(r.statut === 204 ? null : new Uint8Array(r.corps), { status: r.statut })
  }
  // no-store : toujours la version du dossier, jamais celle du cache du navigateur
  if (import.meta.env?.DEV) return fetch(`/__telecharger?url=${encodeURIComponent(url)}`, { cache: 'no-store' })
  return fetch(url, { cache: 'no-store', ...init })
}

// Clé d'API Google (publique, propre à l'app) : seulement pour les liens de dossiers Google Drive
const CLE_GOOGLE: string = import.meta.env?.VITE_CLE_API_GOOGLE ?? ''

export type Service = 'kdrive' | 'dropbox' | 'google' | 'autre'

export function serviceDuLien(lien: string): Service {
  const hote = new URL(lien).hostname
  if (hote.endsWith('kdrive.infomaniak.com')) return 'kdrive'
  if (hote.endsWith('dropbox.com')) return 'dropbox'
  if (hote === 'drive.google.com') return 'google'
  return 'autre'
}

async function octets(r: Response, quoi: string) {
  if (r.status === 404 || r.status === 410 || r.status === 403 || r.status === 401) {
    throw new Error('Lien introuvable ou expiré. Demandez un nouveau lien à votre enseignant.')
  }
  if (!r.ok) throw new Error(`${quoi} : erreur ${r.status}.`)
  return new Uint8Array(await r.arrayBuffer())
}

const estJson = (nom: string) => nom.toLowerCase().endsWith('.json')
const absent = () => new Error('Le dossier ne contient pas encore de fichier de parcours.')

/**
 * kDrive : service de la page de partage (non documenté, voir sonoTour/dev.md).
 * Tous les fichiers .json du dossier (pas des sous-dossiers) : un parcours seul ou plusieurs par fichier.
 */
async function lireKdrive(lien: string, req: Requete): Promise<Uint8Array[]> {
  const m = lien.match(/kdrive\.infomaniak\.com\/app\/share\/(\d+)\/([0-9a-f-]{36})/i)
  if (!m) throw new Error('Lien kDrive non reconnu : copiez le lien de partage du dossier.')
  const api = `https://kdrive.infomaniak.com/2/app/${m[1]}/share/${m[2]}`
  const init = JSON.parse(strFromU8(await octets(await req(`${api}/init`), 'kDrive')))
  const racine = init?.data?.file_id
  if (racine == null) throw new Error('kDrive : dossier partagé illisible.')
  // Fichiers du dossier lui-même : les sous-dossiers ne sont pas lus
  const fichiers: { id: number; name: string }[] = []
  for (let page = 1; ; page++) {
    const r = await req(`${api}/files/${racine}/files?per_page=200&page=${page}`)
    const liste = JSON.parse(strFromU8(await octets(r, 'kDrive'))).data as { id: number; name: string; type: string }[]
    fichiers.push(...liste.filter((x) => x.type !== 'dir' && estJson(x.name)))
    if (liste.length < 200) break
  }
  if (!fichiers.length) throw absent()
  return Promise.all(fichiers.map(async (f) => octets(await req(`${api}/files/${f.id}/download`), 'kDrive')))
}

/** Dropbox : un dossier en dl=1 arrive en zip (ses .json, hors sous-dossiers) ; un fichier arrive tel quel */
async function lireDropbox(lien: string, req: Requete): Promise<Uint8Array[]> {
  const url = new URL(lien)
  url.searchParams.set('dl', '1')
  const contenu = await octets(await req(url.href), 'Dropbox')
  const estZip = contenu[0] === 0x50 && contenu[1] === 0x4b
  if (!estZip) return [contenu]
  // Le zip de Dropbox met les fichiers du dossier à la racine : « sous-dossier/x.json » est ignoré
  return jsonDuZip(contenu)
}

/** Google Drive : lien d'un fichier sans clé ; lien du dossier avec la clé d'API de l'app */
async function lireGoogle(lien: string, req: Requete): Promise<Uint8Array[]> {
  const fichier = lien.match(/\/file\/d\/([\w-]+)/) ?? lien.match(/[?&]id=([\w-]+)/)
  if (fichier) return [await octets(await req(`https://drive.google.com/uc?export=download&id=${fichier[1]}`), 'Google Drive')]
  const dossier = lien.match(/\/folders\/([\w-]+)/)
  if (!dossier) throw new Error('Lien Google Drive non reconnu.')
  if (!CLE_GOOGLE) throw new Error('Avec Google Drive, partagez directement le fichier de parcours (lien du fichier).')
  const q = encodeURIComponent(`'${dossier[1]}' in parents and name contains '.json' and trashed = false`)
  const liste = JSON.parse(
    strFromU8(await octets(await req(`https://www.googleapis.com/drive/v3/files?q=${q}&key=${CLE_GOOGLE}`), 'Google Drive')),
  ) as { files: { id: string }[] }
  if (!liste.files?.length) throw absent()
  return Promise.all(
    liste.files.map(async (f) => octets(await req(`https://www.googleapis.com/drive/v3/files/${f.id}?alt=media&key=${CLE_GOOGLE}`), 'Google Drive')),
  )
}

/**
 * .json d'un zip de dossier, sans ses sous-dossiers. Nextcloud range le
 * dossier partagé sous un dossier de tête à son nom (teteUnique).
 */
function jsonDuZip(contenu: Uint8Array, teteUnique = false): Uint8Array[] {
  const fichiers = unzipSync(contenu)
  const noms = Object.keys(fichiers).map((n) => n.replace(/^\//, ''))
  const tetes = new Set(noms.filter((n) => n.includes('/')).map((n) => n.split('/')[0]))
  const prefixe = teteUnique && tetes.size === 1 && !noms.some((n) => !n.includes('/') && estJson(n)) ? `${[...tetes][0]}/` : ''
  const retenus = Object.keys(fichiers).filter((n) => {
    const relatif = n.replace(/^\//, '')
    return relatif.startsWith(prefixe) && estJson(relatif) && !relatif.slice(prefixe.length).includes('/')
  })
  if (!retenus.length) throw absent()
  return retenus.map((n) => fichiers[n])
}

/**
 * Tout autre service. Un lien de partage Nextcloud (…/s/<jeton>) se lit en
 * entier : le dossier arrive en zip par …/s/<jeton>/download, quel que soit
 * le nom des fichiers. Sinon : lien d'un fichier .json, ou dossier servi tel
 * quel (WebDAV public, serveur local) avec parcours-mathalea.json dedans.
 */
async function lireAutre(lien: string, req: Requete): Promise<Uint8Array[]> {
  const url = new URL(lien)
  const nextcloud = url.pathname.match(/^(.*\/s\/[A-Za-z0-9]+)\/?$/)
  if (nextcloud) {
    const r = await req(`${url.origin}${nextcloud[1]}/download`)
    if (r.ok) {
      const contenu = new Uint8Array(await r.arrayBuffer())
      if (contenu[0] === 0x50 && contenu[1] === 0x4b) return jsonDuZip(contenu, true)
      // Partage d'un seul fichier : il arrive tel quel
      if (contenu[0] === 0x7b) return [contenu]
    }
  }
  const fichier = lien.endsWith('.json') ? lien : new URL(NOM_FICHIER, lien.endsWith('/') ? lien : lien + '/').href
  return [await octets(await req(fichier), 'Téléchargement')]
}

/**
 * Réunit plusieurs fichiers : classes de même nom fusionnées ; un parcours
 * présent dans plusieurs fichiers garde sa version la plus récente. Parmi les
 * publications complètes (banque), seule la plus récente compte : les
 * anciennes peuvent rester dans le dossier sans rien réintroduire.
 */
export function fusionner(fichiers: FichierClasses[]): FichierClasses {
  const banque = fichiers.filter((f) => f.banque).sort((a, b) => a.exporteLe.localeCompare(b.exporteLe)).at(-1)
  const retenus = fichiers.filter((f) => !f.banque || f === banque)
  const classes: ClasseDuFichier[] = []
  for (const f of retenus) {
    for (const c of f.classes) {
      let cible = classes.find((x) => x.nom === c.nom)
      if (!cible) classes.push((cible = { nom: c.nom, parcours: [] }))
      for (const p of c.parcours) {
        const i = cible.parcours.findIndex((x) => x.id === p.id)
        if (i === -1) cible.parcours.push(p)
        else if (p.version > cible.parcours[i].version) cible.parcours[i] = p
      }
    }
  }
  const exporteLe = fichiers.map((f) => f.exporteLe).sort().at(-1) ?? ''
  // Bibliothèque de l'enseignant : celle de la publication complète la plus récente
  const bibliotheque = banque?.bibliotheque
  // L'ordre des fichiers du drive est arbitraire : classes triées par nom (tri naturel : 3e avant 10e)
  classes.sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { numeric: true }))
  return { format: FORMAT, exporteLe, classes, ...(bibliotheque ? { bibliotheque } : {}) }
}

export async function lireFichierDistant(lien: string, req: Requete = requete): Promise<FichierClasses> {
  const lecteurs = { kdrive: lireKdrive, dropbox: lireDropbox, google: lireGoogle, autre: lireAutre }
  let contenus: Uint8Array[]
  try {
    contenus = await lecteurs[serviceDuLien(lien)](lien, req)
  } catch (e) {
    if (e instanceof TypeError && /URL/.test(e.message)) throw new Error('Ce lien n’est pas une adresse valide.')
    // fetch refusé : pas de réseau, ou drive qui refuse les navigateurs (kDrive)
    if (e instanceof TypeError) {
      throw new Error(
        dansTauri
          ? 'Dossier injoignable : vérifiez la connexion.'
          : 'Ce drive ne se lit pas depuis un navigateur : utilisez l’application MathALÉA.',
      )
    }
    throw e
  }
  // Un seul fichier : il doit être valide. Plusieurs : les .json qui ne sont pas des parcours sont ignorés
  if (contenus.length === 1) return lireFichier(strFromU8(contenus[0]))
  const lus = contenus.flatMap((c) => {
    try {
      return [lireFichier(strFromU8(c))]
    } catch {
      return []
    }
  })
  if (!lus.length) throw absent()
  return fusionner(lus)
}

export function lireFichier(texte: string): FichierClasses {
  const invalide = () => new Error('Ce fichier n’est pas un fichier de parcours MathALÉA valide.')
  let brut: Record<string, unknown>
  try {
    // Fichier ré-enregistré par un éditeur Windows : marque BOM en tête
    brut = JSON.parse(texte.replace(/^\uFEFF/, ''))
  } catch {
    throw invalide()
  }
  let f: FichierClasses
  if (brut.format === FORMAT_UNE_CLASSE && typeof brut.classe === 'string' && Array.isArray(brut.parcours)) {
    f = { format: FORMAT, exporteLe: String(brut.exporteLe ?? ''), classes: [{ nom: brut.classe, parcours: brut.parcours as Parcours[] }] }
  } else if (brut.format === FORMAT && Array.isArray(brut.classes)) {
    f = brut as unknown as FichierClasses
  } else {
    throw invalide()
  }
  for (const c of f.classes) {
    if (!c || typeof c.nom !== 'string' || !Array.isArray(c.parcours)) throw invalide()
    for (const p of c.parcours) verifierParcours(p)
  }
  if (!classesDuFichier(f.classes)) throw new Error("Ce fichier contient une classe ou un parcours en double.")
  if (f.bibliotheque !== undefined) {
    const b = f.bibliotheque as unknown as Record<string, unknown>
    const objectifsValides =
      b.objectifs === undefined ||
      listeDe(b.objectifs, (o) => estObjet(o) && estTexte(o.libelle) && estTexte(o.niveau) && estTexte(o.theme) && optionnel(o.code, estTexte))
    if (!estObjet(b) || !parcoursUniques(b.parcours) || !objectifsValides) throw invalide()
  }
  return f
}

function verifierParcours(p: Parcours) {
  if (!estParcours(p)) throw new Error(`Parcours invalide dans le fichier : ${String((p as Parcours | null)?.id)}`)
}

export function creerFichier(classes: ClasseDuFichier[], banque = false, bibliotheque?: BibliothequeDuFichier): string {
  const f: FichierClasses = {
    format: FORMAT,
    exporteLe: new Date().toISOString(),
    classes,
    ...(banque ? { banque: true } : {}),
    ...(bibliotheque ? { bibliotheque } : {}),
  }
  return JSON.stringify(f, null, 2)
}

/**
 * Met à jour une classe. Les parcours dont la version n'a pas augmenté sont
 * gardés tels quels ; en cas d'échec, la classe garde ce qu'elle avait.
 */
/** Classe des parcours de démonstration (Réglages, enseignant) : rien à télécharger */
export const LIEN_DEMONSTRATION = 'demonstration'

export async function synchroniserClasse(classe: Classe, req: Requete = requete): Promise<Classe> {
  if (classe.lien === LIEN_DEMONSTRATION) return classe
  try {
    const f = await lireFichierDistant(classe.lien, req)
    const disponibles = f.classes.map((c) => c.nom)
    // Une seule classe dans le fichier : c'est celle de l'élève
    const nom = disponibles.length === 1 ? disponibles[0] : disponibles.includes(classe.nom) ? classe.nom : ''
    const source = f.classes.find((c) => c.nom === nom)?.parcours ?? []
    const parcours = source.map((p) => {
      const actuel = classe.parcours.find((a) => a.id === p.id)
      return actuel && actuel.version >= p.version ? actuel : p
    })
    return { ...classe, nom, disponibles, parcours, fichier: f.classes, maj: new Date().toISOString(), erreur: undefined }
  } catch (e) {
    return { ...classe, erreur: (e as Error).message }
  }
}

export async function lireClasses(st: Stockage) {
  // Données d'anciennes versions : champs manquants complétés
  return ((await st.lire<Classe[]>('classes')) ?? [])
    .filter((c) => c && typeof c.lien === 'string')
    .map((c) => ({ ...c, nom: c.nom ?? '', disponibles: c.disponibles ?? (c.nom ? [c.nom] : []), parcours: c.parcours ?? [] }))
}

export async function ecrireClasses(st: Stockage, classes: Classe[]) {
  await st.ecrire('classes', classes)
}

/**
 * Explorer : dossier partagé de l'équipe MathALÉA, au même format que ceux des
 * enseignants (une « classe » par thème ou par niveau). Adresse provisoire, à
 * fixer avec l'équipe ; VITE_URL_EXPLORER pour les essais.
 */
export const URL_EXPLORER: string = import.meta.env?.VITE_URL_EXPLORER ?? 'https://coopmaths.fr/alea/parcours/'

/** Parcours du catalogue Explorer (doublons retirés) */
export async function lireExplorer(req: Requete = requete): Promise<Parcours[]> {
  const fichier = await lireFichierDistant(URL_EXPLORER, req)
  const vus = new Map<string, Parcours>()
  for (const c of fichier.classes) for (const p of c.parcours) vus.set(p.id, p)
  return [...vus.values()]
}
