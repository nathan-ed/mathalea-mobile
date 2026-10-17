// Android : avant un export, l'utilisateur choisit entre la feuille de partage
// (app de drive, courriel…) et un fichier sur le téléphone. Le panneau est
// affiché par ChoixEnregistrement.svelte, monté une fois dans la page.
export type Choix = 'partager' | 'enregistrer'

export const choixEnregistrement: { demande: { nom: string; repondre: (c: Choix | null) => void } | null } = $state({ demande: null })

export function choisirEnregistrement(nom: string): Promise<Choix | null> {
  return new Promise((repondre) => {
    choixEnregistrement.demande?.repondre(null)
    choixEnregistrement.demande = {
      nom,
      repondre: (c) => {
        choixEnregistrement.demande = null
        repondre(c)
      },
    }
  })
}
