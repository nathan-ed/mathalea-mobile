<script lang="ts">
  // Création ou modification d'un parcours, étape par étape :
  // classe, chapitre, parcours, exercices, pages et validation, récapitulatif.
  import { onMount, untrack } from 'svelte'
  import type { Etape, Parcours } from '$lib/catalogue'
  import { chapitres, etapesDepuisLienMathalea, type Bibliotheque } from '$lib/bibliotheque'
  import { NIVEAUX, type ExerciceDuReferentiel, type Moteur, type Pays } from '$lib/moteur'
  import ChampTexte from './ChampTexte.svelte'
  import ChoixRadio from './ChoixRadio.svelte'
  import { boutonAction, boutonInverse, listeGroupee } from './classes'
  import EnTete from './EnTete.svelte'
  import FilAriane from './FilAriane.svelte'
  import Tuile from './Tuile.svelte'

  let {
    bibliotheque,
    classesInitiales,
    parcours: initial,
    moteur,
    pays,
    onvalider,
    onapercu,
    onsupprimer,
    onretour,
  }: {
    bibliotheque: Bibliotheque
    classesInitiales: string[]
    parcours: Parcours
    moteur: Moteur
    pays: Pays
    onvalider: (classes: string[], p: Parcours) => void
    onapercu: (p: Parcours) => void
    onsupprimer?: () => void
    onretour: () => void
  } = $props()

  const ETAPES = ['Classes', 'Chapitre', 'Parcours', 'Exercices', 'Pages et validation', 'Récapitulatif']
  const titreSection = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  const niveaux = $derived(NIVEAUX[pays])
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
  let etape = $state(modification ? 5 : 0)
  let p: Parcours = $state(untrack(() => JSON.parse(JSON.stringify(initial))))
  let classes: string[] = $state(untrack(() => [...classesInitiales]))
  let nouvelleClasse = $state('')
  // Classes connues, plus celles créées pendant cette saisie
  const toutesClasses = $derived([...new Set([...bibliotheque.classes.map((c) => c.nom), ...classes])])
  let nouveauChapitre = $state('')
  let referentiel: ExerciceDuReferentiel[] = $state([])
  let recherche = $state('')
  let lienMathalea = $state('')
  let messageLien = $state('')
  let confirmerSuppression = $state(false)

  const chapitresClasse = $derived(chapitres(bibliotheque, classes))
  const valide = $derived([
    classes.length > 0,
    p.theme.trim() !== '',
    p.titre.trim() !== '' && p.niveau !== '',
    p.etapes.length > 0,
    true,
    true,
  ])

  onMount(async () => {
    referentiel = (await moteur.listerExercices(pays)).filter((e) => e.interactif)
  })

  const normaliser = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const resultats = $derived.by(() => {
    const mots = normaliser(recherche).split(/\s+/).filter(Boolean)
    if (!mots.length) return []
    const requete = normaliser(recherche.trim())
    // Identifiant exact d'abord, puis identifiant qui commence par la recherche, puis le reste
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

  function ajouter(e: ExerciceDuReferentiel) {
    p.etapes.push({ uuid: e.uuid, id: e.id, titre: sansDollars(e.titre), nbQuestions: 3 })
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
        p.etapes.push({ ...e, id: e.id ?? r?.id, titre: sansDollars(r?.titre ?? e.id ?? e.uuid), nbQuestions: e.nbQuestions ?? 3 } as Etape)
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
  }

  function ajouterClasseSaisie() {
    const nom = nouvelleClasse.trim()
    if (nom && !classes.includes(nom)) classes.push(nom)
    nouvelleClasse = ''
  }

  function basculerClasse(nom: string) {
    classes = classes.includes(nom) ? classes.filter((c) => c !== nom) : [...classes, nom]
  }

  function suivant() {
    if (etape === 0) ajouterClasseSaisie()
    if (etape === 1 && nouveauChapitre.trim()) p.theme = nouveauChapitre.trim()
    etape = modification ? 5 : etape + 1
    scrollTo({ top: 0 })
  }

  function aller(i: number) {
    etape = i
    scrollTo({ top: 0 })
  }

  const instantane = () => $state.snapshot(p) as Parcours

  let zone: HTMLElement
  const peutContinuer = () =>
    etape === 5 ? valide.every(Boolean) : valide[etape] || (etape === 0 && !!nouvelleClasse.trim()) || (etape === 1 && !!nouveauChapitre.trim())

  /** Entrée : champ suivant, puis étape suivante (ou validation) sur le dernier champ */
  function surEntree(e: KeyboardEvent) {
    if (e.key !== 'Enter' || e.isComposing) return
    const cible = e.target as HTMLElement
    if (!(cible instanceof HTMLInputElement || cible instanceof HTMLSelectElement)) return
    if (cible instanceof HTMLInputElement && (cible.type === 'radio' || cible.type === 'checkbox')) return
    e.preventDefault()
    if (cible.id === 'nouvelle-classe' && nouvelleClasse.trim()) return ajouterClasseSaisie()
    if (cible.id === 'lien-mathalea' && lienMathalea.trim()) return importerLien()
    if (cible instanceof HTMLInputElement && cible.type === 'search') {
      if (resultats[0]) {
        ajouter(resultats[0])
        recherche = ''
      }
      return
    }
    const champs = [...zone.querySelectorAll<HTMLElement>('input:not([type=radio]):not([type=checkbox]):not([type=file]), select')].filter(
      (c) => c.offsetParent !== null,
    )
    const i = champs.indexOf(cible)
    if (i !== -1 && i < champs.length - 1) champs[i + 1].focus()
    else if (peutContinuer()) etape === 5 ? onvalider([...classes], instantane()) : suivant()
  }
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete />
  <FilAriane titre={modification ? `Modifier · ${p.titre}` : 'Nouveau parcours'} onretour={etape === 0 || etape === 5 ? onretour : () => aller(etape - 1)} />

  <!-- Progression : une barre par étape, comme les onglets de la vue élève -->
  <div class="flex flex-row gap-1 px-4 pt-3" aria-hidden="true">
    {#each ETAPES as _, i (i)}
      <div class="flex-1 h-1 rounded-full {i <= etape ? 'bg-coopmaths-struct dark:bg-coopmathsdark-struct' : 'bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest'}"></div>
    {/each}
  </div>
  <p class="px-4 pt-2 {discret}">Étape {etape + 1} sur {ETAPES.length} · {ETAPES[etape]}</p>

  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <main class="flex-1 flex flex-col gap-3 p-4 zone-sure-bas" style="padding-bottom: 6rem" bind:this={zone} onkeydown={surEntree}>
    {#if etape === 0}
      {#each toutesClasses as nom (nom)}
        <button
          type="button"
          role="checkbox"
          aria-checked={classes.includes(nom)}
          class="w-full flex flex-row items-center gap-3 text-left rounded-xl px-4 py-3
          border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
          bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
          active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest transition-colors duration-150"
          onclick={() => basculerClasse(nom)}
        >
          <i aria-hidden="true"
 class="bx {classes.includes(nom) ? 'bxs-checkbox-checked' : 'bx-checkbox'} text-3xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
          <span class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{nom}</span>
        </button>
      {/each}
      <h2 class={titreSection}>Nouvelle classe</h2>
      <ChampTexte id="nouvelle-classe" titre="Nom affiché aux élèves" bind:valeur={nouvelleClasse} />
      <button type="button" class="{boutonInverse} w-full disabled:opacity-40" style="min-height: 44px" disabled={!nouvelleClasse.trim()} onclick={ajouterClasseSaisie}>
        Ajouter la classe
      </button>
    {:else if etape === 1}
      {#each chapitresClasse as ch (ch)}
        <Tuile
          icon={p.theme === ch && !nouveauChapitre ? 'bx-check-circle' : 'bx-book-content'}
          title={ch}
          onclick={() => {
            p.theme = ch
            nouveauChapitre = ''
            suivant()
          }}
        />
      {/each}
      <h2 class={titreSection}>{chapitresClasse.length ? 'Nouveau chapitre' : 'Chapitre'}</h2>
      <ChampTexte id="nouveau-chapitre" titre="Nom du chapitre" bind:valeur={nouveauChapitre} />
    {:else if etape === 2}
      <ChampTexte id="titre" titre="Titre" bind:valeur={p.titre} />
      <ChampTexte id="objectif" titre="Objectif" bind:valeur={p.objectif} />
      <h2 class={titreSection}>Niveau</h2>
      <div class="grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));" role="radiogroup" aria-label="Niveau">
        {#each niveaux as n (n)}
          <button
            type="button"
            role="radio"
            aria-checked={p.niveau === n}
            class="{p.niveau === n ? boutonAction : boutonInverse} w-full"
            style="min-height: 44px"
            onclick={() => (p.niveau = n)}
          >
            {n}
          </button>
        {/each}
      </div>
      <h2 class={titreSection}>Type</h2>
      <ChoixRadio nom="difficulte" bind:valeur={p.difficulte} options={difficultes.map((d, i) => ({ libelle: d, valeur: (i + 1) as 1 | 2 | 3 }))} />
    {:else if etape === 3}
      {#if p.etapes.length}
        <ul class={listeGroupee}>
          {#each p.etapes as e, i (i)}
            <li class="flex flex-row items-center gap-2 px-3 py-2 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
              <div class="flex flex-col">
                <button type="button" aria-label="Monter" class="text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-40" disabled={i === 0} onclick={() => deplacer(i, -1)}>
                  <i aria-hidden="true"
 class="bx bx-chevron-up text-2xl"></i>
                </button>
                <button type="button" aria-label="Descendre" class="text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-40" disabled={i === p.etapes.length - 1} onclick={() => deplacer(i, 1)}>
                  <i aria-hidden="true"
 class="bx bx-chevron-down text-2xl"></i>
                </button>
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">
                  <span class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{e.id}</span>&nbsp;{e.titre}
                </div>
                <label class="{discret} inline-flex items-center gap-2">
                  Questions
                  <input
                    type="number"
                    min="1"
                    max="20"
                    bind:value={e.nbQuestions}
                    class="w-16 text-sm border h-8 border-coopmaths-action dark:border-coopmathsdark-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
                  />
                </label>
              </div>
              <button type="button" aria-label="Retirer l’exercice {e.id}" class="p-1 text-coopmaths-action dark:text-coopmathsdark-action" onclick={() => p.etapes.splice(i, 1)}>
                <i aria-hidden="true"
 class="bx bx-x text-2xl"></i>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
      <label
        class="w-full flex flex-row items-center gap-2 rounded-lg px-3 py-2
        border border-coopmaths-action dark:border-coopmathsdark-action
        bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
      >
        <i aria-hidden="true"
 class="bx bx-search"></i>
        <input
          type="search"
          aria-label="Rechercher un exercice MathALÉA (identifiant, titre, niveau)"
          bind:value={recherche}
          class="w-full bg-transparent border-0 p-0 focus:outline-0 focus:ring-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        />
      </label>
      {#if resultats.length}
        <ul class={listeGroupee}>
          {#each resultats as e (e.uuid)}
            <li>
              <button
                type="button"
                class="w-full flex flex-row items-center justify-between gap-3 px-4 py-3 text-left
                bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
                active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest transition-colors duration-150"
                onclick={() => ajouter(e)}
              >
                <div class="min-w-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
                  <span class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{e.id}</span>&nbsp;{sansDollars(e.titre)}
                  <div class={discret}>{e.niveau} · {e.theme}</div>
                </div>
                <i aria-hidden="true"
 class="bx bx-plus text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
      <ChampTexte id="lien-mathalea" titre="Ou coller un lien MathALÉA (exercices et paramètres)" bind:valeur={lienMathalea} type="url" />
      {#if messageLien}<p class="text-sm font-bold text-coopmaths-action dark:text-coopmathsdark-action" role="alert">{messageLien}</p>{/if}
      <button type="button" class="{boutonInverse} w-full disabled:opacity-40" style="min-height: 44px" disabled={!lienMathalea.trim()} onclick={importerLien}>
        Importer le lien
      </button>
    {:else if etape === 4}
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
    {:else}
      <ul class={listeGroupee}>
        {#each [['Classes', classes.join(', '), 0], ['Chapitre', p.theme, 1], ['Parcours', `${p.titre} · ${p.niveau} · ${difficultes[p.difficulte - 1]}`, 2], ['Exercices', p.etapes.map((e) => e.id).join(', '), 3], ['Pages et validation', `${libellesPresentation[p.presentation]} · ${libellesValidation[p.correction].toLowerCase()}`, 4]] as [titre, valeur, i] (titre)}
          <li>
            <button
              type="button"
              class="w-full flex flex-row items-center justify-between gap-3 px-4 py-3 text-left
              bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
              active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest transition-colors duration-150"
              onclick={() => aller(i as number)}
            >
              <div class="min-w-0">
                <div class={discret}>{titre}</div>
                <div class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">{valeur}</div>
              </div>
              <span class="text-sm text-coopmaths-action dark:text-coopmathsdark-action">Modifier</span>
            </button>
          </li>
        {/each}
      </ul>
      <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => onapercu(instantane())}>Aperçu élève</button>
      {#if onsupprimer}
        {#if confirmerSuppression}
          <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={onsupprimer}>Confirmer la suppression</button>
        {:else}
          <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => (confirmerSuppression = true)}>Supprimer le parcours</button>
        {/if}
      {/if}
    {/if}
  </main>

  <footer
    class="fixed left-0 right-0 bottom-0 z-20 flex flex-row gap-3 px-4 py-3 zone-sure-bas
    border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  >
    {#if etape < 5}
      <button
        type="button"
        class="{boutonAction} flex-1 disabled:opacity-40"
        style="min-height: 44px"
        disabled={!peutContinuer()}
        onclick={suivant}
      >
        {modification ? 'Revenir au récapitulatif' : 'Suivant'}
      </button>
    {:else}
      <button type="button" class="{boutonAction} flex-1 disabled:opacity-40" style="min-height: 44px" disabled={!valide.every(Boolean)} onclick={() => onvalider([...classes], instantane())}>
        Valider le parcours
      </button>
    {/if}
  </footer>
</div>
