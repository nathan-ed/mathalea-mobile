// Classes Tailwind reprises telles quelles de MathALÉA ; elles sont compilées
// dans moteur.css. Ne pas en inventer : une classe absente du site n'y figure pas.

/** Bouton de vérification de la vue élève (ExerciceMathaleaVueEleve.svelte) */
export const boutonAction = `inline-block px-6 py-2.5
  bg-coopmaths-action dark:bg-coopmathsdark-action
  text-coopmaths-canvas dark:text-coopmathsdark-canvas
  font-medium text-xs leading-tight uppercase rounded shadow-md
  transform hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest
  hover:shadow-lg focus:bg-coopmaths-action-lightest dark:focus:bg-coopmathsdark-action-lightest
  focus:shadow-lg focus:outline-none focus:ring-0
  active:bg-coopmaths-action-lightest dark:active:bg-coopmathsdark-action-lightest
  active:shadow-lg transition duration-150 ease-in-out`

/** Variante « inverted » de ButtonTextAction.svelte */
export const boutonInverse = `inline-block px-6 py-2.5 rounded
  border border-coopmaths-action
  text-coopmaths-action dark:text-coopmathsdark-action
  bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
  font-medium text-xs leading-tight uppercase
  hover:bg-coopmaths-action dark:hover:bg-coopmathsdark-action
  hover:text-coopmaths-canvas dark:hover:text-coopmathsdark-canvas
  transition duration-150 ease-in-out`

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
