<script lang="ts">
  // Suivi du travail dans la durée, avec la rampe « struct » de MathALÉA
  import { paliersDe, titreEleve, type Parcours } from '$lib/catalogue'
  import { MAITRISES, ceinturesObtenues, maitrise, objectifsTravailles } from '$lib/objectifs'
  import { bilan, premiersEssais, valeur, type Essai, type Seance } from '$lib/progression'
  import { estTest } from '$lib/testNiveau'
  import { SOLIDITES, soliditeObjectif, type Revisions } from '$lib/revisions'
  import { theme } from '$lib/theme.svelte'
  import { listeGroupee, pastille, pastilleScore } from './classes'

  let {
    parcours,
    historiques,
    enCours,
    ceinturesTest = [],
    onouvrir,
    ontest,
    revisions = null,
    passagesRevision = [],
  }: {
    parcours: Parcours[]
    historiques: Record<string, Seance[]>
    enCours: Record<string, Seance | null>
    ceinturesTest?: { nom: string; niveau: string; couleur: string; obtenue: boolean }[] // Teste ton niveau, du CM1 à la Terminale
    onouvrir: (p: Parcours) => void
    ontest?: () => void
    revisions?: Revisions | null // révisions espacées : solidité de chaque objectif dans le temps
    passagesRevision?: Seance[] // séances de révision : elles comptent pour les objectifs
  } = $props()

  const titreSection = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  // Rampe à une teinte (struct de MathALÉA), validée : dataviz/validate_palette --ordinal
  const rampe = $derived(theme.sombre ? ['#8f48f5', '#a66df7', '#caa9fa', '#e0cffc'] : ['#5faedd', '#2c93cf', '#216d9a', '#14415c'])
  const vide = $derived(theme.sombre ? '#3a3d4e' : '#e9e9e9')
  const niveau = (n: number) => (n === 0 ? -1 : n <= 2 ? 0 : n <= 5 ? 1 : n <= 9 ? 2 : 3)
  const NB_JOURS = 28

  const jour = (iso: string) => iso.slice(0, 10)
  const toutesSeances = $derived(
    parcours.flatMap((p) => {
      const h = historiques[p.id] ?? []
      const c = enCours[p.id]
      return c && !h.some((s) => s.debut === c.debut) ? [...h, c] : h
    }),
  )
  // Première vérification de chaque question de chaque passage
  const essais: Essai[] = $derived(toutesSeances.flatMap((s) => [...premiersEssais(s).values()]))
  const justes = $derived(essais.filter((e) => valeur(e) === 1).length)
  const joursActifs = $derived(new Set(essais.map((e) => jour(e.le))).size)

  const jours = $derived.by(() => {
    const aujourdhui = new Date()
    return Array.from({ length: NB_JOURS }, (_, i) => {
      const d = new Date(aujourdhui)
      d.setDate(d.getDate() - (NB_JOURS - 1 - i))
      const cle = d.toISOString().slice(0, 10)
      const du = essais.filter((e) => jour(e.le) === cle)
      const j = du.filter((e) => valeur(e) === 1).length
      return { cle, date: d, correctes: j, total: du.length }
    })
  })
  // Calendrier : semaines du lundi au dimanche, jusqu'à aujourd'hui
  const semaines = $derived.by(() => {
    const decalage = (jours[0].date.getDay() + 6) % 7
    const cases: ((typeof jours)[number] | null)[] = [...Array(decalage).fill(null), ...jours]
    while (cases.length % 7) cases.push(null)
    return Array.from({ length: cases.length / 7 }, (_, i) => cases.slice(i * 7, i * 7 + 7))
  })
  let choisi: number | null = $state(null)
  let vueActivite: 'calendrier' | 'graphique' = $state('calendrier')
  // Barres : correctes (struct) et incorrectes (action), paire validée pour les daltonismes
  const couleurCorrecte = $derived(theme.sombre ? '#a66df7' : '#216d9a')
  const couleurIncorrecte = $derived(theme.sombre ? '#da7100' : '#f15929')
  const max = $derived(Math.max(4, ...jours.map((j) => j.total)))
  const L = 300
  const H = 90
  const largeur = (L - (NB_JOURS - 1) * 2) / NB_JOURS
  const detail = $derived(choisi === null ? null : jours[choisi])

  // Par parcours : passages complets comparés entre eux ; un parcours à paliers donne ses paliers réussis
  const lignes = $derived(
    parcours
      .map((p) => {
        const passages = historiques[p.id] ?? []
        const paliers = paliersDe(p).length > 1 ? ceinturesObtenues(p, passages) : null
        const complets = passages.filter((s) => s.etapes.length === s.contenu.etapes.length)
        const pcts = complets.map((s) => bilan(s).pourcentage)
        return {
          p,
          n: passages.length,
          dernier: pcts.at(-1),
          avant: pcts.at(-2),
          meilleur: pcts.length ? Math.max(...pcts) : undefined,
          paliers: paliers ? { reussis: paliers.filter((x) => x.obtenue).length, total: paliers.length } : null,
        }
      })
      .filter((l) => l.n > 0),
  )

  /** Exercices dont le dernier passage terminé n'est pas à 100 %, lus dans la copie figée de la séance */
  const aRetravailler = $derived(
    // Teste ton niveau : questions tirées une fois, rien à retravailler exercice par exercice
    parcours.filter((p) => !estTest(p.id)).flatMap((p) => {
      const dernier = (historiques[p.id] ?? []).at(-1)
      if (!dernier) return []
      return bilan(dernier)
        .parEtape.filter((e) => e.points < e.sur && dernier.contenu.etapes[e.etape])
        .map((e) => ({ p, etape: dernier.contenu.etapes[e.etape], rang: e.etape, points: e.points, sur: e.sur }))
    }),
  )

  // ---------- Objectifs et ceintures ----------
  let vue: 'activite' | 'objectifs' | 'ceintures' = $state('activite')
  const passagesTermines = $derived([...parcours.flatMap((p) => historiques[p.id] ?? []), ...passagesRevision])
  const objectifs = $derived(objectifsTravailles(passagesTermines))
  // Solidité dans le temps (révisions espacées) d'un objectif, ou null
  const sol = (libelle: string) => (revisions ? soliditeObjectif(revisions, libelle) : null)
  const objectifsParNiveau = $derived.by(() => {
    const niveaux = [...new Set(objectifs.map((o) => o.niveau))]
    return niveaux.map((niveau) => {
      const du = objectifs.filter((o) => o.niveau === niveau)
      return { niveau, chapitres: [...new Set(du.map((o) => o.theme))].map((theme) => ({ theme, liste: du.filter((o) => o.theme === theme) })) }
    })
  })
  let objectifOuvert: string | null = $state(null)
  const ceintures = $derived(
    parcours.filter((p) => p.style === 'ceintures' && (p.paliers?.length ?? 0) > 1).map((p) => ({ p, liste: ceinturesObtenues(p, historiques[p.id] ?? []) })),
  )
  const vues = $derived([
    ['activite', 'Activité'],
    ['objectifs', 'Objectifs'],
    ...(ceintures.length || ceinturesTest.length ? [['ceintures', 'Ceintures']] : []),
  ])
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  const fmtJour = (d: Date) => d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  const arrondi = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1))
</script>

