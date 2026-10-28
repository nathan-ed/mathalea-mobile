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
</script>

<script lang="ts">
  import { quand } from '$lib/revisions'
  import { organisationDe } from '$lib/catalogue'
  import type { Snippet } from 'svelte'
  import type { Parcours } from '$lib/catalogue'
  import type { NiveauExplorer } from '$lib/explorer'
  import ChampTexte from './ChampTexte.svelte'
  import ContenuClasse, { type Organisation } from './ContenuClasse.svelte'
  import { boutonAction } from './classes'
  import EnTete from './EnTete.svelte'
  import BarreOnglets from './BarreOnglets.svelte'
  import Tuile from './Tuile.svelte'
  import { retourSi } from '$lib/navigation.svelte'

  let {
    sources,
    explorer,
    ajoutes,
    aChoisir,
    organisations,
    resumes,
    epingles,
    onglet = $bindable('mes'),
    niveau = $bindable(null),
    chapitre = $bindable(null),
    enseignant = false,
    suivi,
    espaceEnseignant,
    classesEnseignant,
    enClasse,
    vueEleve = false,
    onquitterVueEleve,
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
  }: {
    sources: Source[]
    explorer: NiveauExplorer[] // parcours de l'équipe MathALÉA du pays choisi, par degré et chapitre
    ajoutes: Parcours[] // parcours du catalogue ajoutés à l'accueil
    aChoisir: { lien: string; disponibles: string[] }[] // dossiers à plusieurs classes, classe pas encore choisie
    organisations: Record<string, Organisation>
    resumes: Record<string, Resume>
    epingles: string[]
    onglet?: 'mes' | 'explorer' | 'suivi' | 'creer' | 'classes' | 'classe'
    niveau?: string | null // Explorer : degré ouvert (gardé au retour d'un parcours)
    chapitre?: string | null // Explorer : chapitre ouvert
    enseignant?: boolean // réglage Enseignant : onglets Parcours, Classes, En classe et Explorer
    suivi: Snippet
    espaceEnseignant?: Snippet // bibliothèque (onglet Parcours, clé « creer »)
    classesEnseignant?: Snippet
    enClasse?: Snippet // sessions de l'enseignant
    vueEleve?: boolean // enseignant : Mes parcours et Suivi, comme les élèves
    onquitterVueEleve?: () => void
    onouvrir: (p: Parcours) => void
    oncontinuer: (p: Parcours) => void
    onreglages: () => void
    onscanner?: () => void // QR code de session affiché par l'enseignant
    revisions?: { dus: number; prochaine: string | null; enCours: boolean } | null // révisions espacées (null : rien de terminé)
    onrevisions?: () => void
    ontest?: () => void // Teste ton niveau (moteur prêt)
    resumeTest?: string
    onajouter: (lien: string) => Promise<string | null>
    onchoisirClasse: (lien: string, classe: string) => void
    onorganiser: (source: string, o: Organisation) => void
    onepingler: (p: Parcours) => void
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
  const ouvrir = (p: Parcours) => (resumes[p.id]?.enCours ? oncontinuer(p) : onouvrir(p))

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
  const ajoutesVisibles = $derived(ajoutes.filter((p) => !resumes[p.id]?.enCours && !epingles.includes(p.id)))
  const niveauOuvert = $derived(explorer.find((n) => n.niveau === niveau) ?? null)
  const chapitreOuvert = $derived(niveauOuvert?.chapitres.find((c) => c.theme === chapitre) ?? null)
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

  const nbParcours = (n: NiveauExplorer) => n.chapitres.reduce((a, c) => a + c.parcours.length, 0)
  const termines = (s: Source) => s.parcours.filter((p) => resumes[p.id]?.pourcentage != null).length

  // Onglets de l'enseignant ; en vue élève, ceux des élèves
  const espaceProf = $derived(enseignant && !vueEleve)
  // Onglet d'accueil, où l'app s'ouvre : « retour » y ramène avant de quitter l'app
  // (en vue élève : Mes parcours, puis l'espace enseignant)
  const depart = $derived(espaceProf ? 'creer' : 'mes')
  retourSi(
    () => niveau !== null || onglet !== depart || (enseignant && vueEleve),
    () => {
      if (chapitre) chapitre = null
      else if (niveau) niveau = null
      else if (onglet !== depart) changerOnglet(depart)
      else onquitterVueEleve?.()
    },
  )

  function changerOnglet(o: typeof onglet) {
    onglet = o
    niveau = null
    chapitre = null
    recherche = ''
  }
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  {#if onglet === 'creer' && espaceProf && espaceEnseignant}
    {@render espaceEnseignant()}
  {:else if onglet === 'classes' && espaceProf && classesEnseignant}
    {@render classesEnseignant()}
  {:else if onglet === 'classe' && espaceProf && enClasse}
    {@render enClasse()}
  {:else}
  {#if onglet === 'explorer' && chapitreOuvert}
    <EnTete titre={chapitreOuvert.theme} onretour={() => (chapitre = null)} />
  {:else if onglet === 'explorer' && niveauOuvert}
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

  {#if enseignant && vueEleve}
    <div class="flex flex-row items-center gap-2 pl-4 pr-1 text-xs bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light" role="status">
      <i aria-hidden="true" class="bx bx-mobile text-base text-coopmaths-action dark:text-coopmathsdark-action"></i>
      <span class="min-w-0 flex-1 truncate py-2">Vue élève : l’app comme vos élèves la voient</span>
      <button type="button" class="presse shrink-0 px-2 py-1.5 font-semibold text-coopmaths-action dark:text-coopmathsdark-action" onclick={() => onquitterVueEleve?.()}>Quitter</button>
    </div>
  {/if}
  <main class="flex-1 avec-onglets">
    {#if onglet === 'mes'}
      <div class="flex flex-col gap-3 p-4">
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
              <Tuile icon={p.icone} title={p.titre} subtitle={sousTitre(p)} badge={badge(p)} onclick={() => oncontinuer(p)} />
            {/each}
          {/if}
          {#if epinglesVisibles.length}
            <h2 class={titreSection}>Épinglés</h2>
            {#each epinglesVisibles as p (p.id)}
              <Tuile icon={p.icone} title={p.titre} subtitle={sousTitre(p)} badge={badge(p)} onclick={() => ouvrir(p)} epingle onepingler={() => onepingler(p)} />
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
              {epingles}
              {onepingler}
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
                  parcours={classeVue.parcours}
                  organisation={organisation(classeVue.id)}
                  {sousTitre}
                  {badge}
                  onouvrir={ouvrir}
                  onorganiser={(o) => onorganiser(classeVue!.id, o)}
                  {epingles}
                  {onepingler}
                />
              {/key}
            {/if}
          {:else if aChoisir.length === 0}
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
              <button type="submit" class="{boutonAction} w-full disabled:opacity-40" style="min-height: 44px" disabled={!lien.trim() || ajoutEnCours}>
                {ajoutEnCours ? 'Ajout du dossier…' : 'Ajouter le dossier'}
              </button>
            </form>
          {/if}
        {/if}
      </div>
    {:else if onglet === 'explorer' && chapitreOuvert}
      <div class="flex flex-col gap-3 p-4">
        {#each chapitreOuvert.parcours as p (p.id)}
          <Tuile icon={p.icone} title={p.titre} subtitle={sousTitre(p)} badge={badge(p)} onclick={() => ouvrir(p)} />
        {/each}
      </div>
    {:else if onglet === 'explorer' && niveauOuvert}
      <div class="flex flex-col gap-3 p-4">
        {#each niveauOuvert.chapitres as c (c.theme)}
          <Tuile icon="bx-folder" title={c.theme} subtitle="{c.parcours.length} parcours" onclick={() => (chapitre = c.theme)} />
        {/each}
      </div>
    {:else if onglet === 'explorer'}
      <div class="flex flex-col gap-3 p-4">
        {#if ontest}
          <Tuile icon="bx-timer" title="Teste ton niveau" subtitle={resumeTest} onclick={ontest} />
        {/if}
        <h2 class={titreSection}>Parcours proposés par l’équipe MathALÉA</h2>
        {#each explorer as n (n.niveau)}
          <Tuile
            icon="bx-book-content"
            title={n.niveau}
            subtitle={n.chapitres.length > 1 ? `${n.chapitres.length} chapitres · ${nbParcours(n)} parcours` : `${nbParcours(n)} parcours`}
            onclick={() => (niveau = n.niveau)}
          />
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
  {/if}

  <BarreOnglets
    onglets={espaceProf
      ? [
          { cle: 'creer' as const, libelle: 'Parcours', icone: 'bx-book-content', iconeActive: 'bxs-book-content' },
          { cle: 'classes' as const, libelle: 'Classes', icone: 'bx-group', iconeActive: 'bxs-group' },
          { cle: 'classe' as const, libelle: 'En classe', icone: 'bx-chalkboard', iconeActive: 'bxs-chalkboard' },
          { cle: 'explorer' as const, libelle: 'Explorer', icone: 'bx-compass', iconeActive: 'bxs-compass' },
        ]
      : [
          { cle: 'mes' as const, libelle: 'Mes parcours', icone: 'bx-book-open', iconeActive: 'bxs-book-open' },
          { cle: 'explorer' as const, libelle: 'Explorer', icone: 'bx-compass', iconeActive: 'bxs-compass' },
          { cle: 'suivi' as const, libelle: 'Suivi', icone: 'bx-bar-chart-alt-2', iconeActive: 'bxs-bar-chart-alt-2' },
        ]}
    actif={onglet}
    onchoisir={(o) => {
      changerOnglet(o)
      scrollTo(0, 0)
    }}
  />
</div>
