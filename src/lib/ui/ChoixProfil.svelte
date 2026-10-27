<script lang="ts">
  // Premier lancement : programme (France ou Suisse). Tout le monde commence
  // en élève ; l'onglet Créer s'ajoute avec le réglage Enseignant. Sur un
  // nouvel appareil, « Récupérer mes données » reprend une sauvegarde de
  // l'ancien (réglages, dossiers, séances en cours, suivi).
  import type { Pays } from '$lib/moteur'
  import type { resumerSauvegarde } from '$lib/sauvegarde'
  import ConfirmationRestauration from './ConfirmationRestauration.svelte'
  import EnTete from './EnTete.svelte'
  import Tuile from './Tuile.svelte'
  let {
    onchoisir,
    onresumer,
    onrestaurer,
  }: { onchoisir: (pays: Pays) => void; onresumer: typeof resumerSauvegarde; onrestaurer: (texte: string) => Promise<string> } = $props()
  const titre = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'

  let champ: HTMLInputElement | undefined = $state()
  let message = $state('')
  let aRecuperer: { texte: string; resume: ReturnType<typeof resumerSauvegarde> } | null = $state(null)
  async function lire(e: Event) {
    const c = e.currentTarget as HTMLInputElement
    const f = c.files?.[0]
    c.value = ''
    if (!f) return
    const texte = await f.text()
    try {
      aRecuperer = { texte, resume: onresumer(texte) }
      message = ''
    } catch (err) {
      message = (err as Error).message
    }
  }
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete />
  <main class="flex flex-col gap-3 p-4">
    <h1 class={titre}>Programme</h1>
    <Tuile size="large" title="France" subtitle="Collège et lycée, de la 6e à la Terminale" onclick={() => onchoisir('FR')} />
    <Tuile size="large" title="Suisse" subtitle="De la 9e au Collège" onclick={() => onchoisir('CH')} />
    <h2 class="{titre} pt-4">Nouvel appareil</h2>
    <Tuile icon="bx-import" title="Récupérer mes données" subtitle="Avec la sauvegarde exportée sur l’ancien appareil" onclick={() => champ?.click()} />
    <input bind:this={champ} type="file" accept=".json,application/json" class="hidden" aria-label="Fichier de sauvegarde" onchange={lire} />
    {#if message}<p class="pl-2 text-sm text-coopmaths-action dark:text-coopmathsdark-action" role="alert">{message}</p>{/if}
  </main>
</div>

{#if aRecuperer}
  <ConfirmationRestauration
    resume={aRecuperer.resume}
    remplacer={false}
    onannuler={() => (aRecuperer = null)}
    onconfirmer={async () => {
      const texte = aRecuperer!.texte
      aRecuperer = null
      message = await onrestaurer(texte)
    }}
  />
{/if}
