// Parcours de l'enseignant, enregistrés sur l'appareil ; un parcours peut aller à plusieurs classes.
// Chaque classe a son dossier partagé et son fichier parcours-mathalea.json.
// Une modification après un export ouvre la version suivante : les élèves
// gardent l'ancienne pour leurs séances commencées.
import type { Etape, Parcours } from './catalogue'
import { creerFichier, lireFichier, type FichierClasses } from './partage'
import type { Stockage } from './stockage'

export interface ParcoursEnseignant {
  parcours: Parcours
  classes: string[] // un même parcours peut être donné à plusieurs classes
  exportee: Record<string, number> // par classe : dernière version exportée
}

export interface ClasseEnseignant {
  nom: string
}

export interface Bibliotheque {
  lien?: string // dossier partagé de l'enseignant (toutes ses classes dans un fichier)
  classes: ClasseEnseignant[]
  parcours: ParcoursEnseignant[] // l'ordre de la liste est celui présenté aux élèves
}

const CLE = 'bibliotheque'

export async function lireBibliotheque(st: Stockage): Promise<Bibliotheque> {
  const b = await st.lire<Bibliotheque>(CLE)
  return b && Array.isArray(b.classes) && Array.isArray(b.parcours) ? b : { classes: [], parcours: [] }
}

export async function ecrireBibliotheque(st: Stockage, b: Bibliotheque) {
  await st.ecrire(CLE, b)
}

function identifiant(titre: string) {
  const base = titre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  return `${base || 'parcours'}-${Math.random().toString(36).slice(2, 7)}`
}

export function parcoursVide(): Parcours {
  return {
    id: '',
    version: 1,
    titre: '',
    objectif: '',
    niveau: '',
    theme: '',
    difficulte: 1,
    icone: 'bx-book-content',
    presentation: 'une_question_par_page',
    correction: 'question',
    etapes: [],
  }
}

/**
 * Rend un parcours existant (test, collectif…) éditable : il garde son
 * identifiant et sa version, et toute modification ouvre la version suivante,
 * pour que les élèves qui l'ont déjà la reçoivent.
 */
export function adopter(b: Bibliotheque, p: Parcours): Bibliotheque {
  if (b.parcours.some((pe) => pe.parcours.id === p.id)) return b
  const original: Parcours = JSON.parse(JSON.stringify(p))
  return { ...b, parcours: [...b.parcours, { parcours: original, classes: [], exportee: { '': original.version } }] }
}

export const parcoursDeClasse = (b: Bibliotheque, classe: string) => b.parcours.filter((pe) => pe.classes.includes(classe))

export const aExporter = (pe: ParcoursEnseignant, classe: string) => pe.exportee[classe] !== pe.parcours.version

export const chapitres = (b: Bibliotheque, classes: string[]) => [
  ...new Set(b.parcours.filter((pe) => pe.classes.some((c) => classes.includes(c))).map((pe) => pe.parcours.theme).filter(Boolean)),
]

/**
 * Enregistre un parcours (création ou modification) pour les classes choisies.
 * Une modification d'un parcours déjà exporté ouvre la version suivante.
 */
export function enregistrer(b: Bibliotheque, classes: string[], p: Parcours): Bibliotheque {
  const toutesClasses = [...b.classes]
  for (const nom of classes) if (!toutesClasses.some((c) => c.nom === nom)) toutesClasses.push({ nom })
  const i = p.id ? b.parcours.findIndex((pe) => pe.parcours.id === p.id) : -1
  const precedent = i === -1 ? undefined : b.parcours[i]
  const inchange = precedent && JSON.stringify(precedent.parcours) === JSON.stringify(p)
  const dejaExportee = Math.max(0, ...Object.values(precedent?.exportee ?? {}))
  const version = !precedent || inchange ? p.version : dejaExportee >= p.version ? dejaExportee + 1 : p.version
  const pe: ParcoursEnseignant = {
    parcours: { ...p, id: p.id || identifiant(p.titre), version },
    classes,
    exportee: precedent?.exportee ?? {},
  }
  const parcours = [...b.parcours]
  if (i === -1) parcours.push(pe)
  else parcours[i] = pe
  return { classes: toutesClasses, parcours }
}

export function definirLien(b: Bibliotheque, lien: string): Bibliotheque {
  return { ...b, lien: lien || undefined }
}

export function supprimer(b: Bibliotheque, id: string): Bibliotheque {
  return { ...b, parcours: b.parcours.filter((pe) => pe.parcours.id !== id) }
}

const pret = (pe: ParcoursEnseignant) => pe.parcours.etapes.length > 0 && pe.parcours.titre.trim() !== ''

export const nbAExporter = (b: Bibliotheque) =>
  b.parcours.filter((pe) => pret(pe) && pe.classes.some((c) => aExporter(pe, c))).length

/** Fichier à déposer dans le dossier partagé : toutes les classes, et bibliothèque marquée exportée */
export function exporter(b: Bibliotheque): { texte: string; bibliotheque: Bibliotheque } {
  const classes = b.classes
    .map((c) => ({ nom: c.nom, parcours: parcoursDeClasse(b, c.nom).filter(pret).map((pe) => pe.parcours) }))
    .filter((c) => c.parcours.length > 0)
  return {
    texte: creerFichier(classes),
    bibliotheque: {
      ...b,
      parcours: b.parcours.map((pe) =>
        pret(pe) ? { ...pe, exportee: Object.fromEntries(pe.classes.map((c) => [c, pe.parcours.version])) } : pe,
      ),
    },
  }
}

/** Retrouve les classes et parcours d'un fichier déjà exporté (nouvel appareil) */
export function ajouterClasses(b: Bibliotheque, f: FichierClasses): Bibliotheque {
  let resultat = b
  for (const c of f.classes) {
    const classes = resultat.classes.some((x) => x.nom === c.nom) ? resultat.classes : [...resultat.classes, { nom: c.nom }]
    const parcours = [...resultat.parcours]
    for (const p of c.parcours) {
      const i = parcours.findIndex((pe) => pe.parcours.id === p.id)
      if (i === -1) {
        parcours.push({ parcours: p, classes: [c.nom], exportee: { [c.nom]: p.version } })
        continue
      }
      const pe = parcours[i]
      parcours[i] = {
        parcours: pe.parcours.version < p.version ? p : pe.parcours,
        classes: pe.classes.includes(c.nom) ? pe.classes : [...pe.classes, c.nom],
        exportee: { ...pe.exportee, [c.nom]: p.version },
      }
    }
    resultat = { ...resultat, classes, parcours }
  }
  return resultat
}

export const importerFichier = (b: Bibliotheque, texte: string) => ajouterClasses(b, lireFichier(texte))

/**
 * Exercices d'un lien MathALÉA (https://coopmaths.fr/alea/?uuid=…&id=…&n=…&s=…),
 * dans l'ordre du lien, avec leurs paramètres.
 */
export function etapesDepuisLienMathalea(lien: string): Omit<Etape, 'titre'>[] {
  const url = new URL(lien)
  const etapes: Omit<Etape, 'titre'>[] = []
  for (const [cle, valeur] of url.searchParams) {
    if (cle === 'uuid') etapes.push({ uuid: valeur })
    const e = etapes.at(-1)
    if (!e) continue
    if (cle === 'id') e.id = valeur
    else if (cle === 'n' && Number(valeur) > 0) e.nbQuestions = Number(valeur)
    else if (cle === 's') e.sup = valeur
    else if (cle === 's2') e.sup2 = valeur
  }
  return etapes
}
