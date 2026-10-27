// Types des parcours. Les parcours arrivent par les dossiers partagés
// (fichiers .json des dossiers partagés, voir partage.ts) ; aucun n'est intégré à l'app.
import type { ParamsExercice } from './moteur'

export interface Etape extends ParamsExercice {
  titre: string // titre vu par l'élève : celui de MathALÉA par défaut, modifiable
  titreMasque?: boolean // l'élève voit « Exercice n »
  objectifs?: string[] // libellés des objectifs visés (liste de l'enseignant)
}

/** Titre d'un exercice tel que l'élève le voit, sans la référence MathALÉA ni les $ */
export const titreEleve = (e: Etape, i: number) => (e.titreMasque ? `Exercice ${i + 1}` : e.titre.replace(/\$([^$]*)\$/g, '$1'))

/** Mêmes valeurs que le presMode de MathALÉA */
export type Presentation = 'une_question_par_page' | 'un_exo_par_page' | 'liste_exos'

export type Validation = 'question' | 'page' | 'parcours'

/** Accès à un palier : toujours ouvert, ou à partir d'une réussite au palier précédent (seuil choisi par l'enseignant) */
export type Acces = 'libre' | 'seuil'

export interface Ressource {
  titre: string
  lien: string // PDF, vidéo… sur un drive partagé par lien
}

/** Pause après un palier : un point de cours, une consigne, un encouragement */
export interface Pause {
  texte: string
  ressource?: Ressource
}

/**
 * Fiche de cours : lue dans l'app avant de s'entraîner (d'office la première
 * fois si `avant`), puis gardée comme ressource. Portée par le parcours, elle
 * voyage avec lui et la séance en garde la copie figée.
 */
export interface Fiche {
  titre: string
  avant?: boolean // montrée d'office avant la première séance du palier (ou du parcours)
  blocs: Bloc[]
}

/**
 * Blocs d'une fiche. Les textes acceptent **gras**, *italique*, les listes
 * (lignes « - ») et les formules LaTeX entre $ (dans la ligne) ou $$ (centrées).
 */
export type Bloc =
  | { type: 'texte'; texte: string }
  | { type: 'retenir'; titre?: string; texte: string } // encadré « À retenir »
  | { type: 'exemple'; titre?: string; enonce: string; etapes: string[] } // étapes dévoilées une à une
  | { type: 'question'; enonce: string; choix?: string[]; bonne?: number; reponse?: number; explication: string } // non notée
  | ({ type: 'graphique' } & Graphique)
  | { type: 'image'; src: string; alt: string; legende?: string } // SVG ou PNG dans le fichier (data:)
  | { type: 'lien'; titre: string; lien: string } // PDF, vidéo… ouvert hors de l'app

/** Graphique tracé par l'app : courbes, aire ombrée entre deux bornes, curseurs */
export interface Graphique {
  fonctions: string[] // expressions en x (et en noms de curseurs) : « x^2/4+1/2 », « a*sin(x) »
  x: [number, number]
  y: [number, number]
  aire?: { fonction?: number; entre?: number; de: number | string; a: number | string } // bornes : nombre ou nom de curseur
  curseurs?: Record<string, [number, number, number] | [number, number, number, number]> // min, max, valeur, pas
  valeur?: boolean // affiche la valeur de l'intégrale, calculée
  legende?: string
  styles?: StyleCourbe[] // dans l'ordre des fonctions (absent : trait plein, bleu puis orange)
  points?: PointGraphique[]
  textes?: TexteGraphique[]
}

/** Couleurs de MathALÉA proposées dans les graphiques */
export const COULEURS_GRAPHIQUE = ['bleu', 'orange', 'vert', 'gris'] as const
export type CouleurGraphique = (typeof COULEURS_GRAPHIQUE)[number]
export const TRAITS = ['plein', 'tirets', 'pointilles'] as const
export const FORMES_POINT = ['plein', 'vide', 'croix'] as const

export interface StyleCourbe {
  trait?: (typeof TRAITS)[number]
  couleur?: CouleurGraphique
}

