<script lang="ts">
  // Onglet Créer de l'accueil (réglage Enseignant) : état de la diffusion et Publier, mise en route du
  // dossier partagé, parcours par classe dans l'ordre vu par les élèves.
  import type { Parcours } from '$lib/catalogue'
  import { aExporter, nbAExporter, parcoursDeClasse, type Bibliotheque, type ParcoursEnseignant } from '$lib/bibliotheque'
  import { partageNatif } from '$lib/fichiers'
  import ChampTexte from './ChampTexte.svelte'
  import { boutonAction, boutonInverse, boutonLien, elementListe, listeGroupee } from './classes'
  import EnTete from './EnTete.svelte'
  import Feuille from './Feuille.svelte'
  import Tuile from './Tuile.svelte'
  import { retourSi } from '$lib/navigation.svelte'

  let {
    bibliotheque,
    modeles,
    onouvrir,
    oncreer,
    onediter,
    onlien,
    onexporter,
    onreglages,
    dernier = null,
    onfermerDernier,
    onexporterUn,
    onimporter,
    ondeplacer,
  }: {
    bibliotheque: Bibliotheque
    modeles: Parcours[] // parcours des dossiers suivis et fichiers importés que l'enseignant n'a pas déjà
    onouvrir: (pe: ParcoursEnseignant) => void
    oncreer: () => void
    onediter: (p: Parcours) => void
    onlien: (lien: string) => void
    onexporter: () => Promise<string>
    dernier?: string | null // parcours qui vient d'être enregistré
    onfermerDernier: () => void
    onexporterUn: (id: string) => Promise<string>
    onimporter: (texte: string) => Promise<{ message: string; parcours: Parcours[] }>
    ondeplacer: (id: string, classe: string, sens: -1 | 1) => void
    onreglages: () => void
  } = $props()

  const titreSection = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  const texte = 'text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus'
  let vue: 'accueil' | 'modeles' = $state('accueil')
  retourSi(() => vue === 'modeles', () => (vue = 'accueil'))
  let message = $state('')
  let lien = $state('')
  let modifierLien = $state(false)
  // Dossier partagé : ouvrir ou changer le lien, dans un panneau du bas
  let feuilleDossier = $state(false)
  retourSi(() => modifierLien, () => (modifierLien = false))
  // Classe affichée (pastilles), la première par défaut
  let classeChoisie: string | null = $state(null)
  const classesAvecParcours = $derived(bibliotheque.classes.filter((c) => parcoursDeClasse(bibliotheque, c.nom).length))
  const classeVue = $derived(classesAvecParcours.find((c) => c.nom === classeChoisie) ?? classesAvecParcours[0])
  $effect.pre(() => {
    lien = bibliotheque.lien ?? ''
  })
  const nb = $derived(nbAExporter(bibliotheque))
  // Parcours qui partent aux élèves : donnés à une classe, avec un titre et des exercices
  const prets = $derived(bibliotheque.parcours.filter((pe) => pe.classes.length && pe.parcours.titre.trim() && pe.parcours.etapes.length).length)
  const enregistre = $derived(dernier ? bibliotheque.parcours.find((pe) => pe.parcours.id === dernier) : undefined)
  const verbe = partageNatif ? 'Partager' : 'Télécharger'
  let messageImport = $state('')

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

  async function publier() {
    message = await onexporter()
    onfermerDernier()
  }

  async function exporterDernier() {
    const id = enregistre!.parcours.id
    onfermerDernier()
    message = await onexporterUn(id)
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

  const sousTitre = (pe: ParcoursEnseignant, classe: string) =>
    [pe.parcours.theme, `${pe.parcours.etapes.length} exercice${pe.parcours.etapes.length > 1 ? 's' : ''}`, aExporter(pe, classe) ? 'pas encore publié' : '']
      .filter(Boolean)
      .join(' · ')
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  {#if vue === 'modeles'}
    <EnTete titre="Éditer un parcours existant" onretour={() => (vue = 'accueil')} />
  {:else}
    <EnTete>
      {#snippet droite()}
        <button type="button" aria-label="Réglages" onclick={onreglages} class="bouton-icone">
          <i aria-hidden="true" class="bx bx-cog text-2xl"></i>
        </button>
      {/snippet}
    </EnTete>
  {/if}

  {#if vue === 'modeles'}
    <div class="flex flex-col gap-3 p-4 avec-onglets">
      {#if bibliotheque.parcours.length}
        <h2 class={titreSection}>Mes parcours</h2>
        {#each bibliotheque.parcours as pe (pe.parcours.id)}
          <Tuile
            icon={pe.parcours.icone}
            title={pe.parcours.titre || 'Sans titre'}
            subtitle={[pe.parcours.theme, pe.classes.join(', ')].filter(Boolean).join(' · ')}
            badge="V{pe.parcours.version}"
            onclick={() => onouvrir(pe)}
          />
        {/each}
      {/if}
      {#if modeles.length}
        <h2 class={titreSection}>Dossiers suivis et fichiers importés</h2>
        {#each modeles as p (p.id)}
          <Tuile icon={p.icone} title={p.titre} subtitle="{p.niveau} · {p.theme}" badge="V{p.version}" onclick={() => onediter(p)} />
        {/each}
      {/if}
      {#if !bibliotheque.parcours.length && !modeles.length}
        <p class="py-4 text-center {discret}">
          Importez un fichier de parcours, ou ajoutez le dossier partagé d’un collègue dans les Réglages.
        </p>
      {/if}
      <label class="{boutonInverse} w-full text-center cursor-pointer" style="min-height: 44px; display: flex; align-items: center; justify-content: center">
        Importer un fichier de parcours (.json)
        <input type="file" accept=".json,application/json" class="hidden" onchange={importer} />
      </label>
      {#if messageImport}<p class={discret} role="status">{messageImport}</p>{/if}
    </div>
  {:else}
    <main class="flex-1 flex flex-col gap-3 p-4 avec-onglets avec-bouton-flottant">
      {#if !bibliotheque.lien}
        <!-- Mise en route : sans dossier partagé, rien n'arrive aux élèves -->
        <section class="flex flex-col gap-3 rounded-xl p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark" aria-label="Mise en route">
          <h2 class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Mise en route</h2>
          <ol class="flex flex-col gap-3 {texte}">
            <li class="flex flex-row gap-2">
              <i aria-hidden="true" class="bx {bibliotheque.parcours.length ? 'bx-check-circle' : 'bx-circle'} text-xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
              <span>Créez un parcours et choisissez ses classes.</span>
            </li>
            <li class="flex flex-row gap-2">
              <i aria-hidden="true" class="bx bx-circle text-xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
              <div class="flex flex-col gap-2 min-w-0 flex-1">
                <span>Sur votre drive (kDrive, Dropbox, Nextcloud, Google Drive), créez un dossier partagé par lien et collez ce lien. Les élèves l’ajoutent dans leur app.</span>
                <ChampTexte id="lien-dossier" titre="Lien du dossier partagé" bind:valeur={lien} type="url" />
                {#if lien.trim()}
                  <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={enregistrerLien}>Enregistrer le lien</button>
                {/if}
              </div>
            </li>
            <li class="flex flex-row gap-2">
              <i aria-hidden="true" class="bx bx-circle text-xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
              <span>Publiez, puis déposez le fichier dans ce dossier.</span>
            </li>
          </ol>
          {#if prets}
            <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={publier}>Publier pour les élèves</button>
          {/if}
          {#if message}<p class={discret} role="status">{message}</p>{/if}
        </section>
      {:else}
        <!-- État de la diffusion : une ligne, et Publier s'il reste quelque chose à envoyer -->
        <p class="flex flex-row items-center gap-2 px-1 {texte}" role="status">
          <i aria-hidden="true" class="bx {nb ? 'bx-error-circle' : 'bx-check-circle'} text-xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
          {#if nb}
            {nb === 1 ? 'Un parcours n’est pas encore chez les élèves.' : `${nb} parcours ne sont pas encore chez les élèves.`}
          {:else if prets}
            Tout est à jour chez les élèves.
          {:else}
            Créez un parcours : il sera publié dans votre dossier partagé.
          {/if}
        </p>
        {#if nb}
          <button type="button" class="{boutonAction} w-full" style="min-height: 44px" disabled={!prets} onclick={publier}>Publier</button>
        {/if}
        {#if message}<p class={discret} role="status">{message}</p>{/if}
      {/if}

      <ul class={listeGroupee}>
        {#if bibliotheque.lien}
          <li>
            <button type="button" class={elementListe} onclick={() => (feuilleDossier = true)}>
              <span class="flex flex-row items-center gap-3 min-w-0">
                <i aria-hidden="true" class="bx bx-folder text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
                <span class="flex flex-col min-w-0">
                  <span class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">Dossier partagé</span>
                  <span class="truncate {discret}">{hote(bibliotheque.lien)}</span>
                </span>
              </span>
              <i aria-hidden="true" class="bx bx-chevron-right text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
            </button>
          </li>
        {/if}
        <li>
          <button type="button" class={elementListe} onclick={() => (vue = 'modeles')}>
            <span class="flex flex-row items-center gap-3 min-w-0">
              <i aria-hidden="true" class="bx bx-folder-open text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
              <span class="flex flex-col min-w-0">
                <span class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">Éditer un parcours existant</span>
                <span class="truncate {discret}">Dossiers suivis, fichiers de collègues</span>
              </span>
            </span>
            <i aria-hidden="true" class="bx bx-chevron-right text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
          </button>
        </li>
      </ul>

      {#if classesAvecParcours.length > 1}
        <div class="flex flex-row gap-2 overflow-x-auto -mx-4 px-4 pt-2" role="tablist" aria-label="Classes">
          {#each classesAvecParcours as c (c.nom)}
            <button
              type="button"
              role="tab"
              aria-selected={c.nom === classeVue?.nom}
              class="presse shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold
              {c.nom === classeVue?.nom
                ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
                : 'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus dark:text-coopmathsdark-corpus'}"
              onclick={() => (classeChoisie = c.nom)}
            >
              {c.nom}
            </button>
          {/each}
        </div>
      {:else if classeVue}
        <h2 class={titreSection}>{classeVue.nom}</h2>
      {/if}
      {#if classeVue}
        {@const c = classeVue}
        {@const ps = parcoursDeClasse(bibliotheque, c.nom)}
        {#each ps as pe, i (pe.parcours.id)}
          <div class="flex flex-row items-center gap-2">
            {#if ps.length > 1}
              <div class="flex flex-col">
                <button
                  type="button"
                  aria-label="Monter {pe.parcours.titre} dans {c.nom}"
                  class="text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-40"
                  disabled={i === 0}
                  onclick={() => ondeplacer(pe.parcours.id, c.nom, -1)}
                >
                  <i aria-hidden="true" class="bx bx-chevron-up text-2xl"></i>
                </button>
                <button
                  type="button"
                  aria-label="Descendre {pe.parcours.titre} dans {c.nom}"
                  class="text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-40"
                  disabled={i === ps.length - 1}
                  onclick={() => ondeplacer(pe.parcours.id, c.nom, 1)}
                >
                  <i aria-hidden="true" class="bx bx-chevron-down text-2xl"></i>
                </button>
              </div>
            {/if}
            <div class="min-w-0 flex-1">
              <Tuile icon={pe.parcours.icone} title={pe.parcours.titre} subtitle={sousTitre(pe, c.nom)} badge="V{pe.parcours.version}" onclick={() => onouvrir(pe)} />
            </div>
          </div>
        {/each}
      {/if}
    </main>
    <button type="button" class="{boutonAction} bouton-flottant" onclick={oncreer}>
      <i aria-hidden="true" class="bx bx-plus text-2xl"></i>
      Créer un parcours
    </button>
  {/if}

  {#if enregistre}
    <!-- Juste après « Valider » : publier, sinon rien n'arrive aux élèves -->
    <Feuille onfermer={onfermerDernier}>
      <p role="alert" class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">
        « {enregistre.parcours.titre} » enregistré (V{enregistre.parcours.version})
      </p>
      {#if prets}
        <p class="text-sm">Publiez pour que vos élèves le reçoivent.</p>
        <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={publier}>Publier pour les élèves</button>
      {/if}
      <button type="button" class={boutonLien} onclick={exporterDernier}>Exporter ce parcours seul</button>
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
        <button type="button" class={boutonLien} onclick={() => (modifierLien = true)}>Changer le lien</button>
      {/if}
    </Feuille>
  {/if}
</div>
