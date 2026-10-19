<script lang="ts">
  // QR code d'une session, à projeter en classe : les élèves le scannent
  // depuis leur accueil et arrivent directement dans la session.
  import { retourSi } from '$lib/navigation.svelte'
  import { dessinerQr } from '$lib/qr'
  import EnTete from './EnTete.svelte'

  let { invitation, code, titre, onfermer }: { invitation: string; code: string; titre: string; onfermer: () => void } = $props()

  const svg = $derived(dessinerQr(invitation))
  retourSi(() => true, () => onfermer(), 1)
</script>

<div class="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete {titre} onretour={onfermer} />
  <main class="flex-1 flex flex-col items-center justify-center gap-4 p-4 zone-sure-bas">
    <!-- Fond blanc dans les deux thèmes : un QR code se lit mal en clair sur sombre -->
    <div class="qr-session w-full rounded-2xl bg-white p-2" role="img" aria-label="QR code de la session {code}">
      {@html svg}
    </div>
    <div class="font-light text-coopmaths-struct dark:text-coopmathsdark-struct" style="font-size: 2.5rem; letter-spacing: 0.15em">{code}</div>
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
