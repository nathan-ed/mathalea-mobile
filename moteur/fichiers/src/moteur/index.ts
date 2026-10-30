// Moteur MathALÉA embarquable : génération, affichage et vérification des
// exercices, sans l'application (menus, URL, exports). Il est construit à part
// (`pnpm build:moteur`) et chargé à l'exécution par une application hôte, qui
// peut ainsi recevoir les nouveaux exercices sans être mise à jour.
// L'API est versionnée par API_MOTEUR : l'hôte refuse un moteur incompatible.
import 'boxicons/css/boxicons.min.css'
import 'katex/dist/katex.min.css'
import seedrandom from 'seedrandom'
import { mount, unmount } from 'svelte'
import '../app.css'

import Keyboard from '../components/keyboard/Keyboard.svelte'

import { composeQuestionContext } from '../lib/components/questionContext'
import {
  addCliqueFigureElementToQuestion,
  verifQuestionCliqueFigure,
} from '../lib/customElements/CliqueFigureElement'
import {
  listOfCustomElements,
  mathaleaCustomElementsRegistry,
} from '../lib/customElements/MathaleaCustomElement'
import {
  exerciceContientCliqueFigure,
  uniformiseResults,
} from '../lib/interactif/gestionInteractif'
import {
  mathaleaFormatExercice,
  mathaleaGenerateSeed,
  mathaleaHandleExerciceSimple,
  mathaleaHandleParamOfOneExercice,
  mathaleaLoadExerciceFromUuid,
  mathaleaRenderDiv,
} from '../lib/mathalea'
import { mathaleaWriteStudentPreviousAnswers } from '../lib/mathaleaUtils'
import { referentielLocale } from '../lib/stores/languagesStore'
import {
  interactivityTypeToCustomElementFormat,
  type IExercice,
  type InterfaceParams,
} from '../lib/types'
import { loadMathLive } from '../modules/loaders'
import katex from 'katex'
import {
  buildReferentiel,
  codeToLevelTitle,
  getAllEndings,
} from '../lib/components/refUtils'
import { sortArrayOfResourcesBasedOnPathThenId } from '../lib/components/sorting'
import {
  isExerciceItemInReferentiel,
  isJSONReferentielEnding,
  type JSONReferentielObject,
} from '../lib/types/referentiels'

export const API_MOTEUR = 1
export const VERSION_MOTEUR: string =
  typeof __MOTEUR_VERSION__ === 'string' ? __MOTEUR_VERSION__ : 'dev'

declare const __MOTEUR_VERSION__: string | undefined

export interface ParamsExercice {
  uuid: string
  id?: string
  nbQuestions?: number
  sup?: string
  sup2?: string
  sup3?: string
  sup4?: string
  sup5?: string
  alea?: string
  /** false : énoncés sans champs de réponse ni QCM cliquables (export, impression). Par défaut : true */
  interactif?: boolean
}

export interface QuestionPreparee {
  contexte: string // consigne et introduction communes, à garder visibles
  enonce: string
  correction: string
  interactive: boolean
  // Une case laissée vide fait partie de la bonne réponse (« laisser vides les
  // lignes inutiles ») : Vérifier doit marcher sans saisie
  videAccepte: boolean
}

export interface ExercicePrepare {
  uuid: string
  titre: string
  graine: string
  numero: number
  questions: QuestionPreparee[]
  // Objet MathALÉA, à repasser tel quel à verifier()
  interne: IExercice
}

export interface ResultatVerification {
  juste: boolean
  points: number
  total: number
  retour: string // message de MathALÉA (HTML), vide le plus souvent
  reponses: Record<string, string>
}

let initialise = false
// Exercices préparés, par numéro : afficher() active leurs figures à cliquer
const exercicesPrepares = new Map<number, IExercice>()

