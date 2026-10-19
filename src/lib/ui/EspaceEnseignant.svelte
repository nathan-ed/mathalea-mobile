<script lang="ts">
  // Onglet Créer de l'accueil (réglage Enseignant). On crée un parcours pour un
  // niveau, on le donne ensuite à des classes. Trois vues : Parcours (la
  // bibliothèque, par niveau et chapitre), Classes (ce que chaque classe reçoit,
  // dans l'ordre vu par les élèves), Objectifs (liste de l'enseignant et
  // exercices qui les travaillent). En haut : l'état du fichier complet et son export.
  import { paliersDe, type Parcours } from '$lib/catalogue'
  import { aExporter, aJour, parcoursDeClasse, type Bibliotheque, type ParcoursEnseignant } from '$lib/bibliotheque'
  import { NIVEAUX, type Pays } from '$lib/moteur'
  import { lireObjectifs, type Objectif } from '$lib/objectifs'
  import ChampTexte from './ChampTexte.svelte'
  import { boutonAction, boutonInverse, boutonLien, elementListe, listeGroupee } from './classes'
  import EnTete from './EnTete.svelte'
  import Feuille from './Feuille.svelte'
  import Tuile from './Tuile.svelte'
  import { retourSi } from '$lib/navigation.svelte'

  let {
    bibliotheque,
    modeles,
    objectifs,
    pays,
    onouvrir,
    oncreer,
    onediter,
    onlien,
    onexporter,
    onreglages,
    onreleve,
    dernier = null,
    onfermerDernier,
    onexporterChoix,
    onimporter,
    onreprendre,
    onverifier,
    ondeplacer,
    onparcoursDeClasse,
    onajouterClasse,
    onrenommerClasse,
    onretirerClasse,
    onobjectifs,
    onexporterObjectifs,
  }: {
    bibliotheque: Bibliotheque
    modeles: Parcours[] // parcours des dossiers suivis et fichiers importés que l'enseignant n'a pas déjà
    objectifs: Objectif[]
    pays: Pays
    onouvrir: (pe: ParcoursEnseignant) => void
    oncreer: () => void
    onediter: (p: Parcours) => void
    onlien: (lien: string) => void
    onexporter: () => Promise<string> // fichier complet : classes, tous les parcours, objectifs
    dernier?: string | null // parcours qui vient d'être enregistré
    onfermerDernier: () => void
    onexporterChoix: (ids: string[]) => Promise<string> // parcours choisis, pour un collègue
    onimporter: (texte: string) => Promise<{ message: string; parcours: Parcours[] }>
    onreprendre: (source: { lien?: string; texte?: string }) => Promise<string> // bibliothèque publiée : autre appareil, page du site
    onverifier: () => Promise<string> // le dossier partagé contient-il la dernière publication ?
    ondeplacer: (id: string, classe: string, sens: -1 | 1) => void
    onparcoursDeClasse: (classe: string, ids: string[]) => void
    onajouterClasse: (nom: string) => void
    onrenommerClasse: (avant: string, apres: string) => void
    onretirerClasse: (nom: string) => void
    onobjectifs: (liste: Objectif[]) => void
    onexporterObjectifs: () => Promise<string>
    onreglages: () => void
    onreleve: () => void // réponses des élèves à une session partagée (QR codes)
  } = $props()

  const titreSection = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const titreChapitre = 'pl-2 pt-1 text-sm font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct'
  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  const texte = 'text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus'
  const icone = 'bx text-2xl text-coopmaths-action dark:text-coopmathsdark-action'
  const puce = (actif: boolean) =>
    `presse shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
      actif
        ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
        : 'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus dark:text-coopmathsdark-corpus'
    }`

  type Vue = 'parcours' | 'classes' | 'objectifs'
  let vue: Vue = $state('parcours')
  // « Éditer un parcours existant » : sous-écran
  let modelesOuverts = $state(false)
  retourSi(() => modelesOuverts, () => (modelesOuverts = false))
  let message = $state('')
  let lien = $state('')
  let modifierLien = $state(false)
  let feuilleDossier = $state(false)
  // Reprendre sa bibliothèque (autre appareil, page du site)
  let feuilleReprendre = $state(false)
  let lienReprise = $state('')
  let messageReprise = $state('')
  let reprise = $state(false)
  async function reprendreDepuis(source: { lien?: string; texte?: string }) {
    reprise = true
    messageReprise = await onreprendre(source)
    reprise = false
  }
  async function reprendreFichier(e: Event) {
    const champ = e.currentTarget as HTMLInputElement
    const f = champ.files?.[0]
    champ.value = ''
    if (f) await reprendreDepuis({ texte: await f.text() })
  }
  retourSi(() => modifierLien, () => (modifierLien = false))
  $effect.pre(() => {
    lien = bibliotheque.lien ?? ''
  })
  // Le fichier complet exporté (celui du dossier partagé) contient-il tout ce qui est dans l'app ?
  const aExporterTout = $derived(!aJour(bibliotheque, objectifs))
  // Parcours qui partent aux élèves : donnés à une classe, avec un titre et des exercices
  const prets = $derived(bibliotheque.parcours.filter((pe) => pe.classes.length && pe.parcours.titre.trim() && pe.parcours.etapes.length).length)
  const enregistre = $derived(dernier ? bibliotheque.parcours.find((pe) => pe.parcours.id === dernier) : undefined)
  let messageImport = $state('')

  // ---------- Parcours : par niveau puis chapitre ----------
  const rangNiveau = (n: string) => {
    const i = NIVEAUX[pays].indexOf(n)
    return i === -1 ? NIVEAUX[pays].length : i
  }
  const parNiveau = $derived.by(() => {
    const niveaux = [...new Set(bibliotheque.parcours.map((pe) => pe.parcours.niveau))].sort((a, b) => rangNiveau(a) - rangNiveau(b))
    return niveaux.map((niveau) => {
      const du = bibliotheque.parcours.filter((pe) => pe.parcours.niveau === niveau)
      const chapitres = [...new Set(du.map((pe) => pe.parcours.theme.trim()))]
      return { niveau, chapitres: chapitres.map((theme) => ({ theme, parcours: du.filter((pe) => pe.parcours.theme.trim() === theme) })) }
    })
  })

  const sousTitreBibliotheque = (pe: ParcoursEnseignant) => {
    const n = pe.parcours.etapes.length
    const paliers = paliersDe(pe.parcours).length
    return [
      pe.classes.length ? pe.classes.join(', ') : 'Aucune classe',
      paliers > 1 ? `${paliers} paliers` : `${n} exercice${n > 1 ? 's' : ''}`,
      pe.classes.some((c) => aExporter(pe, c)) ? 'différent du drive' : '',
    ]
      .filter(Boolean)
      .join(' · ')
  }

  // ---------- Classes ----------
  let classeChoisie: string | null = $state(null)
  const classeVue = $derived(bibliotheque.classes.find((c) => c.nom === classeChoisie)?.nom ?? bibliotheque.classes[0]?.nom)
  let nouvelleClasse = $state('')
  let feuilleClasse: 'nouvelle' | 'actions' | 'renommer' | 'retirer' | 'parcours' | null = $state(null)
  let nomClasse = $state('')
  // Parcours cochés pour la classe (panneau « Choisir les parcours »)
  let choix: string[] = $state([])

  function creerClasse() {
    const nom = nouvelleClasse.trim()
    if (!nom) return
    onajouterClasse(nom)
    classeChoisie = nom
    nouvelleClasse = ''
    feuilleClasse = null
  }

  function ouvrirChoix() {
    choix = parcoursDeClasse(bibliotheque, classeVue!).map((pe) => pe.parcours.id)
    feuilleClasse = 'parcours'
  }

  const sousTitreClasse = (pe: ParcoursEnseignant, classe: string) => {
    const n = pe.parcours.etapes.length
    return [pe.parcours.theme, `${n} exercice${n > 1 ? 's' : ''}`, aExporter(pe, classe) ? 'différent du drive' : ''].filter(Boolean).join(' · ')
  }

  // ---------- Objectifs ----------
  // Exercices de la bibliothèque qui travaillent chaque objectif
  const usages = $derived.by(() => {
    const m = new Map<string, { parcours: string; exercice: string }[]>()
    for (const pe of bibliotheque.parcours)
      pe.parcours.etapes.forEach((e) => {
        for (const o of e.objectifs ?? []) m.set(o, [...(m.get(o) ?? []), { parcours: pe.parcours.titre, exercice: e.id ?? e.titre }])
      })
    return m
  })
  const objectifsParNiveau = $derived.by(() => {
    const niveaux = [...new Set(objectifs.map((o) => o.niveau))].sort((a, b) => rangNiveau(a) - rangNiveau(b))
    return niveaux.map((niveau) => {
      const du = objectifs.filter((o) => o.niveau === niveau)
      const chapitres = [...new Set(du.map((o) => o.theme))]
      return { niveau, chapitres: chapitres.map((theme) => ({ theme, objectifs: du.filter((o) => o.theme === theme) })) }
    })
  })
  let objectifOuvert: string | null = $state(null)
  let objectifChoisi: Objectif | null = $state(null)
  let feuilleObjectif: 'actions' | 'renommer' | 'importer' | null = $state(null)
  let libelle = $state('')
  // Import : texte collé (un objectif par ligne) ou fichier, rangé au niveau et au chapitre choisis
  let collage = $state('')
  let niveauImport = $state('')
  let chapitreImport = $state('')
  let messageObjectifs = $state('')

  function importerTexte(t: string) {
    try {
      const recus = lireObjectifs(t, niveauImport, chapitreImport.trim())
      const nouveaux = recus.filter((o) => !objectifs.some((x) => x.libelle === o.libelle))
      onobjectifs([...objectifs, ...nouveaux])
      messageObjectifs = `${nouveaux.length} objectif${nouveaux.length > 1 ? 's' : ''} ajouté${nouveaux.length > 1 ? 's' : ''}.`
      collage = ''
      feuilleObjectif = null
    } catch (e) {
      messageObjectifs = (e as Error).message
    }
  }

  async function importerFichierObjectifs(e: Event) {
    const champ = e.currentTarget as HTMLInputElement
    const f = champ.files?.[0]
    champ.value = ''
    if (f) importerTexte(await f.text())
  }

  function renommerObjectif() {
    const n = libelle.trim()
    if (!objectifChoisi || !n || objectifs.some((o) => o.libelle === n)) return
    const avant = objectifChoisi.libelle
    onobjectifs(objectifs.map((o) => (o.libelle === avant ? { ...o, libelle: n, code: undefined } : o)))
    feuilleObjectif = null
  }

  // ---------- Diffusion ----------
  async function importer(e: Event) {
    const champ = e.currentTarget as HTMLInputElement
    const f = champ.files?.[0]
    champ.value = ''
    if (!f) return
    const r = await onimporter(await f.text())
    // Un seul parcours dans le fichier : il s'ouvre directement dans l'éditeur
    if (r.parcours.length === 1) return onediter(r.parcours[0])
    messageImport = r.message
  }

  async function ouvrirDossier(adresse: string) {
    try {
      const { openUrl } = await import('@tauri-apps/plugin-opener')
      await openUrl(adresse)
    } catch {
      window.open(adresse, '_blank', 'noopener')
    }
  }

  let verification = $state(false)
  async function verifier() {
    verification = true
    message = await onverifier()
    verification = false
  }

  async function exporterTout() {
    onfermerDernier()
    feuilleExport = false
    // La bannière sous la barre dit la suite (déposer le fichier sur le drive)
    message = ''
    await onexporter()
  }

  // « Choisir les parcours à exporter » : tous cochés, sauf depuis l'enregistrement d'un parcours
  let feuilleExport = $state(false)
  let choixExport: string[] = $state([])
  function choisirExport(ids = bibliotheque.parcours.map((pe) => pe.parcours.id)) {
    choixExport = ids
    onfermerDernier()
    feuilleExport = true
  }
  async function exporterChoisis() {
    if (choixExport.length === bibliotheque.parcours.length) return exporterTout()
    feuilleExport = false
    message = await onexporterChoix(choixExport)
  }

  function enregistrerLien() {
    onlien(lien.trim())
    modifierLien = false
  }

  const hote = (adresse: string) => {
    try {
      return new URL(adresse).hostname.replace(/^www\./, '')
    } catch {
      return adresse
    }
  }
  const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`
</script>

{#snippet ligne(iconeLigne: string, titre: string, detail: string, action: () => void)}
  <li>
    <button type="button" class={elementListe} onclick={action}>
      <span class="flex flex-row items-center gap-3 min-w-0">
        <i aria-hidden="true" class="{icone} {iconeLigne}"></i>
        <span class="flex flex-col min-w-0">
          <span class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">{titre}</span>
          {#if detail}<span class="truncate {discret}">{detail}</span>{/if}
        </span>
      </span>
      <i aria-hidden="true" class="{icone} bx-chevron-right"></i>
    </button>
  </li>
{/snippet}

{#snippet action(iconeLigne: string, titre: string, fn: () => void)}
  <li>
    <button type="button" class={elementListe} onclick={fn}>
      <span class="flex flex-row items-center gap-3 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
        <i aria-hidden="true" class="{icone} {iconeLigne}"></i>{titre}
      </span>
    </button>
  </li>
{/snippet}

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  {#if modelesOuverts}
    <EnTete titre="Éditer un parcours existant" onretour={() => (modelesOuverts = false)} />
    <div class="flex flex-col gap-3 p-4 avec-onglets">
      {#if modeles.length}
        <h2 class={titreSection}>Dossiers suivis et fichiers importés</h2>
        {#each modeles as p (p.id)}
          <Tuile icon={p.icone} title={p.titre} subtitle="{p.niveau} · {p.theme}" badge="V{p.version}" onclick={() => onediter(p)} />
        {/each}
      {:else}
        <p class="py-4 text-center {discret}">Importez un fichier de parcours, ou suivez le dossier partagé d’un collègue dans les Réglages.</p>
      {/if}
      <label class="{boutonInverse} w-full text-center cursor-pointer" style="min-height: 44px; display: flex; align-items: center; justify-content: center">
        Importer un fichier de parcours (.json)
        <input type="file" accept=".json,application/json" class="hidden" onchange={importer} />
      </label>
      {#if messageImport}<p class={discret} role="status">{messageImport}</p>{/if}
    </div>
  {:else}
    <EnTete>
      {#snippet droite()}
        <button type="button" aria-label="Réglages" onclick={onreglages} class="bouton-icone">
          <i aria-hidden="true" class="bx bx-cog text-2xl"></i>
        </button>
      {/snippet}
    </EnTete>

    <main class="flex-1 flex flex-col gap-3 p-4 avec-onglets {vue === 'parcours' ? 'avec-bouton-flottant' : ''}">
      {#if !bibliotheque.lien}
        <!-- Mise en route : sans dossier partagé, rien n'arrive aux élèves -->
        <section class="flex flex-col gap-3 rounded-xl p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark" aria-label="Mise en route">
          <h2 class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Mise en route</h2>
          <ol class="flex flex-col gap-3 {texte}">
            <li class="flex flex-row gap-2">
              <i aria-hidden="true" class="{icone} text-xl {bibliotheque.parcours.length ? 'bx-check-circle' : 'bx-circle'}"></i>
              <span>Créez un parcours pour un niveau, puis donnez-le à vos classes.</span>
            </li>
            <li class="flex flex-row gap-2">
              <i aria-hidden="true" class="{icone} text-xl bx-circle"></i>
              <div class="flex flex-col gap-2 min-w-0 flex-1">
                <span>Sur votre drive (kDrive, Dropbox, Nextcloud, Google Drive), créez un dossier partagé par lien et collez ce lien. Les élèves l’ajoutent dans leur app.</span>
                <ChampTexte id="lien-dossier" titre="Lien du dossier partagé" bind:valeur={lien} type="url" />
                {#if lien.trim()}
                  <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={enregistrerLien}>Enregistrer le lien</button>
                {/if}
              </div>
            </li>
            <li class="flex flex-row gap-2">
              <i aria-hidden="true" class="{icone} text-xl bx-circle"></i>
              <span>Exportez tous les parcours, puis déposez le fichier dans ce dossier.</span>
            </li>
          </ol>
          {#if message}<p class={discret} role="status">{message}</p>{/if}
          <button
            type="button"
            class={boutonLien}
            onclick={() => {
              messageReprise = ''
              feuilleReprendre = true
            }}
          >
            <i aria-hidden="true" class="bx bx-sync text-xl"></i> Reprendre ma bibliothèque publiée
          </button>
        </section>
      {:else}
        <!-- L'état du drive est dans la bannière sous la barre -->
        {#if !aExporterTout && bibliotheque.parcours.length}
          {#if !prets}
            <p class="px-1 {discret}">Donnez un parcours à une classe pour que les élèves le reçoivent.</p>
          {/if}
        {/if}
        {#if !aExporterTout && prets && bibliotheque.publieLe && !bibliotheque.verifieLe}
          <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" disabled={verification} onclick={verifier}>
            <i aria-hidden="true" class="bx bx-search-alt text-xl"></i> Vérifier le dossier partagé
          </button>
        {/if}
        {#if message}<p class={discret} role="status">{message}</p>{/if}
      {/if}

      <!-- Trois vues : bibliothèque, classes, objectifs -->
      <div class="flex flex-row gap-1 rounded-xl p-1 mt-1 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark" role="tablist" aria-label="Vue">
        {#each [['parcours', 'Parcours'], ['classes', 'Classes'], ['objectifs', 'Objectifs']] as [v, libelleVue] (v)}
          <button
            type="button"
            role="tab"
            aria-selected={vue === v}
            class="flex-1 rounded-lg py-2 text-sm font-semibold transition-colors duration-150
            {vue === v
              ? 'bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-struct dark:text-coopmathsdark-struct shadow-sm'
              : 'text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'}"
            onclick={() => (vue = v as Vue)}
          >
            {libelleVue}
          </button>
        {/each}
      </div>

      {#if vue === 'parcours'}
        <ul class={listeGroupee}>
          {#if bibliotheque.lien}
            {@render ligne('bx-folder', 'Dossier partagé', hote(bibliotheque.lien), () => (feuilleDossier = true))}
          {/if}
          {@render ligne('bx-folder-open', 'Éditer un parcours existant', 'Dossiers suivis, fichiers de collègues', () => (modelesOuverts = true))}
          {@render ligne('bx-qr-scan', 'Réponses de sessions', 'QR codes des élèves après une session partagée', onreleve)}
          {#if bibliotheque.parcours.length}
            {@render ligne('bx-export', 'Exporter des parcours', 'Tous, ou ceux choisis pour un collègue', () => choisirExport())}
          {/if}
        </ul>
        {#each parNiveau as n (n.niveau)}
          <h2 class={titreSection}>{n.niveau || 'Sans niveau'}</h2>
          {#each n.chapitres as ch (ch.theme)}
            {#if n.chapitres.length > 1 || ch.theme}
              <h3 class={titreChapitre}>{ch.theme || 'Sans chapitre'}</h3>
            {/if}
            {#each ch.parcours as pe (pe.parcours.id)}
              <Tuile icon={pe.parcours.icone} title={pe.parcours.titre || 'Sans titre'} subtitle={sousTitreBibliotheque(pe)} badge="V{pe.parcours.version}" onclick={() => onouvrir(pe)} />
            {/each}
          {/each}
        {/each}
      {:else if vue === 'classes'}
        {#if bibliotheque.classes.length}
          <div class="flex flex-row gap-2 overflow-x-auto -mx-4 px-4 pt-1" role="tablist" aria-label="Classes">
            {#each bibliotheque.classes as c (c.nom)}
              <button type="button" role="tab" aria-selected={c.nom === classeVue} class={puce(c.nom === classeVue)} onclick={() => (classeChoisie = c.nom)}>
                {c.nom}
              </button>
            {/each}
            <button type="button" aria-label="Nouvelle classe" class={puce(false)} onclick={() => (feuilleClasse = 'nouvelle')}>
              <i aria-hidden="true" class="bx bx-plus"></i>
            </button>
          </div>
          {#if classeVue}
            {@const ps = parcoursDeClasse(bibliotheque, classeVue)}
            <div class="flex flex-row items-center justify-between gap-2 pl-2">
              <h2 class="font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light">
                {classeVue} · {ps.length} parcours
              </h2>
              <button type="button" aria-label="Actions sur la classe {classeVue}" class="bouton-icone" onclick={() => (feuilleClasse = 'actions')}>
                <i aria-hidden="true" class="bx bx-dots-horizontal-rounded text-2xl"></i>
              </button>
            </div>
            {#each ps as pe, i (pe.parcours.id)}
              <div class="flex flex-row items-center gap-2">
                {#if ps.length > 1}
                  <div class="flex flex-col">
                    <button
                      type="button"
                      aria-label="Monter {pe.parcours.titre} dans {classeVue}"
                      class="text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-40"
                      disabled={i === 0}
                      onclick={() => ondeplacer(pe.parcours.id, classeVue, -1)}
                    >
                      <i aria-hidden="true" class="bx bx-chevron-up text-2xl"></i>
                    </button>
                    <button
                      type="button"
                      aria-label="Descendre {pe.parcours.titre} dans {classeVue}"
                      class="text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-40"
                      disabled={i === ps.length - 1}
                      onclick={() => ondeplacer(pe.parcours.id, classeVue, 1)}
                    >
                      <i aria-hidden="true" class="bx bx-chevron-down text-2xl"></i>
                    </button>
                  </div>
                {/if}
                <div class="min-w-0 flex-1">
                  <Tuile icon={pe.parcours.icone} title={pe.parcours.titre} subtitle={sousTitreClasse(pe, classeVue)} badge="V{pe.parcours.version}" onclick={() => onouvrir(pe)} />
                </div>
              </div>
            {/each}
            <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" disabled={!bibliotheque.parcours.length} onclick={ouvrirChoix}>
              <i aria-hidden="true" class="bx bx-list-check text-xl"></i> Choisir les parcours de {classeVue}
            </button>
          {/if}
        {:else}
          <p class="px-1 {texte}">Une classe reçoit les parcours que vous lui donnez, dans l’ordre choisi ici.</p>
          <div class="flex flex-row items-end gap-2">
            <ChampTexte id="nouvelle-classe" titre="Nouvelle classe (nom affiché aux élèves)" bind:valeur={nouvelleClasse} />
            <button type="button" class="{boutonInverse} shrink-0 disabled:opacity-40" style="min-height: 40px" disabled={!nouvelleClasse.trim()} onclick={creerClasse}>
              Ajouter
            </button>
          </div>
        {/if}
      {:else}
        <ul class={listeGroupee}>
          {@render ligne('bx-import', 'Importer des objectifs', 'Tableau CSV, texte collé ou fichier d’un collègue', () => {
            niveauImport = NIVEAUX[pays][0]
            feuilleObjectif = 'importer'
          })}
          {#if objectifs.length}
            {@render ligne('bx-export', 'Exporter la liste (CSV)', pluriel(objectifs.length, 'objectif'), async () => (messageObjectifs = await onexporterObjectifs()))}
          {/if}
        </ul>
        {#if messageObjectifs}<p class={discret} role="status">{messageObjectifs}</p>{/if}
        {#if !objectifs.length}
          <p class="px-1 {texte}">
            Les exercices ajoutés à un parcours reçoivent l’objectif du programme sous lequel MathALÉA les range. Les objectifs posés apparaissent ici, avec les exercices qui les travaillent.
          </p>
        {/if}
        {#each objectifsParNiveau as n (n.niveau)}
          <h2 class={titreSection}>{n.niveau || 'Sans niveau'}</h2>
          {#each n.chapitres as ch (ch.theme)}
            <h3 class={titreChapitre}>{ch.theme || 'Sans chapitre'}</h3>
            <ul class={listeGroupee}>
              {#each ch.objectifs as o (o.libelle)}
                {@const u = usages.get(o.libelle) ?? []}
                <li class="bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
                  <div class="flex flex-row items-center gap-2 pl-4 pr-1 py-2">
                    <button type="button" class="min-w-0 flex-1 text-left" aria-expanded={objectifOuvert === o.libelle} onclick={() => (objectifOuvert = objectifOuvert === o.libelle ? null : o.libelle)}>
                      <span class="block text-coopmaths-corpus dark:text-coopmathsdark-corpus">{o.libelle}</span>
                      <span class="block {discret}">{[o.code, u.length ? pluriel(u.length, 'exercice') : 'Aucun exercice'].filter(Boolean).join(' · ')}</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Actions sur l’objectif {o.libelle}"
                      class="bouton-icone"
                      onclick={() => {
                        objectifChoisi = o
                        feuilleObjectif = 'actions'
                      }}
                    >
                      <i aria-hidden="true" class="bx bx-dots-horizontal-rounded text-2xl"></i>
                    </button>
                  </div>
                  {#if objectifOuvert === o.libelle && u.length}
                    <ul class="flex flex-col gap-1 px-4 pb-3">
                      {#each u as x, i (i)}
                        <li class={texte}><span class="font-semibold">{x.exercice}</span> <span class={discret}>· {x.parcours}</span></li>
                      {/each}
                    </ul>
                  {/if}
                </li>
              {/each}
            </ul>
          {/each}
        {/each}
      {/if}
    </main>
    {#if vue === 'parcours'}
      <!-- Créer : dans la bibliothèque seulement, il ne recouvre pas les listes des autres vues -->
      <button type="button" class="{boutonAction} bouton-flottant" onclick={oncreer}>
        <i aria-hidden="true" class="bx bx-plus text-2xl"></i>
        Créer un parcours
      </button>
    {/if}
  {/if}

  {#if enregistre}
    <!-- Juste après l'enregistrement : publier s'il est déjà donné à des classes ; sinon, la vue Classes -->
    <Feuille onfermer={onfermerDernier}>
      <p role="alert" class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">
        « {enregistre.parcours.titre} » enregistré (V{enregistre.parcours.version})
      </p>
      <p class="text-sm">
        {enregistre.classes.length ? `Donné à : ${enregistre.classes.join(', ')}.` : 'Il n’est donné à aucune classe pour l’instant.'}
        Exportez le fichier complet, puis déposez-le dans le dossier partagé.
      </p>
      <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={exporterTout}>Exporter tous les parcours</button>
      <button type="button" class={boutonLien} onclick={() => choisirExport([enregistre.parcours.id])}>Choisir les parcours à exporter</button>
      {#if !enregistre.classes.length}
        <button
          type="button"
          class={boutonLien}
          onclick={() => {
            onfermerDernier()
            vue = 'classes'
          }}>Donner à des classes</button
        >
      {/if}
    </Feuille>
  {:else if feuilleExport}
    <Feuille onfermer={() => (feuilleExport = false)}>
      <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Exporter</p>
      <p class="text-sm">Tous les parcours : le fichier complet du dossier partagé, à reprendre sur un autre appareil ou sur le site. Quelques-uns : un fichier pour un collègue.</p>
      <div class="flex flex-col gap-2 overflow-y-auto" style="max-height: 45vh">
        {#each parNiveau as n (n.niveau)}
          <p class="pl-1 pt-1 text-sm font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct">{n.niveau || 'Sans niveau'}</p>
          <ul class={listeGroupee}>
            {#each n.chapitres.flatMap((c) => c.parcours) as pe (pe.parcours.id)}
              {@const coche = choixExport.includes(pe.parcours.id)}
              <li>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={coche}
                  class={elementListe}
                  onclick={() => (choixExport = coche ? choixExport.filter((id) => id !== pe.parcours.id) : [...choixExport, pe.parcours.id])}
                >
                  <span class="flex flex-col min-w-0">
                    <span class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">{pe.parcours.titre || 'Sans titre'}</span>
                    <span class="truncate {discret}">{pe.parcours.theme}</span>
                  </span>
                  <i aria-hidden="true" class="{icone} {coche ? 'bx-checkbox-checked' : 'bx-checkbox'}"></i>
                </button>
              </li>
            {/each}
          </ul>
        {/each}
      </div>
      <button type="button" class="{boutonAction} w-full disabled:opacity-40" style="min-height: 44px" disabled={!choixExport.length} onclick={exporterChoisis}>
        {choixExport.length === bibliotheque.parcours.length ? 'Exporter tous les parcours' : `Exporter ${choixExport.length} parcours`}
      </button>
      {#if choixExport.length < bibliotheque.parcours.length}
        <button type="button" class={boutonLien} onclick={() => (choixExport = bibliotheque.parcours.map((pe) => pe.parcours.id))}>Tout cocher</button>
      {/if}
    </Feuille>
  {:else if feuilleDossier}
    <Feuille
      onfermer={() => {
        feuilleDossier = false
        modifierLien = false
      }}
    >
      <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Dossier partagé</p>
      {#if modifierLien}
        <ChampTexte id="lien-dossier" titre="Lien du dossier partagé (à donner aux élèves)" bind:valeur={lien} type="url" />
        <button
          type="button"
          class="{boutonAction} w-full disabled:opacity-40"
          style="min-height: 44px"
          disabled={!lien.trim()}
          onclick={() => {
            enregistrerLien()
            feuilleDossier = false
          }}>Enregistrer le lien</button
        >
      {:else}
        <p class="text-sm break-all {discret}">{bibliotheque.lien}</p>
        <button
          type="button"
          class="{boutonAction} w-full"
          style="min-height: 44px"
          onclick={() => {
            feuilleDossier = false
            ouvrirDossier(bibliotheque.lien!)
          }}>Ouvrir le dossier</button
        >
        <button type="button" class={boutonLien} disabled={reprise} onclick={() => reprendreDepuis({ lien: bibliotheque.lien })}>
          <i aria-hidden="true" class="bx bx-sync text-xl"></i> Reprendre les parcours du dossier
        </button>
        {#if messageReprise}<p class="text-sm text-center {discret}" role="status">{messageReprise}</p>{/if}
        <button type="button" class={boutonLien} onclick={() => (modifierLien = true)}>Changer le lien</button>
      {/if}
    </Feuille>
  {:else if feuilleReprendre}
    <Feuille onfermer={() => (feuilleReprendre = false)}>
      <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Reprendre ma bibliothèque</p>
      <p class="text-sm">Depuis un autre appareil ou la page du site : classes, parcours et objectifs sont repris. Rien n’est effacé ici.</p>
      <ChampTexte id="lien-reprise" titre="Lien de votre dossier partagé" bind:valeur={lienReprise} type="url" />
      <button
        type="button"
        class="{boutonAction} w-full disabled:opacity-40"
        style="min-height: 44px"
        disabled={!lienReprise.trim() || reprise}
        onclick={() => reprendreDepuis({ lien: lienReprise.trim() })}>Reprendre depuis ce dossier</button
      >
      <label class="{boutonLien} cursor-pointer">
        <i aria-hidden="true" class="bx bx-file text-xl"></i> Choisir le fichier publié
        <input type="file" accept=".json,application/json" class="hidden" onchange={reprendreFichier} />
      </label>
      {#if messageReprise}<p class="text-sm text-center {discret}" role="status">{messageReprise}</p>{/if}
    </Feuille>
  {:else if feuilleClasse === 'nouvelle'}
    <Feuille onfermer={() => (feuilleClasse = null)}>
      <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Nouvelle classe</p>
      <ChampTexte id="nouvelle-classe" titre="Nom affiché aux élèves" bind:valeur={nouvelleClasse} />
      <button type="button" class="{boutonAction} w-full disabled:opacity-40" style="min-height: 44px" disabled={!nouvelleClasse.trim()} onclick={creerClasse}>
        Ajouter la classe
      </button>
    </Feuille>
  {:else if feuilleClasse === 'actions' && classeVue}
    <Feuille onfermer={() => (feuilleClasse = null)}>
      <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{classeVue}</p>
      <ul class={listeGroupee}>
        {@render action('bx-pencil', 'Renommer la classe', () => {
          nomClasse = classeVue
          feuilleClasse = 'renommer'
        })}
        {@render action('bx-trash', 'Retirer la classe', () => (feuilleClasse = 'retirer'))}
      </ul>
    </Feuille>
  {:else if feuilleClasse === 'renommer' && classeVue}
    <Feuille onfermer={() => (feuilleClasse = null)}>
      <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Renommer {classeVue}</p>
      <ChampTexte id="nom-classe" titre="Nom affiché aux élèves" bind:valeur={nomClasse} />
      <p class="text-sm">Les élèves voient le nouveau nom après la prochaine publication.</p>
      <button
        type="button"
        class="{boutonAction} w-full disabled:opacity-40"
        style="min-height: 44px"
        disabled={!nomClasse.trim() || nomClasse.trim() === classeVue || bibliotheque.classes.some((c) => c.nom === nomClasse.trim())}
        onclick={() => {
          onrenommerClasse(classeVue, nomClasse.trim())
          classeChoisie = nomClasse.trim()
          feuilleClasse = null
        }}>Renommer</button
      >
    </Feuille>
  {:else if feuilleClasse === 'retirer' && classeVue}
    <Feuille onfermer={() => (feuilleClasse = null)}>
      <p role="alert" class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Retirer {classeVue} ?</p>
      <p class="text-sm">Ses parcours restent dans votre bibliothèque. Les élèves les gardent jusqu’à la prochaine publication.</p>
      <div class="flex flex-row gap-3">
        <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={() => (feuilleClasse = null)}>Annuler</button>
        <button
          type="button"
          class="{boutonAction} flex-1"
          style="min-height: 44px"
          onclick={() => {
            onretirerClasse(classeVue)
            classeChoisie = null
            feuilleClasse = null
          }}>Retirer</button
        >
      </div>
    </Feuille>
  {:else if feuilleClasse === 'parcours' && classeVue}
    <Feuille onfermer={() => (feuilleClasse = null)}>
      <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Parcours de {classeVue}</p>
      <div class="flex flex-col gap-2 overflow-y-auto" style="max-height: 55vh">
        {#each parNiveau as n (n.niveau)}
          <p class="pl-1 pt-1 text-sm font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct">{n.niveau || 'Sans niveau'}</p>
          <ul class={listeGroupee}>
            {#each n.chapitres.flatMap((c) => c.parcours) as pe (pe.parcours.id)}
              {@const coche = choix.includes(pe.parcours.id)}
              <li>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={coche}
                  class={elementListe}
                  onclick={() => (choix = coche ? choix.filter((id) => id !== pe.parcours.id) : [...choix, pe.parcours.id])}
                >
                  <span class="flex flex-col min-w-0">
                    <span class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">{pe.parcours.titre || 'Sans titre'}</span>
                    <span class="truncate {discret}">{pe.parcours.theme}</span>
                  </span>
                  <i aria-hidden="true" class="{icone} {coche ? 'bx-checkbox-checked' : 'bx-checkbox'}"></i>
                </button>
              </li>
            {/each}
          </ul>
        {/each}
      </div>
      <button
        type="button"
        class="{boutonAction} w-full"
        style="min-height: 44px"
        onclick={() => {
          onparcoursDeClasse(classeVue, choix)
          feuilleClasse = null
        }}>Enregistrer ({choix.length} parcours)</button
      >
    </Feuille>
  {:else if feuilleObjectif === 'actions' && objectifChoisi}
    <Feuille onfermer={() => (feuilleObjectif = null)}>
      <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{objectifChoisi.libelle}</p>
      <ul class={listeGroupee}>
        {@render action('bx-pencil', 'Renommer', () => {
          libelle = objectifChoisi!.libelle
          feuilleObjectif = 'renommer'
        })}
        {@render action('bx-trash', 'Retirer de la liste', () => {
          onobjectifs(objectifs.filter((o) => o.libelle !== objectifChoisi!.libelle))
          feuilleObjectif = null
        })}
      </ul>
      <p class="text-sm {discret}">Les parcours déjà enregistrés gardent leurs objectifs.</p>
    </Feuille>
  {:else if feuilleObjectif === 'renommer' && objectifChoisi}
    <Feuille onfermer={() => (feuilleObjectif = null)}>
      <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Renommer l’objectif</p>
      <ChampTexte id="libelle-objectif" titre="Libellé vu par les élèves" bind:valeur={libelle} />
      <button
        type="button"
        class="{boutonAction} w-full disabled:opacity-40"
        style="min-height: 44px"
        disabled={!libelle.trim() || libelle.trim() === objectifChoisi.libelle || objectifs.some((o) => o.libelle === libelle.trim())}
        onclick={renommerObjectif}>Renommer</button
      >
    </Feuille>
  {:else if feuilleObjectif === 'importer'}
    <Feuille onfermer={() => (feuilleObjectif = null)}>
      <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Importer des objectifs</p>
      <p class="text-sm">
        Un fichier CSV (colonnes code ; libellé ; niveau ; chapitre) ou un objectif par ligne. Les objectifs déjà présents ne sont pas ajoutés deux fois : importez
        au fil de l’année.
      </p>
      <label class="{boutonInverse} w-full cursor-pointer" style="min-height: 44px">
        <i aria-hidden="true" class="bx bx-file text-xl"></i> Choisir un fichier (.csv, .txt, .json)
        <input type="file" accept=".csv,.txt,.json,text/csv,text/plain,application/json" class="hidden" onchange={importerFichierObjectifs} />
      </label>
      <p class="text-sm font-light text-coopmaths-struct dark:text-coopmathsdark-struct">Niveau (si le fichier ne l’indique pas)</p>
      <div class="flex flex-row gap-2 overflow-x-auto -mx-4 px-4" role="radiogroup" aria-label="Niveau des objectifs">
        {#each NIVEAUX[pays] as n (n)}
          <button type="button" role="radio" aria-checked={niveauImport === n} class={puce(niveauImport === n)} onclick={() => (niveauImport = n)}>{n}</button>
        {/each}
      </div>
      <ChampTexte id="chapitre-import" titre="Chapitre (si le fichier ne l’indique pas)" bind:valeur={chapitreImport} />
      <div class="w-full">
        <label class="font-light text-sm block text-coopmaths-struct dark:text-coopmathsdark-struct" for="collage-objectifs">Ou collez ici (une ligne par objectif, ou un tableau copié)</label>
        <textarea
          id="collage-objectifs"
          rows="5"
          bind:value={collage}
          class="block w-full text-sm border p-2 border-coopmaths-action dark:border-coopmathsdark-action focus:outline-0 focus:ring-0 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        ></textarea>
      </div>
      <button type="button" class="{boutonAction} w-full disabled:opacity-40" style="min-height: 44px" disabled={!collage.trim()} onclick={() => importerTexte(collage)}>
        Ajouter ces objectifs
      </button>
      {#if messageObjectifs}<p class="text-sm text-center {discret}" role="status">{messageObjectifs}</p>{/if}
    </Feuille>
  {/if}
</div>
