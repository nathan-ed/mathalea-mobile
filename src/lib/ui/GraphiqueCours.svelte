<script lang="ts">
  // Graphique d'une fiche de cours, tracé par l'app (sans le moteur) :
  // courbes, aire ombrée entre deux bornes, curseurs et valeur calculée.
  import type { Coordonnee, CouleurGraphique, Graphique } from '$lib/catalogue'
  import { compiler, integrale } from '$lib/expression'
  import type { RenduFormule } from '$lib/texteRiche'
  import { texteRiche, titreRiche } from '$lib/texteRiche'

  let { graphique, formule }: { graphique: Graphique; formule: RenduFormule } = $props()

  // Valeurs des curseurs, modifiées par l'élève
  const depart = () => Object.fromEntries(Object.entries(graphique.curseurs ?? {}).map(([n, c]) => [n, c[2]]))
  let valeurs: Record<string, number> = $state(depart())
  const noms = $derived(Object.keys(graphique.curseurs ?? {}))
  const fonctions = $derived(graphique.fonctions.map((f) => compiler(f, ['x', ...noms])))
  const f = (k: number) => (x: number) => fonctions[k]?.({ ...valeurs, x }) ?? NaN

  const L = 320
  const H = 220
  const marge = { g: 26, d: 8, h: 8, b: 20 }
  const [x0, x1] = $derived(graphique.x)
  const [y0, y1] = $derived(graphique.y)
  const X = (x: number) => marge.g + ((x - x0) / (x1 - x0)) * (L - marge.g - marge.d)
  const Y = (y: number) => H - marge.b - ((y - y0) / (y1 - y0)) * (H - marge.b - marge.h)

  /** Graduations : au plus 10 par axe, pas de 1, 2, 5, 10… */
  function graduations(a: number, b: number) {
    const brut = (b - a) / 10
    const p = Math.pow(10, Math.floor(Math.log10(brut)))
    const pas = [1, 2, 5, 10].map((m) => m * p).find((m) => m >= brut)!
    const liste: number[] = []
    for (let v = Math.ceil(a / pas) * pas; v <= b + 1e-9; v += pas) liste.push(Math.round(v / pas) * pas)
    return liste
  }

  /** Tracé d'une courbe, coupé là où elle n'est pas définie */
  function trace(g: (x: number) => number) {
    let d = ''
    let dedans = false
    const n = 300
    for (let k = 0; k <= n; k++) {
      const x = x0 + ((x1 - x0) * k) / n
      const y = g(x)
      if (!Number.isFinite(y) || Math.abs(y) > 1e6) {
        dedans = false
        continue
      }
      d += `${dedans ? 'L' : 'M'}${X(x).toFixed(1)},${Y(Math.max(y0 - (y1 - y0), Math.min(y1 + (y1 - y0), y))).toFixed(1)} `
      dedans = true
    }
    return d
  }

  const borne = (b: number | string) => (typeof b === 'number' ? b : (valeurs[b] ?? 0))
  const aire = $derived.by(() => {
    if (!graphique.aire) return null
    const haut = f(graphique.aire.fonction ?? 0)
    const bas = graphique.aire.entre !== undefined ? f(graphique.aire.entre) : () => 0
    const a = borne(graphique.aire.de)
    const b = borne(graphique.aire.a)
    const [lo, hi] = a <= b ? [a, b] : [b, a]
    let d = ''
    if (hi > lo) {
      const n = 200
      const pts = Array.from({ length: n + 1 }, (_, k) => lo + ((hi - lo) * k) / n)
      d = `M${X(lo)},${Y(bas(lo))} ` + pts.map((x) => `L${X(x).toFixed(1)},${Y(haut(x)).toFixed(1)}`).join(' ')
      d += ' ' + pts.reverse().map((x) => `L${X(x).toFixed(1)},${Y(bas(x)).toFixed(1)}`).join(' ') + ' Z'
    }
    return { a, b, d, entre: graphique.aire.entre !== undefined, valeur: graphique.aire.entre !== undefined ? integrale((x) => Math.abs(haut(x) - bas(x)), lo, hi) : integrale(haut, a, b) }
  })

  const nombre = (v: number) => {
    const r = Math.round(v * 100) / 100
    return (Object.is(r, -0) ? 0 : r).toString().replace('.', '{,}')
  }
  const resultat = $derived(
    aire && graphique.valeur
      ? aire.entre
        ? formule(`\\mathcal{A}\\approx ${nombre(aire.valeur)}`, false)
        : formule(`\\int_{${nombre(aire.a)}}^{${nombre(aire.b)}} f(x)\\,\\mathrm{d}x\\approx ${nombre(aire.valeur)}`, false)
      : '',
  )
  const COULEURS: Record<CouleurGraphique, string> = {
    bleu: 'var(--app-struct)',
    orange: 'var(--app-action)',
    vert: 'var(--app-vert)',
    gris: 'var(--app-gris)',
  }
  const TIRETS = { plein: undefined, tirets: '7 5', pointilles: '1.5 4' }
  const couleurCourbe = (k: number) => COULEURS[graphique.styles?.[k]?.couleur ?? (k % 2 ? 'orange' : 'bleu')]
  const nomsCourbes = ['f', 'g', 'h']

  // Points et textes : coordonnées fixes ou suivant un curseur
  const coord = (c: Coordonnee) => (typeof c === 'number' ? c : (valeurs[c] ?? 0))
  const dedans = (x: number, y: number) => Number.isFinite(y) && x >= x0 && x <= x1 && y >= y0 && y <= y1
  const points = $derived(
    (graphique.points ?? []).map((p) => {
      const x = coord(p.x)
      const y = p.y !== undefined ? coord(p.y) : f(p.sur ?? 0)(x)
      return { ...p, x, y, couleur: COULEURS[p.couleur ?? 'bleu'], visible: dedans(x, y) }
    }),
  )
  const textes = $derived(
    (graphique.textes ?? []).map((t) => ({ ...t, x: coord(t.x), y: coord(t.y), couleur: t.couleur ? COULEURS[t.couleur] : undefined })),
  )
  /** Nom et coordonnées d'un point : « A(1,5 ; 2) » */
  const etiquette = (p: { nom?: string; coordonnees?: boolean; x: number; y: number }) =>
    (p.nom ? titreRiche(p.nom, formule) : '') +
    (p.coordonnees ? formule(`\\left(${nombre(p.x)}\\,;\\,${nombre(p.y)}\\right)`, false) : '')
  // Position en pourcentage du cadre, pour les étiquettes posées sur le dessin
  const gauche = (x: number) => `${(X(x) / L) * 100}%`
  const haut = (y: number) => `${(Y(y) / H) * 100}%`
