// Défilement de la page au doigt et à la molette (pnpm dev seulement). En 0.4.6
// et 0.4.7, `overflow-x: clip` sur html avec `overflow-x: hidden` sur body
// faisait du body un conteneur de défilement à la hauteur de son contenu : le
// doigt ne faisait plus descendre aucun écran (Réglages, accueil, séance).
// Vrais événements tactiles (appui, glissé, relâchement), pas de scrollTo.
// Vérifie aussi qu'un contenu plus large que l'écran n'élargit pas la page.
//   node e2e/defilement.mjs
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

async function ouvrir(options) {
  const ctx = await nav.newContext(options)
  await ctx.addInitScript((classe) => {
    localStorage.setItem('copie:profil', '"eleve"')
    localStorage.setItem('copie:pays', '"FR"')
    localStorage.setItem('copie:classes', JSON.stringify([classe]))
  }, classe)
  const page = await ctx.newPage()
  await page.goto('http://localhost:1420/')
  await page.getByRole('button', { name: /^Nombres relatifs/ }).first().waitFor({ timeout: 30000 })
  return { ctx, page, cdp: await ctx.newCDPSession(page) }
}

/** Glissé du doigt de (x, y1) à (x2, y2) */
async function glisser(cdp, page, x, y1, y2, x2 = x) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y1 }] })
  for (let i = 1; i <= 12; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + ((x2 - x) * i) / 12, y: y1 + ((y2 - y1) * i) / 12 }] })
    await page.waitForTimeout(16)
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(600)
}

// Téléphone, thème sombre comme sur la capture du bug
const { ctx, page, cdp } = await ouvrir({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'dark' })
await page.getByRole('button', { name: 'Réglages' }).first().click()
await page.getByRole('heading', { name: 'Sauvegarde' }).waitFor()
await page.waitForTimeout(400)
await glisser(cdp, page, 200, 650, 150)
ok((await page.evaluate(() => scrollY)) > 200, 'Réglages : le doigt fait descendre la page')
await glisser(cdp, page, 200, 650, 150)
await glisser(cdp, page, 200, 650, 150)
const interrupteur = page.getByRole('switch', { name: /Je suis enseignant/ })
const b = await interrupteur.boundingBox()
ok(!!b && b.y + b.height <= 844 && b.y >= 0, 'Réglages : « Je suis enseignant » atteint au doigt')
await glisser(cdp, page, 200, 150, 650)
await glisser(cdp, page, 200, 150, 650)
await glisser(cdp, page, 200, 150, 650)
ok((await page.evaluate(() => scrollY)) === 0, 'Réglages : le doigt fait remonter en haut')

await page.getByRole('button', { name: 'Revenir en arrière' }).first().click()
await page.getByRole('button', { name: /^Nombres relatifs/ }).first().waitFor()
await page.evaluate(() => {
  const d = document.createElement('div')
  d.id = 'essai-defilement'
  d.style.cssText = 'width: 1200px; height: 1500px'
  document.querySelector('main')?.append(d)
})
await page.waitForTimeout(300)
await glisser(cdp, page, 200, 650, 150)
ok((await page.evaluate(() => scrollY)) > 200, 'accueil allongé : le doigt fait descendre la page')
await glisser(cdp, page, 350, 400, 400, 20)
const large = await page.evaluate(() => ({ largeur: innerWidth, decalage: visualViewport?.offsetLeft ?? 0, x: scrollX }))
ok(large.largeur === 390 && large.decalage === 0 && large.x === 0, `contenu de 1200 px : la page garde la largeur de l’écran (${JSON.stringify(large)})`)

// Séance : un énoncé plus haut que l'écran défile au doigt, même en partant de
// la question (cadre qui défile en largeur, `.question-eleve`)
await page.goto('http://localhost:1420/')
await page.getByRole('button', { name: /^Nombres relatifs/ }).first().click()
await page.getByRole('button', { name: /^(Commencer|Continuer)/ }).first().click()
const entrainement = page.getByRole('button', { name: 'Commencer l’entraînement' })
if (await entrainement.isVisible({ timeout: 3000 }).catch(() => false)) await entrainement.click()
await page.locator('.question-eleve').first().waitFor({ timeout: 30000 })
await page.waitForTimeout(800)
await page.evaluate(() => {
  const d = document.createElement('div')
  d.style.cssText = 'height: 1500px'
  document.querySelector('.question-eleve')?.append(d)
  ;document.activeElement?.blur?.()
})
await page.waitForTimeout(500)
const zone = await page.locator('.question-eleve').first().boundingBox()
await glisser(cdp, page, 200, Math.min(600, zone.y + zone.height - 20), 150)
ok((await page.evaluate(() => scrollY)) > 200, 'séance : le doigt fait descendre un énoncé long, depuis la question')
await glisser(cdp, page, 200, 200, 700)
await glisser(cdp, page, 200, 200, 700)
ok((await page.evaluate(() => scrollY)) === 0, 'séance : le doigt fait remonter en haut')
await ctx.close()

// Fenêtre de bureau : molette
const bureau = await ouvrir({ viewport: { width: 1280, height: 720 } })
await bureau.page.getByRole('button', { name: 'Réglages' }).first().click()
await bureau.page.getByRole('heading', { name: 'Sauvegarde' }).waitFor()
await bureau.page.mouse.move(640, 400)
await bureau.page.mouse.wheel(0, 600)
await bureau.page.waitForTimeout(600)
ok((await bureau.page.evaluate(() => scrollY)) > 200, 'bureau : la molette fait descendre les Réglages')
await bureau.ctx.close()

await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
