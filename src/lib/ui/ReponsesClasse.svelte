<script lang="ts">
  // Réponses de la classe à une session partagée, question par question, les
  // moins réussies d'abord. L'app ne croit aucun score reçu : elle regénère les
  // questions de la session et revérifie chaque réponse elle-même, hors de
  // l'écran, comme la relecture d'un passage.
  import { onMount, tick, type Snippet } from 'svelte'
  import type { Parcours } from '$lib/catalogue'
  import type { ExercicePrepare, Moteur } from '$lib/moteur'
  import { retourSi } from '$lib/navigation.svelte'
  import { cleQuestion, graineDeSession } from '$lib/progression'
  import {
    bilanDesEleves,
    bilanDesQuestions,
    empreinteEnonces,
    ordreDesQuestions,
    type ExerciceReleve,
    type Releve,
    type VerdictQuestion,
  } from '$lib/releve'
  import { boutonInverse, listeGroupee, pastille, pastilleScore } from './classes'
  import EnTete from './EnTete.svelte'

  let {
    releve,
    moteur,
    niveau = '',
    onmaj,
    onretour,
    haut,
  }: {
    releve: Releve
    moteur: Moteur
    niveau?: string
    onmaj: (r: Releve) => void // verdicts recalculés : à garder
    onretour: () => void
    haut?: Snippet // en tête de page : la session (code, QR code, lecture des réponses)
  } = $props()

  retourSi(() => true, () => onretour())

  let zoneVerif: HTMLDivElement
  let exercices: Record<number, ExercicePrepare> = $state({})
  let empreintes: Record<number, string> = {}
  type Calcul = NonNullable<Releve['calcul']>
  let calcul = $state<Calcul | null>(null)
  let progression = $state('')
  let erreur = $state('')
  let ouvertes: Record<string, boolean> = $state({})

  // Exercices de la session : les mêmes pour tous les élèves (même code, même version)
  const exercicesSession = $derived.by(() => {
    const x: Record<number, ExerciceReleve> = {}
    for (const r of releve.recues) for (const [e, ex] of Object.entries(r.x)) x[Number(e)] ??= ex
    return x
  })
  const etapes = $derived(
    Object.keys(exercicesSession)
      .map(Number)
      .sort((a, b) => a - b),
  )
  const nbEleves = $derived(releve.recues.length)
  const graine = (etape: number) => graineDeSession(releve.code, { id: releve.parcours, version: releve.version } as Parcours, etape)

  const htmlQuestions = (ex: ExercicePrepare) =>
    ex.questions.map((q, i) => (i === 0 && q.contexte.trim() ? `<div>${q.contexte}</div>` : '') + `<div>${q.enonce}</div>`).join('')

  const attendre = () => new Promise((r) => requestAnimationFrame(() => r(null)))

  onMount(async () => {
    try {
      for (const etape of etapes) {
        const x = exercicesSession[etape]
        const ex = await moteur.preparerExercice(
          { uuid: x.u, nbQuestions: x.n, sup: x.s, sup2: x.s2, sup3: x.s3, sup4: x.s4, alea: graine(etape) },
          etape,
        )
        exercices[etape] = ex
        empreintes[etape] = empreinteEnonces(ex.questions)
      }
      await recalculer()
    } catch (e) {
      erreur = `Impossible de regénérer les questions de cette session : ${(e as Error).message}`
    }
  })

  /** Revérifie les réponses des passages pas encore vérifiés avec ce moteur */
  async function recalculer() {
    const garde = releve.calcul?.moteur === moteur.VERSION_MOTEUR ? releve.calcul : null
    const c = { moteur: moteur.VERSION_MOTEUR, verdicts: { ...(garde?.verdicts ?? {}) }, hors: { ...(garde?.hors ?? {}) } }
    const aFaire = releve.recues.filter((r) => !c.verdicts[r.d])
    let n = 0
    for (const r of aFaire) {
      progression = `Vérification des réponses : ${++n} sur ${aFaire.length}`
      const verdicts: Record<string, VerdictQuestion> = {}
      const hors: number[] = []
      for (const etape of etapes) {
        const ex = exercices[etape]
        if (!ex) continue
        const cles = ex.questions.map((_, q) => cleQuestion(etape, q)).filter((k) => r.r[k])
        if (!cles.length) continue
        // Énoncés différents (autre version du moteur) : rien à revérifier
        if (r.e?.[etape] && r.e[etape] !== empreintes[etape]) {
          hors.push(etape)
          continue
        }
        zoneVerif.innerHTML = htmlQuestions(ex)
        await moteur.afficher(zoneVerif)
        ;(ex.interne as { answers?: Record<string, string> }).answers = {}
        await moteur.ecrireReponses(Object.assign({}, ...cles.map((k) => r.r[k])))
        await tick()
        await attendre()
        for (const k of cles) {
          const q = Number(k.split('-')[1])
          try {
            const v = moteur.verifier(ex, q)
            verdicts[k] = { juste: v.juste, score: v.total > 0 ? v.points / v.total : v.juste ? 1 : 0 }
          } catch {
            /* question non vérifiable : ignorée */
          }
        }
      }
      c.verdicts[r.d] = verdicts
      if (hors.length) c.hors[r.d] = hors
    }
    zoneVerif.innerHTML = ''
    progression = ''
    calcul = c
    if (aFaire.length || !garde) onmaj({ ...releve, calcul: c })
  }

  const ordre = $derived.by(() => {
    if (!releve.recues.length || !Object.keys(exercices).length) return []
    const nb = Object.fromEntries(etapes.map((e) => [e, exercices[e]?.questions.length ?? 0]))
    return ordreDesQuestions(releve.recues[0], nb, etapes)
  })

  const estHors = (c: Calcul) => (r: { d: string }, cle: string) => (c.hors[r.d] ?? []).includes(Number(cle.split('-')[0]))
  const questions = $derived.by(() => {
    const c: Calcul | null = calcul
    if (!c) return []
    const liste = bilanDesQuestions(ordre, releve.recues, c.verdicts, estHors(c))
    return liste.filter((q) => q.repondu || q.horsVersion).sort((a, b) => taux(a) - taux(b) || a.rang - b.rang)
  })
  // Élèves : les plus en difficulté d'abord
  const eleves = $derived.by(() => {
    const c: Calcul | null = calcul
    if (!c) return []
    return bilanDesEleves(ordre, releve.recues, c.verdicts, estHors(c)).sort((a, b) => pct(a) - pct(b) || a.numero - b.numero)
  })
  const nomDe = $derived(new Map(eleves.map((e) => [e.d, e.nom])))
  const arrondi = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1))
  const pct = (e: { points: number; sur: number }) => (e.sur ? Math.round((100 * e.points) / e.sur) : 0)
  // Résumé : réussite moyenne, répartition des élèves, questions à reprendre
  const resume = $derived.by(() => {
    const avec = eleves.filter((e) => e.sur)
    const moyenne = avec.length ? Math.round(avec.reduce((a, e) => a + pct(e), 0) / avec.length) : 0
    const tranches = [
      { libelle: 'moins de 50 %', nb: avec.filter((e) => pct(e) < 50).length, score: 30 },
      { libelle: 'de 50 à 79 %', nb: avec.filter((e) => pct(e) >= 50 && pct(e) < 80).length, score: 65 },
      { libelle: '80 % et plus', nb: avec.filter((e) => pct(e) >= 80).length, score: 90 },
    ]
    const aReprendre = questions.filter((q) => q.repondu && taux(q) < 70).slice(0, 3)
    return { moyenne, tranches, aReprendre }
  })
  let vue: 'questions' | 'eleves' = $state('questions')
  let toutes: Record<string, boolean> = $state({})
  let eleveOuvert: string | null = $state(null)
  const horsVersion = $derived.by(() => {
    const c: Calcul | null = calcul
    return c ? Object.keys(c.hors).length : 0
  })
  const taux = (q: { repondu: number; reussi: number }) => (q.repondu ? Math.round((100 * q.reussi) / q.repondu) : 101)
  const questionDe = (cle: string) => {
    const [e, q] = cle.split('-').map(Number)
    return { ex: exercices[e], q }
  }
  const enonceHtml = (cle: string) => {
    const { ex, q } = questionDe(cle)
    if (!ex) return ''
    const qp = ex.questions[q]
    return (qp.contexte.trim() ? `<div class="mb-2">${qp.contexte}</div>` : '') + `<div>${qp.enonce}</div>`
  }

  // Formules affichées par KaTeX, comme dans les exercices
  function rendu(noeud: HTMLElement, html: string) {
    const maj = (h: string) => {
      noeud.innerHTML = h
      void moteur.afficher(noeud)
    }
    maj(html)
    return { update: maj }
  }
  const echapper = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // Réponse saisie (LaTeX de MathLive) : chaque champ en formule
  const reponseHtml = (t: string) =>
    t
      .split(' ; ')
      .map((p) => (/^[\s\S]*[\\^_{}]|^[-+\d.,/=<>()\s×÷a-z]+$/i.test(p) ? `$${echapper(p)}$` : echapper(p)))
      .join(' ; ')

