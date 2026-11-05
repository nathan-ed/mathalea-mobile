// Points de réponse du référentiel (remédiation, docs/remediation.md) : pour
// chaque exercice interactif, sous plusieurs graines, les points de réponse de
// chaque question (`decrirePoints` du moteur). Dit combien d'exercices ont des
// questions à plusieurs points et si ces points restent les mêmes d'une
// graine à l'autre, condition pour qu'un enseignant les étiquette.
// App construite servie sur 1420 (ou BASE) :
//   node e2e/sonde-points.mjs [FR|CH] [sortie.json]
import { writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { SANS_BRIDAGE } from './attente.mjs'

const PAYS = process.argv[2] ?? 'FR'
const SORTIE = process.argv[3]
const GRAINES = ['p1', 'q2', 'r3']
const PAGES = Number(process.env.PAGES ?? 3)
const LIMITE = Number(process.env.LIMITE ?? 0)

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })
async function nouvellePage() {
  const page = await nav.newPage()
  await page.goto(process.env.BASE ?? 'http://localhost:1420/')
  await page.evaluate(async (pays) => {
    const man = await (await fetch('/moteur/manifest.json')).json()
    const m = await import('/moteur/' + man.entree)
    await m.initialiser()
    m.definirLangue(pays === 'CH' ? 'fr-CH' : 'fr-FR')
    window.__moteur = m
  }, PAYS)
  return page
}

const premiere = await nouvellePage()
const liste = await premiere.evaluate(async (pays) => {
  const vus = new Set()
  return (await window.__moteur.listerExercices(pays))
    .filter((e) => e.interactif && !vus.has(e.uuid) && vus.add(e.uuid))
    .map((e) => ({ uuid: e.uuid, id: e.id, niveau: e.niveau, objectif: e.objectif?.code }))
}, PAYS)
const exercices = LIMITE ? liste.slice(0, LIMITE) : liste
console.log(`${exercices.length} exercices interactifs (${PAYS})`)

const pages = [premiere, ...(await Promise.all(Array.from({ length: PAGES - 1 }, nouvellePage)))]
const resultats = []
let suivant = 0
async function travailler(page, n) {
  for (;;) {
    const k = suivant++
    if (k >= exercices.length) return
    const e = exercices[k]
    const r = await page
      .evaluate(
        async ({ e, graines, numero }) => {
          const m = window.__moteur
          const tirages = []
          for (const alea of graines) {
            try {
              const ex = await m.preparerExercice({ uuid: e.uuid, id: e.id, alea }, numero)
              tirages.push(ex.questions.map((_, i) => m.decrirePoints(ex, i).map((p) => p.cle)))
            } catch (err) {
              tirages.push({ erreur: String(err?.message ?? err).slice(0, 120) })
            }
          }
          return tirages
        },
        { e, graines: GRAINES, numero: 700 + n },
      )
      .catch((err) => [{ erreur: String(err.message).slice(0, 120) }])
    resultats.push({ ...e, tirages: r })
    if (resultats.length % 100 === 0) console.log(`${resultats.length}/${exercices.length}`)
  }
}
await Promise.all(pages.map((p, n) => travailler(p, n)))
await nav.close()

// Classement de chaque exercice
const signature = (q) => q.join(',')
const stats = { total: 0, erreurs: 0, unPoint: 0, plusieurs: 0, uniformes: 0, stablesParRang: 0, variables: 0 }
const exemples = { uniformes: [], stablesParRang: [], variables: [] }
for (const r of resultats) {
  stats.total++
  const bons = r.tirages.filter((t) => Array.isArray(t))
  if (bons.length < r.tirages.length || !bons.length) {
    stats.erreurs++
    continue
  }
  const max = Math.max(...bons.flatMap((t) => t.map((q) => q.length)))
  if (max <= 1) {
    stats.unPoint++
    continue
  }
  stats.plusieurs++
  const toutes = new Set(bons.flatMap((t) => t.map(signature)))
  const parRang = bons[0].every((_, i) => new Set(bons.map((t) => signature(t[i] ?? []))).size === 1)
  const cas = toutes.size === 1 ? 'uniformes' : parRang ? 'stablesParRang' : 'variables'
  stats[cas]++
  if (exemples[cas].length < 15) exemples[cas].push(`${r.id} (${[...toutes].slice(0, 3).join(' | ')})`)
}
console.log(JSON.stringify(stats, null, 1))
for (const [cas, l] of Object.entries(exemples)) console.log(`${cas} :\n  ${l.join('\n  ')}`)
if (SORTIE) writeFileSync(SORTIE, JSON.stringify({ stats, resultats }, null, 1))
