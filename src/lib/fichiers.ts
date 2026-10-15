// Enregistrement d'un fichier choisi par l'utilisateur
import { dansTauri } from './stockage'

/** Android : le fichier part par la feuille de partage (kDrive, Dropbox, Drive, courriel…) */
export const partageNatif = dansTauri && /Android/i.test(navigator.userAgent)

export async function enregistrerFichier(nom: string, texte: string): Promise<boolean> {
  // Parcours en JSON, liste d'objectifs en CSV (tableur)
  const csv = nom.endsWith('.csv')
  if (partageNatif) {
    const { invoke } = await import('@tauri-apps/api/core')
    return invoke<boolean>('partager_fichier', { nom, texte })
  }
  if (dansTauri) {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const { writeTextFile } = await import('@tauri-apps/plugin-fs')
    const chemin = await save({ defaultPath: nom, filters: [csv ? { name: 'CSV', extensions: ['csv'] } : { name: 'JSON', extensions: ['json'] }] })
    if (!chemin) return false
    await writeTextFile(chemin, texte)
    return true
  }
  const lien = document.createElement('a')
  lien.href = URL.createObjectURL(new Blob([texte], { type: csv ? 'text/csv' : 'application/json' }))
  lien.download = nom
  lien.click()
  setTimeout(() => URL.revokeObjectURL(lien.href), 1000)
  return true
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
