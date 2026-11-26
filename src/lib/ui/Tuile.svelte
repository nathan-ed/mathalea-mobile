<script lang="ts">
  // Tuile de la vue mobile de MathALÉA (MobileTile.svelte), sans cadre (carte
  // pleine, comme les apps), avec une pastille facultative
  import { pastille as classePastille, pastilleNeutre } from './classes'

  type Props = {
    title: string
    /** Titre en HTML (formules rendues par KaTeX), à la place de title */
    titleHtml?: string
    subtitle?: string
    icon?: string
    size?: 'large' | 'normal'
    badge?: string
    /** Pastille verte (réussite) ; sinon grise (avancement, score encore bas) */
    badgeVert?: boolean
    onclick?: () => void
    /** Épingle à l'accueil, à côté de la tuile (sans ouvrir le parcours) */
    epingle?: boolean
    onepingler?: () => void
    /** Bouton « ⋯ » à côté de la tuile : actions sur le parcours (à la place de l'épingle) */
    onactions?: () => void
    /** Explorer : « + » à côté de la tuile, ajoute le parcours sans l'ouvrir ; « ✓ » une fois ajouté, qui le retire */
    onajouter?: () => void
    ajoute?: boolean
    /** Ajouté mais impossible à retirer d'ici (parcours de la classe) : la coche n'est plus un bouton actif */
    ajoutFige?: boolean
    /** Où va le parcours, pour le lecteur d'écran : « ton accueil », « votre bibliothèque » */
    cible?: string
    /** Accueil : œil barré à côté de la tuile (cacher le parcours) ; œil ouvert s'il est caché (le remettre) */
    oncacher?: () => void
    cache?: boolean
    /** Parcours ajouté depuis l'Explorer : boussole à côté du titre */
    explorer?: boolean
    /** Parcours à ceintures : chacune en petit, en couleur si obtenue, en pointillé sinon (à la place de l'icône) */
    ceintures?: { couleur: string; obtenue: boolean }[]
  }
  const { title, titleHtml = '', subtitle = '', icon = '', size = 'normal', badge = '', badgeVert = false, onclick, epingle = false, onepingler, onactions, onajouter, ajoute = false, ajoutFige = false, cible = 'ton accueil', oncacher, cache = false, explorer = false, ceintures = [] }: Props = $props()
  const aCote = $derived(!!(onactions || onepingler || onajouter || oncacher))

  // Avec l'épingle, le fond est porté par l'enveloppe : la tuile et l'épingle forment une seule carte
  const sharedClasses = $derived(`w-full flex flex-row items-center justify-between gap-3 text-left rounded-2xl
  ${aCote ? '' : 'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark'}
  active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest
  transition-colors duration-150
  ${size === 'large' ? 'p-5' : 'px-4 py-3'}`)
</script>

