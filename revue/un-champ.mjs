// Remplit les champs d'une question un par un (les autres vides) et montre ce que
// moteur.verifier dit de la question : sert à voir quels champs comptent vraiment.
//   node revue/un-champ.mjs <id> <graine> '<paramètres JSON>' <nb> <question (1…)>
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ici = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173/alea/'
const [id, alea, sup, nb, q] = process.argv.slice(2)
const e = JSON.parse(readFileSync(join(ici, 'referentiel.json'), 'utf8')).find((x) => x.id === id)
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await nav.newPage({ viewport: { width: 390, height: 844 } })
await page.goto(BASE + 'revue-banc.html')
await page.waitForFunction(() => window.pret === true, null, { timeout: 120_000 })
await page.evaluate(() => window.sonde.init())
await page.evaluate((p) => window.sonde.langue(p), e.pays)
await page.evaluate((p) => window.sonde.preparer(p, 0), { uuid: e.uuid, nbQuestions: Number(nb), alea, ...JSON.parse(sup || '{}') })
// bonnes réponses de tous les champs, telles que le banc les saisit
const bonnes = (await page.evaluate(() => window.sonde.interactif('correcte'))).resultats.map((r) => ({ k: r.q, v: r.valeurs?.champ, juste: r.juste }))
const i = Number(q) - 1
const ids = await page.evaluate(async (i) => {
  await window.sonde.rendre('enonce')
  return [...document.querySelector(`[data-q="${i}"]`).querySelectorAll('[id^="champTexteEx0Q"]')].map((c) => c.id)
}, i)
// essai() ne remplit que le champ Q<i> de la page neuve : les autres champs de la question restent vides
const v = bonnes.find((b) => b.k === i)?.v
const res = { champs: ids, [`seul le champ Q${i} rempli (${v})`]: await page.evaluate(([i, v]) => window.sonde.essai(i, v), [i, v]) }
console.log(JSON.stringify(res, null, 1))
await nav.close()
