<script lang="ts">
  // Licence et lien vers CoopMaths, en bas des écrans (sauf pendant une séance)
  async function ouvrir(e: MouseEvent) {
    e.preventDefault()
    try {
      const { openUrl } = await import('@tauri-apps/plugin-opener')
      await openUrl('https://coopmaths.fr')
    } catch {
      window.open('https://coopmaths.fr', '_blank', 'noopener')
    }
  }
</script>

<footer class="zone-sure-bas px-4 py-6 text-center text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
  MathALÉA · licence AGPL-3.0 ·
  <a href="https://coopmaths.fr" class="text-coopmaths-action dark:text-coopmathsdark-action" onclick={ouvrir}>coopmaths.fr</a>
</footer>
