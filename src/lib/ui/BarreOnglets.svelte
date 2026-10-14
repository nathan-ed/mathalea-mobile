<script lang="ts" generics="T extends string">
  // Barre d'onglets fixée en bas de l'écran, comme les apps du téléphone :
  // icône pleine et libellé en couleur pour l'onglet ouvert
  type Onglet = { cle: T; libelle: string; icone: string; iconeActive: string }
  let { onglets, actif, onchoisir }: { onglets: Onglet[]; actif: T; onchoisir: (cle: T) => void } = $props()
</script>

<nav
  class="barre-onglets zone-sure-bas fixed left-0 right-0 bottom-0 z-30
  bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
  border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
>
  <div class="colonne grid" style="grid-template-columns: repeat({onglets.length}, minmax(0, 1fr))" role="tablist">
    {#each onglets as o (o.cle)}
      <button
        type="button"
        role="tab"
        aria-selected={actif === o.cle}
        class="onglet flex flex-col items-center gap-0.5 pt-2 text-xs
        {actif === o.cle
          ? 'font-bold text-coopmaths-action dark:text-coopmathsdark-action'
          : 'text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'}"
        onclick={() => onchoisir(o.cle)}
      >
        <i aria-hidden="true" class="bx {actif === o.cle ? o.iconeActive : o.icone} text-2xl"></i>
        {o.libelle}
      </button>
    {/each}
  </div>
</nav>
