<script lang="ts">
  // Barre de l'app : logo MathALÉA (dé de Banner.svelte, titre de NavBar.svelte)
  // à l'accueil ; ailleurs, retour et titre de l'écran. Une ombre apparaît
  // quand la page défile sous la barre.
  import type { Snippet } from 'svelte'
  let {
    titre,
    onretour,
    gauche,
    droite,
  }: { titre?: string; onretour?: () => void; gauche?: Snippet; droite?: Snippet } = $props()
  let defile = $state(false)
</script>

<svelte:window onscroll={() => (defile = scrollY > 4)} />

<header
  class="zone-sure-haut sticky top-0 z-40 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas transition-shadow {defile ? 'shadow-md' : ''}"
>
  <div class="h-14 flex flex-row items-center gap-1 px-1">
    {#if gauche}
      {@render gauche()}
    {:else if onretour}
      <button type="button" aria-label="Revenir en arrière" class="bouton-icone" onclick={onretour}>
        <i aria-hidden="true" class="bx bx-arrow-back text-2xl"></i>
      </button>
    {/if}
    {#if titre !== undefined}
      <h1 class="min-w-0 flex-1 truncate px-2 font-bold text-xl text-coopmaths-struct dark:text-coopmathsdark-struct">{titre}</h1>
    {:else}
      <div class="min-w-0 flex-1 flex flex-row items-center gap-2 px-3">
        <img src="/logo_mathalea.svg" alt="" class="h-8" />
        <span class="font-logo9 tracking-tighter font-black text-2xl leading-none text-coopmaths-action dark:text-coopmathsdark-action">
          MathALÉA
        </span>
        <span class="truncate text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
          par <span class="font-extrabold font-logo9 tracking-tighter text-coopmaths-action dark:text-coopmathsdark-action">CoopMaths</span>
        </span>
      </div>
    {/if}
    {@render droite?.()}
  </div>
</header>