/** Coordonnée : nombre ou nom de curseur (le point suit alors le curseur) */
export type Coordonnee = number | string

/** Point : y donné, ou sur la courbe `sur` (rang dans fonctions) */
export interface PointGraphique {
  x: Coordonnee
  y?: Coordonnee
  sur?: number
  forme?: (typeof FORMES_POINT)[number] // plein par défaut
  couleur?: CouleurGraphique
  nom?: string // « A », formule acceptée entre $
  coordonnees?: boolean // affiche (x ; y) à côté du point
}

/** Texte posé dans le repère, centré sur (x ; y) ; formules entre $ */
export interface TexteGraphique {
  x: Coordonnee
  y: Coordonnee
  texte: string
  couleur?: CouleurGraphique
}

/**
 * Palier : suite d'exercices consécutifs du parcours. Les étapes restent une
 * seule liste (les anciennes versions de l'app ignorent les paliers et
 * affichent tout le parcours).
 */
export interface Palier {
  titre: string
  nb: number // nombre d'exercices, pris dans l'ordre des étapes
  acces?: Acces // ignoré pour le premier palier
  seuil?: number // pourcentage à atteindre au palier précédent (accès « seuil »)
  ouverture?: string // instant d'ouverture, 8 h du jour choisi chez l'enseignant (« 2026-11-12T08:00:00+01:00 ») ; fermé avant, en plus de l'accès
  ressource?: Ressource // pour revoir la notion, mise en avant tant que le palier n'est pas réussi
  pause?: Pause // affichée après le palier
  fiche?: Fiche // cours du palier
}

export interface Parcours {
  id: string
  version: number // augmente à chaque export modifié ; les séances gardent la leur
  titre: string
  objectif: string
  niveau: string
  theme: string
  difficulte: 1 | 2 | 3
  icone: string // classe boxicons
  presentation: Presentation
  // Validation (et correction) après chaque question, à la fin de chaque page, ou à la fin du parcours
  correction: Validation
  etapes: Etape[]
  paliers?: Palier[]
  style?: StylePaliers // présentation des paliers aux élèves
  premiereCeinture?: number // rang dans CEINTURES de la première ceinture (0 : blanche)
  enTetesMasques?: boolean // ni numéro ni titre d'exercice : les questions s'enchaînent
  melanger?: boolean // questions de plusieurs exercices dans un ordre mélangé (sauf un exercice par page)
  fiche?: Fiche // cours du parcours entier (parcours sans paliers, ou fiche générale)
}

/** Ordre mélangé : seulement si une page ou le parcours mêle plusieurs exercices */
export const melange = (p: Pick<Parcours, 'melanger' | 'presentation'>) => !!p.melanger && p.presentation !== 'un_exo_par_page'

/** Paliers numérotés, ou ceintures comme au judo (blanche, jaune…) */
export type StylePaliers = 'paliers' | 'ceintures'

/** Ceintures dans l'ordre ; au-delà de la noire, des dan. Seule couleur hors charte : celle de la ceinture elle-même */
export const CEINTURES = [
  { nom: 'blanche', couleur: '#f5f5f4' },
  { nom: 'jaune', couleur: '#facc15' },
  { nom: 'orange', couleur: '#f97316' },
  { nom: 'verte', couleur: '#16a34a' },
  { nom: 'bleue', couleur: '#2563eb' },
  { nom: 'marron', couleur: '#78350f' },
  { nom: 'noire', couleur: '#1c1917' },
] as const

type OptionsCeintures = Pick<Parcours, 'style' | 'premiereCeinture'>
const rangCeinture = (p: OptionsCeintures, k: number) => (p.premiereCeinture ?? 0) + k

/** Nom d'un palier selon le style : « Palier 2 » ou « Ceinture jaune » (à partir de la première ceinture choisie) */
export function nomPalier(p: OptionsCeintures, k: number) {
  if (p.style !== 'ceintures') return `Palier ${k + 1}`
  const r = rangCeinture(p, k)
  return r < CEINTURES.length ? `Ceinture ${CEINTURES[r].nom}` : `Ceinture noire, ${r - CEINTURES.length + 2}e dan`
}

