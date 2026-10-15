<script lang="ts" module>
  export type Profil = 'eleve' | 'enseignant'
</script>

<script lang="ts">
  import { NIVEAUX, type InfoMoteur, type Pays } from '$lib/moteur'
  import type { Preferences } from '$lib/bibliotheque'
  import type { Classe } from '$lib/partage'
  import ChampTexte from './ChampTexte.svelte'
  import ChoixRadio from './ChoixRadio.svelte'
  import { boutonAction, boutonInverse, listeGroupee } from './classes'
  import EnTete from './EnTete.svelte'
  import Feuille from './Feuille.svelte'
  import { choisirTheme, theme, type PreferenceTheme } from '$lib/theme.svelte'
  import { version } from '../../../package.json'

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
    onresumer,
    onannulerRestauration,
    moteur,
    miseAJourMoteur,
    onchercherMoteur,
    preferences,
    onpreferences,
    demonstration,
    onchargerDemonstration,
    onretirerDemonstration,
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
    onresumer: (texte: string) => { creeeLe: string; dossiers: number; parcoursEnseignant: number; passages: number; enseignant: boolean }
    onannulerRestauration: (() => Promise<string>) | null // la dernière restauration peut être annulée
    moteur: InfoMoteur | null
    miseAJourMoteur: string | null // version installée, active au prochain lancement
    onchercherMoteur: (() => Promise<string>) | null // null hors de l'application
    preferences: Partial<Preferences> // valeurs de départ d'un nouveau parcours (derniers choix)
    onpreferences: (p: Preferences) => void
    demonstration: boolean // parcours de démonstration chargés
    onchargerDemonstration: () => Promise<string>
    onretirerDemonstration: () => Promise<string>
  } = $props()

  let messageDemonstration = $state('')
  // Retrait d'un dossier suivi : confirmé, les résultats restent
  let aRetirer: Classe | null = $state(null)

  // Création de parcours : mêmes valeurs par défaut que parcoursVide()
  const pref = $derived<Preferences>({ niveau: '', difficulte: 1, presentation: 'une_question_par_page', correction: 'question', ...preferences })
  const changer = (modif: Partial<Preferences>) => onpreferences({ ...pref, ...modif })
  const puce = (actif: boolean) =>
    `rounded-full px-3 py-1.5 text-sm border border-coopmaths-action dark:border-coopmathsdark-action ${
      actif
        ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
        : 'text-coopmaths-action dark:text-coopmathsdark-action'
    }`

  // Chaque réglage est enregistré aussitôt ; après un changement, un bouton ramène à l'accueil
  const etat = () => JSON.stringify([profil, pays, theme.preference, classes.map((c) => [c.lien, c.nom]), preferences])
  const depart = etat()
  const modifie = $derived(etat() !== depart)

  let messageMoteur = $state('')
  let rechercheMoteur = $state(false)

  let messageSauvegarde = $state('')
  // Restauration : aperçu de la sauvegarde et confirmation avant de remplacer quoi que ce soit
  let aRestaurer: { texte: string; resume: ReturnType<typeof onresumer> } | null = $state(null)
  async function restaurer(e: Event) {
    const champ = e.currentTarget as HTMLInputElement
    const f = champ.files?.[0]
    champ.value = ''
    if (!f) return
    const texte = await f.text()
    try {
      aRestaurer = { texte, resume: onresumer(texte) }
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

    {#if profil === 'enseignant'}
      <section class="flex flex-col gap-2">
        <h2 class={titreSection}>Parcours de démonstration</h2>
        <p class="pl-2 {texteDiscret}">
          Une liste simple, des paliers et des ceintures, avec objectifs et pauses : une classe « Démonstration » pour essayer comme un élève, et les mêmes parcours
          dans votre bibliothèque pour voir comment ils sont faits.
        </p>
        {#if demonstration}
          <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={async () => (messageDemonstration = await onretirerDemonstration())}>
            Retirer les parcours de démonstration
          </button>
        {:else}
          <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={async () => (messageDemonstration = await onchargerDemonstration())}>
            Charger les parcours de démonstration
          </button>
        {/if}
        {#if messageDemonstration}<p class="pl-2 {texteDiscret}" role="status">{messageDemonstration}</p>{/if}
      </section>

      <section class="flex flex-col gap-2">
        <h2 class={titreSection}>Nouveau parcours</h2>
        <p class="pl-2 {texteDiscret}">Valeurs de départ, reprises de votre dernier parcours enregistré.</p>
        <p class="pl-2 text-sm font-light text-coopmaths-struct dark:text-coopmathsdark-struct">Niveau</p>
        <div class="flex flex-row flex-wrap gap-2 pl-2" role="radiogroup" aria-label="Niveau d’un nouveau parcours">
          {#each NIVEAUX[pays] as n (n)}
            <button type="button" role="radio" aria-checked={pref.niveau === n} class={puce(pref.niveau === n)} onclick={() => changer({ niveau: n })}>{n}</button>
          {/each}
        </div>
        <p class="pl-2 pt-2 text-sm font-light text-coopmaths-struct dark:text-coopmathsdark-struct">Pages</p>
        <ChoixRadio
          nom="pref-presentation"
          valeur={pref.presentation}
          onchange={(v) => changer({ presentation: v })}
          options={[
            { libelle: 'Tous les exercices sur une page', valeur: 'liste_exos' as const },
            { libelle: 'Une page par exercice', valeur: 'un_exo_par_page' as const },
            { libelle: 'Une page par question', valeur: 'une_question_par_page' as const },
          ]}
        />
        <p class="pl-2 pt-2 text-sm font-light text-coopmaths-struct dark:text-coopmathsdark-struct">Validation et correction</p>
        <ChoixRadio
          nom="pref-validation"
          valeur={pref.correction}
          onchange={(v) => changer({ correction: v })}
          options={[
            { libelle: 'Après chaque question', valeur: 'question' as const },
            { libelle: 'À la fin de chaque page', valeur: 'page' as const },
            { libelle: 'À la fin du parcours', valeur: 'parcours' as const },
          ]}
        />
      </section>
    {/if}

    <section class="flex flex-col gap-1">
      <h2 class={titreSection}>À propos</h2>
      <p class="pl-2 {texteDiscret}">
        MathALÉA {version} · licence AGPL-3.0 ·
        <a href="https://coopmaths.fr" class="text-coopmaths-action dark:text-coopmathsdark-action" onclick={ouvrirCoopmaths}>coopmaths.fr</a>
      </p>
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
  {#if aRestaurer}
    {@const r = aRestaurer.resume}
    <Feuille onfermer={() => (aRestaurer = null)}>
      <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Remplacer les données de cet appareil ?</p>
      <p class="text-sm">
        Sauvegarde du {new Date(r.creeeLe).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })} :
        {r.dossiers} dossier{r.dossiers > 1 ? 's' : ''} suivi{r.dossiers > 1 ? 's' : ''}, {r.passages} passage{r.passages > 1 ? 's' : ''} terminé{r.passages > 1 ? 's' : ''}{r.enseignant
          ? `, ${r.parcoursEnseignant} parcours dans la bibliothèque`
          : ''}.
      </p>
      <p class="text-sm">Tout ce qui est sur cet appareil est remplacé. L’état actuel est gardé : « Annuler la dernière restauration » le rétablit.</p>
      <div class="flex flex-row gap-3">
        <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={() => (aRestaurer = null)}>Annuler</button>
        <button
          type="button"
          class="{boutonAction} flex-1"
          style="min-height: 44px"
          onclick={async () => {
            const texte = aRestaurer!.texte
            aRestaurer = null
            messageSauvegarde = await onrestaurer(texte)
          }}>Remplacer</button
        >
      </div>
    </Feuille>
  {/if}
</div>
