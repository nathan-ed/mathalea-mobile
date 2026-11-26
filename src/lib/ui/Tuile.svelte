<script lang="ts">
  // Élément de liste de l'app (refonte du 26 novembre 2026,
  // docs/recherche-ui-mobile.md) : une ligne sans boîte, séparée de la
  // suivante par un trait fin. Titre en pleine largeur, puis une ligne d'état
  // (ceintures en petit, pastille, texte gris). Un toucher ouvre ; épingler et
  // cacher passent par un appui long (ou le clic droit), avec un bouton
  // « Actions » pour le clavier et les lecteurs d'écran. La grande tuile
  // (choix du programme) garde sa carte.
  import { pastille as classePastille, pastilleNeutre } from './classes'
  import Feuille from './Feuille.svelte'

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
    /** Accueil : épinglé en haut (petite épingle grise) ; épingler et cacher par l'appui long */
    epingle?: boolean
    onepingler?: () => void
    /** Bouton « ⋯ » à côté de la ligne : actions sur le parcours */
    onactions?: () => void
    /** Explorer : « + » au bout de la ligne, ajoute le parcours sans l'ouvrir ; « ✓ » une fois ajouté, qui le retire */
    onajouter?: () => void
    ajoute?: boolean
    /** Ajouté mais impossible à retirer d'ici (parcours de la classe) : la coche n'est plus un bouton actif */
    ajoutFige?: boolean
    /** Où va le parcours, pour le lecteur d'écran : « ton accueil », « votre bibliothèque » */
    cible?: string
    /** Accueil : cacher le parcours (appui long) ; parcours caché : œil au bout de la ligne pour le remettre */
    oncacher?: () => void
    cache?: boolean
    /** Parcours ajouté depuis l'Explorer : boussole à côté du titre */
    explorer?: boolean
    /** Parcours à ceintures : chacune en petit, en couleur si obtenue, en pointillé sinon (à la place de l'icône) */
    ceintures?: { couleur: string; obtenue: boolean }[]
  }
  const {
    title,
    titleHtml = '',
    subtitle = '',
    icon = '',
    size = 'normal',
    badge = '',
    badgeVert = false,
    onclick,
    epingle = false,
    onepingler,
    onactions,
    onajouter,
    ajoute = false,
    ajoutFige = false,
    cible = 'ton accueil',
    oncacher,
    cache = false,
    explorer = false,
    ceintures = [],
  }: Props = $props()

  // Épingler et cacher : panneau du bas ouvert par l'appui long
  const actionsCachees = $derived(!cache && !!(onepingler || oncacher))
  let panneau = $state(false)
  let minuteur: ReturnType<typeof setTimeout> | null = null
  let depart: { x: number; y: number } | null = null
  let appuiLong = false
  function debut(e: PointerEvent) {
    if (!actionsCachees || e.button > 0) return
    appuiLong = false
    depart = { x: e.clientX, y: e.clientY }
    minuteur = setTimeout(() => {
      appuiLong = true
      panneau = true
      navigator.vibrate?.(10)
    }, 500)
  }
  function annuler() {
    if (minuteur) clearTimeout(minuteur)
    minuteur = null
  }
  function bouge(e: PointerEvent) {
    if (depart && Math.hypot(e.clientX - depart.x, e.clientY - depart.y) > 10) annuler()
  }
  function toucher(e: MouseEvent) {
    // L'appui long a ouvert le panneau : le relâcher n'ouvre pas le parcours
    if (appuiLong) {
      e.preventDefault()
      appuiLong = false
      return
    }
    onclick?.()
  }
  function menu(e: MouseEvent) {
    if (!actionsCachees) return
    e.preventDefault()
    annuler()
    panneau = true
  }
</script>

