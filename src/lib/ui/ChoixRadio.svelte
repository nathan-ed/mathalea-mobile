<script lang="ts" generics="T extends string | number">
  // Reprise de FormRadio.svelte de MathALÉA
  let {
    nom,
    valeur = $bindable(),
    options,
    onchange,
  }: { nom: string; valeur: T; options: { libelle: string; valeur: T }[]; onchange?: (v: T) => void } = $props()
</script>

<div class="flex flex-col justify-start items-start mt-1" role="radiogroup">
  {#each options as o, i (o.valeur)}
    <div class="form-check flex flex-row ml-4 items-center" style="min-height: 36px">
      <input
        class="form-check-input rounded-full h-4 w-4 mt-1 mr-2 border
          transition duration-200 focus:outline-0 focus:ring-0
          text-coopmaths-action dark:text-coopmathsdark-action
          bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark
          border-coopmaths-action dark:border-coopmathsdark-action
          checked:border-coopmaths-action dark:checked:border-coopmathsdark-action
          checked:bg-coopmaths-action dark:checked:bg-coopmathsdark-action cursor-pointer"
        type="radio"
        name={nom}
        id="{nom}{i}"
        bind:group={valeur}
        value={o.valeur}
        onchange={() => onchange?.(o.valeur)}
      />
      <label
        class="form-check-label inline-block text-sm {valeur === o.valeur ? 'font-semibold' : 'font-light'}
          text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70 cursor-pointer"
        for="{nom}{i}"
      >
        {o.libelle}
      </label>
    </div>
  {/each}
</div>