/** À appeler une fois avant le premier exercice */
export async function initialiser() {
  if (initialise) return
  initialise = true
  // Hors du site, aucune remontée d'erreur (bugsnag) : simple journal local
  if (typeof window.notify !== 'function') {
    window.notify = (message: unknown) => console.warn('[moteur]', message)
  }
  // Les tracés à main levée (MainLevee, roughjs) s'appuient sur le conteneur
  // du site : sans lui, leurs segments disparaissent des figures
  if (!document.getElementById('appMathalea')) {
    const conteneur = document.createElement('div')
    conteneur.id = 'appMathalea'
    conteneur.hidden = true
    document.body.appendChild(conteneur)
  }
  await loadMathLive()
}

/**
 * Langue du référentiel : en fr-CH, MathALÉA adapte notations et vocabulaire
 * (\cdot, préimage…). À fixer avant de générer les exercices.
 */
export function definirLangue(langue: 'fr-FR' | 'fr-CH') {
  referentielLocale.set(langue)
}

/**
 * Charge et génère un exercice. Sans graine, une nouvelle est tirée : l'hôte
 * la conserve (ExercicePrepare.graine) pour régénérer exactement les mêmes valeurs.
 * `numero` fixe les identifiants des champs (champTexteEx<numero>Q<i>) : deux
 * exercices affichés en même temps doivent avoir des numéros différents.
 */
export async function preparerExercice(
  params: ParamsExercice,
  numero: number,
): Promise<ExercicePrepare> {
  const exercice = await mathaleaLoadExerciceFromUuid(params.uuid)
  const interactif = params.interactif !== false
  const p: InterfaceParams = {
    ...params,
    alea: params.alea ?? mathaleaGenerateSeed(),
    interactif: interactif ? '1' : '0',
  } as InterfaceParams
  mathaleaHandleParamOfOneExercice(exercice, p)
  exercice.interactif = interactif
  exercice.numeroExercice = numero
  if (exercice.typeExercice === 'simple') {
    mathaleaHandleExerciceSimple(exercice, interactif, numero)
  } else if (typeof exercice.nouvelleVersionWrapper === 'function') {
    seedrandom(String(exercice.seed), { global: true })
    exercice.nouvelleVersionWrapper(numero)
  }
  sansEspacesExiges(exercice)
  exercicesPrepares.set(numero, exercice)
  const contexte = mathaleaFormatExercice(composeQuestionContext(exercice))
  const enonces = (exercice.listeQuestions ?? []).map((enonce) =>
    mathaleaFormatExercice(enonce),
  )
  const questions = enonces.map((html, i) => ({
    contexte,
    enonce: html,
    correction: mathaleaFormatExercice(exercice.listeCorrections?.[i] ?? ''),
    interactive: indicesDeLaQuestion(exercice, i, enonces).length > 0,
    videAccepte: indicesDeLaQuestion(exercice, i, enonces).some((k) =>
      contientValeurVide(exercice.autoCorrection?.[k]?.valeur),
    ),
  }))
  return {
    uuid: params.uuid,
    titre: exercice.titre ?? '',
    graine: String(exercice.seed),
    numero,
    questions,
    interne: exercice,
  }
}

/**
 * Les espaces entre les classes de chiffres (« 12 345 ») ne sont jamais
 * exigés : un champ MathLive n'accepte pas d'espace tapé au clavier du
 * téléphone. L'option nombreAvecEspace est retirée des réponses attendues,
 * qui sont alors comparées comme des nombres (avec ou sans espaces).
 */
