// Captures de la fiche des boutiques (Google Play, App Store) : 1080 × 1920,
// parcours de démonstration (static/demo), thème clair (pnpm dev).
//   node e2e/fiche-play.mjs <dossier>
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const sortie = process.argv[2] ?? '.'
const base = 'http://localhost:1420/'
const demo = JSON.parse(readFileSync('static/demo/parcours-demonstration.json', 'utf8'))
const parcours = demo.classes.flatMap((c) => c.parcours)
const classe = { lien: 'https://kdrive.infomaniak.com/app/share/1/demo', nom: '5e A', disponibles: ['5e A'], parcours }
const r = (points, sur = 3) => ({ points, sur, complet: true, le: '2026-10-14T08:00:00Z', version: 1 })
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })

async function appareil(stockage, theme = 'clair') {
  const ctx = await nav.newContext({ viewport: { width: 405, height: 720 }, deviceScaleFactor: 1080 / 405, isMobile: true, hasTouch: true })
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
const cap = async (page, nom) => (await page.waitForTimeout(500), page.screenshot({ path: `${sortie}/${nom}.png` }))

// Élève : accueil, ceintures en cours, une question
const resultats = {
  'resultats:relatifs-ceintures-5e@1': { 0: r(3), 1: r(2) },
  'resultats:relatifs-5e@1': { 0: r(3), 1: r(2), 2: r(3) },
}
const e = await appareil({ profil: 'eleve', pays: 'FR', classes: [classe], ...resultats })
await e.getByRole('button', { name: /^Relatifs en ceintures/ }).first().waitFor()
await cap(e, '1-accueil')
await e.getByRole('button', { name: /^Relatifs en ceintures/ }).first().click()
await e.waitForTimeout(800)
await cap(e, '2-ceintures')
await e.getByRole('button', { name: 'Revenir en arrière' }).click()
await e.getByRole('button', { name: /^Fractions/ }).first().click()
await e.getByRole('button', { name: 'Commencer', exact: true }).click()
await e.locator('main math-field').first().waitFor({ timeout: 20000 })
await cap(e, '3-question')
await e.context().close()

// Enseignant : bibliothèque, éditeur d'un parcours en paliers
const bibliotheque = {
  lien: classe.lien,
  classes: [{ nom: '5e A' }, { nom: '4e B' }],
  parcours: parcours.map((p) => ({ parcours: p, classes: [p.niveau === '4e' ? '4e B' : '5e A'], exportee: { '5e A': 1, '4e B': 1 } })),
}
const t = await appareil({ profil: 'enseignant', pays: 'FR', bibliotheque })
await t.getByRole('button', { name: /^Relatifs par paliers/ }).waitFor()
await cap(t, '4-bibliotheque')
await t.getByRole('button', { name: /^Relatifs par paliers/ }).click()
await t.waitForTimeout(800)
// Les paliers en haut de l'écran
await t.getByLabel('Palier 1 : titre vu par les élèves').evaluate((el) => (el.closest('section')?.scrollIntoView({ block: 'start' }), scrollBy(0, -90)))
await cap(t, '5-editeur')
await t.context().close()
await nav.close()
