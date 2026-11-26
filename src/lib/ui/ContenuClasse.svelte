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
    nom,
    parcours,
    organisation,
    sousTitre,
    badge,
    badgeVert,
    ceintures = () => undefined,
    onouvrir,
    onorganiser,
    epingles = [],
    onepingler,
    onactions,
    oncacher,
    explorer = [],
  }: {
    nom: string
    parcours: Parcours[]
    organisation: Organisation
    sousTitre: (p: Parcours) => string
    badge: (p: Parcours) => string
    badgeVert: (p: Parcours) => boolean
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

  const chapitres = $derived.by(() => {
    const groupes = new Map<string, Parcours[]>()
    for (const p of parcours) groupes.set(p.theme, [...(groupes.get(p.theme) ?? []), p])
    const noms = [...groupes.keys()]
    // Ordre de l'élève d'abord, puis les nouveaux chapitres dans l'ordre de l'enseignant
    const ordonnes = [...organisation.ordre.filter((c) => noms.includes(c)), ...noms.filter((c) => !organisation.ordre.includes(c))]
    return ordonnes.map((c) => ({
      nom: c,
      parcours: groupes
        .get(c)!
        .map((p, i) => ({ p, i }))
        .sort((a, b) => a.p.difficulte - b.p.difficulte || a.i - b.i)
        .map((x) => x.p),
    }))
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

<!-- Titre et « Organiser » seulement avec plusieurs chapitres : avec un seul, le nom du
     chapitre suffit (deux intertitres l'un sur l'autre, Rémi, 26 novembre 2026) -->
{#if chapitres.length > 1}
<div class="flex flex-row items-center justify-between">
  <h2 class="titre-section">{nom}</h2>
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

{#each chapitres as c, i (c.nom)}
  {@const ouvert = !organisation.fermes.includes(c.nom)}
  <div
    bind:this={lignes[i]}
    class="ligne-chapitre flex flex-row items-center gap-1 rounded-xl {organiser ? 'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark' : ''}"
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
      <!-- Intertitre du chapitre : petites capitales grises, comme les sections des réglages -->
      <span class="titre-section">
        {c.nom}
        <span class="compte"> · {c.parcours.length}</span>
      </span>
      {#if !organiser}
        <i aria-hidden="true"
 class="bx {ouvert ? 'bx-chevron-up' : 'bx-chevron-down'} text-xl text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"></i>
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
      <Tuile
        icon={p.icone}
        title={p.titre}
        subtitle={sousTitre(p)}
        badge={badge(p)}
        badgeVert={badgeVert(p)}
        ceintures={ceintures(p)}
        onclick={() => onouvrir(p)}
        epingle={epingles.includes(p.id)}
        onepingler={onepingler ? () => onepingler(p) : undefined}
        onactions={onactions && !oncacher ? () => onactions(p) : undefined}
        oncacher={oncacher ? () => oncacher(p) : undefined}
        explorer={explorer.includes(p.id)}
      />
    {/each}
  {/if}
{/each}

<style>
  /* Chapitre : intertitre sans marge propre, l'espace vient de la ligne */
  .chapitre .titre-section {
    margin: 0;
  }
  .compte {
    font-weight: 400;
    letter-spacing: 0;
    font-variant-caps: normal;
  }
  .ligne-chapitre {
    margin-top: 1rem;
  }
</style>
