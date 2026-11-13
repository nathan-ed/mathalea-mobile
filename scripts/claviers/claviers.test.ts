/**
 * Contrôle des claviers : chaque réponse attendue peut-elle être tapée au
 * clavier virtuel de MathALÉA affiché pour son champ ? Lancé par
 * scripts/verifier-claviers.sh dans le clone du moteur (MathALÉA au commit
 * moteur/COMMIT), jamais dans le dépôt de l'app.
 * Entrée : FICHIERS (chemins séparés par « : », fichiers de parcours ou
 * questionsCan.json), GRAINES. Sortie : RAPPORT (JSON).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { basename } from 'node:path'
import { it, vi } from 'vitest'
import { keyboardBlocks } from '../src/components/keyboard/layouts/keysBlocks'
import { alphanumericLayouts } from '../src/components/keyboard/layouts/alphanumericRows'
import { keys } from '../src/components/keyboard/lib/keycaps'
import { toucheDepuisCle } from '../src/components/keyboard/lib/touchesPersonnalisees'
import {
  mathaleaHandleExerciceSimple,
  mathaleaHandleParamOfOneExercice,
  mathaleaLoadExerciceFromUuid,
} from '../src/lib/mathalea'
import { referentielLocale } from '../src/lib/stores/languagesStore'
import seedrandom from 'seedrandom'

vi.mock('../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../src/lib/components/version', () => ({ checkForServerUpdate: vi.fn() }))

const CAN = import.meta.glob('../src/exercices/can/**/*.ts')
const GRAINES = Number(process.env.GRAINES ?? 10)

// Atomes d'une chaîne LaTeX : commandes, lettres, chiffres, symboles
function atomes(s: string): string[] {
  const t = s
    .replace(/\\(dfrac|tfrac)/g, '\\frac')
    .replace(/\{,\}/g, ',')
    .replace(/\\(,|;|:|!| )|~/g, '')
    .replace(/\\(left|right|displaystyle)/g, '')
    .replace(/#[@?0-9]/g, '')
    .replace(/\\(text|mathrm|textrm|operatorname)\{([^}]*)\}/g, '$2')
  // Habillage des unités (\operatorname{\mathrm{cm}} comme \operatorname{ cm})
  return (t.match(/\\[a-zA-Z]+|\\.|[^\s{}]/g) ?? []).filter((a) => !['\\operatorname', '\\mathrm', '\\text', '\\textrm'].includes(a))
}
// Jamais bloquants : parenthèses (la touche en insère une paire), point
// décimal (réponse numérique écrite 2.5, la virgule est acceptée)
const NEUTRES = new Set(['(', ')', '[', ']', '.'])

function touches(clavier: string | null, perso: string | null) {
  const blocs = clavier === null ? ['numbers', 'fullOperations', 'variables'] : clavier.split(' ').filter(Boolean)
  const dispo = new Set<string>()
  const ajoute = (k: { display?: string; insert?: string }) => atomes(k.insert ?? k.display ?? '').forEach((a) => dispo.add(a))
  for (const b of blocs) {
    if (b === 'alphanumeric') {
      for (const n of Object.values(alphanumericLayouts).flat(2)) ajoute((keys as Record<string, object>)[String(n)] ?? { display: String(n) })
      continue
    }
    const bloc = (keyboardBlocks as Record<string, { keycaps: { inline: unknown[] } }>)[b]
    // Mode en ligne : celui du téléphone
    for (const n of bloc?.keycaps.inline ?? []) ajoute((keys as Record<string, object>)[String(n)] ?? { display: String(n) })
  }
  if (perso) {
    try { (JSON.parse(perso) as string[] | string[][]).flat().forEach((c) => ajoute(toucheDepuisCle(c))) } catch { /* illisible : aucune */ }
  }
  // Une barre de fraction se tape avec la touche fraction
  if (dispo.has('\\frac')) dispo.add('/')
  return dispo
}

