// Barres d'actions fixées en bas de l'écran. Toucher un bouton pendant la
// saisie retirait le focus du champ : le clavier (téléphone ou MathALÉA) se
// fermait, la barre descendait sous le doigt et le toucher était perdu, d'où
// deux touchers pour valider. Les boutons de la barre ne prennent donc pas le
// focus : le clavier reste ouvert jusqu'à l'action, un seul toucher suffit.
// Après l'action, le clavier se referme, sauf si elle a placé le curseur dans
// un autre champ (question suivante).

/** Action Svelte à poser sur la barre : `<footer use:garderSaisie>` */
export function garderSaisie(barre: HTMLElement) {
  let champ: Element | null = null
  const garder = (e: PointerEvent) => {
    if (!(e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    champ = document.activeElement
  }
  // Le clic du bouton passe d'abord (gestionnaires de Svelte délégués à la racine)
  const refermer = () => {
    const avant = champ
    champ = null
    setTimeout(() => {
      if (avant && document.activeElement === avant) (avant as HTMLElement).blur?.()
    })
  }
  barre.addEventListener('pointerdown', garder)
  barre.addEventListener('click', refermer)
  return {
    destroy: () => {
      barre.removeEventListener('pointerdown', garder)
      barre.removeEventListener('click', refermer)
    },
  }
}
