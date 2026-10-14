<script lang="ts">
  // Choix des exercices comme sur le site : par niveau puis par chapitre, ou
  // par recherche ; aperçu et réglages avant d'ajouter.
  import type { Etape } from '$lib/catalogue'
  import type { DescriptionExercice, ExerciceDuReferentiel, Moteur } from '$lib/moteur'
  import ApercuExercice from './ApercuExercice.svelte'
  import { boutonAction, boutonInverse, listeGroupee } from './classes'
  import EnTete from './EnTete.svelte'
  import ReglagesExercice from './ReglagesExercice.svelte'
  import Tuile from './Tuile.svelte'
  import { retourSi } from '$lib/navigation.svelte'

  let {
    moteur,
    referentiel,
    niveauInitial,
    nbChoisis,
    decrire,
    onajouter,
    onfermer,
  }: {
    moteur: Moteur
    referentiel: ExerciceDuReferentiel[]
    niveauInitial: string
    nbChoisis: number
    decrire: (uuid: string) => Promise<DescriptionExercice | null>
    onajouter: (e: Etape) => void
    onfermer: () => void
  } = $props()

  const titreSection = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'

  const niveaux = $derived([...new Set(referentiel.map((e) => e.niveau))])
  let niveau: string | null = $state(null)
  let chapitre: string | null = $state(null)
  let recherche = $state('')
  // Exercice ouvert : réglages et aperçu
  let ouvert: Etape | null = $state(null)
  let description: DescriptionExercice | null = $state(null)
  let decrit = $state(false) // réglages connus : le formulaire peut s'afficher
  let ajoutes = $state(0)

  // Le niveau du parcours, s'il existe dans le référentiel, ouvre directement ses chapitres (une fois)
  let niveauOuvert = false
  $effect.pre(() => {
    if (!niveauOuvert && niveaux.length) {
      niveauOuvert = true
      if (niveauInitial && niveaux.includes(niveauInitial)) niveau = niveauInitial
    }
  })

  const chapitres = $derived(niveau ? [...new Set(referentiel.filter((e) => e.niveau === niveau).map((e) => e.theme))] : [])
  const liste = $derived(niveau && chapitre ? referentiel.filter((e) => e.niveau === niveau && e.theme === chapitre) : [])

  const normaliser = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const resultats = $derived.by(() => {
    const mots = normaliser(recherche).split(/\s+/).filter(Boolean)
    if (!mots.length) return []
    const requete = normaliser(recherche.trim())
    const rang = (e: ExerciceDuReferentiel) => {
      const id = normaliser(e.id)
      return id === requete ? 0 : id.startsWith(requete) ? 1 : id.includes(requete) ? 2 : 3
    }
    return referentiel
      .filter((e) => mots.every((m) => normaliser(`${e.id} ${e.titre} ${e.niveau} ${e.theme}`).includes(m)))
      .sort((a, b) => rang(a) - rang(b))
      .slice(0, 40)
  })
  const sansDollars = (t: string) => t.replace(/\$([^$]*)\$/g, '$1')

  async function ouvrir(e: ExerciceDuReferentiel) {
    if (ouvert?.uuid === e.uuid) {
      ouvert = null
      return
    }
    description = null
    decrit = false
    ouvert = { uuid: e.uuid, id: e.id, titre: e.titre, nbQuestions: 3 }
    const d = await decrire(e.uuid)
    if (ouvert?.uuid !== e.uuid) return
    description = d
    if (d) ouvert.nbQuestions = d.nbQuestions
    decrit = true
  }

  function ajouter() {
    if (!ouvert) return
    onajouter($state.snapshot(ouvert) as Etape)
    ajoutes++
    ouvert = null
  }

  retourSi(() => true, () => retour())
  function retour() {
    if (ouvert) ouvert = null
    else if (chapitre) chapitre = null
    else if (niveau) niveau = null
    else onfermer()
  }
</script>

{#snippet exercices(l: ExerciceDuReferentiel[])}
  <ul class={listeGroupee}>
    {#each l as e (e.uuid)}
      <li class="bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
        <button
          type="button"
          aria-expanded={ouvert?.uuid === e.uuid}
          class="w-full flex flex-row items-center justify-between gap-3 px-4 py-3 text-left"
          onclick={() => ouvrir(e)}
        >
          <div class="min-w-0">
            <div class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{e.id}</div>
            <div class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus">{sansDollars(e.titre)}</div>
            {#if recherche}<div class={discret}>{e.niveau} · {e.theme}</div>{/if}
          </div>
          <i aria-hidden="true" class="bx {ouvert?.uuid === e.uuid ? 'bx-chevron-up' : 'bx-chevron-down'} text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
        </button>
        {#if ouvert?.uuid === e.uuid && decrit}
          <div class="flex flex-col gap-4 px-4 pb-4">
            <ReglagesExercice bind:etape={ouvert} {description} />
            <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={ajouter}>Ajouter au parcours</button>
            <ApercuExercice {moteur} params={ouvert} />
          </div>
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre={chapitre ?? niveau ?? 'Ajouter des exercices'} onretour={retour} />
  <main class="flex-1 flex flex-col gap-3 p-4 zone-sure-bas" style="padding-bottom: 6rem">
    <label
      class="w-full flex flex-row items-center gap-2 rounded-full px-4 py-3
      bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
    >
      <i aria-hidden="true" class="bx bx-search"></i>
      <input
        type="search"
        aria-label="Rechercher un exercice MathALÉA (identifiant, titre, niveau)"
        bind:value={recherche}
        class="w-full bg-transparent border-0 p-0 focus:outline-0 focus:ring-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      />
    </label>

    {#if recherche.trim()}
      {#if resultats.length}
        {@render exercices(resultats)}
      {:else}
        <p class="py-6 text-center {discret}">Aucun exercice ne correspond.</p>
      {/if}
    {:else if niveau && chapitre}
      {@render exercices(liste)}
    {:else if niveau}
      {#each chapitres as c (c)}
        {@const nb = referentiel.filter((e) => e.niveau === niveau && e.theme === c).length}
        <Tuile icon="bx-book-content" title={c} subtitle="{nb} exercice{nb > 1 ? 's' : ''}" onclick={() => (chapitre = c)} />
      {/each}
    {:else}
      <h2 class={titreSection}>Niveaux</h2>
      {#each niveaux as n (n)}
        <Tuile icon="bx-layer" title={n} onclick={() => (niveau = n)} />
      {/each}
    {/if}
  </main>

  <footer
    class="fixed left-0 right-0 bottom-0 z-20 flex flex-row gap-3 px-4 py-3 zone-sure-bas
    border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  >
    <button type="button" class="{ajoutes ? boutonAction : boutonInverse} flex-1" style="min-height: 44px" onclick={onfermer}>
      Revenir au parcours ({nbChoisis} exercice{nbChoisis > 1 ? 's' : ''})
    </button>
  </footer>
</div>
