// Captures de la fiche des boutiques (Google Play, App Store), parcours de
// démonstration (static/demo), thème clair (pnpm dev). Trois formats :
// téléphone 1620 × 2880, tablette 7 pouces 1440 × 2304, tablette 10 pouces
// 1600 × 2560 (Google : côté de 320 à 3840 px, rapport 2 au plus).
// App Store : iPhone 6,9 pouces 1320 × 2868, iPad 13 pouces 2064 × 2752
// (tailles exactes exigées par Apple).
//   node e2e/fiche-play.mjs <dossier>          # formats de Google Play
//   APPAREILS=telephone node e2e/fiche-play.mjs <dossier>
//   APPAREILS=iphone-6-9,ipad-13 node e2e/fiche-play.mjs <dossier>
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { SANS_BRIDAGE } from './attente.mjs'

const sortie = process.argv[2] ?? '.'
const base = process.env.BASE ?? 'http://localhost:1420/'
const demo = JSON.parse(readFileSync('static/demo/parcours-demonstration.json', 'utf8'))
const parcours = demo.classes.flatMap((c) => c.parcours)
const classe = { lien: 'https://kdrive.infomaniak.com/app/share/1/demo', nom: '5e A', disponibles: ['5e A'], parcours }
const r = (points, sur = 2) => ({ points, sur, complet: true, le: '2026-10-14T08:00:00Z', version: 1 })
const FORMATS = {
  telephone: { width: 405, height: 720, echelle: 4 },
  'tablette-7': { width: 600, height: 960, echelle: 2.4 },
  'tablette-10': { width: 800, height: 1280, echelle: 2 },
  'iphone-6-9': { width: 440, height: 956, echelle: 3 },
  'ipad-13': { width: 1032, height: 1376, echelle: 2 },
}
const choisis = process.env.APPAREILS?.split(',') ?? ['telephone', 'tablette-7', 'tablette-10']
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })
let format

async function appareil(stockage, theme = 'clair') {
  const { width, height, echelle } = FORMATS[format]
  const ctx = await nav.newContext({ viewport: { width, height }, deviceScaleFactor: echelle, isMobile: true, hasTouch: true })
  await ctx.route('**/*', (q) => (['localhost', '127.0.0.1'].includes(new URL(q.request().url()).hostname) ? q.continue() : q.abort()))
  await ctx.addInitScript(
    ({ stockage, theme }) => {
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      localStorage.setItem('theme', theme)
      for (const [cle, valeur] of Object.entries(stockage)) localStorage.setItem(`copie:${cle}`, JSON.stringify(valeur))
    },
    { stockage, theme },
  )
  const page = await ctx.newPage()
  await page.goto(base)
  return page
}
const cap = async (page, nom) => (await page.waitForTimeout(600), page.screenshot({ path: `${sortie}/${format}-${nom}.png` }))

// Résultats de l'élève : ceinture orange obtenue, verte à revoir ; palier 1
// réussi, palier 2 en cours
const resultats = {
  'resultats:relatifs-ceintures-5e@1': { 0: r(2), 1: r(1) },
  'resultats:relatifs-paliers-5e@1': { 0: r(2), 1: r(2), 2: r(1) },
  'resultats:relatifs-5e@1': { 0: r(3, 3), 1: r(2, 3), 2: r(3, 3) },
}
for (format of choisis) {
  // Élève : accueil, ceintures en cours, une question
  const e = await appareil({ profil: 'eleve', pays: 'FR', classes: [classe], ...resultats })
  await e.getByRole('button', { name: /^Relatifs en ceintures/ }).first().waitFor()
  await cap(e, '1-accueil')
  await e.getByRole('button', { name: /^Relatifs en ceintures/ }).first().click()
  await e.waitForTimeout(800)
  await cap(e, '3-ceintures')
  await e.getByRole('button', { name: 'Revenir en arrière' }).click()
  await e.getByRole('button', { name: /^Relatifs par paliers/ }).first().click()
  await e.waitForTimeout(800)
  await cap(e, '2-paliers')
  await e.getByRole('button', { name: 'Revenir en arrière' }).click()
  await e.getByRole('button', { name: /^Fractions/ }).first().click()
  await e.getByRole('button', { name: 'Commencer', exact: true }).click()
  await e.locator('main math-field').first().waitFor({ timeout: 20000 })
  await cap(e, '4-question')
  await e.context().close()

  // Session partagée : code et QR code, à montrer à la classe
  const s = await appareil({ profil: 'eleve', pays: 'FR', classes: [classe], ...resultats })
  await s.getByRole('button', { name: /^\s*Nombres relatifs/ }).first().click({ timeout: 60_000 })
  await s.getByRole('button', { name: 'Autres actions' }).click()
  await s.getByRole('button', { name: 'Session partagée' }).click()
  await cap(s, '5-session')
  await s.getByRole('button', { name: 'Afficher le QR code de la session' }).click()
  await s.locator('.qr-session').waitFor()
  await cap(s, '6-qr-session')
  await s.context().close()
}
await nav.close()
