<script lang="ts">
  // Reprise de InputText.svelte de MathALÉA. Bord gris au repos, orange à la saisie :
  // vide et encadré d'orange, le champ ressemblait à une erreur (revue du 17 novembre 2026)
  let {
    id,
    titre,
    valeur = $bindable(''),
    type = 'text',
  }: { id: string; titre: string; valeur?: string; type?: string } = $props()
</script>

<div class="w-full">
  <label class="font-light text-sm pr-4 block text-coopmaths-struct dark:text-coopmathsdark-struct" for={id}>{titre}</label>
  <input
    {id}
    {type}
    bind:value={valeur}
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
    class="block w-full text-sm border h-10 pr-0
      border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
      focus:border-coopmaths-action dark:focus:border-coopmathsdark-action
      focus:outline-0 focus:ring-0 focus:border
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
  />
</div>
