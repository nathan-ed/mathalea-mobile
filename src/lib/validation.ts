// Formes attendues des données lues de l'extérieur (fichiers partagés,
// sauvegardes). Tout ce que l'interface lit est contrôlé, y compris l'unicité
// des noms et identifiants qui servent de clés aux listes : un doublon ou une
// valeur manquante y provoque un écran vide.
import { COULEURS_GRAPHIQUE, FORMES_POINT, TRAITS, estOuverture, type Etape, type Fiche, type Parcours } from './catalogue'
import { compiler } from './expression'

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
    optionnel(e.objectifs, textesUniques) &&
    [e.sup, e.sup2, e.sup3, e.sup4].every((s) => optionnel(s, estParametre))
  )
}

// Fiches de cours : chaque bloc selon son type ; graphiques dont les
// expressions se calculent, images intégrées au fichier (SVG ou PNG)
const estCouleur = (c: unknown) => (COULEURS_GRAPHIQUE as readonly unknown[]).includes(c)
const estStyle = (v: unknown) =>
  estObjet(v) && optionnel(v.trait, (t) => (TRAITS as readonly unknown[]).includes(t)) && optionnel(v.couleur, estCouleur)
const estIntervalle = (v: unknown) => listeDe(v, estNombre) && (v as number[]).length === 2 && (v as number[])[0] < (v as number[])[1]
function estGraphique(g: Record<string, unknown>) {
  const curseurs = g.curseurs ?? {}
  if (!dictionnaireDe(curseurs, (c) => listeDe(c, estNombre) && [3, 4].includes((c as number[]).length) && (c as number[])[0] < (c as number[])[1]))
    return false
  const noms = Object.keys(curseurs as object)
  if (noms.some((n) => !/^[a-df-wyz]$/.test(n))) return false // une lettre, ni x ni e
  const borne = (b: unknown) => estNombre(b) || (estTexte(b) && noms.includes(b))
  const fonction = (k: unknown) => estEntier(k) && (k as number) >= 0 && (k as number) < (g.fonctions as unknown[]).length
  return (
    listeDe(g.fonctions, (f) => estTexte(f) && compiler(f, ['x', ...noms]) !== null) &&
    (g.fonctions as unknown[]).length > 0 &&
    estIntervalle(g.x) &&
    estIntervalle(g.y) &&
    optionnel(g.aire, (a) => estObjet(a) && borne(a.de) && borne(a.a) && optionnel(a.fonction, fonction) && optionnel(a.entre, fonction)) &&
    optionnel(g.valeur, (b) => typeof b === 'boolean') &&
    optionnel(g.legende, estTexte) &&
    optionnel(g.styles, (l) => listeDe(l, estStyle) && (l as unknown[]).length <= (g.fonctions as unknown[]).length) &&
    optionnel(g.points, (l) =>
      listeDe(l, (p) =>
        estObjet(p) &&
        borne(p.x) &&
        // y donné, ou point sur une courbe
        (p.y === undefined ? fonction(p.sur) : borne(p.y) && p.sur === undefined) &&
        optionnel(p.forme, (f) => (FORMES_POINT as readonly unknown[]).includes(f)) &&
        optionnel(p.couleur, estCouleur) &&
        optionnel(p.nom, estTexte) &&
        optionnel(p.coordonnees, (b) => typeof b === 'boolean'),
      ),
    ) &&
    optionnel(g.textes, (l) =>
      listeDe(l, (t) => estObjet(t) && borne(t.x) && borne(t.y) && estTexte(t.texte) && optionnel(t.couleur, estCouleur)),
    )
  )
}
const IMAGE = /^data:image\/(svg\+xml|png|jpeg|webp)[;,]/
function estBloc(v: unknown): boolean {
  if (!estObjet(v)) return false
  switch (v.type) {
    case 'texte':
      return estTexte(v.texte)
    case 'retenir':
      return estTexte(v.texte) && optionnel(v.titre, estTexte)
    case 'exemple':
      return estTexte(v.enonce) && listeDe(v.etapes, estTexte) && optionnel(v.titre, estTexte)
    case 'question': {
      const choix = v.choix === undefined || (listeDe(v.choix, estTexte) && (v.choix as string[]).length >= 2)
      const qcm = v.choix !== undefined && estEntier(v.bonne) && (v.bonne as number) >= 0 && (v.bonne as number) < (v.choix as string[]).length
      return estTexte(v.enonce) && estTexte(v.explication) && choix && (qcm || (v.choix === undefined && estNombre(v.reponse)))
    }
    case 'graphique':
      return estGraphique(v)
    case 'image':
      return estTexte(v.src) && IMAGE.test(v.src) && estTexte(v.alt) && optionnel(v.legende, estTexte)
    case 'lien':
      return estTexte(v.titre) && estTexte(v.lien) && /^https?:\/\//.test(v.lien)
    default:
      return false
  }
}
export const estFiche = (v: unknown): v is Fiche =>
  estObjet(v) && estTexte(v.titre) && optionnel(v.avant, (b) => typeof b === 'boolean') && listeDe(v.blocs, estBloc)

const ACCES = ['libre', 'seuil']
const estRessource = (r: unknown) => estObjet(r) && estTexte(r.titre) && estTexte(r.lien)
const estPalier = (v: unknown) =>
  estObjet(v) &&
  estTexte(v.titre) &&
  estEntier(v.nb) &&
  (v.nb as number) >= 0 &&
  optionnel(v.acces, (a) => ACCES.includes(a as string)) &&
  optionnel(v.seuil, (n) => estNombre(n) && (n as number) >= 0 && (n as number) <= 100) &&
  optionnel(v.ouverture, estOuverture) &&
  optionnel(v.ressource, estRessource) &&
  optionnel(v.pause, (x) => estObjet(x) && estTexte(x.texte) && optionnel(x.ressource, estRessource)) &&
  optionnel(v.fiche, estFiche)

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
    listeDe(p.etapes, estEtape) &&
    optionnel(p.paliers, (l) => listeDe(l, estPalier)) &&
    optionnel(p.style, (x) => x === 'paliers' || x === 'ceintures') &&
    optionnel(p.premiereCeinture, (n) => estEntier(n) && (n as number) >= 0 && (n as number) < 7) &&
    optionnel(p.enTetesMasques, (b) => typeof b === 'boolean') &&
    optionnel(p.melanger, (b) => typeof b === 'boolean') &&
    optionnel(p.fiche, estFiche)
  )
}

/** Parcours valides, chacun une seule fois */
export const parcoursUniques = (v: unknown): v is Parcours[] =>
  listeDe(v, estParcours) && sansDoublon((v as Parcours[]).map((p) => p.id))

/** Classes d'un fichier partagé : noms uniques, parcours uniques dans chaque classe */
export const classesDuFichier = (v: unknown) =>
  listeDe(v, (c) => estObjet(c) && estTexte(c.nom) && parcoursUniques(c.parcours)) &&
  sansDoublon((v as { nom: string }[]).map((c) => c.nom))