function sansEspacesExiges(exercice: IExercice) {
  const vus = new Set<object>()
  let retire = false
  const parcourir = (x: unknown, profondeur: number) => {
    if (x == null || typeof x !== 'object' || vus.has(x) || profondeur > 6)
      return
    vus.add(x)
    const o = x as Record<string, unknown>
    if ('nombreAvecEspace' in o) {
      delete o.nombreAvecEspace
      retire = true
    }
    for (const v of Object.values(o)) parcourir(v, profondeur + 1)
  }
  for (const ac of exercice.autoCorrection ?? []) {
    if (ac?.valeur != null) parcourir(ac.valeur, 0)
    if (ac?.reponse != null) parcourir(ac.reponse, 0)
  }
  if (!retire) return
  // La consigne ne demande plus les espaces
  const sansConsigne = (t: string) =>
    t
      .replace(/\s*Penser(?:, si besoin,)? à mettre les espaces nécessaires\./g, '')
      .replace(/ sans oublier les espaces\./g, '.')
  if (typeof exercice.consigne === 'string')
    exercice.consigne = sansConsigne(exercice.consigne)
  if (typeof exercice.introduction === 'string')
    exercice.introduction = sansConsigne(exercice.introduction)
  exercice.listeQuestions = (exercice.listeQuestions ?? []).map(sansConsigne)
}

/**
 * Rend un élément déjà inséré dans le document : formules KaTeX, champs
 * MathLive, figures. À appeler après chaque insertion de HTML du moteur.
 */
export async function afficher(element: HTMLElement) {
  mathaleaRenderDiv(element, -1)
  await loadMathLive(element)
  activerCliqueFigures(element)
  ajusterFigures(element)
  document.dispatchEvent(new CustomEvent('exercicesAffiches'))
  // Les figures apigeom se montent après coup (mathalea-dom-ready)
  requestAnimationFrame(() => ajusterFigures(element))
  setTimeout(() => ajusterFigures(element), 400)
}

/**
 * Réduit les figures mathalea2d plus larges que l'élément (95 % de sa largeur),
 * étiquettes KaTeX comprises. Même calcul que adjustMathalea2dFiguresWidth
 * (ExerciceMathaleaVueEleve.svelte). À rappeler si la largeur change (rotation).
 */
export function ajusterFigures(element: HTMLElement) {
  const largeur = element.clientWidth
  if (!largeur) return
  ajusterApigeom(element, largeur)
  for (const figure of element.querySelectorAll<SVGElement>('.mathalea2d')) {
    const d = figure.dataset
    if (!d.widthInitiale) d.widthInitiale = figure.getAttribute('width') ?? ''
    if (!d.heightInitiale)
      d.heightInitiale = figure.getAttribute('height') ?? ''
    const largeurInitiale = Number(d.widthInitiale)
    if (!largeurInitiale) continue
    const coef = Math.min(1, (largeur * 0.95) / largeurInitiale)
    figure.setAttribute('width', String(largeurInitiale * coef))
    figure.setAttribute('height', String(Number(d.heightInitiale) * coef))
    for (const etiquette of figure.parentElement?.querySelectorAll<HTMLElement>(
      'div.divLatex',
    ) ?? []) {
      etiquette.style.setProperty(
        'top',
        `${Number(etiquette.dataset.top ?? 0) * coef}px`,
      )
      etiquette.style.setProperty(
        'left',
        `${Number(etiquette.dataset.left ?? 0) * coef}px`,
      )
    }
  }
}

/**
 * « Cliquer sur la bonne figure » (clique-figure) : le site rend les figures
 * cliquables après les avoir affichées (prepareExerciceCliqueFigure, dans
 * QuestionParPage.svelte et ExerciceMathaleaVueEleve.svelte). Sans cela, un
 * toucher sur une figure ne fait rien. Ici, pour chaque question affichée
 * dans l'élément ; l'élément d'une question affichée auparavant (autre page)
 * est remplacé.
 */
function activerCliqueFigures(element: HTMLElement) {
  for (const [n, exercice] of exercicesPrepares) {
    if (!exercice.interactif || !exerciceContientCliqueFigure(exercice)) continue
    ;(exercice.listeQuestions ?? []).forEach((_, i) => {
      if (!element.querySelector(`[id^="cliquefigure"][id$="Ex${n}Q${i}"]`))
        return
      const id = `clique-figureEx${n}Q${i}`
      if (element.querySelector(`#${id}`)) return
      for (const ancien of document.querySelectorAll(`#${id}`)) ancien.remove()
      addCliqueFigureElementToQuestion(exercice, i)
    })
  }
}

