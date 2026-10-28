// Image de présentation de la fiche Google Play (1024 × 500) : l'en-tête de
// l'app (logo et police de MathALÉA) agrandi, les niveaux de chaque pays, deux
// écrans de l'app (pnpm dev). Les écrans viennent de e2e/fiche-play.mjs.
//   node e2e/image-presentation.mjs <dossier des captures>   # écrit image-de-presentation.png dans ce dossier
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const dossier = process.argv[2] ?? 'docs/play-store'
const base = 'http://localhost:1420/'
const image = (nom) => `data:image/png;base64,${readFileSync(`${dossier}/${nom}`).toString('base64')}`
const ecran = 'position:absolute;width:204px;border:1px solid #c8c8c8;border-radius:22px 22px 0 0;box-shadow:0 2px 10px rgba(0,0,0,.12)'
const drapeauFrance =
  '<svg width="30" height="20" viewBox="0 0 3 2" style="flex:none;border:1px solid #c8c8c8;box-sizing:content-box"><rect width="1" height="2" fill="#0055A4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#EF4135"/></svg>'
const drapeauSuisse =
  '<svg width="22" height="22" viewBox="0 0 32 32" style="flex:none;margin:0 5px"><rect width="32" height="32" fill="#D52B1E"/><path d="M13 6h6v7h7v6h-7v7h-6v-7H6v-6h7z" fill="#fff"/></svg>'

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const ctx = await nav.newContext({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 })
await ctx.route('**/*', (q) => (['localhost', '127.0.0.1'].includes(new URL(q.request().url()).hostname) ? q.continue() : q.abort()))
const page = await ctx.newPage()
await page.goto(base)
const logo = await page.locator('.logo-entete').first().evaluate((e) => e.outerHTML)
await page.evaluate(
  ({ logo, paliers, ceintures, ecran, drapeauFrance, drapeauSuisse }) => {
    document.body.style.margin = '0'
    document.body.innerHTML = `
    <div style="position:relative;width:1024px;height:500px;overflow:hidden;background:#fff;color:#2b2b2b;font-family:'Source Sans Pro',sans-serif">
      <style>.logo-entete,.logo-entete span{overflow:visible!important;text-overflow:clip!important;white-space:nowrap!important;flex:none!important}</style>
      <div style="position:absolute;left:48px;top:128px;width:490px">
        <div style="zoom:1.75;margin-left:-8px">${logo}</div>
        <p style="margin:24px 0 0;font-size:30px;line-height:1.25;font-weight:600">Parcours d’exercices de maths corrigés</p>
        <div style="margin-top:14px;font-size:22px;line-height:1.35;color:#6b6b6b">
          <div style="display:flex;align-items:center;gap:12px">${drapeauFrance}<span>France : de la 6e à la Terminale</span></div>
          <div style="display:flex;align-items:center;gap:12px;margin-top:4px">${drapeauSuisse}<span>Suisse romande : de la 9e à la 4e du Collège</span></div>
          <div style="margin-top:8px">Fonctionne hors ligne</div>
        </div>
      </div>
      <img src="${paliers}" style="${ecran};left:566px;top:46px">
      <img src="${ceintures}" style="${ecran};left:792px;top:84px">
    </div>`
  },
  { logo, paliers: image('telephone-2-paliers.png'), ceintures: image('telephone-3-ceintures.png'), ecran, drapeauFrance, drapeauSuisse },
)
await page.waitForTimeout(800)
await page.screenshot({ path: `${dossier}/image-de-presentation.png`, clip: { x: 0, y: 0, width: 1024, height: 500 } })
await nav.close()
