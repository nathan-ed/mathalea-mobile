// Chaque exercice des parcours livrés (Explorer, démonstration) passé au moteur
// de l'app (pnpm dev seulement), avec ses réglages, sous plusieurs graines :
//   - il se prépare sans erreur et donne le nombre de questions demandé ;
//   - chaque question est interactive (l'app corrige seule) et a un énoncé.
// Un parcours suisse peut prendre un exercice « Non classés » en Suisse.
// Un exercice qui plante ne se voit sinon que lorsque l'élève y arrive.
//   node e2e/catalogue-moteur.mjs
import { readFileSync, readdirSync } from 'node:fs'
import { chromium } from 'playwright'

let echecs = 0
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  if (!cond || process.env.DETAIL) console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
}
const SUISSES = ['9e', '10e', '11e', 'Préqualifiant', '1re Collège', '2e Collège', '3e Collège', '4e Collège']
const GRAINES = ['a1', 'b2', 'c3']
const fichiers = [
  ...readdirSync('explorer')
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ chemin: `explorer/${f}`, explorer: true })),
  { chemin: 'static/demo/parcours-demonstration.json', explorer: false },
]
const parcours = fichiers.flatMap(({ chemin, explorer }) => {
  const d = JSON.parse(readFileSync(chemin, 'utf8'))
  return [...d.classes.flatMap((c) => c.parcours), ...(d.bibliotheque?.parcours ?? [])].map((p) => ({ p, explorer, chemin }))
})

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const page = await nav.newPage()
const erreurs = []
page.on('pageerror', (e) => erreurs.push(e.message))
await page.goto('http://localhost:1420/')
await page.evaluate(async () => {
  const man = await (await fetch('/moteur/manifest.json')).json()
  const m = await import('/moteur/' + man.entree)
  await m.initialiser()
  window.__moteur = m
})

let etapes = 0
for (const { p, chemin } of parcours) {
  const pays = SUISSES.includes(p.niveau) ? 'CH' : 'FR'
  const resultats = await page.evaluate(
    async ({ etapes, pays, graines }) => {
      const m = window.__moteur
      m.definirLangue(pays === 'CH' ? 'fr-CH' : 'fr-FR')
      const sortie = []
      for (const [i, e] of etapes.entries()) {
        const r = { i, uuid: e.uuid, id: e.id, essais: [] }
        for (const alea of graines) {
          try {
            const ex = await m.preparerExercice({ uuid: e.uuid, id: e.id, nbQuestions: e.nbQuestions, sup: e.sup, sup2: e.sup2, sup3: e.sup3, sup4: e.sup4, alea }, i)
            r.essais.push({ n: ex.questions.length, interactives: ex.questions.filter((q) => q.interactive).length, vides: ex.questions.filter((q) => !q.enonce?.trim()).length })
          } catch (err) {
            r.essais.push({ erreur: String(err?.message ?? err).slice(0, 160) })
          }
        }
        sortie.push(r)
      }
      return sortie
    },
    { etapes: p.etapes, pays, graines: GRAINES },
  )
  let fautes = 0
  for (const r of resultats) {
    etapes++
    const e = p.etapes[r.i]
    const nom = `${chemin} · ${p.id} · ${r.id ?? r.uuid} (étape ${r.i + 1})`
    for (const [k, x] of r.essais.entries()) {
      const bon = !x.erreur && x.n === e.nbQuestions && x.interactives === x.n && x.vides === 0
      if (!bon) fautes++
      ok(bon, `${nom}, graine ${GRAINES[k]} : ${e.nbQuestions} questions interactives`, JSON.stringify(x))
    }
  }
  console.log(fautes ? '✘' : '✔', `${p.id} (${pays}) : ${p.etapes.length} exercices${fautes ? `, ${fautes} défaut(s)` : ''}`)
}
ok(etapes > 0, 'des exercices ont été éprouvés')
ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.slice(0, 5).join(' | ') : ''}`)
await nav.close()
console.log(`${etapes} exercices, ${etapes * GRAINES.length} préparations`)
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