{#snippet rangee(liste: { nom: string; couleur: string; obtenue: boolean; niveau?: string }[])}
  <ul class="flex flex-row flex-wrap gap-3">
    {#each liste as x (x.nom)}
      <li class="flex flex-col items-center gap-1" aria-label="{x.nom}{x.niveau ? ` (${x.niveau})` : ''} : {x.obtenue ? 'obtenue' : 'pas encore obtenue'}">
        <span
          class="relative inline-flex items-center justify-center w-14 h-7 rounded border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
          {x.obtenue ? '' : 'opacity-30'}"
          style="background-color: {x.couleur}"
        >
          {#if x.obtenue}<i aria-hidden="true" class="bx bx-check text-lg" style="color: {x.couleur === '#f5f5f4' || x.couleur === '#facc15' ? '#1c1917' : '#ffffff'}"></i>{/if}
        </span>
        <span class="text-xs {x.obtenue ? 'font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct' : discret}">{x.niveau ?? x.nom.replace('Ceinture ', '')}</span>
      </li>
    {/each}
  </ul>
{/snippet}

<div class="flex flex-col gap-3 p-4">
  {#if essais.length === 0}
    <p class="py-8 text-center font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
      Ton suivi apparaîtra après tes premières questions.
    </p>
  {:else}
    <div
      class="grid rounded-xl border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark py-4"
      style="grid-template-columns: repeat(3, minmax(0, 1fr));"
    >
      {#each [[essais.length, 'questions'], [justes, justes > 1 ? 'correctes' : 'correcte'], [joursActifs, joursActifs > 1 ? 'jours actifs' : 'jour actif']] as [n, libelle] (libelle)}
        <div class="text-center">
          <div class="font-light text-coopmaths-struct dark:text-coopmathsdark-struct" style="font-size: 2.25rem; line-height: 1.1">{n}</div>
          <div class={discret}>{libelle}</div>
        </div>
      {/each}
    </div>

    {#if vues.length > 1}
      <div class="flex flex-row gap-1 rounded-xl p-1 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark" role="tablist" aria-label="Suivi">
        {#each vues as [v, libelle] (v)}
          <button
            type="button"
            role="tab"
            aria-selected={vue === v}
            class="flex-1 rounded-lg py-2 text-sm font-semibold transition-colors duration-150
            {vue === v
              ? 'bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-struct dark:text-coopmathsdark-struct shadow-sm'
              : 'text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'}"
            onclick={() => (vue = v as typeof vue)}>{libelle}</button
          >
        {/each}
      </div>
    {/if}

    {#if vue === 'objectifs'}
      {#if !objectifs.length}
        <p class="py-6 text-center {discret}">Les objectifs de tes parcours apparaîtront ici dès que tu auras terminé un passage.</p>
      {:else}
        <div class="flex flex-row flex-wrap items-center gap-x-3 gap-y-1 px-1 {discret}" aria-hidden="true">
          {#each MAITRISES as m, k (m)}
            <span class="inline-flex items-center gap-1"><i style="width:10px;height:10px;border-radius:2px;background:{rampe[k]}"></i>{m}</span>
          {/each}
        </div>
        {#each objectifsParNiveau as n (n.niveau)}
          <h2 class={titreSection}>{n.niveau || 'Sans niveau'}</h2>
          {#each n.chapitres as c (c.theme)}
            <p class="pl-2 text-sm font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct">{c.theme}</p>
            <ul class={listeGroupee}>
              {#each c.liste as o (o.libelle)}
                {@const m = maitrise(o.meilleur)}
                <li>
                  <button
                    type="button"
                    aria-expanded={objectifOuvert === o.libelle}
                    class="w-full flex flex-col gap-2 px-4 py-3 text-left bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
                    active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest transition-colors duration-150"
                    onclick={() => (objectifOuvert = objectifOuvert === o.libelle ? null : o.libelle)}
                  >
                    <span class="flex flex-row items-start justify-between gap-3">
                      <span class="min-w-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus">{o.libelle}</span>
                      <span class="shrink-0 flex flex-row gap-0.5 pt-1" role="img" aria-label="Meilleur niveau : {MAITRISES[m]}">
                        {#each MAITRISES as _, k (k)}
                          <i style="width:14px;height:8px;border-radius:2px;background:{k <= m ? rampe[m] : vide}"></i>
                        {/each}
                      </span>
                    </span>
                    <span class="text-sm font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct">
                      {MAITRISES[m]} · {o.meilleur} %{#if sol(o.libelle) !== null}<span class="font-light">{' · '}révision : {SOLIDITES[sol(o.libelle)!].toLowerCase()}</span>{/if}
                    </span>
                    {#if objectifOuvert === o.libelle}
                      <span class={discret}>
                        Travaillé pour la dernière fois le {fmtDate(o.dernier)}, dans « {o.parcours} » ; {o.passages} exercice{o.passages > 1 ? 's' : ''} en tout.
                      </span>
                    {/if}
                  </button>
                </li>
              {/each}
            </ul>
          {/each}
        {/each}
      {/if}
    {:else if vue === 'ceintures'}
      {#if ceinturesTest.length}
        {@const plusHaute = ceinturesTest.filter((x) => x.obtenue).at(-1)}
        <section class="flex flex-col gap-3 rounded-xl p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
          <button type="button" class="text-left" onclick={ontest}>
            <span class="block font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Teste ton niveau</span>
            <span class={discret}>{plusHaute ? `Ceinture la plus haute : ${plusHaute.nom.replace('Ceinture ', '')} (${plusHaute.niveau})` : 'Aucune ceinture pour le moment'}</span>
          </button>
          {@render rangee(ceinturesTest)}
        </section>
      {/if}
      {#each ceintures as c (c.p.id)}
        {@const plusHaute = c.liste.filter((x) => x.obtenue).at(-1)}
        <section class="flex flex-col gap-3 rounded-xl p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
          <button type="button" class="text-left" onclick={() => onouvrir(c.p)}>
            <span class="block font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{c.p.titre}</span>
            <span class={discret}>{plusHaute ? `Ceinture la plus haute : ${plusHaute.nom.replace('Ceinture ', '')}` : 'Aucune ceinture pour le moment'}</span>
          </button>
          {@render rangee(c.liste)}
        </section>
      {/each}
    {:else}
    <div class="flex flex-row items-center justify-between">
      <h2 class={titreSection}>Activité des 4 dernières semaines</h2>
      <div class="flex flex-row text-sm" role="group" aria-label="Affichage de l’activité">
        {#each [['calendrier', 'bx-calendar'], ['graphique', 'bx-bar-chart-alt-2']] as [v, icone] (v)}
          <button
            type="button"
            aria-label={v === 'calendrier' ? 'Calendrier' : 'Graphique'}
            aria-pressed={vueActivite === v}
            class="p-1 {vueActivite === v ? 'text-coopmaths-action dark:text-coopmathsdark-action' : 'text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'}"
            onclick={() => (vueActivite = v as typeof vueActivite)}
          >
            <i aria-hidden="true"
 class="bx {icone} text-2xl"></i>
          </button>
        {/each}
      </div>
    </div>
    <div class="rounded-xl border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest p-3">
      {#if vueActivite === 'calendrier'}
      <div class="grid gap-1 mx-auto" style="grid-template-columns: repeat(7, 2.25rem); width: max-content">
        {#each ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as j, i (i)}
          <div class="text-center {discret}">{j}</div>
        {/each}
        {#each semaines as semaine, s (s)}
          {#each semaine as c, i (i)}
            {#if c}
              {@const idx = jours.indexOf(c)}
              <button
                type="button"
                aria-label="{fmtJour(c.date)} : {c.total} question{c.total > 1 ? 's' : ''}, {c.correctes} correcte{c.correctes > 1 ? 's' : ''}"
                aria-pressed={choisi === idx}
                class="rounded-md flex items-center justify-center text-xs"
                style="aspect-ratio: 1; background: {c.total ? rampe[niveau(c.total)] : vide};
                  color: {niveau(c.total) >= 2 !== theme.sombre ? '#ffffff' : 'currentColor'};
                  outline: {choisi === idx ? '2px solid currentColor' : 'none'}; outline-offset: 2px"
                onclick={() => (choisi = choisi === idx ? null : idx)}
              >
                {c.date.getDate()}
              </button>
            {:else}
              <div></div>
            {/if}
          {/each}
        {/each}
      </div>
      {:else}
      <div class="flex flex-row flex-wrap items-center gap-4 text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus">
        <span class="inline-flex items-center gap-2"><i style="width:10px;height:10px;border-radius:2px;background:{couleurCorrecte}"></i>Correctes</span>
        <span class="inline-flex items-center gap-2"><i style="width:10px;height:10px;border-radius:2px;background:{couleurIncorrecte}"></i>Incorrectes</span>
      </div>
      <svg viewBox="0 0 {L} {H + 16}" class="w-full mt-2" style="max-height: 9rem" role="img" aria-label="Questions par jour sur 28 jours">
        <line x1="0" x2={L} y1={H} y2={H} stroke="currentColor" stroke-opacity="0.2" />
        {#each jours as j, i (j.cle)}
          {@const x = i * (largeur + 2)}
          {@const hC = (j.correctes / max) * (H - 4)}
          {@const hI = ((j.total - j.correctes) / max) * (H - 4)}
          <g
            role="button"
            tabindex="0"
            aria-label="{fmtJour(j.date)} : {j.total} questions, {j.correctes} correctes"
            onclick={() => (choisi = choisi === i ? null : i)}
            onkeydown={(e) => e.key === 'Enter' && (choisi = choisi === i ? null : i)}
            style="cursor: pointer"
          >
            <rect {x} y="0" width={largeur + 2} height={H} fill="transparent" />
            {#if hC > 0}<rect {x} y={H - hC} width={largeur} height={hC} rx="2" fill={couleurCorrecte} />{/if}
            {#if hI > 0}<rect {x} y={H - hC - hI - (hC > 0 ? 2 : 0)} width={largeur} height={hI} rx="2" fill={couleurIncorrecte} />{/if}
            {#if choisi === i}<rect {x} y="0" width={largeur} height={H} fill="currentColor" fill-opacity="0.06" />{/if}
          </g>
          {#if (j.date.getDay() === 1 && i < NB_JOURS - 3) || i === NB_JOURS - 1}
            <text x={x + largeur / 2} y={H + 12} text-anchor="middle" font-size="8" fill="currentColor" fill-opacity="0.6">
              {i === NB_JOURS - 1 ? 'auj.' : j.date.getDate()}
            </text>
          {/if}
        {/each}
      </svg>
      {/if}
      <div class="flex flex-row items-center justify-between gap-2 mt-3">
        <p class={discret} aria-live="polite">
          {#if detail}
            {fmtJour(detail.date)} : {detail.total} question{detail.total > 1 ? 's' : ''}, {detail.correctes} correcte{detail.correctes > 1 ? 's' : ''}
          {/if}
        </p>
        {#if vueActivite === 'calendrier'}
        <div class="flex flex-row items-center gap-1 {discret}">
          moins
          {#each rampe as c (c)}<i style="width:12px;height:12px;border-radius:3px;background:{c}"></i>{/each}
          plus
        </div>
        {/if}
      </div>
    </div>

    {#if lignes.length}
      <h2 class={titreSection}>Parcours</h2>
      <ul class={listeGroupee}>
        {#each lignes as l (l.p.id)}
          {@const evolution = l.avant !== undefined && l.dernier !== undefined ? l.dernier - l.avant : null}
          <li>
            <button
              type="button"
              class="w-full flex flex-row items-center justify-between gap-3 px-4 py-3 text-left
              bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
              active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest transition-colors duration-150"
              onclick={() => onouvrir(l.p)}
            >
              <div class="min-w-0">
                <div class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{l.p.titre}</div>
                <div class={discret}>
                  {#if l.paliers}
                    {l.n} passage{l.n > 1 ? 's' : ''} · {l.paliers.reussis} {l.p.style === 'ceintures' ? 'ceinture' : 'palier'}{l.paliers.reussis > 1 ? 's' : ''} sur {l.paliers.total}
                  {:else}
                    {l.n} passage{l.n > 1 ? 's' : ''} · meilleur {l.meilleur} %{#if evolution !== null && evolution !== 0}
                      · {evolution > 0 ? '+' : ''}{evolution} points{/if}
                  {/if}
                </div>
              </div>
              {#if l.paliers}
                <span class={pastilleScore(l.paliers.total ? (100 * l.paliers.reussis) / l.paliers.total : 0)}>{l.paliers.reussis}/{l.paliers.total}</span>
              {:else if l.dernier !== undefined}
                <span class={pastilleScore(l.dernier)}>{l.dernier} %</span>
              {/if}
            </button>
          </li>
        {/each}
      </ul>
    {/if}

    {#if aRetravailler.length}
      <h2 class={titreSection}>À retravailler</h2>
      <ul class={listeGroupee}>
        {#each aRetravailler as r (`${r.p.id}-${r.rang}`)}
          <li>
            <button
              type="button"
              class="w-full flex flex-row items-center justify-between gap-3 px-4 py-3 text-left
              bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
              active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest transition-colors duration-150"
              onclick={() => onouvrir(r.p)}
            >
              <div class="min-w-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
                {titreEleve(r.etape, r.rang)}
                <div class={discret}>{r.p.titre}</div>
              </div>
              <span class={pastille}>{arrondi(r.points)}/{r.sur}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
    {/if}
  {/if}
</div>
