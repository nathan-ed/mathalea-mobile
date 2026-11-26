<script lang="ts">
  // Bouton « Récupérer une sauvegarde » : choix du fichier, aperçu de ce qui
  // sera repris, puis restauration. Appareil vide : comme au premier
  // lancement. Appareil qui a déjà des données (parcours de l'Explorer,
  // ceintures) : comme dans les Réglages, fusion proposée d'abord, puis
  // « Tout remplacer » avec l'avertissement (Nathan, 19 novembre 2026).
  import type { BilanFusion } from '$lib/fusion'
  import type { resumerSauvegarde } from '$lib/sauvegarde'
  import ConfirmationRestauration from './ConfirmationRestauration.svelte'
  let {
    onresumer,
    onapercu,
    onrestaurer,
    onfusionner,
  }: {
    onresumer: typeof resumerSauvegarde
    onapercu: (texte: string) => Promise<{ remplacer: boolean; fusion: BilanFusion | null }> // ce que l'appareil a déjà
    onrestaurer: (texte: string) => Promise<string>
    onfusionner: (texte: string) => Promise<string>
  } = $props()

  let champ: HTMLInputElement | undefined = $state()
  let message = $state('')
  let aRecuperer: { texte: string; resume: ReturnType<typeof resumerSauvegarde>; remplacer: boolean; fusion: BilanFusion | null } | null = $state(null)
  async function lire(e: Event) {
    const c = e.currentTarget as HTMLInputElement
    const f = c.files?.[0]
    c.value = ''
    if (!f) return
    const texte = await f.text()
    try {
      const resume = onresumer(texte)
      aRecuperer = { texte, resume, ...(await onapercu(texte)) }
      message = ''
    } catch (err) {
      message = (err as Error).message
    }
  }
</script>

<button type="button" class="ligne-action-accueil" onclick={() => champ?.click()}>
  <i aria-hidden="true" class="bx bx-import"></i> Récupérer une sauvegarde
</button>
<input bind:this={champ} type="file" accept=".json,application/json" class="hidden" aria-label="Fichier de sauvegarde" onchange={lire} />
{#if message}<p class="text-sm font-bold text-coopmaths-action dark:text-coopmathsdark-action" role="alert">{message}</p>{/if}

{#if aRecuperer}
  <ConfirmationRestauration
    resume={aRecuperer.resume}
    remplacer={aRecuperer.remplacer}
    fusion={aRecuperer.fusion}
    onfusionner={async () => {
      const texte = aRecuperer!.texte
      aRecuperer = null
      message = await onfusionner(texte)
    }}
    onannuler={() => (aRecuperer = null)}
    onconfirmer={async () => {
      const texte = aRecuperer!.texte
      aRecuperer = null
      message = await onrestaurer(texte)
    }}
  />
{/if}
