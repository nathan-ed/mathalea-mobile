// Objectifs (compétences) posés sur les exercices des parcours, paliers et
// ceintures : réussite par objectif, paliers ouverts, ceintures obtenues.
import type { Etape, Parcours } from './catalogue'
import { couleurCeinture, couleurDuRang, momentOuverture, nomCeinture, nomPalier, paliersDe, rangCeinture } from './catalogue'
import { cleChapitre } from './explorer'
import { bilan, type ResultatEtape, type Seance } from './progression'

export interface Objectif {
  libelle: string // sert d'identifiant : unique dans la liste
  code?: string // objectif du programme (référentiel MathALÉA, par exemple 5N2G)
  niveau: string
  theme: string
}

/**
 * Un exercice et ses réglages : des paramètres différents peuvent viser un
 * autre objectif, le nombre de questions non.
 */
export const cleExercice = (e: Pick<Etape, 'uuid' | 'sup' | 'sup2' | 'sup3' | 'sup4'>) =>
  [e.uuid, e.sup, e.sup2, e.sup3, e.sup4].map((x) => (x === undefined ? '' : String(x))).join('|')

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
 * réussite attendue (seuil du suivant, sinon 80 %) est « à revoir ». Un
 * palier avec une date d'ouverture reste fermé avant cet instant, quel que
 * soit son accès (`avantOuverture`). `maintenant` : heure des serveurs
 * (heure.svelte.ts) ; inconnue (hors ligne), le palier reste fermé et
 * `heureAVerifier` dit que la date est peut-être passée (`appareil`).
 * `acquis` : ceintures déjà obtenues (`ceinturesObtenues`) ; un exercice ajouté
 * à un palier réussi ne referme pas le suivant.
 */
export function etatsPaliers(p: Parcours, resultats: Record<number, ResultatEtape>, maintenant: number | null, appareil = Date.now(), acquis: boolean[] = []) {
  const paliers = paliersDe(p)
  const bilans = paliers.map((x) => {
    const rs = x.etapes.map((i) => resultats[i])
    const points = rs.reduce((a, r) => a + (r?.points ?? 0), 0)
    const sur = rs.reduce((a, r) => a + (r?.sur ?? 0), 0)
    return {
      fini: rs.length > 0 && rs.every((r) => r?.complet),
      faits: rs.filter((r) => r).length,
      // Palier tout sur papier : rien de manqué
      pourcentage: sur > 0 ? Math.round((100 * points) / sur) : 100,
    }
  })
  const ouverts: boolean[] = []
  const instants = paliers.map((x) => (x.ouverture ? Date.parse(x.ouverture) : null))
  const avantOuverture = instants.map((t) => t !== null && (maintenant === null || maintenant < t))
  const heureAVerifier = instants.map((t) => t !== null && maintenant === null && appareil >= t)
  paliers.forEach((x, k) => {
    if (avantOuverture[k]) return ouverts.push(false)
    if (k === 0 || x.acces !== 'seuil') return ouverts.push(true)
    // Ceinture précédente déjà obtenue (même dans une version antérieure) : le palier reste ouvert
    ouverts.push(acquis[k - 1] === true || (ouverts[k - 1] && bilans[k - 1].fini && bilans[k - 1].pourcentage >= x.seuil))
  })
  return paliers.map((x, k) => {
    const suivant = paliers[k + 1]
    const attendu = suivant?.acces === 'seuil' ? suivant.seuil : SEUIL_PAR_DEFAUT
    return { ...x, ...bilans[k], ouvert: ouverts[k], avantOuverture: avantOuverture[k], heureAVerifier: heureAVerifier[k], attendu, aRevoir: bilans[k].fini && bilans[k].pourcentage < attendu }
  })
}

type EtatPalier = ReturnType<typeof etatsPaliers>[number]

/**
 * Ce qui manque pour ouvrir le palier `x` (fermé), d'après le précédent :
 * « à partir du jeudi 12 novembre », « au moins 80 % (tu as 75 %) », ou les deux.
 */
export function conditionPalier(x: EtatPalier, precedent: EtatPalier) {
  const date = !x.avantOuverture ? '' : `à partir du ${momentOuverture(x.ouverture!)}${x.heureAVerifier ? ' (connexion à internet nécessaire pour vérifier la date)' : ''}`
  const atteint = precedent.fini && precedent.pourcentage >= x.seuil
  const seuil =
    x.acces === 'seuil' && !atteint ? `au moins ${x.seuil} % (${precedent.fini ? `tu as ${precedent.pourcentage} %` : 'termine tous ses exercices'})` : ''
  return date && seuil ? `${date}, avec ${seuil}` : date || seuil
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
  const termines = passages.filter((s) => s.fin).sort((a, b) => a.fin!.localeCompare(b.fin!))
  for (const s of termines) {
    // Séance de révision : plusieurs chapitres mélangés, sans niveau ni chapitre ;
    // l'objectif garde ceux du parcours où il a été travaillé
    const melange = !s.contenu.niveau && !s.contenu.theme
    for (const e of bilan(s).parEtape) {
      if (!e.faites || !e.sur) continue
      const pourcentage = Math.round((100 * e.points) / e.sur)
      for (const libelle of s.contenu.etapes[e.etape]?.objectifs ?? []) {
        const avant = parObjectif.get(libelle)
        const source = !melange || !avant
        parObjectif.set(libelle, {
          libelle,
          niveau: source ? s.contenu.niveau : avant.niveau,
          theme: source ? s.contenu.theme : avant.theme,
          meilleur: Math.max(avant?.meilleur ?? 0, pourcentage),
          dernier: s.fin!,
          parcours: source ? s.contenu.titre : avant.parcours,
          passages: (avant?.passages ?? 0) + 1,
        })
      }
    }
  }
  return [...parObjectif.values()]
}

