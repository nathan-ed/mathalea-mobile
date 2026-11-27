<script lang="ts" module>
  /** Organisation des chapitres choisie par l'élève, par classe */
  export interface Organisation {
    ordre: string[]
    fermes: string[]
  }
</script>

<script lang="ts">
  // Parcours d'une classe (et ceux ajoutés depuis l'Explorer), par chapitre
  // (thème) : chapitres dépliables, que l'élève peut réordonner. Dans un
  // chapitre : par difficulté, puis ordre de l'enseignant.
  import type { Parcours } from '$lib/catalogue'
  import Tuile from './Tuile.svelte'
  import { retourSi } from '$lib/navigation.svelte'

  let {
    parcours,
    organisation,
    sousTitre,
    badge,
    ceintures = () => undefined,
    onouvrir,
    onorganiser,
    epingles = [],
    onepingler,
    onactions,
    oncacher,
    explorer = [],
  }: {
    parcours: Parcours[]
    organisation: Organisation
    sousTitre: (p: Parcours) => string
    badge: (p: Parcours) => string
    ceintures?: (p: Parcours) => { couleur: string; obtenue: boolean }[] | undefined
    onouvrir: (p: Parcours) => void
    onorganiser: (o: Organisation) => void
    epingles?: string[]
    onepingler?: (p: Parcours) => void
    onactions?: (p: Parcours) => void
    oncacher?: (p: Parcours) => void
    explorer?: string[] // parcours ajoutés depuis l'Explorer : boussole sur leur tuile
  } = $props()

  let organiser = $state(false)
  retourSi(() => organiser, () => (organiser = false))

  // Parcours sans chapitre : en haut, sans intertitre ni section repliable
  // (Nathan, 26 novembre 2026 : jamais un intertitre vide)
  const parDifficulte = (liste: Parcours[]) =>
    liste
      .map((p, i) => ({ p, i }))
      .sort((a, b) => a.p.difficulte - b.p.difficulte || a.i - b.i)
      .map((x) => x.p)
  const sansChapitre = $derived(parDifficulte(parcours.filter((p) => !p.theme?.trim())))
  const chapitres = $derived.by(() => {
    const groupes = new Map<string, Parcours[]>()
    for (const p of parcours) if (p.theme?.trim()) groupes.set(p.theme, [...(groupes.get(p.theme) ?? []), p])
    const noms = [...groupes.keys()]
    // Ordre de l'élève d'abord, puis les nouveaux chapitres dans l'ordre de l'enseignant
    const ordonnes = [...organisation.ordre.filter((c) => noms.includes(c)), ...noms.filter((c) => !organisation.ordre.includes(c))]
    return ordonnes.map((c) => ({ nom: c, parcours: parDifficulte(groupes.get(c)!) }))
  })

  function basculer(chapitre: string) {
    const fermes = organisation.fermes.includes(chapitre)
      ? organisation.fermes.filter((c) => c !== chapitre)
      : [...organisation.fermes, chapitre]
    onorganiser({ ordre: chapitres.map((c) => c.nom), fermes })
  }

  // Glisser-déposer (doigt ou souris) en mode « Organiser », par la poignée
  let lignes: HTMLDivElement[] = $state([])
  let glisse: { index: number; depart: number; dy: number; milieux: number[] } | null = $state(null)

  function debutGlisse(e: PointerEvent, index: number) {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    glisse = {
      index,
      depart: e.clientY,
      dy: 0,
      milieux: lignes.map((l) => {
        const r = l.getBoundingClientRect()
        return r.top + r.height / 2
      }),
    }
  }

  function bougerGlisse(e: PointerEvent) {
    if (glisse) glisse.dy = e.clientY - glisse.depart
  }

  /** Place le chapitre glissé là où se trouve son milieu */
  function finGlisse() {
    if (!glisse) return
    const { index, dy, milieux } = glisse
    const milieu = milieux[index] + dy
    const cible = milieux.filter((m, i) => i !== index && m < milieu).length
    glisse = null
    if (cible === index) return
    const ordre = chapitres.map((c) => c.nom)
    const [deplace] = ordre.splice(index, 1)
    ordre.splice(cible, 0, deplace)
    onorganiser({ ordre, fermes: organisation.fermes })
  }

  function deplacer(i: number, sens: -1 | 1) {
    const ordre = chapitres.map((c) => c.nom)
    const j = i + sens
    if (j < 0 || j >= ordre.length) return
    ;[ordre[i], ordre[j]] = [ordre[j], ordre[i]]
    onorganiser({ ordre, fermes: organisation.fermes })
  }
</script>

