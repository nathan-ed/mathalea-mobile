<script lang="ts">
  import type { Parcours } from '$lib/catalogue'
  import type { Moteur } from '$lib/moteur'
  import { bilan, type Seance } from '$lib/progression'
  import QuestionsEtape from './QuestionsEtape.svelte'
  import { boutonAction, boutonInverse, listeGroupee, pastille } from './classes'
  import EnTete from './EnTete.svelte'
  import { navigation } from '$lib/navigation.svelte'
  import FilAriane from './FilAriane.svelte'

  let {
    parcours,
    seance,
    moteur,
    nbAAmeliorer,
    onrefaire,
    onameliorer,
    onpassees,
    onfermer,
  }: {
    parcours: Parcours
    seance: Seance
    moteur: Moteur
    nbAAmeliorer: number
    onrefaire: () => void
    onameliorer: () => void
    onpassees: () => void
    onfermer: () => void
  } = $props()

  const b = $derived(bilan(seance))
  let ouvertes: Record<number, boolean> = $state({})
  const arrondi = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1))
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete />
  <FilAriane titre={seance.type === 'ciblee' ? `${parcours.titre} · reprise` : parcours.titre} onretour={onfermer} />

  <main class="flex-1 flex flex-col gap-4 p-4 zone-sure-bas">
    <div class="text-center py-4">
      <div class="font-light text-coopmaths-struct dark:text-coopmathsdark-struct" style="font-size: 3.5rem; line-height: 1">
        {arrondi(b.points)} / {b.sur}
      </div>
      <div class="mt-2 text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
        {b.pourcentage} % · {b.reussies} réponse{b.reussies > 1 ? 's' : ''} correcte{b.reussies > 1 ? 's' : ''}
        {#if b.passees.length}· {b.passees.length} passée{b.passees.length > 1 ? 's' : ''}{/if}
      </div>
    </div>

    <ul class={listeGroupee}>
      {#each b.parEtape as e (e.etape)}
        <li class="bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
          <button
            type="button"
            class="w-full flex flex-row items-center justify-between gap-3 px-4 py-3 text-left
            active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest transition-colors duration-150"
            aria-expanded={!!ouvertes[e.etape]}
            onclick={() => (ouvertes[e.etape] = !ouvertes[e.etape])}
          >
            <div class="min-w-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
              <span class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{parcours.etapes[e.etape].id}</span>
              &nbsp;{parcours.etapes[e.etape].titre}
            </div>
            <div class="flex flex-row items-center gap-2">
              <span class={pastille}>{arrondi(e.points)}/{e.sur}</span>
              <i aria-hidden="true"
                class="bx {ouvertes[e.etape] ? 'bx-chevron-up' : 'bx-chevron-down'} text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
              ></i>
            </div>
          </button>
          {#if ouvertes[e.etape]}
            <div class="px-4 pb-4 pt-2 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
              <QuestionsEtape {parcours} {seance} etape={e.etape} {moteur} />
            </div>
          {/if}
        </li>
      {/each}
    </ul>

    <div class="flex flex-col gap-3">
      {#if b.passees.length > 0}
        <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={onpassees}>
          Répondre aux questions passées ({b.passees.length})
        </button>
      {:else if nbAAmeliorer > 0}
        <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={onameliorer}>
          Reprendre les exercices à améliorer ({nbAAmeliorer})
        </button>
      {/if}
      <button
        type="button"
        class="{b.passees.length === 0 && nbAAmeliorer === 0 ? boutonAction : boutonInverse} w-full"
        style="min-height: 44px"
        onclick={onrefaire}
      >
        Tout refaire
      </button>
      <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => navigation.versAccueil()}>
        Retour à l’accueil
      </button>
    </div>
  </main>
</div>
