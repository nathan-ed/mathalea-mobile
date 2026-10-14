<script lang="ts" module>
  export interface Resume {
    fait: number
    sur: number
    enCours: boolean
    pourcentage: number | null // dernier parcours complet terminé
  }

  export interface Source {
    id: string
    nom: string
    parcours: import('$lib/catalogue').Parcours[]
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { Parcours } from '$lib/catalogue'
  import ChampTexte from './ChampTexte.svelte'
  import ContenuClasse, { type Organisation } from './ContenuClasse.svelte'
  import { boutonAction } from './classes'
  import EnTete from './EnTete.svelte'
  import BarreOnglets from './BarreOnglets.svelte'
  import Tuile from './Tuile.svelte'
  import { retourSi } from '$lib/navigation.svelte'

  let {
    sources,
    catalogue,
    ajoutes,
    aChoisir,
    organisations,
    resumes,
    epingles,
    onglet = $bindable('mes'),
    suivi,
    onouvrir,
    oncontinuer,
    onreglages,
    onajouter,
    onchoisirClasse,
    onorganiser,
  }: {
    sources: Source[]
    catalogue: Parcours[] | null // parcours de l'équipe MathALÉA (null : pas encore reçu)
    ajoutes: Parcours[] // parcours du catalogue ajoutés à l'accueil
    aChoisir: { lien: string; disponibles: string[] }[] // dossiers à plusieurs classes, classe pas encore choisie
    organisations: Record<string, Organisation>
    resumes: Record<string, Resume>
    epingles: string[]
    onglet?: 'mes' | 'explorer' | 'suivi'
    suivi: Snippet
    onouvrir: (p: Parcours) => void
    oncontinuer: (p: Parcours) => void
    onreglages: () => void
    onajouter: (lien: string) => Promise<string | null>
    onchoisirClasse: (lien: string, classe: string) => void
    onorganiser: (source: string, o: Organisation) => void
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
      : `${p.niveau} · ${difficultes[p.difficulte - 1]}`
  const badge = (p: Parcours) => {
    const r = resumes[p.id]
    if (r?.enCours) return `${r.fait}/${r.sur}`
    return r?.pourcentage != null ? `${r.pourcentage} %` : ''
  }
  const ouvrir = (p: Parcours) => (resumes[p.id]?.enCours ? oncontinuer(p) : onouvrir(p))

  let recherche = $state('')
  let classe: Source | null = $state(null)
  let niveau: string | null = $state(null)

  // Parcours de l'élève : ceux de ses dossiers et ceux ajoutés depuis Explorer
  const tous = $derived.by(() => {
    const vus = new Map<string, Parcours>()
    for (const s of sources) for (const p of s.parcours) vus.set(p.id, p)
    for (const p of ajoutes) if (!vus.has(p.id)) vus.set(p.id, p)
    return [...vus.values()]
  })
  const ajoutesVisibles = $derived(ajoutes.filter((p) => !resumes[p.id]?.enCours && !epingles.includes(p.id)))
  const explorables = $derived(catalogue ?? [])
  const enCours = $derived(tous.filter((p) => resumes[p.id]?.enCours))
  const epinglesVisibles = $derived(
    epingles.map((id) => tous.find((p) => p.id === id)).filter((p): p is Parcours => !!p && !resumes[p.id]?.enCours),
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

  /** Parcours groupés par thème, chaque groupe trié par difficulté (ordre de l'enseignant sinon) */
  function parTheme(liste: Parcours[]) {
    const groupes = new Map<string, Parcours[]>()
    for (const p of liste) groupes.set(p.theme, [...(groupes.get(p.theme) ?? []), p])
    return [...groupes.entries()].map(
      ([theme, ps]) => [theme, ps.map((p, i) => ({ p, i })).sort((a, b) => a.p.difficulte - b.p.difficulte || a.i - b.i).map((x) => x.p)] as const,
    )
  }
  const niveaux = $derived([...new Set(explorables.map((p) => p.niveau))])
  const termines = (s: Source) => s.parcours.filter((p) => resumes[p.id]?.pourcentage != null).length

  retourSi(
    () => classe !== null || niveau !== null || onglet !== 'mes',
    () => {
      if (classe) classe = null
      else if (niveau) niveau = null
      else changerOnglet('mes')
    },
  )

  function changerOnglet(o: typeof onglet) {
    onglet = o
    classe = null
    niveau = null
    recherche = ''
  }
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  {#if onglet === 'mes' && classe}
    <EnTete titre={classe.nom} onretour={() => (classe = null)} />
  {:else if onglet === 'explorer' && niveau}
    <EnTete titre={niveau} onretour={() => (niveau = null)} />
  {:else}
    <EnTete>
      {#snippet droite()}
        <button type="button" aria-label="Réglages" onclick={onreglages} class="bouton-icone">
          <i aria-hidden="true" class="bx bx-cog text-2xl"></i>
        </button>
      {/snippet}
    </EnTete>
  {/if}

  <main class="flex-1 avec-onglets">
    {#if onglet === 'mes' && classe}
      <div class="flex flex-col gap-3 p-4">
        <ContenuClasse
          nom="Chapitres"
          parcours={classe.parcours}
          organisation={organisation(classe.id)}
          {sousTitre}
          {badge}
          onouvrir={ouvrir}
          onorganiser={(o) => onorganiser(classe!.id, o)}
        />
      </div>
    {:else if onglet === 'mes'}
      <div class="flex flex-col gap-3 p-4">
        {#if tous.length}
        <label
          class="w-full flex flex-row items-center gap-2 rounded-lg px-3 py-2
          border border-coopmaths-action dark:border-coopmathsdark-action
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
          {#if enCours.length}
            <h2 class={titreSection}>En cours</h2>
            {#each enCours as p (p.id)}
              <Tuile icon={p.icone} title={p.titre} subtitle={sousTitre(p)} badge={badge(p)} onclick={() => oncontinuer(p)} />
            {/each}
          {/if}
          {#if epinglesVisibles.length}
            <h2 class={titreSection}>Épinglés</h2>
            {#each epinglesVisibles as p (p.id)}
              <Tuile icon={p.icone} title={p.titre} subtitle={sousTitre(p)} badge={badge(p)} onclick={() => ouvrir(p)} />
            {/each}
          {/if}
          {#if ajoutesVisibles.length}
            <h2 class={titreSection}>Ajoutés depuis Explorer</h2>
            {#each ajoutesVisibles as p (p.id)}
              <Tuile icon={p.icone} title={p.titre} subtitle={sousTitre(p)} badge={badge(p)} onclick={() => ouvrir(p)} />
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
              parcours={sources[0].parcours}
              organisation={organisation(sources[0].id)}
              {sousTitre}
              {badge}
              onouvrir={ouvrir}
              onorganiser={(o) => onorganiser(sources[0].id, o)}
            />
          {:else if sources.length > 1}
            <h2 class={titreSection}>Classes</h2>
            {#each sources as s (s.id)}
              <Tuile
                icon="bx-group"
                title={s.nom}
                subtitle="{s.parcours.length} parcours{termines(s) ? ` · ${termines(s)} terminé${termines(s) > 1 ? 's' : ''}` : ''}"
                onclick={() => (classe = s)}
              />
            {/each}
          {:else if aChoisir.length === 0}
            <h2 class={titreSection}>Ajoute le dossier de ta classe</h2>
            <ChampTexte id="lien-accueil" titre="Lien de partage donné par ton enseignant" bind:valeur={lien} type="url" />
            {#if messageLien}
              <p class="text-sm font-bold text-coopmaths-action dark:text-coopmathsdark-action" role="alert">{messageLien}</p>
            {/if}
            <button
              type="button"
              class="{boutonAction} w-full disabled:opacity-40"
              style="min-height: 44px"
              disabled={!lien.trim() || ajoutEnCours}
              onclick={ajouter}
            >
              Ajouter le dossier
            </button>
          {/if}
        {/if}
      </div>
    {:else if onglet === 'explorer' && niveau}
      <div class="flex flex-col gap-3 p-4">
        {#each parTheme(explorables.filter((p) => p.niveau === niveau)) as [theme, ps] (theme)}
          <h2 class={titreSection}>{theme}</h2>
          {#each ps as p (p.id)}
            <Tuile icon={p.icone} title={p.titre} subtitle={sousTitre(p)} badge={badge(p)} onclick={() => ouvrir(p)} />
          {/each}
        {/each}
      </div>
    {:else if onglet === 'explorer'}
      <div class="flex flex-col gap-3 p-4">
        <h2 class={titreSection}>Parcours proposés par l’équipe MathALÉA</h2>
        {#each niveaux as n (n)}
          {@const nb = explorables.filter((p) => p.niveau === n).length}
          <Tuile icon="bx-book-content" title={n} subtitle="{nb} parcours" onclick={() => (niveau = n)} />
        {:else}
          <p class="py-8 text-center font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
            Aucun parcours proposé pour le moment.
          </p>
        {/each}
      </div>
    {:else}
      {@render suivi()}
    {/if}
  </main>

  <BarreOnglets
    onglets={[
      { cle: 'mes', libelle: 'Mes parcours', icone: 'bx-book-open', iconeActive: 'bxs-book-open' },
      { cle: 'explorer', libelle: 'Explorer', icone: 'bx-compass', iconeActive: 'bxs-compass' },
      { cle: 'suivi', libelle: 'Suivi', icone: 'bx-bar-chart-alt-2', iconeActive: 'bxs-bar-chart-alt-2' },
    ]}
    actif={onglet}
    onchoisir={(o) => {
      changerOnglet(o)
      scrollTo(0, 0)
    }}
  />
</div>
