<script lang="ts">
  import { titreEleve, type Parcours, type Fiche, type Pause, type Ressource } from '$lib/catalogue'
  import { lienSur, ouvrirLien } from '$lib/fichiers'
  import type { Moteur } from '$lib/moteur'
  import { bilan, cleQuestion, premiersEssais, questionsOrdonnees, valeur, type Seance } from '$lib/progression'
  import QuestionsEtape from './QuestionsEtape.svelte'
  import { boutonAction, boutonInverse, boutonLien, listeGroupee, pastille, pastilleIncorrecte, pastilleScore } from './classes'
  import EnTete from './EnTete.svelte'
  import Ceinture from './Ceinture.svelte'
  import { texteBarrettes } from '$lib/revisions'
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
    onfiche,
    test = null,
    revision = null,
    barrettes = [],
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
      couleur: string | null // ceinture : sa couleur
      attendu: number // réussite attendue, en %
      deja: boolean // déjà obtenue lors d'un passage précédent
      pause?: Pause
      ressource?: Ressource
      fiche?: Fiche
      suite: { nom: string; ouvert: boolean; libre: boolean; condition: string; attendDate?: boolean } | null
    } | null
    oncontinuer?: () => void // commence le palier suivant
    onfiche?: (f: Fiche) => void // revoir la fiche de cours du palier
    /** Teste ton niveau : verdict et suites proposées, à la place des actions d'un parcours */
    test?: { message: string; actions: { libelle: string; fn: () => void }[] } | null
    /** Séance de révision : pour chaque exercice, réussi ou non et quand il reviendra */
    revision?: Record<number, { reussi: boolean; quand: string }> | null
    /** Barrettes gagnées par cette séance : ceintures dont les exercices ont été réussis de nouveau après plusieurs jours */
    barrettes?: { nom: string; couleur: string; theme: string; barrettes: number }[]
  } = $props()

  const b = $derived(bilan(seance))
  let ouvertes: Record<number, boolean> = $state({})
  // Teste ton niveau : les questions dans l'ordre où elles ont été posées, sans nom de sujet
  const premiers = $derived(premiersEssais(seance))
  const questions = $derived(questionsOrdonnees(seance))
  let questionsOuvertes: Record<string, boolean> = $state({})
  const arrondi = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1))
  const papier = $derived(b.parEtape.reduce((a, e) => a + e.papier, 0))
  const vues = $derived(b.parEtape.reduce((a, e) => a + e.vues, 0))

  // ---------- Palier ou ceinture : l'état d'abord, le score en petit ----------
  // Jugé quand tout est fait (questions passées : le bilan garde le score seul)
  const juge = $derived(!!palier && b.sur > 0 && b.passees.length === 0)
  const reussi = $derived(juge && b.pourcentage >= palier!.attendu)
  /** Bonnes réponses qui manquaient pour atteindre la réussite attendue */
  const manque = $derived.by(() => {
    if (!juge || reussi) return 0
    let n = 1
    while (n < b.sur && Math.round((100 * (b.points + n)) / b.sur) < palier!.attendu) n++
    return n
  })
  const etat = $derived.by(() => {
    if (!juge) return ''
    const ceinture = palier!.couleur !== null
    if (reussi) return ceinture ? `${palier!.nom} obtenue` : `${palier!.nom} réussi`
    return `Il manquait ${manque} bonne${manque > 1 ? 's' : ''} réponse${manque > 1 ? 's' : ''}`
  })
  // Sous l'état : le score, précédé du palier quand l'état ne le nomme pas
  const sousEtat = $derived.by(() => {
    if (!juge) return ''
    const score = `${arrondi(b.points)} / ${b.sur} · ${b.pourcentage} %`
    if (reussi) return score
    return `${palier!.nom}${palier!.deja ? (palier!.couleur ? ' déjà obtenue' : ' déjà réussi') : ''} · ${score}`
  })
  // La pause de l'enseignant suit un palier réussi ; sans seuil pour la suite, elle s'affiche toujours
  const pauseMontree = $derived(!!palier?.pause && b.passees.length === 0 && (reussi || !juge || palier.suite?.libre === true))
  // Palier manqué : la première erreur est dépliée d'office, avec sa correction
  $effect(() => {
    if (!juge || reussi) return
    const premiere = b.parEtape.find((e) => e.sur > 0 && e.points < e.sur)
    if (premiere) ouvertes[premiere.etape] = true
  })
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre={seance.type === 'ciblee' ? `${parcours.titre} · reprise` : parcours.titre} onretour={onfermer} />

  <main class="flex-1 flex flex-col gap-4 p-4 zone-sure-bas">
    {#if juge}
      <div class="flex flex-col items-center gap-3 py-4 text-center">
        {#if reussi && palier!.couleur}
          <!-- Ceinture obtenue : sa couleur, en grand -->
          <span aria-hidden="true" class="block h-12 w-44 rounded-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest" style="background-color: {palier!.couleur}"></span>
        {/if}
        <p class="text-2xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct" role="status">{etat}</p>
        <p class="text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
          {sousEtat}
        </p>
      </div>
    {:else}
    <div class="text-center py-4">
      {#if b.sur > 0}
        <div class="font-light text-coopmaths-struct dark:text-coopmathsdark-struct" style="font-size: 3.5rem; line-height: 1">
          {arrondi(b.points)} / {b.sur}
        </div>
        <div class="mt-2 text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
          {b.pourcentage} % · {b.reussies} réponse{b.reussies > 1 ? 's' : ''} correcte{b.reussies > 1 ? 's' : ''}
          {#if b.passees.length}· {b.passees.length} passée{b.passees.length > 1 ? 's' : ''}{/if}
        </div>
      {:else}
        <!-- Tout sur papier : pas de score, les corrections ouvertes -->
        <div class="font-light text-coopmaths-struct dark:text-coopmathsdark-struct" style="font-size: 3.5rem; line-height: 1">
          {vues} / {papier}
        </div>
        <div class="mt-2 text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
          correction{vues > 1 ? 's' : ''} vue{vues > 1 ? 's' : ''}
        </div>
      {/if}
      {#if test}<p class="mt-1 font-bold text-coopmaths-struct dark:text-coopmathsdark-struct" role="status">{test.message}</p>
      {:else if palier}<p class="mt-1 font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Bilan : {palier.nom.toLowerCase()}</p>{/if}
    </div>
    {/if}

    {#if barrettes.length}
      <section class="flex flex-col gap-3 rounded-2xl p-4 border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest" aria-label="Barrettes gagnées">
        <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{barrettes.length > 1 ? 'Barrettes gagnées' : 'Barrette gagnée'}</p>
        {#each barrettes as x (`${x.theme}|${x.nom}`)}
          <div class="flex flex-row items-center gap-3">
            <Ceinture couleur={x.couleur} barrettes={x.barrettes} />
            <div class="min-w-0 flex flex-col">
              <span class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">{x.nom} · {x.theme}</span>
              <span class="text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">{texteBarrettes(x.barrettes)}</span>
            </div>
          </div>
        {/each}
      </section>
    {/if}

    {#if palier?.pause && pauseMontree}
      <section class="flex flex-col gap-2 rounded-2xl p-4 border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest" aria-label="Pause">
        <p class="flex flex-row items-center gap-2 font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">
          <i aria-hidden="true" class="bx bx-pause-circle text-xl text-coopmaths-action dark:text-coopmathsdark-action"></i> Pause
        </p>
        <p class="whitespace-pre-line text-coopmaths-corpus dark:text-coopmathsdark-corpus">{palier.pause.texte}</p>
        {#if palier.pause.ressource && lienSur(palier.pause.ressource.lien)}
          <button type="button" class="{boutonLien} w-full" onclick={() => ouvrirLien(palier!.pause!.ressource!.lien)}>
            <i aria-hidden="true" class="bx bx-link-external text-xl"></i> {palier.pause.ressource.titre}
          </button>
        {/if}
      </section>
    {/if}

    {#if test}
    <ul class={listeGroupee}>
      {#each questions as q, i (cleQuestion(q.etape, q.question))}
        {@const cle = cleQuestion(q.etape, q.question)}
        {@const v = valeur(premiers.get(cle))}
        <li class="bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
          <button
            type="button"
            class="w-full flex flex-row items-center justify-between gap-3 px-4 py-3 text-left
            active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest transition-colors duration-150"
            aria-expanded={!!questionsOuvertes[cle]}
            onclick={() => (questionsOuvertes[cle] = !questionsOuvertes[cle])}
          >
            <span class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">Question {i + 1}</span>
            <span class="flex flex-row items-center gap-2">
              <span class={v === 1 ? pastille : pastilleIncorrecte}>{v === 1 ? 'Correcte' : 'Incorrecte'}</span>
              <i aria-hidden="true"
                class="bx {questionsOuvertes[cle] ? 'bx-chevron-up' : 'bx-chevron-down'} text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
              ></i>
            </span>
          </button>
          {#if questionsOuvertes[cle]}
            <div class="px-4 pb-4 pt-2 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
              <QuestionsEtape {parcours} {seance} etape={q.etape} question={q.question} {moteur} />
            </div>
          {/if}
        </li>
      {/each}
    </ul>
    {:else}
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
            <div class="min-w-0 flex flex-col text-coopmaths-corpus dark:text-coopmathsdark-corpus">
              {#if revision}
                <!-- Révision : le titre, caché pendant la séance, est dévoilé -->
                <span>{titreEleve({ titresVisibles: true }, { ...parcours.etapes[e.etape], titreMasque: false }, e.etape)}</span>
                {#if revision[e.etape]}
                  <span class="text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">Revient {revision[e.etape].quand}</span>
                {/if}
              {:else}
                {titreEleve(parcours, parcours.etapes[e.etape], e.etape)}
              {/if}
            </div>
            <div class="flex flex-row items-center gap-2">
              {#if e.sur > 0}
                <span class={pastilleScore((100 * e.points) / e.sur)}>{arrondi(e.points)}/{e.sur}</span>
              {:else}
                <span class="shrink-0 whitespace-nowrap text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">{e.vues === e.papier ? 'Correction vue' : 'Sur papier'}</span>
              {/if}
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
    {/if}

    {#if revision}
      <div class="flex flex-col gap-3">
        {#if b.passees.length > 0}
          <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={onpassees}>
            Répondre aux questions passées ({b.passees.length})
          </button>
        {/if}
        <button type="button" class="{b.passees.length ? boutonInverse : boutonAction} w-full" style="min-height: 44px" onclick={onfermer}>Terminer</button>
      </div>
    {:else if test}
      <div class="flex flex-col gap-3">
        {#each test.actions as a, i (a.libelle)}
          <button type="button" class="{i === 0 ? boutonAction : boutonInverse} w-full" style="min-height: 44px" onclick={a.fn}>{a.libelle}</button>
        {/each}
      </div>
    {:else}
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
          <i aria-hidden="true" class="bx {palier.suite.attendDate ? 'bx-calendar' : 'bx-lock-alt'} text-coopmaths-action dark:text-coopmathsdark-action"></i>
          Pour ouvrir {palier.suite.nom.toLowerCase()} : {palier.suite.condition}.
        </p>
        {#if palier.fiche && onfiche}
          <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => onfiche(palier!.fiche!)}>
            <i aria-hidden="true" class="bx bx-book-reader text-xl"></i> Revoir la fiche : {palier.fiche.titre}
          </button>
        {/if}
        {#if palier.ressource && lienSur(palier.ressource.lien)}
          <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => ouvrirLien(palier!.ressource!.lien)}>
            <i aria-hidden="true" class="bx bx-book-open text-xl"></i> Pour revoir : {palier.ressource.titre}
          </button>
        {/if}
      {/if}
      <button
        type="button"
        class="{b.passees.length === 0 && !(palier?.suite?.ouvert && oncontinuer) && !palier?.suite?.attendDate && (palier || nbAAmeliorer === 0) ? boutonAction : boutonInverse} w-full"
        style="min-height: 44px"
        onclick={onrefaire}
      >
        {palier ? `Refaire : ${palier.nom.toLowerCase()}` : 'Tout refaire'}
      </button>
      {#if palier}
        <button type="button" class="{b.passees.length === 0 && palier.suite?.attendDate ? boutonAction : boutonInverse} w-full" style="min-height: 44px" onclick={onfermer}>Voir la carte du parcours</button>
      {:else}
        <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => navigation.versAccueil()}>
          Retour à l’accueil
        </button>
      {/if}
    </div>
    {/if}
  </main>
</div>
