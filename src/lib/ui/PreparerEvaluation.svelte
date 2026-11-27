<script lang="ts">
  // Préparer une évaluation : l'élève coche les parcours concernés (rangés par
  // chapitre ; un parcours du chapitre peut rester hors de l'évaluation) et
  // touche le jour de l'évaluation. Deux gestes, rien à écrire.
  import { retourSi } from '$lib/navigation.svelte'
  import { jour, parcoursParChapitre, plusJours, type Evaluation, type Revisions, type SourceRevision } from '$lib/revisions'
  import { boutonAction, desactive, listeGroupee } from './classes'
  import EnTete from './EnTete.svelte'

  let {
    revisions,
    mesParcours = [],
    evaluation = null,
    onvalider,
    onretour,
  }: {
    revisions: Revisions
    mesParcours?: ({ id: string } & SourceRevision)[] // parcours de l'élève, même pas commencés
    evaluation?: Evaluation | null // préparation à modifier
    onvalider: (e: Evaluation) => void
    onretour: () => void
  } = $props()

  retourSi(() => true, () => onretour())

  const discret = 'text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'
  const titreSection = 'titre-section'
  const ligne = 'w-full flex flex-row items-center justify-between gap-4 px-4 py-3 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark'

  // Seulement les parcours de l'élève (classes choisies, Explorer) : jamais ceux d'une classe
  // qu'il a quittée, même s'il en a fait des exercices (Nathan, 27 novembre 2026)
  const groupes = $derived.by(() => {
    const siens = new Set(mesParcours.map((p) => p.id))
    return parcoursParChapitre(revisions, mesParcours)
      .map((g) => ({ ...g, parcours: g.parcours.filter((p) => siens.has(p.id)) }))
      .filter((g) => g.parcours.length)
  })
  // svelte-ignore state_referenced_locally
  let coches: string[] = $state(evaluation?.parcours ?? [])
  // svelte-ignore state_referenced_locally
  let date: string | null = $state(evaluation?.date ?? null)

  const connus = $derived(new Set(groupes.flatMap((g) => g.parcours.map((p) => p.id))))
  const choisis = $derived(coches.filter((id) => connus.has(id)))

  function basculer(ids: string[], oui: boolean) {
    const suite = new Set(coches)
    for (const id of ids) {
      if (oui) suite.add(id)
      else suite.delete(id)
    }
    coches = [...suite]
  }

  // Quatre semaines à partir du lundi de cette semaine ; les jours passés ne se touchent pas
  const aujourdhui = jour()
  const semaines = $derived.by(() => {
    const [a, m, d] = aujourdhui.split('-').map(Number)
    const lundi = plusJours(aujourdhui, -((new Date(a, m - 1, d).getDay() + 6) % 7))
    return [0, 1, 2, 3].map((s) =>
      [0, 1, 2, 3, 4, 5, 6].map((k) => {
        const j = plusJours(lundi, 7 * s + k)
        const [a2, m2, d2] = j.split('-').map(Number)
        const quand = new Date(a2, m2 - 1, d2)
        return {
          jour: j,
          numero: d2,
          // Le mois sous le premier jour proposé et sous chaque 1er
          mois: j === aujourdhui || d2 === 1 ? quand.toLocaleDateString('fr-FR', { month: 'short' }) : '',
          nom: quand.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
          passe: j < aujourdhui,
        }
      }),
    )
  })
  const dateEnMots = $derived.by(() => {
    if (!date) return ''
    const [a, m, d] = date.split('-').map(Number)
    return new Date(a, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  })

  const manque = $derived([choisis.length ? '' : 'les parcours', date && date >= aujourdhui ? '' : 'le jour'].filter(Boolean))
  function valider() {
    if (manque.length || !date) return
    onvalider({ parcours: choisis, date })
  }
</script>

<div class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
  <EnTete titre="Préparer une évaluation" onretour={() => onretour()} />
  <main class="colonne lecture avec-barre flex-1 flex flex-col gap-4 p-4">
    <h2 class={titreSection}>Jour de l’évaluation</h2>
    <div class="calendrier" role="group" aria-label="Jour de l’évaluation">
      {#each ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as l, k (k)}
        <span class="entete {discret}" aria-hidden="true">{l}</span>
      {/each}
      {#each semaines as semaine, s (s)}
        {#each semaine as c (c.jour)}
          <button
            type="button"
            class="case text-coopmaths-corpus dark:text-coopmathsdark-corpus {c.jour === date ? 'choisi' : ''} {c.jour === aujourdhui ? 'aujourdhui' : ''}"
            aria-label={c.nom}
            aria-pressed={c.jour === date}
            disabled={c.passe}
            onclick={() => (date = c.jour)}
          >
            <span class="numero">{c.numero}</span>
            {#if c.mois}<span class="mois">{c.mois}</span>{/if}
          </button>
        {/each}
      {/each}
    </div>

    <h2 class={titreSection}>Parcours de l’évaluation</h2>
    {#each groupes as g (g.cle)}
      {@const ids = g.parcours.map((p) => p.id)}
      <section class="flex flex-col gap-2" aria-label={g.theme || 'Sans chapitre'}>
        <ul class={listeGroupee}>
          <li>
            <svelte:element this={g.parcours.length > 1 ? 'label' : 'div'} class={ligne}>
              <span class="flex flex-col min-w-0">
                <span class="truncate font-bold text-coopmaths-corpus dark:text-coopmathsdark-corpus">{g.theme || 'Sans chapitre'}</span>
                {#if g.niveau}<span class={discret}>{g.niveau}</span>{/if}
              </span>
              {#if g.parcours.length > 1}
                <input
                  type="checkbox"
                  role="switch"
                  class="interrupteur shrink-0"
                  aria-label="Tout le chapitre {g.theme}"
                  checked={ids.every((id) => coches.includes(id))}
                  onchange={(e) => basculer(ids, e.currentTarget.checked)}
                />
              {/if}
            </svelte:element>
          </li>
          {#each g.parcours as p (p.id)}
            <li>
              <label class={ligne}>
                <span class="flex flex-col min-w-0">
                  <span class="truncate text-coopmaths-corpus dark:text-coopmathsdark-corpus">{p.titre}</span>
                  {#if !p.nb}<span class={discret}>Pas encore commencé</span>{/if}
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  class="interrupteur shrink-0"
                  aria-label="Réviser {p.titre}"
                  checked={coches.includes(p.id)}
                  onchange={(e) => basculer([p.id], e.currentTarget.checked)}
                />
              </label>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </main>
  <footer
    class="barre-bas fixed bottom-0 left-0 right-0 z-20 px-4 py-3 zone-sure-bas
    border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  >
    <div class="colonne lecture flex flex-col gap-2">
      <p class="text-center {discret}" aria-live="polite">
        {manque.length ? `À choisir : ${manque.join(', ')}` : `${choisis.length} parcours · ${dateEnMots}`}
      </p>
      <button type="button" class="{boutonAction} {desactive} w-full" style="min-height: 44px" disabled={manque.length > 0} onclick={valider}>
        {evaluation ? 'Enregistrer' : 'Commencer la préparation'}
      </button>
    </div>
  </footer>
</div>

<style>
  /* La barre du bas (texte et bouton) ne cache pas le dernier parcours */
  .avec-barre {
    padding-bottom: calc(8rem + var(--bas));
  }
  .calendrier {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }
  .entete {
    text-align: center;
    padding-bottom: 2px;
  }
  .case {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    border-radius: 12px;
    background: var(--app-fond-2);
    line-height: 1.1;
  }
  .case:disabled {
    background: transparent;
    opacity: 0.35;
  }
  .case.aujourdhui {
    box-shadow: inset 0 0 0 2px var(--app-presse);
  }
  .case.choisi {
    background: var(--app-action);
    color: var(--app-fond);
    box-shadow: none;
  }
  .numero {
    font-weight: 600;
  }
  .mois {
    font-size: 0.6875rem;
  }
</style>