// Fraction de deux entiers à écriture décimale finie : on peut taper le décimal
const decimalFini = (f: string) => {
  const m = /^-?\\[dt]?frac\{(\d+)\}\{(\d+)\}$/.exec(f.replace(/\s/g, ''))
  if (!m) return false
  let d = Number(m[2]) / gcd(Number(m[1]), Number(m[2]))
  for (const p of [2, 5]) while (d % p === 0) d /= p
  return d === 1
}
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)

function valeurs(v: unknown): string[] {
  if (v == null) return []
  if (Array.isArray(v)) return v.flatMap(valeurs)
  if (typeof v === 'object') return 'value' in (v as object) ? valeurs((v as { value: unknown }).value) : []
  // Nombre : jamais d'écriture 4.07e-5 de JavaScript
  if (typeof v === 'number') return [v.toLocaleString('en', { useGrouping: false, maximumSignificantDigits: 21 })]
  if (typeof v === 'function') return []
  // 2e4 : écriture scientifique, tapée 2\times10^{4}
  return [String(v).replace(/^(-?[\d.,]+)e([-+]?\d+)$/, '$1\\times10^{$2}')]
}

type Etape = { uuid?: string; source?: string; params: Record<string, unknown>; ou: string; langue: 'fr-FR' | 'fr-CH' }

function etapes(fichier: string): Etape[] {
  const d = JSON.parse(readFileSync(fichier, 'utf8'))
  const nom = basename(fichier)
  const langue = /\/CH\/|\bch-|prequalifiant|evacom/i.test(fichier) ? 'fr-CH' : 'fr-FR'
  if (!d.format) {
    // questionsCan.json : une question par source de MathALÉA
    const vues = new Map<string, Etape>()
    for (const [sujet, qs] of Object.entries(d as Record<string, { source: string; n: number }[]>))
      for (const q of qs) if (!vues.has(q.source)) vues.set(q.source, { source: q.source, params: {}, ou: `Teste ton niveau › ${sujet} › Q${q.n}`, langue: 'fr-FR' })
    return [...vues.values()]
  }
  const res: Etape[] = []
  const parcoursDe = (o: unknown): unknown[] =>
    o && typeof o === 'object'
      ? Array.isArray(o) ? o.flatMap(parcoursDe) : 'etapes' in o ? [o] : Object.values(o).flatMap(parcoursDe)
      : []
  for (const p of parcoursDe(d) as { titre: string; etapes: Record<string, unknown>[]; paliers?: { titre: string; nb: number }[] }[]) {
    let k = 0, fin = p.paliers?.[0]?.nb ?? Infinity
    p.etapes.forEach((e, i) => {
      while (p.paliers && i >= fin && k < p.paliers.length - 1) fin += p.paliers[++k].nb
      const ceinture = p.paliers?.[k]?.titre
      if (typeof e.uuid === 'string')
        res.push({ uuid: e.uuid, params: e, ou: `${nom} › ${p.titre}${ceinture ? ` › ${ceinture}` : ''} › ${e.id ?? e.uuid}${e.titre ? ` (${e.titre})` : ''}`, langue })
    })
  }
  return res
}

