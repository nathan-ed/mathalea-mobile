<script lang="ts">
  // Révisions espacées de l'élève : ce qui est à revoir aujourd'hui, la séance
  // (exercices mélangés de chapitres différents), la solidité de ses
  // exercices dans le temps et les chapitres qu'il choisit de réviser.
  // Avant une évaluation : il choisit ses parcours et le jour (PreparerEvaluation),
  // et l'écran ne parle plus que d'elle jusqu'à ce jour.
  import { retourSi } from '$lib/navigation.svelte'
  import {
    aReviserPourEvaluation,
    aRevoir,
    chapitres,
    choisis,
    dansEvaluation,
    evaluationEnCours,
    jourEnMots,
    prochaineRevision,
    quand,
    solidite,
    SOLIDITES,
    TAILLE_PAR_DEFAUT,
    TAILLES,
    type Evaluation,
    type Revisions,
    type SourceRevision,
  } from '$lib/revisions'
  import { boutonAction, boutonInverse, boutonLien, elementListe, listeGroupee } from './classes'
  import EnTete from './EnTete.svelte'
  import Feuille from './Feuille.svelte'
  import PreparerEvaluation from './PreparerEvaluation.svelte'

  let {
    revisions,
    enCours = false,
    mesParcours = [],
    onlancer,
    onchapitres,
    ontaille,
    onevaluation,
    onouvrir,
    onretour,
  }: {
    revisions: Revisions
    enCours?: boolean // une séance de révision commencée, à reprendre
    mesParcours?: ({ id: string; reste?: string } & SourceRevision)[] // parcours de l'élève ; `reste` : ce qui n'est pas encore obtenu (« 2 ceintures sur 5 »)
    onlancer: () => void
    onchapitres: (sans: string[] | undefined) => void // chapitres écartés ; undefined : aucun
    ontaille: (n: number) => void // questions par séance
    onevaluation: (e: Evaluation | undefined) => void // préparer, modifier ou terminer la préparation d'une évaluation
    onouvrir?: (id: string) => void // ouvrir un parcours à finir avant l'évaluation
    onretour: () => void
  } = $props()

  let preparer = $state(false)
  let terminer = $state(false)
  retourSi(() => !preparer, () => onretour())

  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  const titreSection = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const evaluation = $derived(evaluationEnCours(revisions))
  const pourEvaluation = $derived(evaluation ? dansEvaluation(revisions, evaluation) : [])
  // Évaluation : ce qui n'a pas encore été réussi aujourd'hui ; sinon ce qui est à revoir
  const dus = $derived(evaluation ? aReviserPourEvaluation(revisions, evaluation).length : aRevoir(revisions).length)
  const prochaine = $derived(prochaineRevision(revisions))
  const liste = $derived(chapitres(revisions))
  const ecartes = $derived(new Set(revisions.sansChapitres ?? []))
  const parSolidite = $derived(
    SOLIDITES.map((libelle, k) => ({ libelle, nb: (evaluation ? pourEvaluation : choisis(revisions)).filter(([, e]) => solidite(e.boite) === k).length })),
  )
  const taille = $derived(revisions.taille ?? TAILLE_PAR_DEFAUT)
  // Parcours de l'évaluation à finir : pas commencés, ou ceintures pas toutes obtenues
  const aFinir = $derived(evaluation ? mesParcours.filter((p) => p.reste && evaluation.parcours.includes(p.id)) : [])
  const titresEvaluation = $derived.by(() => {
    if (!evaluation) return ''
    const titres = evaluation.parcours.flatMap((id) => {
      const t = revisions.sources?.[id]?.titre ?? mesParcours.find((p) => p.id === id)?.titre
      return t ? [t] : []
    })
    return titres.length > 2 ? `${titres.length} parcours` : titres.join(', ')
  })

  function basculer(cle: string, oui: boolean) {
    const suite = new Set(ecartes)
    if (oui) suite.delete(cle)
    else suite.add(cle)
    const connus = liste.map((c) => c.cle).filter((c) => suite.has(c))
    onchapitres(connus.length ? connus : undefined)
  }
</script>