/**
 * Figures apigeom plus larges que l'élément (droite graduée de 650 px sur un
 * téléphone) : réduites par leur propre zoom (événement zoomChanged de
 * figureApigeom, comme le zoom du site), qui garde la fenêtre mathématique et
 * recalcule la position des clics. Sans cela, une partie de la figure sort de
 * l'écran et ne peut plus être touchée.
 */
function ajusterApigeom(element: HTMLElement, largeur: number) {
  for (const conteneur of element.querySelectorAll<HTMLElement>(
    'div[id^="apigeomEx"]',
  )) {
    const svg = conteneur.querySelector('svg')
    const zoom = Number(conteneur.dataset.zoomMoteur ?? 1)
    const naturelle = (svg?.getBoundingClientRect().width ?? 0) / zoom
    if (!naturelle) continue
    const voulu = Math.min(1, (largeur * 0.95) / naturelle)
    if (Math.abs(voulu - zoom) < 0.01) continue
    conteneur.dataset.zoomMoteur = String(voulu)
    document.dispatchEvent(
      new CustomEvent('zoomChanged', {
        detail: { container: conteneur, zoom: voulu },
      }),
    )
  }
}

/** Réinjecte des réponses enregistrées dans les champs affichés */
export async function ecrireReponses(reponses: Record<string, string>) {
  await Promise.all(mathaleaWriteStudentPreviousAnswers(reponses))
}

/**
 * Rangs de autoCorrection repérés dans un énoncé : id …Ex<n>Q<k>… d'un
 * élément de réponse (champTexteEx<n>Q<k>, MetaInteractif2dEx<n>Q<k>field<j>…),
 * question-index des éléments de MathALÉA, index d'apigeom-figure.
 */
function rangsDansEnonce(exercice: IExercice, html: string): Set<number> {
  const n = exercice.numeroExercice
  const trouves = new Set<number>()
  for (const m of html.matchAll(
    new RegExp(`\\bid=["']([\\w-]*?)Ex${n}Q(\\d+)(?!\\d)`, 'g'),
  ))
    // Le smiley et le message de retour ne sont pas des réponses : une question
    // peut porter celui de son propre rang sans en avoir la réponse (6AutoA2-2)
    if (!/^(resultatCheck|feedback)/.test(m[1])) trouves.add(Number(m[2]))
  // Éléments de MathALÉA : question-index, ou index pour apigeom-figure (sans guillemets)
  for (const balise of html.match(/<[a-z][\w-]*\s[^>]*>/gi) ?? []) {
    if (!new RegExp(`\\snumero-exercice=["']?${n}(?![\\d])`).test(balise))
      continue
    const rang = /\s(?:question-)?index=["']?(\d+)/.exec(balise)
    if (rang) trouves.add(Number(rang[1]))
  }
  return trouves
}

/**
 * Rangs de autoCorrection vérifiés par la question i (rang dans listeQuestions).
 * Ils diffèrent quand une question porte plusieurs réponses à part : Thales2D
 * (3G20) range les deux longueurs de la question e aux rangs 2e et 2e+1.
 * Chaque rang appartient à une seule question : la sienne si elle le contient,
 * sinon la première qui le contient. Un énoncé qui reprend par erreur l'id
 * d'une autre question (845fa : meta-interactif-2dEx0Q0field0 dans la
 * question 2) ne lui fait pas vérifier la réponse de celle-ci, absente de la
 * page. Sans rang repéré, le rang de la question.
 */
/** Réponse attendue dont une case vaut « » (tableau à compléter en partie) */
function contientValeurVide(valeur: unknown, profondeur = 0): boolean {
  if (valeur == null || typeof valeur !== 'object' || profondeur > 4)
    return false
  return Object.entries(valeur as Record<string, unknown>).some(([cle, v]) =>
    cle === 'value'
      ? v === '' || (Array.isArray(v) && v.includes(''))
      : contientValeurVide(v, profondeur + 1),
  )
}

function indicesDeLaQuestion(
  exercice: IExercice,
  i: number,
  enonces: string[],
): number[] {
  const rangs = enonces.map((html) => rangsDansEnonce(exercice, html))
  const proprietaire = (k: number) =>
    rangs[k]?.has(k) ? k : rangs.findIndex((r) => r.has(k))
  const avecReponse = [...(rangs[i] ?? [])]
    .filter(
      (k) => exercice.autoCorrection?.[k] != null && proprietaire(k) === i,
    )
    .sort((a, b) => a - b)
  if (avecReponse.length) return avecReponse
  return exercice.autoCorrection?.[i] != null ? [i] : []
}

function reponsesDeLaQuestion(exercice: IExercice, indices: number[]) {
  const motifs = indices.map(
    (k) => new RegExp(`Ex${exercice.numeroExercice}Q${k}(?!\\d)`),
  )
  return Object.fromEntries(
    Object.entries(exercice.answers ?? {}).filter(([cle]) =>
      motifs.some((motif) => motif.test(cle)),
    ),
  )
}

type Verification = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}

