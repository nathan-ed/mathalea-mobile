<script lang="ts">
  // « Teste ton niveau » : une ceinture par niveau, du CM1 à la Terminale.
  // Toucher un niveau ouvre un panneau du bas : repérage, validation ou reprise.
  import { NB_REPERAGE, NB_VALIDATION, NIVEAUX_TEST, SEUIL_TEST, ceintureDu, couleurDu, type EtatTest } from '$lib/testNiveau'
  import { boutonAction, boutonInverse } from './classes'
  import EnTete from './EnTete.svelte'
  import Feuille from './Feuille.svelte'

  let {
    etat,
    disponibles,
    enCours,
    onreperage,
    onvalidation,
    onreprendre,
    onretour,
  }: {
    etat: EtatTest
    disponibles: Record<string, number> | null // sujets par niveau (null : lecture en cours)
    enCours: Record<string, boolean> // tentative commencée, pas terminée
    onreperage: (rang: number) => void // nouveau tirage
    onvalidation: (rang: number) => void
    onreprendre: (rang: number) => void
    onretour: () => void
  } = $props()

  let choisi: number | null = $state(null)

  const date = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const niveaux = $derived(NIVEAUX_TEST.map((n, rang) => ({ ...n, rang })).filter((n) => (disponibles?.[n.cle] ?? 0) > 0))
  // Niveau proposé : celui qui suit le dernier validé
  const dernierValide = $derived(Math.max(-1, ...NIVEAUX_TEST.map((n, rang) => (etat[n.cle]?.valideLe ? rang : -1))))
  const propose = $derived(niveaux.find((n) => n.rang > dernierValide)?.rang ?? null)

  function etatDu(cle: string) {
    const e = etat[cle]
    if (enCours[cle]) return 'En cours'
    if (e?.reperage) return 'Repérage réussi : validation à faire'
    if (e?.valideLe) return `Validé le ${date(e.valideLe)}`
    return ''
  }

  function agir(fn: (rang: number) => void) {
    const rang = choisi!
    choisi = null
    fn(rang)
  }
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre="Teste ton niveau" {onretour} />

  <main class="flex-1 flex flex-col gap-3 p-4 zone-sure-bas">
    <p class="pl-2 text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
      Questions des sujets de la Course aux nombres. Par niveau : {NB_REPERAGE} questions de repérage, puis {NB_VALIDATION} pour valider. Il faut
      {SEUIL_TEST} % pour réussir.
    </p>
    {#if disponibles === null}
      <p class="py-8 text-center font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest" role="status">Lecture des sujets…</p>
    {:else}
      {#each niveaux as n (n.cle)}
        <button
          type="button"
          class="w-full flex flex-row items-center justify-between gap-3 text-left rounded-2xl px-4 py-3
          bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
          active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest transition-colors duration-150"
          onclick={() => (choisi = n.rang)}
        >
          <span class="flex flex-row items-center gap-3 min-w-0">
            <span
              aria-hidden="true"
              class="shrink-0 w-10 h-5 rounded border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
              style="background-color: {couleurDu(n.rang)}"
            ></span>
            <span class="flex flex-col min-w-0">
              <span class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{n.nom} · {ceintureDu(n.rang).toLowerCase()}</span>
              {#if etatDu(n.cle)}
                <span class="text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">{etatDu(n.cle)}</span>
              {:else if n.rang === propose}
                <span class="text-sm font-bold text-coopmaths-action dark:text-coopmathsdark-action">Commence ici</span>
              {/if}
            </span>
          </span>
          {#if etat[n.cle]?.valideLe}
            <i aria-hidden="true" class="bx bxs-check-circle shrink-0 text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
          {:else}
            <i aria-hidden="true" class="bx bx-chevron-right shrink-0 text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
          {/if}
        </button>
      {:else}
        <p class="py-8 text-center font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
          Le moteur installé ne propose pas encore les sujets de la Course aux nombres.
        </p>
      {/each}
    {/if}
  </main>

  {#if choisi !== null}
    {@const n = NIVEAUX_TEST[choisi]}
    <Feuille onfermer={() => (choisi = null)}>
      <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{n.nom} · {ceintureDu(choisi).toLowerCase()}</p>
      {#if enCours[n.cle]}
        <p class="text-sm">Une tentative est en cours : tu reprends là où tu en étais.</p>
        <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={() => agir(onreprendre)}>Reprendre</button>
        <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => agir(onreperage)}>Recommencer avec de nouvelles questions</button>
      {:else if etat[n.cle]?.reperage}
        <p class="text-sm">Repérage réussi. Validation : {NB_VALIDATION} questions, {SEUIL_TEST} % pour obtenir la ceinture.</p>
        <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={() => agir(onvalidation)}>Passer la validation</button>
        <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => agir(onreperage)}>Refaire le repérage</button>
      {:else}
        <p class="text-sm">
          {NB_REPERAGE} questions de repérage. Avec {SEUIL_TEST} % ou plus, {NB_VALIDATION} questions de validation donnent la ceinture.
        </p>
        <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={() => agir(onreperage)}>
          {etat[n.cle]?.valideLe ? 'Repasser le test' : 'Commencer'}
        </button>
      {/if}
    </Feuille>
  {/if}
</div>
