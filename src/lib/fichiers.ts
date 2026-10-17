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
  // Parcours en JSON, liste d'objectifs en CSV (tableur)
  const csv = nom.endsWith('.csv')
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
    const chemin = await save({ defaultPath: nom, filters: [csv ? { name: 'CSV', extensions: ['csv'] } : { name: 'JSON', extensions: ['json'] }] })
    if (!chemin) return false
    await writeTextFile(chemin, texte)
    return 'fichier'
  }
  const lien = document.createElement('a')
  lien.href = URL.createObjectURL(new Blob([texte], { type: csv ? 'text/csv' : 'application/json' }))
  lien.download = nom
  lien.click()
  setTimeout(() => URL.revokeObjectURL(lien.href), 1000)
  return 'fichier'
}

/** Ouvre un lien (ressource d'un palier, dossier partagé) dans le navigateur du téléphone */
export async function ouvrirLien(adresse: string) {
  try {
    const { openUrl } = await import('@tauri-apps/plugin-opener')
    await openUrl(adresse)
  } catch {
    window.open(adresse, '_blank', 'noopener')
  }
}