<!-- Pas de nom de classe : une seule classe n'a pas besoin d'être nommée (son nom, dans le
     même style que les chapitres, se confondait avec eux, Nathan, 27 novembre 2026) ; avec
     plusieurs classes, les pastilles du haut la nomment. « Organiser » seulement avec
     plusieurs chapitres. -->
{#if chapitres.length > 1}
  <div class="flex flex-row items-center justify-end">
    <button
      type="button"
      class="text-sm text-coopmaths-action dark:text-coopmathsdark-action"
      style="min-height: 44px"
      aria-pressed={organiser}
      onclick={() => (organiser = !organiser)}
    >
      {organiser ? 'Terminé' : 'Organiser'}
    </button>
  </div>
{/if}

{#snippet tuile(p: Parcours)}
  <Tuile
    icon={p.icone}
    title={p.titre}
    subtitle={sousTitre(p)}
    badge={badge(p)}
    ceintures={ceintures(p)}
    onclick={() => onouvrir(p)}
    epingle={epingles.includes(p.id)}
    onepingler={onepingler ? () => onepingler(p) : undefined}
    onactions={onactions && !oncacher ? () => onactions(p) : undefined}
    oncacher={oncacher ? () => oncacher(p) : undefined}
    explorer={explorer.includes(p.id)}
  />
{/snippet}

{#if !organiser}
  {#each sansChapitre as p (p.id)}
    {@render tuile(p)}
  {/each}
{/if}

{#each chapitres as c, i (c.nom)}
  {@const ouvert = !organisation.fermes.includes(c.nom)}
  <div
    bind:this={lignes[i]}
    class="ligne-chapitre flex flex-row items-center gap-1 {organiser ? 'rounded-xl bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark' : ''}"
    style={glisse?.index === i ? `transform: translateY(${glisse.dy}px); position: relative; z-index: 10; box-shadow: 0 6px 18px rgb(0 0 0 / 18%)` : ''}
  >
    {#if organiser}
      <!-- Poignée : touch-action none pour que le doigt déplace le chapitre au lieu de faire défiler -->
      <span
        role="presentation"
        class="p-2 cursor-grab text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
        style="touch-action: none"
        onpointerdown={(e) => debutGlisse(e, i)}
        onpointermove={bougerGlisse}
        onpointerup={finGlisse}
        onpointercancel={() => (glisse = null)}
      >
        <i aria-hidden="true" class="bx bx-grid-vertical text-2xl"></i>
      </span>
    {/if}
    <button
      type="button"
      class="chapitre flex-1 flex flex-row items-center justify-between gap-3 text-left"
      style="min-height: 44px"
      aria-expanded={ouvert}
      disabled={organiser}
      onclick={() => basculer(c.nom)}
    >
      <!-- Chapitre : titre en gras, plus grand que les intertitres, avec sa flèche dans un rond :
           on voit qu'il se replie ou se déplie (Nathan, 27 novembre 2026) -->
      <span class="titre-chapitre text-coopmaths-corpus dark:text-coopmathsdark-corpus">{c.nom}</span>
      {#if !organiser}
        <span class="fleche-chapitre" aria-hidden="true">
          <i class="bx {ouvert ? 'bx-chevron-up' : 'bx-chevron-down'}"></i>
        </span>
      {/if}
    </button>
    {#if organiser}
      <button
        type="button"
        aria-label="Monter le chapitre {c.nom}"
        class="p-1 text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-40"
        disabled={i === 0}
        onclick={() => deplacer(i, -1)}
      >
        <i aria-hidden="true"
 class="bx bx-chevron-up text-2xl"></i>
      </button>
      <button
        type="button"
        aria-label="Descendre le chapitre {c.nom}"
        class="p-1 text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-40"
        disabled={i === chapitres.length - 1}
        onclick={() => deplacer(i, 1)}
      >
        <i aria-hidden="true"
 class="bx bx-chevron-down text-2xl"></i>
      </button>
    {/if}
  </div>
  {#if ouvert && !organiser}
    {#each c.parcours as p (p.id)}
      {@render tuile(p)}
    {/each}
  {/if}
{/each}

<style>
  /* Noir et plus grand que les titres des parcours (bleus) : un chapitre ne se confond pas avec eux */
  .titre-chapitre {
    font-size: 1.25rem;
    font-weight: 800;
    line-height: 1.3;
  }
  .fleche-chapitre {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 9999px;
    font-size: 1.5rem;
    background: var(--app-fond-2);
    color: var(--app-action);
  }
  .ligne-chapitre {
    margin-top: 1.25rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--app-presse);
  }
</style>