/** Vérifie le rang k de autoCorrection, selon son type d'interactivité */
function verifierRang(exercice: IExercice, k: number): Verification {
  const type = exercice.autoCorrection[k]?.formatInteractif
  if (type == null) {
    return {
      isOk: false,
      feedback: '',
      score: { nbBonnesReponses: 0, nbReponses: 0 },
    }
  }
  if (type === 'cliqueFigure') {
    return uniformiseResults(verifQuestionCliqueFigure(exercice, k))
  }
  if (type === 'custom') {
    return uniformiseResults(exercice.correctionInteractive!(k))
  }
  const format = interactivityTypeToCustomElementFormat(type) ?? type
  const entree = listOfCustomElements.includes(format)
    ? Array.from(mathaleaCustomElementsRegistry).find(([tag]) => tag === format)
    : undefined
  if (entree == null || typeof entree[1].verifQuestion !== 'function') {
    throw new Error(`Type d'interactivité non pris en charge : ${type}`)
  }
  return uniformiseResults(entree[1].verifQuestion(exercice, k))
}

/**
 * Vérifie la question i d'un exercice affiché. Même logique que la vue
 * « une question par page » de MathALÉA (QuestionParPage.svelte), pour chacun
 * des rangs de réponse de la question : juste si tous le sont.
 */
export function verifier(
  prepare: ExercicePrepare,
  i: number,
): ResultatVerification {
  const exercice = prepare.interne
  exercice.answers ??= {}
  const enonces = prepare.questions.map((q) => q.enonce)
  const indices = indicesDeLaQuestion(exercice, i, enonces)
  const resultats = (indices.length ? indices : [i]).map((k) =>
    verifierRang(exercice, k),
  )
  return {
    juste: resultats.every((r) => r.isOk),
    points: resultats.reduce((s, r) => s + r.score.nbBonnesReponses, 0),
    total: resultats.reduce((s, r) => s + r.score.nbReponses, 0),
    retour: resultats
      .map((r) => r.feedback ?? '')
      .filter((f) => f.trim() !== '')
      .join('<br>'),
    reponses: reponsesDeLaQuestion(exercice, indices.length ? indices : [i]),
  }
}

/**
 * Monte le clavier virtuel de MathALÉA (fixé en bas de l'écran, touches
 * propres à chaque champ). Renvoie la fonction qui le démonte. L'élément
 * #mathalea-virtual-keyboard permet à l'hôte de mesurer sa hauteur.
 */
export function monterClavier(cible: HTMLElement): () => void {
  const clavier = mount(Keyboard, { target: cible })
  return () => {
    void unmount(clavier)
  }
}

