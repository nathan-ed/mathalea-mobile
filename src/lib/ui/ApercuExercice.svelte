<script lang="ts">
  // Aperçu d'un exercice avec ses réglages : énoncés numérotés, comme sur le site
  import type { Moteur, ParamsExercice } from '$lib/moteur'

  let { moteur, params }: { moteur: Moteur; params: ParamsExercice } = $props()

  let zone: HTMLElement
  let erreur = $state('')
  let tirage = $state(0)
  // Numéros d'exercice élevés : pas de collision avec les champs d'une autre zone
  let numero = 900 + Math.floor(Math.random() * 90)

  $effect(() => {
    // Seuls les réglages comptent : modifier le titre ne régénère pas l'aperçu
    const { uuid, nbQuestions, sup, sup2, sup3, sup4 } = params
    const p: ParamsExercice = { uuid, nbQuestions, sup, sup2, sup3, sup4 }
    void tirage
    let annule = false
    ;(async () => {
      try {
        const ex = await moteur.preparerExercice({ ...p, alea: undefined }, numero)
        if (annule) return
        const contexte = ex.questions[0]?.contexte.trim() ? `<div class="mb-2">${ex.questions[0].contexte}</div>` : ''
        zone.innerHTML =
          contexte + `<ol class="list-decimal pl-6 flex flex-col gap-3">${ex.questions.map((q) => `<li>${q.enonce}</li>`).join('')}</ol>`
        await moteur.afficher(zone)
        erreur = ''
      } catch (e) {
        if (!annule) erreur = `Aperçu impossible (${(e as Error).message}).`
      }
    })()
    return () => (annule = true)
  })
</script>

<div class="flex flex-col gap-2">
  <div class="flex flex-row items-center justify-between">
    <span class="text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">Aperçu</span>
    <button type="button" class="p-1 text-sm text-coopmaths-action dark:text-coopmathsdark-action" onclick={() => tirage++}>
      <i aria-hidden="true" class="bx bx-refresh"></i> Nouvelles valeurs
    </button>
  </div>
  {#if erreur}<p class="text-sm text-coopmaths-action dark:text-coopmathsdark-action" role="alert">{erreur}</p>{/if}
  <!-- Figure plus large que l'écran : elle défile ici, la page garde sa largeur -->
  <div bind:this={zone} class="contenu-mathalea cadre-defilant text-coopmaths-corpus dark:text-coopmathsdark-corpus"></div>
</div>
