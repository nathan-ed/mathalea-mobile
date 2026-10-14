<script lang="ts">
  // Création ou modification d'un parcours sur un seul écran : classes,
  // chapitre, parcours, exercices (réglages et aperçu), pages et validation.
  // Tout reste modifiable dans n'importe quel ordre.
  import { onMount, untrack } from 'svelte'
  import type { Etape, Parcours } from '$lib/catalogue'
  import { chapitres, chapitresDeBibliotheque, etapesDepuisLienMathalea, type Bibliotheque, type ChapitreConnu } from '$lib/bibliotheque'
  import { NIVEAUX, type DescriptionExercice, type ExerciceDuReferentiel, type Moteur, type Pays } from '$lib/moteur'
  import ApercuExercice from './ApercuExercice.svelte'
  import ChampTexte from './ChampTexte.svelte'
  import ChoixRadio from './ChoixRadio.svelte'
  import { boutonAction, boutonInverse, listeGroupee } from './classes'
  import EnTete from './EnTete.svelte'
  import NavigateurExercices from './NavigateurExercices.svelte'
  import ReglagesExercice from './ReglagesExercice.svelte'
  import { retourSi } from '$lib/navigation.svelte'

  let {
    bibliotheque,
    classesInitiales,
    classesDossiers = [],
    chapitresDossiers = [],
    parcours: initial,
    moteur,
    pays,
    onvalider,
    onapercu,
    onsupprimer,
    ondupliquer,
    onexporter,
    onretour,
  }: {
    bibliotheque: Bibliotheque
    classesInitiales: string[]
    classesDossiers?: string[] // classes des dossiers partagés suivis
    chapitresDossiers?: ChapitreConnu[]
    parcours: Parcours
    moteur: Moteur
    pays: Pays
    onvalider: (classes: string[], p: Parcours) => void
    onapercu: (p: Parcours) => void
    onsupprimer?: () => void
    ondupliquer?: (classes: string[], p: Parcours) => void // modification : copie en nouveau parcours
    onexporter?: () => Promise<string> // modification : fichier de ce parcours seul (version enregistrée)
    onretour: () => void
  } = $props()

  const titreSection = 'pl-2 pt-4 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  const puce = (actif: boolean) =>
    `rounded-full px-3 py-1.5 text-sm border border-coopmaths-action dark:border-coopmathsdark-action ${
      actif
        ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
        : 'text-coopmaths-action dark:text-coopmathsdark-action'
    }`
  // Le niveau d'un parcours repris (autre pays, autre référentiel) reste proposé
  const niveaux = $derived(initial.niveau && !NIVEAUX[pays].includes(initial.niveau) ? [initial.niveau, ...NIVEAUX[pays]] : NIVEAUX[pays])
  const difficultes = ['Découverte', 'Entraînement', 'Approfondissement']
  const libellesPresentation = {
    liste_exos: 'Tous les exercices sur une page',
    un_exo_par_page: 'Une page par exercice',
    une_question_par_page: 'Une page par question',
  }
  const libellesValidation = {
    question: 'Après chaque question',
    page: 'À la fin de chaque page',
    parcours: 'À la fin du parcours',
  }

  const modification = untrack(() => initial.id !== '')
  let p: Parcours = $state(untrack(() => JSON.parse(JSON.stringify(initial))))
  let classes: string[] = $state(untrack(() => [...classesInitiales]))
  const depart = untrack(() => JSON.stringify([classesInitiales, initial]))
  const modifie = $derived(JSON.stringify([classes, p]) !== depart)

  let nouvelleClasse = $state('')
  let referentiel: ExerciceDuReferentiel[] = $state([])
  let lienMathalea = $state('')
  let messageLien = $state('')
  let confirmerSuppression = $state(false)
  let confirmerSortie = $state(false)
  retourSi(
    () => !navigateur,
    () => (confirmerSortie ? (confirmerSortie = false) : quitter()),
  )
  let messageExport = $state('')
  let navigateur = $state(false)
  let ouvert: number | null = $state(null) // exercice déplié : réglages et aperçu
  const descriptions: Record<string, DescriptionExercice | null> = $state({})

  // Classes connues (les siennes, celles des dossiers partagés), plus celles créées ici
  const toutesClasses = $derived([...new Set([...bibliotheque.classes.map((c) => c.nom), ...classesDossiers, ...classes])])
  const propositions = $derived.by(() => {
    const c = chapitres([...chapitresDeBibliotheque(bibliotheque), ...chapitresDossiers], classes)
    const theme = p.theme.trim()
    if (theme && !c.deClasse.includes(theme) && !c.autres.includes(theme)) return { deClasse: [theme, ...c.deClasse], autres: c.autres }
    return c
  })

  const manques = $derived(
    [
      [classes.length === 0, 'une classe'],
      [!p.theme.trim(), 'un chapitre'],
      [!p.titre.trim(), 'un titre'],
      [!p.niveau, 'un niveau'],
      [p.etapes.length === 0, 'un exercice'],
    ]
      .filter(([manque]) => manque)
      .map(([, libelle]) => libelle as string),
  )

  onMount(async () => {
    referentiel = (await moteur.listerExercices(pays)).filter((e) => e.interactif)
  })

  async function decrire(uuid: string): Promise<DescriptionExercice | null> {
    if (!(uuid in descriptions)) {
      try {
        descriptions[uuid] = (await moteur.decrireExercice?.(uuid)) ?? null
      } catch {
        descriptions[uuid] = null
      }
    }
    return descriptions[uuid]
  }

  function basculerExercice(i: number) {
    ouvert = ouvert === i ? null : i
    if (ouvert !== null) void decrire(p.etapes[i].uuid)
  }

  function ajouterClasse() {
    const nom = nouvelleClasse.trim()
    if (nom && !classes.includes(nom)) classes.push(nom)
    nouvelleClasse = ''
  }

  function basculerClasse(nom: string) {
    classes = classes.includes(nom) ? classes.filter((c) => c !== nom) : [...classes, nom]
  }

  function importerLien() {
    try {
      const etapes = etapesDepuisLienMathalea(lienMathalea.trim())
      if (!etapes.length) {
        messageLien = 'Ce lien ne contient aucun exercice MathALÉA.'
        return
      }
      for (const e of etapes) {
        const r = referentiel.find((x) => x.uuid === e.uuid)
        p.etapes.push({ ...e, id: e.id ?? r?.id, titre: r?.titre ?? e.id ?? e.uuid, nbQuestions: e.nbQuestions ?? 3 } as Etape)
      }
      messageLien = ''
      lienMathalea = ''
    } catch {
      messageLien = 'Ce lien n’est pas une adresse valide.'
    }
  }

  function deplacer(i: number, sens: -1 | 1) {
    const j = i + sens
    if (j < 0 || j >= p.etapes.length) return
    ;[p.etapes[i], p.etapes[j]] = [p.etapes[j], p.etapes[i]]
    if (ouvert === i) ouvert = j
    else if (ouvert === j) ouvert = i
  }

  function retirer(i: number) {
    p.etapes.splice(i, 1)
    ouvert = null
  }

  const instantane = () => $state.snapshot(p) as Parcours

  function quitter() {
    if (modifie && !confirmerSortie) {
      confirmerSortie = true
      scrollTo({ top: 0 })
    } else onretour()
  }

  /** Entrée : nouvelle classe ajoutée, lien importé, sinon champ suivant */
  let zone: HTMLElement | undefined = $state()
  function surEntree(e: KeyboardEvent) {
    if (e.key !== 'Enter' || e.isComposing) return
    const cible = e.target as HTMLElement
    if (!(cible instanceof HTMLInputElement) || ['radio', 'checkbox'].includes(cible.type)) return
    e.preventDefault()
    if (cible.id === 'nouvelle-classe') return ajouterClasse()
    if (cible.id === 'lien-mathalea') return importerLien()
    const champs = [...zone!.querySelectorAll<HTMLElement>('input[type=text], input:not([type]), input[type=url]')].filter((c) => c.offsetParent !== null)
    const i = champs.indexOf(cible)
    if (i !== -1 && i < champs.length - 1) champs[i + 1].focus()
    else cible.blur()
  }
