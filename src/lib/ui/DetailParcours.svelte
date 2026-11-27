<script lang="ts">
  // Détail d'un parcours pour l'élève. Avec des paliers : une carte par palier
  // (état écrit en toutes lettres, exercices, objectifs, ressource pour revoir),
  // les pauses de l'enseignant entre les cartes, un seul bouton plein sur le
  // palier à faire. Sans paliers : la liste des exercices et Commencer.
  import { aAvecArticle, avecArticle, aDesPaliers, auteursTexte, couleurCeinture, momentOuverture, nomPalier, titreEleve, type Fiche, type Parcours } from '$lib/catalogue'
  import { acquisDe, etatsPaliers, resultatsParObjectif } from '$lib/objectifs'
  import { exigerHeure, heure } from '$lib/heure.svelte'
  import { bilan, type ResultatEtape, type Seance } from '$lib/progression'
  import { nouveauCode, normaliserCode } from '$lib/progression'
  import { encoderInvitation } from '$lib/invitation'
  import QrSession from './QrSession.svelte'
  import { lienSur, ouvrirLien } from '$lib/fichiers'
  import { CONTACT, mailSignalement } from '$lib/signalement'
  import ChampTexte from './ChampTexte.svelte'
  import { boutonAction, boutonInverse, boutonLien, elementListe, listeGroupee, pastilleNeutre } from './classes'
  import EnTete from './EnTete.svelte'
  import Ceinture from './Ceinture.svelte'
  import { barrettes, texteBarrettes, type Revisions } from '$lib/revisions'
  import Feuille from './Feuille.svelte'
  import Impression from './Impression.svelte'
  import { impressionPossible } from '$lib/impression'
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
    revisions = null,
    onepingler,
    onrelire,
    onretour,
    oncommencer,
    onrefaire,
    onameliorer,
    onsession,
    onsupprimer,
    onfiche,
    lienSession,
    versionMoteur,
    source,
    oncacher,
  }: {
    parcours: Parcours
    resultats: Record<number, ResultatEtape>
    enCours: boolean
    etapesEnCours?: number[] | null // exercices de la tentative en cours (un palier)
    aAmeliorer: number[]
    epingle: boolean
    explorer?: boolean // parcours du catalogue Explorer : l'épingle l'ajoute à l'accueil
    passages: Seance[]
    revisions?: Revisions | null // révisions espacées : barrettes des ceintures obtenues
    onepingler: () => void
    onrelire: (s: Seance) => void
    onretour: () => void
    oncommencer: (etapes?: number[]) => void // un palier, ou tout le parcours
    onrefaire: () => void
    onameliorer: () => void
    onsession: (code: string, etapes?: number[]) => void // avec des paliers : ceux d'un palier ouvert
    onsupprimer: () => void // tentative en cours
    onfiche?: (f: Fiche) => void // ouvre une fiche de cours
    lienSession?: string // dossier de la classe du parcours : le QR code de la session l'ajoute à qui ne l'a pas
    versionMoteur?: string // pour le QR code de la session (élèves dont l'app est plus ancienne)
    source: string // provenance du parcours, écrite dans un signalement (lien du dossier, Explorer)
    oncacher?: () => void // parcours d'un dossier : le cacher de l'accueil (blocage après un signalement)
  } = $props()

  let session: 'aucune' | 'creer' | 'rejoindre' = $state('aucune')
  // Session partagée d'un parcours à paliers : un palier ouvert, le même pour tous
  let palierSession = $state(0)
  let code = $state('')
  // Actions secondaires dans un panneau du bas : l'écran garde un seul bouton
  let feuille: 'actions' | 'suppression' | 'impression' | 'signaler' | null = $state(null)
  retourSi(() => session !== 'aucune', () => (session = 'aucune'))

  const difficultes = ['Découverte', 'Entraînement', 'Approfondissement']
  const titreSection = 'titre-section'
  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  const date = (s: Seance) =>
    new Date(s.fin ?? s.debut).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  // Version modifiée depuis le dernier passage terminé de l'élève (sans tentative en cours, qui reste sur l'ancienne)
  const misAJour = $derived(!enCours && passages.length > 0 && passages.every((s) => s.contenu.version < parcours.version))
  const dejaFait = $derived(Object.keys(resultats).length > 0)
  const nbQuestions = $derived(parcours.etapes.reduce((a, e) => a + (e.nbQuestions ?? 0), 0))

  const obtenues = $derived(acquisDe(parcours, passages))
  const paliers = $derived(etatsPaliers(parcours, resultats, heure.maintenant, Date.now(), obtenues))
  const barrettesDe = (etapes: number[]) => barrettes(revisions, etapes.map((i) => parcours.etapes[i]))
  // Dates d'ouverture : l'heure des serveurs fait foi
  $effect(() => {
    if (parcours.paliers?.some((x) => x.ouverture)) exigerHeure()
  })
  const avecPaliers = $derived(aDesPaliers(parcours))
  const etapesSession = $derived(avecPaliers ? paliers[palierSession]?.etapes : undefined)
  function creerSession() {
    code = nouveauCode()
    palierSession = Math.max(0, courant)
    session = 'creer'
    feuille = null
  }
  // QR code de la session, à montrer ou projeter : les autres le scannent depuis leur accueil
  let qrSession = $state(false)
  let descriptionOuverte = $state(false)
  // Grand titre dans la page ; la barre ne montre le titre qu'une fois celui-ci passé dessous
  let grandTitre: HTMLElement | undefined = $state()
  let grandTitreVisible = $state(true)
  $effect(() => {
    if (!grandTitre) return
    const o = new IntersectionObserver(([e]) => (grandTitreVisible = e.isIntersecting), { rootMargin: '-56px 0px 0px 0px' })
    o.observe(grandTitre)
    return () => o.disconnect()
  })
  const invitation = $derived(code ? encoderInvitation({ c: code, p: parcours.id, v: parcours.version, e: etapesSession, m: versionMoteur, l: lienSession }) : '')
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
  // Barre du bas : le palier en cours (ou le parcours entier), hors session partagée
  // Avec paliers, chaque palier ouvert a son bouton dans sa ligne (Nathan, 26 novembre
  // 2026 : on ne voyait pas que le bouton du bas commençait la ceinture blanche)
  const barreBas = $derived(session === 'aucune' && !avecPaliers)
  // Exercice masqué par l'enseignant : absent de la liste (ni titre, ni « Exercice n »)
  const visibles = (etapes: number[]) => etapes.filter((i) => !parcours.etapes[i].titreMasque)
  const objectifsDe = (etapes: number[]) => [...new Set(etapes.flatMap((i) => parcours.etapes[i].objectifs ?? []))]

  function etat(k: number) {
    const x = paliers[k]
    // Seuil à atteindre (jamais pour le premier palier, sans précédent)
    const seuilManque = k > 0 && x.acces === 'seuil' && !(paliers[k - 1].fini && paliers[k - 1].pourcentage >= x.seuil)
    const seuil = () => `au moins ${x.seuil} % ${aAvecArticle(nomPalier(parcours, k - 1))}`
    if (x.avantOuverture) {
      const date = `À partir du ${momentOuverture(x.ouverture!)}${x.heureAVerifier ? ' · connexion à internet nécessaire pour vérifier la date' : ''}`
      return { icone: 'bx-calendar', texte: seuilManque ? `${date} · ${seuil()}` : date }
    }
    if (!x.ouvert && k > 0) return { icone: 'bx-lock-alt', texte: `Au moins ${x.seuil} % ${aAvecArticle(nomPalier(parcours, k - 1))}` }
    if (enCours && courant === k) return { icone: 'bx-play-circle', texte: 'En cours' }
    if (x.fini && x.aRevoir) return { icone: 'bx-revision', texte: `À revoir · ${x.pourcentage} %` }
    if (x.fini) {
      const n = parcours.style === 'ceintures' && obtenues[k] ? barrettesDe(x.etapes) : 0
      return { icone: 'bx-check-circle', texte: `Réussi · ${x.pourcentage} %${n ? ` · ${texteBarrettes(n)}` : ''}` }
    }
    if (x.faits) return { icone: 'bx-adjust', texte: `${x.faits} exercice${x.faits > 1 ? 's' : ''} sur ${x.etapes.length}` }
    // Palier ouvert d'emblée, après celui à faire : l'élève peut s'y lancer, rien ne l'y oblige
    if (k > 0 && x.acces === 'libre' && courant !== -1 && k > courant) return { icone: 'bx-circle', texte: 'Ouvert à tout moment' } // le cadenas ouvert se confondait avec le fermé
    return { icone: 'bx-circle', texte: 'À faire' }
  }

  function libelleBouton(k: number) {
    const x = paliers[k]
    if (enCours && courant === k) return 'Continuer'
    const ce = parcours.style === 'ceintures' ? 'cette ceinture' : 'ce palier'
    if (x.fini) return `Refaire ${ce}`
    if (k === courant) return 'Commencer'
    // Plus loin que le palier à faire, celui d'avant pas encore fait : le bouton le dit
    if (k > 0 && !paliers[k - 1].fini) return `Commencer sans avoir fait ${avecArticle(nomPalier(parcours, k - 1))}`
    return `Commencer ${ce}`
  }
