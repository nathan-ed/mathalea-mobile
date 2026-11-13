<script lang="ts">
  // Une ceinture : sa couleur quand elle est obtenue (seule teinte hors charte
  // de l'app), son contour sinon. Ses barrettes, comme au judo : une par
  // révision réussie après plusieurs jours (revisions.ts, `barrettes`).
  let {
    couleur,
    obtenue = true,
    barrettes = 0,
    taille = 'w-14 h-7',
    classe = '',
  }: {
    couleur: string
    obtenue?: boolean
    barrettes?: number
    taille?: string // classes de largeur et de hauteur
    classe?: string
  } = $props()
</script>

<span
  aria-hidden="true"
  class="ceinture shrink-0 rounded border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest {taille} {classe}"
  style={obtenue ? `background-color: ${couleur}` : 'border-style: dashed'}
>
  {#if obtenue}
    {#each { length: barrettes } as _, i (i)}
      <i class="barrette"></i>
    {/each}
  {/if}
</span>

<style>
  /* Barrettes : bandes claires cernées, lisibles sur toutes les ceintures (de la blanche à la noire) */
  .ceinture {
    display: inline-flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: stretch;
    /* En px : un pourcentage de marge se calcule sur la largeur du parent, pas de la ceinture */
    gap: 3px;
    padding-right: 6px;
    overflow: hidden;
  }
  .barrette {
    flex: none;
    width: 4px;
    background: var(--color-coopmaths-canvas);
    box-shadow: 0 0 0 1px var(--color-coopmaths-corpus-lightest);
  }
</style>
