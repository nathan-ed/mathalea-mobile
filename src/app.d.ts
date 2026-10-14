// Types globaux de SvelteKit
declare global {
  namespace App {
    interface PageState {
      /** Entrée d'historique consommée par le bouton retour (navigation.svelte.ts) */
      retour?: boolean
    }
  }
}

export {}
