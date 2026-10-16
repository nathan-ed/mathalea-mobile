<script lang="ts">
  // Questions d'un exercice d'un passage, en lecture seule (bilan, relecture)
  import { onMount } from 'svelte'
  import type { Parcours } from '$lib/catalogue'
  import type { ExercicePrepare, Moteur } from '$lib/moteur'
  import { cleQuestion, premiersEssais, type Seance } from '$lib/progression'
  import BlocQuestion from './BlocQuestion.svelte'

  let {
    parcours,
    seance,
    etape,
    moteur,
    question,
  }: { parcours: Parcours; seance: Seance; etape: number; moteur: Moteur; question?: number /** une seule question */ } = $props()

  let exercice: ExercicePrepare | undefined = $state()
  let erreur = $state('')
  const premiers = $derived(premiersEssais(seance))

  onMount(async () => {
    try {
      exercice = await moteur.preparerExercice({ ...parcours.etapes[etape], alea: seance.graines[etape] }, etape)
    } catch (e) {
      erreur = (e as Error).message
    }
  })
</script>

{#if erreur}
  <p class="font-bold text-coopmaths-action dark:text-coopmathsdark-action" role="alert">{erreur}</p>
{/if}
{#if exercice}
  {#each exercice.questions as _, q (q)}
    {#if question === undefined || question === q}
    <BlocQuestion
      {moteur}
      {exercice}
      question={q}
      avecContexte={q === 0 || question !== undefined}
      lectureSeule={true}
      essai={premiers.get(cleQuestion(etape, q))}
      brouillon={seance.brouillons[cleQuestion(etape, q)]}
      onverifiee={() => {}}
      onbrouillon={() => {}}
    />
    {/if}
  {/each}
{/if}
