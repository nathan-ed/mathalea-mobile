// Diagnostic d'une classe (docs/remediation.md, 8) : objectifs d'une session
// partagée, d'après les verdicts que l'app de l'enseignant recalcule elle-même
// (ReponsesClasse). Rien ne vient d'un serveur : chaque réponse est revérifiée
// par le moteur, qui donne aussi le résultat de chaque point de réponse.
import type { Parcours } from './catalogue'
import { objectifsDuPoint } from './objectifs'
import type { ReponsesSession, VerdictQuestion } from './releve'

export interface ObjectifDeSession {
  libelle: string
  reussite: number // en %, moyenne des points (ou des questions) qui le visent
  eleves: number // élèves qui ont répondu à au moins un point qui le vise
  premier: number // élèves dont la première réponse manquée le vise : par où commencer en classe
}

/**
 * Objectifs d'une session, les moins réussis d'abord. `ordre` : questions dans
 * l'ordre où les élèves les ont vues (le premier point manqué en dépend) ;
 * `hors` : question d'un autre tirage (autre version du moteur), ignorée.
 */
export function objectifsDeLaSession(
  p: Parcours,
  ordre: string[],
  recues: ReponsesSession[],
  verdicts: Record<string, Record<string, VerdictQuestion>>,
  hors: (r: ReponsesSession, cle: string) => boolean = () => false,
): ObjectifDeSession[] {
  const total = new Map<string, { points: number; sur: number; eleves: Set<string>; premier: number }>()
  const de = (o: string) => {
    let x = total.get(o)
    if (!x) total.set(o, (x = { points: 0, sur: 0, eleves: new Set(), premier: 0 }))
    return x
  }
  for (const r of recues) {
    let premierManque: string[] | null = null
    for (const cle of ordre) {
      const v = verdicts[r.d]?.[cle]
      if (!v || !r.r[cle] || hors(r, cle)) continue
      const e = p.etapes[Number(cle.split('-')[0])]
      if (!e) continue
      const points = v.detail ? Object.entries(v.detail) : [[undefined, v.score] as const]
      for (const [point, score] of points) {
        const { objectifs } = objectifsDuPoint(e, point)
        for (const o of objectifs) {
          const x = de(o)
          x.points += score
          x.sur++
          x.eleves.add(r.d)
        }
        if (!premierManque && score < 1 && objectifs.length) premierManque = objectifs
      }
    }
    for (const o of premierManque ?? []) de(o).premier++
  }
  return [...total.entries()]
    .map(([libelle, x]) => ({ libelle, reussite: Math.round((100 * x.points) / x.sur), eleves: x.eleves.size, premier: x.premier }))
    .sort((a, b) => a.reussite - b.reussite || b.premier - a.premier)
}
