<script lang="ts">
  // Reprise de ButtonToggleDarkMode.svelte de MathALÉA
  import { basculerTheme, theme } from '$lib/theme.svelte'
</script>

<button
  type="button"
  aria-label={theme.sombre ? 'Passer en thème clair' : 'Passer en thème sombre'}
  class="p-1 text-coopmaths-action dark:text-coopmathsdark-action
  hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest"
  onclick={basculerTheme}
>
  {#if theme.sombre}
    <i aria-hidden="true"
 class="bx bx-sm bx-sun"></i>
  {:else}
    <i aria-hidden="true"
 class="bx bx-sm bx-moon"></i>
  {/if}
</button>
