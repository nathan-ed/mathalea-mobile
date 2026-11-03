// Terminer après avoir passé des questions : l'élève est prévenu avant le bilan
// (Nathan, 3 novembre 2026 : « avant, on était prompté pour s'assurer qu'on
// voulait bien terminer »). Une question par page, correction à chaque question.
//   node e2e/terminer-passees.mjs   (app construite servie sur le port 1420)
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { pagePrete, SANS_BRIDAGE, pointStable } from './attente.mjs'

const demo = JSON.parse(readFileSync('static/demo/parcours-demonstration.json', 'utf8'))
const classe = { lien: 'https://kdrive.infomaniak.com/app/share/1/demo', nom: '5e A', disponibles: ['5e A'], parcours: demo.classes.flatMap((c) => c.parcours) }
let echecs = 0
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const erreurs = []
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await ctx.addInitScript((classe) => {
  localStorage.setItem('copie:profil', '"eleve"')
  localStorage.setItem('copie:pays', '"FR"')
  localStorage.setItem('copie:classes', JSON.stringify([classe]))
}, classe)
const page = await ctx.newPage()
page.on('pageerror', (e) => erreurs.push(e.message))
const toucher = async (locator) => {
  const p = await pointStable(locator)
  await page.touchscreen.tap(p.x, p.y)
  await pagePrete(page)
}

await page.goto('http://localhost:1420/')
await page.getByRole('button', { name: /^Nombres relatifs/ }).first().click()
await page.getByRole('button', { name: 'Commencer', exact: true }).click()
await page.locator('main math-field').first().waitFor({ timeout: 30_000 })
await pagePrete(page)
const total = Number(/Question 1 sur (\d+)/.exec(await page.locator('body').innerText())?.[1])
ok(total > 2, `séance de ${total} questions, une par page`)
// Toutes passées sauf la dernière, puis « Terminer » sans répondre
for (let n = 1; n < total; n++) {
  await toucher(page.getByRole('button', { name: 'Passer', exact: true }))
  await page.getByText(`Question ${n + 1} sur ${total}`).waitFor()
}
await toucher(page.getByRole('button', { name: 'Terminer', exact: true }))
const panneau = page.getByRole('dialog')
ok(await panneau.getByText('Terminer quand même ?').isVisible(), 'Terminer : panneau de confirmation avant le bilan')
ok(await panneau.getByText(`Il reste ${total} questions sans réponse`).isVisible(), `toutes les questions passées signalées (${total})`)
await page.screenshot({ path: `${process.env.CAPTURES ?? '/tmp'}/terminer-passees.png` })
// « Aller à Question 1 » ramène à la première question passée
await toucher(panneau.getByRole('button', { name: 'Aller à Question 1' }))
ok(await page.getByText(`Question 1 sur ${total}`).isVisible(), 'Aller à : retour à la première question passée')
// Revenir à la fin et confirmer : bilan
for (let n = 1; n < total; n++) await toucher(page.getByRole('button', { name: 'Passer', exact: true }))
await toucher(page.getByRole('button', { name: 'Terminer', exact: true }))
await toucher(page.getByRole('dialog').getByRole('button', { name: 'Terminer quand même' }))
ok(await page.getByRole('button', { name: 'Retour à l’accueil' }).isVisible(), 'Terminer quand même : bilan')
ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
