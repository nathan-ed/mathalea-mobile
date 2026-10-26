<script lang="ts">
  // Détail d'un parcours pour l'élève. Avec des paliers : une carte par palier
  // (état écrit en toutes lettres, exercices, objectifs, ressource pour revoir),
  // les pauses de l'enseignant entre les cartes, un seul bouton plein sur le
  // palier à faire. Sans paliers : la liste des exercices et Commencer.
  import { couleurCeinture, nomPalier, titreEleve, type Parcours } from '$lib/catalogue'
  import { etatsPaliers, resultatsParObjectif } from '$lib/objectifs'
  import { bilan, type ResultatEtape, type Seance } from '$lib/progression'
  import { modeQr, nouveauCode, normaliserCode } from '$lib/progression'
  import { reponsesDeSeance } from '$lib/releve'
  import { encoderInvitation } from '$lib/invitation'
  import QrSession from './QrSession.svelte'
  import ReglageSession from './ReglageSession.svelte'
  import { ouvrirLien } from '$lib/fichiers'
  import ChampTexte from './ChampTexte.svelte'
  import { boutonAction, boutonInverse, boutonLien, elementListe, listeGroupee, pastilleScore } from './classes'
  import EnTete from './EnTete.svelte'
  import Feuille from './Feuille.svelte'
  import { retourSi } from '$lib/navigation.svelte'

  let {
    parcours,
    resultats,
    enCours,
    etapesEnCours = null,
    aAmeliorer,
    epingle,
    explorer = false,
    passages,
    onepingler,
    onrelire,
    onretour,
    oncommencer,
    onrefaire,
    onameliorer,
    onsession,
    onsupprimer,
    onsessionClasse,
    ondonner,
    classesEnseignant = [],
    versionMoteur,
  }: {
    parcours: Parcours
    resultats: Record<number, ResultatEtape>
    enCours: boolean
    etapesEnCours?: number[] | null // exercices de la tentative en cours (un palier)
    aAmeliorer: number[]
    epingle: boolean
    explorer?: boolean // parcours du catalogue Explorer : l'épingle l'ajoute à l'accueil
    passages: Seance[]
    onepingler: () => void
    onrelire: (s: Seance) => void
    onretour: () => void
    oncommencer: (etapes?: number[]) => void // un palier, ou tout le parcours
    onrefaire: () => void
    onameliorer: () => void
    onsession: (code: string, etapes?: number[]) => void // avec des paliers : ceux d'un palier ouvert
    onsupprimer: () => void // tentative en cours
    onsessionClasse?: (code: string, etapes?: number[], classe?: string) => void // enseignant : lance la session et ouvre sa page (En classe)
    ondonner?: () => void // enseignant, parcours de l'Explorer : le reprend dans sa bibliothèque pour ses classes
    classesEnseignant?: string[] // enseignant : ses classes, au choix pour la session
    versionMoteur?: string // pour le QR code de la session (élèves dont l'app est plus ancienne)
  } = $props()

  let session: 'aucune' | 'creer' | 'rejoindre' = $state('aucune')
  // Session partagée d'un parcours à paliers : un palier ouvert, le même pour tous
  let palierSession = $state(0)
  let code = $state('')
  // Actions secondaires dans un panneau du bas : l'écran garde un seul bouton ;
  // « session » : réglages de la session pour la classe (enseignant)
  let feuille: 'actions' | 'suppression' | 'session' | null = $state(null)
  retourSi(() => session !== 'aucune', () => (session = 'aucune'))

  const difficultes = ['Découverte', 'Entraînement', 'Approfondissement']
  const titreSection = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  const date = (s: Seance) =>
    new Date(s.fin ?? s.debut).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  const dejaFait = $derived(Object.keys(resultats).length > 0)
  const nbQuestions = $derived(parcours.etapes.reduce((a, e) => a + (e.nbQuestions ?? 0), 0))

  const paliers = $derived(etatsPaliers(parcours, resultats))
  const avecPaliers = $derived(paliers.length > 1)
  const etapesSession = $derived(avecPaliers ? paliers[palierSession]?.etapes : undefined)
  function creerSession() {
    code = nouveauCode()
    palierSession = Math.max(0, courant)
    session = 'creer'
    feuille = null
  }
  // QR code de la session, à projeter : les élèves le scannent depuis l'accueil
  let qrSession = $state(false)
  const invitation = $derived(versionMoteur && code ? encoderInvitation({ c: code, p: parcours, m: versionMoteur, ...(etapesSession ? { e: etapesSession } : {}) }) : '')
  const memes = (a: number[], b: number[]) => a.length === b.length && a.every((x, i) => x === b[i])
  // Palier à faire : celui de la tentative en cours, sinon le premier ouvert pas terminé, sinon le premier à revoir
  const courant = $derived.by(() => {
    if (enCours && etapesEnCours) {
      const k = paliers.findIndex((x) => memes(x.etapes, etapesEnCours!))
      if (k !== -1) return k
    }
    const k = paliers.findIndex((x) => x.ouvert && !x.fini)
    return k !== -1 ? k : paliers.findIndex((x) => x.ouvert && x.aRevoir)
  })
  const objectifsSuivis = $derived(resultatsParObjectif(parcours, resultats))
  // Exercice masqué par l'enseignant : absent de la liste (ni titre, ni « Exercice n »)
  const visibles = (etapes: number[]) => etapes.filter((i) => !parcours.etapes[i].titreMasque)
  const objectifsDe = (etapes: number[]) => [...new Set(etapes.flatMap((i) => parcours.etapes[i].objectifs ?? []))]

  function etat(k: number) {
    const x = paliers[k]
    if (!x.ouvert) return { icone: 'bx-lock-alt', texte: `Au moins ${x.seuil} % à : ${nomPalier(parcours, k - 1).toLowerCase()}` }
    if (enCours && courant === k) return { icone: 'bx-play-circle', texte: 'En cours' }
    if (x.fini && x.aRevoir) return { icone: 'bx-revision', texte: `À revoir · ${x.pourcentage} %` }
    if (x.fini) return { icone: 'bx-check-circle', texte: `Réussi · ${x.pourcentage} %` }
    if (x.faits) return { icone: 'bx-adjust', texte: `${x.faits} exercice${x.faits > 1 ? 's' : ''} sur ${x.etapes.length}` }
    // Palier ouvert d'emblée, après celui à faire : l'élève peut s'y lancer, rien ne l'y oblige
    if (k > 0 && x.acces === 'libre' && courant !== -1 && k > courant) return { icone: 'bx-lock-open-alt', texte: 'Ouvert à tout moment' }
    return { icone: 'bx-circle', texte: 'À faire' }
  }

  function libelleBouton(k: number) {
    const x = paliers[k]
    if (enCours && courant === k) return 'Continuer'
    const ce = parcours.style === 'ceintures' ? 'cette ceinture' : 'ce palier'
    if (x.fini) return `Refaire ${ce}`
    return k === 0 && !dejaFait ? 'Commencer' : `Commencer ${ce}`
  }
