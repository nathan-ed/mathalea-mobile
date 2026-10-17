<script lang="ts">
  import { garderSaisie } from './barreDuBas'
  // Création ou modification d'un parcours sur un seul écran : niveau,
  // chapitre, parcours, exercices (réglages, aperçu, objectifs), paliers,
  // pages et validation. Tout reste modifiable dans n'importe quel ordre.
  // Les classes se choisissent ensuite : on crée pour un niveau, on donne à une classe.
  import { onMount, untrack } from 'svelte'
  import { CEINTURES, ICONES, couleurCeinture, iconeProposee, melange, nomPalier, type Etape, type Palier, type Parcours, type Ressource, type StylePaliers } from '$lib/catalogue'
  import { chapitres, chapitresDeBibliotheque, etapesDepuisLienMathalea, type Bibliotheque, type ChapitreConnu } from '$lib/bibliotheque'
  import { NIVEAUX, type DescriptionExercice, type ExerciceDuReferentiel, type Moteur, type Pays } from '$lib/moteur'
  import { cleExercice, type Objectif } from '$lib/objectifs'
  import ApercuExercice from './ApercuExercice.svelte'
  import ChampTexte from './ChampTexte.svelte'
  import ChoixRadio from './ChoixRadio.svelte'
  import { boutonAction, boutonInverse, boutonLien, elementListe, listeGroupee } from './classes'
  import EnTete from './EnTete.svelte'
  import NavigateurExercices from './NavigateurExercices.svelte'
  import ReglagesExercice from './ReglagesExercice.svelte'
  import { retourSi } from '$lib/navigation.svelte'
  import Feuille from './Feuille.svelte'

  let {
    bibliotheque,
    chapitresDossiers = [],
    objectifs = [],
    etiquettes = {},
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
    chapitresDossiers?: ChapitreConnu[]
    objectifs?: Objectif[] // liste de l'enseignant
    etiquettes?: Record<string, string[]> // objectifs déjà posés sur un exercice (cleExercice)
    parcours: Parcours
    moteur: Moteur
    pays: Pays
    onvalider: (p: Parcours, objectifs: Objectif[]) => void // objectifs posés qui ne sont pas encore dans la liste
    onapercu: (p: Parcours) => void
    onsupprimer?: () => void
    ondupliquer?: (p: Parcours) => void // modification : copie en nouveau parcours
    onexporter?: () => Promise<string> // modification : fichier de ce parcours seul (version enregistrée)
    onretour: () => void
  } = $props()

  const titreSection = 'pl-2 pt-4 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  const sousTitre = 'text-sm font-light text-coopmaths-struct dark:text-coopmathsdark-struct'
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
  const SEUILS = [50, 60, 70, 80, 90, 100]

  const modification = untrack(() => initial.id !== '')
  // L'icône suit le chapitre tant que l'enseignant n'en a pas choisi une autre
  let iconeAuto = $state(untrack(() => initial.icone === 'bx-book-content' || initial.icone === iconeProposee(initial.theme)))
  $effect(() => {
    const proposee = iconeProposee(p.theme)
    if (iconeAuto && untrack(() => p.icone) !== proposee) p.icone = proposee
  })
  let p: Parcours = $state(untrack(() => JSON.parse(JSON.stringify(initial))))
  const depart = untrack(() => JSON.stringify(initial))
  const modifie = $derived(JSON.stringify(p) !== depart)

  let referentiel: ExerciceDuReferentiel[] = $state([])
  let lienMathalea = $state('')
  // Import par lien du site : replié tant qu'on ne le demande pas
  let avecLien = $state(false)
  let messageLien = $state('')
  let confirmerSuppression = $state(false)
  let actions = $state(false)
  const ligneAction = `${elementListe} disabled:opacity-40`
  let confirmerSortie = $state(false)
  retourSi(
    () => !navigateur,
    () => (confirmerSortie ? (confirmerSortie = false) : quitter()),
  )
  let messageExport = $state('')
  let navigateur = $state(false)
  let cible = 0 // palier qui reçoit les exercices ajoutés
  let presentationOuverte = $state(false) // icône, pages et correction : repliés par défaut
  let ouvert: number | null = $state(null) // exercice déplié : réglages, objectifs et aperçu
  const descriptions: Record<string, DescriptionExercice | null> = $state({})
  // Ressource ou pause d'un palier en cours de saisie (panneau du bas)
  let ressource: { k: number; titre: string; lien: string } | null = $state(null)
  let pause: { k: number; texte: string; titre: string; lien: string } | null = $state(null)
  // Objectifs créés dans cet écran, ajoutés à la liste à l'enregistrement
  let nouvelObjectif = $state('')

  const propositions = $derived.by(() => {
    const c = chapitres([...chapitresDeBibliotheque(bibliotheque), ...chapitresDossiers], p.niveau)
    const theme = p.theme.trim()
    if (theme && !c.duNiveau.includes(theme) && !c.autres.includes(theme)) return { duNiveau: [theme, ...c.duNiveau], autres: c.autres }
    return c
  })

  // ---------- Paliers ----------
  const avecPaliers = $derived((p.paliers?.length ?? 0) > 1)
  // Avec des paliers, chaque palier se fait en une séance : « fin du parcours » devient fin du palier
  const libellesValidation = $derived({
    question: 'Après chaque question',
    page: 'À la fin de chaque page',
    parcours: !avecPaliers ? 'À la fin du parcours' : p.style === 'ceintures' ? 'À la fin de la ceinture' : 'À la fin du palier',
  })
  /** Rangs des exercices de chaque palier (un seul groupe sans paliers) */
  const groupes = $derived.by(() => {
    if (!avecPaliers) return [p.etapes.map((_, i) => i)]
    let debut = 0
    return p.paliers!.map((x) => {
      const r = Array.from({ length: x.nb }, (_, j) => debut + j)
      debut += x.nb
      return r
    })
  })
  const debutDe = (k: number) => (p.paliers ?? []).slice(0, k).reduce((a, x) => a + x.nb, 0)
  const palierDe = (i: number) => groupes.findIndex((g) => g.includes(i))

  /**
   * Premier découpage proposé : un palier par objectif (exercices consécutifs
   * qui visent le même), sinon deux paliers de taille égale. Tout reste modifiable.
   */
  function decouper() {
    const groupesObjectif: { titre: string; nb: number }[] = []
    for (const e of p.etapes) {
      const o = e.objectifs?.[0] ?? ''
      const dernier = groupesObjectif.at(-1)
      if (dernier && dernier.titre === o) dernier.nb++
      else groupesObjectif.push({ titre: o, nb: 1 })
    }
    const moitie = Math.ceil(p.etapes.length / 2)
    const decoupe =
      groupesObjectif.length > 1 && groupesObjectif.length <= 6
        ? groupesObjectif
        : [
            { titre: '', nb: moitie },
            { titre: '', nb: p.etapes.length - moitie },
          ]
    p.paliers = decoupe.map((g, k) => (k === 0 ? { titre: g.titre, nb: g.nb } : { titre: g.titre, nb: g.nb, acces: 'seuil' as const, seuil: 80 }))
  }

  // Au bord d'un palier, les flèches font passer l'exercice dans le palier voisin
  const peutMonter = (i: number) => i > 0 || (avecPaliers && palierDe(i) > 0)
  const peutDescendre = (i: number) => i < p.etapes.length - 1 || (avecPaliers && palierDe(i) < p.paliers!.length - 1)

  /** Organisation : liste simple, paliers numérotés ou ceintures (la première au choix) */
  function organiser(style: StylePaliers | 'liste') {
    if (style === 'liste') {
      p.paliers = undefined
      p.style = undefined
      p.premiereCeinture = undefined
      return
    }
    if (!avecPaliers) {
      if (p.etapes.length > 1) decouper()
      else p.paliers = [{ titre: '', nb: p.etapes.length }, { titre: '', nb: 0, acces: 'seuil', seuil: 80 }]
    }
    p.style = style
  }
  const organisation = $derived(avecPaliers ? (p.style ?? 'paliers') : 'liste')

  function ajouterPalier() {
    p.paliers!.push({ titre: '', nb: 0, acces: 'seuil', seuil: 80 })
  }

  function supprimerPalier(k: number) {
    const paliers = p.paliers!
    // Ses exercices rejoignent le palier précédent (ou le suivant pour le premier)
    const voisin = k === 0 ? 1 : k - 1
    paliers[voisin].nb += paliers[k].nb
    if (k === 0) paliers[1] = { ...paliers[1], acces: undefined, seuil: undefined }
    paliers.splice(k, 1)
    if (paliers.length < 2) p.paliers = undefined
  }

  function choisirAcces(x: Palier, acces: Palier['acces']) {
    x.acces = acces
    if (acces === 'seuil') x.seuil ??= 80
  }

  const lienValide = (lien: string) => /^https?:\/\/\S+$/.test(lien.trim())
  const ressourceSaisie = (titre: string, lien: string): Ressource | undefined =>
    titre.trim() && lienValide(lien) ? { titre: titre.trim(), lien: lien.trim() } : undefined

  // ---------- Exercices ----------
  const manques = $derived(
    [
      [!p.niveau, 'un niveau'],
      [!p.theme.trim(), 'un chapitre'],
      [!p.titre.trim(), 'un titre'],
      [p.etapes.length === 0, 'un exercice'],
      [p.etapes.length > 0 && avecPaliers && p.paliers!.some((x) => x.nb === 0), 'un exercice dans chaque palier'],
    ]
      .filter(([manque]) => manque)
      .map(([, libelle]) => libelle as string),
  )

  onMount(async () => {
    // Tous les exercices du menu du site, interactifs ou non ; le site range
    // « Égalité filles-garçons » à part (ressources partenaires)
    referentiel = (await moteur.listerExercices(pays)).filter((e) => e.niveau !== 'Égalité filles-garçons')
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

  // Objectifs du programme connus par le référentiel : libellé vers code
  const codesOfficiels = $derived(new Map(referentiel.flatMap((r) => (r.objectif ? [[r.objectif.libelle, r.objectif.code] as const] : []))))

  /**
   * Ajoute un exercice à la fin d'un palier. Il reprend les objectifs déjà
   * posés sur lui (mêmes réglages), sinon l'objectif du programme sous lequel
   * le site le range.
   */
  function ajouterEtape(e: Etape, k = cible) {
    const memo = etiquettes[cleExercice(e)]
    const officiel = referentiel.find((r) => r.uuid === e.uuid && r.objectif)?.objectif
    const objectifsDeDepart = e.objectifs ?? (memo?.length ? [...memo] : officiel ? [officiel.libelle] : undefined)
    const etape = objectifsDeDepart ? { ...e, objectifs: objectifsDeDepart } : e
    if (!avecPaliers) return void p.etapes.push(etape)
    p.etapes.splice(debutDe(k) + p.paliers![k].nb, 0, etape)
    p.paliers![k].nb++
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
        ajouterEtape({ ...e, id: e.id ?? r?.id, titre: r?.titre ?? e.id ?? e.uuid, nbQuestions: e.nbQuestions ?? 3 } as Etape, groupes.length - 1)
      }
      messageLien = ''
      lienMathalea = ''
    } catch {
      messageLien = 'Ce lien n’est pas une adresse valide.'
    }
  }

  /** Monter ou descendre : au bord d'un palier, l'exercice passe dans le palier voisin */
  function deplacer(i: number, sens: -1 | 1) {
    if (avecPaliers) {
      const k = palierDe(i)
      const g = groupes[k]
      const paliers = p.paliers!
      if (sens === -1 && i === g[0] && k > 0) {
        paliers[k - 1].nb++
        paliers[k].nb--
        return
      }
      if (sens === 1 && i === g.at(-1) && k < paliers.length - 1) {
        paliers[k].nb--
        paliers[k + 1].nb++
        return
      }
    }
    const j = i + sens
    if (j < 0 || j >= p.etapes.length) return
    ;[p.etapes[i], p.etapes[j]] = [p.etapes[j], p.etapes[i]]
    if (ouvert === i) ouvert = j
    else if (ouvert === j) ouvert = i
  }

  function retirer(i: number) {
    if (avecPaliers) p.paliers![palierDe(i)].nb--
    p.etapes.splice(i, 1)
    ouvert = null
  }

  // ---------- Objectifs ----------
  // Ceux du chapitre d'abord ; ceux créés ici ou posés sur l'exercice restent visibles
  const objectifsProposes = $derived.by(() => {
    const duChapitre = objectifs.filter((o) => o.niveau === p.niveau && o.theme.trim() === p.theme.trim()).map((o) => o.libelle)
    const poses = p.etapes.flatMap((e) => e.objectifs ?? [])
    return [...new Set([...duChapitre, ...poses])]
  })

  function basculerObjectif(e: Etape, libelle: string) {
    const actuels = e.objectifs ?? []
    e.objectifs = actuels.includes(libelle) ? actuels.filter((o) => o !== libelle) : [...actuels, libelle]
  }

  function creerObjectif(e: Etape) {
    const libelle = nouvelObjectif.trim()
    if (!libelle) return
    if (!(e.objectifs ?? []).includes(libelle)) e.objectifs = [...(e.objectifs ?? []), libelle]
    nouvelObjectif = ''
  }

  const resumeExercice = (e: Etape) => {
    const n = e.nbQuestions ?? 0
    const questions = `${e.nbQuestions ?? '?'} question${n > 1 ? 's' : ''}`
    const o = e.objectifs ?? []
    if (o.length === 1) return `${questions} · ${o[0]}`
    if (o.length > 1) return `${questions} · ${o.length} objectifs`
    return `${questions} · Réglages et aperçu`
  }

  const instantane = () => $state.snapshot(p) as Parcours

  /** Objectifs posés dans ce parcours qui manquent à la liste de l'enseignant */
  function objectifsNouveaux(): Objectif[] {
    const connus = new Set(objectifs.map((o) => o.libelle))
    const poses = [...new Set(p.etapes.flatMap((e) => e.objectifs ?? []))].filter((l) => !connus.has(l))
    return poses.map((libelle) => {
      const code = codesOfficiels.get(libelle)
      return { libelle, ...(code ? { code } : {}), niveau: p.niveau, theme: p.theme.trim() }
    })
  }

  function quitter() {
    if (modifie && !confirmerSortie) confirmerSortie = true
    else onretour()
  }

  /** Entrée : lien importé, objectif créé, sinon champ suivant */
  let zone: HTMLElement | undefined = $state()
  function surEntree(e: KeyboardEvent) {
    if (e.key !== 'Enter' || e.isComposing) return
    const champ = e.target as HTMLElement
    if (!(champ instanceof HTMLInputElement) || ['radio', 'checkbox'].includes(champ.type)) return
    e.preventDefault()
    if (champ.id === 'lien-mathalea') return importerLien()
    if (champ.id.startsWith('objectif-ex-')) return creerObjectif(p.etapes[Number(champ.id.slice('objectif-ex-'.length))])
    const champs = [...zone!.querySelectorAll<HTMLElement>('input[type=text], input:not([type]), input[type=url]')].filter((c) => c.offsetParent !== null)
    const i = champs.indexOf(champ)
    if (i !== -1 && i < champs.length - 1) champs[i + 1].focus()
    else champ.blur()
  }

  const hote = (adresse: string) => {
    try {
      return new URL(adresse).hostname.replace(/^www\./, '')
    } catch {
      return adresse
    }
  }
