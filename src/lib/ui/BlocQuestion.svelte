<script lang="ts">
  // Une question MathALÉA : affichage, brouillon, vérification, correction.
  // Mise en forme reprise de Question.svelte (vue élève de MathALÉA).
  import { onDestroy, onMount, tick } from 'svelte'
  import type { ExercicePrepare, Moteur, ResultatVerification } from '$lib/moteur'
  import type { Essai } from '$lib/progression'
  import { boutonInverse, boutonLien } from './classes'

  let {
    moteur,
    exercice,
    question,
    avecContexte,
    verifierAuMontage = false,
    lectureSeule = false,
    avecBouton = false,
    essai,
    brouillon,
    onverifiee,
    onbrouillon,
    onvalider,
    onsaisie,
    correctionVue = false,
    onvoircorrection,
    aSaisi = $bindable(false),
  }: {
    moteur: Moteur
    exercice: ExercicePrepare
    question: number
    avecContexte: boolean
    verifierAuMontage?: boolean // soumission d'une tentative : vérifiée dès l'affichage
    lectureSeule?: boolean // relecture d'un passage terminé
    avecBouton?: boolean // lien « Vérifier » sous la question (Question.svelte de MathALÉA)
    essai: Essai | undefined
    brouillon: Record<string, string> | undefined
    onverifiee: (r: ResultatVerification) => void
    onbrouillon: (saisies: Record<string, string>) => void
    onvalider?: () => void // touche Entrée
    onsaisie?: () => void
    correctionVue?: boolean // question sans réponse à saisir : correction déjà ouverte
    onvoircorrection?: () => void
    aSaisi?: boolean
  } = $props()

  let zone: HTMLDivElement
  let zoneCorrection: HTMLDivElement | undefined = $state()
  let resultat: ResultatVerification | null = $state(null)
  // Question à faire sur papier (exercice non interactif) : l'élève ouvre la correction lui-même
  let vue = $state(false)
  let erreur = $state('')
  let minuterie: ReturnType<typeof setTimeout> | undefined
  let enAttente = false
  const q = $derived(exercice.questions[question])

  // Champ placé dans une figure (MetaInteractif2d) : la réponse est le « trou »
  // champ1 de la formule, rangée comme MathALÉA l'attend pour la réécrire :
  // MetaInteractif2dEx<n>Q<i> → {"MetaInteractif2dEx<n>Q<i>field<k>": "…"}
  const CHAMP_FIGURE = /^(MetaInteractif2dEx\d+Q\d+)field\d+$/

  /**
   * Contenu du trou champ1. Un champ déjà retiré de la page (question quittée)
   * ne répond plus à getPromptValue : sa valeur LaTeX, elle, reste lisible.
   */
  function trouDe(champ: HTMLElement & { value?: string; getPromptValue?: (p: string) => string }) {
    const v = champ.isConnected ? (champ.getPromptValue?.('champ1') ?? '') : ''
    if (v) return v
    return /\\placeholder\[champ1\](?:\[[^\]]*\])*\{(.*)\}/.exec(champ.value ?? '')?.[1] ?? ''
  }

  /** Champ à trous (« 81 = … × … ») dont aucun trou n'est rempli : sa valeur LaTeX n'est jamais vide */
  function trousVides(champ: HTMLElement & { getPrompts?: () => string[]; getPromptValue?: (p: string) => string }) {
    const trous = champ.isConnected ? (champ.getPrompts?.() ?? []) : []
    return trous.length > 0 && trous.every((t) => !champ.getPromptValue?.(t)?.trim())
  }

  function lireSaisies(): Record<string, string> {
    const saisies: Record<string, string> = {}
    const figures: Record<string, Record<string, string>> = {}
    for (const champ of zone.querySelectorAll<HTMLElement>('math-field[id], input[id]')) {
      const figure = CHAMP_FIGURE.exec(champ.id)
      if (figure) {
        const v = trouDe(champ as HTMLElement & { value?: string; getPromptValue?: (p: string) => string })
        if (v.trim() !== '') (figures[figure[1]] ??= {})[champ.id] = v
      } else if (champ instanceof HTMLInputElement && champ.type === 'checkbox') {
        if (champ.checked) saisies[champ.id] = '1'
      } else {
        const v = (champ as HTMLInputElement).value
        if (typeof v === 'string' && v.trim() !== '' && !trousVides(champ)) saisies[champ.id] = v
      }
    }
    for (const [cle, valeurs] of Object.entries(figures)) saisies[cle] = JSON.stringify(valeurs)
    return saisies
  }

  // Dans un trou, MathLive n'envoie pas « input » : seulement « beforeinput »
  // (avant le changement) et « selection-change ». On relit juste après.
  function surSaisieTrou(e: Event) {
    const type = e.type === 'beforeinput' ? 'input' : 'change'
    // La question a pu quitter l'écran entre-temps
    setTimeout(() => zone?.isConnected && surSaisie(new Event(type)))
  }

  // Question sans champ de saisie (horloge, tableur, liste déroulante, figure
  // à colorier, glisser-déposer…) : l'élément de MathALÉA garde la réponse, qui
  // ne se lit pas ici. Le premier geste dans la question suffit pour la vérifier
  // (sinon « Vérifier » restait grisé : question impossible à faire).
  let geste = false
  function surGeste() {
    if (geste || resultat || lectureSeule || !q.interactive || zone.querySelector('math-field[id], input[id]')) return
    geste = true
    aSaisi = true
    onsaisie?.()
  }

  function surSaisie(e: Event) {
    if (resultat) return
    surGeste()
    aSaisi = Object.keys(lireSaisies()).length > 0 || geste
    // Seulement une vraie frappe : « change » arrive aussi quand le champ perd
    // le focus, par exemple à l'ouverture du panneau « Soumettre quand même ? »,
    // qui se refermait alors aussitôt (premier toucher perdu)
    if (e.type === 'input') onsaisie?.()
    clearTimeout(minuterie)
    enAttente = true
    minuterie = setTimeout(envoyerBrouillon, 350)
  }

  /** Enregistre le brouillon en attente */
  function envoyerBrouillon() {
    clearTimeout(minuterie)
    if (!enAttente || resultat) return
    enAttente = false
    onbrouillon(lireSaisies())
  }

  function surTouche(e: KeyboardEvent) {
    if (e.key !== 'Enter') return
    // Entrée dans un élément de MathALÉA (cellule du tableur, liste…) lui revient
    if (!(e.target as HTMLElement).closest?.('math-field[id], input[id]')) return
    e.preventDefault()
    if (onvalider) onvalider()
    else if (!resultat && aSaisi) verifier()
  }

  async function voirCorrection() {
    vue = true
    onvoircorrection?.()
    await afficherCorrection()
  }

  async function afficherCorrection() {
    await tick()
    if (zoneCorrection) {
      zoneCorrection.innerHTML = q.correction
      await moteur.afficher(zoneCorrection)
    }
  }

  export function focaliser(defiler = false) {
    if (defiler) zone?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    // À l'image suivante, et seulement dans la page : MathLive lève une erreur
    // sur un champ pas encore monté ou déjà retiré (changement de question
    // rapide, constaté dans WebKit)
    requestAnimationFrame(() => {
      if (!zone?.isConnected) return
      // Premier champ vide, sinon le premier champ
      const champs = [...zone.querySelectorAll<HTMLElement>('math-field, input:not([type=checkbox])')].filter((c) => c.isConnected)
      const vide = champs.find((c) => !(c as HTMLInputElement).value?.trim())
      try {
        ;(vide ?? champs[0])?.focus({ preventScroll: defiler })
      } catch {
        /* champ en cours de remplacement : rien à faire */
      }
    })
  }

  /** État de la question pour le garde-fou de la séance */
  export const etat = (): 'verifiee' | 'saisie' | 'vide' =>
    resultat ? 'verifiee' : Object.keys(lireSaisies()).length || geste ? 'saisie' : 'vide'

  export const estVerifiee = () => resultat !== null

  export async function verifier() {
    if (resultat || !q.interactive) return
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    clearTimeout(minuterie)
    enAttente = false
    resultat = moteur.verifier(exercice, question)
    onverifiee(resultat)
    await afficherCorrection()
  }

  onMount(async () => {
    zone.innerHTML = (avecContexte && q.contexte.trim() ? `<div class="mb-4">${q.contexte}</div>` : '') + `<div>${q.enonce}</div>`
    await moteur.afficher(zone)
    if (essai) {
      // Déjà vérifiée : réponse, smiley et correction reviennent ; l'essai enregistré fait foi
      await moteur.ecrireReponses(essai.reponses)
      await tick()
      try {
        moteur.verifier(exercice, question)
      } catch {
        /* rien */
      }
      resultat = { juste: essai.juste, points: essai.points, total: essai.total, retour: '', reponses: essai.reponses }
      await afficherCorrection()
    } else {
      if (brouillon && Object.keys(brouillon).length) {
        await moteur.ecrireReponses(brouillon)
        await tick()
        aSaisi = Object.keys(lireSaisies()).length > 0
      }
      if (!q.interactive && (correctionVue || lectureSeule)) {
        vue = true
        await afficherCorrection()
      }
      if (verifierAuMontage) {
        try {
          await verifier()
        } catch (e) {
          erreur = `Cette question ne peut pas être vérifiée (${(e as Error).message}).`
        }
      }
    }
  })

  // Rotation ou redimensionnement : les figures reprennent la bonne largeur
  const surRedimension = () => {
    if (zone) moteur.ajusterFigures(zone)
    if (zoneCorrection) moteur.ajusterFigures(zoneCorrection)
  }
  onMount(() => {
    const z = zone
    z.addEventListener('selection-change', surSaisieTrou)
    return () => z.removeEventListener('selection-change', surSaisieTrou)
  })
  onMount(() => {
    addEventListener('resize', surRedimension)
    return () => removeEventListener('resize', surRedimension)
  })

  // Question quittée avant le délai : le brouillon part quand même. Après le
  // démontage seulement : pendant celui-ci, Svelte relit les anciennes valeurs
  // de l'état et la séance repartirait à la question quittée.
  onDestroy(() => {
    clearTimeout(minuterie)
    if (!enAttente || resultat) return
    const saisies = lireSaisies()
    queueMicrotask(() => onbrouillon(saisies))
  })
