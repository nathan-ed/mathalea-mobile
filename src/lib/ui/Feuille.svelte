<script lang="ts">
  // Panneau qui monte du bas de l'écran (confirmations) : fond assombri,
  // refermé par un toucher à côté, par Échap ou par le bouton retour du
  // téléphone. Dialogue accessible : nommé par son premier titre (texte en
  // gras), focus placé dedans et gardé dedans, puis rendu à l'élément d'origine.
  import { onMount, type Snippet } from 'svelte'
  import { retourSi } from '$lib/navigation.svelte'
  let { onfermer, children }: { onfermer: () => void; children: Snippet } = $props()
  // Priorité : le panneau se ferme avant tout autre niveau (onglet, sous-écran)
  retourSi(() => true, () => onfermer(), 1)

  let panneau: HTMLDivElement | undefined = $state()
  const id = `feuille-${Math.random().toString(36).slice(2, 8)}`
  const focusables = () =>
    [...(panneau?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? [])].filter(
      (e) => !e.hasAttribute('disabled') && e.offsetParent !== null,
    )

  onMount(() => {
    const origine = document.activeElement as HTMLElement | null
    // Le clavier (téléphone ou MathALÉA) se ferme : le panneau reste visible en entier
    origine?.blur()
    const titre = panneau?.querySelector<HTMLElement>('h2, .font-bold')
    if (titre) {
      titre.id ||= `${id}-titre`
      panneau?.setAttribute('aria-labelledby', titre.id)
    }
    panneau?.focus({ preventScroll: true })
    // Focus rendu à l'élément d'origine, sauf à un champ de saisie : son
    // clavier se rouvrirait par-dessus ce qui suit (correction de la page)
    return () => {
      if (!origine?.closest('math-field, mathalea-mathfield, input, textarea')) origine?.focus?.({ preventScroll: true })
    }
  })

  function clavier(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onfermer()
      return
    }
    if (e.key !== 'Tab') return
    const liste = focusables()
    if (!liste.length) return e.preventDefault()
    const premier = liste[0]
    const dernier = liste[liste.length - 1]
    if (e.shiftKey && (document.activeElement === premier || document.activeElement === panneau)) {
      e.preventDefault()
      dernier.focus()
    } else if (!e.shiftKey && document.activeElement === dernier) {
      e.preventDefault()
      premier.focus()
    }
  }
</script>

<div class="fixed inset-0 flex flex-col justify-end" style="z-index: 100">
  <button type="button" aria-label="Fermer" tabindex="-1" class="feuille-fond absolute inset-0 bg-black/40" onclick={onfermer}></button>
  <div
    bind:this={panneau}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onkeydown={clavier}
    class="feuille relative colonne flex flex-col gap-3 px-4 pt-3 pb-4 outline-none
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus"
  >
    <div class="feuille-poignee shrink-0" aria-hidden="true"></div>
    {@render children()}
  </div>
</div>
