// Réponses attendues écrites en flottant (0.1+0.2…) dans les sorties du banc :
// la bonne réponse tapée par l'élève risque d'être refusée.
//   node revue/flottants.mjs
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const d = join(dirname(fileURLToPath(import.meta.url)), 'sorties')
const re = /^-?\d+\.\d*(0000000|9999999)\d*$/
for (const f of readdirSync(d)) {
  const s = JSON.parse(readFileSync(join(d, f), 'utf8'))
  const vus = new Set()
  for (const v of s.variantes ?? [])
    for (const [i, r] of Object.entries(v.reponses ?? {}))
      for (const [k, x] of Object.entries(r ?? {}))
        if (re.test(String(x))) {
          const t = (v.questions[i]?.enonce ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 120)
          if (!vus.has(t)) console.log(`${s.id} ${v.variante} q${+i + 1} ${k}=${x} | ${t}`)
          vus.add(t)
        }
}
