<script lang="ts">
  // Onglet Fiches de l'élève : ses fiches enregistrées, dans son ordre, puis
  // toutes les fiches de ses parcours par chapitre (fiches.ts)
  import { basculer, deplacer, estEnregistree, fichesDes, parChapitre, type FicheDuParcours } from '$lib/fiches'
  import type { Parcours } from '$lib/catalogue'
  import { elementListe, listeGroupee } from './classes'

  let {
    parcours,
    enregistrees,
    onenregistrer,
    onouvrir,
  }: {
    parcours: Parcours[]
    enregistrees: FicheDuParcours[]
    onenregistrer: (liste: FicheDuParcours[]) => void
    onouvrir: (f: FicheDuParcours) => void
  } = $props()

  const chapitres = $derived(parChapitre(fichesDes(parcours)))
  const titreSection = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  const icone = 'p-2 text-xl text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-30'
</script>

{#snippet ligne(f: FicheDuParcours, rang: number | null)}
  <li class="{elementListe} flex flex-row items-center gap-1">
    <button type="button" class="flex-1 py-2 text-left" onclick={() => onouvrir(f)}>
      <span class="block text-coopmaths-corpus dark:text-coopmathsdark-corpus">{f.fiche.titre}</span>
      <span class={discret}>{rang === null ? f.parcours : `${f.theme} · ${f.parcours}`}</span>
    </button>
    {#if rang !== null}
      <button type="button" class={icone} aria-label="Monter « {f.fiche.titre} »" disabled={rang === 0} onclick={() => onenregistrer(deplacer(enregistrees, f.cle, -1))}>
        <i aria-hidden="true" class="bx bx-chevron-up"></i>
      </button>
      <button
        type="button"
        class={icone}
        aria-label="Descendre « {f.fiche.titre} »"
        disabled={rang === enregistrees.length - 1}
        onclick={() => onenregistrer(deplacer(enregistrees, f.cle, 1))}
      >
        <i aria-hidden="true" class="bx bx-chevron-down"></i>
      </button>
    {/if}
    <button
      type="button"
      class={icone}
      aria-label="{estEnregistree(enregistrees, f.cle) ? 'Retirer' : 'Enregistrer'} « {f.fiche.titre} »"
      aria-pressed={estEnregistree(enregistrees, f.cle)}
      onclick={() => onenregistrer(basculer(enregistrees, f))}
    >
      <i aria-hidden="true" class="bx {estEnregistree(enregistrees, f.cle) ? 'bxs-bookmark' : 'bx-bookmark'}"></i>
    </button>
  </li>
{/snippet}

<div class="flex flex-col gap-3 p-4">
  {#if !enregistrees.length && !chapitres.length}
    <p class="py-8 text-center font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
      Les fiches de cours de tes parcours apparaîtront ici.
    </p>
  {/if}
  {#if enregistrees.length}
    <h2 class={titreSection}>Mes fiches</h2>
    <ul class={listeGroupee}>
      {#each enregistrees as f, i (f.cle)}
        {@render ligne(f, i)}
      {/each}
    </ul>
  {/if}
  {#each chapitres as c (`${c.niveau}|${c.theme}`)}
    <h2 class={titreSection}>{c.theme} <span class="font-light">· {c.niveau}</span></h2>
    <ul class={listeGroupee}>
      {#each c.fiches as f (f.cle)}
        {@render ligne(f, null)}
      {/each}
    </ul>
  {/each}
</div>