</script>

{#snippet ligneExercice(i: number)}
  {@const e = p.etapes[i]}
  <li class="bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
    <div class="flex flex-row items-center gap-2 px-3 py-2">
      <div class="flex flex-col">
        <button type="button" aria-label="Monter" class="text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-40" disabled={!peutMonter(i)} onclick={() => deplacer(i, -1)}>
          <i aria-hidden="true" class="bx bx-chevron-up text-2xl"></i>
        </button>
        <button
          type="button"
          aria-label="Descendre"
          class="text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-40"
          disabled={!peutDescendre(i)}
          onclick={() => deplacer(i, 1)}
        >
          <i aria-hidden="true" class="bx bx-chevron-down text-2xl"></i>
        </button>
      </div>
      <button type="button" class="min-w-0 flex-1 text-left" aria-expanded={ouvert === i} onclick={() => basculerExercice(i)}>
        <div class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{e.id ?? 'Exercice'}</div>
        <div class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus truncate">
          {e.titreMasque ? 'Masqué aux élèves' : e.titre.replace(/\$([^$]*)\$/g, '$1')}
        </div>
        <div class="{discret} truncate">{resumeExercice(e)}</div>
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
            aria-label={e.titreMasque ? 'Montrer l’exercice aux élèves' : 'Masquer l’exercice aux élèves'}
            aria-pressed={e.titreMasque === true}
            class="p-2 text-coopmaths-action dark:text-coopmathsdark-action"
            onclick={() => (e.titreMasque = !e.titreMasque)}
          >
            <i aria-hidden="true" class="bx {e.titreMasque ? 'bx-hide' : 'bx-show'} text-2xl"></i>
          </button>
        </div>
        {#if e.titreMasque}
          <p class={discret}>Absent de la liste vue par les élèves, sans titre pendant l’activité.</p>
        {/if}
        <ReglagesExercice bind:etape={p.etapes[i]} description={descriptions[e.uuid] ?? null} />
        <div class="flex flex-col gap-2">
          <p class={sousTitre}>Objectifs</p>
          {#if objectifsProposes.length}
            <div class="flex flex-row flex-wrap gap-2" role="group" aria-label="Objectifs de l’exercice">
              {#each objectifsProposes as o (o)}
                {@const choisi = (e.objectifs ?? []).includes(o)}
                <button type="button" role="checkbox" aria-checked={choisi} class={puce(choisi)} onclick={() => basculerObjectif(e, o)}>
                  {#if choisi}<i aria-hidden="true" class="bx bx-check"></i>{/if}
                  {o}
                </button>
              {/each}
            </div>
          {/if}
          <div class="flex flex-row items-end gap-2">
            <ChampTexte id="objectif-ex-{i}" titre="Nouvel objectif" bind:valeur={nouvelObjectif} />
            <button
              type="button"
              class="{boutonInverse} shrink-0 disabled:opacity-40"
              style="min-height: 40px"
              disabled={!nouvelObjectif.trim()}
              onclick={() => creerObjectif(e)}
            >
              Ajouter
            </button>
          </div>
        </div>
        <ApercuExercice {moteur} params={e} />
      </div>
    {/if}
  </li>
{/snippet}

{#snippet boutonsAjout(k: number)}
  <button
    type="button"
    class="{avecPaliers ? boutonLien : boutonInverse} w-full"
    style="min-height: 44px"
    onclick={() => {
      cible = k
      navigateur = true
    }}
  >
    <i aria-hidden="true" class="bx bx-plus text-xl"></i>
    {avecPaliers ? `Ajouter des exercices à : ${nomPalier(p, k).toLowerCase()}` : 'Ajouter des exercices'}
  </button>
{/snippet}

{#if navigateur}
  <NavigateurExercices
    {moteur}
    {referentiel}
    niveauInitial={p.niveau}
    nbChoisis={p.etapes.length}
    {decrire}
    onajouter={(e) => ajouterEtape(e)}
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
      <h2 class={titreSection}>Niveau</h2>
      <div class="flex flex-row flex-wrap gap-2" role="radiogroup" aria-label="Niveau">
        {#each niveaux as n (n)}
          <button type="button" role="radio" aria-checked={p.niveau === n} class={puce(p.niveau === n)} onclick={() => (p.niveau = n)}>{n}</button>
        {/each}
      </div>

      <h2 class={titreSection}>Chapitre</h2>
      {#if propositions.duNiveau.length || propositions.autres.length}
        <div class="flex flex-row flex-wrap gap-2" role="radiogroup" aria-label="Chapitres existants">
          {#each [...propositions.duNiveau, ...propositions.autres] as ch (ch)}
            <button type="button" role="radio" aria-checked={p.theme.trim() === ch} class={puce(p.theme.trim() === ch)} onclick={() => (p.theme = ch)}>
              {ch}
            </button>
          {/each}
        </div>
      {/if}
      <ChampTexte id="chapitre" titre="Nom du chapitre" bind:valeur={p.theme} />

      <h2 class={titreSection}>Parcours</h2>
      <ChampTexte id="titre" titre="Titre" bind:valeur={p.titre} />
      <ChampTexte id="objectif" titre="But du parcours (vu par les élèves)" bind:valeur={p.objectif} />
      <p class={sousTitre}>Type</p>
      <div class="flex flex-row flex-wrap gap-2" role="radiogroup" aria-label="Type">
        {#each difficultes as d, i (d)}
          <button type="button" role="radio" aria-checked={p.difficulte === i + 1} class={puce(p.difficulte === i + 1)} onclick={() => (p.difficulte = (i + 1) as 1 | 2 | 3)}>
            {d}
          </button>
        {/each}
      </div>

      <h2 class={titreSection}>Exercices</h2>
      <div class="flex flex-row flex-wrap gap-2" role="radiogroup" aria-label="Organisation des exercices">
        {#each [['liste', 'Liste simple', 'bx-list-ul'], ['paliers', 'Paliers', 'bx-layer'], ['ceintures', 'Ceintures', 'bx-medal']] as [valeur, libelle, icone] (valeur)}
          <button type="button" role="radio" aria-checked={organisation === valeur} class={puce(organisation === valeur)} onclick={() => organiser(valeur as StylePaliers | 'liste')}>
            <i aria-hidden="true" class="bx {icone}"></i> {libelle}
          </button>
        {/each}
      </div>
      {#if organisation === 'ceintures'}
        <p class={sousTitre}>Première ceinture</p>
        <div class="flex flex-row flex-wrap gap-2" role="radiogroup" aria-label="Première ceinture">
          {#each CEINTURES as c, r (c.nom)}
            <button
              type="button"
              role="radio"
              aria-checked={(p.premiereCeinture ?? 0) === r}
              class={puce((p.premiereCeinture ?? 0) === r)}
              onclick={() => (p.premiereCeinture = r || undefined)}
            >
              <span aria-hidden="true" class="inline-block w-4 h-2 rounded-sm border border-coopmaths-canvas-darkest" style="background-color: {c.couleur}"></span>
              {c.nom}
            </button>
          {/each}
        </div>
      {/if}
      {#if !avecPaliers}
        {#if p.etapes.length}
          <ul class={listeGroupee}>
            {#each groupes[0] as i (p.etapes[i])}
              {@render ligneExercice(i)}
            {/each}
          </ul>
        {/if}
        {@render boutonsAjout(0)}
      {:else}
        {#each p.paliers! as x, k (k)}
          <section class="flex flex-col gap-3 rounded-2xl p-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark" aria-label={nomPalier(p, k)}>
            <div class="flex flex-row items-center gap-3">
              {#if p.style === 'ceintures'}
                <span aria-hidden="true" class="shrink-0 w-9 h-4 rounded border border-coopmaths-canvas-darkest" style="background-color: {couleurCeinture(p, k)}"></span>
              {:else}
                <span
                  class="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full font-bold
                  bg-coopmaths-struct dark:bg-coopmathsdark-struct text-coopmaths-canvas dark:text-coopmathsdark-canvas"
                  aria-hidden="true">{k + 1}</span
                >
              {/if}
              <div class="min-w-0 flex-1">
                <ChampTexte id="titre-palier-{k}" titre="{nomPalier(p, k)} : titre vu par les élèves" bind:valeur={x.titre} />
              </div>
              <button type="button" aria-label="Supprimer : {nomPalier(p, k).toLowerCase()}" class="p-1 text-coopmaths-action dark:text-coopmathsdark-action" onclick={() => supprimerPalier(k)}>
                <i aria-hidden="true" class="bx bx-trash text-2xl"></i>
              </button>
            </div>
            {#if k > 0}
              <p class={sousTitre}>Pour y accéder</p>
              <div class="flex flex-row flex-wrap gap-2" role="radiogroup" aria-label="Accès : {nomPalier(p, k).toLowerCase()}">
                <button type="button" role="radio" aria-checked={x.acces === 'seuil'} class={puce(x.acces === 'seuil')} onclick={() => choisirAcces(x, 'seuil')}>
                  <i aria-hidden="true" class="bx bx-lock-alt"></i> Réussir : {nomPalier(p, k - 1).toLowerCase()}
                </button>
                <button type="button" role="radio" aria-checked={(x.acces ?? 'libre') === 'libre'} class={puce((x.acces ?? 'libre') === 'libre')} onclick={() => choisirAcces(x, 'libre')}>
                  Ouvert à tout moment
                </button>
              </div>
              {#if x.acces === 'seuil'}
                <div class="flex flex-row flex-wrap items-center gap-2" role="radiogroup" aria-label="Réussite demandée au palier {k}">
                  <span class={discret}>Au moins</span>
                  {#each SEUILS as n (n)}
                    <button type="button" role="radio" aria-checked={x.seuil === n} class={puce(x.seuil === n)} onclick={() => (x.seuil = n)}>{n} %</button>
                  {/each}
                </div>
              {/if}
            {/if}
            {#if groupes[k].length}
              <ul class={listeGroupee}>
                {#each groupes[k] as i (p.etapes[i])}
                  {@render ligneExercice(i)}
                {/each}
              </ul>
            {/if}
            {#if x.ressource}
              <div class="flex flex-row items-center gap-3 rounded-xl px-3 py-2 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
                <i aria-hidden="true" class="bx bx-book-open text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
                <button type="button" class="min-w-0 flex-1 text-left" onclick={() => (ressource = { k, titre: x.ressource!.titre, lien: x.ressource!.lien })}>
                  <div class="text-coopmaths-corpus dark:text-coopmathsdark-corpus truncate">{x.ressource.titre}</div>
                  <div class="{discret} truncate">{hote(x.ressource.lien)}</div>
                </button>
                <button type="button" aria-label="Retirer la ressource" class="p-1 text-coopmaths-action dark:text-coopmathsdark-action" onclick={() => (x.ressource = undefined)}>
                  <i aria-hidden="true" class="bx bx-x text-2xl"></i>
                </button>
              </div>
            {/if}
            <div class="flex flex-row flex-wrap justify-center">
              {@render boutonsAjout(k)}
              {#if !x.ressource}
                <button type="button" class={boutonLien} onclick={() => (ressource = { k, titre: '', lien: '' })}>
                  <i aria-hidden="true" class="bx bx-book-open text-xl"></i> Ressource pour revoir
                </button>
              {/if}
            </div>
          </section>
          {#if x.pause}
            <button
              type="button"
              class="flex flex-row items-start gap-3 rounded-2xl p-3 text-left border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
              onclick={() => (pause = { k, texte: x.pause!.texte, titre: x.pause!.ressource?.titre ?? '', lien: x.pause!.ressource?.lien ?? '' })}
            >
              <i aria-hidden="true" class="bx bx-pause-circle text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
              <span class="min-w-0 flex-1">
                <span class="block font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Pause après : {nomPalier(p, k).toLowerCase()}</span>
                <span class="block text-sm whitespace-pre-line text-coopmaths-corpus dark:text-coopmathsdark-corpus">{x.pause.texte}</span>
                {#if x.pause.ressource}<span class="block {discret} truncate">{x.pause.ressource.titre} · {hote(x.pause.ressource.lien)}</span>{/if}
              </span>
            </button>
          {:else}
            <button type="button" class="{boutonLien} self-center" onclick={() => (pause = { k, texte: '', titre: '', lien: '' })}>
              <i aria-hidden="true" class="bx bx-pause-circle text-xl"></i> Pause après : {nomPalier(p, k).toLowerCase()}
            </button>
          {/if}
        {/each}
        <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={ajouterPalier}>
          <i aria-hidden="true" class="bx bx-layer text-xl"></i> Ajouter {p.style === "ceintures" ? `la ${nomPalier(p, p.paliers!.length).toLowerCase()}` : "un palier"}
        </button>
      {/if}
      <div class="flex flex-row flex-wrap justify-center">
        {#if !avecLien}
          <button type="button" class={boutonLien} onclick={() => (avecLien = true)}>
            <i aria-hidden="true" class="bx bx-link text-xl"></i> Importer depuis un lien MathALÉA
          </button>
        {/if}
      </div>
      {#if avecLien}
        <div class="flex flex-row items-end gap-2">
          <ChampTexte id="lien-mathalea" titre="Lien MathALÉA (exercices et réglages)" bind:valeur={lienMathalea} type="url" />
          <button type="button" class="{boutonInverse} shrink-0 disabled:opacity-40" style="min-height: 40px" disabled={!lienMathalea.trim()} onclick={importerLien}>
            Importer
          </button>
        </div>
      {/if}
      {#if messageLien}<p class="text-sm font-bold text-coopmaths-action dark:text-coopmathsdark-action" role="alert">{messageLien}</p>{/if}

      <!-- Réglages secondaires repliés : un résumé, et tout se modifie en dépliant -->
      <button
        type="button"
        class="{elementListe} rounded-xl mt-4"
        aria-expanded={presentationOuverte}
        onclick={() => (presentationOuverte = !presentationOuverte)}
      >
        <span class="flex flex-row items-center gap-3 min-w-0">
          <i aria-hidden="true" class="bx {p.icone} text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
          <span class="flex flex-col min-w-0">
            <span class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">Icône, pages et correction</span>
            <span class="{discret} truncate">{libellesPresentation[p.presentation]}{melange(p) ? ', mélangées' : ''} · correction : {libellesValidation[p.correction].toLowerCase()}</span>
          </span>
        </span>
        <i aria-hidden="true" class="bx {presentationOuverte ? 'bx-chevron-up' : 'bx-chevron-down'} text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
      </button>
      {#if presentationOuverte}
      <p class={sousTitre}>Icône</p>
      <div class="flex flex-row flex-wrap gap-2" role="radiogroup" aria-label="Icône du parcours">
        {#each ICONES as icone (icone.classe)}
          <button
            type="button"
            role="radio"
            aria-checked={p.icone === icone.classe}
            aria-label={icone.nom}
            class="{puce(p.icone === icone.classe)} px-2"
            onclick={() => {
              iconeAuto = false
              p.icone = icone.classe
            }}
          >
            <i aria-hidden="true" class="bx {icone.classe} text-xl"></i>
          </button>
        {/each}
      </div>

      <p class={sousTitre}>Pages</p>
      <ChoixRadio
        nom="presentation"
        bind:valeur={p.presentation}
        options={Object.entries(libellesPresentation).map(([valeur, libelle]) => ({ valeur: valeur as Parcours['presentation'], libelle }))}
      />
      <label class="flex flex-row items-center justify-between gap-4 rounded-xl px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
        <span class="flex flex-col gap-1 min-w-0">
          <span class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Afficher les exercices</span>
          <span class={discret}>Numéro et titre de chaque exercice ; sinon, les questions s’enchaînent.</span>
        </span>
        <input type="checkbox" role="switch" class="interrupteur shrink-0" checked={!p.enTetesMasques} onchange={(e) => (p.enTetesMasques = !e.currentTarget.checked)} />
      </label>
      <label
        class="flex flex-row items-center justify-between gap-4 rounded-xl px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
        class:opacity-40={p.presentation === 'un_exo_par_page'}
      >
        <span class="flex flex-col gap-1 min-w-0">
          <span class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Mélanger les questions</span>
          <span class={discret}>
            {p.presentation === 'un_exo_par_page' ? 'Sans effet avec un exercice par page.' : 'Ordre différent pour chaque élève, le même pour une session partagée.'}
          </span>
        </span>
        <input
          type="checkbox"
          role="switch"
          class="interrupteur shrink-0"
          disabled={p.presentation === 'un_exo_par_page'}
          checked={!!p.melanger}
          onchange={(e) => (p.melanger = e.currentTarget.checked)}
        />
      </label>
      <p class={sousTitre}>Validation et correction</p>
      <ChoixRadio
        nom="validation"
        bind:valeur={p.correction}
        options={Object.entries(libellesValidation).map(([valeur, libelle]) => ({ valeur: valeur as Parcours['correction'], libelle }))}
      />

      {/if}

      {#if ondupliquer || onexporter || onsupprimer}
        <!-- Dupliquer, exporter, supprimer : dans un panneau du bas -->
        <button type="button" class="{boutonLien} mt-4" onclick={() => (actions = true)}>
          <i aria-hidden="true" class="bx bx-dots-horizontal-rounded text-xl"></i>
          Autres actions
        </button>
        {#if messageExport}<p class="text-center {discret}" role="status">{messageExport}</p>{/if}
      {/if}
    </main>

    {#if confirmerSortie}
      <Feuille onfermer={() => (confirmerSortie = false)}>
        <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Les modifications ne sont pas enregistrées.</p>
        <div class="flex flex-row gap-3">
          <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={onretour}>Quitter sans enregistrer</button>
          <button type="button" class="{boutonAction} flex-1" style="min-height: 44px" onclick={() => (confirmerSortie = false)}>Rester</button>
        </div>
      </Feuille>
    {/if}
    {#if ressource}
      {@const r = ressource}
      <Feuille onfermer={() => (ressource = null)}>
        <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Pour revoir : {nomPalier(p, r.k).toLowerCase()}</p>
        <p class="text-sm">Un PDF ou une vidéo partagés par lien sur votre drive. Les élèves l’ouvrent depuis le palier ; elle est mise en avant tant que le palier n’est pas réussi.</p>
        <ChampTexte id="ressource-titre" titre="Titre vu par les élèves" bind:valeur={r.titre} />
        <ChampTexte id="ressource-lien" titre="Lien" bind:valeur={r.lien} type="url" />
        <button
          type="button"
          class="{boutonAction} w-full disabled:opacity-40"
          style="min-height: 44px"
          disabled={!ressourceSaisie(r.titre, r.lien)}
          onclick={() => {
            p.paliers![r.k].ressource = ressourceSaisie(r.titre, r.lien)
            ressource = null
          }}>Enregistrer la ressource</button
        >
      </Feuille>
    {/if}
    {#if pause}
      {@const x = pause}
      <Feuille onfermer={() => (pause = null)}>
        <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Pause après : {nomPalier(p, x.k).toLowerCase()}</p>
        <div class="w-full">
          <label class="font-light text-sm block text-coopmaths-struct dark:text-coopmathsdark-struct" for="pause-texte">Texte vu par les élèves (point de cours, consigne, encouragement)</label>
          <textarea
            id="pause-texte"
            rows="4"
            bind:value={x.texte}
            class="block w-full text-sm border p-2 border-coopmaths-action dark:border-coopmathsdark-action focus:outline-0 focus:ring-0 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          ></textarea>
        </div>
        <ChampTexte id="pause-ressource-titre" titre="Document lié : titre (facultatif)" bind:valeur={x.titre} />
        <ChampTexte id="pause-ressource-lien" titre="Document lié : lien (facultatif)" bind:valeur={x.lien} type="url" />
        <div class="flex flex-row gap-3">
          {#if p.paliers![x.k].pause}
            <button
              type="button"
              class="{boutonInverse} flex-1"
              style="min-height: 44px"
              onclick={() => {
                p.paliers![x.k].pause = undefined
                pause = null
              }}>Retirer la pause</button
            >
          {/if}
          <button
            type="button"
            class="{boutonAction} flex-1 disabled:opacity-40"
            style="min-height: 44px"
            disabled={!x.texte.trim() || ((x.titre.trim() !== '' || x.lien.trim() !== '') && !ressourceSaisie(x.titre, x.lien))}
            onclick={() => {
              const ressourcePause = ressourceSaisie(x.titre, x.lien)
              p.paliers![x.k].pause = { texte: x.texte.trim(), ...(ressourcePause ? { ressource: ressourcePause } : {}) }
              pause = null
            }}>Enregistrer la pause</button
          >
        </div>
      </Feuille>
    {/if}
    {#if actions}
      <Feuille onfermer={() => (actions = false)}>
        {#if modifie}
          <p class="text-sm {discret}">Enregistrez d’abord les modifications pour dupliquer ou exporter ce parcours.</p>
        {/if}
        <ul class={listeGroupee}>
          {#if ondupliquer}
            <li>
              <button type="button" class={ligneAction} disabled={modifie} onclick={() => ondupliquer(instantane())}>
                <span class="flex flex-row items-center gap-3 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
                  <i aria-hidden="true" class="bx bx-copy text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>Dupliquer
                </span>
              </button>
            </li>
          {/if}
          {#if onexporter}
            <li>
              <button
                type="button"
                class={ligneAction}
                disabled={modifie}
                onclick={async () => {
                  actions = false
                  messageExport = await onexporter()
                }}
              >
                <span class="flex flex-row items-center gap-3 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
                  <i aria-hidden="true" class="bx bx-export text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>Exporter ce parcours seul
                </span>
              </button>
            </li>
          {/if}
          {#if onsupprimer}
            <li>
              <button
                type="button"
                class={ligneAction}
                onclick={() => {
                  actions = false
                  confirmerSuppression = true
                }}
              >
                <span class="flex flex-row items-center gap-3 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
                  <i aria-hidden="true" class="bx bx-trash text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>Supprimer le parcours
                </span>
              </button>
            </li>
          {/if}
        </ul>
      </Feuille>
    {/if}
    {#if confirmerSuppression && onsupprimer}
      <Feuille onfermer={() => (confirmerSuppression = false)}>
        <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Supprimer « {p.titre || 'Sans titre'} » ?</p>
        <p class="text-sm">Le parcours disparaît de cet appareil. Les élèves le gardent jusqu’à la prochaine publication.</p>
        <div class="flex flex-row gap-3">
          <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={() => (confirmerSuppression = false)}>Annuler</button>
          <button type="button" class="{boutonAction} flex-1" style="min-height: 44px" onclick={onsupprimer}>Supprimer</button>
        </div>
      </Feuille>
    {/if}

    <footer
      use:garderSaisie
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
        <button type="button" class="{boutonAction} flex-1 disabled:opacity-40" style="min-height: 44px" disabled={manques.length > 0} onclick={() => onvalider(instantane(), objectifsNouveaux())}>
          {modification ? 'Enregistrer et quitter' : 'Valider le parcours'}
        </button>
      </div>
    </footer>
  </div>
{/if}
