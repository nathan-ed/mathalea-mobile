<script lang="ts">
  // Page d'une session de l'enseignant (onglet En classe), où mène aussi
  // « Lancer la session ». Sans réponse : QR code et code à montrer aux élèves,
  // puis lecture des QR codes des réponses. Avec des réponses : celles de la
  // classe (ReponsesClasse), le code et le QR code restant à portée.
  import type { Moteur } from '$lib/moteur'
  import { reglageQr } from '$lib/progression'
  import { dessinerQr } from '$lib/qr'
  import type { Releve } from '$lib/releve'
  import { boutonLien } from './classes'
  import EnTete from './EnTete.svelte'
  import LectureReponses from './LectureReponses.svelte'
  import QrSession from './QrSession.svelte'
  import ReponsesClasse from './ReponsesClasse.svelte'

  let {
    releve,
    releves,
    moteur,
    niveau = '',
    onsauver,
    onretour,
  }: {
    releve: Releve
    releves: Releve[]
    moteur: Moteur
    niveau?: string
    onsauver: (r: Releve[]) => Promise<void>
    onretour: () => void
  } = $props()

  let pleinEcran = $state(false)
  // Page mise à jour quand la caméra se referme (ou après un import), pas à
  // chaque QR code lu : la caméra reste ouverte pendant tout le relevé
  // svelte-ignore state_referenced_locally
  let nbAffiche = $state(releve.recues.length)
  const actualiser = () => (nbAffiche = releve.recues.length)
  const r = $derived(reglageQr(releve.code))
  const reglage = $derived(
    [
      releve.classe,
      r.quand === 'aucun' ? 'Sans QR code des réponses' : `${r.quand === 'avant' ? 'QR code avant la correction' : 'QR code après la correction'}${r.prenom ? ', avec prénom' : ''}`,
    ]
      .filter(Boolean)
      .join(' · '),
  )
  const svg = $derived(releve.invitation ? dessinerQr(releve.invitation) : '')
  const discret = 'text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
</script>

{#snippet code(taille: string)}
  <div class="font-light text-coopmaths-struct dark:text-coopmathsdark-struct" style="font-size: {taille}; letter-spacing: 0.15em; line-height: 1.2">{releve.code}</div>
{/snippet}

{#if nbAffiche}
  <!-- Nouvelles réponses : la classe est recalculée -->
  {#key nbAffiche}
    <ReponsesClasse
      {releve}
      {moteur}
      {niveau}
      onmaj={(x) => onsauver(releves.map((y) => (y.cle === x.cle ? x : y)))}
      {onretour}
    >
      {#snippet haut()}
        <section class="flex flex-col gap-2 rounded-2xl p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark" aria-label="Session {releve.code}">
          <div class="flex flex-row items-center justify-between gap-3">
            {@render code('1.75rem')}
            {#if releve.invitation}
              <button type="button" class="{boutonLien} shrink-0" onclick={() => (pleinEcran = true)}>
                <i aria-hidden="true" class="bx bx-qr text-xl"></i> QR code
              </button>
            {/if}
          </div>
          <p class={discret}>{reglage}</p>
          {#if r.quand !== 'aucun'}<LectureReponses {releves} {onsauver} onfin={actualiser} />{/if}
        </section>
      {/snippet}
    </ReponsesClasse>
  {/key}
{:else}
  <div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
    <EnTete titre={releve.titre || 'Session'} {onretour} />
    <main class="flex-1 flex flex-col items-center gap-3 p-4 zone-sure-bas">
      {#if svg}
        <!-- Fond blanc dans les deux thèmes : un QR code se lit mal en clair sur sombre -->
        <button
          type="button"
          class="qr-page w-full rounded-2xl bg-white p-2"
          aria-label="QR code de la session {releve.code}, en plein écran"
          onclick={() => (pleinEcran = true)}
        >
          {@html svg}
        </button>
      {/if}
      {@render code('2.5rem')}
      <p class="text-center {discret}">{reglage}</p>
      {#if svg}
        <button type="button" class="{boutonLien} w-full" style="min-height: 44px" onclick={() => (pleinEcran = true)}>
          <i aria-hidden="true" class="bx bx-fullscreen text-xl"></i> Plein écran
        </button>
      {/if}
      {#if r.quand !== 'aucun'}
        <div class="w-full"><LectureReponses {releves} {onsauver} principal onfin={actualiser} /></div>
      {/if}
    </main>
  </div>
{/if}

{#if pleinEcran && releve.invitation}
  <QrSession invitation={releve.invitation} code={releve.code} titre={releve.titre} onfermer={() => (pleinEcran = false)} />
{/if}

<style>
  .qr-page {
    max-width: min(22rem, 45vh);
  }
  .qr-page :global(svg) {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
