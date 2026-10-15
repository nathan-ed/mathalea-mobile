<script lang="ts">
  import { titreEleve, type Parcours, type Pause, type Ressource } from '$lib/catalogue'
  import { ouvrirLien } from '$lib/fichiers'
  import type { Moteur } from '$lib/moteur'
  import { bilan, type Seance } from '$lib/progression'
  import QuestionsEtape from './QuestionsEtape.svelte'
  import { boutonAction, boutonInverse, boutonLien, listeGroupee, pastilleScore } from './classes'
  import EnTete from './EnTete.svelte'
  import { navigation } from '$lib/navigation.svelte'

  let {
    parcours,
    seance,
    moteur,
    nbAAmeliorer,
    onrefaire,
    onameliorer,
    onpassees,
    onfermer,
    palier = null,
    oncontinuer,
  }: {
    parcours: Parcours
    seance: Seance
    moteur: Moteur
    nbAAmeliorer: number
    onrefaire: () => void
    onameliorer: () => void
    onpassees: () => void
    onfermer: () => void
    /** Séance d'un palier : son nom, la pause de l'enseignant, et la suite */
    palier?: {
      nom: string
      pause?: Pause
      ressource?: Ressource
      suite: { nom: string; ouvert: boolean; condition: string } | null
    } | null
    oncontinuer?: () => void // commence le palier suivant
  } = $props()

  const b = $derived(bilan(seance))
  let ouvertes: Record<number, boolean> = $state({})
  const arrondi = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1))
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre={seance.type === 'ciblee' ? `${parcours.titre} · reprise` : parcours.titre} onretour={onfermer} />

  <main class="flex-1 flex flex-col gap-4 p-4 zone-sure-bas">
    <div class="text-center py-4">
      <div class="font-light text-coopmaths-struct dark:text-coopmathsdark-struct" style="font-size: 3.5rem; line-height: 1">
        {arrondi(b.points)} / {b.sur}
      </div>
      <div class="mt-2 text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
        {b.pourcentage} % · {b.reussies} réponse{b.reussies > 1 ? 's' : ''} correcte{b.reussies > 1 ? 's' : ''}
        {#if b.passees.length}· {b.passees.length} passée{b.passees.length > 1 ? 's' : ''}{/if}
      </div>
      {#if palier}<p class="mt-1 font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Bilan : {palier.nom.toLowerCase()}</p>{/if}
    </div>

    {#if palier?.pause && b.passees.length === 0}
      <section class="flex flex-col gap-2 rounded-2xl p-4 border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest" aria-label="Pause">
        <p class="flex flex-row items-center gap-2 font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">
          <i aria-hidden="true" class="bx bx-pause-circle text-xl text-coopmaths-action dark:text-coopmathsdark-action"></i> Pause
        </p>
        <p class="whitespace-pre-line text-coopmaths-corpus dark:text-coopmathsdark-corpus">{palier.pause.texte}</p>
        {#if palier.pause.ressource}
          <button type="button" class="{boutonLien} w-full" onclick={() => ouvrirLien(palier!.pause!.ressource!.lien)}>
            <i aria-hidden="true" class="bx bx-link-external text-xl"></i> {palier.pause.ressource.titre}
          </button>
        {/if}
      </section>
    {/if}

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
              {titreEleve(parcours.etapes[e.etape], e.etape)}
            </div>
            <div class="flex flex-row items-center gap-2">
              <span class={pastilleScore(e.sur ? (100 * e.points) / e.sur : 0)}>{arrondi(e.points)}/{e.sur}</span>
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
      {:else if palier?.suite?.ouvert && oncontinuer}
        <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={oncontinuer}>Continuer : {palier.suite.nom.toLowerCase()}</button>
      {:else if nbAAmeliorer > 0 && !palier}
        <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={onameliorer}>
          Reprendre les exercices à améliorer ({nbAAmeliorer})
        </button>
      {/if}
      {#if palier?.suite && !palier.suite.ouvert && b.passees.length === 0}
        <p class="text-sm text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus" role="status">
          <i aria-hidden="true" class="bx bx-lock-alt text-coopmaths-action dark:text-coopmathsdark-action"></i>
          Pour ouvrir {palier.suite.nom.toLowerCase()} : {palier.suite.condition}.
        </p>
        {#if palier.ressource}
          <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => ouvrirLien(palier!.ressource!.lien)}>
            <i aria-hidden="true" class="bx bx-book-open text-xl"></i> Pour revoir : {palier.ressource.titre}
          </button>
        {/if}
      {/if}
      <button
        type="button"
        class="{b.passees.length === 0 && !(palier?.suite?.ouvert && oncontinuer) && (palier || nbAAmeliorer === 0) ? boutonAction : boutonInverse} w-full"
        style="min-height: 44px"
        onclick={onrefaire}
      >
        {palier ? `Refaire : ${palier.nom.toLowerCase()}` : 'Tout refaire'}
      </button>
      {#if palier}
        <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={onfermer}>Voir la carte du parcours</button>
      {:else}
        <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => navigation.versAccueil()}>
          Retour à l’accueil
        </button>
      {/if}
    </div>
  </main>
</div>
