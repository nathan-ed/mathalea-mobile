// La barre Vérifier / Passer reste visible pendant que le clavier de MathALÉA
// s'ouvre ou se ferme (Nathan, 3 novembre 2026 : « Le bouton ne devrait pas
// partir, il devrait toujours être là »). Le clavier entre et sort en glissant
// de toute sa hauteur : il doit passer derrière la barre, jamais dessus.
// On observe chaque image de l'animation : le centre de la barre et de ses
// boutons appartient toujours à la barre, qui ne bouge pas.
//   node e2e/barre-clavier.mjs   (app construite servie sur le port 1420)
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

// Observe la barre à chaque image pendant `ms` millisecondes. Le clavier qui
// sort est inerte (transition de Svelte) : elementFromPoint ne le voit plus,
// d'où un calcul géométrique (chevauchement) et l'ordre d'empilement.
const observer = (ms) =>
  page.evaluate(
    (ms) =>
      new Promise((fin) => {
        const barre = document.querySelector('.barre-seance')
        const haut0 = barre.getBoundingClientRect().top
        const clavier = () => document.getElementById('mathalea-virtual-keyboard')
        // z-index effectif dans l'empilement racine : celui de l'ancêtre le plus haut qui en a un
        const plan = (el) => {
          let z = 0
          for (let e = el; e && e !== document.body; e = e.parentElement) {
            const v = getComputedStyle(e).zIndex
            if (v !== 'auto') z = Number(v)
          }
          return z
        }
        const releve = { images: 0, cachee: 0, bougee: 0, clavierVu: 0, auDebut: !!clavier(), aLaFin: false }
        const t0 = performance.now()
        const image = () => {
          releve.images++
          const r = barre.getBoundingClientRect()
          if (Math.abs(r.top - haut0) > 1) releve.bougee++
          const k = clavier()
          if (k) {
            releve.clavierVu++
            const c = k.getBoundingClientRect()
            const recouvre = c.bottom > r.top + 1 && c.top < r.bottom && plan(k) >= plan(barre)
            if (recouvre) releve.cachee++
          }
          if (performance.now() - t0 < ms) requestAnimationFrame(image)
          else fin({ ...releve, aLaFin: !!clavier() })
        }
        requestAnimationFrame(image)
      }),
    ms,
  )

await page.goto('http://localhost:1420/')
await page.getByRole('button', { name: /^Nombres relatifs/ }).first().click()
await page.getByRole('button', { name: 'Commencer', exact: true }).click()
const champ = page.locator('main math-field').first()
await champ.waitFor({ timeout: 30_000 })
await pagePrete(page)
// Scénario de la vidéo : répondre, Vérifier (le clavier se ferme), Question
// suivante (le clavier se rouvre sur le nouveau champ)
const p = await pointStable(champ)
await page.touchscreen.tap(p.x, p.y)
await page.locator('#mathalea-virtual-keyboard').waitFor()
await page.waitForTimeout(600)
await page.keyboard.type('1')
const verifier = await pointStable(page.getByRole('button', { name: 'Vérifier', exact: true }))
const fermeture = observer(1500)
await page.touchscreen.tap(verifier.x, verifier.y)
const f = await fermeture
ok(f.auDebut && !f.aLaFin, `fermeture : clavier ouvert puis fermé (${f.clavierVu}/${f.images} images)`)
ok(f.cachee === 0, `fermeture : barre jamais recouverte (${f.cachee}/${f.images} images)`)
ok(f.bougee === 0, `fermeture : barre immobile (${f.bougee}/${f.images} images)`)
await pagePrete(page)
const suivante = page.getByRole('button', { name: 'Question suivante', exact: true })
ok(await suivante.isVisible(), 'après Vérifier : « Question suivante » visible')
const q = await pointStable(suivante)
const ouverture = observer(1500)
await page.waitForTimeout(100) // quelques images sans clavier avant le toucher
await page.touchscreen.tap(q.x, q.y)
const o = await ouverture
ok(!o.auDebut && o.aLaFin, `ouverture : clavier fermé puis ouvert (${o.clavierVu}/${o.images} images)`)
ok(o.cachee === 0, `ouverture : barre jamais recouverte (${o.cachee}/${o.images} images)`)
ok(o.bougee === 0, `ouverture : barre immobile (${o.bougee}/${o.images} images)`)
ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
