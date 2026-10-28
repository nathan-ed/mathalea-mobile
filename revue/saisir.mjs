// Saisie brute dans un champ (sans la sonde) et verdict de verifier(), pour confirmer un constat.
//   node revue/saisir.mjs <uuid> <graine> '<params JSON>' <nb> <question 1..n> <saisie>… (page revue-debug.html de MathALÉA)
import { chromium } from 'playwright'
const [uuid, alea, sup, nb, q, ...vals] = process.argv.slice(2)
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await nav.newPage({ viewport: { width: 390, height: 844 } })
await page.goto('http://127.0.0.1:5173/alea/revue-debug.html')
await page.waitForFunction(() => window.pret === true, null, { timeout: 120000 })
const r = await page.evaluate(async ([uuid, alea, sup, nb, q, vals]) => {
  const m = window.m
  await m.initialiser(); m.definirLangue('fr-FR')
  const ex = await m.preparerExercice({ uuid, alea, nbQuestions: Number(nb), ...JSON.parse(sup) }, 0)
  const z = document.getElementById('zone')
  z.innerHTML = ex.questions.map((x) => `<div>${x.enonce}</div>`).join('')
  await m.afficher(z)
  await new Promise((r) => setTimeout(r, 300))
  const i = Number(q) - 1
  const out = { attendu: JSON.stringify(ex.interne.autoCorrection[i]?.reponse ?? ex.interne.autoCorrection[i]).slice(0, 300) }
  for (const v of vals) {
    const el = document.getElementById(`champTexteEx0Q${i}`)
    el.value = v
    el.dispatchEvent(new Event('input', { bubbles: true }))
    await new Promise((r) => setTimeout(r, 80))
    out[v] = m.verifier(ex, i).juste
  }
  return out
}, [uuid, alea, sup, nb, q, vals])
console.log(r)
await nav.close()