/** Paramètre réglable d'un exercice, comme dans le formulaire du site (Settings.svelte) */
export interface ParametreExercice {
  cle: 'sup' | 'sup2' | 'sup3' | 'sup4' | 'sup5'
  titre: string
  type: 'nombre' | 'liste' | 'case' | 'texte'
  max?: number // nombre : de 1 à max
  options?: { valeur: string; libelle: string }[] // liste : une valeur ; texte : plusieurs, séparées par des tirets
  aide?: string
  defaut: string
}

export interface DescriptionExercice {
  uuid: string
  titre: string
  nbQuestions: number
  nbQuestionsModifiable: boolean
  parametres: ParametreExercice[]
}

/** Valeurs « n : libellé » d'une info-bulle de paramètre */
const optionsDe = (aide: string) =>
  aide
    .split('\n')
    .map((l) => /^\s*(\d+)\s*:\s*(.+)$/.exec(l))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({ valeur: m[1], libelle: m[2].trim() }))

/**
 * Nombre de questions et paramètres (sup à sup5) d'un exercice, avec leurs
 * valeurs par défaut, pour l'éditeur de parcours de l'hôte.
 */
export async function decrireExercice(
  uuid: string,
): Promise<DescriptionExercice> {
  const e = await mathaleaLoadExerciceFromUuid(uuid)
  const parametres: ParametreExercice[] = []
  const suffixes = ['', '2', '3', '4', '5'] as const
  for (const n of suffixes) {
    const cle = `sup${n}` as ParametreExercice['cle']
    const exo = e as unknown as Record<string, unknown>
    const defaut = exo[cle] === undefined ? '' : String(exo[cle])
    const num = exo[`besoinFormulaire${n}Numerique`]
    const texte = exo[`besoinFormulaire${n}Texte`]
    const caseACocher = exo[`besoinFormulaire${n}CaseACocher`]
    if (Array.isArray(num) && num.length >= 2) {
      const aide = typeof num[2] === 'string' ? num[2] : ''
      const options = optionsDe(aide)
      parametres.push(
        options.length
          ? { cle, titre: String(num[0]), type: 'liste', options, defaut }
          : {
              cle,
              titre: String(num[0]),
              type: 'nombre',
              max: Number(num[1]) || undefined,
              aide: aide || undefined,
              defaut,
            },
      )
    } else if (Array.isArray(texte)) {
      const aide = String(texte[1] ?? '')
      const options = optionsDe(aide)
      parametres.push({
        cle,
        titre: String(texte[0]),
        type: 'texte',
        options: options.length ? options : undefined,
        aide: aide.split('\n')[0] || undefined,
        defaut,
      })
    } else if (Array.isArray(caseACocher)) {
      parametres.push({
        cle,
        titre: String(caseACocher[0]),
        type: 'case',
        defaut: defaut === 'true' ? 'true' : 'false',
      })
    }
  }
  return {
    uuid,
    titre: e.titre ?? '',
    nbQuestions: e.nbQuestions ?? 1,
    nbQuestionsModifiable: e.nbQuestionsModifiable !== false,
    parametres,
  }
}

/** Nœud du menu du site (niveau, chapitre, sous-chapitre…), tel qu'il s'y affiche */
export interface NoeudDuReferentiel {
  code: string
  /** Libellé du site : « 2N : Calcul numérique », « Seconde », ou intitulé seul pour un sous-thème */
  titre: string
  /** Sous-thème (6N1A, 9NO1A…) : le site le montre déplié, en intertitre */
  sousTheme: boolean
}

export interface ExerciceDuReferentiel {
  uuid: string
  id: string
  titre: string
  niveau: string
  theme: string
  interactif: boolean
  /** Objectif du programme sous lequel le site range l'exercice (programmes 2025 et suivants) */
  objectif?: { code: string; libelle: string }
  /** Nœuds du menu du site, du niveau jusqu'au parent de l'exercice */
  chemin: NoeudDuReferentiel[]
}

/**
 * Sous-thème au sens du menu du site (ReferentielNode.svelte,
 * `themeCodeisSubthemeCode`) : déplié d'office, sans code affiché.
 */
