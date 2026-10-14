<script lang="ts">
  // Accueil de l'enseignant : état de la diffusion et Publier, mise en route du
  // dossier partagé, parcours par classe dans l'ordre vu par les élèves.
  import type { Parcours } from '$lib/catalogue'
  import { aExporter, nbAExporter, parcoursDeClasse, type Bibliotheque, type ParcoursEnseignant } from '$lib/bibliotheque'
  import { partageNatif } from '$lib/fichiers'
  import ChampTexte from './ChampTexte.svelte'
  import { boutonAction, boutonInverse } from './classes'
  import EnTete from './EnTete.svelte'
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
  const carte = 'flex flex-col gap-3 rounded-xl p-4 border border-coopmaths-action dark:border-coopmathsdark-action'
  let vue: 'accueil' | 'modeles' = $state('accueil')
  retourSi(() => vue === 'modeles', () => (vue = 'accueil'))
  let message = $state('')
  let lien = $state('')
  let modifierLien = $state(false)
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

  function enregistrerLien() {
    onlien(lien.trim())
    modifierLien = false
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
    <div class="flex flex-col gap-3 p-4">
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
    <main class="flex-1 flex flex-col gap-3 p-4 zone-sure-bas">
      {#if !bibliotheque.lien}
        <!-- Mise en route : sans dossier partagé, rien n'arrive aux élèves -->
        <section class={carte} aria-label="Mise en route">
          <h2 class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Mise en route</h2>
          {#if enregistre}
            <p class={texte}>« {enregistre.parcours.titre} » enregistré (V{enregistre.parcours.version}).</p>
          {/if}
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
              <span>Publiez, puis déposez le fichier parcours-mathalea.json dans ce dossier.</span>
            </li>
          </ol>
          {#if prets}
            <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={publier}>Publier pour les élèves</button>
          {/if}
          {#if enregistre}
            <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={async () => (message = await onexporterUn(enregistre!.parcours.id))}>
              Exporter ce parcours
            </button>
          {/if}
          {#if message}<p class={discret} role="status">{message}</p>{/if}
        </section>
      {:else}
        <!-- État de la diffusion : un seul geste, Publier -->
        <section class={nb ? carte : 'flex flex-col gap-3 rounded-xl p-4 border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest'} aria-label="Publication">
          {#if enregistre}
            <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">
              « {enregistre.parcours.titre} » enregistré (V{enregistre.parcours.version}).
            </p>
          {/if}
          <p class="flex flex-row items-center gap-2 {texte}" role="status">
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
            <p class={discret}>
              {partageNatif ? 'Publier ouvre le partage : choisissez l’app de votre drive' : 'Publier enregistre parcours-mathalea.json : déposez-le'} dans le dossier partagé, en remplaçant l’ancien.
            </p>
          {/if}
          <div class="grid gap-3" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
            <button type="button" class="{nb ? boutonAction : boutonInverse} w-full disabled:opacity-40" style="min-height: 44px" disabled={!prets} onclick={publier}>
              Publier
            </button>
            <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => ouvrirDossier(bibliotheque.lien!)}>Ouvrir le dossier</button>
          </div>
          {#if enregistre}
            <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={async () => (message = await onexporterUn(enregistre!.parcours.id))}>
              Exporter ce parcours
            </button>
          {/if}
          {#if message}<p class={discret} role="status">{message}</p>{/if}
          {#if modifierLien}
            <ChampTexte id="lien-dossier" titre="Lien du dossier partagé (à donner aux élèves)" bind:valeur={lien} type="url" />
            <button type="button" class="{boutonInverse} w-full disabled:opacity-40" style="min-height: 44px" disabled={!lien.trim()} onclick={enregistrerLien}>
              Enregistrer le lien
            </button>
          {:else}
            <button type="button" class="flex flex-row items-center gap-2 text-left {discret}" onclick={() => (modifierLien = true)}>
              <span class="min-w-0 truncate">Dossier partagé : {bibliotheque.lien}</span>
              <span class="shrink-0 font-bold text-coopmaths-action dark:text-coopmathsdark-action">Modifier</span>
            </button>
          {/if}
        </section>
      {/if}

      <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={oncreer}>Créer un parcours</button>
      <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => (vue = 'modeles')}>Éditer un parcours existant</button>

      {#each bibliotheque.classes as c (c.nom)}
        {@const ps = parcoursDeClasse(bibliotheque, c.nom)}
        {#if ps.length}
          <h2 class={titreSection}>{c.nom}</h2>
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
      {/each}
    </main>
  {/if}
</div>