</script>

<figure class="flex flex-col gap-2 m-0">
  <div class="relative">
  <svg viewBox="0 0 {L} {H}" class="w-full h-auto" role="img" aria-label={graphique.legende ?? 'Graphique'}>
    <defs>
      <clipPath id="cadre-{graphique.fonctions.join()}">
        <rect x={marge.g} y={marge.h} width={L - marge.g - marge.d} height={H - marge.h - marge.b} />
      </clipPath>
    </defs>
    {#each graduations(y0, y1) as v (v)}
      <line x1={X(x0)} x2={X(x1)} y1={Y(v)} y2={Y(v)} stroke="var(--app-presse)" stroke-width="1" />
      <text x={marge.g - 4} y={Y(v) + 4} text-anchor="end" font-size="10" fill="var(--app-discret)">{String(v).replace('.', ',')}</text>
    {/each}
    {#each graduations(x0, x1) as v (v)}
      <line x1={X(v)} x2={X(v)} y1={Y(y0)} y2={Y(y1)} stroke="var(--app-presse)" stroke-width="1" />
      <text x={X(v)} y={H - 6} text-anchor="middle" font-size="10" fill="var(--app-discret)">{String(v).replace('.', ',')}</text>
    {/each}
    <g clip-path="url(#cadre-{graphique.fonctions.join()})">
      {#if aire?.d}
        <path d={aire.d} fill="var(--app-action)" fill-opacity="0.22" stroke="none" />
      {/if}
      {#if y0 <= 0 && y1 >= 0}
        <line x1={X(x0)} x2={X(x1)} y1={Y(0)} y2={Y(0)} stroke="var(--app-discret)" stroke-width="1.3" />
      {/if}
      {#if x0 <= 0 && x1 >= 0}
        <line x1={X(0)} x2={X(0)} y1={Y(y0)} y2={Y(y1)} stroke="var(--app-discret)" stroke-width="1.3" />
      {/if}
      {#each graphique.fonctions as _, k (k)}
        <path
          d={trace(f(k))}
          fill="none"
          stroke={couleurCourbe(k)}
          stroke-width="2.2"
          stroke-dasharray={TIRETS[graphique.styles?.[k]?.trait ?? 'plein']}
          stroke-linecap="round"
        />
      {/each}
      {#if aire}
        {#each [['a', aire.a], ['b', aire.b]] as [nom, v] (nom)}
          {#if typeof graphique.aire?.[nom === 'a' ? 'de' : 'a'] === 'string'}
            <line x1={X(+v)} x2={X(+v)} y1={Y(0)} y2={Y(f(graphique.aire?.fonction ?? 0)(+v))} stroke="var(--app-action)" stroke-width="1.5" stroke-dasharray="3 3" />
          {/if}
        {/each}
      {/if}
    </g>
    {#if graphique.fonctions.length > 1}
      {#each graphique.fonctions as _, k (k)}
        <text x={L - marge.d - 4} y={marge.h + 14 + 14 * k} text-anchor="end" font-size="12" font-style="italic" fill={couleurCourbe(k)}>{nomsCourbes[k] ?? ''}</text>
      {/each}
    {/if}
    {#each points as p, k (k)}
      {#if p.visible}
        {#if p.forme === 'croix'}
          <path d="M{X(p.x) - 4},{Y(p.y) - 4} L{X(p.x) + 4},{Y(p.y) + 4} M{X(p.x) - 4},{Y(p.y) + 4} L{X(p.x) + 4},{Y(p.y) - 4}" stroke={p.couleur} stroke-width="2" stroke-linecap="round" />
        {:else}
          <circle cx={X(p.x)} cy={Y(p.y)} r="3.6" fill={p.forme === 'vide' ? 'var(--app-fond)' : p.couleur} stroke={p.couleur} stroke-width="1.8" />
        {/if}
      {/if}
    {/each}
  </svg>
  {#each points as p, k (k)}
    {#if p.visible && (p.nom || p.coordonnees)}
      <span class="etiquette-graphique" style="left: {gauche(p.x)}; top: {haut(p.y)}; color: {p.couleur}; translate: 5px -110%">{@html etiquette(p)}</span>
    {/if}
  {/each}
  {#each textes as t, k (k)}
    {#if dedans(t.x, t.y)}
      <span class="etiquette-graphique" style="left: {gauche(t.x)}; top: {haut(t.y)}; translate: -50% -50%{t.couleur ? `; color: ${t.couleur}` : ''}">{@html titreRiche(t.texte, formule)}</span>
    {/if}
  {/each}
  </div>
  {#each noms as n (n)}
    {@const c = graphique.curseurs![n]}
    <label class="flex flex-row items-center gap-3 text-sm">
      <span class="w-6 shrink-0">{@html formule(n, false)}</span>
      <input type="range" min={c[0]} max={c[1]} step={c[3] ?? (c[1] - c[0]) / 20} bind:value={valeurs[n]} class="flex-1 curseur-cours" aria-label="Valeur de {n}" />
      <output class="w-12 text-right tabular-nums">{String(Math.round(valeurs[n] * 100) / 100).replace('.', ',')}</output>
    </label>
  {/each}
  {#if resultat}
    <p class="text-center" aria-live="polite">{@html resultat}</p>
  {/if}
  {#if graphique.legende}
    <figcaption class="text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">{@html texteRiche(graphique.legende, formule)}</figcaption>
  {/if}
</figure>
