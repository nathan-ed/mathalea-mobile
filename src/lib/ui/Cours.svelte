<script lang="ts">
  // Fiche de cours : lue avant de s'entraîner (« Commencer l'entraînement » en
  // bas) ou reprise comme ressource depuis la page du parcours et le bilan.
  // Les questions « À toi » donnent un retour immédiat et ne comptent pas.
  import type { Fiche } from '$lib/catalogue'
  import { ouvrirLien } from '$lib/fichiers'
  import { retourSi } from '$lib/navigation.svelte'
  import { texteRiche, titreRiche, type RenduFormule } from '$lib/texteRiche'
  import { boutonAction, boutonInverse, boutonLien, elementListe, listeGroupee, pastille, pastilleIncorrecte, pastilleScore } from './classes'
  import EnTete from './EnTete.svelte'
  import GraphiqueCours from './GraphiqueCours.svelte'

  let {
    fiche,
    formule,
    onretour,
    oncommencer,
  }: {
    fiche: Fiche
    formule: RenduFormule
    onretour: () => void
    oncommencer?: () => void // avant une séance : « Commencer l'entraînement »
  } = $props()

  retourSi(() => true, () => onretour())

  const riche = (t: string) => texteRiche(t, formule)
  const etiquette = 'text-sm font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  // Étapes dévoilées des exemples, réponses données aux questions (par rang du bloc)
  let etapes: Record<number, number> = $state({})
  let choix: Record<number, number> = $state({})
  let saisies: Record<number, string> = $state({})
  let verifiees: Record<number, boolean> = $state({})
  const lireNombre = (t: string) => Number(t.trim().replace(/\s/g, '').replace(',', '.').replace('−', '-'))
  const juste = (attendu: number, t: string) => t.trim() !== '' && Math.abs(lireNombre(t) - attendu) <= 1e-6 * Math.max(1, Math.abs(attendu))
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre={fiche.titre} {onretour} />
  <main class="colonne flex-1 flex flex-col gap-5 p-4 {oncommencer ? 'pb-28' : 'zone-sure-bas'} text-coopmaths-corpus dark:text-coopmathsdark-corpus">
    {#each fiche.blocs as bloc, i (i)}
      {#if bloc.type === 'texte'}
        <div class="texte-cours leading-relaxed">{@html riche(bloc.texte)}</div>
      {:else if bloc.type === 'retenir'}
        <section class="flex flex-col gap-2 rounded-2xl p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark" aria-label={(bloc.titre ?? 'À retenir').replace(/\$/g, '')}>
          <h2 class={etiquette}>{@html titreRiche(bloc.titre ?? 'À retenir', formule)}</h2>
          <div class="texte-cours leading-relaxed">{@html riche(bloc.texte)}</div>
        </section>
      {:else if bloc.type === 'exemple'}
        {@const vues = etapes[i] ?? 0}
        <section class="flex flex-col gap-3 rounded-2xl p-4 border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest" aria-label={(bloc.titre ?? 'Exemple').replace(/\$/g, '')}>
          <h2 class={etiquette}>{@html titreRiche(bloc.titre ?? 'Exemple', formule)}</h2>
          <div class="texte-cours leading-relaxed">{@html riche(bloc.enonce)}</div>
          {#each bloc.etapes.slice(0, vues) as e, k (k)}
            <div class="texte-cours leading-relaxed border-l-4 border-coopmaths-struct-light dark:border-coopmathsdark-struct-light pl-4">{@html riche(e)}</div>
          {/each}
          {#if vues < bloc.etapes.length}
            <button type="button" class={boutonLien} onclick={() => (etapes[i] = vues + 1)}>
              {vues === 0 ? 'Voir la première étape' : 'Étape suivante'}
            </button>
          {/if}
        </section>
      {:else if bloc.type === 'question'}
        <section class="flex flex-col gap-3 rounded-2xl p-4 border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest" aria-label="À toi">
          <h2 class={etiquette}>À toi</h2>
          <div class="texte-cours leading-relaxed">{@html riche(bloc.enonce)}</div>
          {#if bloc.choix}
            <div class={listeGroupee} role="radiogroup" aria-label="Réponses proposées">
              {#each bloc.choix as c, k (k)}
                <button type="button" role="radio" aria-checked={choix[i] === k} class={elementListe} onclick={() => (choix[i] = k)}>
                  <span class="texte-cours">{@html riche(c)}</span>
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
      {:else if bloc.type === 'lien'}
        <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => ouvrirLien(bloc.lien)}>
          <i aria-hidden="true" class="bx bx-link-external"></i>
          {bloc.titre}
        </button>
      {/if}
    {/each}
  </main>
  {#if oncommencer}
    <footer
      class="fixed bottom-0 left-0 right-0 z-20 px-4 py-3 zone-sure-bas
      border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
    >
      <div class="colonne">
        <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={oncommencer}>Commencer l’entraînement</button>
      </div>
    </footer>
  {/if}
</div>
