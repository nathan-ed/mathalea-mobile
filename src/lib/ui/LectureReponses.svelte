<script lang="ts">
  // Relevé des réponses des élèves : QR codes lus à la caméra, ou photos et
  // fichiers importés. Les réponses vont dans leur session, quelle qu'elle soit.
  import { lireImage } from '$lib/qr'
  import { ajouterReponses, decoderReponses, type Releve } from '$lib/releve'
  import { boutonAction, boutonInverse, boutonLien } from './classes'
  import Scanner from './Scanner.svelte'

  let {
    releves,
    onsauver,
    principal = false,
    onfin,
  }: {
    releves: Releve[]
    onsauver: (r: Releve[]) => Promise<void>
    principal?: boolean // « Lire les QR codes » en bouton plein (seule action de l'écran)
    onfin?: () => void // caméra refermée ou import fini : la page peut se mettre à jour
  } = $props()

  let scanner = $state(false)
  let message = $state('')
  let import_: HTMLInputElement | undefined = $state()
  // Réponses reçues pendant ce scan (toutes sessions confondues)
  let recuesScan = $state(0)

  async function ajouter(texte: string): Promise<'nouveau' | 'deja' | 'autre'> {
    const r = decoderReponses(texte)
    if (!r) return 'autre'
    const { releves: nouveaux, nouveau } = ajouterReponses(releves, r)
    if (nouveau) recuesScan++
    if (nouveaux !== releves) await onsauver(nouveaux)
    return nouveau ? 'nouveau' : 'deja'
  }

  function ouvrirScanner() {
    recuesScan = 0
    message = ''
    scanner = true
  }

  function fermerScanner() {
    scanner = false
    message = recuesScan ? `${recuesScan} réponse${recuesScan > 1 ? 's' : ''} ajoutée${recuesScan > 1 ? 's' : ''}.` : ''
    onfin?.()
  }

  /** Photos des téléphones (un ou plusieurs codes par photo) ou fichiers envoyés par les élèves */
  async function importer(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    const fichiers = [...(input.files ?? [])]
    input.value = ''
    let nouveaux = 0
    let deja = 0
    let illisibles = 0
    for (const f of fichiers) {
      let textes: string[] = []
      try {
        textes = f.type.startsWith('image/') ? await lireImage(f) : [await f.text()]
      } catch {
        textes = []
      }
      const lus = await Promise.all(textes.map(ajouter))
      if (!lus.some((l) => l !== 'autre')) illisibles++
      nouveaux += lus.filter((l) => l === 'nouveau').length
      deja += lus.filter((l) => l === 'deja').length
    }
    const parties = [
      nouveaux ? `${nouveaux} réponse${nouveaux > 1 ? 's' : ''} ajoutée${nouveaux > 1 ? 's' : ''}` : '',
      deja ? `${deja} déjà reçue${deja > 1 ? 's' : ''}` : '',
      illisibles ? `${illisibles} fichier${illisibles > 1 ? 's' : ''} sans QR code de réponses lisible` : '',
    ].filter(Boolean)
    message = parties.length ? `${parties.join(', ')}.` : 'Aucun fichier.'
    onfin?.()
  }
</script>

<div class="flex flex-col gap-1">
  <button type="button" class="{principal ? boutonAction : boutonInverse} w-full" style="min-height: 44px" onclick={ouvrirScanner}>
    <i aria-hidden="true" class="bx bx-qr-scan text-xl"></i> Lire les QR codes
  </button>
  <button type="button" class="{boutonLien} w-full" style="min-height: 44px" onclick={() => import_?.click()}>
    <i aria-hidden="true" class="bx bx-image-add text-xl"></i> Importer des photos ou des fichiers
  </button>
  <input bind:this={import_} type="file" multiple accept="image/*,.txt,text/plain" class="hidden" onchange={importer} />
  {#if message}<p class="text-sm text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus" role="status">{message}</p>{/if}
</div>

{#if scanner}
  <Scanner nb={recuesScan} onlu={ajouter} onfermer={fermerScanner} />
{/if}
