<script lang="ts">
  // Tuile de la vue mobile de MathALÉA (MobileTile.svelte), sans cadre (carte
  // pleine, comme les apps), avec une pastille facultative
  import { pastille as classePastille } from './classes'

  type Props = {
    title: string
    subtitle?: string
    icon?: string
    size?: 'large' | 'normal'
    badge?: string
    onclick?: () => void
    /** Épingle à l'accueil, à côté de la tuile (sans ouvrir le parcours) */
    epingle?: boolean
    onepingler?: () => void
  }
  const { title, subtitle = '', icon = '', size = 'normal', badge = '', onclick, epingle = false, onepingler }: Props = $props()

  // Avec l'épingle, le fond est porté par l'enveloppe : la tuile et l'épingle forment une seule carte
  const sharedClasses = $derived(`w-full flex flex-row items-center justify-between gap-3 text-left rounded-2xl
  ${onepingler ? '' : 'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark'}
  active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest
  transition-colors duration-150
  ${size === 'large' ? 'p-5' : 'px-4 py-3'}`)
</script>

{#snippet contenu(chevron: boolean)}
  <div class="flex flex-row items-center gap-3 min-w-0">
    {#if icon}
      <i aria-hidden="true"
        class="bx {icon} shrink-0 text-coopmaths-action dark:text-coopmathsdark-action
        {size === 'large' ? 'text-4xl' : 'text-2xl'}"
      ></i>
    {/if}
    <div class="min-w-0">
      <div
        class="text-coopmaths-struct dark:text-coopmathsdark-struct font-bold
        {size === 'large' ? 'text-2xl' : 'text-base'}"
      >
        {title}
      </div>
      {#if subtitle}
        <div class="mt-0.5 text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
          {subtitle}
        </div>
      {/if}
    </div>
  </div>
  <div class="flex flex-row items-center gap-2">
    {#if badge}<span class={classePastille}>{badge}</span>{/if}
    {#if chevron}<i aria-hidden="true"
 class="bx bx-chevron-right shrink-0 text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>{/if}
  </div>
{/snippet}


{#if onepingler}
  <div class="flex flex-row items-center rounded-2xl bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
    <button type="button" {onclick} class="{sharedClasses} min-w-0 flex-1">
      {@render contenu(false)}
    </button>
    <button
      type="button"
      aria-label={epingle ? `Retirer « ${title} » de l’accueil` : `Épingler « ${title} » à l’accueil`}
      aria-pressed={epingle}
      class="bouton-icone mr-1"
      onclick={onepingler}
    >
      <i aria-hidden="true" class="bx {epingle ? 'bxs-pin' : 'bx-pin'} text-xl"></i>
    </button>
  </div>
{:else}
<button type="button" {onclick} class={sharedClasses}>
  {@render contenu(true)}
</button>

{/if}