</script>

{#snippet lignesExercices(etapes: number[])}
  {#if visibles(etapes).length}
  <ul class="flex flex-col gap-1">
    {#each visibles(etapes) as i (i)}
      {@const r = resultats[i]}
      {@const reussi = r && r.complet && r.points >= r.sur}
      <li class="flex flex-row items-center gap-3 py-1">
        <span
          aria-hidden="true"
          class="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
          {reussi
            ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
            : 'border border-coopmaths-action dark:border-coopmathsdark-action text-coopmaths-action dark:text-coopmathsdark-action'}"
        >
          {#if reussi}<i class="bx bx-check text-base"></i>{:else}{i + 1}{/if}
        </span>
        <span class="min-w-0 flex-1 text-coopmaths-corpus dark:text-coopmathsdark-corpus">{titreEleve(parcours.etapes[i], i)}</span>
        {#if r && r.sur > 0}<span class={pastilleScore((100 * r.points) / r.sur)}>{Math.round((100 * r.points) / r.sur)} %</span>{/if}
      </li>
    {/each}
  </ul>
  {/if}
{/snippet}

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre={parcours.titre} {onretour}>
    {#snippet droite()}
      {#if !explorer}
        <button
          type="button"
          aria-label={epingle ? 'Retirer de l’accueil' : 'Épingler à l’accueil'}
          aria-pressed={epingle}
          class="bouton-icone"
          onclick={onepingler}
        >
          <i aria-hidden="true" class="bx {epingle ? 'bxs-pin' : 'bx-pin'} text-2xl"></i>
        </button>
      {/if}
    {/snippet}
  </EnTete>

  <main class="flex-1 flex flex-col gap-4 p-4 zone-sure-bas">
    <div>
      {#if parcours.objectif}<p class="font-light text-coopmaths-corpus dark:text-coopmathsdark-corpus">{parcours.objectif}</p>{/if}
      <p class="mt-1 {discret}">
        {[parcours.niveau, difficultes[parcours.difficulte - 1], avecPaliers ? `${paliers.length} ${parcours.style === 'ceintures' ? 'ceintures' : 'paliers'}` : '', `${nbQuestions} questions`].filter(Boolean).join(' · ')}
      </p>
    </div>

    {#if avecPaliers}
      <ol class="flex flex-col" aria-label="Paliers">
        {#each paliers as x, k (k)}
          {@const e = etat(k)}
          {@const objectifsPalier = objectifsDe(x.etapes)}
          {#if k > 0}<li aria-hidden="true" class="self-center w-1 h-4 rounded-full bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"></li>{/if}
          <li>
            <section
              class="flex flex-col gap-3 rounded-2xl p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
              {k === courant ? 'border-2 border-coopmaths-action dark:border-coopmathsdark-action' : ''}"
              aria-label="{nomPalier(parcours, k)}{x.titre ? ` : ${x.titre}` : ''}"
            >
              <div class="flex flex-row items-center gap-3">
                {#if parcours.style === 'ceintures'}
                  <!-- Ceinture : sa couleur, seule teinte hors charte de l'app -->
                  <span
                    aria-hidden="true"
                    class="shrink-0 w-10 h-5 rounded {x.ouvert ? '' : 'opacity-40'} border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
                    style="background-color: {couleurCeinture(parcours, k)}"
                  ></span>
                {:else}
                  <span
                    aria-hidden="true"
                    class="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold
                    {x.ouvert
                      ? 'bg-coopmaths-struct dark:bg-coopmathsdark-struct text-coopmaths-canvas dark:text-coopmathsdark-canvas'
                      : 'bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'}"
                    >{k + 1}</span
                  >
                {/if}
                <div class="min-w-0 flex-1">
                  <h2 class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{nomPalier(parcours, k)}{x.titre ? ` · ${x.titre}` : ''}</h2>
                  <p class="flex flex-row items-center gap-1 text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus">
                    <i aria-hidden="true" class="bx {e.icone} text-base text-coopmaths-action dark:text-coopmathsdark-action"></i>{e.texte}
                  </p>
                </div>
              </div>
              {#if x.ouvert}
                {#if objectifsPalier.length}
                  <p class={discret}>{objectifsPalier.length > 1 ? 'Objectifs' : 'Objectif'} : {objectifsPalier.join(' ; ')}</p>
                {/if}
                {@render lignesExercices(x.etapes)}
                {#if x.ressource}
                  <button type="button" class="{x.aRevoir ? boutonInverse : boutonLien} w-full" onclick={() => ouvrirLien(x.ressource!.lien)}>
                    <i aria-hidden="true" class="bx bx-book-open text-xl"></i> Pour revoir : {x.ressource.titre}
                  </button>
                {/if}
                {#if k === courant}
                  <button type="button" class="{boutonAction} w-full" onclick={() => oncommencer(x.etapes)}>{libelleBouton(k)}</button>
                {:else if !enCours}
                  <button type="button" class="{boutonLien} w-full" onclick={() => oncommencer(x.etapes)}>{libelleBouton(k)}</button>
                {/if}
              {:else}
                <p class={discret}>{x.etapes.length} exercice{x.etapes.length > 1 ? 's' : ''}{objectifsPalier.length ? ` · ${objectifsPalier.join(' ; ')}` : ''}</p>
              {/if}
            </section>
          </li>
          {#if x.pause}
            <li aria-hidden="true" class="self-center w-1 h-4 rounded-full bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"></li>
            <li>
              <section
                class="flex flex-col gap-2 rounded-2xl p-4 border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
                aria-label="Pause après : {nomPalier(parcours, k).toLowerCase()}"
              >
                <p class="flex flex-row items-center gap-2 font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">
                  <i aria-hidden="true" class="bx {x.fini ? 'bx-pause-circle' : 'bx-lock-alt'} text-xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
                  Pause
                </p>
                {#if x.fini}
                  <p class="whitespace-pre-line text-coopmaths-corpus dark:text-coopmathsdark-corpus">{x.pause.texte}</p>
                  {#if x.pause.ressource}
                    <button type="button" class="{boutonLien} w-full" onclick={() => ouvrirLien(x.pause!.ressource!.lien)}>
                      <i aria-hidden="true" class="bx bx-link-external text-xl"></i>
                      {x.pause.ressource.titre}
                    </button>
                  {/if}
                {:else}
                  <p class={discret}>Après : {nomPalier(parcours, k).toLowerCase()}</p>
                {/if}
              </section>
            </li>
          {/if}
        {/each}
      </ol>
    {:else if visibles(parcours.etapes.map((_, i) => i)).length}
      <ul class={listeGroupee}>
        {#each visibles(parcours.etapes.map((_, i) => i)) as i (i)}
          {@const etape = parcours.etapes[i]}
          {@const r = resultats[i]}
          <li
            class="w-full flex flex-row items-center justify-between gap-3 px-4 py-3 text-left
            bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
          >
            <div class="min-w-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
              {titreEleve(etape, i)}
            </div>
            {#if r && r.sur > 0}
              <span class={pastilleScore((100 * r.points) / r.sur)}>{Math.round((100 * r.points) / r.sur)} %</span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}

    <div class="flex flex-col gap-3">
      {#if !avecPaliers && session === 'aucune'}
        <button type="button" class="{boutonAction} w-full" onclick={() => oncommencer()}>
          {enCours ? 'Continuer' : dejaFait ? 'Recommencer' : 'Commencer'}
        </button>
      {/if}
      {#if onsessionClasse && session === 'aucune'}
        <button type="button" class="{boutonInverse} w-full" onclick={() => (feuille = 'session')}>
          <i aria-hidden="true" class="bx bx-group mr-1"></i> Session pour la classe
        </button>
      {/if}
      {#if explorer && ondonner}
        <button type="button" class="{boutonInverse} w-full" onclick={ondonner}>
          <i aria-hidden="true" class="bx bx-group mr-1"></i> Donner à des classes
        </button>
      {:else if explorer}
        <button type="button" class="{boutonInverse} w-full" aria-pressed={epingle} onclick={onepingler}>
          <i aria-hidden="true" class="bx {epingle ? 'bx-check' : 'bx-plus'} mr-1"></i>
          {epingle ? 'Ajouté à l’accueil' : 'Ajouter à l’accueil'}
        </button>
      {/if}
      {#if aAmeliorer.length > 0 && !enCours && !avecPaliers}
        <button type="button" class="{boutonInverse} w-full" onclick={onameliorer}>
          Reprendre les exercices à améliorer ({aAmeliorer.length})
        </button>
      {/if}
      {#if session !== 'aucune' && avecPaliers}
        {@const ouverts = paliers.map((x, k) => ({ x, k })).filter(({ x }) => x.ouvert)}
        <p class={discret}>{session === 'creer' ? 'Palier de la session' : 'Palier choisi par la personne qui a créé la session'}</p>
        <div class="flex flex-row flex-wrap gap-2" role="radiogroup" aria-label="Palier de la session">
          {#each ouverts as { k } (k)}
            <button
              type="button"
              role="radio"
              aria-checked={palierSession === k}
              class="rounded-full px-3 py-1.5 text-sm border border-coopmaths-action dark:border-coopmathsdark-action
              {palierSession === k
                ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
                : 'text-coopmaths-action dark:text-coopmathsdark-action'}"
              onclick={() => (palierSession = k)}>{nomPalier(parcours, k)}</button
            >
          {/each}
        </div>
      {/if}
      {#if session === 'creer'}
        <div class="text-center py-2">
          <div class="font-light text-coopmaths-struct dark:text-coopmathsdark-struct" style="font-size: 2.5rem; letter-spacing: 0.15em">{code}</div>
          <p class="text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
            Donne ce code à tes camarades{avecPaliers ? ` et le palier (${nomPalier(parcours, palierSession).toLowerCase()})` : ''} : avec « Rejoindre une session », ils auront les mêmes exercices.
          </p>
        </div>
        {#if invitation}
          <button type="button" class="{boutonLien} w-full justify-center" style="min-height: 44px" onclick={() => (qrSession = true)}>
            <i aria-hidden="true" class="bx bx-qr text-xl"></i> Afficher le QR code de la session
          </button>
        {/if}
        <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={() => onsession(code, avecPaliers ? paliers[palierSession].etapes : undefined)}>Commencer la session</button>
      {:else if session === 'rejoindre'}
        <ChampTexte id="code-session" titre="Code de session" bind:valeur={code} />
        <button
          type="button"
          class="{boutonAction} w-full disabled:opacity-40"
          style="min-height: 44px"
          disabled={normaliserCode(code).length < 3}
          onclick={() => onsession(normaliserCode(code), avecPaliers ? paliers[palierSession].etapes : undefined)}
        >
          Rejoindre la session
        </button>
      {:else}
        <button type="button" class={boutonLien} onclick={() => (feuille = 'actions')}>
          <i aria-hidden="true" class="bx bx-dots-horizontal-rounded text-xl"></i>
          Autres actions
        </button>
      {/if}
    </div>

    {#if objectifsSuivis.length}
      <h2 class={titreSection}>Objectifs</h2>
      <ul class={listeGroupee}>
        {#each objectifsSuivis as o (o.libelle)}
          <li class="w-full flex flex-row items-center justify-between gap-3 px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
            <span class="min-w-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus">{o.libelle}</span>
            {#if o.pourcentage === null}
              <span class="shrink-0 {discret}">Pas encore travaillé</span>
            {:else}
              <span class={pastilleScore(o.pourcentage)}>{o.pourcentage} %</span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}

    {#if passages.length}
      <h2 class={titreSection}>Passages</h2>
      <ul class={listeGroupee}>
        {#each [...passages].reverse() as s (s.debut)}
          {@const b = bilan(s)}
          <li>
            <button
              type="button"
              class="w-full flex flex-row items-center justify-between gap-3 px-4 py-3 text-left
              bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
              active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest transition-colors duration-150"
              onclick={() => onrelire(s)}
            >
              <div class="min-w-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
                {date(s)}{s.type === 'ciblee' ? ' · reprise' : ''}{avecPaliers && paliers.findIndex((x) => memes(x.etapes, s.etapes)) !== -1 ? ` · ${nomPalier(parcours, paliers.findIndex((x) => memes(x.etapes, s.etapes))).toLowerCase()}` : ''}
              </div>
              <div class="flex flex-row items-center gap-2">
                {#if modeQr(s.code) === 'avant' && !s.qrMontre && reponsesDeSeance(s)}
                  <!-- QR code avant la correction, pas encore montré : pas de résultat -->
                  <span class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus">QR code à montrer</span>
                {:else}
                  <span class={pastilleScore(b.pourcentage)}>{b.pourcentage} %</span>
                {/if}
                <i aria-hidden="true" class="bx bx-chevron-right text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
              </div>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </main>
  {#if feuille === 'actions'}
    {@const action = (icone: string, libelle: string, fn: () => void) => ({ icone, libelle, fn })}
    {@const actions = [
      ...(enCours
        ? [action('bx-revision', avecPaliers ? `Refaire ${parcours.style === 'ceintures' ? 'cette ceinture' : 'ce palier'} depuis le début` : 'Tout refaire', onrefaire), action('bx-trash', 'Supprimer la tentative en cours', () => (feuille = 'suppression'))]
        : []),
      // L'enseignant a son bouton sur la page (« Session pour la classe »)
      ...(onsessionClasse ? [] : [action('bx-group', 'Session partagée', creerSession)]),
      action('bx-log-in', 'Rejoindre une session', () => {
        code = ''
        palierSession = Math.max(0, courant)
        session = 'rejoindre'
        feuille = null
      }),
    ]}
    <Feuille onfermer={() => (feuille = null)}>
      <ul class={listeGroupee}>
        {#each actions as a (a.libelle)}
          <li>
            <button type="button" class={elementListe} onclick={a.fn}>
              <span class="flex flex-row items-center gap-3 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
                <i aria-hidden="true" class="bx {a.icone} text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
                {a.libelle}
              </span>
            </button>
          </li>
        {/each}
      </ul>
    </Feuille>
  {:else if feuille === 'suppression'}
    <Feuille onfermer={() => (feuille = null)}>
      <p role="alert" class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Supprimer la tentative en cours ?</p>
      <p class="text-sm">Ses réponses seront effacées. Tes passages terminés sont gardés.</p>
      <div class="flex flex-row gap-3">
        <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={() => (feuille = null)}>Annuler</button>
        <button
          type="button"
          class="{boutonAction} flex-1"
          style="min-height: 44px"
          onclick={() => {
            feuille = null
            onsupprimer()
          }}>Supprimer</button
        >
      </div>
    </Feuille>
  {/if}
  {#if feuille === 'session' && onsessionClasse}
    <ReglageSession
      {parcours}
      palier={Math.max(0, courant)}
      classes={classesEnseignant}
      onfermer={() => (feuille = null)}
      onlancer={(c, etapes, classe) => {
        feuille = null
        onsessionClasse(c, etapes, classe)
      }}
    />
  {/if}
  {#if qrSession && invitation}
    <QrSession {invitation} {code} titre={parcours.titre} onfermer={() => (qrSession = false)} />
  {/if}
</div>
