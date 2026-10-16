// Sonde du moteur pour « Teste ton niveau » (pnpm dev seulement) : chaque
// sujet de CAN retenu produit exactement les questions demandées (sup2).
//   node e2e/sonde-can.mjs
import { chromium } from 'playwright'

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const page = await nav.newPage()
await page.goto('http://localhost:1420/')
const resultat = await page.evaluate(async () => {
  const man = await (await fetch('/moteur/manifest.json')).json()
  const m = await import('/moteur/' + man.entree)
  await m.initialiser()
  const ref = (await m.listerExercices('FR')).filter((e) => e.niveau === 'CAN' && /^can.+a-(\d{4})[a-zA-Z]?$/.test(e.id) && Number(e.id.match(/a-(\d{4})/)[1]) >= 2024)
  const sortie = []
  for (const e of ref) {
    try {
      const d = await m.decrireExercice(e.uuid)
      const ex = await m.preparerExercice({ uuid: e.uuid, sup: 'false', sup2: '3-12', sup3: 'false', nbQuestions: 2 }, 0)
      const un = await m.preparerExercice({ uuid: e.uuid, sup: 'false', sup2: '7', sup3: 'false', nbQuestions: 1 }, 1)
      sortie.push(`${e.id} (${e.theme}) : ${d.nbQuestions} q. ; 3-12 → ${ex.questions.length} (${ex.questions.filter((q) => q.interactive).length} interactives) ; 7 → ${un.questions.length}`)
    } catch (err) {
      sortie.push(`${e.id} : ERREUR ${err.message}`)
    }
  }
  return sortie
})
console.log(resultat.join('\n'))
await nav.close()
