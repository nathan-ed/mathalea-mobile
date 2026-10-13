<script lang="ts">
  // Accueil de l'enseignant : parcours par classe, export, classes partagées, sessions communes
  import type { Parcours } from '$lib/catalogue'
  import { aExporter, nbAExporter, parcoursDeClasse, type Bibliotheque, type ParcoursEnseignant } from '$lib/bibliotheque'
  import { partageNatif } from '$lib/fichiers'
  import ChampTexte from './ChampTexte.svelte'
  import { boutonAction, boutonInverse } from './classes'
  import EnTete from './EnTete.svelte'
  import FilAriane from './FilAriane.svelte'
  import Tuile from './Tuile.svelte'

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
  }: {
    bibliotheque: Bibliotheque
    modeles: Parcours[]
    onouvrir: (pe: ParcoursEnseignant) => void
    oncreer: () => void
    onediter: (p: Parcours) => void
    onlien: (lien: string) => void
    onexporter: () => Promise<string>
    dernier?: string | null // parcours qui vient d'être enregistré
    onfermerDernier: () => void
    onexporterUn: (id: string) => Promise<string>
    onimporter: (texte: string) => Promise<string>
    onreglages: () => void
  } = $props()

  const titreSection = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  let vue: 'accueil' | 'modeles' = $state('accueil')
  let messageExport = $state('')
  let lien = $state('')
  $effect.pre(() => {
    lien = bibliotheque.lien ?? ''
  })
  const nb = $derived(nbAExporter(bibliotheque))
  const nbParcours = $derived(bibliotheque.parcours.filter((pe) => pe.classes.length).length)
  const enregistre = $derived(dernier ? bibliotheque.parcours.find((pe) => pe.parcours.id === dernier) : undefined)
  let messageDernier = $state('')
  let messageImport = $state('')
  async function importer(e: Event) {
    const f = (e.currentTarget as HTMLInputElement).files?.[0]
    if (f) messageImport = await onimporter(await f.text())
    ;(e.currentTarget as HTMLInputElement).value = ''
  }

  async function ouvrirDossier(lien: string) {
    try {
      const { openUrl } = await import('@tauri-apps/plugin-opener')
      await openUrl(lien)
    } catch {
      window.open(lien, '_blank', 'noopener')
    }
  }

  const sousTitre = (pe: ParcoursEnseignant, classe: string) =>
    [pe.parcours.theme, `${pe.parcours.etapes.length} exercice${pe.parcours.etapes.length > 1 ? 's' : ''}`, aExporter(pe, classe) ? 'à exporter' : '']
      .filter(Boolean)
      .join(' · ')

</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete>
    {#snippet gauche()}
      <button type="button" aria-label="Réglages" onclick={onreglages} class="shrink-0 p-1 text-coopmaths-action dark:text-coopmathsdark-action">
        <i aria-hidden="true"
 class="bx bx-cog text-3xl"></i>
      </button>
    {/snippet}
  </EnTete>

  {#if vue === 'modeles'}
    <FilAriane titre="Éditer un parcours existant" onretour={() => (vue = 'accueil')} />
    <div class="flex flex-col gap-3 p-4">
      {#each modeles as p (p.id)}
        <Tuile icon={p.icone} title={p.titre} subtitle="{p.niveau} · {p.theme}" badge="V{p.version}" onclick={() => onediter(p)} />
      {:else}
        <p class="py-4 text-center {discret}">Ajoutez le dossier partagé d’un collègue dans les Réglages, ou importez un fichier de parcours.</p>
      {/each}
      <label class="{boutonInverse} w-full text-center cursor-pointer" style="min-height: 44px; display: flex; align-items: center; justify-content: center">
        Importer un fichier de parcours (.json)
        <input type="file" accept=".json,application/json" class="hidden" onchange={importer} />
      </label>
      {#if messageImport}<p class={discret} role="status">{messageImport}</p>{/if}
    </div>
  {:else}
    <main class="flex-1 flex flex-col gap-3 p-4 zone-sure-bas">
      {#if enregistre}
        <section class="flex flex-col gap-3 rounded-xl p-4 border border-coopmaths-action dark:border-coopmathsdark-action" aria-label="Parcours enregistré">
          <div class="flex flex-row items-start justify-between gap-2">
            <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">
              « {enregistre.parcours.titre} » enregistré (V{enregistre.parcours.version})
            </p>
            <button type="button" aria-label="Fermer" class="p-1 text-coopmaths-action dark:text-coopmathsdark-action" onclick={onfermerDernier}>
              <i aria-hidden="true" class="bx bx-x text-2xl"></i>
            </button>
          </div>
          <p class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus">
            Pour que les élèves le reçoivent, déposez le fichier dans votre dossier partagé (en remplaçant celui du même nom).
          </p>
          <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={async () => (messageDernier = await onexporter())}>
            {partageNatif ? 'Partager' : 'Télécharger'} tous les parcours ({nbParcours})
          </button>
          <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={async () => (messageDernier = await onexporterUn(enregistre!.parcours.id))}>
            {partageNatif ? 'Partager' : 'Télécharger'} ce parcours seul
          </button>
          {#if bibliotheque.lien}
            <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => ouvrirDossier(bibliotheque.lien!)}>Ouvrir le dossier</button>
          {/if}
          {#if messageDernier}<p class={discret} role="status">{messageDernier}</p>{/if}
        </section>
      {/if}
      <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={oncreer}>Créer un parcours</button>
      <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => (vue = 'modeles')}>Éditer un parcours existant</button>

      <h2 class={titreSection}>Partage</h2>
      <ChampTexte id="lien-dossier" titre="Lien du dossier partagé (à donner aux élèves)" bind:valeur={lien} type="url" />
      {#if lien.trim() !== (bibliotheque.lien ?? '')}
        <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => onlien(lien.trim())}>Enregistrer le lien</button>
      {/if}
      <div class="grid gap-3" style="grid-template-columns: repeat({bibliotheque.lien ? 2 : 1}, minmax(0, 1fr));">
        <button
          type="button"
          class="{nb ? boutonAction : boutonInverse} w-full disabled:opacity-40"
          style="min-height: 44px"
          disabled={bibliotheque.parcours.length === 0}
          onclick={async () => (messageExport = await onexporter())}
        >
          Exporter{nb ? ` (${nb} modifié${nb > 1 ? 's' : ''})` : ''}
        </button>
        {#if bibliotheque.lien}
          <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => ouvrirDossier(bibliotheque.lien!)}>Ouvrir le dossier</button>
        {/if}
      </div>
      {#if messageExport}<p class={discret} role="status">{messageExport}</p>{/if}

      {#each bibliotheque.classes as c (c.nom)}
        {@const ps = parcoursDeClasse(bibliotheque, c.nom)}
        <h2 class={titreSection}>{c.nom}</h2>
        {#each ps as pe (pe.parcours.id)}
          <Tuile icon={pe.parcours.icone} title={pe.parcours.titre} subtitle={sousTitre(pe, c.nom)} badge="V{pe.parcours.version}" onclick={() => onouvrir(pe)} />
        {/each}
      {/each}

    </main>
  {/if}
</div>
