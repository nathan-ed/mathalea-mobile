<script lang="ts">
  // Relecture d'un passage terminé : réponses de l'élève et corrections, sans modification.
  // En haut, une pastille par question (correcte, incorrecte, sans réponse) qui mène à la
  // question, et le choix de ne garder que les questions incorrectes : l'élève les retrouve
  // pour en reparler avec l'enseignant (Nathan, 27 novembre 2026)
  import { onMount } from 'svelte'
  import { titreVisible, type Parcours } from '$lib/catalogue'
  import type { ExercicePrepare, Moteur } from '$lib/moteur'
  import { bilan, cleQuestion, ecrirePoints, premiersEssais, questionsOrdonnees, surPapier, valeur, type Seance } from '$lib/progression'
  import BlocQuestion from './BlocQuestion.svelte'
  import { pastille, pastilleIncorrecte, pastilleNeutre } from './classes'
  import EnTete from './EnTete.svelte'

  let {
    parcours,
    seance,
    moteur,
    onretour,
  }: {
    parcours: Parcours
    seance: Seance
    moteur: Moteur
    onretour: () => void
  } = $props()

  let exercices: Record<number, ExercicePrepare> = $state({})
  let pret = $state(false)
  let erreur = $state('')
  const liste = $derived(questionsOrdonnees(seance))
  const premiers = $derived(premiersEssais(seance))
  const b = $derived(bilan(seance))
  const date = $derived(new Date(seance.fin ?? seance.debut).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }))
  /** Question : correcte, incorrecte, sans réponse (passée), ou sur papier (hors score) */
  const etat = (etape: number, question: number) => {
    if (surPapier(seance, etape, question)) return 'papier'
    const e = premiers.get(cleQuestion(etape, question))
    return !e ? 'passee' : valeur(e) === 1 ? 'correcte' : 'incorrecte'
  }
  const LIBELLES = { correcte: 'correcte', incorrecte: 'incorrecte', passee: 'sans réponse', papier: 'sur papier' }
  const aRevoir = $derived(liste.filter((r) => ['incorrecte', 'passee'].includes(etat(r.etape, r.question))).length)
  let seulementIncorrectes = $state(false)
  const montrees = $derived(liste.map((ref, i) => ({ ref, i })).filter(({ ref }) => !seulementIncorrectes || ['incorrecte', 'passee'].includes(etat(ref.etape, ref.question))))
  const bonnes = $derived(`${ecrirePoints(b.points)} bonne${b.points > 1 ? 's' : ''} réponse${b.points > 1 ? 's' : ''} sur ${b.sur}`)
  function allerA(i: number) {
    seulementIncorrectes = false
    void Promise.resolve().then(() => document.getElementById(`question-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

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
      {#if b.sur > 0}<span class="px-3"><span class={pastilleNeutre}>{ecrirePoints(b.points)}/{b.sur}</span></span>{/if}
    {/snippet}
  </EnTete>

  <main class="flex-1 px-4 pt-4 zone-sure-bas">
    {#if erreur}
      <p class="py-4 font-bold text-coopmaths-action dark:text-coopmathsdark-action" role="alert">{erreur}</p>
    {/if}
    {#if pret}
      <section class="flex flex-col gap-2 pb-4" aria-label="Questions de cette séance">
        {#if b.sur > 0}<p class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">{bonnes}</p>{/if}
        <ul class="flex flex-row flex-wrap gap-2">
          {#each liste as ref, i (`${ref.etape}-${ref.question}`)}
            {@const e = etat(ref.etape, ref.question)}
            <li>
              <button
                type="button"
                class="{e === 'correcte' ? pastille : e === 'incorrecte' ? pastilleIncorrecte : pastilleNeutre} gap-0.5"
                style="min-height: 32px; min-width: 40px"
                aria-label="Question {i + 1} : {LIBELLES[e]}"
                onclick={() => allerA(i)}
              >
                {i + 1}<i aria-hidden="true" class="bx {e === 'correcte' ? 'bx-check' : e === 'incorrecte' ? 'bx-x' : e === 'papier' ? 'bx-pencil' : 'bx-minus'}"></i>
              </button>
            </li>
          {/each}
        </ul>
        {#if aRevoir > 0 && aRevoir < liste.length}
          <label class="flex flex-row items-center gap-3 text-coopmaths-corpus dark:text-coopmathsdark-corpus" style="min-height: 44px">
            <input type="checkbox" role="switch" class="interrupteur shrink-0" bind:checked={seulementIncorrectes} />
            Seulement les questions incorrectes ({aRevoir})
          </label>
        {/if}
      </section>
      {#each montrees as { ref, i }, k (`${ref.etape}-${ref.question}`)}
        {@const ex = exercices[ref.etape]}
        <div id="question-{i}" style="scroll-margin-top: 5rem"></div>
        {#if parcours.enTetesMasques}
          {#if liste.length > 1}<div class="text-coopmaths-struct dark:text-coopmathsdark-struct pb-2" class:mt-6={i > 0}>
            <div class="inline-flex items-center justify-center h-6 w-6 bg-coopmaths-struct text-coopmaths-canvas font-light text-lg">{i + 1}</div>
          </div>{/if}
        {:else if k === 0 || montrees[k - 1].ref.etape !== ref.etape}
          <h1 class="text-coopmaths-struct dark:text-coopmathsdark-struct pb-2 flex flex-row items-center" class:mt-6={i > 0}>
            <div class="flex flex-row justify-start items-start">
              {#if seance.etapes.length > 1}
                <div
                  class="inline-flex items-center justify-center h-6 w-6 bg-coopmaths-struct text-coopmaths-canvas font-light text-lg translate-y-1"
                >
                  {seance.etapes.indexOf(ref.etape) + 1}
                </div>
              {/if}
              <div class="font-light {seance.etapes.length > 1 ? 'ml-2' : ''}" style="font-size: 1.25rem; line-height: 1.3;">
                {#if titreVisible(parcours, parcours.etapes[ref.etape])}<span use:latex={parcours.etapes[ref.etape].titre || ex.titre}></span>{/if}
              </div>
            </div>
          </h1>
        {/if}
        <BlocQuestion
          {moteur}
          exercice={ex}
          question={ref.question}
          avecContexte={k === 0 || montrees[k - 1].ref.etape !== ref.etape}
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
