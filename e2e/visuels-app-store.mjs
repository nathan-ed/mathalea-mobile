// Visuels « En-tête et résultats de recherche » d'App Store Connect (iOS 27) :
// au centre, dans la zone qu'Apple garantit de ne pas rogner, le logo de
// MathALÉA, la phrase et les niveaux de la France et de la Suisse romande avec
// leurs drapeaux (comme l'image de présentation de Google Play) ; sur les
// côtés, des écrans de l'app, qui peuvent être coupés selon l'appareil.
// Écrans : captures iPhone 6,9 pouces de docs/app-store (e2e/fiche-play.mjs).
//   node e2e/visuels-app-store.mjs [captures] [sortie]   (pnpm dev, ou BASE=…)
//   ZONE=1 node e2e/visuels-app-store.mjs …   # trace la zone sûre, pour vérifier
// Tailles d'Apple (Creative assets specifications) : en-tête 21:9 3840 × 1646,
// zone sûre centrée 1646 × 661 ; résultats de recherche 3:2 3840 × 2560, zone
// sûre centrée 2168 × 1030. PNG sans transparence.
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { SANS_BRIDAGE } from './attente.mjs'

const captures = process.argv[2] ?? 'docs/app-store'
const sortie = process.argv[3] ?? `${captures}/visuels`
const base = process.env.BASE ?? 'http://localhost:1420/'
mkdirSync(sortie, { recursive: true })
const image = (nom) => `data:image/png;base64,${readFileSync(`${captures}/iphone-6-9-${nom}.png`).toString('base64')}`

// Points CSS à l'échelle 2 ; zone sûre en points CSS. Écrans : [nom, gauche, haut]
const VISUELS = {
  'en-tete': {
    width: 1920,
    height: 823,
    zone: { width: 823, height: 331 },
    logo: 2.1,
    titre: 34,
    texte: 25,
    ecran: 300,
    ecrans: [
      ['2-paliers', 10, 150],
      ['1-accueil', 236, 50],
      ['3-ceintures', 1384, 50],
      ['4-question', 1610, 150],
    ],
  },
  'resultats-recherche': {
    width: 1920,
    height: 1280,
    zone: { width: 1084, height: 515 },
    logo: 3.1,
    titre: 52,
    texte: 37,
    ecran: 400,
    ecrans: [
      ['1-accueil', 20, 205],
      ['3-ceintures', 1500, 205],
    ],
  },
}

const drapeauFrance = (h) =>
  `<svg height="${h}" viewBox="0 0 3 2" style="flex:none;border:1px solid #c8c8c8"><rect width="1" height="2" fill="#0055A4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#EF4135"/></svg>`
const drapeauSuisse = (h) =>
  `<svg height="${h}" viewBox="0 0 32 32" style="flex:none;margin:0 ${h * 0.22}px"><rect width="32" height="32" fill="#D52B1E"/><path d="M13 6h6v7h7v6h-7v7h-6v-7H6v-6h7z" fill="#fff"/></svg>`

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })
for (const [nom, v] of Object.entries(VISUELS)) {
  const ctx = await nav.newContext({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: 2 })
  await ctx.route('**/*', (q) => (['localhost', '127.0.0.1'].includes(new URL(q.request().url()).hostname) ? q.continue() : q.abort()))
  const page = await ctx.newPage()
  await page.goto(base)
  const logo = await page.locator('.logo-entete').first().evaluate((e) => e.outerHTML)
  const ligne = (drapeau, texte) =>
    `<div style="display:flex;align-items:center;gap:${v.texte * 0.6}px;margin-top:${v.texte * 0.35}px">${drapeau}<span>${texte}</span></div>`
  // Les écrans de droite sont dans l'ordre inverse pour que les plus proches du
  // centre passent devant
  const ecrans = v.ecrans
    .map(
      ([ecran, gauche, haut], i) =>
        `<img src="${image(ecran)}" style="position:absolute;left:${gauche}px;top:${haut}px;width:${v.ecran}px;z-index:${i < v.ecrans.length / 2 ? i : v.ecrans.length - 1 - i};border:1px solid #c8c8c8;border-radius:${v.ecran * 0.07}px;box-shadow:0 6px 24px rgba(0,0,0,.12)">`,
    )
    .join('')
  const zone = process.env.ZONE
    ? `<div style="position:absolute;left:${(v.width - v.zone.width) / 2}px;top:${(v.height - v.zone.height) / 2}px;width:${v.zone.width}px;height:${v.zone.height}px;outline:2px dashed #f15929;z-index:9"></div>`
    : ''
  const html = `
    <style>.logo-entete,.logo-entete span{overflow:visible!important;text-overflow:clip!important;white-space:nowrap!important;flex:none!important}</style>
    <div style="position:relative;width:${v.width}px;height:${v.height}px;overflow:hidden;background:#f6f6f6;font-family:'Source Sans Pro',sans-serif">
      ${ecrans}
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="zoom:${v.logo}">${logo}</div>
        <p style="margin:${v.texte * 0.6}px 0 0;font-size:${v.titre}px;line-height:1.2;font-weight:700;color:#1f2429">Parcours d’exercices de maths corrigés</p>
        <div style="margin-top:${v.texte * 0.3}px;font-size:${v.texte}px;line-height:1.3;color:#45505b">
          ${ligne(drapeauFrance(v.texte * 0.9), 'France : de la 6e à la Terminale')}
          ${ligne(drapeauSuisse(v.texte * 0.9), 'Suisse romande : de la 9e à la 4e du Collège')}
        </div>
      </div>
      ${zone}
    </div>`
  await page.evaluate((html) => {
    document.body.style.margin = '0'
    document.body.innerHTML = html
  }, html)
  await page.waitForTimeout(500)
  const fichier = `${sortie}/${nom}.png`
  await page.screenshot({ path: fichier, clip: { x: 0, y: 0, width: v.width, height: v.height } })
  // Apple refuse la transparence
  execFileSync('magick', [fichier, '-background', '#f6f6f6', '-alpha', 'remove', '-alpha', 'off', fichier])
  await ctx.close()
}
await nav.close()
