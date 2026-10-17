// « Teste ton niveau » : 15 questions tirées des annales de la Course aux
// nombres (CAN) de MathALÉA, 5 parmi les questions 1 à 10 des sujets
// (automatismes), 10 parmi les suivantes. Les questions sont classées par
// domaine (questionsCan.json, scripts/questions-can.mts) : le tirage alterne
// les domaines et ne prend jamais deux fois la même question ni le même titre.
// 80 % donnent la ceinture du niveau. Tout vient du moteur : rien ne quitte
// l'appareil.
import { CEINTURES, type Etape, type Parcours } from './catalogue'
import type { ExerciceDuReferentiel } from './moteur'
import { melanger } from './progression'
import QUESTIONS_CAN from './questionsCan.json'

export const SEUIL_TEST = 80
export const NB_AUTOMATISMES = 5 // parmi les questions 1 à 10 des sujets
export const NB_QUESTIONS = 15
export const PREFIXE_TEST = 'test-niveau-'

export interface NiveauTest {
  cle: string // dans l'identifiant du parcours généré
  nom: string
  prefixe: string // sujets « can<prefixe>a-<année> » du référentiel
  titre?: RegExp // CM1 et CM2 partagent le même préfixe
}

/** Du plus facile au plus difficile ; le rang donne la ceinture */
export const NIVEAUX_TEST: NiveauTest[] = [
  { cle: 'cm1', nom: 'CM1', prefixe: 'c3', titre: /CM1/ },
  { cle: 'cm2', nom: 'CM2', prefixe: 'c3', titre: /CM2/ },
  { cle: '6e', nom: '6e', prefixe: '6' },
  { cle: '5e', nom: '5e', prefixe: '5' },
  { cle: '4e', nom: '4e', prefixe: '4' },
  { cle: '3e', nom: '3e', prefixe: '3' },
  { cle: '2de', nom: '2de', prefixe: '2' },
  { cle: '1re', nom: '1re', prefixe: '1' },
  { cle: 'terminale', nom: 'Terminale', prefixe: 'TSpe' },
]

/** « Ceinture verte », puis « Ceinture noire, 2e dan » au-delà de la noire */
export function ceintureDu(rang: number) {
  return rang < CEINTURES.length ? `Ceinture ${CEINTURES[rang].nom}` : `Ceinture noire, ${rang - CEINTURES.length + 2}e dan`
}
export const couleurDu = (rang: number) => CEINTURES[Math.min(rang, CEINTURES.length - 1)].couleur

/**
 * Sujets officiels utilisables : à partir de 2024, les sujets du site
 * permettent de choisir leurs questions (paramètre 2 : « 3-7-12 »). Les
 * sujets plus anciens et les « Spéciale année » ne le permettent pas tous.
 */
const SUJET = /^can(.+)a-(\d{4})[a-zA-Z]?$/
export const ANNEE_MINIMUM = 2024

/** Question d'un sujet, classée (questionsCan.json) */
export interface QuestionCan {
  n: number // rang dans le sujet, à partir de 1
  source: string // fichier de MathALÉA : une question reprise par deux sujets n'est tirée qu'une fois
  titre: string
  domaine: string | null
}
export type ClassementCan = Record<string, QuestionCan[]> // par identifiant de sujet

/** Sujets du niveau présents dans le moteur et dans le classement */
export function sujetsDu(niveau: NiveauTest, referentiel: ExerciceDuReferentiel[], classement: ClassementCan = QUESTIONS_CAN) {
  return referentiel.filter((e) => {
    const m = SUJET.exec(e.id)
    return (
      !!m &&
      e.interactif &&
      e.niveau === 'CAN' &&
      m[1] === niveau.prefixe &&
      Number(m[2]) >= ANNEE_MINIMUM &&
      (!niveau.titre || niveau.titre.test(e.titre)) &&
      !!classement[e.id]?.length
    )
  })
}

type Candidate = QuestionCan & { sujet: ExerciceDuReferentiel }
const cleTitre = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\(qcm\)|[^a-z0-9]+/g, ' ')
    .trim()

/**
 * k questions qui alternent les domaines (le moins servi d'abord), sans
 * reprendre une source ni un titre déjà pris. Un titre vide ne compte pas
 * comme doublon.
 */
