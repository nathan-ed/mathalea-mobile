// Partage des parcours sans identifiants : l'enseignant exporte un fichier
// (parcours-mathalea.json) et le dépose dans un dossier partagé par lien
// public, en remplaçant l'ancien. L'app de l'élève relit ce fichier par le
// lien du dossier et reprend chaque parcours dont la version a augmenté.
import { strFromU8, unzipSync } from 'fflate'
import type { Parcours } from './catalogue'
import { dansTauri, type Stockage } from './stockage'

export const NOM_FICHIER = 'parcours-mathalea.json'
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
}

/** Dossier partagé suivi par l'élève (ou par l'enseignant : collègues, ressources) */
export interface Classe {
  lien: string
  nom: string // classe retenue dans le fichier ('' tant que l'élève n'a pas choisi)
  disponibles: string[] // classes présentes dans le fichier
  parcours: Parcours[]
  maj?: string
  erreur?: string
}

type Requete = (url: string, init?: RequestInit) => Promise<Response>

/**
 * Dans Tauri, la commande Rust « telecharger » : sans en-tête Origin, que
 * kDrive refuse (redirection vers une page d'erreur). Sinon fetch.
 */
export const requete: Requete = async (url, init) => {
  if (dansTauri) {
    const { invoke } = await import('@tauri-apps/api/core')
    const r = await invoke<{ statut: number; corps: number[] }>('telecharger', { url })
    return new Response(r.statut === 204 ? null : new Uint8Array(r.corps), { status: r.statut })
  }
  return fetch(url, init)
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

/** kDrive : service de la page de partage (non documenté, voir sonoTour/dev.md) */
async function lireKdrive(lien: string, req: Requete): Promise<Uint8Array> {
  const m = lien.match(/kdrive\.infomaniak\.com\/app\/share\/(\d+)\/([0-9a-f-]{36})/i)
  if (!m) throw new Error('Lien kDrive non reconnu : copiez le lien de partage du dossier.')
  const api = `https://kdrive.infomaniak.com/2/app/${m[1]}/share/${m[2]}`
  const init = JSON.parse(strFromU8(await octets(await req(`${api}/init`), 'kDrive')))
  const racine = init?.data?.file_id
  if (racine == null) throw new Error('kDrive : dossier partagé illisible.')
  for (let page = 1; ; page++) {
    const r = await req(`${api}/files/${racine}/files?per_page=200&page=${page}`)
    const liste = JSON.parse(strFromU8(await octets(r, 'kDrive'))).data as { id: number; name: string; type: string }[]
    const f = liste.find((x) => x.name === NOM_FICHIER && x.type !== 'dir')
    if (f) return octets(await req(`${api}/files/${f.id}/download`), 'kDrive')
    if (liste.length < 200) break
  }
  throw new Error(`Le dossier ne contient pas encore ${NOM_FICHIER}.`)
}

/** Dropbox : un dossier en dl=1 arrive en zip ; un fichier arrive tel quel */
async function lireDropbox(lien: string, req: Requete): Promise<Uint8Array> {
  const url = new URL(lien)
  url.searchParams.set('dl', '1')
  const contenu = await octets(await req(url.href), 'Dropbox')
  const estZip = contenu[0] === 0x50 && contenu[1] === 0x4b
  if (!estZip) return contenu
  const fichiers = unzipSync(contenu)
  const nom = Object.keys(fichiers).find((n) => n === NOM_FICHIER || n.endsWith(`/${NOM_FICHIER}`))
  if (!nom) throw new Error(`Le dossier ne contient pas encore ${NOM_FICHIER}.`)
  return fichiers[nom]
}

/** Google Drive : lien du fichier sans clé ; lien du dossier avec la clé d'API de l'app */
async function lireGoogle(lien: string, req: Requete): Promise<Uint8Array> {
  const fichier = lien.match(/\/file\/d\/([\w-]+)/) ?? lien.match(/[?&]id=([\w-]+)/)
  if (fichier) return octets(await req(`https://drive.google.com/uc?export=download&id=${fichier[1]}`), 'Google Drive')
  const dossier = lien.match(/\/folders\/([\w-]+)/)
  if (!dossier) throw new Error('Lien Google Drive non reconnu.')
  if (!CLE_GOOGLE) throw new Error(`Avec Google Drive, partagez directement le fichier ${NOM_FICHIER} (lien du fichier).`)
  const q = encodeURIComponent(`'${dossier[1]}' in parents and name = '${NOM_FICHIER}' and trashed = false`)
  const liste = JSON.parse(
    strFromU8(await octets(await req(`https://www.googleapis.com/drive/v3/files?q=${q}&key=${CLE_GOOGLE}`), 'Google Drive')),
  ) as { files: { id: string }[] }
  if (!liste.files?.length) throw new Error(`Le dossier ne contient pas encore ${NOM_FICHIER}.`)
  return octets(await req(`https://www.googleapis.com/drive/v3/files/${liste.files[0].id}?alt=media&key=${CLE_GOOGLE}`), 'Google Drive')
}

/** Tout autre service (Nextcloud, WebDAV public…) : lien du dossier + nom du fichier, ou lien du fichier */
async function lireAutre(lien: string, req: Requete): Promise<Uint8Array> {
  const url = lien.endsWith('.json') ? lien : new URL(NOM_FICHIER, lien.endsWith('/') ? lien : lien + '/').href
  return octets(await req(url), 'Téléchargement')
}

export async function lireFichierDistant(lien: string, req: Requete = requete): Promise<FichierClasses> {
  const lecteurs = { kdrive: lireKdrive, dropbox: lireDropbox, google: lireGoogle, autre: lireAutre }
  let texte: string
  try {
    texte = strFromU8(await lecteurs[serviceDuLien(lien)](lien, req))
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
  return lireFichier(texte)
}

export function lireFichier(texte: string): FichierClasses {
  const invalide = () => new Error(`Ce fichier n’est pas un ${NOM_FICHIER} valide.`)
  let brut: Record<string, unknown>
  try {
    brut = JSON.parse(texte)
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
    if (typeof c.nom !== 'string' || !Array.isArray(c.parcours)) throw invalide()
    for (const p of c.parcours) verifierParcours(p)
  }
  return f
}

function verifierParcours(p: Parcours) {
  const valide =
    typeof p.id === 'string' &&
    /^[a-z0-9-]+$/.test(p.id) &&
    Number.isInteger(p.version) &&
    Array.isArray(p.etapes) &&
    p.etapes.every((e) => typeof e.uuid === 'string' && typeof e.titre === 'string')
  if (!valide) throw new Error(`Parcours invalide dans le fichier : ${String(p.id)}`)
}

export function creerFichier(classes: ClasseDuFichier[]): string {
  const f: FichierClasses = { format: FORMAT, exporteLe: new Date().toISOString(), classes }
  return JSON.stringify(f, null, 2)
}

/**
 * Met à jour une classe. Les parcours dont la version n'a pas augmenté sont
 * gardés tels quels ; en cas d'échec, la classe garde ce qu'elle avait.
 */
export async function synchroniserClasse(classe: Classe, req: Requete = requete): Promise<Classe> {
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
    return { ...classe, nom, disponibles, parcours, maj: new Date().toISOString(), erreur: undefined }
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
