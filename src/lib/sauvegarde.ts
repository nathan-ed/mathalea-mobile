// Sauvegarde personnelle : réglages, liens, bibliothèque de l'enseignant et
// suivi complet, dans un fichier versionné. Aucun identifiant n'y figure :
// l'app n'en stocke aucun. Une restauration invalide laisse tout intact.
import type { Seance } from './progression'
import { CLE_IA } from './analyse'
import { estReleves } from './releve'
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

/** État avant la dernière restauration, pour l'annuler (jamais exporté) */
export const CLE_AVANT_RESTAURATION = 'avant-restauration'
/** Propres à cet appareil : ni exportées, ni effacées par une restauration (clé d'API de l'enseignant) */
const CLES_DE_L_APPAREIL = [CLE_IA]

export async function exporterSauvegarde(st: Stockage): Promise<string> {
  const donnees: Record<string, unknown> = {}
  for (const cle of await st.cles()) if (cle !== CLE_AVANT_RESTAURATION && !CLES_DE_L_APPAREIL.includes(cle)) donnees[cle] = await st.lire(cle)
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
    optionnel(s.ordre, textesUniques) &&
    optionnel(s.papier, (x) => dictionnaireDe(x, (vue) => typeof vue === 'boolean')) &&
    optionnel(s.empreintes, (x) => dictionnaireDe(x, estTexte)) &&
    optionnel(s.qrMontre, (b) => typeof b === 'boolean') &&
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
  optionnel(v.publieLe, estTexte) &&
  optionnel(v.verifieLe, estTexte) &&
  optionnel(v.empreinte, estTexte) &&
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
  [CLE_AVANT_RESTAURATION]: estTexte,
  objectifs: (v) =>
    listeDe(v, (o) => estObjet(o) && estTexte(o.libelle) && estTexte(o.niveau) && estTexte(o.theme)) &&
    sansDoublon((v as { libelle: string }[]).map((o) => o.libelle)),
  etiquettes: (v) => dictionnaireDe(v, textesUniques),
  releves: estReleves,
  prenom: estTexte,
  'test-niveau': (v) =>
    dictionnaireDe(
      v,
      (e) =>
        estObjet(e) &&
        optionnel(e.tirage, (p) => estParcours(p) && (p as { id: string }).id.startsWith('test-niveau-')) &&
        optionnel(e.reperage, (b) => typeof b === 'boolean') &&
        optionnel(e.valideLe, estTexte),
    ),
  'preferences-creation': (v) =>
    estObjet(v) &&
    estTexte(v.niveau) &&
    [1, 2, 3].includes(v.difficulte as number) &&
    ['une_question_par_page', 'un_exo_par_page', 'liste_exos'].includes(v.presentation as string) &&
    ['question', 'page', 'parcours'].includes(v.correction as string) &&
    optionnel(v.enTetesMasques, (b) => typeof b === 'boolean') &&
    optionnel(v.melanger, (b) => typeof b === 'boolean'),
}
// Clés par parcours : le suffixe est l'identifiant (resultats : identifiant@version)
const prefixes: Record<string, (v: unknown, suffixe: string) => boolean> = {
  'seance:': (v, id) => estSeance(id)(v),
  'historique:': (v, id) => listeDe(v, estSeance(id)) && sansDoublon((v as Seance[]).map((s) => s.debut)),
  'resultats:': (v) =>
    dictionnaireDe(v, (r) => estObjet(r) && estNombre(r.points) && estNombre(r.sur) && typeof r.complet === 'boolean' && estTexte(r.le) && optionnel(r.version, estEntier)) &&
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

/** Ce que contient une sauvegarde, montré avant de remplacer quoi que ce soit */
export function resumerSauvegarde(texte: string) {
  const s = lireSauvegarde(texte)
  const d = s.donnees
  const cles = Object.keys(d)
  const bibliotheque = d.bibliotheque as { parcours?: unknown[] } | undefined
  return {
    creeeLe: s.creeeLe,
    dossiers: Array.isArray(d.classes) ? d.classes.length : 0,
    parcoursEnseignant: bibliotheque?.parcours?.length ?? 0,
    passages: cles.filter((c) => c.startsWith('historique:')).reduce((a, c) => a + ((d[c] as unknown[] | null)?.length ?? 0), 0),
    enseignant: d.profil === 'enseignant',
  }
}

/**
 * Remplace toutes les données par celles de la sauvegarde ; en cas d'échec,
 * remet l'état d'avant. L'état remplacé est gardé pour annuler la restauration.
 */
export async function restaurerSauvegarde(st: Stockage, texte: string) {
  const s = lireSauvegarde(texte)
  const avant: Record<string, unknown> = {}
  for (const cle of await st.cles()) avant[cle] = await st.lire(cle)
  const copie = await exporterSauvegarde(st)
  try {
    for (const cle of Object.keys(avant)) if (!CLES_DE_L_APPAREIL.includes(cle)) await st.effacer(cle)
    for (const [cle, valeur] of Object.entries(s.donnees)) if (!CLES_DE_L_APPAREIL.includes(cle)) await st.ecrire(cle, valeur)
    await st.ecrire(CLE_AVANT_RESTAURATION, copie)
  } catch (e) {
    for (const cle of await st.cles()) await st.effacer(cle)
    for (const [cle, valeur] of Object.entries(avant)) await st.ecrire(cle, valeur)
    throw new Error(`Restauration impossible, rien n’a changé (${(e as Error).message}).`)
  }
}
