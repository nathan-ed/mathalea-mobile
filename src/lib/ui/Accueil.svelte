<script lang="ts" module>
  export interface Resume {
    fait: number
    sur: number
    enCours: boolean
    pourcentage: number | null // dernier parcours complet terminé
    paliers?: { reussis: number; total: number } // parcours à paliers : sa progression, pas un pourcentage
  }

  export interface Source {
    id: string
    nom: string
    parcours: import('$lib/catalogue').Parcours[]
  }

  // Position dans la page d'un degré de l'Explorer, retrouvée au retour d'un parcours
  let defilementNiveau: { niveau: string | null; y: number } | null = null
</script>

<script lang="ts">
  import { quand } from '$lib/revisions'
  // Organisation des chapitres des parcours ajoutés quand l'élève n'a pas de classe
  const SOURCE_EXPLORER = 'explorer'
  import { organisationDe } from '$lib/catalogue'
  import { onMount, type Snippet } from 'svelte'
  import type { Parcours } from '$lib/catalogue'
  import type { NiveauExplorer } from '$lib/explorer'
  import ChampTexte from './ChampTexte.svelte'
  import ContenuClasse, { type Organisation } from './ContenuClasse.svelte'
  import { boutonAction, boutonLien } from './classes'
  import EnTete from './EnTete.svelte'
  import BarreOnglets from './BarreOnglets.svelte'
  import Tuile from './Tuile.svelte'
  import { retourAccueil, retourSi } from '$lib/navigation.svelte'

  let {
    sources,
    explorer,
    etatExplorer = 'lu',
    catalogueRecu = true,
    onrelireExplorer,
    ajoutes,
    aChoisir,
    organisations,
    resumes,
    epingles,
    caches = [],
    oncacher,
    onglet = $bindable('mes'),
    niveau = $bindable(null),
    suivi,
    fiches,
    onouvrir,
    oncontinuer,
    onreglages,
    onscanner,
    revisions = null,
    onrevisions,
    ontest,
    resumeTest = '',
    onajouter,
    onchoisirClasse,
    onorganiser,
    onepingler,
    dejaAjoute,
    retirable,
    onajouterPlusieurs,
    onretirerPlusieurs,
    sansLien = false,
    onsansLien,
  }: {
    sources: Source[]
    explorer: NiveauExplorer[] // parcours de l'équipe MathALÉA du pays choisi, par degré et chapitre
    etatExplorer?: 'lecture' | 'lu' | 'injoignable' // dernière lecture des dossiers de l'Explorer
    catalogueRecu?: boolean // l'appareil a déjà reçu le catalogue une fois
    onrelireExplorer?: () => void
    ajoutes: Parcours[] // parcours du catalogue ajoutés à l'accueil
    aChoisir: { lien: string; disponibles: string[] }[] // dossiers à plusieurs classes, classe pas encore choisie
    organisations: Record<string, Organisation>
    resumes: Record<string, Resume>
    epingles: string[]
    /** Accueil : parcours cachés par l'élève (rangés en bas, à remettre d'un toucher) */
    caches?: string[]
    oncacher?: (p: Parcours) => void
    onglet?: 'mes' | 'explorer' | 'suivi' | 'fiches'
    niveau?: string | null // Explorer : degré ouvert (gardé au retour d'un parcours)
    suivi: Snippet
    fiches?: Snippet // fiches de cours de l'élève (fiches.ts)
    onouvrir: (p: Parcours) => void
    oncontinuer: (p: Parcours) => void
    onreglages: () => void
    onscanner?: () => void // QR code d'une session partagée ou d'une classe
    revisions?: { dus: number; prochaine: string | null; enCours: boolean } | null // révisions espacées (null : rien de terminé)
    onrevisions?: () => void
    ontest?: () => void // Teste ton niveau (moteur prêt)
    resumeTest?: string
    onajouter: (lien: string) => Promise<string | null>
    onchoisirClasse: (lien: string, classe: string) => void
    onorganiser: (source: string, o: Organisation) => void
    onepingler: (p: Parcours) => void
    dejaAjoute: (p: Parcours) => boolean // Explorer : déjà à l'accueil
    retirable?: (p: Parcours) => boolean // Explorer : ajouté depuis l'Explorer, il peut être retiré de l'accueil
    onajouterPlusieurs: (liste: Parcours[]) => Promise<void> // Explorer : ajout de plusieurs parcours d'un coup
    onretirerPlusieurs?: (liste: Parcours[]) => Promise<void> // Explorer : parcours retirés de l'accueil
    sansLien?: boolean // l'élève a dit ne pas avoir de lien : le formulaire n'est plus proposé d'office
    onsansLien?: (v: boolean) => void
  } = $props()

  let lien = $state('')
  let messageLien = $state('')
  let ajoutEnCours = $state(false)
  async function ajouter() {
    ajoutEnCours = true
    messageLien = (await onajouter(lien.trim())) ?? ''
    if (!messageLien) lien = ''
    ajoutEnCours = false
  }
  const organisation = (id: string): Organisation => organisations[id] ?? { ordre: [], fermes: [] }

  const titreSection = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const difficultes = ['Découverte', 'Entraînement', 'Approfondissement']
  const sousTitre = (p: Parcours) =>
    resumes[p.id]?.enCours
      ? `En cours · question ${Math.min(resumes[p.id].fait + 1, resumes[p.id].sur)} sur ${resumes[p.id].sur}`
      : resumes[p.id]?.paliers
        ? `${p.niveau} · ${organisationDe(p)}`
        : `${p.niveau} · ${organisationDe(p) || difficultes[p.difficulte - 1]}`
  const badge = (p: Parcours) => {
    const r = resumes[p.id]
    if (r?.enCours) return `${r.fait}/${r.sur}`
    // Paliers réussis : un palier fait seul ne dit rien du parcours entier
    if (r?.paliers) return r.paliers.reussis ? `${r.paliers.reussis}/${r.paliers.total}` : ''
    return r?.pourcentage != null ? `${r.pourcentage} %` : ''
  }
  // La tuile « En cours » reprend la séance ; ailleurs, la page du parcours (Continuer,
  // autres paliers, supprimer la tentative) : quitter une séance ramène ici, pas à cette page
  const ouvrir = (p: Parcours) => onouvrir(p)

  let recherche = $state('')
  // Classe affichée quand il y en a plusieurs (pastilles) : la première par défaut
  let classeChoisie: string | null = $state(null)
  const classeVue = $derived(sources.find((s) => s.id === classeChoisie) ?? sources[0])

  // Parcours de l'élève : ceux de ses dossiers et ceux ajoutés depuis Explorer
  const tous = $derived.by(() => {
    const vus = new Map<string, Parcours>()
    for (const s of sources) for (const p of s.parcours) vus.set(p.id, p)
    for (const p of ajoutes) if (!vus.has(p.id)) vus.set(p.id, p)
    return [...vus.values()]
  })
  const visible = (p: Parcours) => !caches.includes(p.id)
  const cachesListe = $derived(tous.filter((p) => !visible(p)))
  // Ajoutés depuis l'Explorer et pas cachés : sans eux, pas de titre « Mes parcours » vide
  const ajoutesVisibles = $derived(ajoutes.filter(visible))
  let cachesOuverts = $state(false)
  // Parcours ajoutés depuis l'Explorer : rangés avec ceux de la classe, par chapitre (boussole sur leur tuile)
  const idsAjoutes = $derived(ajoutes.map((p) => p.id))
  const avecAjoutes = (parcours: Parcours[]) => [...parcours, ...ajoutes.filter((a) => !parcours.some((p) => p.id === a.id))].filter(visible)
  // Boussole seulement sur ceux qui ne viennent pas aussi du dossier de la classe
  const depuisExplorer = (parcours: Parcours[]) => idsAjoutes.filter((id) => !parcours.some((p) => p.id === id))
  const niveauOuvert = $derived(explorer.find((n) => n.niveau === niveau) ?? null)
  const enCours = $derived(tous.filter((p) => visible(p) && resumes[p.id]?.enCours))
  const epinglesVisibles = $derived(
    epingles.map((id) => tous.find((p) => p.id === id)).filter((p): p is Parcours => !!p && visible(p) && !resumes[p.id]?.enCours),
  )
  const normaliser = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const trouves = $derived(
    recherche.trim()
      ? tous.filter((p) =>
          normaliser(`${p.titre} ${p.theme} ${p.niveau} ${p.etapes.map((e) => `${e.id} ${e.titre}`).join(' ')}`).includes(
            normaliser(recherche.trim()),
          ),
        )
      : [],
  )

  const nbParcours = (n: NiveauExplorer) => n.chapitres.reduce((a, c) => a + c.parcours.length, 0)
  const termines = (s: Source) => s.parcours.filter((p) => resumes[p.id]?.pourcentage != null).length

  // Onglet d'accueil, où l'app s'ouvre : « retour » y ramène avant de quitter l'app
  const aRefermer = () => retourAccueil({ niveau, onglet, depart: 'mes' })
  retourSi(
    () => aRefermer() !== null,
    () => {
      if (aRefermer() === 'niveau') niveau = null
      else changerOnglet('mes')
    },
  )

  function changerOnglet(o: typeof onglet) {
    onglet = o
    niveau = null
    recherche = ''
  }

  // Explorer : la page du degré garde sa position au retour d'un parcours
  const ouvrirDepuisNiveau = (p: Parcours) => {
    defilementNiveau = { niveau, y: scrollY }
    ouvrir(p)
  }
  onMount(() => {
    if (onglet === 'explorer' && niveau && defilementNiveau?.niveau === niveau) {
      const y = defilementNiveau.y
      requestAnimationFrame(() => scrollTo(0, y))
    }
    defilementNiveau = null
  })

  // Explorer : chaque tuile du degré a son « + » (ajouter d'un toucher, « ✓ » pour retirer) ;
  // « Tout ajouter » met d'un coup le reste du degré sur l'accueil
  let messageAjout = $state('')
  const peutRetirer = (p: Parcours) => !!onretirerPlusieurs && !!retirable?.(p)
  const restantsDegre = $derived(niveauOuvert ? niveauOuvert.chapitres.flatMap((c) => c.parcours).filter((p) => !dejaAjoute(p)) : [])
  const pluriel = (n: number, mot: string) => `${n} parcours ${mot}${n > 1 ? 's' : ''}`
  async function toutAjouter() {
    const ajout = restantsDegre
    await onajouterPlusieurs(ajout)
    messageAjout = `${pluriel(ajout.length, 'ajouté')} à ton accueil.`
  }
  async function basculerUn(p: Parcours) {
    messageAjout = ''
    if (!dejaAjoute(p)) await onajouterPlusieurs([p])
    else if (peutRetirer(p)) await onretirerPlusieurs?.([p])
  }

  $effect(() => {
    void niveau
    messageAjout = ''
  })
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  {#if onglet === 'explorer' && niveauOuvert}
    <EnTete titre={niveauOuvert.niveau} onretour={() => (niveau = null)} />
  {:else}
    <EnTete>
      {#snippet droite()}
        {#if onscanner}
          <button type="button" aria-label="Scanner le QR code d’une session ou d’une classe" onclick={onscanner} class="bouton-icone bouton-icone-etroit">
            <i aria-hidden="true" class="bx bx-qr-scan text-2xl"></i>
          </button>
        {/if}
        <button type="button" aria-label="Réglages" onclick={onreglages} class="bouton-icone bouton-icone-etroit">
          <i aria-hidden="true" class="bx bx-cog text-2xl"></i>
        </button>
      {/snippet}
    </EnTete>
  {/if}

  <main class="flex-1 avec-onglets">
    {#if onglet === 'mes'}
      <div class="liste-tuiles flex flex-col gap-3 p-4">
        {#if tous.length}
        <label
          class="w-full flex flex-row items-center gap-2 rounded-full px-4 py-3
          bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
          text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
        >
          <i aria-hidden="true"
 class="bx bx-search"></i>
          <input
            type="search"
            aria-label="Rechercher un parcours"
            bind:value={recherche}
            class="w-full bg-transparent border-0 p-0 focus:outline-0 focus:ring-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          />
        </label>
        {/if}

        {#if recherche.trim()}
          {#each trouves as p (p.id)}
            <Tuile icon={p.icone} title={p.titre} subtitle={sousTitre(p)} badge={badge(p)} onclick={() => ouvrir(p)} />
          {:else}
            <p class="py-8 text-center font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
              Aucun parcours ne correspond.
            </p>
          {/each}
        {:else}
          {#if revisions && onrevisions}
            <Tuile
              icon="bx-revision"
              title="Révisions"
              subtitle={revisions.enCours
                ? 'Révision commencée'
                : revisions.dus
                  ? 'À revoir aujourd’hui'
                  : revisions.prochaine
                    ? `Prochaine révision ${quand(revisions.prochaine)}`
                    : 'Aucun chapitre choisi'}
              onclick={onrevisions}
            />
          {/if}
          {#if enCours.length}
            <h2 class={titreSection}>En cours</h2>
            {#each enCours as p (p.id)}
              <Tuile icon={p.icone} title={p.titre} subtitle={sousTitre(p)} badge={badge(p)} onclick={() => oncontinuer(p)} epingle={epingles.includes(p.id)} onepingler={() => onepingler(p)} oncacher={oncacher ? () => oncacher(p) : undefined} />
            {/each}
          {/if}
          {#if epinglesVisibles.length}
            <h2 class={titreSection}>Épinglés</h2>
            {#each epinglesVisibles as p (p.id)}
              <Tuile icon={p.icone} title={p.titre} subtitle={sousTitre(p)} badge={badge(p)} onclick={() => ouvrir(p)} epingle={epingles.includes(p.id)} onepingler={() => onepingler(p)} oncacher={oncacher ? () => oncacher(p) : undefined} />
            {/each}
          {/if}
          {#each aChoisir as d (d.lien)}
            <h2 class={titreSection}>Choisis ta classe</h2>
            {#each d.disponibles as nomClasse (nomClasse)}
              <Tuile icon="bx-group" title={nomClasse} onclick={() => onchoisirClasse(d.lien, nomClasse)} />
            {/each}
          {/each}
          {#if sources.length === 1}
            <!-- Une seule classe : son contenu tout de suite -->
            <ContenuClasse
              nom={sources[0].nom}
              parcours={avecAjoutes(sources[0].parcours)}
              organisation={organisation(sources[0].id)}
              {sousTitre}
              {badge}
              onouvrir={ouvrir}
              onorganiser={(o) => onorganiser(sources[0].id, o)}
              {epingles}
              {onepingler}
              {oncacher}
              explorer={depuisExplorer(sources[0].parcours)}
            />
          {:else if sources.length > 1}
            <!-- Plusieurs classes : pastilles pour passer de l'une à l'autre -->
            <div class="flex flex-row gap-2 overflow-x-auto -mx-4 px-4" role="tablist" aria-label="Classes">
              {#each sources as s (s.id)}
                <button
                  type="button"
                  role="tab"
                  aria-selected={s.id === classeVue?.id}
                  class="presse shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold
                  {s.id === classeVue?.id
                    ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
                    : 'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus dark:text-coopmathsdark-corpus'}"
                  onclick={() => (classeChoisie = s.id)}
                >
                  {s.nom}
                </button>
              {/each}
            </div>
            {#if classeVue}
              {#key classeVue.id}
                <ContenuClasse
                  nom="Chapitres"
                  parcours={avecAjoutes(classeVue.parcours)}
                  organisation={organisation(classeVue.id)}
                  {sousTitre}
                  {badge}
                  onouvrir={ouvrir}
                  onorganiser={(o) => onorganiser(classeVue!.id, o)}
                  {epingles}
                  {onepingler}
                  {oncacher}
                  explorer={depuisExplorer(classeVue.parcours)}
                />
              {/key}
            {/if}
          {:else if ajoutesVisibles.length}
            <!-- Sans classe : les parcours ajoutés depuis l'Explorer, rangés de la même façon -->
            <ContenuClasse
              nom="Mes parcours"
              parcours={ajoutesVisibles}
              organisation={organisation(SOURCE_EXPLORER)}
              {sousTitre}
              {badge}
              onouvrir={ouvrir}
              onorganiser={(o) => onorganiser(SOURCE_EXPLORER, o)}
              {epingles}
              {onepingler}
              {oncacher}
              explorer={idsAjoutes}
            />
          {/if}
          {#if sources.length === 0 && aChoisir.length === 0 && sansLien}
            {#if !ajoutesVisibles.length}
              <Tuile icon="bx-compass" title="Explorer les parcours" subtitle="Parcours proposés par l’équipe MathALÉA" onclick={() => changerOnglet('explorer')} />
            {/if}
            <button type="button" class="{boutonLien} w-full" onclick={() => onsansLien?.(false)}>
              <i aria-hidden="true" class="bx bx-link text-xl"></i> Ajouter le lien de ma classe
            </button>
          {:else if sources.length === 0 && aChoisir.length === 0}
            <h2 class={titreSection}>Ajoute le dossier de ta classe</h2>
            <!-- Formulaire : Entrée ajoute le dossier ; le lien reste si l'ajout échoue -->
            <form
              class="flex flex-col gap-3"
              onsubmit={(e) => {
                e.preventDefault()
                if (lien.trim() && !ajoutEnCours) ajouter()
              }}
            >
              <ChampTexte id="lien-accueil" titre="Lien de partage donné par ton enseignant" bind:valeur={lien} type="url" />
              {#if messageLien}
                <p class="text-sm font-bold text-coopmaths-action dark:text-coopmathsdark-action" role="alert">{messageLien}</p>
              {/if}
              <button type="submit" class="{boutonAction} w-full disabled:opacity-40" style="min-height: 44px" disabled={!lien.trim() || ajoutEnCours} aria-busy={ajoutEnCours}>
                {ajoutEnCours ? 'Ajout du dossier…' : 'Ajouter le dossier'}
              </button>
              {#if onscanner}
                <button type="button" class="{boutonLien} w-full" onclick={onscanner}>
                  <i aria-hidden="true" class="bx bx-qr-scan text-xl"></i> Scanner le QR code de ma classe
                </button>
              {/if}
              {#if onsansLien}
                <!-- Pas de lien : l'élève travaille avec l'Explorer ; un QR code de classe suffit aussi -->
                <button type="button" class="{boutonLien} w-full" onclick={() => onsansLien(true)}>Je n’ai pas de lien</button>
              {/if}
            </form>
          {/if}
          {#if cachesListe.length && oncacher}
            <!-- Parcours cachés par l'élève : repliés en bas, l'œil ouvert les remet à leur place -->
            <button
              type="button"
              aria-expanded={cachesOuverts}
              class="presse flex flex-row items-center justify-between rounded-lg pr-4 text-left"
              onclick={() => (cachesOuverts = !cachesOuverts)}
            >
              <span class={titreSection}>Parcours cachés · {cachesListe.length}</span>
              <i aria-hidden="true" class="bx {cachesOuverts ? 'bx-chevron-up' : 'bx-chevron-down'} text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
            </button>
            {#if cachesOuverts}
              {#each cachesListe as p (p.id)}
                <Tuile icon={p.icone} title={p.titre} subtitle={sousTitre(p)} onclick={() => ouvrir(p)} cache oncacher={() => oncacher(p)} />
              {/each}
            {/if}
          {/if}
        {/if}
      </div>
    {:else if onglet === 'explorer' && niveauOuvert}
      <!-- Tous les parcours du degré, rangés sous leur chapitre -->
      <div class="liste-tuiles flex flex-col gap-3 p-4">
        <p class="pl-2 text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus">
          Touche <i aria-hidden="true" class="bx bx-plus-circle align-middle text-lg text-coopmaths-action dark:text-coopmathsdark-action"></i><span class="sr-only">le bouton plus</span>
          pour mettre un parcours sur ton accueil, à nouveau pour l’en retirer.
        </p>
        {#if restantsDegre.length > 1}
          <button type="button" class="{boutonLien} self-start" onclick={toutAjouter}>
            <i aria-hidden="true" class="bx bx-list-plus"></i> Tout ajouter ({restantsDegre.length})
          </button>
        {/if}
        {#if messageAjout}
          <p class="pl-2 text-sm font-bold text-coopmaths-action dark:text-coopmathsdark-action" role="status">{messageAjout}</p>
        {/if}
        {#each niveauOuvert.chapitres as c (c.theme)}
          <h2 class={titreSection}>{c.theme}</h2>
          {#each c.parcours as p (p.id)}
            <Tuile
              icon={p.icone}
              title={p.titre}
              subtitle={sousTitre(p)}
              badge={badge(p)}
              onclick={() => ouvrirDepuisNiveau(p)}
              onajouter={() => basculerUn(p)}
              ajoute={dejaAjoute(p)}
              ajoutFige={!peutRetirer(p)}
            />
          {/each}
        {/each}
      </div>
    {:else if onglet === 'explorer'}
      <div class="liste-tuiles flex flex-col gap-3 p-4">
        {#if ontest}
          <Tuile icon="bx-timer" title="Teste ton niveau" subtitle={resumeTest} onclick={ontest} />
        {/if}
        <h2 class={titreSection}>Parcours proposés par l’équipe MathALÉA</h2>
        {#if etatExplorer === 'injoignable' && explorer.length}
          <!-- Copie de l'appareil affichée : les nouvelles versions attendent la connexion -->
          <div class="flex flex-row items-center gap-2 pl-2 text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light" role="status">
            <i aria-hidden="true" class="bx bx-wifi-off text-lg shrink-0"></i>
            <span class="min-w-0 flex-1">Connecte-toi à internet pour recevoir les nouvelles versions des parcours.</span>
            {#if onrelireExplorer}
              <button type="button" class="presse shrink-0 px-2 font-semibold text-coopmaths-action dark:text-coopmathsdark-action" style="min-height: 44px" onclick={onrelireExplorer}>Réessayer</button>
            {/if}
          </div>
        {/if}
        {#each explorer as n (n.niveau)}
          <Tuile
            icon="bx-book-content"
            title={n.niveau}
            subtitle={n.chapitres.length > 1 ? `${n.chapitres.length} chapitres · ${nbParcours(n)} parcours` : `${nbParcours(n)} parcours`}
            onclick={() => (niveau = n.niveau)}
          />
        {:else}
          {#if etatExplorer === 'lecture' && !catalogueRecu}
            <p class="py-8 text-center font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest" role="status">Téléchargement des parcours…</p>
          {:else if etatExplorer === 'injoignable'}
            <div class="flex flex-col items-center gap-3 py-8 text-center" role="status">
              <i aria-hidden="true" class="bx bx-wifi-off text-4xl text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"></i>
              <p class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">Connecte-toi à internet pour télécharger les parcours.</p>
              {#if onrelireExplorer}
                <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={onrelireExplorer}>Réessayer</button>
              {/if}
            </div>
          {:else}
            <p class="py-8 text-center font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
              Aucun parcours proposé pour le moment.
            </p>
          {/if}
        {/each}
      </div>
    {:else if onglet === 'fiches' && fiches}
      {@render fiches()}
    {:else}
      {@render suivi()}
    {/if}
  </main>

  <BarreOnglets
    onglets={[
      { cle: 'mes' as const, libelle: 'Mes parcours', icone: 'bx-book-open', iconeActive: 'bxs-book-open' },
      { cle: 'explorer' as const, libelle: 'Explorer', icone: 'bx-compass', iconeActive: 'bxs-compass' },
      { cle: 'suivi' as const, libelle: 'Suivi', icone: 'bx-bar-chart-alt-2', iconeActive: 'bxs-bar-chart-alt-2' },
      ...(fiches ? [{ cle: 'fiches' as const, libelle: 'Fiches', icone: 'bx-bookmark', iconeActive: 'bxs-bookmark' }] : []),
    ]}
    actif={onglet}
    onchoisir={(o) => {
      changerOnglet(o)
      scrollTo(0, 0)
    }}
  />
</div>
