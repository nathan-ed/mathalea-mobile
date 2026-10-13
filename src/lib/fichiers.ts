// Enregistrement d'un fichier choisi par l'utilisateur
import { dansTauri } from './stockage'

export async function enregistrerFichier(nom: string, texte: string): Promise<boolean> {
  if (dansTauri) {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const { writeTextFile } = await import('@tauri-apps/plugin-fs')
    const chemin = await save({ defaultPath: nom, filters: [{ name: 'JSON', extensions: ['json'] }] })
    if (!chemin) return false
    await writeTextFile(chemin, texte)
    return true
  }
  const lien = document.createElement('a')
  lien.href = URL.createObjectURL(new Blob([texte], { type: 'application/json' }))
  lien.download = nom
  lien.click()
  setTimeout(() => URL.revokeObjectURL(lien.href), 1000)
  return true
}
