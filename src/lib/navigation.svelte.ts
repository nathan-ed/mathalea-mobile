// Navigation commune : « Quitter » de la séance et du bilan ramène à l'accueil
// (page.svelte fournit la fonction).
export const navigation = $state({ versAccueil: () => {} })

// Bouton retour du téléphone (Android), geste de retour et bouton « précédent »
// du navigateur. L'historique garde au plus une entrée en plus de la page
// (la « sentinelle ») tant qu'il y a un niveau à refermer ; la consommer
// referme le niveau le plus récent.
//
// Niveaux : chaque composant enregistre ce que fait « retour » chez lui
// (sous-niveau ouvert, confirmation, garde-fou) avec surRetour(), le plus
// récent passant en premier ; sinon, la page revient à l'écran précédent
// (retourDeBase).

type Retour = () => void

const pile: Retour[] = []
let base: Retour | null = null
let sentinelle = false
let ignorer = false
let planifie = false
let pousser: ((present: boolean) => void) | null = null

/** Enregistre un niveau à refermer par « retour » ; renvoie de quoi le retirer */
export function surRetour(fn: Retour): () => void {
  pile.push(fn)
  planifier()
  return () => {
    const i = pile.lastIndexOf(fn)
    if (i >= 0) pile.splice(i, 1)
    planifier()
  }
}

/** Retour vers l'écran précédent de la page (null : écran racine) */
export function retourDeBase(fn: Retour | null) {
  base = fn
  planifier()
}

/** Ce que fait le bouton retour du téléphone */
export function revenir() {
  const haut = pile.at(-1)
  if (haut) haut()
  else base?.()
}

/** Branché par le layout : ajoute ou retire la sentinelle de l'historique */
export function brancherHistorique(fn: (present: boolean) => void) {
  pousser = fn
  planifier()
}

/** Appelé par le layout quand l'état de l'historique change */
export function etatHistorique(present: boolean) {
  if (present === sentinelle) return
  sentinelle = present
  if (present) return
  if (ignorer) ignorer = false
  else revenir()
  planifier()
}

function planifier() {
  if (planifie) return
  planifie = true
  queueMicrotask(() => {
    planifie = false
    if (!pousser) return
    const besoin = pile.length > 0 || base !== null
    if (besoin && !sentinelle) {
      sentinelle = true
      pousser(true)
    } else if (!besoin && sentinelle && !ignorer) {
      // Plus rien à refermer : la sentinelle part, le retour suivant quitte l'app
      ignorer = true
      pousser(false)
    }
  })
}

/** Dans un composant : tant que actif() est vrai, « retour » appelle fn */
export function retourSi(actif: () => boolean, fn: Retour) {
  $effect(() => {
    if (actif()) return surRetour(fn)
  })
}
