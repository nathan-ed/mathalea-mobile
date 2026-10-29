// Pour chaque réponse attendue en flottant, tape la valeur arrondie (virgule) et dit si verifier() l'accepte.
//   node revue/flottants-essai.mjs [filtre]
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
const ici = dirname(fileURLToPath(import.meta.url))
const d = join(ici, 'sorties')
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173/alea/'
const filtre = new RegExp(process.argv[2] ?? '.')
const re = /^-?\d+\.\d*(0000000|9999999)\d*$/
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await nav.newPage({ viewport: { width: 390, height: 844 } })
await page.goto(BASE + 'revue-banc.html')
await page.waitForFunction(() => window.pret === true, null, { timeout: 120_000 })
await page.evaluate(() => window.sonde.init())
for (const f of readdirSync(d)) {
  const s = JSON.parse(readFileSync(join(d, f), 'utf8'))
  if (!filtre.test(s.id)) continue
  const vus = new Set()
  for (const v of s.variantes ?? [])
    for (const [i, r] of Object.entries(v.reponses ?? {}))
      for (const [k, x] of Object.entries(r ?? {}))
        if (re.test(String(x))) {
          const t = (v.questions[i]?.enonce ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 120)
          if (vus.has(t)) continue
          vus.add(t)
          const params = { uuid: s.uuid, nbQuestions: v.questions.length, alea: v.graine, ...(v.params ?? {}) }
          const m = /sup\d?=[^ ]+/g
          for (const kv of (v.variante.match(m) ?? [])) { const [a, b] = kv.split('='); params[a] = b === 'true' ? true : b === 'false' ? false : /^\d+$/.test(b) ? Number(b) : b }
          const mn = /nb=(\d+)/.exec(v.variante); if (mn) params.nbQuestions = Number(mn[1])
          try {
            await page.evaluate((p) => window.sonde.langue(p), s.pays)
            await page.evaluate((p) => window.sonde.preparer(p, 0), params)
            const propre = String(Number(x).toPrecision(12)).replace(/\.?0+$/, '').replace('.', ',')
            const ok = await page.evaluate(([n, val]) => window.sonde.essai(n, val), [Number(i), propre])
            console.log(`${s.id} ${v.variante} q${+i + 1} ${k} « ${propre} » → ${ok}`)
          } catch (e) { console.log(`${s.id} ${v.variante} q${+i + 1} erreur ${String(e).slice(0, 80)}`) }
        }
}
await nav.close()