<!-- Tuile avec des boutons à côté (accueil, Explorer) : le titre prend toute la
     largeur ; icône, pastille et état passent sur une ligne en dessous (Rémi,
     26 novembre 2026 : titre sur cinq lignes, place perdue sur petit écran) -->
{#snippet contenuCompact()}
  <div class="min-w-0 flex-1">
    <div class="text-coopmaths-struct dark:text-coopmathsdark-struct font-bold text-base leading-snug">
      {#if titleHtml}{@html titleHtml}{:else}{title}{/if}
      {#if explorer}
        <i aria-hidden="true" class="bx bx-compass align-middle font-normal text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"></i>
        <span class="sr-only">(ajouté depuis Explorer)</span>
      {/if}
    </div>
    {#if icon || badge || subtitle || ceintures.length}
      <div class="ligne-etat mt-1 text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
        {#if ceintures.length}
          <span class="ceintures-mini" aria-hidden="true">
            {#each ceintures as c, i (i)}
              <span class="ceinture-mini {c.obtenue ? '' : 'a-obtenir'} {c.obtenue && c.couleur.toLowerCase() === '#ffffff' ? 'claire' : ''}" style={c.obtenue ? `background-color: ${c.couleur}` : ''}></span>
            {/each}
          </span>
        {:else if icon}<i aria-hidden="true" class="bx {icon} text-lg text-coopmaths-action dark:text-coopmathsdark-action"></i>{/if}
        {#if badge}<span class={badgeVert ? classePastille : pastilleNeutre}>{badge}</span>{/if}
        {#if subtitle}<span class="min-w-0">{subtitle}</span>{/if}
      </div>
    {/if}
  </div>
{/snippet}

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
        {#if titleHtml}{@html titleHtml}{:else}{title}{/if}
        {#if explorer}
          <i aria-hidden="true" class="bx bx-compass align-middle font-normal text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"></i>
          <span class="sr-only">(ajouté depuis Explorer)</span>
        {/if}
      </div>
      {#if subtitle || ceintures.length}
        <div class="ligne-etat mt-0.5 text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
          {#if ceintures.length}
            <span class="ceintures-mini" aria-hidden="true">
              {#each ceintures as c, i (i)}
                <span class="ceinture-mini {c.obtenue ? '' : 'a-obtenir'} {c.obtenue && c.couleur.toLowerCase() === '#ffffff' ? 'claire' : ''}" style={c.obtenue ? `background-color: ${c.couleur}` : ''}></span>
              {/each}
            </span>
          {/if}
          {#if subtitle}<span>{subtitle}</span>{/if}
        </div>
      {/if}
    </div>
  </div>
  <div class="flex flex-row items-center gap-2">
    {#if badge}<span class={badgeVert ? classePastille : pastilleNeutre}>{badge}</span>{/if}
    {#if chevron}<i aria-hidden="true"
 class="bx bx-chevron-right shrink-0 text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>{/if}
  </div>
{/snippet}


{#if onactions}
  <div class="tuile flex flex-row items-center rounded-2xl bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
    <button type="button" {onclick} class="{sharedClasses} min-w-0 flex-1">
      {@render contenuCompact()}
    </button>
    <button type="button" aria-label="Actions pour « {title} »" aria-haspopup="dialog" class="bouton-icone mr-1" onclick={onactions}>
      <i aria-hidden="true" class="bx bx-dots-vertical-rounded text-2xl"></i>
    </button>
  </div>
{:else if onajouter}
  <div class="tuile flex flex-row items-center rounded-2xl bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
    <button type="button" {onclick} class="{sharedClasses} min-w-0 flex-1">
      {@render contenuCompact()}
    </button>
    <button
      type="button"
      aria-label={ajoute ? (ajoutFige ? `« ${title} » est dans ${cible}` : `Retirer « ${title} » de ${cible}`) : `Ajouter « ${title} » à ${cible}`}
      aria-pressed={ajoute}
      disabled={ajoute && ajoutFige}
      class="bouton-icone mr-1 text-coopmaths-action dark:text-coopmathsdark-action"
      onclick={onajouter}
    >
      <i aria-hidden="true" class="bx {ajoute ? 'bxs-check-circle' : 'bx-plus-circle'} text-2xl"></i>
    </button>
  </div>
{:else if onepingler}
  <div class="tuile flex flex-row items-center rounded-2xl bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
    <button type="button" {onclick} class="{sharedClasses} min-w-0 flex-1">
      {@render contenuCompact()}
    </button>
    <!-- Épingle et œil l'un sur l'autre : une seule colonne, le titre garde la largeur -->
    <div class="actions-tuile mr-1">
      <button
        type="button"
        aria-label={epingle ? `Désépingler « ${title} »` : `Épingler « ${title} » à l’accueil`}
        aria-pressed={epingle}
        class="bouton-icone"
        onclick={onepingler}
      >
        <i aria-hidden="true" class="bx {epingle ? 'bxs-pin' : 'bx-pin'} text-xl"></i>
      </button>
      {#if oncacher}
        <button type="button" aria-label="Cacher « {title} »" class="bouton-icone" onclick={oncacher}>
          <i aria-hidden="true" class="bx bx-hide text-xl"></i>
        </button>
      {/if}
    </div>
  </div>
{:else if oncacher}
  <div class="tuile flex flex-row items-center rounded-2xl bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
    <button type="button" {onclick} class="{sharedClasses} min-w-0 flex-1">
      {@render contenuCompact()}
    </button>
    <button type="button" aria-label={cache ? `Remettre « ${title} » sur l’accueil` : `Cacher « ${title} »`} class="bouton-icone mr-1" onclick={oncacher}>
      <i aria-hidden="true" class="bx {cache ? 'bx-show' : 'bx-hide'} text-xl"></i>
    </button>
  </div>
{:else}
<button type="button" {onclick} class="tuile {sharedClasses}">
  {@render contenu(true)}
</button>

{/if}

<style>
  .ligne-etat {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
  }
  .ceintures-mini {
    display: inline-flex;
    gap: 3px;
  }
  /* Une ceinture en petit : rectangle à bouts arrondis, contour pointillé tant qu'elle reste à obtenir */
  .ceinture-mini {
    width: 16px;
    height: 8px;
    border-radius: 2px;
    border: 1px solid var(--color-coopmaths-canvas-darkest);
  }
  .ceinture-mini.claire {
    border-color: var(--color-coopmaths-corpus-lightest);
  }
  .ceinture-mini.a-obtenir {
    border-style: dashed;
    border-color: var(--color-coopmaths-corpus-lightest);
  }
  :global(.dark) .ceinture-mini.a-obtenir {
    border-color: var(--color-coopmathsdark-corpus-lightest);
  }
  .actions-tuile {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }
  .actions-tuile .bouton-icone {
    width: 2.75rem;
    height: 2.75rem;
  }
</style>
