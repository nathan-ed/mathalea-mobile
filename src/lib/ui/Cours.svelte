<script lang="ts">
  // Fiche de cours : lue avant de s'entraîner (« Commencer l'entraînement » en
  // bas) ou reprise comme ressource depuis la page du parcours et le bilan.
  // Les questions « À toi » donnent un retour immédiat et ne comptent pas.
  import type { Fiche } from '$lib/catalogue'
  import { lienSur, ouvrirLien } from '$lib/fichiers'
  import { retourSi } from '$lib/navigation.svelte'
  import { texteRiche, titreRiche, type RenduFormule } from '$lib/texteRiche'
  import { boutonAction, boutonInverse, elementListe, listeGroupee, pastille, pastilleIncorrecte } from './classes'
  import EnTete from './EnTete.svelte'
  import GraphiqueCours from './GraphiqueCours.svelte'

  let {
    fiche,
    formule,
    onretour,
    oncommencer,
    onparcours,
  }: {
    fiche: Fiche
    formule: RenduFormule
    onretour: () => void
    oncommencer?: () => void // avant une séance : « Commencer l'entraînement »
    /** Fiche ouverte depuis l'onglet Fiches : « Ouvrir le parcours » mène à sa
     * page, qui seule décide ce qui peut se commencer (jamais un palier fermé) */
    onparcours?: () => void
  } = $props()

  retourSi(() => true, () => onretour())

  const riche = (t: string) => texteRiche(t, formule)
  // Intertitres de la fiche : petites capitales grises, comme les sections de l'app
  const etiquette = 'titre-section'
  // Grand titre dans la page ; celui de la barre revient quand il passe dessous
  let grandTitre: HTMLElement | undefined = $state()
  let grandTitreVisible = $state(true)
  $effect(() => {
    if (!grandTitre) return
    const o = new IntersectionObserver(([e]) => (grandTitreVisible = e.isIntersecting), { rootMargin: '-56px 0px 0px 0px' })
    o.observe(grandTitre)
    return () => o.disconnect()
  })
  // Étapes dévoilées des exemples, réponses données aux questions (par rang du bloc)
  let etapes: Record<number, number> = $state({})
  let choix: Record<number, number> = $state({})
  let saisies: Record<number, string> = $state({})
  let verifiees: Record<number, boolean> = $state({})
  const lireNombre = (t: string) => Number(t.trim().replace(/\s/g, '').replace(',', '.').replace('−', '-'))
  const juste = (attendu: number, t: string) => t.trim() !== '' && Math.abs(lireNombre(t) - attendu) <= 1e-6 * Math.max(1, Math.abs(attendu))
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre={fiche.titre} {onretour} titreCache={grandTitreVisible} />
  <!-- Une page de manuel : lecture continue, sans boîtes ; la règle « À retenir » est la seule surface -->
  <main class="fiche colonne lecture flex-1 flex flex-col gap-4 px-4 pt-1 {oncommencer ? 'pb-28' : 'pb-4 zone-sure-bas'} text-coopmaths-corpus dark:text-coopmathsdark-corpus">
    <p bind:this={grandTitre} class="text-2xl font-bold leading-tight text-coopmaths-struct dark:text-coopmathsdark-struct" aria-hidden="true">{@html titreRiche(fiche.titre, formule)}</p>
    {#each fiche.blocs as bloc, i (i)}
      {#if bloc.type === 'texte'}
        <div class="texte-cours leading-relaxed">{@html riche(bloc.texte)}</div>
      {:else if bloc.type === 'retenir'}
        <section class="regle surface flex flex-col gap-1 p-4" aria-label={(bloc.titre ?? 'À retenir').replace(/\$/g, '')}>
          <h2 class={etiquette}>{@html titreRiche(bloc.titre ?? 'À retenir', formule)}</h2>
          <div class="texte-cours leading-relaxed">{@html riche(bloc.texte)}</div>
        </section>
      {:else if bloc.type === 'exemple'}
        {@const vues = etapes[i] ?? 0}
        <section class="flex flex-col gap-2" aria-label={(bloc.titre ?? 'Exemple').replace(/\$/g, '')}>
          <h2 class={etiquette}>{@html titreRiche(bloc.titre ?? 'Exemple', formule)}</h2>
          <div class="texte-cours leading-relaxed">{@html riche(bloc.enonce)}</div>
          {#each bloc.etapes.slice(0, vues) as e, k (k)}
            <!-- Étapes numérotées, dévoilées une à une -->
            <div class="etape-exemple">
              <span class="num-etape" aria-hidden="true">{k + 1}</span>
              <div class="texte-cours leading-relaxed min-w-0 flex-1">{@html riche(e)}</div>
            </div>
          {/each}
          {#if vues < bloc.etapes.length}
            <button type="button" class="lien-fiche" onclick={() => (etapes[i] = vues + 1)}>
              {vues === 0 ? 'Voir la première étape' : 'Étape suivante'}
            </button>
          {/if}
        </section>
      {:else if bloc.type === 'question'}
        <section class="flex flex-col gap-2" aria-label="À toi">
          <h2 class={etiquette}>À toi</h2>
          <div class="texte-cours leading-relaxed">{@html riche(bloc.enonce)}</div>
          {#if bloc.choix}
            <div class={listeGroupee} role="radiogroup" aria-label="Réponses proposées">
              {#each bloc.choix as c, k (k)}
                <button type="button" role="radio" aria-checked={choix[i] === k} class="{elementListe} choix-fiche" onclick={() => (choix[i] = k)}>
                  <span class="rond-choix {choix[i] === k ? (k === bloc.bonne ? 'juste' : 'faux') : ''}" aria-hidden="true"></span>
                  <span class="texte-cours flex-1 min-w-0">{@html riche(c)}</span>
                  {#if choix[i] === k}
                    <span class={k === bloc.bonne ? pastille : pastilleIncorrecte}>{k === bloc.bonne ? 'Correcte' : 'Incorrecte'}</span>
                  {/if}
                </button>
              {/each}
            </div>
            {#if choix[i] !== undefined}
              <div class="texte-cours leading-relaxed" aria-live="polite">{@html riche(bloc.explication)}</div>
            {/if}
          {:else if bloc.reponse !== undefined}
            {@const attendu = bloc.reponse}
            <form
              class="flex flex-row items-end gap-3"
              onsubmit={(ev) => {
                ev.preventDefault()
                verifiees[i] = true
              }}
            >
              <label class="flex-1 flex flex-col gap-1 text-sm font-light">
                Ta réponse
                <input
                  type="text"
                  inputmode="decimal"
                  autocomplete="off"
                  bind:value={saisies[i]}
                  oninput={() => (verifiees[i] = false)}
                  class="block w-full text-base border h-10 px-2 rounded-lg border-coopmaths-action dark:border-coopmathsdark-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas focus:outline-0"
                />
              </label>
              <button type="submit" class={boutonInverse} style="min-height: 40px">Vérifier</button>
            </form>
            {#if verifiees[i]}
              {@const ok = juste(attendu, saisies[i] ?? '')}
              <div class="flex flex-col gap-2" aria-live="polite">
                <span class="self-start {ok ? pastille : pastilleIncorrecte}">{ok ? 'Correcte' : 'Incorrecte'}</span>
                <div class="texte-cours leading-relaxed">{@html riche(bloc.explication)}</div>
              </div>
            {/if}
          {/if}
        </section>
      {:else if bloc.type === 'graphique'}
        <GraphiqueCours graphique={bloc} {formule} />
      {:else if bloc.type === 'image'}
        <figure class="flex flex-col gap-2 m-0">
          <img src={bloc.src} alt={bloc.alt} class="w-full h-auto rounded-xl" />
          {#if bloc.legende}
            <figcaption class="texte-cours text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">{@html riche(bloc.legende)}</figcaption>
          {/if}
        </figure>
      {:else if bloc.type === 'lien' && lienSur(bloc.lien)}
        <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => ouvrirLien(bloc.lien)}>
          <i aria-hidden="true" class="bx bx-link-external"></i>
          {bloc.titre}
        </button>
      {/if}
    {/each}
  </main>
  {#if oncommencer || onparcours}
    <footer
      class="barre-bas fixed bottom-0 left-0 right-0 z-20 px-4 py-3 zone-sure-bas
      border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
    >
      <div class="colonne lecture">
        {#if oncommencer}
          <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={oncommencer}>Commencer l’entraînement</button>
        {:else}
          <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={onparcours}>Ouvrir le parcours</button>
        {/if}
      </div>
    </footer>
  {/if}
</div>

<style>
  /* Intertitres : plus d'air avant une nouvelle partie de la fiche */
  .fiche :global(.titre-section) {
    margin: 1rem 0 0;
  }
  .regle :global(.titre-section) {
    margin: 0 0 0.25rem;
    color: var(--app-struct);
  }
  .fiche {
    font-size: 1.0625rem;
  }
  .etape-exemple {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .num-etape {
    flex: none;
    width: 24px;
    height: 24px;
    margin-top: 2px;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 700;
    background: var(--app-fond-2);
    color: var(--app-struct);
  }
  .lien-fiche {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    font-weight: 600;
    color: var(--app-action);
  }
  .choix-fiche {
    justify-content: flex-start;
  }
  .rond-choix {
    flex: none;
    width: 22px;
    height: 22px;
    border-radius: 9999px;
    border: 2px solid var(--app-discret);
  }
  .rond-choix.juste {
    border-color: var(--app-vert);
    background: var(--app-vert);
    box-shadow: inset 0 0 0 4px var(--app-fond);
  }
  .rond-choix.faux {
    border-color: var(--app-action);
    background: var(--app-action);
    box-shadow: inset 0 0 0 4px var(--app-fond);
  }
</style>
