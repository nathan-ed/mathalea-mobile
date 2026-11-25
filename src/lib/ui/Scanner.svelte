<script lang="ts">
  // Lecture à la caméra du QR code d'une session partagée ou d'une classe,
  // depuis l'accueil. Même code sur toutes les plateformes (flux vidéo de la
  // page, lecture par jsQR) ; un QR code court se lit bien (invitation.ts).
  // Un QR code de MathALÉA lu : la caméra se ferme et l'écran de chargement la
  // remplace (Nathan, 25 novembre 2026 : « pas que l'appareil photo soit
  // bloqué juste sur chargement des données »).
  import { onDestroy, onMount, tick } from 'svelte'
  import { retourSi } from '$lib/navigation.svelte'
  import { estQrMathalea } from '$lib/invitation'
  import { lireImageVideo } from '$lib/qr'
  import { boutonAction, boutonLien } from './classes'

  let {
    onlu,
    onfermer,
  }: {
    onlu: (texte: string) => Promise<'nouveau' | 'autre' | { erreur: string }>
    onfermer: () => void
  } = $props()

  const VISER = 'Vise le QR code de la session ou de la classe.'
  const AUTRE = 'Ce n’est pas un QR code de session ou de classe MathALÉA.'
  let video: HTMLVideoElement | undefined = $state()
  let flux: MediaStream | null = null
  let ecran: 'camera' | 'chargement' | 'echec' = $state('camera')
  let erreur = $state('') // caméra indisponible
  let message = $state(VISER)
  let echec = $state('') // QR code lu, mais il ne mène nulle part
  let detruit = false
  // Chaque ouverture de la caméra a son numéro : une boucle d'une ouverture précédente s'arrête
  let tour = 0

  retourSi(() => true, () => onfermer())

  function messageErreur(e: unknown) {
    const nom = (e as { name?: string })?.name
    if (nom === 'NotAllowedError' || nom === 'SecurityError') return 'Accès à la caméra refusé. Autorise-le dans les réglages de l’appareil.'
    if (nom === 'NotFoundError' || nom === 'OverconstrainedError' || nom === 'NotReadableError') return 'Aucune caméra disponible.'
    return 'La caméra ne peut pas s’ouvrir ici.'
  }

  async function ouvrirCamera() {
    const t = ++tour
    ecran = 'camera'
    erreur = ''
    message = VISER
    if (!navigator.mediaDevices?.getUserMedia) {
      erreur = 'La caméra n’est pas disponible ici.'
      return
    }
    try {
      const f = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      if (detruit || t !== tour) return f.getTracks().forEach((x) => x.stop())
      flux = f
      await tick()
      video!.srcObject = f
      await video!.play()
      void boucle(t)
    } catch (e) {
      if (t === tour) erreur = messageErreur(e)
    }
  }

  function fermerCamera() {
    tour++
    flux?.getTracks().forEach((x) => x.stop())
    flux = null
  }

  onMount(ouvrirCamera)
  onDestroy(() => {
    detruit = true
    fermerCamera()
  })

  async function boucle(t: number) {
    const canvas = document.createElement('canvas')
    const c = canvas.getContext('2d', { willReadFrequently: true })!
    let centre = false
    while (t === tour && !detruit) {
      // Une image illisible ou une lecture qui échoue ne doit jamais arrêter la boucle sans rien dire
      try {
        const v = video
        if (v && v.readyState >= 2 && v.videoWidth) {
          const [l, h] = [v.videoWidth, v.videoHeight]
          if (centre) {
            // Centre de l'image en pleine résolution, là où l'on vise
            const cote = Math.min(l, h, 1080)
            canvas.width = canvas.height = cote
            c.drawImage(v, (l - cote) / 2, (h - cote) / 2, cote, cote, 0, 0, cote, cote)
          } else {
            // Image entière réduite : lecture rapide, QR code tenu près de l'objectif ou décentré
            const echelle = Math.min(1, 960 / l)
            canvas.width = Math.round(l * echelle)
            canvas.height = Math.round(h * echelle)
            c.drawImage(v, 0, 0, canvas.width, canvas.height)
          }
          centre = !centre
          const textes = await lireImageVideo(canvas)
          if (t !== tour) return
          const texte = textes.find(estQrMathalea)
          if (texte) return void charger(texte)
          if (textes.length) message = AUTRE
        }
      } catch (e) {
        console.warn('Lecture du QR code', e)
        message = `Lecture impossible : ${(e as Error)?.message ?? e}`
      }
      await new Promise((r) => setTimeout(r, 120))
    }
  }

  async function charger(texte: string) {
    fermerCamera()
    ecran = 'chargement'
    let r: Awaited<ReturnType<typeof onlu>>
    try {
      r = await onlu(texte)
    } catch (e) {
      r = { erreur: `Lecture impossible : ${(e as Error)?.message ?? e}` }
    }
    // Entré dans la session ou la classe : l'accueil referme le scanner
    if (detruit || r === 'nouveau') return
    echec = typeof r === 'object' ? r.erreur : AUTRE
    ecran = 'echec'
  }
</script>

{#if ecran === 'camera'}
  <div class="fixed inset-0 z-50 flex flex-col bg-black text-white" role="dialog" aria-label="Lecture du QR code de la session ou de la classe">
    <div class="relative flex-1 overflow-hidden">
      <!-- svelte-ignore a11y_media_has_caption -->
      <video bind:this={video} class="absolute inset-0 w-full h-full object-cover" playsinline muted></video>
      {#if !erreur}
        <div class="cadre absolute rounded-2xl" aria-hidden="true"></div>
      {/if}
    </div>
    <div class="flex flex-col gap-3 p-4 zone-sure-bas">
      <p class="text-center" role="status" aria-live="polite">{erreur || message}</p>
      <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={() => onfermer()}>Annuler</button>
    </div>
  </div>
{:else}
  <div
    class="fixed inset-0 z-50 flex flex-col bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    role="dialog"
    aria-label="Lecture du QR code de la session ou de la classe"
  >
    <div class="flex-1 flex flex-col items-center justify-center gap-4 p-4 zone-sure-haut">
      {#if ecran === 'chargement'}
        <i aria-hidden="true" class="bx bx-loader-alt bx-spin text-coopmaths-action dark:text-coopmathsdark-action" style="font-size: 3rem"></i>
        <p class="text-center" role="status" aria-busy="true">Chargement des données…</p>
      {:else}
        <p class="text-center" role="alert">{echec}</p>
      {/if}
    </div>
    <div class="flex flex-col gap-2 p-4 zone-sure-bas">
      {#if ecran === 'echec'}
        <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={ouvrirCamera}>Scanner à nouveau</button>
      {/if}
      <button type="button" class="{boutonLien} w-full" style="min-height: 44px" onclick={() => onfermer()}>Annuler</button>
    </div>
  </div>
{/if}

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
