<script lang="ts">
  // Réponses d'une session partagée pour l'enseignant : un QR code à montrer
  // en classe, ou un fichier à lui envoyer. Ni nom ni identifiant de l'élève.
  import { enregistrerFichier } from '$lib/fichiers'
  import { retourSi } from '$lib/navigation.svelte'
  import { dessinerQr } from '$lib/qr'
  import { encoderReponses, type ReponsesSession } from '$lib/releve'
  import { reglageQr } from '$lib/progression'
  import ChampTexte from './ChampTexte.svelte'
  import { untrack } from 'svelte'
  import { boutonAction, boutonInverse, boutonLien } from './classes'
  import EnTete from './EnTete.svelte'

  let {
    reponses,
    onfermer,
    avant = false,
    passees = 0,
    onpassees,
    onresultats,
    prenom = '',
    onprenom,
  }: {
    reponses: ReponsesSession
    onfermer: () => void
    /** Session « QR code avant la correction » : les résultats viennent après */
    avant?: boolean
    passees?: number // questions passées, auxquelles l'élève peut encore répondre
    onpassees?: () => void
    onresultats?: () => void
    prenom?: string // gardé sur l'appareil, ajouté au QR code si la session le demande
    onprenom?: (p: string) => void
  } = $props()

  // Prénom demandé par le code de session : saisi une fois, modifiable
  const demande = $derived(reglageQr(reponses.c).prenom)
  let saisie = $state(untrack(() => prenom))
  let confirme = $state(untrack(() => !!prenom.trim()))
  function valider() {
    if (!saisie.trim()) return
    saisie = saisie.trim()
    onprenom?.(saisie)
    confirme = true
  }

  const texte = $derived(encoderReponses(demande && saisie.trim() ? { ...reponses, n: saisie.trim().slice(0, 40) } : reponses))
  const svg = $derived(dessinerQr(texte))
  const nb = $derived(Object.keys(reponses.r).length)
  let envoi = $state('')

  retourSi(() => true, () => onfermer())

  async function envoyer() {
    const fait = await enregistrerFichier(`reponses-${reponses.c}-${reponses.d}.txt`, texte)
    envoi = fait ? 'Fichier prêt : envoie-le à ton enseignant.' : ''
  }
</script>

<div class="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre={avant ? 'Avant tes résultats' : 'Mes réponses pour l’enseignant'} onretour={onfermer} />
  <main class="flex-1 flex flex-col items-center gap-4 p-4 zone-sure-bas">
    <p class="text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus">
      Montre ce code à ton enseignant. Il contient tes {nb} réponse{nb > 1 ? 's' : ''}{demande ? ', avec ton prénom' : ', sans ton nom'}.
      {#if avant}Ensuite seulement, tu verras tes résultats et les corrections.{/if}
    </p>
    {#if avant && passees > 0 && onpassees}
      <button type="button" class="{boutonInverse} w-full" style="min-height: 44px" onclick={onpassees}>
        D’abord répondre aux questions passées ({passees})
      </button>
    {/if}
    {#if demande && !confirme}
      <p class="text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus">
        Ton enseignant a demandé ton prénom avec tes réponses. Il reste sur ton téléphone et le sien.
      </p>
      <div class="w-full">
        <ChampTexte id="prenom-qr" titre="Ton prénom" bind:valeur={saisie} />
      </div>
      <button type="button" class="{boutonAction} w-full" style="min-height: 44px" disabled={!saisie.trim()} onclick={valider}>Afficher mon QR code</button>
    {:else}
    <!-- Fond blanc dans les deux thèmes : un QR code se lit mal en clair sur sombre -->
    <div class="qr-reponses w-full rounded-2xl bg-white p-2" role="img" aria-label="QR code de mes réponses, session {reponses.c}">
      {@html svg}
    </div>
    <p class="text-sm text-center text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
      Session {reponses.c} · {reponses.t}
      {#if demande}· {saisie} <button type="button" class="underline" onclick={() => (confirme = false)}>Modifier</button>{/if}
    </p>
    <button type="button" class="{boutonLien} w-full justify-center" style="min-height: 44px" onclick={envoyer}>
      <i aria-hidden="true" class="bx bx-share-alt text-xl"></i> Envoyer un fichier à la place
    </button>
    {#if envoi}<p class="text-sm text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus" role="status">{envoi}</p>{/if}
    {/if}
    {#if avant && onresultats && (!demande || confirme)}
      <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={onresultats}>C’est fait : voir mes résultats</button>
    {/if}
  </main>
</div>

<style>
  .qr-reponses {
    max-width: min(28rem, 70vh);
  }
  .qr-reponses :global(svg) {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
