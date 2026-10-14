<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte'
  import type { Parcours } from '$lib/catalogue'
  import type { ExercicePrepare, Moteur, ResultatVerification } from '$lib/moteur'
  import { cleQuestion, premiersEssais, questionsDe, valeur, type Seance } from '$lib/progression'
  import BlocQuestion from './BlocQuestion.svelte'
  import { boutonAction, boutonInverse, pastille } from './classes'
  import EnTete from './EnTete.svelte'
  import { navigation, retourSi } from '$lib/navigation.svelte'

  let {
    parcours,
    seance = $bindable(),
    moteur,
    onsauver,
    onquitter,
    onterminer,
  }: {
    parcours: Parcours
    seance: Seance
    moteur: Moteur
    onsauver: (s: Seance) => void
    onquitter: () => void
    onterminer: () => void
  } = $props()

  type Ref = { etape: number; question: number; rang: number }

  let exercices: Record<number, ExercicePrepare> = $state({})
  let pret = $state(false)
  let erreur = $state('')
  let hoteClavier: HTMLDivElement
  let hauteurClavier = $state(0)
  let aSaisi = $state(false)
  let blocs: (BlocQuestion | undefined)[] = $state([])
  let demonterClavier: (() => void) | undefined
  let mesure: ReturnType<typeof setInterval> | undefined

  const liste: Ref[] = $derived(pret ? questionsDe(seance).map((q, rang) => ({ ...q, rang })) : [])
  // La présentation et le moment de validation sont choisis par l'enseignant
  const presentation = $derived(parcours.presentation)
  const finale = $derived(parcours.correction === 'parcours')
  // Une fois la tentative soumise, toutes les questions sur une page, corrigées
  const relecture = $derived(finale && !!seance.soumise)
  const pages: Ref[][] = $derived.by(() => {
    if (relecture) return liste.length ? [liste] : []
    if (presentation === 'une_question_par_page') return liste.map((q) => [q])
    if (presentation === 'un_exo_par_page') return seance.etapes.map((e) => liste.filter((q) => q.etape === e))
    return liste.length ? [liste] : []
  })
  const page = $derived(Math.max(0, pages.findIndex((p) => p.some((q) => q.rang === seance.position))))
  const premiers = $derived(premiersEssais(seance))
  const points = $derived([...premiers.values()].reduce((a, e) => a + valeur(e), 0))
  const unique = $derived(presentation === 'une_question_par_page' && !relecture)
  // Validation question par question sur une page qui en contient plusieurs
  const parQuestion = $derived(parcours.correction === 'question' && !unique && !relecture)
  const derniere = $derived(page + 1 >= pages.length)
  const pageVerifiee = $derived(
    !!pages[page] &&
      pages[page].every(
        (q) => premiers.has(cleQuestion(q.etape, q.question)) || !exercices[q.etape]?.questions[q.question]?.interactive,
      ),
  )
  const libelleVerifier = $derived(
    unique ? 'Vérifier' : presentation === 'un_exo_par_page' ? 'Soumettre l’exercice' : 'Soumettre',
  )
  const libelleSuivant = $derived(
    derniere ? 'Voir le bilan' : presentation === 'une_question_par_page' ? 'Question suivante' : 'Exercice suivant',
  )

  const arrondi = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1))

  function smiley(etape: number, q: number) {
    if (finale && !seance.soumise) return ''
    const e = premiers.get(cleQuestion(etape, q))
    return e ? (valeur(e) === 1 ? '😎' : '☹️') : ''
  }

  function scoreEtape(etape: number) {
    if (finale && !seance.soumise) return ''
    const qs = liste.filter((q) => q.etape === etape)
    const faites = qs.filter((q) => premiers.has(cleQuestion(q.etape, q.question)))
    if (!faites.length) return ''
    return `${arrondi(faites.reduce((a, q) => a + valeur(premiers.get(cleQuestion(q.etape, q.question))), 0))}/${qs.length}`
  }

  function sauver() {
    onsauver($state.snapshot(seance) as Seance)
  }

  function enregistrerEssai(ref: Ref, r: ResultatVerification) {
    seance.essais.push({
      etape: ref.etape,
      question: ref.question,
      juste: r.juste,
      points: r.points,
      total: r.total,
      reponses: r.reponses,
      le: new Date().toISOString(),
    })
    delete seance.brouillons[cleQuestion(ref.etape, ref.question)]
    sauver()
  }

  function enregistrerBrouillon(ref: Ref, saisies: Record<string, string>) {
    seance.brouillons[cleQuestion(ref.etape, ref.question)] = saisies
    sauver()
  }

  async function allerPage(p: number) {
    if (!pages[p]) return
    seance.position = pages[p][0].rang
    aSaisi = false
    sauver()
    scrollTo({ top: 0 })
    await tick()
    if (unique) blocs[0]?.focaliser()
  }

  function avancer() {
    if (!derniere) void allerPage(page + 1)
    else onterminer()
  }

  // ---------- Garde-fou : réponses manquantes ou pas encore vérifiées ----------
  type Manque = { ref: Ref; raison: 'vide' | 'saisie' }
  let avertissement: { manques: Manque[]; libelle: string; continuer: () => void } | null = $state(null)
  // Logo touché pendant la séance : confirmer avant de quitter
  let confirmerSortie = $state(false)
  // Bouton retour du téléphone : referme ce qui est ouvert, sinon demande confirmation
  retourSi(
    () => true,
    () => {
      if (avertissement) avertissement = null
      else confirmerSortie = !confirmerSortie
    },
  )

  function etatDe(ref: Ref): 'verifiee' | 'saisie' | 'vide' {
    const i = pages[page]?.findIndex((q) => q.rang === ref.rang) ?? -1
    if (i !== -1 && blocs[i]) return blocs[i]!.etat()
    const cle = cleQuestion(ref.etape, ref.question)
    if (premiers.has(cle)) return 'verifiee'
    return Object.keys(seance.brouillons[cle] ?? {}).length ? 'saisie' : 'vide'
  }

  const nomQuestion = (ref: Ref) => `Ex ${seance.etapes.indexOf(ref.etape) + 1} · Q${ref.question + 1}`

  /** Continue tout de suite, ou signale d'abord ce qui manque */
  function garder(refs: Ref[], exigerVerification: boolean, libelle: string, continuer: () => void) {
    const manques: Manque[] = []
    for (const ref of refs) {
      if (!exercices[ref.etape]?.questions[ref.question]?.interactive) continue
      const e = etatDe(ref)
      if (e === 'vide') manques.push({ ref, raison: 'vide' })
      else if (e === 'saisie' && exigerVerification) manques.push({ ref, raison: 'saisie' })
    }
    if (manques.length === 0) return continuer()
    avertissement = { manques, libelle, continuer }
  }

  async function allerA(ref: Ref) {
    avertissement = null
    const p = pages.findIndex((pg) => pg.some((q) => q.rang === ref.rang))
    if (p !== page) await allerPage(p)
    await tick()
    blocs[pages[p].findIndex((q) => q.rang === ref.rang)]?.focaliser(true)
  }

  function continuerQuandMeme() {
    const c = avertissement?.continuer
    avertissement = null
    c?.()
  }

  function suivant() {
    // Après chaque question : signaler celles de la page qui ne sont pas vérifiées
    if (parQuestion && !pageVerifiee) garder(pages[page], true, 'Continuer quand même', avancer)
    else avancer()
  }

  /** Touche Entrée dans une question : ne révèle jamais une correction que le bouton ne révélerait pas */
  function surEntree(i: number) {
    if (relecture) return
    if (unique && finale) {
      if (!derniere) void allerPage(page + 1)
    } else if (unique) {
      if (pageVerifiee) suivant()
      else if (aSaisi) void verifierPage()
    } else {
      // Plusieurs questions sur la page : la correction attend le bouton Soumettre
      blocs[i + 1]?.focaliser(true)
    }
  }

  /** Bouton Vérifier (une question) ou Soumettre (page entière) */
  function verifierPageAvecGarde() {
    if (unique) void verifierPage()
    else garder(pages[page], false, 'Soumettre quand même', () => void verifierPage())
  }

  /** Vérifie toutes les questions de la page (bouton Vérifier ou Soumettre) */
  async function verifierPage() {
    erreur = ''
    for (const bloc of blocs) {
      try {
        await bloc?.verifier()
      } catch (e) {
        erreur = `Une question ne peut pas être vérifiée (${(e as Error).message}).`
      }
    }
  }

  function soumettreAvecGarde() {
    garder(liste, false, 'Soumettre quand même', () => void soumettreTentative())
  }

  /** Correction à la fin : toutes les questions sont vérifiées en relecture */
  async function soumettreTentative() {
    seance.soumise = true
    seance.position = 0
    sauver()
    scrollTo({ top: 0 })
  }

  // Titres d'exercices : MathALÉA y met du LaTeX ($ax+bx$)
  function latex(noeud: HTMLElement, texte: string) {
    const rendre = (t: string) => {
      noeud.textContent = t
      void moteur.afficher(noeud)
    }
    rendre(texte)
    return { update: rendre }
  }

  onMount(async () => {
    demonterClavier = moteur.monterClavier(hoteClavier)
    // Le clavier de MathALÉA est fixé en bas : la barre d'actions se place au-dessus
    mesure = setInterval(() => {
      const clavier = document.getElementById('mathalea-virtual-keyboard')
      const h = clavier?.getBoundingClientRect().height ?? 0
      // Seulement si un champ (ou le clavier) a le focus : après une validation,
      // la barre reste en bas pendant que le clavier se referme
      const saisieEnCours = document.activeElement?.closest('math-field, mathalea-mathfield, #mathalea-virtual-keyboard') != null
      hauteurClavier = saisieEnCours && clavier && h > 0 && getComputedStyle(clavier).display !== 'none' ? h : 0
    }, 120)
    try {
      for (const etape of seance.etapes) {
        const ex = await moteur.preparerExercice({ ...parcours.etapes[etape], alea: seance.graines[etape] }, etape)
        exercices[etape] = ex
        seance.graines[etape] = ex.graine
        seance.nbQuestions[etape] = ex.questions.length
      }
      seance.moteur = moteur.VERSION_MOTEUR
      if (seance.position >= questionsDe(seance).length) seance.position = 0
      pret = true
      sauver()
      await tick()
      if (unique) blocs[0]?.focaliser()
    } catch (e) {
      erreur = `Impossible de préparer les exercices : ${(e as Error).message}`
    }
  })

  onDestroy(() => {
    clearInterval(mesure)
    demonterClavier?.()
  })
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete surLogo={() => (confirmerSortie = true)}>
    {#snippet gauche()}
      <button
        type="button"
        aria-label="Quitter (tout est enregistré)"
        onclick={onquitter}
        class="shrink-0 p-1 text-coopmaths-action dark:text-coopmathsdark-action"
      >
        <i aria-hidden="true"
 class="bx bx-x text-3xl"></i>
      </button>
    {/snippet}
    {#snippet droite()}
      {#if pret}
        <span class={pastille}>{arrondi(points)}/{liste.length}</span>
      {/if}
    {/snippet}
  </EnTete>

  {#if pret && pages.length > 1}
    <!-- Onglets de la vue élève de MathALÉA (Eleve.svelte) -->
    <div
      class="flex flex-row overflow-x-auto w-full mt-2 mb-4 border-b-2 border-coopmaths-struct dark:border-coopmathsdark-struct
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
      role="tablist"
      aria-label={unique ? 'Questions' : 'Exercices'}
    >
      {#each pages as p, i (i)}
        <button
          role="tab"
          aria-selected={i === page}
          aria-label={unique ? `Question ${i + 1}` : `Exercice ${i + 1}`}
          class="relative group flex-1 {i === page ? 'border-b-4' : 'border-b-0'} border-coopmaths-struct dark:border-coopmathsdark-struct text-coopmaths-action dark:text-coopmathsdark-action"
          style="min-width: 2.75rem"
          onclick={() => allerPage(i)}
        >
          <div class="py-2 px-2 text-xl font-light whitespace-nowrap">
            {#if unique}
              {i + 1}<span class="ml-1 text-sm">{smiley(p[0].etape, p[0].question)}</span>
            {:else}
              Ex {i + 1}<span class="ml-1 text-sm font-bold">{scoreEtape(p[0].etape)}</span>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  {/if}

  <main class="flex-1 px-4" class:pt-4={pages.length <= 1} style="padding-bottom: calc({hauteurClavier}px + 6rem)">
    {#if seance.code}
      <p class="pb-2 text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
        Session <span class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{seance.code}</span>
      </p>
    {/if}
    {#if erreur}
      <p class="py-4 font-bold text-coopmaths-action dark:text-coopmathsdark-action" role="alert">{erreur}</p>
    {/if}

    {#if pret && pages[page]}
      {#key `${presentation}-${page}-${relecture}`}
        {#each pages[page] as ref, i (ref.rang)}
          {@const ex = exercices[ref.etape]}
          {@const debutEtape = i === 0 || pages[page][i - 1].etape !== ref.etape}
          {#if debutEtape}
            <!-- En-tête d'exercice de la vue élève (HeaderExerciceVueEleve.svelte) -->
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
            bind:this={blocs[i]}
            bind:aSaisi
            {moteur}
            exercice={ex}
            question={ref.question}
            avecContexte={unique || debutEtape}
            verifierAuMontage={relecture}
            avecBouton={parQuestion}
            essai={premiers.get(cleQuestion(ref.etape, ref.question))}
            brouillon={seance.brouillons[cleQuestion(ref.etape, ref.question)]}
            onverifiee={(r) => enregistrerEssai(ref, r)}
            onbrouillon={(s) => enregistrerBrouillon(ref, s)}
            onvalider={parQuestion ? undefined : () => surEntree(i)}
            onsaisie={() => (avertissement = null)}
          />
        {/each}
      {/key}
    {/if}
  </main>

  {#if pret}
    <footer
      class="fixed left-0 right-0 z-20 flex flex-col gap-3 px-4 py-3 {hauteurClavier ? '' : 'zone-sure-bas'}
      border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
      style="bottom: {hauteurClavier}px"
    >
      {#if confirmerSortie}
        <div
          role="alert"
          class="border-l-[3px] border-coopmaths-action dark:border-coopmathsdark-action bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark px-3 py-2 text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        >
          Quitter l’activité ? Tes réponses sont enregistrées : tu pourras reprendre plus tard.
        </div>
        <div class="flex flex-row gap-3">
          <button type="button" class="{boutonAction} flex-1" style="min-height: 44px" onclick={() => navigation.versAccueil()}>Quitter</button>
          <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={() => (confirmerSortie = false)}>Rester</button>
        </div>
      {:else if avertissement}
        {@const vides = avertissement.manques.filter((m) => m.raison === 'vide')}
        {@const saisies = avertissement.manques.filter((m) => m.raison === 'saisie')}
        <div
          role="alert"
          class="border-l-[3px] border-coopmaths-action dark:border-coopmathsdark-action bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark px-3 py-2 text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        >
          <p class="font-bold">{avertissement.libelle} ?</p>
          {#if vides.length}
            <p>
              {vides.length === 1 ? 'Il reste une question sans réponse' : `Il reste ${vides.length} questions sans réponse`} :
              {vides.map((m) => nomQuestion(m.ref)).join(', ')}.
            </p>
          {/if}
          {#if saisies.length}
            <p>
              {saisies.length === 1 ? 'Une réponse n’est pas encore vérifiée' : `${saisies.length} réponses ne sont pas encore vérifiées`} :
              {saisies.map((m) => nomQuestion(m.ref)).join(', ')}.
            </p>
          {/if}
        </div>
        <div class="flex flex-row gap-3">
          <button type="button" class="{boutonAction} flex-1" style="min-height: 44px" onclick={() => allerA(avertissement!.manques[0].ref)}>
            Aller à {nomQuestion(avertissement.manques[0].ref)}
          </button>
          <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={continuerQuandMeme}>
            {avertissement.libelle}
          </button>
        </div>
      {:else}
      <div class="flex flex-row gap-3">
      {#if finale && !seance.soumise}
        {#if derniere}
          <button type="button" class="{boutonAction} flex-1" style="min-height: 44px" onclick={soumettreAvecGarde}>
            Soumettre la tentative
          </button>
        {:else}
          <button type="button" class="{boutonAction} flex-1" style="min-height: 44px" onclick={() => allerPage(page + 1)}>
            {presentation === 'une_question_par_page' ? 'Question suivante' : 'Exercice suivant'}
          </button>
        {/if}
      {:else if pageVerifiee || parQuestion}
        <button type="button" class="{boutonAction} flex-1" style="min-height: 44px" onclick={suivant}>
          {libelleSuivant}
        </button>
      {:else}
        <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={suivant}>
          {derniere ? 'Terminer' : 'Passer'}
        </button>
        <button
          type="button"
          class="{boutonAction} flex-1 disabled:opacity-40"
          style="min-height: 44px"
          disabled={unique && !aSaisi}
          onclick={verifierPageAvecGarde}
        >
          {libelleVerifier}
        </button>
      {/if}
      </div>
      {/if}
    </footer>
  {/if}

  <div bind:this={hoteClavier}></div>
</div>