export const couleurCeinture = (p: OptionsCeintures, k: number) => CEINTURES[Math.min(rangCeinture(p, k), CEINTURES.length - 1)].couleur

/** Jour de l'appareil, au format AAAA-MM-JJ (celui des dates d'ouverture) */
export function jourLocal(d = new Date()) {
  const deux = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`
}

/** Date valide au format AAAA-MM-JJ (pas de 31 février) */
export function estJour(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const [a, m, j] = v.split('-').map(Number)
  const d = new Date(a, m - 1, j)
  return d.getFullYear() === a && d.getMonth() === m - 1 && d.getDate() === j
}

/** Heure d'ouverture d'un palier le jour choisi (Nathan : « 8:00 matin ») */
export const HEURE_OUVERTURE = 8

/**
 * Ouverture d'un palier au jour choisi : 8 h ce jour-là dans le fuseau de
 * l'appareil de l'enseignant (heure d'été comprise), décalage écrit en clair.
 */
export function ouvertureDuJour(jour: string) {
  const [a, m, j] = jour.split('-').map(Number)
  const decalage = -new Date(a, m - 1, j, HEURE_OUVERTURE).getTimezoneOffset()
  const deux = (n: number) => String(n).padStart(2, '0')
  const signe = decalage < 0 ? '-' : '+'
  return `${jour}T${deux(HEURE_OUVERTURE)}:00:00${signe}${deux(Math.floor(Math.abs(decalage) / 60))}:${deux(Math.abs(decalage) % 60)}`
}

/** Instant d'ouverture valide : « AAAA-MM-JJTHH:MM:SS » suivi de « Z » ou du décalage */
export function estOuverture(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(v) && estJour(v.slice(0, 10)) && Number.isFinite(Date.parse(v))
}

/** Jour de l'ouverture chez l'enseignant (AAAA-MM-JJ) */
export const jourOuverture = (ouverture: string) => ouverture.slice(0, 10)

/** « jeudi 12 novembre à 8 h » (« à 8 h 30 »), heure de l'enseignant */
export function momentOuverture(ouverture: string, aujourdhui = jourLocal()) {
  const h = Number(ouverture.slice(11, 13))
  const min = ouverture.slice(14, 16)
  return `${jourEnLettres(jourOuverture(ouverture), aujourdhui)} à ${h} h${min === '00' ? '' : ` ${min}`}`
}

/** « jeudi 12 novembre », avec l'année si ce n'est pas celle de `aujourdhui` */
export function jourEnLettres(jour: string, aujourdhui = jourLocal()) {
  const [a, m, j] = jour.split('-').map(Number)
  const memeAnnee = jour.slice(0, 4) === aujourdhui.slice(0, 4)
  return new Date(a, m - 1, j).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', ...(memeAnnee ? {} : { year: 'numeric' }) })
}

/** Paliers d'un parcours avec les rangs de leurs étapes ; sans paliers valides, un seul palier */
export function paliersDe(p: Parcours) {
  const paliers = p.paliers ?? []
  const valides = paliers.length > 1 && paliers.reduce((a, x) => a + x.nb, 0) === p.etapes.length
  if (!valides)
    return [
      {
        titre: '',
        etapes: p.etapes.map((_, i) => i),
        acces: 'libre' as Acces,
        seuil: 0,
        ouverture: undefined as string | undefined,
        ressource: undefined as Ressource | undefined,
        pause: undefined as Pause | undefined,
        fiche: p.fiche,
      },
    ]
  let debut = 0
  return paliers.map((x, k) => {
    const etapes = Array.from({ length: x.nb }, (_, j) => debut + j)
    debut += x.nb
    return {
      titre: x.titre,
      etapes,
      acces: k === 0 ? ('libre' as Acces) : (x.acces ?? 'libre'),
      seuil: x.seuil ?? 80,
      ouverture: x.ouverture,
      ressource: x.ressource,
      pause: x.pause,
      fiche: x.fiche ?? (k === 0 ? p.fiche : undefined),
    }
  })
}

/**
 * Fiche de cours de ces exercices : celle de leur palier (la fiche du
 * parcours compte pour le premier), avec la clé qui retient qu'elle a été
 * montrée d'office.
 */
export function ficheDe(p: Parcours, etapes?: number[]): { fiche: Fiche; cle: string } | null {
  const paliers = paliersDe(p)
  const k = etapes ? paliers.findIndex((x) => x.etapes.join() === etapes.join()) : 0
  const fiche = paliers[k]?.fiche ?? (k <= 0 ? p.fiche : undefined)
  return fiche ? { fiche, cle: `${p.id}#${Math.max(k, 0)}` } : null
}

