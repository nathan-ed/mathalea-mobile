// Progression adaptée (docs/remediation.md, 9.4) : sans parcours tout fait,
// l'app choisit l'exercice suivant dans une banque d'exercices étiquetés
// (objectif, niveau de difficulté), d'après ce que l'élève a réussi. Base de la
// « montée en puissance » demandée par Nathan (5 novembre 2026) ; logique seule,
// pas encore d'écran. Tout se calcule sur l'appareil.
//
// Règles, dans l'ordre :
//   1. objectif travaillé : le premier de la banque qui n'est pas acquis et
//      dont les prérequis le sont (graphe des prérequis de la banque) ;
//   2. niveau : le premier niveau pas encore réussi deux fois d'affilée
//      (monter, puis continuer) ; après un échec, un cran en dessous
//      (consolider) ; deux échecs de suite au plus bas niveau : un prérequis
//      (remédier) ;
//   3. objectif acquis : le plus haut niveau réussi deux fois d'affilée, puis
//      confirmé un autre jour (pratique espacée) ;
//   4. exercice : à cet objectif et ce niveau, le moins récemment fait.
import { paliersDe, type Etape, type Parcours } from './catalogue'

export interface ExerciceBanque {
  etape: Etape
  objectif: string
  niveau: number // difficulté : rang de la ceinture où l'enseignant l'a rangé (0 = la plus simple)
}

export interface ObjectifBanque {
  libelle: string
  prerequis?: string[]
}

export interface Banque {
  objectifs: ObjectifBanque[] // dans l'ordre de la progression
  exercices: ExerciceBanque[]
}

export interface Tentative {
  objectif: string
  niveau: number
  cle: string // exercice (cleExercice)
  reussi: boolean
  jour: string // AAAA-MM-JJ
}

export type Raison = 'commencer' | 'monter' | 'continuer' | 'consolider' | 'remedier' | 'confirmer'

export interface Choix {
  exercice: ExerciceBanque
  raison: Raison
}

/** Réussites d'affilée pour monter d'un niveau */
export const SERIE = 2

const niveauxDe = (b: Banque, o: string) => [...new Set(b.exercices.filter((e) => e.objectif === o).map((e) => e.niveau))].sort((a, c) => a - c)
const de = (t: Tentative[], o: string) => t.filter((x) => x.objectif === o)

/** Plus haut niveau réussi `SERIE` fois d'affilée (dernières tentatives à ce niveau), ou -1 */
export function niveauAtteint(t: Tentative[], o: string) {
  let meilleur = -1
  const parNiveau = new Map<number, Tentative[]>()
  for (const x of de(t, o)) parNiveau.set(x.niveau, [...(parNiveau.get(x.niveau) ?? []), x])
  for (const [n, l] of parNiveau) if (l.length >= SERIE && l.slice(-SERIE).every((x) => x.reussi)) meilleur = Math.max(meilleur, n)
  return meilleur
}

/** Objectif acquis : plus haut niveau de la banque atteint, et réussi aussi un autre jour */
export function acquis(b: Banque, t: Tentative[], o: string) {
  const niveaux = niveauxDe(b, o)
  if (!niveaux.length) return true // rien à travailler : ne bloque pas ce qui en dépend
  const haut = niveaux[niveaux.length - 1]
  if (niveauAtteint(t, o) < haut) return false
  const jours = new Set(de(t, o).filter((x) => x.niveau === haut && x.reussi).map((x) => x.jour))
  return jours.size >= 2
}

/** Exercice de cet objectif et ce niveau le moins récemment fait (jamais fait d'abord) */
function exercicePour(b: Banque, t: Tentative[], o: string, niveau: number) {
  const liste = b.exercices.filter((e) => e.objectif === o && e.niveau === niveau)
  const dernier = (e: ExerciceBanque) => t.map((x) => x.cle).lastIndexOf(cleDe(e))
  return [...liste].sort((a, c) => dernier(a) - dernier(c))[0]
}
export const cleDe = (e: ExerciceBanque) => [e.etape.uuid, e.etape.sup, e.etape.sup2, e.etape.sup3, e.etape.sup4].map((x) => x ?? '').join('|')

