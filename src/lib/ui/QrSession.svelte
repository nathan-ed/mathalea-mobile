<script lang="ts">
  // QR code d'une session ou d'une classe, à projeter en classe : les élèves le
  // scannent depuis leur accueil et arrivent directement dans la session, ou
  // ajoutent le dossier de l'enseignant avec leur classe.
  import { retourSi } from '$lib/navigation.svelte'
  import { enregistrerImage } from '$lib/fichiers'
  import { dessinerQr, imageQr } from '$lib/qr'
  import { boutonLien } from './classes'
  import EnTete from './EnTete.svelte'

  let {
    invitation,
    code,
    titre,
    classe = false,
    fichier,
    onfermer,
  }: { invitation: string; code: string; titre: string; classe?: boolean; fichier?: string; onfermer: () => void } = $props()

  const svg = $derived(dessinerQr(invitation))
  retourSi(() => true, () => onfermer(), 1)

  // Image à envoyer par mail ou à déposer sur un drive, pour la projeter en classe
  let message = $state('')
  async function exporter() {
    message = ''
    const base64 = imageQr(invitation, [
      classe ? { texte: code, taille: 80 } : { texte: code, taille: 96, espace: 24 },
      { texte: titre, taille: 44 },
    ])
    const fait = await enregistrerImage(fichier ?? `session-${code}.png`, base64)
    if (fait === 'fichier') message = 'Image enregistrée.'
  }
</script>

<div class="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete {titre} onretour={onfermer} />
  <main class="flex-1 flex flex-col items-center justify-center gap-4 p-4 zone-sure-bas">
    <!-- Fond blanc dans les deux thèmes : un QR code se lit mal en clair sur sombre -->
    {#if svg}
      <div class="qr-session w-full rounded-2xl bg-white p-2" role="img" aria-label="QR code {classe ? '' : 'de la session '}{code}">
        {@html svg}
      </div>
    {:else}
      <p class="text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus" role="status">
        Trop long pour un QR code. Les élèves ouvrent le parcours et entrent ce code :
      </p>
    {/if}
    <div class="font-light text-coopmaths-struct dark:text-coopmathsdark-struct" style={classe ? 'font-size: 2rem' : 'font-size: 2.5rem; letter-spacing: 0.15em'}>{code}</div>
    {#if svg}
      <button type="button" class="{boutonLien} w-full justify-center" style="min-height: 44px" onclick={exporter}>
        <i aria-hidden="true" class="bx bx-share-alt text-xl"></i> Exporter l’image
      </button>
    {/if}
    {#if message}<p class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus" role="status">{message}</p>{/if}
  </main>
</div>

<style>
  .qr-session {
    max-width: min(36rem, 70vh);
  }
  .qr-session :global(svg) {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