</script>

{#if navigateur}
  <NavigateurExercices
    {moteur}
    {referentiel}
    niveauInitial={p.niveau}
    nbChoisis={p.etapes.length}
    {decrire}
    onajouter={(e) => p.etapes.push(e)}
    onfermer={() => {
      navigateur = false
      scrollTo({ top: 0 })
    }}
  />
{:else}
  <div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
    <EnTete titre={modification ? 'Modifier le parcours' : 'Nouveau parcours'} onretour={quitter} />

    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <main class="flex-1 flex flex-col gap-3 p-4 zone-sure-bas" style="padding-bottom: 9rem" bind:this={zone} onkeydown={surEntree}>
      {#if confirmerSortie}
        <div class="flex flex-col gap-2 rounded-xl p-4 border border-coopmaths-action dark:border-coopmathsdark-action" role="alert">
          <p class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">Les modifications ne sont pas enregistrées.</p>
          <div class="flex flex-row gap-3">
            <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={onretour}>Quitter sans enregistrer</button>
            <button type="button" class="{boutonAction} flex-1" style="min-height: 44px" onclick={() => (confirmerSortie = false)}>Rester</button>
          </div>
        </div>
      {/if}

      <h2 class={titreSection}>Classes</h2>
      <div class="flex flex-row flex-wrap gap-2" role="group" aria-label="Classes">
        {#each toutesClasses as nom (nom)}
          <button type="button" role="checkbox" aria-checked={classes.includes(nom)} class={puce(classes.includes(nom))} onclick={() => basculerClasse(nom)}>
            {nom}
          </button>
        {/each}
      </div>
      <div class="flex flex-row items-end gap-2">
        <ChampTexte id="nouvelle-classe" titre="Nouvelle classe (nom affiché aux élèves)" bind:valeur={nouvelleClasse} />
        <button type="button" class="{boutonInverse} shrink-0 disabled:opacity-40" style="min-height: 40px" disabled={!nouvelleClasse.trim()} onclick={ajouterClasse}>
          Ajouter
        </button>
      </div>

      <h2 class={titreSection}>Chapitre</h2>
      {#if propositions.deClasse.length || propositions.autres.length}
        <div class="flex flex-row flex-wrap gap-2" role="radiogroup" aria-label="Chapitres existants">
          {#each [...propositions.deClasse, ...propositions.autres] as ch (ch)}
            <button type="button" role="radio" aria-checked={p.theme.trim() === ch} class={puce(p.theme.trim() === ch)} onclick={() => (p.theme = ch)}>
              {ch}
            </button>
          {/each}
        </div>
      {/if}
      <ChampTexte id="chapitre" titre="Nom du chapitre" bind:valeur={p.theme} />

      <h2 class={titreSection}>Parcours</h2>
      <ChampTexte id="titre" titre="Titre" bind:valeur={p.titre} />
      <ChampTexte id="objectif" titre="Objectif" bind:valeur={p.objectif} />
      <p class="text-sm font-light text-coopmaths-struct dark:text-coopmathsdark-struct">Niveau</p>
      <div class="flex flex-row flex-wrap gap-2" role="radiogroup" aria-label="Niveau">
        {#each niveaux as n (n)}
          <button type="button" role="radio" aria-checked={p.niveau === n} class={puce(p.niveau === n)} onclick={() => (p.niveau = n)}>{n}</button>
        {/each}
      </div>
      <p class="text-sm font-light text-coopmaths-struct dark:text-coopmathsdark-struct">Type</p>
      <div class="flex flex-row flex-wrap gap-2" role="radiogroup" aria-label="Type">
        {#each difficultes as d, i (d)}
          <button type="button" role="radio" aria-checked={p.difficulte === i + 1} class={puce(p.difficulte === i + 1)} onclick={() => (p.difficulte = (i + 1) as 1 | 2 | 3)}>
            {d}
          </button>
        {/each}
      </div>

      <h2 class={titreSection}>Exercices</h2>
      {#if p.etapes.length}
        <ul class={listeGroupee}>
          {#each p.etapes as e, i (e)}
            <li class="bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
              <div class="flex flex-row items-center gap-2 px-3 py-2">
                <div class="flex flex-col">
                  <button type="button" aria-label="Monter" class="text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-40" disabled={i === 0} onclick={() => deplacer(i, -1)}>
                    <i aria-hidden="true" class="bx bx-chevron-up text-2xl"></i>
                  </button>
                  <button
                    type="button"
                    aria-label="Descendre"
                    class="text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-40"
                    disabled={i === p.etapes.length - 1}
                    onclick={() => deplacer(i, 1)}
                  >
                    <i aria-hidden="true" class="bx bx-chevron-down text-2xl"></i>
                  </button>
                </div>
                <button type="button" class="min-w-0 flex-1 text-left" aria-expanded={ouvert === i} onclick={() => basculerExercice(i)}>
                  <div class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{e.id ?? 'Exercice'}</div>
                  <div class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus truncate">
                    {e.titreMasque ? `Exercice ${i + 1}` : e.titre.replace(/\$([^$]*)\$/g, '$1')}
                  </div>
                  <div class={discret}>{e.nbQuestions ?? '?'} question{(e.nbQuestions ?? 0) > 1 ? 's' : ''} · Réglages et aperçu</div>
                </button>
                <button type="button" aria-label="Retirer l’exercice {e.id}" class="p-1 text-coopmaths-action dark:text-coopmathsdark-action" onclick={() => retirer(i)}>
                  <i aria-hidden="true" class="bx bx-x text-2xl"></i>
                </button>
              </div>
              {#if ouvert === i}
                <div class="flex flex-col gap-4 px-4 pb-4">
                  <div class="flex flex-row items-end gap-2">
                    <div class="flex-1 min-w-0">
                      <label class="font-light text-sm block text-coopmaths-struct dark:text-coopmathsdark-struct" for="titre-ex-{i}">Titre vu par les élèves</label>
                      <input
                        id="titre-ex-{i}"
                        bind:value={e.titre}
                        disabled={e.titreMasque}
                        class="block w-full text-sm border h-10 border-coopmaths-action dark:border-coopmathsdark-action focus:outline-0 focus:ring-0 disabled:opacity-40 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus"
                      />
                    </div>
                    <button
                      type="button"
                      aria-label={e.titreMasque ? 'Afficher le titre aux élèves' : 'Masquer le titre aux élèves'}
                      aria-pressed={e.titreMasque === true}
                      class="p-2 text-coopmaths-action dark:text-coopmathsdark-action"
                      onclick={() => (e.titreMasque = !e.titreMasque)}
                    >
                      <i aria-hidden="true" class="bx {e.titreMasque ? 'bx-hide' : 'bx-show'} text-2xl"></i>
                    </button>
                  </div>
                  <ReglagesExercice bind:etape={p.etapes[i]} description={descriptions[e.uuid] ?? null} />
                  <ApercuExercice {moteur} params={e} />
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
      <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => (navigateur = true)}>
        <i aria-hidden="true" class="bx bx-plus mr-1"></i> Ajouter des exercices
      </button>
      <div class="flex flex-row items-end gap-2">
        <ChampTexte id="lien-mathalea" titre="Ou coller un lien MathALÉA (exercices et réglages)" bind:valeur={lienMathalea} type="url" />
        <button type="button" class="{boutonInverse} shrink-0 disabled:opacity-40" style="min-height: 40px" disabled={!lienMathalea.trim()} onclick={importerLien}>
          Importer
        </button>
      </div>
      {#if messageLien}<p class="text-sm font-bold text-coopmaths-action dark:text-coopmathsdark-action" role="alert">{messageLien}</p>{/if}

      <h2 class={titreSection}>Pages</h2>
      <ChoixRadio
        nom="presentation"
        bind:valeur={p.presentation}
        options={Object.entries(libellesPresentation).map(([valeur, libelle]) => ({ valeur: valeur as Parcours['presentation'], libelle }))}
      />
      <h2 class={titreSection}>Validation et correction</h2>
      <ChoixRadio
        nom="validation"
        bind:valeur={p.correction}
        options={Object.entries(libellesValidation).map(([valeur, libelle]) => ({ valeur: valeur as Parcours['correction'], libelle }))}
      />

      {#if ondupliquer || onexporter}
        <h2 class={titreSection}>Ce parcours</h2>
        {#if modifie}
          <p class={discret}>Enregistrez d’abord les modifications pour le dupliquer ou l’exporter.</p>
        {/if}
        <div class="grid gap-3" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
          {#if ondupliquer}
            <button type="button" class="{boutonInverse} w-full disabled:opacity-40" style="min-height: 44px" disabled={modifie} onclick={() => ondupliquer([...classes], instantane())}>
              Dupliquer
            </button>
          {/if}
          {#if onexporter}
            <button type="button" class="{boutonInverse} w-full disabled:opacity-40" style="min-height: 44px" disabled={modifie} onclick={async () => (messageExport = await onexporter())}>
              Exporter
            </button>
          {/if}
        </div>
        {#if messageExport}<p class={discret} role="status">{messageExport}</p>{/if}
      {/if}

      {#if onsupprimer}
        <div class="pt-6">
          {#if confirmerSuppression}
            <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={onsupprimer}>Confirmer la suppression</button>
          {:else}
            <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => (confirmerSuppression = true)}>Supprimer le parcours</button>
          {/if}
        </div>
      {/if}
    </main>

    <footer
      class="fixed left-0 right-0 bottom-0 z-20 flex flex-col gap-1 px-4 py-3 zone-sure-bas
      border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
    >
      {#if manques.length}
        <p class="{discret} text-center">À compléter : {manques.join(', ')}</p>
      {/if}
      <div class="flex flex-row gap-3">
        <button type="button" class="{boutonInverse} flex-1 disabled:opacity-40" style="min-height: 44px" disabled={!p.etapes.length} onclick={() => onapercu(instantane())}>
          Aperçu élève
        </button>
        <button type="button" class="{boutonAction} flex-1 disabled:opacity-40" style="min-height: 44px" disabled={manques.length > 0} onclick={() => onvalider([...classes], instantane())}>
          {modification ? 'Enregistrer et quitter' : 'Valider le parcours'}
        </button>
      </div>
    </footer>
  </div>
{/if}