function piocher(candidates: Candidate[], k: number, graine: string, prises: Set<string>) {
  const parDomaine = new Map<string, Candidate[]>()
  for (const c of melanger(candidates, graine)) parDomaine.set(c.domaine ?? 'autres', [...(parDomaine.get(c.domaine ?? 'autres') ?? []), c])
  // Questions sans domaine (titre vide ou « Question 12 ») : seulement pour compléter
  const domaines = melanger([...parDomaine.keys()].filter((d) => d !== 'autres').sort(), `${graine}-domaines`)
  const choix: Candidate[] = []
  for (const tour of [domaines, ['autres']]) {
    let progres = true
    while (choix.length < k && progres) {
      progres = false
      for (const d of tour) {
        if (!parDomaine.has(d)) continue
        if (choix.length >= k) break
        const liste = parDomaine.get(d)!
        const i = liste.findIndex((c) => !prises.has(c.source) && !(cleTitre(c.titre) && prises.has(`titre:${cleTitre(c.titre)}`)))
        if (i === -1) continue
        const [c] = liste.splice(i, 1)
        prises.add(c.source)
        if (cleTitre(c.titre)) prises.add(`titre:${cleTitre(c.titre)}`)
        choix.push(c)
        progres = true
      }
    }
  }
  return choix
}

/** Questions d'un sujet groupées en une étape : « 3-7 » produit les questions 3 et 7 */
function etapesDe(choix: Candidate[]): Etape[] {
  const parSujet = new Map<string, Candidate[]>()
  for (const c of choix) parSujet.set(c.sujet.uuid, [...(parSujet.get(c.sujet.uuid) ?? []), c])
  return [...parSujet.values()].map((cs) => {
    const numeros = cs.map((c) => c.n).sort((a, b) => a - b)
    return {
      uuid: cs[0].sujet.uuid,
      id: cs[0].sujet.id,
      titre: cs[0].sujet.titre,
      nbQuestions: numeros.length,
      sup: 'false', // données aléatoires, pas celles du sujet officiel
      sup2: numeros.join('-'),
      sup3: 'false',
      titreMasque: true, // l'élève ne voit jamais le nom du sujet
    }
  })
}

/**
 * Textes vus par l'élève : titre et ceinture, sans référence aux sujets.
 * Appliqué aussi aux tirages enregistrés par les versions précédentes.
 */
export function presenterTest(p: Parcours): Parcours {
  const rang = niveauDuTest(p.id)
  if (rang === -1) return p
  return {
    ...p,
    titre: `Teste ton niveau : ${NIVEAUX_TEST[rang].nom}`,
    objectif: `${ceintureDu(rang)} : ${SEUIL_TEST} % de réponses correctes.`,
    theme: 'Teste ton niveau',
    etapes: p.etapes.map((e) => ({ ...e, titreMasque: true })),
  }
}

/**
 * Nouveau test d'un niveau : 5 questions parmi les questions 1 à 10 des
 * sujets, 10 parmi les suivantes, domaines alternés, sans doublon. La version
 * augmente à chaque tirage : la séance garde sa copie figée.
 */
export function tirerTest(
  niveau: NiveauTest,
  sujets: ExerciceDuReferentiel[],
  graine: string,
  version: number,
  classement: ClassementCan = QUESTIONS_CAN,
): Parcours {
  const toutes: Candidate[] = sujets.flatMap((sujet) => (classement[sujet.id] ?? []).map((q) => ({ ...q, sujet })))
  const prises = new Set<string>()
  const automatismes = piocher(
    toutes.filter((q) => q.n <= 10),
    NB_AUTOMATISMES,
    `${graine}-1`,
    prises,
  )
  const suite = piocher(
    toutes.filter((q) => q.n > 10),
    NB_QUESTIONS - automatismes.length,
    `${graine}-2`,
    prises,
  )
  return presenterTest({
    id: `${PREFIXE_TEST}${niveau.cle}`,
    version,
    titre: '',
    objectif: '',
    niveau: niveau.nom,
    theme: '',
    difficulte: 2,
    icone: 'bx-timer',
    presentation: 'une_question_par_page',
    correction: 'parcours',
    enTetesMasques: true,
    melanger: true,
    etapes: etapesDe([...automatismes, ...suite]),
  })
}

export const estTest = (id: string | undefined) => !!id?.startsWith(PREFIXE_TEST)
export const niveauDuTest = (id: string) => NIVEAUX_TEST.findIndex((n) => `${PREFIXE_TEST}${n.cle}` === id)

/** Ce que l'app garde du test, par niveau : dernier tirage et date de validation */
export interface EtatNiveau {
  tirage?: Parcours
  reperage?: boolean // 0.3.0 (repérage puis validation) : lu, plus utilisé
  valideLe?: string
}
export type EtatTest = Record<string, EtatNiveau>