</script>

<div class="container max-w-full grid grid-cols-1 auto-cols-min gap-4 mb-3 lg:mb-4">
  <!-- Figure ou formule plus large que l'écran : elle défile dans la question
       (cadre-defilant, app.css) -->
  <div class="cadre-defilant">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      bind:this={zone}
      class="contenu-mathalea text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      style="font-size: 1.15rem; line-height: 1.6; {lectureSeule ? 'pointer-events: none' : ''}"
      inert={lectureSeule}
      oninput={surSaisie}
      onchange={surSaisie}
      onbeforeinput={surSaisieTrou}
      onkeydown={surTouche}
      onpointerupcapture={surGeste}
      onkeyupcapture={surGeste}
      ondropcapture={surGeste}
    ></div>
  </div>
  {#if avecBouton && !resultat && !lectureSeule && q.interactive}
    <div>
      <button
        type="button"
        class="{boutonInverse} disabled:opacity-40"
        style="min-height: 44px; min-width: 9rem"
        disabled={!aSaisi}
        onclick={async () => {
          try {
            await verifier()
          } catch (e) {
            erreur = `Cette question ne peut pas être vérifiée (${(e as Error).message}).`
          }
        }}
      >
        <i aria-hidden="true" class="bx bx-check-circle text-base"></i>
        Vérifier
      </button>
    </div>
  {/if}
  {#if !q.interactive && !vue && !lectureSeule}
    <div>
      <button type="button" class="{boutonLien} -ml-3" style="min-height: 44px" onclick={voirCorrection}>
        <i aria-hidden="true" class="bx bx-show text-base"></i>
        Voir la correction
      </button>
    </div>
  {/if}
  {#if erreur}
    <p class="font-bold text-coopmaths-action dark:text-coopmathsdark-action" role="alert">{erreur}</p>
  {/if}
  {#if resultat && resultat.total > 1}
    <span class="text-sm font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">
      Score : {resultat.points} / {resultat.total}
    </span>
  {/if}
</div>

{#if resultat || vue}
  <div
    class="relative self-start border-l-coopmaths-struct dark:border-l-coopmathsdark-struct border-l-[3px] text-coopmaths-corpus dark:text-coopmathsdark-corpus mt-6 mb-4 ml-0 py-2 pl-4"
  >
    <div class="contenu-mathalea container overflow-x-auto overflow-y-hidden py-1" bind:this={zoneCorrection}></div>
    <div
      class="absolute flex flex-row py-[1.5px] px-3 rounded-t-md justify-center items-center -left-0.75 -top-3.75 bg-coopmaths-struct dark:bg-coopmathsdark-struct font-semibold text-xs text-coopmaths-canvas dark:text-coopmathsdark-canvas"
    >
      Correction
    </div>
    <div class="absolute border-coopmaths-struct dark:border-coopmathsdark-struct bottom-0 left-0 border-b-[3px] w-4"></div>
  </div>
{/if}
