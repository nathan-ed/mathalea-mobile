<script lang="ts">
  // Imprimer un parcours : exercices choisis, fiches de
  // cours, corrections, nombre de versions, puis un PDF compilé dans l'app,
  // sans connexion. Chaque impression tire de nouvelles valeurs.
  import { titreEleve, type Parcours } from '$lib/catalogue'
  import { enregistrerPdf } from '$lib/fichiers'
  import { fichesDe, nomPdf, pdfDuParcours } from '$lib/impression'
  import { chargerMoteur } from '$lib/moteur'
  import Feuille from './Feuille.svelte'
  import { boutonAction, desactive } from './classes'

  let { parcours, onfermer }: { parcours: Parcours; onfermer: () => void } = $props()

  // svelte-ignore state_referenced_locally
  let coches: boolean[] = $state(parcours.etapes.map(() => true))
  let cours = $state(true)
  let corrections = $state(true)
  let versions = $state(1)
  let enCours = $state(false)
  let message = $state('')
  const choisies = $derived(coches.flatMap((c, i) => (c ? [i] : [])))
  const avecCours = $derived(fichesDe(parcours, choisies).length > 0)
  // L'élève ne voit pas le titre d'un exercice masqué par l'enseignant
  const titre = (i: number) => titreEleve(parcours.etapes[i], i)
  const titreGroupe = 'text-sm font-semibold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  const ligne = 'flex flex-row items-center justify-between gap-4 px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark'

  async function imprimer() {
    enCours = true
    message = ''
    try {
      const moteur = await chargerMoteur()
      const pdf = await pdfDuParcours(moteur, parcours, { etapes: choisies, cours: cours && avecCours, corrections, versions })
      const r = await enregistrerPdf(nomPdf(parcours), pdf)
      if (r) onfermer()
    } catch (e) {
      console.warn('Impression', e)
      message = `Le PDF n’a pas pu être créé : ${e instanceof Error ? e.message : String(e)}`
    } finally {
      enCours = false
    }
  }
</script>

<Feuille {onfermer}>
  <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Imprimer</p>
  <p class="-mt-2 {discret}">{parcours.titre}</p>

  <p class={titreGroupe}>Exercices</p>
  <ul class="-mt-2 flex flex-col rounded-xl overflow-hidden divide-y divide-coopmaths-canvas-darkest dark:divide-coopmathsdark-canvas-darkest" aria-label="Exercices à imprimer">
    {#each parcours.etapes as _, i (i)}
      <li>
        <label class={ligne}>
          <span class="min-w-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus">{titre(i)}</span>
          <input type="checkbox" role="switch" class="interrupteur shrink-0" bind:checked={coches[i]} />
        </label>
      </li>
    {/each}
  </ul>

  {#if avecCours}
    <label class="{ligne} rounded-xl">
      <span class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">Fiches de cours</span>
      <input type="checkbox" role="switch" class="interrupteur shrink-0" bind:checked={cours} />
    </label>
  {/if}
  <label class="{ligne} rounded-xl">
    <span class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">Corrections à la fin</span>
    <input type="checkbox" role="switch" class="interrupteur shrink-0" bind:checked={corrections} />
  </label>

  <p class={titreGroupe}>Versions</p>
  <div class="-mt-2 flex flex-row flex-wrap gap-2" role="radiogroup" aria-label="Nombre de versions">
    {#each [1, 2, 3, 4] as n (n)}
      <button
        type="button"
        role="radio"
        aria-checked={versions === n}
        class="rounded-full px-4 py-1.5 text-sm border border-coopmaths-action dark:border-coopmathsdark-action
        {versions === n
          ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
          : 'text-coopmaths-action dark:text-coopmathsdark-action'}"
        onclick={() => (versions = n)}>{n}</button
      >
    {/each}
  </div>
  {#if versions > 1}
    <p class="-mt-2 {discret}">Mêmes exercices, autres valeurs : sujets A à {'ABCD'[versions - 1]}.</p>
  {/if}

  {#if message}<p role="alert" class="text-sm text-coopmaths-warn-dark dark:text-coopmathsdark-warn">{message}</p>{/if}
  <button
    type="button"
    class="{boutonAction} {desactive} w-full"
    style="min-height: 44px"
    disabled={enCours || choisies.length === 0}
    aria-busy={enCours}
    onclick={imprimer}
  >
    <i aria-hidden="true" class="bx {enCours ? 'bx-loader-alt bx-spin' : 'bx-printer'} text-xl"></i>
    {enCours ? 'Création du PDF…' : 'Créer le PDF'}
  </button>
</Feuille>
