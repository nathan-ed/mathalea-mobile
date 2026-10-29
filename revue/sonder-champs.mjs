// Pour chaque question d'un exercice préparé : déclarée interactive ou non (ce que l'app
// lit), format attendu, et champs réellement présents dans son bloc. Sert à confirmer
// les constats I4 (« champ absent de la page »).
//   node revue/sonder-champs.mjs <id> <graine> '<paramètres JSON>' <nb>
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ici = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173/alea/'
const [id, alea, sup, nb] = process.argv.slice(2)
const e = JSON.parse(readFileSync(join(ici, 'referentiel.json'), 'utf8')).find((x) => x.id === id)
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await nav.newPage({ viewport: { width: 390, height: 844 } })
await page.goto(BASE + 'revue-banc.html')
await page.waitForFunction(() => window.pret === true, null, { timeout: 120_000 })
await page.evaluate(() => window.sonde.init())
await page.evaluate((p) => window.sonde.langue(p), e.pays)
const prep = await page.evaluate((p) => window.sonde.preparer(p, 0), { uuid: e.uuid, nbQuestions: Number(nb), alea, ...JSON.parse(sup || '{}') })
const champs = await page.evaluate(async () => {
  await window.sonde.rendre('enonce')
  return [...document.querySelectorAll('[data-q]')].map((b) => ({ q: Number(b.dataset.q), ids: [...b.querySelectorAll('[id^="champTexteEx0Q"], select, [id^="checkEx0Q"], [id^="tabMathliveEx0Q"]')].map((x) => x.id || x.tagName) }))
})
prep.questions.forEach((q, i) => {
  const c = champs.find((x) => x.q === i)?.ids ?? []
  const texte = q.enonce.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 90)
  console.log(`${i + 1}. interactive=${q.interactive} format=${q.format} champs=[${c.join(',')}] ${texte}`)
})
await nav.close()
