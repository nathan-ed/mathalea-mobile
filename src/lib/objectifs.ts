// Objectifs de l'enseignant (compétences) et étiquettes des exercices.
// La liste est rangée par niveau et chapitre ; un fichier au format
// objectifs-mathalea/1 (le sien, celui d'un collègue ou de Coopmaths) la complète.
import type { Etape, Parcours } from './catalogue'
import { couleurCeinture, nomPalier, paliersDe } from './catalogue'
import { bilan, type ResultatEtape, type Seance } from './progression'
import { estObjet, estTexte, listeDe, optionnel } from './validation'

export interface Objectif {
  libelle: string // sert d'identifiant : unique dans la liste
  code?: string // objectif du programme (référentiel MathALÉA, par exemple 5N2G)
  niveau: string
  theme: string
}

export const FORMAT_OBJECTIFS = 'objectifs-mathalea/1'

/**
 * Un exercice et ses réglages : des paramètres différents peuvent viser un
 * autre objectif, le nombre de questions non.
 */
export const cleExercice = (e: Pick<Etape, 'uuid' | 'sup' | 'sup2' | 'sup3' | 'sup4'>) =>
  [e.uuid, e.sup, e.sup2, e.sup3, e.sup4].map((x) => (x === undefined ? '' : String(x))).join('|')

/** Retient les objectifs posés sur chaque exercice (un exercice jamais étiqueté ne change rien) */
export function memoriser(etiquettes: Record<string, string[]>, etapes: Etape[]) {
  const r = { ...etiquettes }
  for (const e of etapes) {
    if (e.objectifs === undefined) continue
    const cle = cleExercice(e)
    if (e.objectifs.length) r[cle] = [...e.objectifs]
    else delete r[cle]
  }
  return r
}

/** Ajoute à la liste les libellés absents, rangés au niveau et au chapitre donnés */
export function completerListe(liste: Objectif[], libelles: string[], niveau: string, theme: string) {
  const r = [...liste]
  for (const l of libelles) {
    const libelle = l.trim()
    if (libelle && !r.some((o) => o.libelle === libelle)) r.push({ libelle, niveau, theme })
  }
  return r
}

/** Cellules d'une ligne CSV (guillemets doublés compris) */
function cellules(ligne: string, sep: string) {
  const r: string[] = []
  let cel = ''
  let entre = false
  for (let k = 0; k < ligne.length; k++) {
    const c = ligne[k]
    if (entre) {
      if (c === '"' && ligne[k + 1] === '"') (cel += '"'), k++
      else if (c === '"') entre = false
      else cel += c
    } else if (c === '"') entre = true
    else if (c === sep) r.push(cel.trim()), (cel = '')
    else cel += c
  }
  r.push(cel.trim())
  return r
}

const sansAccent = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/**
 * Objectifs d'un fichier objectifs-mathalea/1, d'un tableau CSV (colonnes code,
 * libellé, niveau, chapitre ; en-tête facultatif ; séparateur point-virgule,
 * tabulation ou virgule avec en-tête) ou d'un texte collé (un par ligne).
 * Niveau et chapitre absents : ceux donnés.
 */
