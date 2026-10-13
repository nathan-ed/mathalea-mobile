<script lang="ts">
  import '../app.css'
  import { onMount } from 'svelte'
  import { initialiserTheme } from '$lib/theme.svelte'
  let { children } = $props()

  onMount(() => {
    document.body.className =
      'bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus'
    return initialiserTheme()
  })
</script>

{@render children()}
