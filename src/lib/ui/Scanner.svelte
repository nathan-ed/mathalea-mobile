<script lang="ts">
  // Lecture de QR codes à la caméra, en continu : l'enseignant passe d'un
  // téléphone à l'autre, chaque code lu s'ajoute. Même code sur toutes les
  // plateformes (flux vidéo de la page) ; sans caméra, l'import de photos reste.
  import { onDestroy, onMount, untrack } from 'svelte'
  import { retourSi } from '$lib/navigation.svelte'
  import { lireImageVideo } from '$lib/qr'
  import { boutonAction } from './classes'

  let {
    nb,
    onlu,
    onfermer,
    session = false,
  }: {
    nb: number // réponses déjà reçues
    onlu: (texte: string) => Promise<'nouveau' | 'deja' | 'autre'>
    onfermer: () => void
    session?: boolean // élève : un seul QR code, celui de la session affichée par l'enseignant
  } = $props()

  let video: HTMLVideoElement
  let flux: MediaStream | null = null
  let erreur = $state('')
  let message = $state(untrack(() => (session ? 'Vise le QR code de la session.' : 'Vise un QR code de réponses.')))
  let signal = $state(false)
  let fini = false
  const vus = new Set<string>()

  retourSi(() => true, () => onfermer())

  function messageErreur(e: unknown) {
    const nom = (e as { name?: string })?.name
    if (nom === 'NotAllowedError' || nom === 'SecurityError')
      return `Accès à la caméra refusé. Autorise-le dans les réglages de l’appareil${session ? '.' : ', ou importe des photos des QR codes.'}`
    const repli = session ? '' : ' Importe des photos des QR codes à la place.'
    if (nom === 'NotFoundError' || nom === 'OverconstrainedError' || nom === 'NotReadableError') return `Aucune caméra disponible.${repli}`
    return `La caméra ne peut pas s’ouvrir ici.${repli}`
  }

  onMount(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      erreur = `La caméra n’est pas disponible ici.${session ? '' : ' Importe des photos des QR codes à la place.'}`
      return
    }
    try {
      flux = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
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
    while (!fini) {
      if (video.readyState >= 2 && video.videoWidth) {
        // Image réduite : lecture plus rapide, un QR code tenu près de l'objectif reste lisible
        const echelle = Math.min(1, 960 / video.videoWidth)
        canvas.width = Math.round(video.videoWidth * echelle)
        canvas.height = Math.round(video.videoHeight * echelle)
        c.drawImage(video, 0, 0, canvas.width, canvas.height)
        for (const texte of await lireImageVideo(canvas)) {
          if (vus.has(texte)) continue
          vus.add(texte)
          const r = await onlu(texte)
          if (session) {
            if (r === 'nouveau') return arreter()
            message = 'Ce n’est pas un QR code de session MathALÉA.'
            continue
          }
          message = r === 'nouveau' ? 'Réponses ajoutées.' : r === 'deja' ? 'Déjà reçues.' : 'Ce n’est pas un QR code de réponses MathALÉA.'
          if (r === 'nouveau') {
            navigator.vibrate?.(60)
            signal = true
            setTimeout(() => (signal = false), 400)
          }
        }
      }
      await new Promise((r) => setTimeout(r, 120))
    }
  }
</script>

<div class="fixed inset-0 z-50 flex flex-col bg-black text-white" role="dialog" aria-label={session ? 'Lecture du QR code de la session' : 'Lecture des QR codes'}>
  <div class="relative flex-1 overflow-hidden">
    <!-- svelte-ignore a11y_media_has_caption -->
    <video bind:this={video} class="absolute inset-0 w-full h-full object-cover" playsinline muted></video>
    {#if !erreur}
      <div class="cadre absolute rounded-2xl {signal ? 'cadre-lu' : ''}" aria-hidden="true"></div>
    {/if}
    {#if !session}
      <p class="absolute top-0 left-0 right-0 p-4 zone-sure-haut text-center text-xl font-bold" role="status">
        {nb} réponse{nb > 1 ? 's' : ''} reçue{nb > 1 ? 's' : ''}
      </p>
    {/if}
  </div>
  <div class="flex flex-col gap-3 p-4 zone-sure-bas">
    <p class="text-center" role="status" aria-live="polite">{erreur || message}</p>
    <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={() => onfermer()}>{session ? 'Annuler' : 'Terminer'}</button>
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
    transition: border-color 0.15s;
  }
  .cadre-lu {
    border-color: var(--app-action);
  }
</style>