export function lireObjectifs(texte: string, niveau: string, theme: string): Objectif[] {
  const t = texte.replace(/^\uFEFF/, '').trim()
  if (t.startsWith('{')) {
    let brut: unknown
    try {
      brut = JSON.parse(t)
    } catch {
      throw new Error('Ce fichier n’est pas une liste d’objectifs.')
    }
    const ok =
      estObjet(brut) &&
      brut.format === FORMAT_OBJECTIFS &&
      listeDe(
        brut.objectifs,
        (o) => estObjet(o) && estTexte(o.libelle) && optionnel(o.code, estTexte) && optionnel(o.niveau, estTexte) && optionnel(o.theme, estTexte),
      )
    if (!ok) throw new Error('Ce fichier n’est pas une liste d’objectifs.')
    return (brut as { objectifs: Partial<Objectif>[] }).objectifs.map((o) => ({
      libelle: o.libelle!.trim(),
      ...(o.code ? { code: o.code } : {}),
      niveau: o.niveau ?? niveau,
      theme: o.theme ?? theme,
    }))
  }
  const lignes = t.split(/\r?\n/).filter((l) => l.trim())
  if (!lignes.length) return []
  const premiere = sansAccent(lignes[0])
  const entete = /libelle|objectif/.test(premiere) && /code|niveau|chapitre|theme/.test(premiere)
  const sep = lignes[0].includes(';') ? ';' : lignes[0].includes('\t') ? '\t' : entete && lignes[0].includes(',') ? ',' : ''
  if (!sep) {
    // Texte collé : un objectif par ligne, puces retirées
    return lignes.map((l) => l.replace(/^\s*[-•*]\s*/, '').trim()).map((libelle) => ({ libelle, niveau, theme }))
  }
  // Colonnes : d'après l'en-tête, sinon code ; libellé ; niveau ; chapitre (une seule colonne : libellé)
  let col = { code: 0, libelle: 1, niveau: 2, theme: 3 }
  let donnees = lignes
  if (entete) {
    const noms = cellules(premiere, sep)
    const trouver = (re: RegExp) => noms.findIndex((n) => re.test(n))
    col = { code: trouver(/^code/), libelle: trouver(/libelle|objectif/), niveau: trouver(/niveau|classe/), theme: trouver(/chapitre|theme/) }
    donnees = lignes.slice(1)
  }
  return donnees.flatMap((l) => {
    const c = cellules(l, sep)
    const lire = (i: number) => (i >= 0 ? (c[i] ?? '').trim() : '')
    const unique = c.length === 1
    const libelle = unique ? c[0] : lire(col.libelle)
    if (!libelle) return []
    const code = unique ? '' : lire(col.code)
    return [{ libelle, ...(code ? { code } : {}), niveau: lire(col.niveau) || niveau, theme: lire(col.theme) || theme }]
  })
}

