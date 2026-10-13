<script lang="ts" module>
  export type Profil = 'eleve' | 'enseignant'
</script>

<script lang="ts">
  import type { InfoMoteur, Pays } from '$lib/moteur'
  import type { Classe } from '$lib/partage'
  import ChampTexte from './ChampTexte.svelte'
  import ChoixRadio from './ChoixRadio.svelte'
  import { boutonAction, boutonInverse, listeGroupee } from './classes'
  import EnTete from './EnTete.svelte'
  import FilAriane from './FilAriane.svelte'


  let {
    profil = $bindable(),
    pays = $bindable(),
    classes,
    onretour,
    onajouter,
    onsynchroniser,
    onretirer,
    onchoisirClasse,
    onexporterSauvegarde,
    onrestaurer,
    moteur,
    miseAJourMoteur,
    onchercherMoteur,
  }: {
    profil: Profil
    pays: Pays
    classes: Classe[]
    onretour: () => void
    onajouter: (lien: string) => Promise<string | null>
    onsynchroniser: () => Promise<void>
    onretirer: (lien: string) => void
    onchoisirClasse: (lien: string, classe: string) => void
    onexporterSauvegarde: () => Promise<string>
    onrestaurer: (texte: string) => Promise<string>
    moteur: InfoMoteur | null
    miseAJourMoteur: string | null // version installée, active au prochain lancement
    onchercherMoteur: (() => Promise<string>) | null // null hors de l'application
  } = $props()

  let messageMoteur = $state('')
  let rechercheMoteur = $state(false)

  let messageSauvegarde = $state('')
  async function restaurer(e: Event) {
    const f = (e.currentTarget as HTMLInputElement).files?.[0]
    if (f) messageSauvegarde = await onrestaurer(await f.text())
  }

  const titreSection = 'pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const texteDiscret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'

  let lien = $state('')
  let messageClasse = $state('')
  let enCours = $state(false)

  async function ajouter() {
    enCours = true
    messageClasse = (await onajouter(lien.trim())) ?? ''
    if (!messageClasse) lien = ''
    enCours = false
  }

  async function synchroniser() {
    enCours = true
    await onsynchroniser()
    enCours = false
  }


  const date = (iso?: string) => (iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '')
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete />
  <FilAriane titre="Réglages" {onretour} />

  <main class="flex-1 flex flex-col gap-8 p-4 zone-sure-bas">
    <section>
      <h2 class={titreSection}>Profil</h2>
      <ChoixRadio
        nom="profil"
        bind:valeur={profil}
        options={[
          { libelle: 'Élève', valeur: 'eleve' },
          { libelle: 'Enseignant', valeur: 'enseignant' },
        ]}
      />
    </section>
    <section>
      <h2 class={titreSection}>Pays</h2>
      <ChoixRadio
        nom="pays"
        bind:valeur={pays}
        options={[
          { libelle: 'France', valeur: 'FR' },
          { libelle: 'Suisse', valeur: 'CH' },
        ]}
      />
    </section>

    <section class="flex flex-col gap-3">
      <h2 class={titreSection}>Dossiers partagés</h2>
      {#if classes.length}
        <ul class={listeGroupee}>
          {#each classes as c (c.lien)}
            <li class="flex flex-row items-center justify-between gap-3 px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
              <div class="min-w-0">
                <div class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{c.nom || 'Classe à choisir'}</div>
                {#if c.disponibles.length > 1}
                  <ChoixRadio
                    nom="classe-{c.lien}"
                    valeur={c.nom}
                    options={c.disponibles.map((d) => ({ libelle: d, valeur: d }))}
                    onchange={(v) => onchoisirClasse(c.lien, v)}
                  />
                {/if}
                <div class={texteDiscret}>
                  {c.parcours.length} parcours{c.maj ? ` · mis à jour le ${date(c.maj)}` : ''}
                </div>
                {#if c.erreur}
                  <div class="text-sm font-bold text-coopmaths-action dark:text-coopmathsdark-action">{c.erreur}</div>
                {/if}
              </div>
              <button
                type="button"
                aria-label="Retirer le dossier {c.nom}"
                class="shrink-0 p-1 text-coopmaths-action dark:text-coopmathsdark-action"
                onclick={() => onretirer(c.lien)}
              >
                <i aria-hidden="true"
 class="bx bx-trash text-2xl"></i>
              </button>
            </li>
          {/each}
        </ul>
        <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" disabled={enCours} onclick={synchroniser}>
          Mettre à jour les parcours
        </button>
      {/if}
      <ChampTexte
        id="lien-classe"
        titre="Lien de partage du dossier"
        bind:valeur={lien}
        type="url"
      />
      {#if messageClasse}
        <p class="text-sm font-bold text-coopmaths-action dark:text-coopmathsdark-action" role="alert">{messageClasse}</p>
      {/if}
      <button
        type="button"
        class="{boutonAction} w-full disabled:opacity-40"
        style="min-height: 44px"
        disabled={!lien.trim() || enCours}
        onclick={ajouter}
      >
        Ajouter le dossier
      </button>
    </section>

    {#if moteur}
      <section class="flex flex-col gap-3">
        <h2 class={titreSection}>Moteur MathALÉA</h2>
        <p class="pl-2 text-sm font-light text-coopmaths-corpus dark:text-coopmathsdark-corpus">
          Version {moteur.version} ({moteur.source === 'livré' ? 'livrée avec l’application' : 'mise à jour téléchargée'})
        </p>
        {#if miseAJourMoteur}
          <p class="pl-2 text-sm font-bold text-coopmaths-struct dark:text-coopmathsdark-struct" role="status">
            Version {miseAJourMoteur} installée : elle sera utilisée au prochain lancement.
          </p>
        {/if}
        {#if onchercherMoteur}
          <button
            type="button"
            class="{boutonInverse} w-full disabled:opacity-40"
            style="min-height: 44px"
            disabled={rechercheMoteur}
            onclick={async () => {
              rechercheMoteur = true
              messageMoteur = await onchercherMoteur!()
              rechercheMoteur = false
            }}
          >
            Rechercher une mise à jour
          </button>
          {#if messageMoteur}<p class="pl-2 {texteDiscret}" role="status">{messageMoteur}</p>{/if}
        {/if}
      </section>
    {/if}

    <section class="flex flex-col gap-3">
      <h2 class={titreSection}>Sauvegarde</h2>
      <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={async () => (messageSauvegarde = await onexporterSauvegarde())}>
        Exporter une sauvegarde
      </button>
      <label class="{boutonInverse} w-full cursor-pointer" style="min-height: 44px; display: flex; align-items: center; justify-content: center">
        Restaurer une sauvegarde
        <input type="file" accept=".json,application/json" class="hidden" onchange={restaurer} />
      </label>
      {#if messageSauvegarde}<p class={texteDiscret} role="status">{messageSauvegarde}</p>{/if}
    </section>
  </main>
</div>
