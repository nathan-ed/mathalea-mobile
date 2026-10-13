<script lang="ts">
  // Fil d'Ariane de la vue mobile de MathALÉA (MobileView.svelte)
  import type { Snippet } from 'svelte'
  let { titre, onretour, droite }: { titre: string; onretour: () => void; droite?: Snippet } = $props()
</script>

<div
  class="flex flex-row items-center gap-1 px-2 py-2
  bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
  border-b border-coopmaths-canvas-dark dark:border-coopmathsdark-canvas-dark"
>
  <button
    type="button"
    aria-label="Revenir en arrière"
    onclick={onretour}
    class="shrink-0 p-1 text-coopmaths-action dark:text-coopmathsdark-action"
  >
    <i aria-hidden="true"
 class="bx bx-chevron-left text-2xl"></i>
  </button>
  <h1 class="min-w-0 flex-1 truncate font-bold text-lg text-coopmaths-struct dark:text-coopmathsdark-struct">
    {titre}
  </h1>
  {@render droite?.()}
</div>
