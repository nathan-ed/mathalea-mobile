// Rappel de l'enseignant, sous la barre de chaque écran : la bibliothèque de
// l'app diffère du fichier du drive, le drive n'est pas configuré, ou le
// fichier exporté n'y est pas encore.
// page.svelte tient l'état à jour et fournit l'export.
export type EtatRappel = 'differente' | 'configurer' | 'deposer' | null

export const rappelExport = $state({
  etat: null as EtatRappel,
  // Refermé par l'enseignant : jusqu'au prochain lancement de l'app (rien n'est enregistré)
  ferme: null as EtatRappel,
  exporter: async (): Promise<unknown> => undefined,
  configurer: () => {},
})