{#snippet tailles()}
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
{/snippet}

{#if preparer}
  <PreparerEvaluation
    {revisions}
    {mesParcours}
    {evaluation}
    onvalider={(e) => {
      onevaluation(e)
      preparer = false
    }}
    onretour={() => (preparer = false)}
  />
{:else}
<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre="Révisions" onretour={() => onretour()} />
  <main class="flex-1 flex flex-col gap-4 p-4 zone-sure-bas">
    <!-- Jamais le nombre d'exercices en attente : l'élève choisit combien il en fait -->
    <section class="flex flex-col items-center gap-3 py-4" aria-label={evaluation ? 'Évaluation' : 'Aujourd’hui'}>
      {#if evaluation}
        <div class="flex flex-col items-center gap-1 text-center">
          <div class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Évaluation {jourEnMots(evaluation.date)}</div>
          <div class={discret}>{titresEvaluation}</div>
        </div>
      {/if}
      {#if enCours}
        <div class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Révision commencée</div>
      {:else if evaluation && !pourEvaluation.length}
        <div class="text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus">Les révisions commencent dès qu’un exercice de ces parcours est terminé.</div>
      {:else if evaluation && !dus}
        <div class="text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus">Tout est revu pour aujourd’hui.</div>
        {@render tailles()}
      {:else if dus > 0}
        <div class="{evaluation ? '' : 'font-bold'} text-coopmaths-struct dark:text-coopmathsdark-struct">Combien de questions ?</div>
        {@render tailles()}
      {:else}
        <div class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Rien à revoir aujourd’hui</div>
        {#if prochaine}<div class={discret}>Prochaine révision {quand(prochaine)}</div>{/if}
      {/if}
    </section>

    {#if enCours || dus > 0}
      <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={onlancer}>
        {enCours ? 'Continuer la révision' : 'Commencer'}
      </button>
    {:else if evaluation && pourEvaluation.length}
      <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={onlancer}>Refaire une série</button>
    {/if}

    {#if !evaluation || pourEvaluation.length}
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
    {/if}

    {#if evaluation}
      {#if aFinir.length}
        <h2 class={titreSection}>À finir avant l’évaluation</h2>
        <ul class={listeGroupee} aria-label="Parcours à finir avant l’évaluation">
          {#each aFinir as p (p.id)}
            <li>
              <button type="button" class={elementListe} onclick={() => onouvrir?.(p.id)}>
                <span class="flex flex-col min-w-0">
                  <span class="truncate text-coopmaths-corpus dark:text-coopmathsdark-corpus">{p.titre}</span>
                  <span class={discret}>{p.reste}</span>
                </span>
                <i aria-hidden="true" class="bx bx-chevron-right shrink-0 text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
      <div class="flex flex-row justify-center gap-2">
        <button type="button" class={boutonLien} onclick={() => (preparer = true)}>Modifier</button>
        <button type="button" class={boutonLien} onclick={() => (terminer = true)}>Arrêter la préparation</button>
      </div>
    {:else}
      <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => (preparer = true)}>
        <i aria-hidden="true" class="bx bx-calendar-check text-lg"></i>
        Préparer une évaluation
      </button>

      <h2 class={titreSection}>Chapitres</h2>
      <ul class={listeGroupee} aria-label="Chapitres à réviser">
        {#each liste as c (c.cle)}
          <li>
            <label class="w-full flex flex-row items-center justify-between gap-4 px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
              <span class="flex flex-col min-w-0">
                <span class="truncate text-coopmaths-corpus dark:text-coopmathsdark-corpus">{c.theme || 'Sans chapitre'}</span>
                <span class={discret}>
                  {[c.niveau, `${c.nb} exercice${c.nb > 1 ? 's' : ''}`, SOLIDITES[solidite(c.boite)].toLowerCase()].filter(Boolean).join(' · ')}
                </span>
              </span>
              <input
                type="checkbox"
                role="switch"
                class="interrupteur shrink-0"
                aria-label="Réviser {c.theme}"
                checked={!ecartes.has(c.cle)}
                onchange={(e) => basculer(c.cle, e.currentTarget.checked)}
              />
            </label>
          </li>
        {/each}
      </ul>
    {/if}
  </main>
</div>
{/if}

{#if terminer}
  <Feuille onfermer={() => (terminer = false)}>
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Arrêter la préparation ?</h2>
        <p class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus">Les révisions reprennent sur tous tes chapitres. Rien n’est effacé.</p>
      </div>
      <button
        type="button"
        class="{boutonAction} w-full"
        style="min-height: 44px"
        onclick={() => {
          terminer = false
          onevaluation(undefined)
        }}
      >
        Arrêter la préparation
      </button>
      <button type="button" class="{boutonLien} w-full" onclick={() => (terminer = false)}>Annuler</button>
    </div>
  </Feuille>
{/if}

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