/** Ceintures déjà obtenues, dans l'ordre des paliers (pour `etatsPaliers`) */
export const acquisDe = (p: Parcours, passages: Seance[]) => ceinturesObtenues(p, passages).map((c) => c.obtenue)

/** Réussite attendue pour la ceinture `k` d'un parcours : seuil du palier suivant, sinon 80 % */
const attenduDe = (paliers: ReturnType<typeof paliersDe>, k: number) => {
  const suivant = paliers[k + 1]
  return suivant?.acces === 'seuil' ? suivant.seuil : SEUIL_PAR_DEFAUT
}
const signature = (p: Parcours, etapes: number[]) => etapes.map((i) => p.etapes[i]?.uuid).sort().join()

/**
 * Ceintures d'un parcours d'après les passages terminés : une ceinture est
 * obtenue quand son palier a été terminé au moins une fois avec la réussite
 * attendue (seuil de la suivante, sinon 80 %). Corriger le parcours ne la
 * retire jamais : un passage compte pour la ceinture de même rang, ou pour
 * celle dont les exercices sont les mêmes si les paliers ont changé de place,
 * et sa réussite est jugée sur le seuil de la version où il a eu lieu.
 */
export function ceinturesObtenues(p: Parcours, passages: Seance[]) {
  const paliers = paliersDe(p)
  const passagesDe = passages.filter((s) => s.fin && s.contenu.id === p.id)
  return paliers.map((x, k) => {
    const sig = signature(p, x.etapes)
    let meilleur = 0
    let obtenue = false
    for (const s of passagesDe) {
      // Palier du passage dans sa copie figée
      const anciens = paliersDe(s.contenu)
      const rang = anciens.findIndex((a) => a.etapes.join() === s.etapes.join())
      if (rang === -1) continue
      if (rang !== k && signature(s.contenu, s.etapes) !== sig) continue
      const b = bilan(s)
      if (b.faites !== b.sur) continue
      meilleur = Math.max(meilleur, b.pourcentage)
      if (b.pourcentage >= attenduDe(anciens, rang)) obtenue = true
    }
    return { nom: nomPalier(p, k), couleur: couleurCeinture(p, k), obtenue, meilleur }
  })
}

export interface CeintureDuChapitre {
  nom: string
  couleur: string
  obtenue: boolean
  par: string[] // titres des parcours qui l'ont donnée
}

export interface ChapitreCeintures {
  niveau: string
  theme: string
  ceintures: CeintureDuChapitre[]
  parcours: { p: Parcours; obtenues: number; total: number }[]
}

/**
 * Ceintures par chapitre (Nathan, 2026-10-30 : « vraiment par chapitre, vu que
 * plusieurs parcours peuvent travailler les mêmes ceintures »). Chapitre du
 * référentiel, comme l'Explorer (degré et chapitre du parcours). Une ceinture
 * du chapitre est obtenue dès qu'un de ses parcours en ceintures l'a donnée ;
 * chaque parcours garde sa première ceinture, la rangée va de la plus basse à
 * la plus haute de tous.
 */
export function ceinturesParChapitre(parcours: Parcours[], historiques: Record<string, Seance[]>): ChapitreCeintures[] {
  const chapitres = new Map<string, ChapitreCeintures & { rangs: Map<number, CeintureDuChapitre> }>()
  for (const p of parcours) {
    if (p.style !== 'ceintures' || paliersDe(p).length < 2) continue
    const cle = cleChapitre(p)
    let c = chapitres.get(cle)
    if (!c) chapitres.set(cle, (c = { niveau: p.niveau, theme: p.theme, ceintures: [], parcours: [], rangs: new Map() }))
    const liste = ceinturesObtenues(p, historiques[p.id] ?? [])
    liste.forEach((x, k) => {
      const r = rangCeinture(p, k)
      let ceinture = c.rangs.get(r)
      if (!ceinture) c.rangs.set(r, (ceinture = { nom: nomCeinture(r), couleur: couleurDuRang(r), obtenue: false, par: [] }))
      if (x.obtenue) {
        ceinture.obtenue = true
        ceinture.par.push(p.titre)
      }
    })
    c.parcours.push({ p, obtenues: liste.filter((x) => x.obtenue).length, total: liste.length })
  }
  return [...chapitres.values()].map(({ rangs, ...c }) => ({
    ...c,
    ceintures: [...rangs.entries()].sort(([a], [b]) => a - b).map(([, x]) => x),
  }))
}