/** Liste au format CSV (point-virgule, comme les tableurs français) */
export function objectifsEnCsv(liste: Objectif[]) {
  const cel = (t: string) => (/[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t)
  return ['code;libellé;niveau;chapitre', ...liste.map((o) => [o.code ?? '', o.libelle, o.niveau, o.theme].map(cel).join(';'))].join('\n') + '\n'
}

export function fusionnerObjectifs(liste: Objectif[], ajouts: Objectif[]) {
  const r = [...liste]
  for (const o of ajouts) if (o.libelle && !r.some((x) => x.libelle === o.libelle)) r.push(o)
  return r
}


/** Remplace un libellé partout (liste, mémoire des exercices) */
export function renommerObjectif(liste: Objectif[], etiquettes: Record<string, string[]>, avant: string, apres: string) {
  const n = apres.trim()
  if (!n || n === avant || liste.some((o) => o.libelle === n)) return { liste, etiquettes }
  return {
    liste: liste.map((o) => (o.libelle === avant ? { ...o, libelle: n } : o)),
    etiquettes: Object.fromEntries(Object.entries(etiquettes).map(([k, v]) => [k, v.map((l) => (l === avant ? n : l))])),
  }
}

/** Réussite par objectif d'après le dernier résultat de chaque exercice */
export function resultatsParObjectif(p: Parcours, resultats: Record<number, ResultatEtape>) {
  const parObjectif = new Map<string, { points: number; sur: number; exercices: number; faits: number }>()
  p.etapes.forEach((e, i) => {
    for (const o of e.objectifs ?? []) {
      const x = parObjectif.get(o) ?? { points: 0, sur: 0, exercices: 0, faits: 0 }
      x.exercices++
      const r = resultats[i]
      if (r) {
        x.points += r.points
        x.sur += r.sur
        x.faits++
      }
      parObjectif.set(o, x)
    }
  })
  return [...parObjectif].map(([libelle, x]) => ({
    libelle,
    ...x,
    pourcentage: x.sur > 0 ? Math.round((100 * x.points) / x.sur) : null,
  }))
}

// ---------- Paliers vus par l'élève ----------

/** Réussite attendue par défaut quand le palier suivant ne fixe pas de seuil */
export const SEUIL_PAR_DEFAUT = 80

/**
 * Paliers d'après les derniers résultats. Un palier « seuil » s'ouvre quand le
 * précédent est terminé avec au moins le seuil ; un palier terminé sous la
 * réussite attendue (seuil du suivant, sinon 80 %) est « à revoir ».
 */
export function etatsPaliers(p: Parcours, resultats: Record<number, ResultatEtape>) {
  const paliers = paliersDe(p)
  const bilans = paliers.map((x) => {
    const rs = x.etapes.map((i) => resultats[i])
    const points = rs.reduce((a, r) => a + (r?.points ?? 0), 0)
    const sur = rs.reduce((a, r) => a + (r?.sur ?? 0), 0)
    return {
      fini: rs.length > 0 && rs.every((r) => r?.complet),
      faits: rs.filter((r) => r).length,
      pourcentage: sur > 0 ? Math.round((100 * points) / sur) : 0,
    }
  })
  const ouverts: boolean[] = []
  paliers.forEach((x, k) => {
    if (k === 0 || x.acces !== 'seuil') return ouverts.push(true)
    ouverts.push(ouverts[k - 1] && bilans[k - 1].fini && bilans[k - 1].pourcentage >= x.seuil)
  })
  return paliers.map((x, k) => {
    const suivant = paliers[k + 1]
    const attendu = suivant?.acces === 'seuil' ? suivant.seuil : SEUIL_PAR_DEFAUT
    return { ...x, ...bilans[k], ouvert: ouverts[k], attendu, aRevoir: bilans[k].fini && bilans[k].pourcentage < attendu }
  })
}

// ---------- Suivi de l'élève ----------

/** Niveaux de maîtrise du livret scolaire, d'après la meilleure réussite */
export const MAITRISES = ['Insuffisante', 'Fragile', 'Satisfaisante', 'Très bonne maîtrise'] as const
export const maitrise = (pourcentage: number) => (pourcentage >= 90 ? 3 : pourcentage >= 70 ? 2 : pourcentage >= 40 ? 1 : 0)

export interface ObjectifTravaille {
  libelle: string
  niveau: string
  theme: string
  meilleur: number // meilleure réussite, en %, sur un passage terminé
  dernier: string // date du dernier passage où il a été travaillé
  parcours: string // titre du parcours de ce dernier passage
  passages: number
}

/**
 * Objectifs travaillés dans tous les passages terminés (copies figées des
 * parcours) : meilleure réussite et dernière fois travaillé.
 */
export function objectifsTravailles(passages: Seance[]): ObjectifTravaille[] {
  const parObjectif = new Map<string, ObjectifTravaille>()
  for (const s of passages) {
    if (!s.fin) continue
    for (const e of bilan(s).parEtape) {
      if (!e.faites || !e.sur) continue
      const pourcentage = Math.round((100 * e.points) / e.sur)
      for (const libelle of s.contenu.etapes[e.etape]?.objectifs ?? []) {
        const avant = parObjectif.get(libelle)
        const plusRecent = !avant || s.fin >= avant.dernier
        parObjectif.set(libelle, {
          libelle,
          niveau: plusRecent ? s.contenu.niveau : avant!.niveau,
          theme: plusRecent ? s.contenu.theme : avant!.theme,
          meilleur: Math.max(avant?.meilleur ?? 0, pourcentage),
          dernier: plusRecent ? s.fin : avant!.dernier,
          parcours: plusRecent ? s.contenu.titre : avant!.parcours,
          passages: (avant?.passages ?? 0) + 1,
        })
      }
    }
  }
  return [...parObjectif.values()]
}

/**
 * Ceintures d'un parcours d'après les passages terminés : une ceinture est
 * obtenue quand son palier a été terminé au moins une fois avec la réussite
 * attendue (seuil de la suivante, sinon 80 %).
 */
export function ceinturesObtenues(p: Parcours, passages: Seance[]) {
  const paliers = paliersDe(p)
  return paliers.map((x, k) => {
    const suivant = paliers[k + 1]
    const attendu = suivant?.acces === 'seuil' ? suivant.seuil : SEUIL_PAR_DEFAUT
    const meilleur = Math.max(
      0,
      ...passages
        .filter((s) => s.fin && s.contenu.id === p.id && s.etapes.join() === x.etapes.join())
        .map((s) => bilan(s))
        .filter((b) => b.faites === b.sur)
        .map((b) => b.pourcentage),
    )
    return { nom: nomPalier(p, k), couleur: couleurCeinture(p, k), obtenue: meilleur >= attendu, meilleur }
  })
}
