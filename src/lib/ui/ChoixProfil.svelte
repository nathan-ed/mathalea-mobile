<script lang="ts">
  // Premier lancement : programme (France ou Suisse). Tout le monde commence
  // en élève ; l'onglet Créer s'ajoute avec le réglage Enseignant.
  import type { Pays } from '$lib/moteur'
  import EnTete from './EnTete.svelte'
  import Tuile from './Tuile.svelte'
  let { onchoisir }: { onchoisir: (pays: Pays) => void } = $props()
  const titre = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete />
  <main class="flex flex-col gap-3 p-4">
    <h1 class={titre}>Programme</h1>
    <Tuile size="large" title="France" subtitle="Collège et lycée, de la 6e à la Terminale" onclick={() => onchoisir('FR')} />
    <Tuile size="large" title="Suisse" subtitle="De la 9e au Collège" onclick={() => onchoisir('CH')} />
  </main>
</div>