function estSousTheme(code: string): boolean {
  const niveau = Array.from(code.replace('auto', ''))[0] ?? '6'
  const normalise = code.replace(/^can/, '').replace('auto', '')
  const n = /^\d/.test(normalise) ? normalise[0] : niveau
  return (
    new RegExp(`^${n}[A-Z]{1,2}\\d+[A-Z0-9]$`).test(normalise) ||
    /^(3Auto)?[A-Z]\d+[A-Z0-9]$/.test(code) ||
    /^[12]A-[A-Z]\d{1,2}$/.test(code)
  )
}

/**
 * Ordre des enfants d'un nœud du menu du site (ReferentielNode.svelte,
 * `prepareSubset`), pour les exercices aléatoires.
 */
function ordonnerEnfants(
  entrees: [string, unknown][],
  courant: string | undefined,
  niveaux: string[],
): [string, unknown][] {
  // Racine : ordre scolaire de codeToLevelList.json, puis les autres
  // (SideMenu.svelte, `orderFollowingSchoolLevel`)
  if (courant === undefined) {
    const rang = (k: string) => (niveaux.includes(k) ? niveaux.indexOf(k) : Infinity)
    return entrees.sort(([a], [b]) => {
      const ra = rang(a)
      const rb = rang(b)
      return ra === rb ? 0 : ra - rb
    })
  }
  if (courant.includes('CAN'))
    return entrees.sort(([a], [b]) => niveaux.indexOf(a) - niveaux.indexOf(b))
  const normalise = courant.replace(/^(auto|can)/, '')
  if (/^[12T]/.test(normalise) && entrees.some(([k]) => k.toLowerCase().includes('-flash')))
    return entrees.sort(([a], [b]) => {
      const fa = a.toLowerCase().includes('-flash')
      const fb = b.toLowerCase().includes('-flash')
      if (fa !== fb) return fa ? -1 : 1
      return a.localeCompare(b, 'fr', { numeric: true })
    })
  // Exercices : ordre du tri par chemin puis id (déjà appliqué)
  if (entrees.length && entrees.every(([, v]) => isJSONReferentielEnding(v))) return entrees
  const conteneurDeFeuilles = (v: unknown) => {
    if (v === null || typeof v !== 'object' || Array.isArray(v)) return false
    const enfants = Object.values(v as Record<string, unknown>)
    return enfants.length > 0 && enfants.every((e) => isJSONReferentielEnding(e))
  }
  if (entrees.length && entrees.every(([, v]) => conteneurDeFeuilles(v)))
    return entrees.sort(([a], [b]) => {
      const aa = a.includes('auto')
      const ab = b.includes('auto')
      if (aa !== ab) return aa ? 1 : -1
      return a.localeCompare(b, 'fr')
    })
  const prefixe = (k: string) => {
    const m = k.match(/^(\d+)/)
    return m ? parseInt(m[1], 10) : undefined
  }
  return entrees.sort(([a], [b]) => {
    const na = prefixe(a)
    const nb = prefixe(b)
    if (na === undefined && nb === undefined) return 0
    return (na ?? Infinity) - (nb ?? Infinity)
  })
}

/**
 * Titre (exercice, chapitre) avec ses formules rendues par KaTeX, comme dans
 * le menu du site. HTML à insérer tel quel.
 */
export function titreHtml(titre: string): string {
  const echappe = (t: string) =>
    t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return titre
    .split(/(\$[^$]*\$)/g)
    .map((morceau) =>
      /^\$[^$]*\$$/.test(morceau)
        ? katex.renderToString(morceau.slice(1, -1), { throwOnError: false })
        : echappe(morceau),
    )
    .join('')
}

/**
 * Exercices du référentiel du site (menu « Exercices aléatoires »), pour
 * l'éditeur de parcours de l'hôte, dans l'ordre et avec les nœuds du menu du
 * site. Chargé à la demande : il n'alourdit pas le démarrage.
 */
