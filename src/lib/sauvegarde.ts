// Sauvegarde personnelle : réglages, liens, bibliothèque de l'enseignant et
// suivi complet, dans un fichier versionné. Aucun identifiant n'y figure :
// l'app n'en stocke aucun. Une restauration invalide laisse tout intact.
import type { Seance } from './progression'
import type { Stockage } from './stockage'
import {
  classesDuFichier,
  dictionnaireDe,
  estEntier,
  estNombre,
  estObjet,
  estParcours,
  estTexte,
  listeDe,
  optionnel,
  parcoursUniques,
  sansDoublon,
  textesUniques,
} from './validation'

const FORMAT = 'sauvegarde-mathalea/1'

interface Sauvegarde {
  format: typeof FORMAT
  creeeLe: string
  donnees: Record<string, unknown>
}

export async function exporterSauvegarde(st: Stockage): Promise<string> {
  const donnees: Record<string, unknown> = {}
  for (const cle of await st.cles()) donnees[cle] = await st.lire(cle)
  const s: Sauvegarde = { format: FORMAT, creeeLe: new Date().toISOString(), donnees }
  return JSON.stringify(s)
}

// Contrôle complet de chaque valeur avant toute écriture : une sauvegarde mal
// formée effacerait les données et laisserait l'app sans écran.
const estEssai = (v: unknown) => {
  const e = v as Seance['essais'][number]
  return (
    estObjet(e) &&
    estEntier(e.etape) &&
    estEntier(e.question) &&
    typeof e.juste === 'boolean' &&
    estNombre(e.points) &&
    estNombre(e.total) &&
    dictionnaireDe(e.reponses, estTexte) &&
    estTexte(e.le)
  )
}

/** Séance d'un parcours (identifiant attendu : celui de la clé de stockage) */
const estSeance = (id: string) => (v: unknown) => {
  const s = v as Seance
  if (!estObjet(s) || !estParcours(s.contenu) || s.parcours !== id || s.contenu.id !== id) return false
  const n = s.contenu.etapes.length
  const etapeValide = (e: unknown) => estEntier(e) && e >= 0 && e < n
  return (
    (s.type === 'complet' || s.type === 'ciblee') &&
    listeDe(s.etapes, etapeValide) &&
    sansDoublon(s.etapes) &&
    estTexte(s.moteur) &&
    estEntier(s.position) &&
    s.position >= 0 &&
    estTexte(s.debut) &&
    optionnel(s.fin, estTexte) &&
    optionnel(s.soumise, (b) => typeof b === 'boolean') &&
    optionnel(s.code, estTexte) &&
    dictionnaireDe(s.graines, estTexte) &&
    dictionnaireDe(s.nbQuestions, (q) => estEntier(q) && q >= 0) &&
    dictionnaireDe(s.brouillons, (b) => dictionnaireDe(b, estTexte)) &&
    listeDe(s.essais, (e) => estEssai(e) && etapeValide((e as Seance['essais'][number]).etape))
  )
}

const estDossier = (v: unknown) =>
  estObjet(v) &&
  estTexte(v.lien) &&
  optionnel(v.nom, estTexte) &&
  optionnel(v.disponibles, textesUniques) &&
  optionnel(v.parcours, parcoursUniques) &&
  optionnel(v.fichier, classesDuFichier) &&
  optionnel(v.maj, estTexte) &&
  optionnel(v.erreur, estTexte)

const estBibliotheque = (v: unknown) =>
  estObjet(v) &&
  optionnel(v.lien, estTexte) &&
  listeDe(v.classes, (c) => estObjet(c) && estTexte(c.nom)) &&
  sansDoublon((v.classes as { nom: string }[]).map((c) => c.nom)) &&
  listeDe(v.parcours, (pe) => estObjet(pe) && estParcours(pe.parcours) && textesUniques(pe.classes) && dictionnaireDe(pe.exportee, estNombre)) &&
  sansDoublon((v.parcours as { parcours: { id: string } }[]).map((pe) => pe.parcours.id))

const valeurs: Record<string, (v: unknown) => boolean> = {
  profil: (v) => v === 'eleve' || v === 'enseignant',
  pays: (v) => v === 'FR' || v === 'CH',
  classes: (v) => listeDe(v, estDossier) && sansDoublon((v as { lien: string }[]).map((c) => c.lien)),
  bibliotheque: estBibliotheque,
  epingles: textesUniques,
  chapitres: (v) => dictionnaireDe(v, (o) => estObjet(o) && textesUniques(o.ordre) && textesUniques(o.fermes)),
  explorer: parcoursUniques,
  ajoutes: parcoursUniques,
  importes: parcoursUniques,
  'importes-classes': (v) => dictionnaireDe(v, textesUniques),
}
// Clés par parcours : le suffixe est l'identifiant (resultats : identifiant@version)
const prefixes: Record<string, (v: unknown, suffixe: string) => boolean> = {
  'seance:': (v, id) => estSeance(id)(v),
  'historique:': (v, id) => listeDe(v, estSeance(id)) && sansDoublon((v as Seance[]).map((s) => s.debut)),
  'resultats:': (v) =>
    dictionnaireDe(v, (r) => estObjet(r) && estNombre(r.points) && estNombre(r.sur) && typeof r.complet === 'boolean' && estTexte(r.le)) &&
    Object.keys(v as object).every((k) => /^\d+$/.test(k)),
  'complet:': estNombre,
}

/** Première clé dont la valeur n'a pas la forme attendue (ou inconnue), sinon undefined */
export function cleInvalide(donnees: Record<string, unknown>): string | undefined {
  for (const [cle, valeur] of Object.entries(donnees)) {
    if (valeur === null) continue
    const prefixe = Object.keys(prefixes).find((p) => cle.startsWith(p))
    const valide = valeurs[cle] ? valeurs[cle](valeur) : prefixe ? prefixes[prefixe](valeur, cle.slice(prefixe.length)) : false
    if (!valide) return cle
  }
  return undefined
}

export function lireSauvegarde(texte: string): Sauvegarde {
  let s: Sauvegarde
  try {
    s = JSON.parse(texte)
  } catch {
    throw new Error('Ce fichier n’est pas une sauvegarde MathALÉA.')
  }
  if (s?.format !== FORMAT || !estObjet(s.donnees)) {
    throw new Error('Ce fichier n’est pas une sauvegarde MathALÉA.')
  }
  const cle = cleInvalide(s.donnees)
  if (cle !== undefined) throw new Error(`Sauvegarde endommagée (${cle}) : rien n’a changé.`)
  return s
}

/** Remplace toutes les données par celles de la sauvegarde ; en cas d'échec, remet l'état d'avant */
export async function restaurerSauvegarde(st: Stockage, texte: string) {
  const s = lireSauvegarde(texte)
  const avant: Record<string, unknown> = {}
  for (const cle of await st.cles()) avant[cle] = await st.lire(cle)
  try {
    for (const cle of Object.keys(avant)) await st.effacer(cle)
    for (const [cle, valeur] of Object.entries(s.donnees)) await st.ecrire(cle, valeur)
  } catch (e) {
    for (const cle of await st.cles()) await st.effacer(cle)
    for (const [cle, valeur] of Object.entries(avant)) await st.ecrire(cle, valeur)
    throw new Error(`Restauration impossible, rien n’a changé (${(e as Error).message}).`)
  }
}
