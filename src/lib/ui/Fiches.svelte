<script lang="ts">
  // Onglet Fiches de l'élève : recherche, ses fiches enregistrées dans son
  // ordre, puis toutes les fiches de ses parcours par chapitre (fiches.ts).
  // Chapitres dépliables, et parcours dépliables dans un chapitre qui en a
  // plusieurs : sinon la liste est trop longue (une fiche par palier).
  import { basculer, chercherFiches, deplacer, estEnregistree, fichesDes, parChapitre, parParcours, type FicheDuParcours } from '$lib/fiches'
  import type { Parcours } from '$lib/catalogue'
  import { cleChapitre } from '$lib/explorer'
  import { elementListe, listeGroupee } from './classes'

  let {
    parcours,
    enregistrees,
    onenregistrer,
    onouvrir,
    ouverts = $bindable([]),
    recherche = $bindable(''),
  }: {
    parcours: Parcours[]
    enregistrees: FicheDuParcours[]
    onenregistrer: (liste: FicheDuParcours[]) => void
    onouvrir: (f: FicheDuParcours) => void
    ouverts?: string[] // chapitres et parcours dépliés, gardés au retour d'une fiche (pas dans le stockage)
    recherche?: string
  } = $props()

  const toutes = $derived(fichesDes(parcours))
  const chapitres = $derived(parChapitre(toutes).map((c) => ({ ...c, cle: 'c:' + cleChapitre(c), parcours: parParcours(c.fiches) })))
  const trouvees = $derived(chercherFiches(toutes, recherche))
  const ouvrirFermer = (cle: string) => (ouverts = ouverts.includes(cle) ? ouverts.filter((c) => c !== cle) : [...ouverts, cle])
  // Un seul chapitre : déplié d'office mais refermable (on retient alors qu'il est fermé)
  const seul = $derived(chapitres.length === 1)
  const deplie = (cle: string) => (seul ? !ouverts.includes('f:' + cle) : ouverts.includes(cle))
  const basculerChapitre = (cle: string) => ouvrirFermer(seul ? 'f:' + cle : cle)

  const titreSection = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  const icone = 'p-2 text-xl text-coopmaths-action dark:text-coopmathsdark-action disabled:opacity-30'
  const chevron = 'text-2xl text-coopmaths-action dark:text-coopmathsdark-action'
</script>

{#snippet ligne(f: FicheDuParcours, rang: number | null, sousTitre: string)}
  <li class="{elementListe} flex flex-row items-center gap-1">
    <button type="button" class="flex-1 py-2 text-left" onclick={() => onouvrir(f)}>
      <span class="block text-coopmaths-corpus dark:text-coopmathsdark-corpus">{f.fiche.titre}</span>
      {#if sousTitre}<span class={discret}>{sousTitre}</span>{/if}
    </button>
    {#if rang !== null}
      <button type="button" class={icone} aria-label="Monter « {f.fiche.titre} »" disabled={rang === 0} onclick={() => onenregistrer(deplacer(enregistrees, f.cle, -1))}>
        <i aria-hidden="true" class="bx bx-chevron-up"></i>
      </button>
      <button
        type="button"
        class={icone}
        aria-label="Descendre « {f.fiche.titre} »"
        disabled={rang === enregistrees.length - 1}
        onclick={() => onenregistrer(deplacer(enregistrees, f.cle, 1))}
      >
        <i aria-hidden="true" class="bx bx-chevron-down"></i>
      </button>
    {/if}
    <button
      type="button"
      class={icone}
      aria-label="{estEnregistree(enregistrees, f.cle) ? 'Retirer' : 'Enregistrer'} « {f.fiche.titre} »"
      aria-pressed={estEnregistree(enregistrees, f.cle)}
      onclick={() => onenregistrer(basculer(enregistrees, f))}
    >
      <i aria-hidden="true" class="bx {estEnregistree(enregistrees, f.cle) ? 'bxs-bookmark' : 'bx-bookmark'}"></i>
    </button>
  </li>
{/snippet}

<div class="flex flex-col gap-3 p-4">
  {#if !enregistrees.length && !chapitres.length}
    <p class="py-8 text-center font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
      Les fiches de cours de tes parcours apparaîtront ici.
    </p>
  {:else}
    <label
      class="w-full flex flex-row items-center gap-2 rounded-full px-4 py-3
      bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
      text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
    >
      <i aria-hidden="true" class="bx bx-search"></i>
      <input
        type="search"
        aria-label="Rechercher une fiche"
        bind:value={recherche}
        class="w-full bg-transparent border-0 p-0 focus:outline-0 focus:ring-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      />
    </label>
  {/if}

  {#if recherche.trim()}
    {#if trouvees.length}
      <ul class={listeGroupee}>
        {#each trouvees as f (f.cle)}
          {@render ligne(f, null, `${f.theme} · ${f.parcours}`)}
        {/each}
      </ul>
    {:else}
      <p class="py-8 text-center font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">Aucune fiche ne correspond.</p>
    {/if}
  {:else}
    {#if enregistrees.length}
      <h2 class={titreSection}>Mes fiches</h2>
      <ul class={listeGroupee}>
        {#each enregistrees as f, i (f.cle)}
          {@render ligne(f, i, `${f.theme} · ${f.parcours}`)}
        {/each}
      </ul>
    {/if}
    {#each chapitres as c (c.cle)}
      {@const ouvert = deplie(c.cle)}
      <button
        type="button"
        class="flex flex-row items-center justify-between gap-3 pl-2 pt-2 text-left"
        style="min-height: 44px"
        aria-expanded={ouvert}
        onclick={() => basculerChapitre(c.cle)}
      >
        <span>
          <span class="font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light">{c.theme}</span>
          <span class="{discret} whitespace-nowrap">· {c.niveau} · {c.fiches.length} fiche{c.fiches.length > 1 ? 's' : ''}</span>
        </span>
        <i aria-hidden="true" class="bx {ouvert ? 'bx-chevron-up' : 'bx-chevron-down'} {chevron}"></i>
      </button>
      {#if ouvert}
        {#if c.parcours.length === 1}
          <ul class={listeGroupee}>
            {#each c.fiches as f (f.cle)}
              {@render ligne(f, null, '')}
            {/each}
          </ul>
        {:else}
          {#each c.parcours as g (g.id)}
            {@const cleParcours = 'p:' + g.id}
            {@const parcoursOuvert = ouverts.includes(cleParcours)}
            <div class="flex flex-col gap-2 pl-3">
              <button
                type="button"
                class="flex flex-row items-center justify-between gap-3 pl-2 text-left"
                style="min-height: 44px"
                aria-expanded={parcoursOuvert}
                onclick={() => ouvrirFermer(cleParcours)}
              >
                <span>
                  <span class="text-coopmaths-struct dark:text-coopmathsdark-struct">{g.titre}</span>
                  <span class="{discret} whitespace-nowrap">· {g.fiches.length} fiche{g.fiches.length > 1 ? 's' : ''}</span>
                </span>
                <i aria-hidden="true" class="bx {parcoursOuvert ? 'bx-chevron-up' : 'bx-chevron-down'} {chevron}"></i>
              </button>
              {#if parcoursOuvert}
                <ul class={listeGroupee}>
                  {#each g.fiches as f (f.cle)}
                    {@render ligne(f, null, '')}
                  {/each}
                </ul>
              {/if}
            </div>
          {/each}
        {/if}
      {/if}
    {/each}
  {/if}
</div>