export async function listerExercices(
  pays: 'FR' | 'CH' = 'FR',
): Promise<ExerciceDuReferentiel[]> {
  const [
    { default: referentiel },
    { default: themes },
    { default: chapitres },
    { default: chapitresFR },
    { default: chapitresCH },
    { default: codesNiveaux },
  ] = await Promise.all([
    pays === 'CH'
      ? import('../json/referentiel2022CH.json')
      : import('../json/referentiel2022FR.json'),
    import('../json/codeToThemeList.json'),
    pays === 'CH'
      ? import('../json/levelsThemesListCH.json')
      : import('../json/levelsThemesList.json'),
    // Le menu du site cherche les intitulés dans les deux listes
    import('../json/levelsThemesList.json'),
    import('../json/levelsThemesListCH.json'),
    import('../json/codeToLevelList.json'),
  ])
  const nomsThemes = themes as Record<string, string | Record<string, string>>
  const nomsChapitres = chapitres as Record<string, { titre?: string }>
  const intitules = {
    ...(chapitresCH as Record<string, { titre?: string }>),
    ...(chapitresFR as Record<string, { titre?: string }>),
  }
  const nomTheme = (code: string) => {
    const c = nomsChapitres[code]?.titre
    if (c) return c
    const t = nomsThemes[code]
    return typeof t === 'string' ? t : (t?.['fr-FR'] ?? t?.['fr-CH'] ?? code)
  }
  // Libellé d'un nœud comme dans le menu du site (codeToLevelTitle + themeTitle)
  const noeud = (code: string): NoeudDuReferentiel => {
    const sousTheme = estSousTheme(code)
    const intitule = Object.hasOwn(intitules, code) ? intitules[code]?.titre : undefined
    if (sousTheme) return { code, titre: intitule || code, sousTheme }
    const nom = codeToLevelTitle(code)
    const base = typeof nom === 'string' && nom ? nom : code
    return { code, titre: intitule ? `${base} : ${intitule}` : base, sousTheme }
  }
  // Niveau > chapitre > objectif > exercice : le troisième code est un objectif du programme
  const objectifDe = (chemin: string[]) => {
    // Code d'objectif : il prolonge celui du chapitre (5N2 › 5N2G) ; ailleurs (CAN…), aucun
    const code = chemin.length >= 4 && chemin[2].startsWith(chemin[1]) ? chemin[2] : ''
    const libelle = code ? nomsChapitres[code]?.titre : undefined
    return libelle ? { objectif: { code, libelle } } : {}
  }
  // Même rangement que le site : tri par chemin puis id, puis ordre de chaque nœud
  const brut = referentiel as unknown as JSONReferentielObject
  const feuilles = getAllEndings(brut).filter((r) =>
    isExerciceItemInReferentiel(r.resource),
  )
  const arbre = buildReferentiel(sortArrayOfResourcesBasedOnPathThenId(feuilles, brut))
  const niveaux = Object.keys(codesNiveaux)
  const liste: ExerciceDuReferentiel[] = []
  const parcourir = (n: Record<string, unknown>, chemin: string[]) => {
    for (const [cle, valeur] of ordonnerEnfants(Object.entries(n), chemin.at(-1), niveaux)) {
      if (valeur == null || typeof valeur !== 'object') continue
      const v = valeur as Record<string, unknown>
      if (typeof v.uuid === 'string' && typeof v.id === 'string') {
        const features = v.features as
          { interactif?: { isActive?: boolean } } | undefined
        liste.push({
          uuid: v.uuid,
          id: v.id,
          titre: String(v.titre ?? ''),
          niveau: chemin[0] ?? '',
          theme: nomTheme(chemin[1] ?? ''),
          interactif: features?.interactif?.isActive === true,
          ...objectifDe([...chemin, cle]),
          chemin: chemin.map(noeud),
        })
      } else parcourir(v, [...chemin, cle])
    }
  }
  parcourir(arbre, [])
  return liste
}
