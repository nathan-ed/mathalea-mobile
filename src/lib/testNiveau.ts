// « Teste ton niveau » : questions tirées des annales de la Course aux nombres
// (CAN) de MathALÉA. Par niveau, 10 questions de repérage prises parmi les
// questions 1 à 10 des sujets, puis 20 questions de validation prises parmi
// les suivantes. Un niveau validé donne sa ceinture. Tout vient du moteur :
// rien n'est intégré à l'app, rien ne quitte l'appareil.
import { CEINTURES, type Etape, type Parcours } from './catalogue'
import type { ExerciceDuReferentiel } from './moteur'
import { melanger } from './progression'

export const SEUIL_TEST = 80
export const NB_REPERAGE = 10
export const NB_VALIDATION = 20
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

export interface SujetCan {
  uuid: string
  id: string
  titre: string
  nbQuestions: number
}

export function sujetsDu(niveau: NiveauTest, referentiel: ExerciceDuReferentiel[]) {
  return referentiel.filter((e) => {
    const m = SUJET.exec(e.id)
    return (
      !!m &&
      e.interactif &&
      e.niveau === 'CAN' &&
      m[1] === niveau.prefixe &&
      Number(m[2]) >= ANNEE_MINIMUM &&
      (!niveau.titre || niveau.titre.test(e.titre))
    )
  })
}

/** Questions d'un sujet groupées en une étape : « 3-7 » produit les questions 3 et 7 */
function etapesDe(choix: { sujet: SujetCan; numero: number }[], sujets: SujetCan[]): Etape[] {
  return sujets
    .map((sujet) => ({
      sujet,
      numeros: choix
        .filter((c) => c.sujet.uuid === sujet.uuid)
        .map((c) => c.numero)
        .sort((a, b) => a - b),
    }))
    .filter((x) => x.numeros.length)
    .map(({ sujet, numeros }) => ({
      uuid: sujet.uuid,
      id: sujet.id,
      titre: sujet.titre,
      nbQuestions: numeros.length,
      sup: 'false', // données aléatoires, pas celles du sujet officiel
      sup2: numeros.join('-'),
      sup3: 'false',
    }))
}

/**
 * Nouveau test d'un niveau : tirage sans doublon, 10 questions parmi les
 * questions 1 à 10 des sujets, 20 parmi les suivantes. La version augmente à
 * chaque tirage : la séance garde sa copie figée.
 */
export function tirerTest(niveau: NiveauTest, sujets: SujetCan[], graine: string, version: number): Parcours {
  const numeros = (s: SujetCan, de: number, a: number) =>
    Array.from({ length: Math.max(0, Math.min(a, s.nbQuestions) - de + 1) }, (_, i) => ({ sujet: s, numero: de + i }))
  const reperage = melanger(
    sujets.flatMap((s) => numeros(s, 1, NB_REPERAGE)),
    `${graine}-reperage`,
  ).slice(0, NB_REPERAGE)
  const validation = melanger(
    sujets.flatMap((s) => numeros(s, NB_REPERAGE + 1, s.nbQuestions)),
    `${graine}-validation`,
  ).slice(0, NB_VALIDATION)
  const etapes1 = etapesDe(reperage, sujets)
  const etapes2 = etapesDe(validation, sujets)
  return {
    id: `${PREFIXE_TEST}${niveau.cle}`,
    version,
    titre: `Teste ton niveau : ${niveau.nom}`,
    objectif: `${NB_REPERAGE} questions de repérage, puis ${NB_VALIDATION} pour valider (${SEUIL_TEST} % pour réussir).`,
    niveau: niveau.nom,
    theme: 'Course aux nombres',
    difficulte: 2,
    icone: 'bx-timer',
    presentation: 'une_question_par_page',
    correction: 'parcours',
    enTetesMasques: true,
    melanger: true,
    etapes: [...etapes1, ...etapes2],
    paliers: [
      { titre: 'Repérage', nb: etapes1.length },
      { titre: 'Validation', nb: etapes2.length, acces: 'seuil', seuil: SEUIL_TEST },
    ],
  }
}

export const estTest = (id: string | undefined) => !!id?.startsWith(PREFIXE_TEST)
export const niveauDuTest = (id: string) => NIVEAUX_TEST.findIndex((n) => `${PREFIXE_TEST}${n.cle}` === id)

/** Étapes de la partie 0 (repérage) ou 1 (validation) d'un test tiré */
export function partie(p: Parcours, k: 0 | 1) {
  const nb = p.paliers?.[0]?.nb ?? 0
  return k === 0 ? Array.from({ length: nb }, (_, i) => i) : Array.from({ length: p.etapes.length - nb }, (_, i) => nb + i)
}

/** Ce que l'app garde du test : dernier tirage et étapes franchies, par niveau */
export interface EtatNiveau {
  tirage?: Parcours
  reperage?: boolean // repérage réussi sur ce tirage : validation à faire
  valideLe?: string
}
export type EtatTest = Record<string, EtatNiveau>
