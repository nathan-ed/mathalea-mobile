<script lang="ts">
  // Lecture à la caméra du QR code d'une session partagée ou d'une classe,
  // depuis l'accueil. Même code sur toutes les plateformes (flux vidéo de la
  // page, lecture par jsQR) ; un QR code court se lit bien (invitation.ts).
  import { onDestroy, onMount } from 'svelte'
  import { retourSi } from '$lib/navigation.svelte'
  import { lireImageVideo } from '$lib/qr'
  import { boutonAction } from './classes'

  let {
    onlu,
    onfermer,
  }: {
    onlu: (texte: string) => Promise<'nouveau' | 'autre' | { erreur: string }>
    onfermer: () => void
  } = $props()

  let video: HTMLVideoElement
  let flux: MediaStream | null = null
  let erreur = $state('')
  let message = $state('Vise le QR code de la session ou de la classe.')
  // Un QR code lu : son dossier ou son parcours se télécharge
  let lecture = $state(false)
  let fini = false
  const vus = new Set<string>()

  retourSi(() => true, () => onfermer())

  function messageErreur(e: unknown) {
    const nom = (e as { name?: string })?.name
    if (nom === 'NotAllowedError' || nom === 'SecurityError') return 'Accès à la caméra refusé. Autorise-le dans les réglages de l’appareil.'
    if (nom === 'NotFoundError' || nom === 'OverconstrainedError' || nom === 'NotReadableError') return 'Aucune caméra disponible.'
    return 'La caméra ne peut pas s’ouvrir ici.'
  }

  onMount(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      erreur = 'La caméra n’est pas disponible ici.'
      return
    }
    try {
      flux = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      if (fini) return arreter()
      video.srcObject = flux
      await video.play()
      void boucle()
    } catch (e) {
      erreur = messageErreur(e)
    }
  })

  function arreter() {
    fini = true
    flux?.getTracks().forEach((t) => t.stop())
    flux = null
  }
  onDestroy(arreter)

  async function boucle() {
    const canvas = document.createElement('canvas')
    const c = canvas.getContext('2d', { willReadFrequently: true })!
    let centre = false
    while (!fini) {
      // Une image illisible ou une lecture qui échoue ne doit jamais arrêter la boucle sans rien dire
      try {
        if (video.readyState >= 2 && video.videoWidth) {
          const [l, h] = [video.videoWidth, video.videoHeight]
          if (centre) {
            // Centre de l'image en pleine résolution, là où l'on vise
            const cote = Math.min(l, h, 1080)
            canvas.width = canvas.height = cote
            c.drawImage(video, (l - cote) / 2, (h - cote) / 2, cote, cote, 0, 0, cote, cote)
          } else {
            // Image entière réduite : lecture rapide, QR code tenu près de l'objectif ou décentré
            const echelle = Math.min(1, 960 / l)
            canvas.width = Math.round(l * echelle)
            canvas.height = Math.round(h * echelle)
            c.drawImage(video, 0, 0, canvas.width, canvas.height)
          }
          centre = !centre
          for (const texte of await lireImageVideo(canvas)) {
            if (vus.has(texte)) continue
            vus.add(texte)
            lecture = true
            message = 'QR code lu : chargement…'
            const r = await onlu(texte).finally(() => (lecture = false))
            if (r === 'nouveau') return arreter()
            // Relu un peu plus tard : un drive injoignable peut répondre au second essai
            setTimeout(() => vus.delete(texte), 4000)
            message = typeof r === 'object' ? r.erreur : 'Ce n’est pas un QR code de session ou de classe MathALÉA.'
          }
        }
      } catch (e) {
        console.warn('Lecture du QR code', e)
        message = `Lecture impossible : ${(e as Error)?.message ?? e}`
      }
      await new Promise((r) => setTimeout(r, 120))
    }
  }
</script>

<div class="fixed inset-0 z-50 flex flex-col bg-black text-white" role="dialog" aria-label="Lecture du QR code de la session ou de la classe">
  <div class="relative flex-1 overflow-hidden">
    <!-- svelte-ignore a11y_media_has_caption -->
    <video bind:this={video} class="absolute inset-0 w-full h-full object-cover" playsinline muted></video>
    {#if !erreur}
      <div class="cadre absolute rounded-2xl" aria-hidden="true"></div>
    {/if}
  </div>
  <div class="flex flex-col gap-3 p-4 zone-sure-bas">
    <p class="text-center" role="status" aria-live="polite" aria-busy={lecture}>{erreur || message}</p>
    <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={() => onfermer()}>Annuler</button>
  </div>
</div>

<style>
  .cadre {
    left: 50%;
    top: 50%;
    width: min(70vw, 60vh);
    height: min(70vw, 60vh);
    transform: translate(-50%, -50%);
    border: 3px solid rgba(255, 255, 255, 0.85);
    box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.35);
  }
</style>
