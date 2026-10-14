<script lang="ts">
  import { titreEleve, type Parcours } from '$lib/catalogue'
  import { bilan, type ResultatEtape, type Seance } from '$lib/progression'
  import { nouveauCode, normaliserCode } from '$lib/progression'
  import ChampTexte from './ChampTexte.svelte'
  import { boutonAction, boutonInverse, boutonLien, elementListe, listeGroupee, pastille } from './classes'
  import EnTete from './EnTete.svelte'
  import Feuille from './Feuille.svelte'
  import { retourSi } from '$lib/navigation.svelte'

  let {
    parcours,
    resultats,
    enCours,
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
  }: {
    parcours: Parcours
    resultats: Record<number, ResultatEtape>
    enCours: boolean
    aAmeliorer: number[]
    epingle: boolean
    explorer?: boolean // parcours du catalogue Explorer : l'épingle l'ajoute à l'accueil
    passages: Seance[]
    onepingler: () => void
    onrelire: (s: Seance) => void
    onretour: () => void
    oncommencer: () => void
    onrefaire: () => void
    onameliorer: () => void
    onsession: (code: string) => void
    onsupprimer: () => void // tentative en cours
  } = $props()

  let session: 'aucune' | 'creer' | 'rejoindre' = $state('aucune')
  let code = $state('')
  // Actions secondaires dans un panneau du bas : l'écran garde un seul bouton
  let feuille: 'actions' | 'suppression' | null = $state(null)
  retourSi(() => session !== 'aucune', () => (session = 'aucune'))

  const difficultes = ['Découverte', 'Entraînement', 'Approfondissement']
  const titreSection = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const date = (s: Seance) =>
    new Date(s.fin ?? s.debut).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  const dejaFait = $derived(Object.keys(resultats).length > 0)
  const nbQuestions = $derived(parcours.etapes.reduce((a, e) => a + (e.nbQuestions ?? 0), 0))
</script>

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
      <p class="font-light text-coopmaths-corpus dark:text-coopmathsdark-corpus">{parcours.objectif}</p>
      <p class="mt-1 text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
        {parcours.niveau} · {difficultes[parcours.difficulte - 1]} · {nbQuestions} questions
      </p>
    </div>

    <ul class={listeGroupee}>
      {#each parcours.etapes as etape, i (i)}
        {@const r = resultats[i]}
        <li
          class="w-full flex flex-row items-center justify-between gap-3 px-4 py-3 text-left
          bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
        >
          <div class="min-w-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
            {titreEleve(etape, i)}
          </div>
          {#if r}
            <span class={pastille}>{Math.round((100 * r.points) / r.sur)} %</span>
          {/if}
        </li>
      {/each}
    </ul>

    <div class="flex flex-col gap-3">
      <button type="button" class="{boutonAction} w-full" onclick={oncommencer}>
        {enCours ? 'Continuer' : dejaFait ? 'Recommencer' : 'Commencer'}
      </button>
      {#if explorer}
        <button type="button" class="{boutonInverse} w-full" aria-pressed={epingle} onclick={onepingler}>
          <i aria-hidden="true" class="bx {epingle ? 'bx-check' : 'bx-plus'} mr-1"></i>
          {epingle ? 'Ajouté à l’accueil' : 'Ajouter à l’accueil'}
        </button>
      {/if}
      {#if aAmeliorer.length > 0 && !enCours}
        <button type="button" class="{boutonInverse} w-full" onclick={onameliorer}>
          Reprendre les exercices à améliorer ({aAmeliorer.length})
        </button>
      {/if}
      {#if session === 'creer'}
        <div class="text-center py-2">
          <div class="font-light text-coopmaths-struct dark:text-coopmathsdark-struct" style="font-size: 2.5rem; letter-spacing: 0.15em">{code}</div>
          <p class="text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
            Donne ce code à tes camarades : avec « Rejoindre une session », ils auront les mêmes exercices.
          </p>
        </div>
        <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={() => onsession(code)}>Commencer la session</button>
      {:else if session === 'rejoindre'}
        <ChampTexte id="code-session" titre="Code de session" bind:valeur={code} />
        <button
          type="button"
          class="{boutonAction} w-full disabled:opacity-40"
          style="min-height: 44px"
          disabled={normaliserCode(code).length < 3}
          onclick={() => onsession(normaliserCode(code))}
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
                {date(s)}{s.type === 'ciblee' ? ' · reprise' : ''}
              </div>
              <div class="flex flex-row items-center gap-2">
                <span class={pastille}>{b.pourcentage} %</span>
                <i aria-hidden="true"
 class="bx bx-chevron-right text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
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
        ? [action('bx-revision', 'Tout refaire', onrefaire), action('bx-trash', 'Supprimer la tentative en cours', () => (feuille = 'suppression'))]
        : []),
      action('bx-group', 'Session partagée', () => {
        code = nouveauCode()
        session = 'creer'
        feuille = null
      }),
      action('bx-log-in', 'Rejoindre une session', () => {
        code = ''
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
</div>
