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
    // Dans la page, le trou fait foi, même vide : la valeur LaTeX contient aussi
    // ce qui suit le trou (« \\text{ cm}^2 »), pris sinon pour une réponse
    if (champ.isConnected && typeof champ.getPromptValue === 'function') return champ.getPromptValue('champ1') ?? ''
    return /\\placeholder\[champ1\](?:\[[^\]]*\])*\{([^{}]*)\}/.exec(champ.value ?? '')?.[1] ?? ''
  }

  /** Champ à trous (« 81 = … × … ») dont aucun trou n'est rempli : sa valeur LaTeX n'est jamais vide */
  function trousVides(champ: HTMLElement & { getPrompts?: () => string[]; getPromptValue?: (p: string) => string }) {
    const trous = champ.isConnected ? (champ.getPrompts?.() ?? []) : []
    return trous.length > 0 && trous.every((t) => !champ.getPromptValue?.(t)?.trim())
  }

  // Éléments de réponse de MathALÉA qui ne sont ni un champ ni une case :
  // liste déroulante, champs multiples (« … < √a < … »), glisser-déposer,
  // sélection dans une figure (plaque de chocolat). Leur valeur (id → value)
  // est celle que MathALÉA enregistre et réécrit.
  const ELEMENTS_REPONSE = 'liste-deroulante[id], multi-mathfield[id], drag-and-drop[id], svg-selection[id]'
  // Éléments lus par leurs champs ou par leur valeur : un toucher n'y est pas une réponse
  const LUS = new Set(['MATH-FIELD', 'INPUT', 'TEXTAREA', 'SELECT', 'LISTE-DEROULANTE', 'MULTI-MATHFIELD', 'DRAG-AND-DROP', 'SVG-SELECTION', 'MATHALEA-QCM'])
  // Élément de réponse de MathALÉA : id …Ex<n>Q<k>… (Ex<n>F<k> pour apigeom), hors smiley et message de retour
  const ID_REPONSE = /Ex\d+[QF]\d+/
  const ID_RETOUR = /^(resultatCheck|feedback)/

  // Toucher une figure, un point, une horloge… (cliquer une figure, placer un
  // point avec apigeom, etc.) : ces réponses ne se lisent pas toutes ; le
  // toucher suffit pour que Vérifier s'active
  let interagi = false
  function surInteraction(e: Event) {
    if (resultat || lectureSeule) return
    const chemin = e.composedPath().filter((n): n is Element => n instanceof Element)
    if (chemin.some((n) => LUS.has(n.tagName))) return
    if (!chemin.some((n) => ID_REPONSE.test(n.id) && !ID_RETOUR.test(n.id))) return
    interagi = true
    setTimeout(() => zone?.isConnected && surSaisie(new Event('input')))
  }

  /** Valeur d'un élément de réponse : texte, ou JSON (champs multiples, zones du glisser-déposer) */
  function remplie(v: unknown): boolean {
    if (typeof v === 'string') {
      if (v.trim() === '') return false
      try {
        const x: unknown = JSON.parse(v)
        if (x !== null && typeof x === 'object') return remplie(x)
      } catch {
        /* texte simple */
      }
      return true
    }
    if (Array.isArray(v)) return v.some(remplie)
    if (v !== null && typeof v === 'object') return Object.values(v).some(remplie)
    return v != null
  }

  function lireSaisies(): Record<string, string> {
    const saisies: Record<string, string> = {}
    const figures: Record<string, Record<string, string>> = {}
    for (const element of zone.querySelectorAll<HTMLElement & { value?: unknown }>(ELEMENTS_REPONSE)) {
      const v = element.value
      if ((typeof v === 'string' && remplie(v)) || (typeof v === 'number' && v !== 0)) saisies[element.id] = String(v)
    }
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

  // Glisser-déposer : aucune saisie n'est signalée, on relit après le dépôt
  function surDepot() {
    setTimeout(() => zone?.isConnected && surSaisie(new Event('input')))
  }

  // Dans un trou, MathLive n'envoie pas « input » : seulement « beforeinput »
  // (avant le changement) et « selection-change ». On relit juste après.
  function surSaisieTrou(e: Event) {
    const type = e.type === 'beforeinput' ? 'input' : 'change'
    // La question a pu quitter l'écran entre-temps
    setTimeout(() => zone?.isConnected && surSaisie(new Event(type)))
  }

  function surSaisie(e: Event) {
    if (resultat) return
    // Case sans id dans un élément de MathALÉA (grilles KenKen, sudoku, curseurs) :
    // sa valeur ne se lit pas une à une, la frappe suffit pour que Vérifier s'active
    const cible = e.target
    if (cible instanceof HTMLElement && !cible.id && ID_REPONSE.test(cible.parentElement?.closest('[id]')?.id ?? '')) interagi = true
    aSaisi = interagi || Object.keys(lireSaisies()).length > 0
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
    // Message de retour de MathALÉA écrit à la vérification (« Le point $A$ a
    // pour abscisse… ») : ses formules ne sont pas encore rendues
    for (const retour of zone.querySelectorAll<HTMLElement>('[id^="feedbackEx"]')) if (retour.textContent?.includes('$')) await moteur.afficher(retour)
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
      // Champs multiples : leurs champs sont dans l'élément (shadow DOM)
      const champs = [...zone.querySelectorAll<HTMLElement>('math-field, input:not([type=checkbox]), multi-mathfield')]
        .flatMap((c) => (c.tagName === 'MULTI-MATHFIELD' ? [...(c.shadowRoot?.querySelectorAll<HTMLElement>('math-field') ?? [])] : [c]))
        .filter((c) => c.isConnected)
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
    resultat ? 'verifiee' : interagi || Object.keys(lireSaisies()).length ? 'saisie' : 'vide'

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
    for (const type of ['drop', 'dragend', 'touchend']) z.addEventListener(type, surDepot)
    for (const type of ['click', 'pointerup', 'keyup']) z.addEventListener(type, surInteraction)
    return () => {
      z.removeEventListener('selection-change', surSaisieTrou)
      for (const type of ['drop', 'dragend', 'touchend']) z.removeEventListener(type, surDepot)
      for (const type of ['click', 'pointerup', 'keyup']) z.removeEventListener(type, surInteraction)
    }
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
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    bind:this={zone}
    class="contenu-mathalea question-eleve text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    style={lectureSeule ? 'pointer-events: none' : undefined}
    inert={lectureSeule}
    oninput={surSaisie}
    onchange={surSaisie}
    onbeforeinput={surSaisieTrou}
    onkeydown={surTouche}
  ></div>
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
