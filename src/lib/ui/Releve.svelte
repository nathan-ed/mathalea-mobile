<script lang="ts">
  // Réponses des élèves à des sessions partagées : lecture des QR codes à la
  // caméra, ou import de photos et de fichiers ; une ligne par session.
  import type { Moteur } from '$lib/moteur'
  import { retourSi } from '$lib/navigation.svelte'
  import { lireImage } from '$lib/qr'
  import type { ConfigIA } from '$lib/analyse'
  import { ajouterReponses, decoderReponses, type Releve } from '$lib/releve'
  import { boutonAction, boutonInverse, listeGroupee, pastille } from './classes'
  import EnTete from './EnTete.svelte'
  import Feuille from './Feuille.svelte'
  import ReponsesClasse from './ReponsesClasse.svelte'
  import Scanner from './Scanner.svelte'

  let {
    releves,
    moteur,
    niveauDe,
    configIA = null,
    onconfigIA,
    onsauver,
    onretour,
  }: {
    releves: Releve[]
    moteur: Moteur | undefined
    niveauDe: (parcours: string) => string // niveau du parcours s'il est connu (texte pour l'IA)
    configIA?: ConfigIA | null
    onconfigIA: (c: ConfigIA | null) => Promise<void>
    onsauver: (r: Releve[]) => Promise<void>
    onretour: () => void
  } = $props()

  let scanner = $state(false)
  let ouvert: string | null = $state(null)
  let aSupprimer: Releve | null = $state(null)
  let message = $state('')
  let import_: HTMLInputElement | undefined = $state()

  const releveOuvert = $derived(releves.find((r) => r.cle === ouvert) ?? null)
  // Réponses reçues pendant ce scan (toutes sessions confondues)
  let recuesScan = $state(0)

  retourSi(() => !scanner && !ouvert, () => onretour())

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
  }

  const date = (iso: string) => new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })

  async function supprimer() {
    const r = aSupprimer
    aSupprimer = null
    if (r) await onsauver(releves.filter((x) => x.cle !== r.cle))
  }
</script>

{#if releveOuvert && moteur}
  <ReponsesClasse
    releve={releveOuvert}
    {moteur}
    niveau={niveauDe(releveOuvert.parcours)}
    {configIA}
    {onconfigIA}
    onmaj={(r) => onsauver(releves.map((x) => (x.cle === r.cle ? r : x)))}
    onretour={() => (ouvert = null)}
  />
{:else}
  <div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
    <EnTete titre="Réponses de sessions" onretour={() => onretour()} />
    <main class="flex-1 flex flex-col gap-4 p-4 zone-sure-bas">
      <p class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">
        Après une session partagée, chaque élève touche « Montrer mes réponses à l’enseignant ». Lis les QR codes un par un, ou
        importe des photos (plusieurs téléphones par photo) et les fichiers envoyés par les élèves. Aucun nom n’est transmis.
      </p>
      <div class="flex flex-col gap-3">
        <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={ouvrirScanner}>
          <i aria-hidden="true" class="bx bx-qr-scan text-xl"></i> Lire les QR codes
        </button>
        <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={() => import_?.click()}>
          <i aria-hidden="true" class="bx bx-image-add text-xl"></i> Importer des photos ou des fichiers
        </button>
        <input bind:this={import_} type="file" multiple accept="image/*,.txt,text/plain" class="hidden" onchange={importer} />
        {#if message}<p class="text-sm text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus" role="status">{message}</p>{/if}
      </div>

      {#if releves.length}
        <ul class={listeGroupee}>
          {#each releves as r (r.cle)}
            <li class="flex flex-row items-center bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
              <button
                type="button"
                class="flex-1 min-w-0 flex flex-row items-center justify-between gap-3 px-4 py-3 text-left"
                disabled={!moteur}
                onclick={() => (ouvert = r.cle)}
              >
                <span class="flex flex-col min-w-0">
                  <span class="truncate font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{r.titre || 'Parcours'}</span>
                  <span class="text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">Session {r.code} · {date(r.le)}</span>
                </span>
                <span class="flex flex-row items-center gap-2">
                  <span class={pastille}>{r.recues.length}</span>
                  <i aria-hidden="true" class="bx bx-chevron-right text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
                </span>
              </button>
              <button type="button" class="bouton-icone mr-1" aria-label="Supprimer les réponses de la session {r.code}" onclick={() => (aSupprimer = r)}>
                <i aria-hidden="true" class="bx bx-trash text-xl"></i>
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="py-6 text-center text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">Aucune réponse relevée pour l’instant.</p>
      {/if}
    </main>
  </div>
{/if}

{#if scanner}
  <Scanner nb={recuesScan} onlu={ajouter} onfermer={fermerScanner} />
{/if}

{#if aSupprimer}
  <Feuille onfermer={() => (aSupprimer = null)}>
    <p role="alert" class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Supprimer ces réponses ?</p>
    <p class="text-sm">Les {aSupprimer.recues.length} réponses de la session {aSupprimer.code} seront effacées de cet appareil.</p>
    <div class="flex flex-row gap-3">
      <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={() => (aSupprimer = null)}>Annuler</button>
      <button type="button" class="{boutonAction} flex-1" style="min-height: 44px" onclick={supprimer}>Supprimer</button>
    </div>
  </Feuille>
{/if}
