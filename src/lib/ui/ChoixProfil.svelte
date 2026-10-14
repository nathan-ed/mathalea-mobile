<script lang="ts">
  // Premier lancement : pays, puis élève ou enseignant (modifiables dans les réglages)
  import type { Pays } from '$lib/moteur'
  import type { Profil } from './Reglages.svelte'
  import EnTete from './EnTete.svelte'
  import Tuile from './Tuile.svelte'
  import { retourSi } from '$lib/navigation.svelte'
  let { onchoisir }: { onchoisir: (pays: Pays, profil: Profil) => void } = $props()
  let pays: Pays | null = $state(null)
  // Retour du téléphone sur « Vous êtes » : revient au choix du programme
  retourSi(() => pays !== null, () => (pays = null))
  const titre = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete />
  <main class="flex flex-col gap-3 p-4">
    {#if pays === null}
      <h1 class={titre}>Programme</h1>
      <Tuile size="large" title="France" subtitle="Collège et lycée, de la 6e à la Terminale" onclick={() => (pays = 'FR')} />
      <Tuile size="large" title="Suisse" subtitle="De la 9e au Collège" onclick={() => (pays = 'CH')} />
    {:else}
      <h1 class={titre}>Vous êtes</h1>
      <Tuile size="large" icon="bx-user" title="Élève" subtitle="Faire des parcours" onclick={() => onchoisir(pays!, 'eleve')} />
      <Tuile size="large" icon="bx-chalkboard" title="Enseignant" subtitle="Créer et partager des parcours" onclick={() => onchoisir(pays!, 'enseignant')} />
    {/if}
  </main>
</div>
