// Parcours de l'enseignant, enregistrés sur l'appareil ; un parcours peut aller à plusieurs classes.
// Un dossier partagé reçoit les publications datées de toutes les classes.
// Une modification après un export ouvre la version suivante : les élèves
// gardent l'ancienne pour leurs séances commencées.
import type { Etape, Parcours } from './catalogue'
import { creerFichier, nomHorodate, type FichierClasses } from './partage'
import type { Objectif } from './objectifs'
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
  publieLe?: string // date du dernier fichier publié (à déposer dans le dossier)
  verifieLe?: string // date où ce fichier a été trouvé dans le dossier partagé
  empreinte?: string // contenu du dernier fichier complet exporté (voir aJour)
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

/** Derniers choix de l'enseignant : ils préremplissent le parcours suivant */
export interface Preferences {
  niveau: string
  difficulte: 1 | 2 | 3
  presentation: Parcours['presentation']
  correction: Parcours['correction']
  enTetesMasques?: boolean
  melanger?: boolean
}

export const preferencesDe = (p: Parcours): Preferences => ({
  niveau: p.niveau,
  difficulte: p.difficulte,
  presentation: p.presentation,
  correction: p.correction,
  enTetesMasques: !!p.enTetesMasques,
  melanger: !!p.melanger,
})

export function parcoursVide(pref: Partial<Preferences> = {}): Parcours {
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
    // Nouveaux parcours : questions enchaînées, sans en-tête, ordre mélangé
    enTetesMasques: true,
    melanger: true,
    etapes: [],
    ...pref,
  }
}

/**
 * Rend un parcours existant (test, collectif…) éditable : il garde son
 * identifiant et sa version, et toute modification ouvre la version suivante,
 * pour que les élèves qui l'ont déjà la reçoivent.
 */
export function adopter(b: Bibliotheque, p: Parcours, classes: string[] = []): Bibliotheque {
  const connues = [...b.classes]
  for (const nom of classes) if (!connues.some((c) => c.nom === nom)) connues.push({ nom })
  const i = b.parcours.findIndex((pe) => pe.parcours.id === p.id)
  // Même identifiant : jamais de doublon. Version plus récente dans le dossier : elle remplace la copie locale
  if (i !== -1) {
    const pe = b.parcours[i]
    if (pe.parcours.version >= p.version) return b
    const parcours = [...b.parcours]
    const toutes = [...new Set([...pe.classes, ...classes])]
    parcours[i] = { parcours: JSON.parse(JSON.stringify(p)), classes: toutes, exportee: Object.fromEntries(toutes.map((c) => [c, p.version])) }
    return { ...b, classes: connues, parcours }
  }
  const original: Parcours = JSON.parse(JSON.stringify(p))
  // Déjà exporté dans ces classes à cette version : une modification ouvre la suivante
  const exportee = Object.fromEntries([['', original.version], ...classes.map((c) => [c, original.version])])
  return { ...b, classes: connues, parcours: [...b.parcours, { parcours: original, classes: [...classes], exportee }] }
}

export const parcoursDeClasse = (b: Bibliotheque, classe: string) => b.parcours.filter((pe) => pe.classes.includes(classe))

export const aExporter = (pe: ParcoursEnseignant, classe: string) => pe.exportee[classe] !== pe.parcours.version

/** Chapitre utilisé à un niveau (parcours de l'enseignant ou d'un dossier partagé) */
export interface ChapitreConnu {
  niveau: string
  theme: string
}

export const chapitresDeBibliotheque = (b: Bibliotheque): ChapitreConnu[] =>
  b.parcours.map((pe) => ({ niveau: pe.parcours.niveau, theme: pe.parcours.theme }))

/** Chapitres du niveau choisi d'abord, puis tous les autres chapitres connus */
export function chapitres(connus: ChapitreConnu[], niveau: string) {
  const themes = (l: ChapitreConnu[]) => [...new Set(l.map((c) => c.theme.trim()).filter(Boolean))]
  const duNiveau = themes(connus.filter((c) => c.niveau === niveau))
  return { duNiveau, autres: themes(connus).filter((t) => !duNiveau.includes(t)) }
}

/** Classes qui reçoivent un parcours (l'ordre des classes déjà servies ne change pas) */
export function attribuer(b: Bibliotheque, id: string, classes: string[]): Bibliotheque {
  const connues = [...b.classes]
  for (const nom of classes) if (!connues.some((c) => c.nom === nom)) connues.push({ nom })
  return { ...b, classes: connues, parcours: b.parcours.map((pe) => (pe.parcours.id === id ? { ...pe, classes: [...classes] } : pe)) }
}

/** Parcours d'une classe, choisis dans la bibliothèque ; ceux déjà présents gardent leur rang */
export function parcoursPourClasse(b: Bibliotheque, classe: string, ids: string[]): Bibliotheque {
  const classes = b.classes.some((c) => c.nom === classe) ? b.classes : [...b.classes, { nom: classe }]
  const parcours = b.parcours.map((pe) => {
    const voulu = ids.includes(pe.parcours.id)
    const present = pe.classes.includes(classe)
    if (voulu === present) return pe
    return { ...pe, classes: voulu ? [...pe.classes, classe] : pe.classes.filter((c) => c !== classe) }
  })
  return { ...b, classes, parcours }
}

