<script lang="ts">
  // Session pour la classe (enseignant) : classe, palier, QR code des réponses, puis
  // « Lancer la session », qui mène à la page de la session (onglet En classe).
  // Le réglage du QR code est porté par le code, tiré au lancement.
  import { nomPalier, paliersDe, type Parcours } from '$lib/catalogue'
  import { nouveauCode, type ModeQr } from '$lib/progression'
  import ChoixRadio from './ChoixRadio.svelte'
  import Feuille from './Feuille.svelte'
  import { boutonAction } from './classes'

  let {
    parcours,
    palier = 0,
    classes = [],
    classe,
    onlancer,
    onfermer,
  }: {
    parcours: Parcours
    palier?: number // palier proposé d'abord (celui à faire)
    classes?: string[] // classes de l'enseignant
    classe?: string // classe proposée d'abord (seule classe du parcours)
    onlancer: (code: string, etapes?: number[], classe?: string) => void
    onfermer: () => void
  } = $props()

  const paliers = $derived(paliersDe(parcours))
  const avecPaliers = $derived(paliers.length > 1)
  // L'enseignant choisit n'importe quel palier : ses propres résultats ne comptent pas
  // svelte-ignore state_referenced_locally
  let choisi = $state(palier)
  // svelte-ignore state_referenced_locally
  let classeChoisie: string | undefined = $state(classe)
  let avecQr = $state(false)
  let quand: Exclude<ModeQr, 'aucun'> = $state('apres')
  let avecPrenom = $state(false)
  const titreGroupe = 'text-sm font-semibold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'

  function lancer() {
    onlancer(nouveauCode(avecQr ? quand : 'aucun', avecPrenom), avecPaliers ? paliers[choisi].etapes : undefined, classeChoisie)
  }
</script>

<Feuille {onfermer}>
  <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Session pour la classe</p>
  <p class="-mt-2 {discret}">{parcours.titre}</p>
  {#if classes.length}
    <p class={titreGroupe}>Classe</p>
    <div class="-mt-2 flex flex-row flex-wrap gap-2" role="radiogroup" aria-label="Classe de la session">
      {#each classes as c (c)}
        <button
          type="button"
          role="radio"
          aria-checked={classeChoisie === c}
          class="rounded-full px-3 py-1.5 text-sm border border-coopmaths-action dark:border-coopmathsdark-action
          {classeChoisie === c
            ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
            : 'text-coopmaths-action dark:text-coopmathsdark-action'}"
          onclick={() => (classeChoisie = classeChoisie === c ? undefined : c)}>{c}</button
        >
      {/each}
    </div>
  {/if}
  {#if avecPaliers}
    <p class={titreGroupe}>{parcours.style === 'ceintures' ? 'Ceinture' : 'Palier'}</p>
    <div class="-mt-2 flex flex-row flex-wrap gap-2" role="radiogroup" aria-label="Palier de la session">
      {#each paliers as _, k (k)}
        <button
          type="button"
          role="radio"
          aria-checked={choisi === k}
          class="rounded-full px-3 py-1.5 text-sm border border-coopmaths-action dark:border-coopmathsdark-action
          {choisi === k
            ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
            : 'text-coopmaths-action dark:text-coopmathsdark-action'}"
          onclick={() => (choisi = k)}>{nomPalier(parcours, k)}</button
        >
      {/each}
    </div>
  {/if}
  <label class="flex flex-row items-center justify-between gap-4 rounded-xl px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
    <span class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">QR code des réponses pour l’enseignant</span>
    <input type="checkbox" role="switch" class="interrupteur shrink-0" bind:checked={avecQr} />
  </label>
  {#if avecQr}
    <ChoixRadio
      nom="moment-qr"
      valeur={quand}
      onchange={(v) => (quand = v)}
      options={[
        { libelle: 'Après la correction', valeur: 'apres' as const },
        { libelle: 'Avant la correction', valeur: 'avant' as const },
      ]}
    />
    <label class="flex flex-row items-center justify-between gap-4 rounded-xl px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
      <span class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">Avec le prénom des élèves</span>
      <input type="checkbox" role="switch" class="interrupteur shrink-0" bind:checked={avecPrenom} />
    </label>
    <p class={discret}>
      {avecPrenom ? 'Chaque élève donne son prénom une fois. ' : ''}
      {quand === 'avant'
        ? 'Pas de correction pendant la session. À la fin, chaque élève montre son QR code, puis voit ses résultats et les corrections.'
        : 'Les élèves voient la correction comme prévu, puis montrent leur QR code depuis leur bilan.'}
    </p>
  {/if}
  <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={lancer}>Lancer la session</button>
</Feuille>
