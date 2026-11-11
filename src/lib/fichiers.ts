// Enregistrement d'un fichier choisi par l'utilisateur
import { choisirEnregistrement } from './choixEnregistrement.svelte'
import { dansTauri } from './stockage'

/** Téléphone ou tablette (Android, iPhone, iPad, qui se présente comme un Mac
 * tactile) : le fichier part par la feuille de partage (kDrive, Dropbox, Drive,
 * courriel…) */
export const partageNatif =
  dansTauri && (/Android|iPhone|iPad/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1))

/** Android : le fichier peut aussi être enregistré sur le téléphone (la
 * feuille de partage ne le propose pas toujours ; iOS a « Enregistrer dans Fichiers ») */
const android = dansTauri && /Android/i.test(navigator.userAgent)

/** Envoyé par la feuille de partage, écrit dans un fichier, ou annulé (false) */
export type Enregistrement = 'partage' | 'fichier' | false

export async function enregistrerFichier(nom: string, texte: string): Promise<Enregistrement> {
  // Parcours en JSON, liste d'objectifs en CSV (tableur), réponses de session en texte
  const csv = nom.endsWith('.csv')
  const txt = nom.endsWith('.txt')
  if (partageNatif) {
    const { invoke } = await import('@tauri-apps/api/core')
    const choix = android ? await choisirEnregistrement(nom) : 'partager'
    if (!choix) return false
    if (choix === 'enregistrer') return (await invoke<boolean>('enregistrer_fichier', { nom, texte })) ? 'fichier' : false
    return (await invoke<boolean>('partager_fichier', { nom, texte })) ? 'partage' : false
  }
  if (dansTauri) {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const { writeTextFile } = await import('@tauri-apps/plugin-fs')
    const chemin = await save({ defaultPath: nom, filters: [csv ? { name: 'CSV', extensions: ['csv'] } : txt ? { name: 'Texte', extensions: ['txt'] } : { name: 'JSON', extensions: ['json'] }] })
    if (!chemin) return false
    await writeTextFile(chemin, texte)
    return 'fichier'
  }
  const lien = document.createElement('a')
  lien.href = URL.createObjectURL(new Blob([texte], { type: csv ? 'text/csv' : txt ? 'text/plain' : 'application/json' }))
  lien.download = nom
  lien.click()
  setTimeout(() => URL.revokeObjectURL(lien.href), 1000)
  return 'fichier'
}

/** Fichier binaire (octets en base64) : partagé, enregistré sur le téléphone, ou « Enregistrer sous » */
async function enregistrerOctets(nom: string, base64: string, type: string, filtre: { name: string; extensions: string[] }): Promise<Enregistrement> {
  if (partageNatif) {
    const { invoke } = await import('@tauri-apps/api/core')
    const choix = android ? await choisirEnregistrement(nom) : 'partager'
    if (!choix) return false
    const args = { nom, texte: '', base64 }
    if (choix === 'enregistrer') return (await invoke<boolean>('enregistrer_fichier', args)) ? 'fichier' : false
    return (await invoke<boolean>('partager_fichier', args)) ? 'partage' : false
  }
  const octets = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  if (dansTauri) {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const { writeFile } = await import('@tauri-apps/plugin-fs')
    const chemin = await save({ defaultPath: nom, filters: [filtre] })
    if (!chemin) return false
    await writeFile(chemin, octets)
    return 'fichier'
  }
  const lien = document.createElement('a')
  lien.href = URL.createObjectURL(new Blob([octets], { type }))
  lien.download = nom
  lien.click()
  setTimeout(() => URL.revokeObjectURL(lien.href), 1000)
  return 'fichier'
}

/** Image PNG (octets en base64) */
export const enregistrerImage = (nom: string, base64: string) => enregistrerOctets(nom, base64, 'image/png', { name: 'Image PNG', extensions: ['png'] })

/** Document PDF (octets en base64) */
export const enregistrerPdf = (nom: string, base64: string) => enregistrerOctets(nom, base64, 'application/pdf', { name: 'PDF', extensions: ['pdf'] })

/**
 * Lien que l'app accepte d'ouvrir : `https:`, ou `mailto:` (contact,
 * signalement). Un parcours vient d'un dossier partagé ou d'une publication :
 * un lien `javascript:`, `data:`, `file:` ou `http:` saisi dedans n'est jamais ouvert.
 */
export function lienSur(adresse: string): boolean {
  try {
    return ['https:', 'mailto:'].includes(new URL(adresse.trim()).protocol)
  } catch {
    return false
  }
}

/** Ouvre un lien (ressource d'un palier, dossier partagé) dans le navigateur du téléphone */
export async function ouvrirLien(adresse: string) {
  if (!lienSur(adresse)) return
  adresse = adresse.trim()
  try {
    const { openUrl } = await import('@tauri-apps/plugin-opener')
    await openUrl(adresse)
  } catch {
    window.open(adresse, '_blank', 'noopener')
  }
}