export function ajouterClasse(b: Bibliotheque, nom: string): Bibliotheque {
  const n = nom.trim()
  return !n || b.classes.some((c) => c.nom === n) ? b : { ...b, classes: [...b.classes, { nom: n }] }
}

export function renommerClasse(b: Bibliotheque, avant: string, apres: string): Bibliotheque {
  const n = apres.trim()
  if (!n || n === avant || b.classes.some((c) => c.nom === n)) return b
  const remplacer = <T>(r: Record<string, T>) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k === avant ? n : k, v]))
  return {
    ...b,
    classes: b.classes.map((c) => (c.nom === avant ? { nom: n } : c)),
    parcours: b.parcours.map((pe) => ({ ...pe, classes: pe.classes.map((c) => (c === avant ? n : c)), exportee: remplacer(pe.exportee) })),
  }
}

/** Retire la classe et ses attributions ; les parcours restent dans la bibliothèque */
export function retirerClasse(b: Bibliotheque, nom: string): Bibliotheque {
  return {
    ...b,
    classes: b.classes.filter((c) => c.nom !== nom),
    parcours: b.parcours.map((pe) => ({ ...pe, classes: pe.classes.filter((c) => c !== nom) })),
  }
}

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
  return { ...b, classes: toutesClasses, parcours }
}

/**
 * Déplace un parcours d'un rang dans une classe (ordre vu par les élèves) :
 * il échange sa place avec le parcours voisin de la même classe.
 */
export function deplacer(b: Bibliotheque, id: string, classe: string, sens: -1 | 1): Bibliotheque {
  const rangs = b.parcours.flatMap((pe, i) => (pe.classes.includes(classe) ? [i] : []))
  const k = rangs.findIndex((i) => b.parcours[i].parcours.id === id)
  const voisin = rangs[k + sens]
  if (k === -1 || voisin === undefined) return b
  const parcours = [...b.parcours]
  ;[parcours[rangs[k]], parcours[voisin]] = [parcours[voisin], parcours[rangs[k]]]
  return { ...b, parcours }
}

/** Copie d'un parcours à enregistrer comme nouveau parcours (nouvel identifiant, V1) */
export const copie = (p: Parcours): Parcours => ({ ...JSON.parse(JSON.stringify(p)), id: '', version: 1, titre: `${p.titre} (copie)` })

export function definirLien(b: Bibliotheque, lien: string): Bibliotheque {
  return { ...b, lien: lien || undefined }
}

export function supprimer(b: Bibliotheque, id: string): Bibliotheque {
  return { ...b, parcours: b.parcours.filter((pe) => pe.parcours.id !== id) }
}

const pret = (pe: ParcoursEnseignant) => pe.parcours.etapes.length > 0 && pe.parcours.titre.trim() !== ''

export const nbAExporter = (b: Bibliotheque) =>
  b.parcours.filter((pe) => pret(pe) && pe.classes.some((c) => aExporter(pe, c))).length

/** Empreinte de ce que porte le fichier complet : classes, parcours et attributions, objectifs */
export function empreinte(b: Bibliotheque, objectifs: Objectif[] = []) {
  const texte = JSON.stringify([b.classes.map((c) => c.nom), b.parcours.map((pe) => [pe.parcours, pe.classes]), objectifs])
  let h = 0x811c9dc5
  for (let i = 0; i < texte.length; i++) h = Math.imul(h ^ texte.charCodeAt(i), 0x01000193)
  return `${texte.length}-${(h >>> 0).toString(16)}`
}

/** Le dernier fichier complet exporté contient-il tout ce qui est dans l'app ? */
export const aJour = (b: Bibliotheque, objectifs: Objectif[] = []) =>
  !b.parcours.length || b.empreinte === empreinte(b, objectifs)

/**
 * Bibliothèque d'une version précédente, sans empreinte : déjà exportée et sans
 * parcours en attente, elle est prise pour celle du drive (pas de fausse alerte
 * à la mise à jour de l'app).
 */
export function completerEmpreinte(b: Bibliotheque, objectifs: Objectif[] = []): Bibliotheque {
  if (b.empreinte !== undefined || !b.parcours.length || !b.publieLe || nbAExporter(b)) return b
  return { ...b, empreinte: empreinte(b, objectifs) }
}

/** Changement qui ne concerne pas le drive (démonstration) : une bibliothèque à jour le reste */
export const sansEcartDrive = (avant: Bibliotheque, objectifsAvant: Objectif[], apres: Bibliotheque, objectifsApres: Objectif[]): Bibliotheque =>
  aJour(avant, objectifsAvant) ? { ...apres, empreinte: empreinte(apres, objectifsApres) } : apres

/**
 * Fichier complet, celui qu'on dépose dans le dossier partagé : les classes
 * (ce que lisent les élèves) et toute la bibliothèque (parcours sans classe,
 * objectifs), que l'enseignant reprend sur un autre appareil ou sur le site.
 * La bibliothèque est marquée exportée.
 */
