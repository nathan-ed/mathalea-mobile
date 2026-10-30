// Catalogue de l'Explorer intégré à l'app : les fichiers explorer/*.json du
// dépôt, chargés à la demande (morceau à part, hors du premier affichage) et
// lus par le même lecteur que les dossiers des enseignants. À terme, MathALÉA
// pourra le servir (VITE_URL_EXPLORER) : une version plus récente en ligne
// remplace alors celle de l'app, parcours par parcours.
import type { Parcours } from './catalogue'
import { lireFichier } from './partage'

const fichiers = import.meta.glob('/explorer/*.json', { import: 'default' })

/** Parcours du catalogue intégré, chacun une seule fois, dans l'ordre des fichiers */
export async function catalogueIntegre(): Promise<Parcours[]> {
  const listes: Parcours[][] = []
  for (const chemin of Object.keys(fichiers).sort()) {
    const f = lireFichier(JSON.stringify(await fichiers[chemin]()))
    listes.push(f.classes.flatMap((c) => c.parcours))
  }
  return fusionnerCatalogues(...listes)
}

/** Un parcours par identifiant, à sa version la plus haute, à la place du premier vu */
export function fusionnerCatalogues(...listes: Parcours[][]): Parcours[] {
  const vus = new Map<string, Parcours>()
  for (const p of listes.flat()) {
    const deja = vus.get(p.id)
    if (!deja || p.version > deja.version) vus.set(p.id, p)
  }
  return [...vus.values()]
}
