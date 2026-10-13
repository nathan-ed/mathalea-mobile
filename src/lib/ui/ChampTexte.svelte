<script lang="ts">
  // Reprise de InputText.svelte de MathALÉA
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
      border-coopmaths-action dark:border-coopmathsdark-action
      focus:border-coopmaths-action-lightest dark:focus:border-coopmathsdark-action-lightest
      focus:outline-0 focus:ring-0 focus:border
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
  />
</div>