</script>

{#snippet lignesExercices(etapes: number[])}
  <!-- Titres masqués (« Exercice 1 ») et rien de fait : la liste n'apprend rien, elle est omise -->
  {#if visibles(etapes).length && visibles(etapes).some((i) => resultats[i] || !/^Exercice \d+$/.test(titreEleve(parcours, parcours.etapes[i], i)))}
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
        <span class="min-w-0 flex-1 text-coopmaths-corpus dark:text-coopmathsdark-corpus">{titreEleve(parcours, parcours.etapes[i], i)}</span>
        {#if r && r.sur > 0}<span class={pastilleNeutre}>{Math.round((100 * r.points) / r.sur)} %</span>{/if}
      </li>
    {/each}
  </ul>
  {/if}
{/snippet}

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre={parcours.titre} {onretour} titreCache={grandTitreVisible}>
    {#snippet droite()}
      <!-- Imprimer à côté de l'épingle, sans passer par « Autres actions » (Nathan, 3 novembre 2026) -->
      {#if impressionPossible()}
        <button type="button" aria-label="Imprimer" class="bouton-icone" onclick={() => (feuille = 'impression')}>
          <i aria-hidden="true" class="bx bx-printer text-2xl"></i>
        </button>
      {/if}
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

  {#if barreBas}
    <!-- L'action principale de la page, toujours sous le pouce. Placée avant le contenu :
         c'est la première atteinte au clavier et par un lecteur d'écran (sinon le lien
         « Commencer cette ceinture » d'une ceinture ouverte plus loin passait devant) -->
    <footer
      class="barre-bas fixed bottom-0 left-0 right-0 z-20 px-4 py-3 zone-sure-bas
      border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
    >
        <button type="button" class="{boutonAction} w-full" style="min-height: 48px; font-size: 1rem" onclick={() => oncommencer()}>
          {enCours ? 'Continuer' : dejaFait ? 'Recommencer' : 'Commencer'}
        </button>
    </footer>
  {/if}
  <main class="flex-1 flex flex-col gap-4 px-4 pt-1 {barreBas ? 'pb-28' : 'pb-4 zone-sure-bas'}">
    <div>
      <!-- Grand titre en entier (la barre le coupait : « Additionner et soustraire des… ») ;
           celui de la barre revient quand il passe dessous -->
      <p bind:this={grandTitre} class="mb-2 text-2xl font-bold leading-tight text-coopmaths-struct dark:text-coopmathsdark-struct" aria-hidden="true">{parcours.titre}</p>
      {#if parcours.objectif}<p class="font-light text-coopmaths-corpus dark:text-coopmathsdark-corpus">{parcours.objectif}</p>{/if}
      <p class="mt-1 {discret}">
        {[parcours.niveau, difficultes[parcours.difficulte - 1], avecPaliers ? `${paliers.length} ${parcours.style === 'ceintures' ? 'ceinture' : 'palier'}${paliers.length > 1 ? 's' : ''}` : '', `${nbQuestions} questions`].filter(Boolean).join(' · ')}
      </p>
      {#if parcours.auteurs?.length}
        <p class="mt-1 flex items-center gap-1 text-sm text-coopmaths-struct dark:text-coopmathsdark-struct">
          <i aria-hidden="true" class="bx bx-user text-lg"></i> Rédigé par {auteursTexte(parcours)}
        </p>
      {/if}
      {#if parcours.descriptionEleves}
        <!-- Longue description repliée sur trois lignes : les ceintures restent en vue -->
        <p class="mt-3 whitespace-pre-line font-light text-coopmaths-corpus dark:text-coopmathsdark-corpus {descriptionOuverte ? '' : 'line-clamp-3'}">{parcours.descriptionEleves}</p>
        {#if !descriptionOuverte && parcours.descriptionEleves.length > 140}
          <button type="button" class="lien-palier" onclick={() => (descriptionOuverte = true)}>Lire la suite</button>
        {/if}
      {/if}
      {#if misAJour}
        <p class="mt-1 flex items-center gap-1 text-sm text-coopmaths-struct dark:text-coopmathsdark-struct">
          <i aria-hidden="true" class="bx bx-refresh text-lg"></i> Parcours mis à jour
        </p>
      {/if}
    </div>

    {#if avecPaliers}
      <!-- Les ceintures (ou paliers) : une échelle de lignes, sans boîtes. La ceinture en
           cours porte la seule surface de l'écran ; son bouton est dans la barre du bas -->
      <h2 class="titre-section">{paliers.length} {parcours.style === 'ceintures' ? (paliers.length > 1 ? 'ceintures' : 'ceinture') : paliers.length > 1 ? 'paliers' : 'palier'}</h2>
      <ol class="liste-lignes flex flex-col" aria-label="Paliers">
        {#each paliers as x, k (k)}
          {@const e = etat(k)}
          {@const objectifsPalier = objectifsDe(x.etapes)}
          {@const actif = k === courant}
          <li class="palier {actif ? 'palier-actif' : ''}">
            <section class="flex flex-row items-start gap-3" aria-label="{nomPalier(parcours, k)}{x.titre ? ` : ${x.titre}` : ''}">
              {#if parcours.style === 'ceintures'}
                <!-- Ceinture : sa couleur, seule teinte hors charte de l'app ; hachurée tant qu'elle n'est pas obtenue -->
                <Ceinture couleur={couleurCeinture(parcours, k)} obtenue={!!obtenues[k]} taille="w-10 h-5" classe="mt-0.5" barrettes={obtenues[k] ? barrettesDe(x.etapes) : 0} />
              {:else}
                <span
                  aria-hidden="true"
                  class="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold
                  {x.fini
                    ? 'bg-coopmaths-struct dark:bg-coopmathsdark-struct text-coopmaths-canvas dark:text-coopmathsdark-canvas'
                    : 'border border-coopmaths-corpus-lightest dark:border-coopmathsdark-corpus-lightest text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'}"
                  >{k + 1}</span
                >
              {/if}
              <div class="min-w-0 flex-1">
                <h3 class="nom-palier {x.ouvert ? '' : 'ferme'}">
                  {nomPalier(parcours, k)}{#if x.titre}<span class="sr-only"> · </span><span class="sous-palier">{x.titre}</span>{/if}
                </h3>
                <p class="etat-palier">
                  <i aria-hidden="true" class="bx {e.icone}"></i>{e.texte}
                </p>
                {#if x.ouvert && actif}
                  {#if objectifsPalier.length}
                    <p class="mt-1 {discret}">{objectifsPalier.length > 1 ? 'Objectifs' : 'Objectif'} : {objectifsPalier.join(' ; ')}</p>
                  {/if}
                  {@render lignesExercices(x.etapes)}
                {/if}
                {#if x.ouvert && (actif || x.aRevoir)}
                  {#if x.fiche && onfiche}
                    <button type="button" class="lien-palier" onclick={() => onfiche(x.fiche!)}>
                      <i aria-hidden="true" class="bx bx-book-reader"></i> Fiche : {x.fiche.titre}
                    </button>
                  {/if}
                  {#if x.ressource && lienSur(x.ressource.lien)}
                    <button type="button" class="lien-palier" onclick={() => ouvrirLien(x.ressource!.lien)}>
                      <i aria-hidden="true" class="bx bx-book-open"></i> Pour revoir : {x.ressource.titre}
                    </button>
                  {/if}
                {/if}
                {#if x.ouvert && actif && session === 'aucune'}
                  <!-- Le palier à faire : son bouton plein, dans sa ligne -->
                  <button type="button" class="{boutonAction} bouton-palier" onclick={() => oncommencer(x.etapes)}>{libelleBouton(k)}</button>
                {:else if x.ouvert && !actif && !enCours}
                  <button type="button" class="lien-palier" onclick={() => oncommencer(x.etapes)}>{libelleBouton(k)}</button>
                {/if}
              </div>
            </section>
          </li>
          {#if x.pause}
            <li class="palier">
              <section class="flex flex-row items-start gap-3" aria-label="Pause après : {nomPalier(parcours, k).toLowerCase()}">
                <i aria-hidden="true" class="bx {x.fini ? 'bx-pause-circle' : 'bx-lock-alt'} w-10 text-center text-xl text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"></i>
                <div class="min-w-0 flex-1">
                  <h3 class="nom-palier">Pause</h3>
                  {#if x.fini}
                    <p class="whitespace-pre-line text-coopmaths-corpus dark:text-coopmathsdark-corpus">{x.pause.texte}</p>
                    {#if x.pause.ressource && lienSur(x.pause.ressource.lien)}
                      <button type="button" class="lien-palier" onclick={() => ouvrirLien(x.pause!.ressource!.lien)}>
                        <i aria-hidden="true" class="bx bx-link-external"></i>
                        {x.pause.ressource.titre}
                      </button>
                    {/if}
                  {:else}
                    <p class="etat-palier">Après : {nomPalier(parcours, k).toLowerCase()}</p>
                  {/if}
                </div>
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
              {titreEleve(parcours, etape, i)}
            </div>
            {#if r && r.sur > 0}
              <span class={pastilleNeutre}>{Math.round((100 * r.points) / r.sur)} %</span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}

    {#if !avecPaliers && parcours.fiche && onfiche}
      <button type="button" class="{boutonLien} w-full" onclick={() => onfiche(parcours.fiche!)}>
        <i aria-hidden="true" class="bx bx-book-reader text-xl"></i> Fiche : {parcours.fiche.titre}
      </button>
    {/if}

    <div class="flex flex-col gap-3">
      {#if explorer}
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
            Montre le QR code de la session, ou donne ce code{avecPaliers ? ` et le palier (${nomPalier(parcours, palierSession).toLowerCase()})` : ''} : avec « Rejoindre une session », tout le monde aura les mêmes exercices.
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
              <span class={pastilleNeutre}>{o.pourcentage} %</span>
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
                <span class={pastilleNeutre}>{b.pourcentage} %</span>
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
      action('bx-group', 'Session partagée', creerSession),
      action('bx-log-in', 'Rejoindre une session', () => {
        code = ''
        palierSession = Math.max(0, courant)
        session = 'rejoindre'
        feuille = null
      }),
      action('bx-flag', 'Signaler un problème', () => (feuille = 'signaler')),
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
  {#if feuille === 'signaler'}
    <!-- Bug, erreur ou contenu inapproprié : un mail à l'équipe avec le contenu du parcours ; le cacher -->
    <Feuille onfermer={() => (feuille = null)}>
      <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Signaler un problème</p>
      <p class="text-sm">
        Un bug, une erreur dans un exercice, un contenu inapproprié&nbsp;? Écris à l’équipe MathALÉA ({CONTACT}) : le mail contient déjà ce parcours, ajoute ce qui ne va pas.
        {#if oncacher}Tu peux aussi le cacher : il ne s’affichera plus sur ton accueil. Pour ne plus rien recevoir de ce dossier, retire-le dans les Réglages.{/if}
      </p>
      <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={() => void ouvrirLien(mailSignalement(parcours, source, versionMoteur))}>
        <i aria-hidden="true" class="bx bx-envelope text-xl"></i> Écrire le signalement
      </button>
      {#if oncacher}
        <button
          type="button"
          class="{boutonInverse} w-full"
          style="min-height: 44px"
          onclick={() => {
            feuille = null
            oncacher()
          }}>Cacher ce parcours</button
        >
      {/if}
    </Feuille>
  {/if}
  {#if feuille === 'impression'}
    <Impression {parcours} onfermer={() => (feuille = null)} />
  {/if}
  {#if qrSession && invitation}
    <QrSession {invitation} {code} titre={parcours.titre} onfermer={() => (qrSession = false)} />
  {/if}
</div>

<style>
  /* Dans la colonne espacée de la page, l'intertitre n'ajoute pas sa propre marge */
  main :global(.titre-section) {
    margin-top: 0.5rem;
    margin-bottom: -0.5rem;
  }
  .palier {
    padding: 14px 0;
  }
  /* Le palier en cours : la seule surface de l'écran, sur toute la largeur */
  .palier-actif {
    margin-inline: -1rem;
    padding-inline: 1rem;
    background: var(--app-fond-2);
  }
  .palier-actif + li::before,
  li + .palier-actif::before {
    display: none;
  }
  .nom-palier {
    font-size: 1.0625rem;
    font-weight: 600;
    line-height: 1.25;
    color: var(--app-struct);
  }
  .nom-palier.ferme {
    color: var(--app-gris);
  }
  .sous-palier {
    display: block;
    margin-top: 2px;
    font-size: 0.9375rem;
    font-weight: 400;
    color: var(--app-gris);
  }
  .etat-palier {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-size: 0.875rem;
    color: var(--app-discret);
  }
  .lien-palier {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    margin-top: 2px;
    text-align: left;
    font-weight: 600;
    font-size: 0.9375rem;
    color: var(--app-action);
  }
  .lien-palier i {
    font-size: 1.125rem;
  }
  .bouton-palier {
    margin-top: 8px;
    min-height: 44px;
    padding-left: 20px;
    padding-right: 20px;
    font-size: 1rem;
  }
</style>
