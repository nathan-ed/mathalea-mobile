<script lang="ts">
  // Relecture d'un passage terminé : réponses de l'élève et corrections, sans modification
  import { onMount } from 'svelte'
  import type { Parcours } from '$lib/catalogue'
  import type { ExercicePrepare, Moteur } from '$lib/moteur'
  import { bilan, cleQuestion, premiersEssais, questionsDe, type Seance } from '$lib/progression'
  import BlocQuestion from './BlocQuestion.svelte'
  import { pastille } from './classes'
  import EnTete from './EnTete.svelte'

  let { parcours, seance, moteur, onretour }: { parcours: Parcours; seance: Seance; moteur: Moteur; onretour: () => void } =
    $props()

  let exercices: Record<number, ExercicePrepare> = $state({})
  let pret = $state(false)
  let erreur = $state('')
  const liste = $derived(questionsDe(seance))
  const premiers = $derived(premiersEssais(seance))
  const b = $derived(bilan(seance))
  const date = $derived(new Date(seance.fin ?? seance.debut).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }))
  const arrondi = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1))

  function latex(noeud: HTMLElement, texte: string) {
    noeud.textContent = texte
    void moteur.afficher(noeud)
  }

  onMount(async () => {
    try {
      for (const etape of seance.etapes) {
        exercices[etape] = await moteur.preparerExercice({ ...parcours.etapes[etape], alea: seance.graines[etape] }, etape)
      }
      pret = true
    } catch (e) {
      erreur = `Impossible de régénérer ce passage : ${(e as Error).message}`
    }
  })
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre="{parcours.titre} · {date}" {onretour}>
    {#snippet droite()}
      <span class="px-3"><span class={pastille}>{arrondi(b.points)}/{b.sur}</span></span>
    {/snippet}
  </EnTete>

  <main class="flex-1 px-4 pt-4 zone-sure-bas">
    {#if erreur}
      <p class="py-4 font-bold text-coopmaths-action dark:text-coopmathsdark-action" role="alert">{erreur}</p>
    {/if}
    {#if pret}
      {#each liste as ref, i (`${ref.etape}-${ref.question}`)}
        {@const ex = exercices[ref.etape]}
        {#if i === 0 || liste[i - 1].etape !== ref.etape}
          <h1 class="text-coopmaths-struct dark:text-coopmathsdark-struct pb-2 flex flex-row items-center" class:mt-6={i > 0}>
            <div class="flex flex-row justify-start items-start">
              <div
                class="inline-flex items-center justify-center h-6 w-6 bg-coopmaths-struct text-coopmaths-canvas font-light text-lg translate-y-1"
              >
                {seance.etapes.indexOf(ref.etape) + 1}
              </div>
              <div class="font-light ml-2" style="font-size: 1.25rem; line-height: 1.3;">
                {#if !parcours.etapes[ref.etape].titreMasque}<span use:latex={parcours.etapes[ref.etape].titre || ex.titre}></span>{/if}
              </div>
            </div>
          </h1>
        {/if}
        <BlocQuestion
          {moteur}
          exercice={ex}
          question={ref.question}
          avecContexte={i === 0 || liste[i - 1].etape !== ref.etape}
          lectureSeule={true}
          essai={premiers.get(cleQuestion(ref.etape, ref.question))}
          brouillon={seance.brouillons[cleQuestion(ref.etape, ref.question)]}
          onverifiee={() => {}}
          onbrouillon={() => {}}
        />
      {/each}
    {/if}
  </main>
</div>
