import { chromium } from 'playwright'
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const page = await nav.newPage()
await page.goto('http://localhost:1420/')
const r = await page.evaluate(async () => {
  const man = await (await fetch('/moteur/manifest.json')).json()
  const m = await import('/moteur/' + man.entree)
  await m.initialiser()
  let ex, i = -1
  for (const alea of 'abcdefghij') {
    ex = await m.preparerExercice({ uuid: 'b3aa4', nbQuestions: 3, alea }, 0)
    i = ex.interne.autoCorrection.findIndex((a) => a.valeur?.reponse?.options?.unite)
    if (i >= 0) break
  }
  const out = [JSON.stringify(ex.interne.autoCorrection[i].valeur)]
  const div = document.createElement('div'); document.body.append(div)
  div.innerHTML = ex.questions[i].enonce
  await m.afficher(div)
  const mf = div.querySelector('math-field')
  out.push('champ ' + mf.id + ' clavier=' + mf.dataset.keyboard)
  for (const v of [ex.interne.autoCorrection[i].valeur.reponse.value, ex.interne.autoCorrection[i].valeur.reponse.value.replace('\\,', ''), ex.interne.autoCorrection[i].valeur.reponse.value.replace(/m$/, '\\operatorname{m}'), ex.interne.autoCorrection[i].valeur.reponse.value.replace(/m$/, '\\,\\mathrm{m}')]) {
    mf.setValue(v)
    const res = await m.verifier(ex, i)
    out.push(v + ' → ' + JSON.stringify(res).slice(0, 80))
  }
  return out
})
console.log(r.join('\n'))
await nav.close()
