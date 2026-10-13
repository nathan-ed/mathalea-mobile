<script lang="ts">
  // Barre supérieure de la vue mobile (MobileView.svelte), avec le dé de
  // Banner.svelte et le titre de NavBar.svelte
  import type { Snippet } from 'svelte'
  import { navigation } from '$lib/navigation.svelte'
  import BoutonTheme from './BoutonTheme.svelte'
  // surLogo : remplace le retour direct à l'accueil (séance : confirmation)
  let { gauche, droite, surLogo }: { gauche?: Snippet; droite?: Snippet; surLogo?: () => void } = $props()
</script>

<header
  class="zone-sure-haut sticky top-0 z-40 flex flex-row items-center justify-between gap-2 px-3 py-2
  border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
  bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
>
  <div class="shrink-0 w-10">{@render gauche?.()}</div>
  <button
    type="button"
    aria-label="Accueil"
    class="min-w-0 flex-1 flex flex-row items-center justify-center gap-2"
    onclick={() => (surLogo ? surLogo() : navigation.versAccueil())}
  >
    <img src="/logo_mathalea.svg" alt="" class="h-7" />
    <div class="relative inline-flex flex-col">
      <span
        class="font-logo9 tracking-tighter font-black text-2xl leading-tight text-coopmaths-action dark:text-coopmathsdark-action"
      >
        MathALÉA
      </span>
      <span class="-mt-1 font-light text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
        <span class="font-light font-sans tracking-normal">par</span>
        <span class="font-extrabold font-logo9 tracking-tighter text-coopmaths-action dark:text-coopmathsdark-action">CoopMaths</span>
      </span>
    </div>
  </button>
  <div class="shrink-0 w-10 flex justify-end">
    {#if droite}{@render droite()}{:else}<BoutonTheme />{/if}
  </div>
</header>
