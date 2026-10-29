// Saisit des réponses précises dans une question d'un exercice, avec la graine
// d'une variante du banc, et dit si verifier() les accepte. Pour confirmer un
// constat à la main (réponse correcte refusée, valeur flottante…).
//   node revue/essayer.mjs <id> <graine> '<paramètres JSON>' <nbQuestions> <question 1…n> <saisie>…
// Exemple : node revue/essayer.mjs can2N4-02 revue-0-a '{}' 10 5 32 '32,0'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ici = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173/alea/'
const [id, alea, sup, nb, q, ...saisies] = process.argv.slice(2)
const e = JSON.parse(readFileSync(join(ici, 'referentiel.json'), 'utf8')).find((x) => x.id === id)
if (!e) throw new Error(`id inconnu : ${id}`)
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await nav.newPage({ viewport: { width: 390, height: 844 } })
await page.goto(BASE + 'revue-banc.html')
await page.waitForFunction(() => window.pret === true, null, { timeout: 120_000 })
await page.evaluate(() => window.sonde.init())
await page.evaluate((p) => window.sonde.langue(p), e.pays)
const params = { uuid: e.uuid, nbQuestions: Number(nb), alea, ...JSON.parse(sup || '{}') }
const prep = await page.evaluate((p) => window.sonde.preparer(p, 0), params)
const i = Number(q) - 1
console.log(`${id} ${alea} q${q} : ${(prep.questions[i]?.enonce ?? `champ ${i} (question à plusieurs champs)`).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 160)}`)
// RETOUR=1 : affiche aussi le message de MathALÉA écrit sous le champ (feedback)
for (const s of saisies) {
  const juste = await page.evaluate(([n, v]) => window.sonde.essai(n, v), [i, s])
  const retour = process.env.RETOUR ? await page.evaluate((n) => [...document.querySelectorAll(`[id^="feedbackEx0Q${n}"], [id^="resultatCheckEx0Q${n}"]`)].map((e) => e.textContent.trim()).filter(Boolean).join(' | '), i) : ''
  console.log(`  « ${s} » → ${juste}${retour ? ` (${retour})` : ''}`)
}
await nav.close()
