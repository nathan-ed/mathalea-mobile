<script lang="ts">
  // Page d'un parcours pour l'enseignant (bibliothèque, onglet Parcours) : tout ce
  // qu'on fait sur un parcours au même endroit. Ses classes (pastilles à
  // toucher), où il en est chez les élèves, « Lancer une session », l'essayer,
  // le modifier, ses sessions ; exporter, dupliquer, supprimer dans « Autres
  // actions ».
  import { organisationDe, paliersDe } from '$lib/catalogue'
  import { aExporter, type ParcoursEnseignant } from '$lib/bibliotheque'
  import { reglageQr } from '$lib/progression'
  import type { Releve } from '$lib/releve'
  import ChampTexte from './ChampTexte.svelte'
  import EnTete from './EnTete.svelte'
  import Feuille from './Feuille.svelte'
  import ReglageSession from './ReglageSession.svelte'
  import { boutonAction, boutonInverse, boutonLien, elementListe, listeGroupee, pastille } from './classes'

  let {
    pe,
    classes,
    drive = true,
    sessions,
    onretour,
    onmodifier,
    onessayer,
    onlancer,
    onclasses,
    onexporter,
    ondupliquer,
    onsupprimer,
    onsession,
  }: {
    pe: ParcoursEnseignant
    classes: string[] // toutes les classes de l'enseignant
    drive?: boolean // dossier partagé configuré (sinon rien n'arrive aux élèves)
    sessions: Releve[] // sessions de ce parcours
    onretour: () => void
    onmodifier: () => void
    onessayer: () => void
    onlancer: (code: string, etapes?: number[], classe?: string) => void
    onclasses: (classes: string[]) => void
    onexporter: () => Promise<string>
    ondupliquer: () => void
    onsupprimer: () => void
    onsession: (cle: string) => void
  } = $props()

  const p = $derived(pe.parcours)
  let feuille: 'actions' | 'suppression' | 'classe' | 'session' | null = $state(null)
  let nouvelle = $state('')
  let message = $state('')
  const titreSection = 'pl-2 pt-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light'
  const discret = 'text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  const difficultes = ['Découverte', 'Entraînement', 'Approfondissement']
  const nbQuestions = $derived(p.etapes.reduce((a, e) => a + (e.nbQuestions ?? 0), 0))
  const date = (iso: string) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  // Où en est le parcours chez les élèves, en une ligne
  const etat = $derived.by(() => {
    if (!pe.classes.length) return { icone: 'bx-info-circle', texte: 'Donné à aucune classe : les élèves ne le reçoivent pas.' }
    if (!drive) return { icone: 'bx-folder', texte: 'Drive pas encore configuré : les élèves ne le reçoivent pas.' }
    const aPublier = pe.classes.filter((c) => aExporter(pe, c))
    if (aPublier.length) return { icone: 'bx-cloud-upload', texte: `V${p.version} à publier pour ${aPublier.join(', ')}.` }
    return { icone: 'bx-check-circle', texte: `V${p.version} publiée pour ${pe.classes.join(', ')}.` }
  })

  function basculer(c: string) {
    onclasses(pe.classes.includes(c) ? pe.classes.filter((x) => x !== c) : [...pe.classes, c])
  }
  function ajouterClasse() {
    const n = nouvelle.trim()
    if (n && !pe.classes.includes(n)) onclasses([...pe.classes, n])
    nouvelle = ''
    feuille = null
  }
  const puce = (actif: boolean) =>
    `presse shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
      actif
        ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
        : 'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus dark:text-coopmathsdark-corpus'
    }`
  function reglage(code: string) {
    const r = reglageQr(code)
    if (r.quand === 'aucun') return 'Sans QR code des réponses'
    return r.quand === 'avant' ? 'QR code avant la correction' : 'QR code après la correction'
  }
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre={p.titre || 'Sans titre'} {onretour} />

  <main class="flex-1 flex flex-col gap-4 p-4 zone-sure-bas">
    <div>
      {#if p.objectif}<p class="font-light text-coopmaths-corpus dark:text-coopmathsdark-corpus">{p.objectif}</p>{/if}
      <p class="mt-1 {discret}">
        {[p.niveau, p.theme, organisationDe(p) || difficultes[p.difficulte - 1], `${nbQuestions} questions`].filter(Boolean).join(' · ')}
      </p>
    </div>

    <p class="flex flex-row items-center gap-2 text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus" role="status">
      <i aria-hidden="true" class="bx {etat.icone} text-xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
      <span>{etat.texte}</span>
    </p>

    <div class="flex flex-col gap-3">
      <button type="button" class="{boutonAction} w-full" style="min-height: 44px" onclick={() => (feuille = 'session')}>
        <i aria-hidden="true" class="bx bx-group text-xl"></i> Lancer une session
      </button>
      <div class="flex flex-row gap-3">
        <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={onessayer}>
          <i aria-hidden="true" class="bx bx-play-circle text-xl"></i> Essayer
        </button>
        <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={onmodifier}>
          <i aria-hidden="true" class="bx bx-edit-alt text-xl"></i> Modifier
        </button>
      </div>
    </div>

    <h2 class={titreSection}>Classes</h2>
    <div class="flex flex-row flex-wrap gap-2" role="group" aria-label="Classes qui reçoivent ce parcours">
      {#each classes as c (c)}
        <button type="button" aria-pressed={pe.classes.includes(c)} class={puce(pe.classes.includes(c))} onclick={() => basculer(c)}>
          {#if pe.classes.includes(c)}<i aria-hidden="true" class="bx bx-check"></i>{/if}
          {c}
        </button>
      {/each}
      <button type="button" aria-label="Nouvelle classe" class={puce(false)} onclick={() => (feuille = 'classe')}>
        <i aria-hidden="true" class="bx bx-plus"></i>
      </button>
    </div>

    <h2 class={titreSection}>{paliersDe(p).length > 1 ? organisationDe(p) : 'Exercices'}</h2>
    <ul class={listeGroupee}>
      {#each p.etapes as e, i (i)}
        <li class="flex flex-row items-baseline gap-3 px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
          <span class="shrink-0 font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">{e.id}</span>
          <span class="min-w-0 flex-1 text-coopmaths-corpus dark:text-coopmathsdark-corpus">{e.titre.replace(/\$([^$]*)\$/g, '$1')}</span>
          <span class="shrink-0 {discret}">{e.nbQuestions ?? ''}</span>
        </li>
      {/each}
    </ul>

    {#if sessions.length}
      <h2 class={titreSection}>Sessions</h2>
      <ul class={listeGroupee}>
        {#each sessions as r (r.cle)}
          <li>
            <button type="button" class={elementListe} onclick={() => onsession(r.cle)}>
              <span class="flex flex-col min-w-0">
                <span class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">Session {r.code} · {date(r.le)}</span>
                <span class={discret}>{[r.classe, reglage(r.code)].filter(Boolean).join(' · ')}</span>
              </span>
              <span class="flex flex-row items-center gap-2 shrink-0">
                {#if r.recues.length}<span class={pastille}>{r.recues.length}</span>{/if}
                <i aria-hidden="true" class="bx bx-chevron-right text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
              </span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}

    <button type="button" class={boutonLien} onclick={() => (feuille = 'actions')}>
      <i aria-hidden="true" class="bx bx-dots-horizontal-rounded text-xl"></i>
      Autres actions
    </button>
    {#if message}<p class="text-sm text-center text-coopmaths-corpus dark:text-coopmathsdark-corpus" role="status">{message}</p>{/if}
  </main>
</div>

{#if feuille === 'session'}
  <ReglageSession
    parcours={p}
    {classes}
    classe={pe.classes.length === 1 ? pe.classes[0] : undefined}
    onfermer={() => (feuille = null)}
    onlancer={(code, etapes, classe) => {
      feuille = null
      onlancer(code, etapes, classe)
    }}
  />
{:else if feuille === 'classe'}
  <Feuille onfermer={() => (feuille = null)}>
    <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Nouvelle classe</p>
    <form
      class="flex flex-col gap-3"
      onsubmit={(e) => {
        e.preventDefault()
        ajouterClasse()
      }}
    >
      <ChampTexte id="nouvelle-classe-fiche" titre="Nom de la classe" bind:valeur={nouvelle} />
      <button type="submit" class="{boutonAction} w-full disabled:opacity-40" style="min-height: 44px" disabled={!nouvelle.trim()}>Donner à cette classe</button>
    </form>
  </Feuille>
{:else if feuille === 'actions'}
  {@const actions = [
    { icone: 'bx-export', libelle: 'Exporter ce parcours seul', fn: async () => ((feuille = null), (message = await onexporter())) },
    { icone: 'bx-copy', libelle: 'Dupliquer', fn: () => ((feuille = null), ondupliquer()) },
    { icone: 'bx-trash', libelle: 'Supprimer le parcours', fn: () => (feuille = 'suppression') },
  ]}
  <Feuille onfermer={() => (feuille = null)}>
    <ul class={listeGroupee}>
      {#each actions as a (a.libelle)}
        <li>
          <button type="button" class={elementListe} onclick={a.fn}>
            <span class="flex flex-row items-center gap-3 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
              <i aria-hidden="true" class="bx {a.icone} text-2xl text-coopmaths-action dark:text-coopmathsdark-action"></i>
              {a.libelle}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  </Feuille>
{:else if feuille === 'suppression'}
  <Feuille onfermer={() => (feuille = null)}>
    <p class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Supprimer « {p.titre || 'Sans titre'} » ?</p>
    <p class="text-sm">Le parcours disparaît de cet appareil. Les élèves le gardent jusqu’à la prochaine publication.</p>
    <div class="flex flex-row gap-3">
      <button type="button" class="{boutonInverse} flex-1" style="min-height: 44px" onclick={() => (feuille = null)}>Annuler</button>
      <button type="button" class="{boutonAction} flex-1" style="min-height: 44px" onclick={onsupprimer}>Supprimer</button>
    </div>
  </Feuille>
{/if}
