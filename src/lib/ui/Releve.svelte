<script lang="ts">
  // Onglet En classe (enseignant) : nouvelle session, lecture des QR codes des
  // réponses et sessions de l'enseignant, par classe, les plus récentes d'abord : celles
  // qu'il a lancées (gardées même sans réponse, pour les relever plus tard) et
  // celles dont il a lu des réponses. Une session s'ouvre sur sa page.
  import type { Parcours } from '$lib/catalogue'
  import { reglageQr } from '$lib/progression'
  import type { Releve } from '$lib/releve'
  import { boutonAction, boutonInverse, elementListe, listeGroupee, pastille } from './classes'
  import EnTete from './EnTete.svelte'
  import Feuille from './Feuille.svelte'
  import LectureReponses from './LectureReponses.svelte'
  import ReglageSession from './ReglageSession.svelte'

  let {
    releves,
    parcours,
    classes = [],
    classesDe = () => [],
    onsauver,
    onouvrir,
    onlancer,
    onreglages,
  }: {
    releves: Releve[]
    parcours: Parcours[] // parcours qu'on peut lancer en session (bibliothèque et dossiers suivis)
    classes?: string[] // classes de l'enseignant, dans son ordre
    classesDe?: (id: string) => string[] // classes qui reçoivent un parcours
    onsauver: (r: Releve[]) => Promise<void>
    onouvrir: (cle: string) => void
    onlancer: (p: Parcours, code: string, etapes?: number[], classe?: string) => void
    onreglages: () => void
  } = $props()

  let aSupprimer: Releve | null = $state(null)
  // Nouvelle session : choix du parcours, puis ses réglages
  let choix = $state(false)
  let choisi: Parcours | null = $state(null)
  // Panneau des réglages : fermé à part, le parcours choisi reste le temps de sa fermeture
  let reglageOuvert = $state(false)

  const titreSection = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const discret = 'text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  const recentes = $derived([...releves].sort((a, b) => b.le.localeCompare(a.le)))
  // Par classe, dans l'ordre des classes ; les sessions sans classe à la fin
  const groupes = $derived.by(() => {
    const avec = classes.map((c) => ({ titre: c, sessions: recentes.filter((r) => r.classe === c) })).filter((g) => g.sessions.length)
    const autres = recentes.filter((r) => !r.classe || !classes.includes(r.classe))
    return [...avec, ...(autres.length ? [{ titre: avec.length ? 'Sans classe' : 'Sessions', sessions: autres }] : [])]
  })
  const parNiveau = $derived.by(() => {
    const groupes = new Map<string, Parcours[]>()
    for (const p of [...parcours].sort((a, b) => a.titre.localeCompare(b.titre, 'fr'))) groupes.set(p.niveau, [...(groupes.get(p.niveau) ?? []), p])
    return [...groupes.entries()]
  })

  // Réglage porté par le code : quand l'élève montre son QR code, avec ou sans prénom
  function reglage(code: string) {
    const r = reglageQr(code)
    if (r.quand === 'aucun') return 'Sans QR code des réponses'
    return `${r.quand === 'avant' ? 'QR code avant la correction' : 'QR code après la correction'}${r.prenom ? ', avec prénom' : ''}`
  }
  const date = (iso: string) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  async function supprimer() {
    const r = aSupprimer
    aSupprimer = null
    if (r) await onsauver(releves.filter((x) => x.cle !== r.cle))
  }
</script>

<EnTete>
  {#snippet droite()}
    <button type="button" aria-label="Réglages" onclick={onreglages} class="bouton-icone">
      <i aria-hidden="true" class="bx bx-cog text-2xl"></i>
    </button>
  {/snippet}
</EnTete>

<main class="flex-1 flex flex-col gap-3 p-4 avec-onglets">
  <button type="button" class="{boutonAction} w-full disabled:opacity-40" style="min-height: 44px" disabled={!parcours.length} onclick={() => (choix = true)}>
    <i aria-hidden="true" class="bx bx-group text-xl"></i> Nouvelle session
  </button>
  {#if !parcours.length}
    <p class="px-1 {discret}">Créez un parcours ou suivez un dossier pour lancer une session.</p>
  {/if}
  <LectureReponses {releves} {onsauver} />

  {#each groupes as g (g.titre)}
    <h2 class={titreSection}>{g.titre}</h2>
    <ul class={listeGroupee}>
      {#each g.sessions as r (r.cle)}
        <li class="flex flex-row items-center bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
          <button type="button" class="flex-1 min-w-0 flex flex-row items-center justify-between gap-3 px-4 py-3 text-left" onclick={() => onouvrir(r.cle)}>
            <span class="flex flex-col min-w-0">
              <span class="truncate font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{r.titre || 'Parcours'}</span>
              <span class={discret}>Session {r.code} · {date(r.le)}</span>
              <span class={discret}>
                {reglage(r.code)}{!r.recues.length && reglageQr(r.code).quand !== 'aucun' ? ' · Aucune réponse' : ''}
              </span>
            </span>
            <span class="flex flex-row items-center gap-2 shrink-0">
              {#if r.recues.length}<span class={pastille}>{r.recues.length}</span>{/if}
              <i aria-hidden="true" class="bx bx-chevron-right text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
            </span>
          </button>
          <button type="button" class="bouton-icone mr-1" aria-label="Supprimer la session {r.code}" onclick={() => (aSupprimer = r)}>
            <i aria-hidden="true" class="bx bx-x text-2xl"></i>
          </button>
        </li>
      {/each}
    </ul>
  {/each}
</main>

{#if choix}
  <Feuille onfermer={() => (choix = false)}>
    <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Parcours de la session</p>
    {#each parNiveau as [niveau, ps] (niveau)}
      <h2 class="pl-2 text-sm font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light">{niveau || 'Sans niveau'}</h2>
      <ul class={listeGroupee}>
        {#each ps as p (p.id)}
          <li>
            <button
              type="button"
              class={elementListe}
              onclick={() => {
                choix = false
                choisi = p
                reglageOuvert = true
              }}
            >
              <span class="min-w-0 truncate text-coopmaths-corpus dark:text-coopmathsdark-corpus">{p.titre || 'Sans titre'}</span>
              <i aria-hidden="true" class="bx bx-chevron-right text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
            </button>
          </li>
        {/each}
      </ul>
    {/each}
  </Feuille>
{/if}

{#if reglageOuvert && choisi}
  {@const p = choisi}
  {@const recoivent = classesDe(p.id)}
  <ReglageSession
    parcours={p}
    {classes}
    classe={recoivent.length === 1 ? recoivent[0] : undefined}
    onfermer={() => (reglageOuvert = false)}
    onlancer={(code, etapes, classe) => {
      reglageOuvert = false
      onlancer(p, code, etapes, classe)
    }}
  />
{/if}

{#if aSupprimer}
  <Feuille onfermer={() => (aSupprimer = null)}>
    <p role="alert" class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Supprimer la session {aSupprimer.code} ?</p>
    <p class="text-sm">
      {#if aSupprimer.recues.length}
        Les réponses de {aSupprimer.recues.length} élève{aSupprimer.recues.length > 1 ? 's' : ''}{aSupprimer.analyse ? ' et l’analyse de l’IA' : ''} seront effacées de cet appareil.
      {:else}
        La session et son code seront effacés de cet appareil.
      {/if}
    </p>
    <div class="flex flex-row gap-3">
      <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={() => (aSupprimer = null)}>Annuler</button>
      <button type="button" class="{boutonAction} flex-1" style="min-height: 44px" onclick={supprimer}>Supprimer</button>
    </div>
  </Feuille>
{/if}
