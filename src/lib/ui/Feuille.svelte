<script lang="ts">
  // Panneau qui monte du bas de l'écran (confirmations) : fond assombri,
  // refermé par un toucher à côté ou par le bouton retour du téléphone
  import { onMount, type Snippet } from 'svelte'
  import { retourSi } from '$lib/navigation.svelte'
  let { onfermer, children }: { onfermer: () => void; children: Snippet } = $props()
  retourSi(() => true, () => onfermer())
  // Le clavier (téléphone ou MathALÉA) se ferme : le panneau reste visible en entier
  onMount(() => (document.activeElement as HTMLElement | null)?.blur())
</script>

<div class="fixed inset-0 flex flex-col justify-end" style="z-index: 100">
  <button type="button" aria-label="Fermer" tabindex="-1" class="feuille-fond absolute inset-0 bg-black/40" onclick={onfermer}></button>
  <div
    role="alertdialog"
    aria-modal="true"
    class="feuille relative colonne flex flex-col gap-3 px-4 pt-3 pb-4
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus"
  >
    <div class="feuille-poignee" aria-hidden="true"></div>
    {@render children()}
  </div>
</div>
