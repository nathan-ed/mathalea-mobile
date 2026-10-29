// Trie les constats I4 (« champ absent de la page ») : la question existe-t-elle parmi
// les questions produites (ce que l'app affiche) ? Si non, la réponse attendue est
// orpheline (essai écarté par questionJamaisPosee) et l'élève ne voit rien d'anormal.
//   node revue/trier-i4.mjs > revue/trier-i4.jsonl
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ici = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173/alea/'
const ref = JSON.parse(readFileSync(join(ici, 'referentiel.json'), 'utf8'))
const cs = readFileSync(join(ici, 'classement', 'tickets-interactif.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((c) => c.regle === 'I4' && c.origine === 'banc' && c.rejeu?.params)
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
let page
async function neuve() {
  if (page) await page.close().catch(() => {})
  page = await nav.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto(BASE + 'revue-banc.html')
  await page.waitForFunction(() => window.pret === true, null, { timeout: 120_000 })
  await page.evaluate(() => window.sonde.init())
}
await neuve()
for (const c of cs) {
  const q = c.rejeu.occurrence[2]
  try {
    await page.evaluate((p) => window.sonde.langue(p), ref.find((x) => x.id === c.id)?.pays ?? 'FR')
    const prep = await page.evaluate((p) => window.sonde.preparer(p, 0), c.rejeu.params)
    const bloc = await page.evaluate(async (q) => {
      await window.sonde.rendre('enonce')
      const b = document.querySelector(`[data-q="${q}"]`)
      return b ? { champs: b.querySelectorAll('[id^="champTexteEx0Q"], select, input').length, texte: b.innerText.replace(/\s+/g, ' ').slice(0, 160) } : null
    }, q)
    const nbq = prep.questions.length
    const r = { cle: c.cle, id: c.id, q: q + 1, questions: nbq, orpheline: q >= nbq, interactive: prep.questions[q]?.interactive ?? null, format: prep.questions[q]?.format ?? null, ...(bloc ?? {}) }
    console.log(JSON.stringify(r))
  } catch (e) {
    console.log(JSON.stringify({ cle: c.cle, id: c.id, erreur: String(e.message).slice(0, 150) }))
    await neuve()
  }
}
await nav.close()