/** Organisation en quelques mots, pour les tuiles : « 3 paliers », « Ceintures orange à bleue » */
export function organisationDe(p: Parcours) {
  const n = paliersDe(p).length
  if (n < 2) return ''
  if (p.style !== 'ceintures') return `${n} paliers`
  const nom = (k: number) => nomPalier(p, k).replace(/^Ceinture /, '')
  return `Ceintures ${nom(0)} à ${nom(n - 1)}`
}

/** Icônes proposées pour un parcours (boxicons du site) */
export const ICONES = [
  { classe: 'bx-calculator', nom: 'Calcul' },
  { classe: 'bx-math', nom: 'Algèbre' },
  { classe: 'bx-shape-triangle', nom: 'Géométrie' },
  { classe: 'bx-shape-circle', nom: 'Cercle' },
  { classe: 'bx-ruler', nom: 'Mesures' },
  { classe: 'bx-cube', nom: 'Espace' },
  { classe: 'bx-line-chart', nom: 'Fonctions' },
  { classe: 'bx-bar-chart-alt-2', nom: 'Statistiques' },
  { classe: 'bx-dice-5', nom: 'Probabilités' },
  { classe: 'bx-transfer-alt', nom: 'Proportionnalité' },
  { classe: 'bx-code-alt', nom: 'Algorithmique' },
  { classe: 'bx-coin-stack', nom: 'Argent' },
  { classe: 'bx-timer', nom: 'Durées' },
  { classe: 'bx-brain', nom: 'Réflexion' },
  { classe: 'bx-target-lock', nom: 'Objectif' },
  { classe: 'bx-book-content', nom: 'Cours' },
] as const

const REGLES_ICONES: [RegExp, string][] = [
  [/probabil|hasard|aleatoire/, 'bx-dice-5'],
  [/statisti|donnee|diagramme|moyenne|mediane/, 'bx-bar-chart-alt-2'],
  [/proportion|pourcentage|echelle|vitesse|ratio/, 'bx-transfer-alt'],
  [/algorithm|programm|scratch|informatique/, 'bx-code-alt'],
  [/fonction|graphique|repere|reperage|droite gradu/, 'bx-line-chart'],
  [/espace|solide|pave|pyramide|cone|cylindre|sphere|patron/, 'bx-cube'],
  [/cercle|disque/, 'bx-shape-circle'],
  [/triangle|pythagore|thales|trigono|angle|geometr|parallelogramme|polygone|transformation|symetr|homothet|translation|rotation|quadrilatere/, 'bx-shape-triangle'],
  [/longueur|aire|perimetre|grandeur|mesure|volume|unite|conversion/, 'bx-ruler'],
  [/prix|argent|monnaie|budget/, 'bx-coin-stack'],
  [/duree|horaire|heure/, 'bx-timer'],
  [/litteral|equation|algebr|expression|factoris|develop|inequation/, 'bx-math'],
  [/relatif|nombre|calcul|operation|fraction|decima|puissance|entier|division|multipl|racine|arithmet/, 'bx-calculator'],
]

/** Icône proposée d'après le chapitre (l'enseignant peut en choisir une autre) */
export function iconeProposee(theme: string) {
  const t = theme.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  return REGLES_ICONES.find(([re]) => re.test(t))?.[1] ?? 'bx-book-content'
}
