<script lang="ts">
  import '../app.css'
  import { onMount } from 'svelte'
  import { pushState } from '$app/navigation'
  import { page } from '$app/state'
  import { initialiserTheme } from '$lib/theme.svelte'
  import { brancherHistorique, etatHistorique } from '$lib/navigation.svelte'
  let { children } = $props()

  onMount(() => {
    document.body.className =
      'bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus'
    // Bouton retour du téléphone : une entrée d'historique sans changer d'adresse
    brancherHistorique((present) => (present ? pushState('', { retour: true }) : history.back()))
    return initialiserTheme()
  })

  $effect(() => etatHistorique(!!page.state.retour))
</script>

{@render children()}
