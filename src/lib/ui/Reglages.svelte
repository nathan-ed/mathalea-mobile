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
  import ConfirmationRestauration from './ConfirmationRestauration.svelte'
  import Feuille from './Feuille.svelte'
  import { choisirTheme, theme, type PreferenceTheme } from '$lib/theme.svelte'
  import { version } from '../../../package.json'
  import { ouvrirLien } from '$lib/fichiers'
  import type { BilanFusion } from '$lib/fusion'
  import type { resumerSauvegarde } from '$lib/sauvegarde'
  const URL_GUIDE = 'https://coopmaths.forge.apps.education.fr/mathalea-mobile/'

  let {
    profil = $bindable(),
    pays = $bindable(),
    classes,
    onretour,
    onajouter,
    onsynchroniser,
    onretirer,
    onchoisirClasse,
    lienDrive,
    dossiersAReprendre = [],
    onreprendreDossier,
    onexporterSauvegarde,
    onrestaurer,
    onresumer,
    onfusionner,
    onapercuFusion,
    onannulerRestauration,
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
    lienDrive?: string // enseignant : lien de son drive
    dossiersAReprendre?: string[] // enseignant : dossiers dont un parcours manque à sa bibliothèque
    onreprendreDossier?: (lien: string, parcoursSeuls: boolean) => Promise<string>
    onexporterSauvegarde: () => Promise<string>
    onrestaurer: (texte: string) => Promise<string>
    onresumer: typeof resumerSauvegarde
    onfusionner: (texte: string) => Promise<string>
    onapercuFusion: (texte: string) => Promise<BilanFusion>
    onannulerRestauration: (() => Promise<string>) | null // la dernière restauration peut être annulée
    moteur: InfoMoteur | null
    miseAJourMoteur: string | null // version installée, active au prochain lancement
    onchercherMoteur: (() => Promise<string>) | null // null hors de l'application
  } = $props()

  // Retrait d'un dossier suivi : confirmé, les résultats restent
  let aRetirer: Classe | null = $state(null)
  // Enseignant : reprise d'un dossier suivi (message par lien)
  let reprise = $state(false)
  let messagesReprise: Record<string, string> = $state({})
  async function reprendreDossier(lien: string, parcoursSeuls: boolean) {
    reprise = true
    messagesReprise[lien] = await onreprendreDossier!(lien, parcoursSeuls)
    reprise = false
  }

  // Chaque réglage est enregistré aussitôt ; après un changement, un bouton ramène à l'accueil
  const etat = () => JSON.stringify([profil, pays, theme.preference, classes.map((c) => [c.lien, c.nom])])
  const depart = etat()
  const modifie = $derived(etat() !== depart)

  let messageMoteur = $state('')
  let rechercheMoteur = $state(false)

  let messageSauvegarde = $state('')
  // Restauration : aperçu de la sauvegarde et confirmation avant de remplacer quoi que ce soit
  let aRestaurer: { texte: string; resume: ReturnType<typeof onresumer>; fusion: BilanFusion | null } | null = $state(null)
  // Politique de confidentialité : page livrée avec l'app (static/confidentialite.html,
  // la même qu'en ligne), affichée sans quitter l'app
  let confidentialite: string | null = $state(null)
  async function ouvrirConfidentialite() {
    const page = new DOMParser().parseFromString(await (await fetch('/confidentialite.html')).text(), 'text/html')
    page.querySelector('h1')?.remove()
    confidentialite = page.querySelector('main')?.innerHTML ?? ''
  }
  /** Liens du texte (courriel de contact) : ouverts hors de l'app, jamais dans sa page */
  function liensExternes(bloc: HTMLElement) {
    const ouvrir = (e: MouseEvent) => {
      const lien = (e.target as HTMLElement).closest('a')
      if (!lien) return
      e.preventDefault()
      void ouvrirLien(lien.href)
    }
    bloc.addEventListener('click', ouvrir)
    return { destroy: () => bloc.removeEventListener('click', ouvrir) }
  }
  async function restaurer(e: Event) {
    const champ = e.currentTarget as HTMLInputElement
    const f = champ.files?.[0]
    champ.value = ''
    if (!f) return
    const texte = await f.text()
    try {
      const resume = onresumer(texte)
      aRestaurer = { texte, resume, fusion: await onapercuFusion(texte).catch(() => null) }
    } catch (err) {
      messageSauvegarde = (err as Error).message
    }
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


  /** Lien vers coopmaths.fr : navigateur du téléphone dans l'app */
  async function ouvrirCoopmaths(e: MouseEvent) {
    e.preventDefault()
    try {
      const { openUrl } = await import('@tauri-apps/plugin-opener')
      await openUrl('https://coopmaths.fr')
    } catch {
      window.open('https://coopmaths.fr', '_blank', 'noopener')
    }
  }

  const date = (iso?: string) => (iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '')
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre="Réglages" {onretour}>
    {#snippet droite()}
      {#if modifie}
        <button type="button" class="shrink-0 px-2 py-1 text-sm font-bold text-coopmaths-action dark:text-coopmathsdark-action" onclick={onretour}>
          Enregistrer et quitter
        </button>
      {/if}
    {/snippet}
  </EnTete>

  <main class="flex-1 flex flex-col gap-8 p-4 zone-sure-bas">
    <section>
      <h2 class={titreSection}>Programme</h2>
      <ChoixRadio
        nom="pays"
        bind:valeur={pays}
        options={[
          { libelle: 'France', valeur: 'FR' },
          { libelle: 'Suisse', valeur: 'CH' },
        ]}
      />
    </section>

    <section>
      <h2 class={titreSection}>Apparence</h2>
      <ChoixRadio
        nom="theme"
        bind:valeur={() => theme.preference, (p: PreferenceTheme) => choisirTheme(p)}
        options={[
          { libelle: 'Comme le téléphone', valeur: 'telephone' },
          { libelle: 'Clair', valeur: 'clair' },
          { libelle: 'Sombre', valeur: 'sombre' },
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
                <!-- L'enseignant voit tout le dossier (toutes ses classes) ; l'élève choisit la sienne -->
                <div class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">
                  {profil === 'enseignant' ? c.disponibles.join(', ') || c.nom : c.nom || 'Classe à choisir'}
                </div>
                {#if c.disponibles.length > 1 && profil !== 'enseignant'}
                  <ChoixRadio
                    nom="classe-{c.lien}"
                    valeur={c.nom}
                    options={c.disponibles.map((d) => ({ libelle: d, valeur: d }))}
                    onchange={(v) => onchoisirClasse(c.lien, v)}
                  />
                {/if}
                <div class={texteDiscret}>
                  {profil === 'enseignant' ? new Set([...c.parcours, ...(c.fichier ?? []).flatMap((f) => f.parcours)].map((p) => p.id)).size : c.parcours.length} parcours{c.maj
                    ? ` · mis à jour le ${date(c.maj)}`
                    : ''}
                </div>
                {#if c.erreur}
                  <div class="text-sm font-bold text-coopmaths-action dark:text-coopmathsdark-action">{c.erreur}</div>
                {/if}
                {#if profil === 'enseignant'}
                  {#if c.lien === lienDrive}
                    <div class={texteDiscret}>Votre drive</div>
                  {:else if dossiersAReprendre.includes(c.lien) && onreprendreDossier}
                    <!-- Dossier suivi : le reprendre comme le sien, ou seulement ses parcours (collègue) -->
                    <div class="flex flex-row flex-wrap gap-2 pt-2">
                      <button type="button" class="{boutonInverse} disabled:opacity-40" style="min-height: 40px" disabled={reprise} onclick={() => reprendreDossier(c.lien, false)}>
                        Classes et parcours
                      </button>
                      <button type="button" class="{boutonInverse} disabled:opacity-40" style="min-height: 40px" disabled={reprise} onclick={() => reprendreDossier(c.lien, true)}>
                        Seulement les parcours
                      </button>
                    </div>
                  {/if}
                  {#if messagesReprise[c.lien]}<div class={texteDiscret} role="status">{messagesReprise[c.lien]}</div>{/if}
                {/if}
              </div>
              <button
                type="button"
                aria-label="Retirer le dossier {c.nom}"
                class="bouton-icone"
                onclick={() => (aRetirer = c)}
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
        aria-busy={enCours}
        onclick={ajouter}
      >
        Ajouter le dossier
      </button>
    </section>


    <section class="flex flex-col gap-3">
      <h2 class={titreSection}>Sauvegarde</h2>
      <p class="pl-2 {texteDiscret}">Pour changer d’appareil : exportez une sauvegarde, envoyez le fichier sur le nouvel appareil, puis touchez « Récupérer mes données » à son premier lancement. Pour travailler sur deux appareils : « Ajouter ou restaurer une sauvegarde », puis « Fusionner », réunit ce qui a été fait sur l’autre.</p>
      <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={async () => (messageSauvegarde = await onexporterSauvegarde())}>
        Exporter une sauvegarde
      </button>
      <label class="{boutonInverse} w-full cursor-pointer" style="min-height: 44px; display: flex; align-items: center; justify-content: center">
        Ajouter ou restaurer une sauvegarde
        <input type="file" accept=".json,application/json" class="hidden" onchange={restaurer} />
      </label>
      {#if onannulerRestauration}
        <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={async () => (messageSauvegarde = await onannulerRestauration!())}>
          Annuler la dernière restauration
        </button>
      {/if}
      {#if messageSauvegarde}<p class={texteDiscret} role="status">{messageSauvegarde}</p>{/if}
    </section>

    <section>
      <h2 class={titreSection}>Enseignant</h2>
      <label
        class="flex flex-row items-center justify-between gap-4 rounded-xl px-4 py-3
        bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
      >
        <span class="flex flex-col gap-1 min-w-0">
          <span class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Je suis enseignant</span>
          <span class="text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
            Ajoute l’onglet Créer pour préparer des parcours et les publier à vos classes.
          </span>
        </span>
        <input
          type="checkbox"
          role="switch"
          class="interrupteur shrink-0"
          checked={profil === 'enseignant'}
          onchange={(e) => (profil = e.currentTarget.checked ? 'enseignant' : 'eleve')}
        />
      </label>
    </section>

    <section class="flex flex-col gap-1">
      <h2 class={titreSection}>À propos</h2>
      <p class="pl-2 {texteDiscret}">
        MathALÉA {version} · licence AGPL-3.0 ·
        <a href="https://coopmaths.fr" class="text-coopmaths-action dark:text-coopmathsdark-action" onclick={ouvrirCoopmaths}>coopmaths.fr</a>
      </p>
      {#if moteur}
        <p class="pl-2 {texteDiscret}">
          Moteur MathALÉA {moteur.version} ({moteur.source === 'livré' ? 'livré avec l’application' : 'mise à jour téléchargée'})
        </p>
        {#if miseAJourMoteur}
          <p class="pl-2 text-sm font-bold text-coopmaths-struct dark:text-coopmathsdark-struct" role="status">
            Moteur {miseAJourMoteur} installé : il sera utilisé au prochain lancement.
          </p>
        {/if}
        {#if onchercherMoteur}
          <button
            type="button"
            class="self-start pl-2 text-sm text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-40"
            style="min-height: 44px"
            disabled={rechercheMoteur}
            onclick={async () => {
              rechercheMoteur = true
              messageMoteur = await onchercherMoteur!()
              rechercheMoteur = false
            }}>Rechercher une mise à jour du moteur</button
          >
          {#if messageMoteur}<p class="pl-2 {texteDiscret}" role="status">{messageMoteur}</p>{/if}
        {/if}
      {/if}
      <!-- Guide en ligne (Pages de la forge), dans le navigateur -->
      <button type="button" class="self-start pl-2 text-sm text-coopmaths-action dark:text-coopmathsdark-action" style="min-height: 44px" onclick={() => void ouvrirLien(URL_GUIDE)}
        >Guide d’utilisation</button
      >
      <button type="button" class="self-start pl-2 text-sm text-coopmaths-action dark:text-coopmathsdark-action" style="min-height: 44px" onclick={ouvrirConfidentialite}
        >Politique de confidentialité</button
      >
    </section>
  </main>
  {#if aRetirer}
    {@const c = aRetirer}
    <Feuille onfermer={() => (aRetirer = null)}>
      <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Retirer le dossier {c.nom || ''} ?</p>
      <p class="text-sm">Ses parcours disparaissent de l’accueil. Les résultats et le suivi restent sur cet appareil ; le dossier se rajoute avec son lien.</p>
      <div class="flex flex-row gap-3">
        <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={() => (aRetirer = null)}>Annuler</button>
        <button
          type="button"
          class="{boutonAction} flex-1"
          style="min-height: 44px"
          onclick={() => {
            onretirer(c.lien)
            aRetirer = null
          }}>Retirer</button
        >
      </div>
    </Feuille>
  {/if}
  {#if confidentialite !== null}
    <Feuille onfermer={() => (confidentialite = null)}>
      <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Politique de confidentialité</p>
      <!-- Page de l'app elle-même (static/confidentialite.html) -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <div class="politique text-sm" use:liensExternes>{@html confidentialite}</div>
      <button type="button" class="{boutonInverse} shrink-0" style="min-height: 44px" onclick={() => (confidentialite = null)}>Fermer</button>
    </Feuille>
  {/if}
  {#if aRestaurer}
    <ConfirmationRestauration
      resume={aRestaurer.resume}
      remplacer
      fusion={aRestaurer.fusion}
      onfusionner={async () => {
        const texte = aRestaurer!.texte
        aRestaurer = null
        messageSauvegarde = await onfusionner(texte)
      }}
      onannuler={() => (aRestaurer = null)}
      onconfirmer={async () => {
        const texte = aRestaurer!.texte
        aRestaurer = null
        messageSauvegarde = await onrestaurer(texte)
      }}
    />
  {/if}
</div>