export function exporter(b: Bibliotheque, objectifs: Objectif[] = []): { texte: string; bibliotheque: Bibliotheque } {
  const classes = b.classes
    .map((c) => ({ nom: c.nom, parcours: parcoursDeClasse(b, c.nom).filter(pret).map((pe) => pe.parcours) }))
    .filter((c) => c.parcours.length > 0)
  const texte = creerFichier(classes, true, { parcours: b.parcours.map((pe) => pe.parcours), ...(objectifs.length ? { objectifs } : {}) })
  return {
    texte,
    bibliotheque: {
      ...b,
      // Le fichier est prêt : rien ne dit encore qu'il est dans le dossier partagé
      publieLe: (JSON.parse(texte) as FichierClasses).exporteLe,
      verifieLe: undefined,
      empreinte: empreinte(b, objectifs),
      parcours: b.parcours.map((pe) =>
        pret(pe) ? { ...pe, exportee: Object.fromEntries(pe.classes.map((c) => [c, pe.parcours.version])) } : pe,
      ),
    },
  }
}

/** Classe du fichier d'un parcours seul qui n'est donné à aucune classe */
export const CLASSE_SANS_NOM = 'Parcours'

const nomDeFichier = (titre: string) =>
  titre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * Quelques parcours choisis, pour un collègue ou à déposer à côté du fichier
 * complet dans le dossier partagé (ils s'y ajoutent). Leur version est marquée
 * diffusée (clé '') : la modification suivante ouvre une nouvelle version,
 * sinon les élèves garderaient l'ancienne.
 */
export function exporterChoix(b: Bibliotheque, ids: string[]): { nom: string; texte: string; bibliotheque: Bibliotheque } | null {
  const choisis = b.parcours.filter((pe) => ids.includes(pe.parcours.id))
  if (!choisis.length) return null
  const noms = [...new Set(choisis.flatMap((pe) => (pe.classes.length ? pe.classes : [CLASSE_SANS_NOM])))]
  const classes = noms.map((nom) => ({
    nom,
    parcours: choisis.filter((pe) => (pe.classes.length ? pe.classes.includes(nom) : nom === CLASSE_SANS_NOM)).map((pe) => pe.parcours),
  }))
  const seul = choisis.length === 1 ? choisis[0].parcours : null
  return {
    nom: nomHorodate(seul ? `parcours-${nomDeFichier(seul.titre) || seul.id}` : `parcours-choisis-${choisis.length}`),
    texte: creerFichier(classes),
    bibliotheque: {
      ...b,
      parcours: b.parcours.map((pe) => (choisis.includes(pe) ? { ...pe, exportee: { ...pe.exportee, '': pe.parcours.version } } : pe)),
    },
  }
}

/** Un parcours seul */
export const exporterUn = (b: Bibliotheque, id: string) => exporterChoix(b, [id])

/**
 * Reprend la bibliothèque d'un fichier publié (autre appareil, page du site) :
 * classes, attributions et ordre, parcours sans classe. Un parcours plus récent
 * dans le fichier remplace la copie locale ; un parcours local plus récent est
 * gardé. Rien n'est supprimé.
 */
export function reprendre(b: Bibliotheque, f: FichierClasses): Bibliotheque {
  const classes = [...b.classes]
  for (const c of f.classes) if (!classes.some((x) => x.nom === c.nom)) classes.push({ nom: c.nom })
  const parcours = [...b.parcours]
  const prendre = (p: Parcours) => {
    const i = parcours.findIndex((pe) => pe.parcours.id === p.id)
    if (i === -1) parcours.push({ parcours: p, classes: [], exportee: { '': p.version } })
    else if (parcours[i].parcours.version < p.version) parcours[i] = { ...parcours[i], parcours: p }
  }
  for (const c of f.classes) for (const p of c.parcours) prendre(p)
  for (const p of f.bibliotheque?.parcours ?? []) prendre(p)
  // Attributions du fichier, dans l'ordre de chaque classe
  for (const c of f.classes) {
    for (const p of c.parcours) {
      const i = parcours.findIndex((pe) => pe.parcours.id === p.id)
      const pe = parcours[i]
      parcours[i] = {
        ...pe,
        classes: pe.classes.includes(c.nom) ? pe.classes : [...pe.classes, c.nom],
        exportee: { ...pe.exportee, [c.nom]: Math.max(pe.exportee[c.nom] ?? 0, p.version) },
      }
    }
  }
  return { ...b, classes, parcours }
}

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
    else if (cle === 's3') e.sup3 = valeur
    else if (cle === 's4') e.sup4 = valeur
  }
  return etapes
}

/**
 * Le dossier partagé contient-il la dernière publication ? (sa date, ou une
 * plus récente, d'un autre appareil). L'app ne sait pas si chaque élève l'a reçue.
 */
export const publicationPresente = (b: Bibliotheque, dossier: FichierClasses) => !!b.publieLe && dossier.exporteLe >= b.publieLe
