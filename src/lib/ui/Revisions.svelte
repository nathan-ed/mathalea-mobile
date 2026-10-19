<script lang="ts">
  // Révisions espacées de l'élève : ce qui est à revoir aujourd'hui, la séance
  // (exercices mélangés de chapitres différents), la solidité de ses
  // exercices dans le temps et les chapitres qu'il choisit de réviser.
  import { retourSi } from '$lib/navigation.svelte'
  import {
    aRevoir,
    chapitres,
    choisis,
    prochaineRevision,
    quand,
    solidite,
    SOLIDITES,
    TAILLE_PAR_DEFAUT,
    TAILLES,
    type Revisions,
  } from '$lib/revisions'
  import { boutonAction, listeGroupee } from './classes'
  import EnTete from './EnTete.svelte'

  let {
    revisions,
    enCours = false,
    onlancer,
    onchapitres,
    ontaille,
    onretour,
  }: {
    revisions: Revisions
    enCours?: boolean // une séance de révision commencée, à reprendre
    onlancer: () => void
    onchapitres: (c: string[] | undefined) => void // undefined : tous les chapitres
    ontaille: (n: number) => void // questions par séance
    onretour: () => void
  } = $props()

  retourSi(() => true, () => onretour())

  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  const titreSection = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const dus = $derived(aRevoir(revisions).length)
  const prochaine = $derived(prochaineRevision(revisions))
  const liste = $derived(chapitres(revisions))
  const coches = $derived(new Set(revisions.chapitres ?? liste.map((c) => c.cle)))
  const parSolidite = $derived(
    SOLIDITES.map((libelle, k) => ({ libelle, nb: choisis(revisions).filter(([, e]) => solidite(e.boite) === k).length })),
  )
  const taille = $derived(revisions.taille ?? TAILLE_PAR_DEFAUT)

  function basculer(cle: string, oui: boolean) {
    const suite = new Set(coches)
    if (oui) suite.add(cle)
    else suite.delete(cle)
    onchapitres(suite.size === liste.length ? undefined : liste.map((c) => c.cle).filter((c) => suite.has(c)))
  }
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre="Révisions" onretour={() => onretour()} />
  <main class="flex-1 flex flex-col gap-4 p-4 zone-sure-bas">
    <!-- Jamais le nombre d'exercices en attente : l'élève choisit combien il en fait -->
    <section class="flex flex-col items-center gap-3 py-4" aria-label="Aujourd’hui">
      {#if enCours}
        <div class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Révision commencée</div>
      {:else if dus > 0}
        <div class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Combien de questions ?</div>
        <div class="w-full flex flex-row gap-1 rounded-xl p-1 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark" role="radiogroup" aria-label="Questions">
          {#each TAILLES as n (n)}
            <button
              type="button"
              role="radio"
              aria-checked={taille === n}
              class="flex-1 rounded-lg py-3 text-lg font-semibold transition-colors duration-150
              {taille === n
                ? 'bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-struct dark:text-coopmathsdark-struct shadow-sm'
                : 'text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'}"
              onclick={() => ontaille(n)}
            >
              {n}
            </button>
          {/each}
        </div>
      {:else}
        <div class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Rien à revoir aujourd’hui</div>
        {#if prochaine}<div class={discret}>Prochaine révision {quand(prochaine)}</div>{/if}
      {/if}
    </section>

    {#if enCours || dus > 0}
      <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={onlancer}>
        {enCours ? 'Continuer la révision' : 'Commencer'}
      </button>
    {/if}

    <div class="flex flex-row gap-2" aria-label="Tes exercices dans le temps">
      {#each parSolidite as s, k (s.libelle)}
        <div class="flex-1 flex flex-col items-center gap-1 rounded-xl px-2 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
          <span class="text-2xl font-light text-coopmaths-struct dark:text-coopmathsdark-struct">{s.nb}</span>
          <span class="text-center text-xs text-coopmaths-corpus dark:text-coopmathsdark-corpus">{s.libelle}</span>
          <span class="flex flex-row gap-0.5" aria-hidden="true">
            {#each SOLIDITES as _, j (j)}
              <i class="niveau {j <= k ? 'plein' : ''}"></i>
            {/each}
          </span>
        </div>
      {/each}
    </div>

    <h2 class={titreSection}>Chapitres</h2>
    <ul class={listeGroupee} aria-label="Chapitres à réviser">
      {#each liste as c (c.cle)}
        <li>
          <label class="w-full flex flex-row items-center justify-between gap-4 px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
            <span class="flex flex-col min-w-0">
              <span class="truncate text-coopmaths-corpus dark:text-coopmathsdark-corpus">{c.theme || 'Sans chapitre'}</span>
              <span class={discret}>
                {[c.niveau, `${c.nb} exercice${c.nb > 1 ? 's' : ''}`].filter(Boolean).join(' · ')}
              </span>
            </span>
            <input
              type="checkbox"
              role="switch"
              class="interrupteur shrink-0"
              aria-label="Réviser {c.theme}"
              checked={coches.has(c.cle)}
              onchange={(e) => basculer(c.cle, e.currentTarget.checked)}
            />
          </label>
        </li>
      {/each}
    </ul>
  </main>
</div>

<style>
  .niveau {
    width: 10px;
    height: 6px;
    border-radius: 2px;
    background: var(--color-coopmaths-canvas-darkest);
  }
  .niveau.plein {
    background: var(--color-coopmaths-struct);
  }
  :global(.dark) .niveau {
    background: var(--color-coopmathsdark-canvas-darkest);
  }
  :global(.dark) .niveau.plein {
    background: var(--color-coopmathsdark-struct);
  }
</style>