/** Exercice suivant, ou null quand tout est acquis */
export function choisir(b: Banque, t: Tentative[], aujourdhui: string): Choix | null {
  const estAcquis = (o: string) => acquis(b, t, o)
  const prerequis = (o: string) => b.objectifs.find((x) => x.libelle === o)?.prerequis ?? []
  const ouverts = b.objectifs.filter((o) => !estAcquis(o.libelle) && prerequis(o.libelle).every(estAcquis)).map((o) => o.libelle)
  if (!ouverts.length) return null
  // Un objectif à confirmer un autre jour laisse la place au suivant ouvert, s'il y en a un
  const prets = ouverts.map((o) => pour(o)).filter((c): c is Choix => c !== 'attendre')
  return prets[0] ?? (pour(ouverts[0], true) as Choix)

  function pour(o: string, malgre = false): Choix | 'attendre' {
    const niveaux = niveauxDe(b, o)
    const essais = de(t, o)
    const dernier = essais[essais.length - 1]
    const atteint = niveauAtteint(t, o)
    const haut = niveaux[niveaux.length - 1]
    const ici = (n: number, raison: Raison): Choix => ({ exercice: exercicePour(b, t, o, n), raison })
    if (!dernier) return ici(niveaux[0], 'commencer')
    if (!dernier.reussi) {
      const plusBas = niveaux.filter((n) => n < dernier.niveau)
      if (plusBas.length) return ici(plusBas[plusBas.length - 1], 'consolider')
      // Deux échecs de suite au plus bas niveau : un prérequis, à son plus haut niveau
      const avant = essais[essais.length - 2]
      if (avant && !avant.reussi && avant.niveau === dernier.niveau)
        for (const p of prerequis(o)) {
          const np = niveauxDe(b, p)
          if (np.length) return { exercice: exercicePour(b, t, p, np[np.length - 1]), raison: 'remedier' }
        }
      return ici(dernier.niveau, 'consolider')
    }
    // Plus haut niveau atteint : il se confirme un autre jour que ses réussites
    if (atteint === haut) {
      const aujourdhuiDeja = essais.some((x) => x.niveau === haut && x.reussi && x.jour === aujourdhui)
      return aujourdhuiDeja && !malgre ? 'attendre' : ici(haut, 'confirmer')
    }
    // Premier niveau pas encore réussi deux fois d'affilée
    const cible = niveaux.find((n) => n > atteint) ?? haut
    return ici(cible, cible > dernier.niveau ? 'monter' : 'continuer')
  }
}

/**
 * Banque d'un parcours à paliers : chaque exercice pour chacun de ses
 * objectifs, au niveau de son palier (la ceinture en dit la difficulté) ;
 * objectifs dans l'ordre où ils apparaissent, prérequis pris des remédiations.
 */
export function banqueDuParcours(p: Parcours): Banque {
  const paliers = paliersDe(p)
  const exercices: ExerciceBanque[] = []
  const ordre: string[] = []
  p.etapes.forEach((etape, i) => {
    const niveau = Math.max(0, paliers.findIndex((x) => x.etapes.includes(i)))
    const objectifs = [...new Set([...(etape.objectifs ?? []), ...Object.values(etape.points ?? {}).flat()])]
    for (const objectif of objectifs) {
      if (!ordre.includes(objectif)) ordre.push(objectif)
      exercices.push({ etape, objectif, niveau })
    }
  })
  const prerequis = (o: string) => p.remediations?.find((r) => r.objectif === o)?.prerequis?.filter((x) => ordre.includes(x)) ?? []
  return { objectifs: ordre.map((libelle) => ({ libelle, prerequis: prerequis(libelle) })), exercices }
}