{#snippet titre()}
  <span class="titre-ligne">
    {#if titleHtml}{@html titleHtml}{:else}{title}{/if}
    {#if explorer}
      <i aria-hidden="true" class="bx bx-compass align-middle font-normal text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"></i>
      <span class="sr-only">(ajouté depuis Explorer)</span>
    {/if}
  </span>
{/snippet}

{#snippet etat()}
  {#if ceintures.length || badge || subtitle}
    <span class="etat-ligne">
      {#if ceintures.length}
        <span class="ceintures-mini" aria-hidden="true">
          {#each ceintures as c, i (i)}
            <span
              class="ceinture-mini {c.obtenue ? '' : 'a-obtenir'} {c.obtenue && c.couleur.toLowerCase() === '#ffffff' ? 'claire' : ''}"
              style={c.obtenue ? `background-color: ${c.couleur}` : c.couleur.toLowerCase() === '#ffffff' ? '' : `--c: ${c.couleur}`}
            ></span>
          {/each}
        </span>
      {/if}
      {#if badge}<span class={badgeVert ? classePastille : pastilleNeutre}>{badge}</span>{/if}
      {#if subtitle}<span class="min-w-0">{subtitle}</span>{/if}
    </span>
  {/if}
{/snippet}

{#if size === 'large'}
  <button
    type="button"
    {onclick}
    class="tuile w-full flex flex-row items-center justify-between gap-3 text-left rounded-2xl p-5
    bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
    active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest transition-colors duration-150"
  >
    <span class="flex flex-row items-center gap-3 min-w-0">
      {#if icon}<i aria-hidden="true" class="bx {icon} shrink-0 text-4xl text-coopmaths-action dark:text-coopmathsdark-action"></i>{/if}
      <span class="min-w-0 flex flex-col">
        <span class="text-2xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{title}</span>
        {#if subtitle}<span class="mt-0.5 text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">{subtitle}</span>{/if}
      </span>
    </span>
    <i aria-hidden="true" class="bx bx-chevron-right shrink-0 text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
  </button>
{:else}
  <div class="tuile ligne-liste ligne-tuile">
    <button
      type="button"
      class="corps-tuile"
      onclick={toucher}
      onpointerdown={debut}
      onpointerup={annuler}
      onpointercancel={annuler}
      onpointerleave={annuler}
      onpointermove={bouge}
      oncontextmenu={menu}
    >
      {#if icon && !ceintures.length}
        <i aria-hidden="true" class="bx {icon} icone-ligne"></i>
      {/if}
      <span class="flex-1 min-w-0 flex flex-col">
        {@render titre()}
        {@render etat()}
      </span>
      {#if epingle}
        <i aria-hidden="true" class="bx bxs-pin epingle-ligne"></i>
        <span class="sr-only">(épinglé)</span>
      {/if}
      {#if !onajouter && !onactions && !cache}
        <i aria-hidden="true" class="bx bx-chevron-right chevron-ligne"></i>
      {/if}
    </button>
    {#if onajouter}
      <button
        type="button"
        aria-label={ajoute ? (ajoutFige ? `« ${title} » est dans ${cible}` : `Retirer « ${title} » de ${cible}`) : `Ajouter « ${title} » à ${cible}`}
        aria-pressed={ajoute}
        disabled={ajoute && ajoutFige}
        class="bouton-icone text-coopmaths-action dark:text-coopmathsdark-action"
        onclick={onajouter}
      >
        <i aria-hidden="true" class="bx {ajoute ? 'bxs-check-circle' : 'bx-plus-circle'} text-2xl"></i>
      </button>
    {:else if onactions}
      <button type="button" aria-label="Actions pour « {title} »" aria-haspopup="dialog" class="bouton-icone" onclick={onactions}>
        <i aria-hidden="true" class="bx bx-dots-vertical-rounded text-2xl"></i>
      </button>
    {:else if cache && oncacher}
      <button type="button" aria-label="Remettre « {title} » sur l’accueil" class="bouton-icone" onclick={oncacher}>
        <i aria-hidden="true" class="bx bx-show text-xl"></i>
      </button>
    {:else if actionsCachees}
      <!-- Clavier et lecteurs d'écran : l'appui long n'existe pas pour eux -->
      <button type="button" class="actions-clavier" aria-label="Actions pour « {title} »" aria-haspopup="dialog" onclick={() => (panneau = true)}>
        Actions
      </button>
    {/if}
  </div>
{/if}

{#if panneau}
  <Feuille onfermer={() => (panneau = false)}>
    <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{title}</p>
    <div class="liste-lignes flex flex-col mt-2">
      {#if onepingler}
        <button
          type="button"
          class="ligne-action"
          aria-label={epingle ? `Désépingler « ${title} »` : `Épingler « ${title} » à l’accueil`}
          onclick={() => {
            panneau = false
            onepingler()
          }}
        >
          <i aria-hidden="true" class="bx {epingle ? 'bxs-pin' : 'bx-pin'}"></i>
          {epingle ? 'Retirer de l’épingle' : 'Épingler en haut de l’accueil'}
        </button>
      {/if}
      {#if oncacher}
        <button
          type="button"
          class="ligne-action"
          aria-label="Cacher « {title} »"
          onclick={() => {
            panneau = false
            oncacher()
          }}
        >
          <i aria-hidden="true" class="bx bx-hide"></i>
          Cacher ce parcours
        </button>
      {/if}
    </div>
  </Feuille>
{/if}

<style>
  .ligne-tuile {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .corps-tuile {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    min-height: 56px;
    text-align: left;
    -webkit-touch-callout: none;
    transition: background-color 150ms;
  }
  .corps-tuile:active {
    background-color: var(--app-fond-2);
  }
  .titre-ligne {
    font-size: 1.0625rem;
    font-weight: 600;
    line-height: 1.25;
    color: var(--app-struct);
  }
  .etat-ligne {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
    margin-top: 4px;
    font-size: 0.875rem;
    line-height: 1.25;
    color: var(--app-discret);
  }
  .icone-ligne {
    flex: none;
    font-size: 1.5rem;
    color: var(--app-action);
  }
  .chevron-ligne {
    flex: none;
    font-size: 1.375rem;
    color: var(--app-discret);
  }
  .epingle-ligne {
    flex: none;
    font-size: 0.9375rem;
    color: var(--app-discret);
  }
  /* Invisible à l'écran, mais atteint au clavier (il apparaît alors) et par les lecteurs d'écran */
  .actions-clavier {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .actions-clavier:focus-visible {
    position: static;
    width: auto;
    height: 44px;
    clip-path: none;
    padding: 0 12px;
    color: var(--app-action);
    font-weight: 600;
  }
  .ligne-action {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 52px;
    text-align: left;
    font-size: 1.0625rem;
    color: var(--color-coopmaths-corpus);
  }
  :global(.dark) .ligne-action {
    color: var(--color-coopmathsdark-corpus-lightest);
  }
  .ligne-action i {
    font-size: 1.375rem;
    color: var(--app-action);
  }
</style>