</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre={releve.titre || 'Réponses de la classe'} onretour={() => onretour()}>
    {#snippet droite()}
      <span class="px-3"><span class={pastille}>{nbEleves} élève{nbEleves > 1 ? 's' : ''}</span></span>
    {/snippet}
  </EnTete>

  <main class="flex-1 flex flex-col gap-4 p-4 zone-sure-bas">
    {@render haut?.()}
    {#if erreur}
      <p class="font-bold text-coopmaths-action dark:text-coopmathsdark-action" role="alert">{erreur}</p>
    {:else if !calcul}
      <p class="py-6 text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus" role="status">{progression || 'Préparation des questions de la session…'}</p>
    {:else}
      <!-- Résumé de la classe -->
      <section class="flex flex-col gap-3 rounded-2xl p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark" aria-label="Résumé de la classe">
        <div class="flex flex-row items-baseline justify-between gap-3">
          <h2 class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">La classe</h2>
          <span class="text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">Session {releve.code}</span>
        </div>
        <p class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">
          <span class="font-light text-coopmaths-struct dark:text-coopmathsdark-struct" style="font-size: 2.25rem; line-height: 1">{resume.moyenne} %</span>
          de réussite en moyenne
        </p>
        <div class="flex flex-row flex-wrap gap-2">
          {#each resume.tranches as t (t.libelle)}
            <span class={pastilleScore(t.score)}>{t.nb} élève{t.nb > 1 ? 's' : ''} : {t.libelle}</span>
          {/each}
        </div>
        <p class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus">
          {#if resume.aReprendre.length}
            À reprendre : {resume.aReprendre.map((q) => `question ${q.rang} (${taux(q)} %)`).join(', ')}.
          {:else}
            Aucune question sous 70 % de réussite.
          {/if}
        </p>
        {#if horsVersion}
          <p class="text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest" role="status">
            {horsVersion} élève{horsVersion > 1 ? 's avaient' : ' avait'} une autre version des exercices : certaines de leurs réponses ne sont pas comptées.
          </p>
        {/if}
      </section>

      <!-- Deux vues : par question, par élève -->
      <div class="flex flex-row gap-1 rounded-xl p-1 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark" role="tablist" aria-label="Vue">
        {#each [['questions', 'Questions'], ['eleves', `Élèves (${nbEleves})`]] as [v, libelleVue] (v)}
          <button
            type="button"
            role="tab"
            aria-selected={vue === v}
            class="flex-1 rounded-lg py-2 text-sm font-semibold transition-colors duration-150
            {vue === v
              ? 'bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-struct dark:text-coopmathsdark-struct shadow-sm'
              : 'text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'}"
            onclick={() => (vue = v as 'questions' | 'eleves')}
          >
            {libelleVue}
          </button>
        {/each}
      </div>

      {#if vue === 'questions'}
        {#each questions as q (q.cle)}
          {@const t = taux(q)}
          <section class="flex flex-col gap-3 rounded-2xl p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark" aria-label="Question {q.rang}">
            <div class="flex flex-row items-center justify-between gap-3">
              <h2 class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Question {q.rang}</h2>
              {#if q.repondu}
                <span class={pastilleScore(t)}>{t} % · {q.repondu} réponse{q.repondu > 1 ? 's' : ''}</span>
              {/if}
            </div>
            <div class="enonce-releve contenu-mathalea text-coopmaths-corpus dark:text-coopmathsdark-corpus" use:rendu={enonceHtml(q.cle)}></div>
            {#if toutes[q.cle]}
              <div class="flex flex-col gap-1">
                <p class="text-sm font-bold text-coopmaths-corpus dark:text-coopmathsdark-corpus">Toutes les réponses</p>
                <ul class="flex flex-col gap-2">
                  {#each q.reponses as g (`${g.juste}-${g.reponse}`)}
                    <li class="flex flex-col text-coopmaths-corpus dark:text-coopmathsdark-corpus">
                      <span class="flex flex-row items-baseline justify-between gap-3">
                        <span class="min-w-0 overflow-x-auto" use:rendu={reponseHtml(g.reponse)}></span>
                        <span class="shrink-0 {pastilleScore(g.juste ? 100 : 0)}">{g.juste ? 'Correcte' : 'Incorrecte'} · {g.nb}</span>
                      </span>
                      <span class="text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">{g.passages.map((d) => nomDe.get(d)).join(', ')}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            {:else if q.erreurs.length}
              <div class="flex flex-col gap-1">
                <p class="text-sm font-bold text-coopmaths-corpus dark:text-coopmathsdark-corpus">Mauvaises réponses</p>
                <ul class="flex flex-col gap-1">
                  {#each q.erreurs as e (e.reponse)}
                    <li class="flex flex-row items-baseline justify-between gap-3 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
                      <span class="min-w-0 overflow-x-auto" use:rendu={reponseHtml(e.reponse)}></span>
                      <span class="shrink-0 font-bold">{e.nb} élève{e.nb > 1 ? 's' : ''}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            {:else if q.repondu}
              <p class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus">Aucune mauvaise réponse.</p>
            {/if}
            {#if q.horsVersion}
              <p class="text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
                {q.horsVersion} réponse{q.horsVersion > 1 ? 's' : ''} à une autre version de la question, non comptée{q.horsVersion > 1 ? 's' : ''}.
              </p>
            {/if}
            <div class="flex flex-row flex-wrap gap-2">
              <button type="button" class="{boutonInverse}" style="min-height: 44px" aria-expanded={!!toutes[q.cle]} onclick={() => (toutes[q.cle] = !toutes[q.cle])}>
                {toutes[q.cle] ? 'Mauvaises réponses seulement' : 'Toutes les réponses'}
              </button>
              <button type="button" class="{boutonInverse}" style="min-height: 44px" aria-expanded={!!ouvertes[q.cle]} onclick={() => (ouvertes[q.cle] = !ouvertes[q.cle])}>
                {ouvertes[q.cle] ? 'Masquer la correction' : 'Voir la correction'}
              </button>
            </div>
            {#if ouvertes[q.cle]}
              <div class="contenu-mathalea text-coopmaths-corpus dark:text-coopmathsdark-corpus" use:rendu={questionDe(q.cle).ex?.questions[questionDe(q.cle).q].correction ?? ''}></div>
            {/if}
          </section>
        {/each}
      {:else}
        <ul class={listeGroupee} aria-label="Élèves">
          {#each eleves as e (e.d)}
            <li class="bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
              <button
                type="button"
                class="w-full flex flex-row items-center justify-between gap-3 px-4 py-3 text-left"
                aria-expanded={eleveOuvert === e.d}
                onclick={() => (eleveOuvert = eleveOuvert === e.d ? null : e.d)}
              >
                <span class="min-w-0 truncate font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{e.nom}</span>
                <span class="flex flex-row items-center gap-2">
                  <span class={pastilleScore(pct(e))}>{arrondi(e.points)}/{e.sur}</span>
                  <i aria-hidden="true" class="bx {eleveOuvert === e.d ? 'bx-chevron-up' : 'bx-chevron-down'} text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
                </span>
              </button>
              {#if eleveOuvert === e.d}
                <ul class="flex flex-col gap-2 px-4 pb-4">
                  {#each e.details as d (d.cle)}
                    <li class="flex flex-row items-baseline justify-between gap-3 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
                      <span class="shrink-0 text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">Q{d.rang}</span>
                      <span class="min-w-0 flex-1 overflow-x-auto">
                        {#if d.reponse === null}<span class="text-sm">pas de réponse</span>{:else}<span use:rendu={reponseHtml(d.reponse)}></span>{/if}
                      </span>
                      {#if d.juste !== null}
                        <span class="shrink-0 {pastilleScore(d.juste ? 100 : 0)}">{d.juste ? 'Correcte' : 'Incorrecte'}</span>
                      {:else if d.reponse !== null}
                        <span class="shrink-0 text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">non vérifiée</span>
                      {/if}
                    </li>
                  {/each}
                </ul>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    {/if}
  </main>
  <!-- Vérification hors de l'écran : les champs de MathALÉA doivent exister dans la page -->
  <div bind:this={zoneVerif} class="zone-verif contenu-mathalea" aria-hidden="true"></div>
</div>

<style>
  .zone-verif {
    position: fixed;
    left: -10000px;
    top: 0;
    width: 720px;
    visibility: hidden;
  }
  /* Énoncé seulement : les champs de réponse ne se remplissent pas ici */
  .enonce-releve :global(math-field),
  .enonce-releve :global(input) {
    pointer-events: none;
  }
  /* Réponse en plusieurs étapes de calcul : pas de « Ajouter une ligne » ici */
  .enonce-releve :global(.pmla-add) {
    display: none;
  }
</style>
