// Jetable : capture de toutes les fiches du catalogue Explorer (paliers ouverts),
// en clair et en sombre à 390 px ; signale formules coupées et défilement horizontal.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { chromium } from 'playwright'

const base = 'http://localhost:1421/'
const dossier = process.env.CAPTURES ?? '/tmp/sonde-explog/captures/fiches'
mkdirSync(dossier, { recursive: true })
const catalogue = JSON.parse(readFileSync(new URL('../explorer/ch-4e-college.json', import.meta.url), 'utf8'))
for (const p of catalogue.classes[0].parcours) for (const pl of p.paliers) delete pl.acces
const serveur = createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'application/json' })
  res.end(JSON.stringify(catalogue))
}).listen(8703, '127.0.0.1')
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const problemes = []
const mesures = []
const themes = (process.env.THEMES ?? 'clair,sombre').split(',')
const seulement = process.env.PARCOURS

for (const theme of themes) {
  for (const [ip, p] of catalogue.classes[0].parcours.entries()) {
    if (seulement && !p.id.includes(seulement)) continue
    for (const [k, pl] of p.paliers.entries()) {
      const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
      await ctx.addInitScript((theme) => {
        if (sessionStorage.getItem('pret')) return
        sessionStorage.setItem('pret', '1')
        localStorage.setItem('theme', theme)
        localStorage.setItem('copie:profil', '"eleve"')
        localStorage.setItem('copie:pays', '"CH"')
      }, theme)
      const page = await ctx.newPage()
      page.on('pageerror', (e) => problemes.push(`${pl.titre}: erreur ${e.message}`))
      await page.goto(base)
      await page.getByRole('tab', { name: 'Explorer', exact: true }).or(page.getByRole('button', { name: 'Explorer', exact: true })).first().click()
      await page.getByRole('button', { name: /^4e Collège/ }).click({ timeout: 60_000 })
      await page.getByRole('button', { name: new RegExp('^' + p.theme) }).click()
      await page.getByRole('button', { name: new RegExp('^' + p.titre) }).click()
      const fiche = page.getByRole('button', { name: `Fiche : ${pl.titre}`, exact: true })
      if (!(await fiche.count())) {
        problemes.push(`${pl.titre}: bouton de fiche introuvable`)
        await ctx.close()
        continue
      }
      await fiche.click()
      await page.waitForTimeout(1500)
      // Dévoiler toutes les étapes des exemples
      for (let i = 0; i < 400; i++) {
        const b = page.getByRole('button', { name: /^(Voir la première étape|Étape suivante)$/ }).first()
        if (!(await b.count())) break
        await b.click()
      }
      await page.waitForTimeout(500)
      const mesure = await page.evaluate(() => {
        const coupees = []
        for (const k of document.querySelectorAll('main .katex')) {
          const r = k.getBoundingClientRect()
          let a = k.parentElement
          while (a && getComputedStyle(a).overflowX === 'visible') a = a.parentElement
          const ra = a ? a.getBoundingClientRect() : { right: innerWidth }
          const defile = a && ['auto', 'scroll'].includes(getComputedStyle(a).overflowX)
          if (r.right > ra.right + 1 || r.right > innerWidth || r.left < 0) coupees.push((defile ? '[défile] ' : '[COUPÉE] ') + k.textContent.slice(0, 60))
        }
        const brut = [...document.querySelectorAll('main p, main li')].map((e) => {
          const c = e.cloneNode(true)
          c.querySelectorAll('.katex').forEach((k) => k.remove())
          return c.textContent
        }).filter((t) => /\$|\\[a-z]+\{|\*\*|\[\[FIGURE/.test(t))
        const larges = [...document.querySelectorAll('main .formule-centree')].map((f) => {
          const tex = f.querySelector('annotation')?.textContent ?? ''
          return { tex, w: f.scrollWidth, c: f.clientWidth, lignes: [...f.querySelectorAll('.katex-html > .katex-base, .katex-html .mtable .col-align-r > .vlist-t, .katex-html .mtable .col-align-l > .vlist-t, .katex-html .mtable .col-align-c > .vlist-t')].map((x) => x.getBoundingClientRect().width) }
        })
        return { larges, coupees, brut, horiz: document.documentElement.scrollWidth > innerWidth + 1 }
      })
      mesures.push(...mesure.larges)
      for (const c of mesure.coupees) problemes.push(`${pl.titre} (${theme}) : formule coupée « ${c} »`)
      for (const c of mesure.brut) problemes.push(`${pl.titre} (${theme}) : texte brut « ${c.slice(0, 80)} »`)
      if (mesure.horiz) problemes.push(`${pl.titre} (${theme}) : défilement horizontal`)
      await page.screenshot({ path: `${dossier}/${ip + 1}-${String(k + 1).padStart(2, '0')}-${theme}.png`, fullPage: true })
      await ctx.close()
    }
  }
}
await nav.close()
serveur.close()
writeFileSync('/tmp/sonde-explog/largeurs.json', JSON.stringify(mesures))
for (const x of [...new Set(problemes)]) console.log('✘', x)
console.log(problemes.length ? `${problemes.length} problème(s)` : 'RIEN À SIGNALER')
