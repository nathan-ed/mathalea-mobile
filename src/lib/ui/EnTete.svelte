<script lang="ts">
  // Barre de l'app : logo MathALÉA (dé de Banner.svelte, titre de NavBar.svelte)
  // à l'accueil ; ailleurs, retour et titre de l'écran. Une ombre apparaît
  // quand la page défile sous la barre. Dessous, pour l'enseignant, le rappel
  // d'exporter le fichier complet quand l'app a des modifications qu'il n'a pas.
  import type { Snippet } from 'svelte'
  import { rappelExport } from '$lib/rappelExport.svelte'
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
  {#if rappelExport.etat && rappelExport.etat !== rappelExport.ferme}
    <div class="flex flex-row items-center gap-2 pl-4 pr-1 text-xs bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light" role="status">
      <i aria-hidden="true" class="bx {rappelExport.etat === 'differente' ? 'bx-error-circle' : rappelExport.etat === 'configurer' ? 'bx-folder' : 'bx-cloud-upload'} text-base text-coopmaths-action dark:text-coopmathsdark-action"></i>
      <span class="min-w-0 flex-1 truncate py-2">
        {{ differente: 'Version différente de celle du drive', configurer: 'Drive pas encore configuré', deposer: 'Fichier exporté : déposez-le sur le drive' }[rappelExport.etat]}
      </span>
      {#if rappelExport.etat === 'differente'}
        <button type="button" class="presse shrink-0 px-2 py-1.5 font-semibold text-coopmaths-action dark:text-coopmathsdark-action" onclick={() => rappelExport.exporter()}>Mettre à jour</button>
      {:else if rappelExport.etat === 'configurer'}
        <button type="button" class="presse shrink-0 px-2 py-1.5 font-semibold text-coopmaths-action dark:text-coopmathsdark-action" onclick={() => rappelExport.configurer()}>Configurer</button>
      {/if}
      <button type="button" aria-label="Fermer le rappel" class="presse shrink-0 px-1 py-1 text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest" onclick={() => (rappelExport.ferme = rappelExport.etat)}>
        <i aria-hidden="true" class="bx bx-x text-base"></i>
      </button>
    </div>
  {/if}
</header>
