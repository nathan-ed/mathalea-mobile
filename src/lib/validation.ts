// Formes attendues des données lues de l'extérieur (fichiers partagés,
// sauvegardes). Tout ce que l'interface lit est contrôlé, y compris l'unicité
// des noms et identifiants qui servent de clés aux listes : un doublon ou une
// valeur manquante y provoque un écran vide.
import type { Etape, Parcours } from './catalogue'

export const estObjet = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
export const estTexte = (v: unknown): v is string => typeof v === 'string'
export const estNombre = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
export const estEntier = (v: unknown): v is number => Number.isInteger(v)
export const listeDe = (v: unknown, f: (x: unknown) => boolean): v is unknown[] => Array.isArray(v) && v.every(f)
export const dictionnaireDe = (v: unknown, f: (x: unknown) => boolean) => estObjet(v) && Object.values(v).every(f)
export const optionnel = (v: unknown, f: (x: unknown) => boolean) => v === undefined || f(v)
/** Aucune valeur en double (valeurs déjà contrôlées) */
export const sansDoublon = (valeurs: unknown[]) => new Set(valeurs).size === valeurs.length
export const textesUniques = (v: unknown): v is string[] => listeDe(v, estTexte) && sansDoublon(v)

const PRESENTATIONS = ['une_question_par_page', 'un_exo_par_page', 'liste_exos']
const VALIDATIONS = ['question', 'page', 'parcours']
// Paramètres d'exercice : chaînes comme dans l'URL du site (anciennes données : nombres ou booléens)
const estParametre = (v: unknown) => estTexte(v) || estNombre(v) || typeof v === 'boolean'

export function estEtape(v: unknown): v is Etape {
  const e = v as Etape
  return (
    estObjet(e) &&
    estTexte(e.uuid) &&
    estTexte(e.titre) &&
    optionnel(e.id, estTexte) &&
    optionnel(e.nbQuestions, (n) => estEntier(n) && (n as number) > 0) &&
    optionnel(e.titreMasque, (b) => typeof b === 'boolean') &&
    [e.sup, e.sup2, e.sup3, e.sup4].every((s) => optionnel(s, estParametre))
  )
}

export function estParcours(v: unknown): v is Parcours {
  const p = v as Parcours
  return (
    estObjet(p) &&
    estTexte(p.id) &&
    /^[a-z0-9-]+$/.test(p.id) &&
    estEntier(p.version) &&
    p.version > 0 &&
    estTexte(p.titre) &&
    estTexte(p.objectif) &&
    estTexte(p.niveau) &&
    estTexte(p.theme) &&
    [1, 2, 3].includes(p.difficulte) &&
    optionnel(p.icone, estTexte) &&
    PRESENTATIONS.includes(p.presentation) &&
    VALIDATIONS.includes(p.correction) &&
    listeDe(p.etapes, estEtape)
  )
}

/** Parcours valides, chacun une seule fois */
export const parcoursUniques = (v: unknown): v is Parcours[] =>
  listeDe(v, estParcours) && sansDoublon((v as Parcours[]).map((p) => p.id))

/** Classes d'un fichier partagé : noms uniques, parcours uniques dans chaque classe */
export const classesDuFichier = (v: unknown) =>
  listeDe(v, (c) => estObjet(c) && estTexte(c.nom) && parcoursUniques(c.parcours)) &&
  sansDoublon((v as { nom: string }[]).map((c) => c.nom))
