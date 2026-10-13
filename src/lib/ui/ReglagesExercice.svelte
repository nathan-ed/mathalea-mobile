<script lang="ts">
  // Réglages d'un exercice : nombre de questions et paramètres, comme le
  // formulaire du site (Settings.svelte). Les valeurs sont celles de l'URL MathALÉA.
  import type { Etape } from '$lib/catalogue'
  import type { DescriptionExercice, ParametreExercice } from '$lib/moteur'

  let { etape = $bindable(), description }: { etape: Etape; description: DescriptionExercice | null } = $props()

  const champ = `text-sm border h-9 border-coopmaths-action dark:border-coopmathsdark-action
    focus:outline-0 focus:ring-0 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
    text-coopmaths-corpus dark:text-coopmathsdark-corpus`
  const libelle = 'text-sm text-coopmaths-struct dark:text-coopmathsdark-struct'
  const aide = 'text-xs font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'

  const valeur = (p: ParametreExercice) => etape[p.cle] ?? p.defaut
  const ecrire = (p: ParametreExercice, v: string) => {
    // La valeur par défaut n'est pas stockée : l'exercice suit ses évolutions
    etape[p.cle] = v === p.defaut ? undefined : v
  }
  const choisis = (p: ParametreExercice) => valeur(p).split('-').filter(Boolean)
  function basculer(p: ParametreExercice, v: string) {
    const actuels = choisis(p)
    const suivants = actuels.includes(v) ? actuels.filter((x) => x !== v) : [...actuels, v]
    if (suivants.length) ecrire(p, suivants.join('-'))
  }
</script>

<div class="flex flex-col gap-3">
  {#if description?.nbQuestionsModifiable !== false}
    <label class="flex flex-row items-center justify-between gap-3 {libelle}">
      Nombre de questions
      <input type="number" min="1" max="50" bind:value={etape.nbQuestions} class="w-20 {champ}" />
    </label>
  {/if}
  {#each description?.parametres ?? [] as p (p.cle)}
    {#if p.type === 'case'}
      <label class="flex flex-row items-center justify-between gap-3 {libelle}">
        {p.titre}
        <input
          type="checkbox"
          checked={valeur(p) === 'true'}
          onchange={(e) => ecrire(p, String(e.currentTarget.checked))}
          class="h-5 w-5 rounded text-coopmaths-action dark:text-coopmathsdark-action border-coopmaths-action focus:ring-0"
        />
      </label>
    {:else if p.type === 'liste'}
      <label class="flex flex-col gap-1 {libelle}">
        {p.titre}
        <select value={valeur(p)} onchange={(e) => ecrire(p, e.currentTarget.value)} class="w-full {champ}">
          {#each p.options ?? [] as o (o.valeur)}
            <option value={o.valeur}>{o.libelle}</option>
          {/each}
        </select>
      </label>
    {:else if p.type === 'nombre'}
      <label class="flex flex-col gap-1 {libelle}">
        <span class="flex flex-row items-center justify-between gap-3">
          {p.titre}
          <input type="number" min="1" max={p.max} value={valeur(p)} oninput={(e) => ecrire(p, e.currentTarget.value)} class="w-20 {champ}" />
        </span>
        {#if p.aide}<span class={aide}>{p.aide}</span>{/if}
      </label>
    {:else if p.options?.length}
      <fieldset class="flex flex-col gap-1">
        <legend class={libelle}>{p.titre}</legend>
        <div class="flex flex-row flex-wrap gap-2 pt-1">
          {#each p.options as o (o.valeur)}
            {@const actif = choisis(p).includes(o.valeur)}
            <button
              type="button"
              role="checkbox"
              aria-checked={actif}
              class="rounded-full px-3 py-1 text-sm border border-coopmaths-action dark:border-coopmathsdark-action
              {actif
                ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
                : 'text-coopmaths-action dark:text-coopmathsdark-action'}"
              onclick={() => basculer(p, o.valeur)}
            >
              {o.libelle}
            </button>
          {/each}
        </div>
      </fieldset>
    {:else}
      <label class="flex flex-col gap-1 {libelle}">
        {p.titre}
        <input type="text" value={valeur(p)} oninput={(e) => ecrire(p, e.currentTarget.value)} class="w-full {champ}" />
        {#if p.aide}<span class={aide}>{p.aide}</span>{/if}
      </label>
    {/if}
  {/each}
</div>