it('claviers', { timeout: 7_200_000 }, async () => {
  window.notify = vi.fn()
  window.notifyLocal = vi.fn()
  const toutes = (process.env.FICHIERS ?? '').split(':').filter(Boolean).flatMap(etapes)
  // Même exercice, mêmes réglages : contrôlé une fois
  const uniques = new Map<string, Etape & { ous: string[] }>()
  for (const e of toutes) {
    const { titre, objectifs, id, ...reglages } = e.params as Record<string, unknown>
    const cle = JSON.stringify([e.uuid ?? e.source, reglages, e.langue])
    const u = uniques.get(cle)
    if (u) u.ous.push(e.ou)
    else uniques.set(cle, { ...e, ous: [e.ou] })
  }
  const problemes: unknown[] = []
  const erreurs: unknown[] = []
  let champs = 0
  for (const e of uniques.values()) {
    referentielLocale.set(e.langue)
    const manque = new Map<string, string>()
    for (let g = 1; g <= GRAINES; g++) {
      document.body.innerHTML = ''
      let ex: any
      try {
        if (e.source) {
          ex = new ((await CAN[`../src/exercices/${e.source}.ts`]()) as any).default()
          ex.nbQuestions = 1
          seedrandom(`${e.source}-${g}`, { global: true })
          ex.seed = `${e.source}-${g}`
        } else {
          ex = await mathaleaLoadExerciceFromUuid(e.uuid!)
          mathaleaHandleParamOfOneExercice(ex, { ...e.params, alea: `claviers-${g}`, interactif: '1' } as any)
        }
        ex.interactif = true
        ex.numeroExercice = 0
        if (ex.typeExercice === 'simple') mathaleaHandleExerciceSimple(ex, true, 0)
        else {
          seedrandom(String(ex.seed), { global: true })
          ex.nouvelleVersionWrapper ? ex.nouvelleVersionWrapper(0) : ex.nouvelleVersion()
        }
      } catch (err) {
        erreurs.push({ ou: e.ous[0], erreur: String((err as Error).message).slice(0, 120) })
        break
      }
      ;(ex.listeQuestions ?? []).forEach((html: string, i: number) => {
        // Champ de la question : son id est champTexteEx0Q<i> (sinon : liste,
        // tableau, texte, QCM… hors contrôle)
        const id = `champTexteEx0Q${i}`
        const tag = (html.match(/<(math-field|mathalea-mathfield)[^>]*>/g) ?? []).find((t) =>
          new RegExp(`(mathfield-id|id)="${id}"`).test(t),
        )
        if (!tag) return
        const clavier = /data-keyboard="([^"]*)"/.exec(tag)?.[1] ?? (tag.startsWith('<mathalea') ? '' : null)
        const perso = /data-keys="([^"]*)"/.exec(tag)?.[1]?.replaceAll('&quot;', '"') ?? null
        const dispo = touches(clavier, perso)
        const ac = ex.autoCorrection?.[i]?.reponse?.valeur ?? ex.autoCorrection?.[i]?.valeur ?? {}
        for (const [k, v] of Object.entries(ac)) {
          if (k !== 'reponse' && !/^champ\d+$/.test(k)) continue
          // Intervalle accepté (estDansIntervalle) : on tape un nombre
          if ((v as { options?: { estDansIntervalle?: boolean } })?.options?.estDansIntervalle) { champs++; continue }
          if (String(JSON.stringify(v ?? {})).includes('"estDansIntervalle":true')) { champs++; continue }
          const formes = valeurs(v)
          if (!formes.length) continue
          champs++
          // Une seule forme acceptée saisissable suffit
          if (formes.some((f) => decimalFini(f) && dispo.has(','))) continue
          const sansCasse = JSON.stringify((v as { options?: unknown })?.options ?? {}).includes('SansCasse":true')
          const tapable = (a: string) => dispo.has(a) || (sansCasse && (dispo.has(a.toLowerCase()) || dispo.has(a.toUpperCase())))
          const manques = formes.map((f) => atomes(f).filter((a) => !NEUTRES.has(a) && !tapable(a)))
          const pire = manques.reduce((p, c) => (c.length < p.length ? c : p))
          for (const a of pire) if (!manque.has(a)) manque.set(a, `${formes[0]} (clavier « ${clavier ?? 'par défaut'} »)`)
        }
      })
    }
    if (manque.size) problemes.push({ exercice: e.uuid ?? e.source, ou: e.ous, touches: [...manque.keys()], exemple: [...manque.values()][0] })
  }
  writeFileSync(process.env.RAPPORT ?? 'rapport-claviers.json', JSON.stringify({ exercices: uniques.size, champs, problemes, erreurs }, null, 1))
})
