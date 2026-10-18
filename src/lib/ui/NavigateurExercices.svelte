<script lang="ts">
  import { garderSaisie } from './barreDuBas'
  // Choix des exercices comme sur le site : par niveau puis par chapitre, ou
  // par recherche ; aperçu et réglages avant d'ajouter.
  import type { Etape } from '$lib/catalogue'
  import type { DescriptionExercice, ExerciceDuReferentiel, Moteur, NoeudDuReferentiel } from '$lib/moteur'
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

  // Arbre du menu du site : niveau > chapitre > sous-chapitre… (`chemin` du
  // moteur). Un moteur ancien ne donne que le niveau et le chapitre.
  const cheminDe = (e: ExerciceDuReferentiel): NoeudDuReferentiel[] =>
    e.chemin ?? [
      { code: e.niveau, titre: e.niveau, sousTheme: false },
      { code: e.theme, titre: e.theme, sousTheme: false },
    ]
  const entrees = $derived(referentiel.map((e) => ({ e, noeuds: cheminDe(e) })))
  // Nœuds ouverts, du niveau au nœud affiché
  let ouverts: NoeudDuReferentiel[] = $state([])
  let recherche = $state('')
  // Exercice ouvert : réglages et aperçu
  let ouvert: Etape | null = $state(null)
  let description: DescriptionExercice | null = $state(null)
  let decrit = $state(false) // réglages connus : le formulaire peut s'afficher
  let ajoutes = $state(0)

  // Les niveaux de l'app (1re) ont parfois un autre code que le référentiel (1e)
  const CODES_NIVEAUX: Record<string, string> = { '1re': '1e' }
  // Le niveau du parcours, s'il existe dans le référentiel, ouvre directement ses chapitres (une fois)
  let niveauOuvert = false
  $effect.pre(() => {
    if (!niveauOuvert && entrees.length) {
      niveauOuvert = true
      const code = CODES_NIVEAUX[niveauInitial] ?? niveauInitial
      const n = entrees.find((x) => x.noeuds[0]?.code === code)?.noeuds[0]
      if (code && n) ouverts = [n]
    }
  })

  // Le référentiel de MathALÉA range parfois un même exercice (même uuid) à
  // plusieurs endroits : une seule ligne par exercice (clé des listes)
  const uniques = (l: ExerciceDuReferentiel[]) => {
    const vus = new Set<string>()
    return l.filter((e) => !vus.has(e.uuid) && !!vus.add(e.uuid))
  }

  type Bloc =
    | { type: 'exercices'; liste: ExerciceDuReferentiel[] }
    | { type: 'noeud'; noeud: NoeudDuReferentiel; nb: number }
    | { type: 'section'; noeud: NoeudDuReferentiel; liste: ExerciceDuReferentiel[] }

  // Contenu du nœud affiché, dans l'ordre du site : exercices, chapitres en
  // tuiles, sous-thèmes dépliés sous un intertitre
  const blocs = $derived.by(() => {
    const prof = ouverts.length
    const dedans = entrees.filter((x) => x.noeuds.length >= prof && ouverts.every((n, i) => x.noeuds[i]?.code === n.code))
    const resultat: Bloc[] = []
    const parCode = new Map<string, Bloc>()
    for (const { e, noeuds } of dedans) {
      const n = noeuds[prof]
      if (!n) {
        const dernier = resultat.at(-1)
        if (dernier?.type === 'exercices') dernier.liste.push(e)
        else resultat.push({ type: 'exercices', liste: [e] })
        continue
      }
      let bloc = parCode.get(n.code)
      if (!bloc) {
        bloc = n.sousTheme ? { type: 'section', noeud: n, liste: [] } : { type: 'noeud', noeud: n, nb: 0 }
        parCode.set(n.code, bloc)
        resultat.push(bloc)
      }
      if (bloc.type === 'section') bloc.liste.push(e)
      else if (bloc.type === 'noeud') bloc.nb++
    }
    return resultat.map((b) => (b.type === 'noeud' ? b : { ...b, liste: uniques(b.liste) }))
  })
  // Nombre d'exercices d'un chapitre (sans les doublons)
  const nbDans = (chemin: NoeudDuReferentiel[]) =>
    uniques(entrees.filter((x) => chemin.every((n, i) => x.noeuds[i]?.code === n.code)).map((x) => x.e)).length

  const normaliser = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const resultats = $derived.by(() => {
    const mots = normaliser(recherche).split(/\s+/).filter(Boolean)
    if (!mots.length) return []
    const requete = normaliser(recherche.trim())
    const rang = (e: ExerciceDuReferentiel) => {
      const id = normaliser(e.id)
      return id === requete ? 0 : id.startsWith(requete) ? 1 : id.includes(requete) ? 2 : 3
    }
    const texte = (x: (typeof entrees)[number]) => `${x.e.id} ${x.e.titre} ${x.e.niveau} ${x.noeuds.map((n) => `${n.code} ${n.titre}`).join(' ')}`
    return uniques(
      entrees
        .filter((x) => mots.every((m) => normaliser(texte(x)).includes(m)))
        .map((x) => x.e)
        .sort((a, b) => rang(a) - rang(b)),
    ).slice(0, 40)
  })
  const sansDollars = (t: string) => t.replace(/\$([^$]*)\$/g, '$1')
  const echapper = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // Formules rendues comme sur le site (moteur récent), sinon texte sans les $
  const html = (t: string) => (moteur.titreHtml ? moteur.titreHtml(t) : echapper(sansDollars(t)))
  const ou = (e: ExerciceDuReferentiel) =>
    cheminDe(e)
      .map((n) => sansDollars(n.titre))
      .join(' › ')

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
    else if (ouverts.length) ouverts = ouverts.slice(0, -1)
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
            <div class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus">{@html html(e.titre)}</div>
            {#if recherche}<div class={discret}>{ou(e)}</div>{/if}
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
  <EnTete titre={ouverts.length ? sansDollars(ouverts[ouverts.length - 1].titre) : 'Ajouter des exercices'} titreHtml={ouverts.length ? html(ouverts[ouverts.length - 1].titre) : ''} onretour={retour} />
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
    {:else}
      {#if !ouverts.length}<h2 class={titreSection}>Niveaux</h2>{/if}
      {#each blocs as b, i (b.type === 'exercices' ? `exercices-${i}` : b.noeud.code)}
        {#if b.type === 'exercices'}
          {@render exercices(b.liste)}
        {:else if b.type === 'section'}
          <h2 class={titreSection}>{@html html(b.noeud.titre)}</h2>
          {@render exercices(b.liste)}
        {:else}
          {@const nb = ouverts.length ? nbDans([...ouverts, b.noeud]) : 0}
          <Tuile
            icon={ouverts.length ? 'bx-book-content' : 'bx-layer'}
            title={sansDollars(b.noeud.titre)}
            titleHtml={html(b.noeud.titre)}
            subtitle={nb ? `${nb} exercice${nb > 1 ? 's' : ''}` : ''}
            onclick={() => (ouverts = [...ouverts, b.noeud])}
          />
        {/if}
      {/each}
    {/if}
  </main>

  <footer
    use:garderSaisie
    class="fixed left-0 right-0 bottom-0 z-20 flex flex-row gap-3 px-4 py-3 zone-sure-bas
    border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  >
    <button type="button" class="{ajoutes ? boutonAction : boutonInverse} flex-1" style="min-height: 44px" onclick={onfermer}>
      Revenir au parcours ({nbChoisis} exercice{nbChoisis > 1 ? 's' : ''})
    </button>
  </footer>
</div>
