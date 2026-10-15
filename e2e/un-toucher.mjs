// Un seul toucher valide, même avec le clavier ouvert (pnpm dev seulement).
// Toucher lent (appui, 250 ms, relâchement) comme un doigt réel : avant la
// correction (barreDuBas.ts), le premier toucher ne faisait que fermer le clavier.
//   node e2e/un-toucher.mjs
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const demo = JSON.parse(readFileSync('static/demo/parcours-demonstration.json', 'utf8'))
const classe = { lien: 'https://kdrive.infomaniak.com/app/share/1/demo', nom: '5e A', disponibles: ['5e A'], parcours: demo.classes.flatMap((c) => c.parcours) }
let echecs = 0
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await ctx.addInitScript((classe) => {
  localStorage.setItem('copie:profil', '"eleve"')
  localStorage.setItem('copie:pays', '"FR"')
  localStorage.setItem('copie:classes', JSON.stringify([classe]))
}, classe)
const page = await ctx.newPage()
const cdp = await ctx.newCDPSession(page)
async function toucherLent(locator) {
  const b = await locator.boundingBox()
  const point = { x: b.x + b.width / 2, y: b.y + b.height / 2 }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] })
  await page.waitForTimeout(250)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(600)
}

await page.goto('http://localhost:1420/')
await page.getByRole('button', { name: /^Nombres relatifs/ }).first().click()
await page.getByRole('button', { name: 'Commencer', exact: true }).click()
const champ = page.locator('main math-field').first()
await champ.waitFor({ timeout: 20000 })
await champ.evaluate((el) => {
  el.focus()
  el.setValue('3')
  el.dispatchEvent(new Event('input', { bubbles: true }))
})
await page.waitForTimeout(600)
const clavier = await page.evaluate(() => {
  const k = document.getElementById('mathalea-virtual-keyboard')
  return !!k && k.getBoundingClientRect().height > 0 && getComputedStyle(k).display !== 'none'
})
console.log('clavier MathALÉA ouvert :', clavier)
await toucherLent(page.getByRole('button', { name: 'Vérifier' }))
ok(await page.getByRole('button', { name: /Question suivante|Voir le bilan/ }).isVisible(), 'séance : un toucher sur Vérifier corrige la question')
ok(!(await page.evaluate(() => document.activeElement?.closest('math-field'))), 'séance : clavier refermé après la correction')

// Page de plusieurs questions : une réponse tapée, puis « Soumettre » ; le
// panneau « Soumettre quand même ? » doit rester ouvert (il se refermait quand
// le champ, en perdant le focus, signalait la fin de sa saisie)
await page.getByRole('button', { name: 'Fermer la séance' }).or(page.getByRole('button', { name: 'Quitter' })).first().click().catch(() => {})
await page.goto('http://localhost:1420/')
await page.getByRole('button', { name: /^Fractions/ }).first().click()
await page.getByRole('button', { name: /^(Commencer|Reprendre)/ }).first().click()
const premier = page.locator('main math-field').first()
await premier.waitFor({ timeout: 20000 })
await premier.click()
await page.keyboard.type('12')
await page.waitForTimeout(500)
await toucherLent(page.getByRole('button', { name: /^Soumettre/ }).first())
ok(await page.getByRole('dialog').getByText('Soumettre quand même ?').isVisible(), 'page : un toucher sur Soumettre ouvre le panneau, qui reste ouvert')
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
