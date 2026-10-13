// Sauvegarde personnelle : réglages, liens, bibliothèque de l'enseignant et
// suivi complet, dans un fichier versionné. Aucun identifiant n'y figure :
// l'app n'en stocke aucun. Une restauration invalide laisse tout intact.
import type { Stockage } from './stockage'

const FORMAT = 'sauvegarde-mathalea/1'

interface Sauvegarde {
  format: typeof FORMAT
  creeeLe: string
  donnees: Record<string, unknown>
}

export async function exporterSauvegarde(st: Stockage): Promise<string> {
  const donnees: Record<string, unknown> = {}
  for (const cle of await st.cles()) donnees[cle] = await st.lire(cle)
  const s: Sauvegarde = { format: FORMAT, creeeLe: new Date().toISOString(), donnees }
  return JSON.stringify(s)
}

export function lireSauvegarde(texte: string): Sauvegarde {
  let s: Sauvegarde
  try {
    s = JSON.parse(texte)
  } catch {
    throw new Error('Ce fichier n’est pas une sauvegarde MathALÉA.')
  }
  if (s?.format !== FORMAT || typeof s.donnees !== 'object' || s.donnees === null || Array.isArray(s.donnees)) {
    throw new Error('Ce fichier n’est pas une sauvegarde MathALÉA.')
  }
  return s
}

/** Remplace toutes les données par celles de la sauvegarde ; en cas d'échec, remet l'état d'avant */
export async function restaurerSauvegarde(st: Stockage, texte: string) {
  const s = lireSauvegarde(texte)
  const avant: Record<string, unknown> = {}
  for (const cle of await st.cles()) avant[cle] = await st.lire(cle)
  try {
    for (const cle of Object.keys(avant)) await st.effacer(cle)
    for (const [cle, valeur] of Object.entries(s.donnees)) await st.ecrire(cle, valeur)
  } catch (e) {
    for (const cle of await st.cles()) await st.effacer(cle)
    for (const [cle, valeur] of Object.entries(avant)) await st.ecrire(cle, valeur)
    throw new Error(`Restauration impossible, rien n’a changé (${(e as Error).message}).`)
  }
}
