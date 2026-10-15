// Classes Tailwind reprises telles quelles de MathALÉA ; elles sont compilées
// dans moteur.css. Ne pas en inventer : une classe absente du site n'y figure pas.

/** Bouton principal : couleurs du bouton de vérification de MathALÉA
 * (ExerciceMathaleaVueEleve.svelte), forme d'app : texte normal, coins
 * arrondis, aucun effet au survol (il resterait collé après un toucher) */
export const boutonAction = `inline-flex items-center justify-center gap-2 px-3 py-3 text-center
  bg-coopmaths-action dark:bg-coopmathsdark-action
  text-coopmaths-canvas dark:text-coopmathsdark-canvas
  font-semibold text-sm leading-tight rounded-xl shadow-sm
  active:bg-coopmaths-action-lightest dark:active:bg-coopmathsdark-action-lightest
  transition duration-150 ease-in-out`

/** Bouton secondaire : variante « inverted » de ButtonTextAction.svelte */
export const boutonInverse = `presse inline-flex items-center justify-center gap-2 px-3 py-3 text-center rounded-xl
  border border-coopmaths-action dark:border-coopmathsdark-action
  text-coopmaths-action dark:text-coopmathsdark-action
  bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
  font-semibold text-sm leading-tight
  transition duration-150 ease-in-out`

/** Action secondaire sans cadre (lien d'une app) */
export const boutonLien = `presse inline-flex items-center justify-center gap-2 px-3 py-3 text-center rounded-xl
  text-coopmaths-action dark:text-coopmathsdark-action
  font-semibold text-sm leading-tight`

export const desactive = 'disabled:opacity-40'

/** Pastille de compteur (MobileEndingItem.svelte) */
export const pastille = `shrink-0 inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full
  bg-coopmaths-warn dark:bg-coopmathsdark-warn
  text-coopmaths-canvas dark:text-coopmathsdark-canvas text-xs font-bold`

/** Liste groupée (MobileBrowser.svelte) */
export const listeGroupee = `flex flex-col rounded-xl overflow-hidden
  border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
  divide-y divide-coopmaths-canvas-darkest dark:divide-coopmathsdark-canvas-darkest`

/** Élément de liste (MobileEndingItem.svelte) */
export const elementListe = `w-full flex flex-row items-center justify-between gap-3 px-4 py-3 text-left
  bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
  active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest
  transition-colors duration-150`

/** Pastille d'un score : couleur de réussite à partir de 80 %, neutre en dessous (0 % n'a pas l'air réussi) */
export const pastilleNeutre = `shrink-0 inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full
  bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest
  text-coopmaths-corpus dark:text-coopmathsdark-corpus text-xs font-bold`
export const pastilleScore = (pourcentage: number) => (pourcentage >= 80 ? pastille : pastilleNeutre)
