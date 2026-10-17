// Captures de l'espace enseignant en clair et en sombre, à 390 px (pnpm dev).
//   node e2e/captures-enseignant.mjs <dossier>
import { chromium } from 'playwright'
const sortie = process.argv[2]
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const p = (id, titre, classes) => ({ parcours: { id, version: 2, titre, objectif: '', niveau: '4e', theme: 'Fractions', difficulte: 1, icone: 'bx-book-content', presentation: 'un_exo_par_page', correction: 'page', etapes: [{ uuid: '5f429', id: '4C21', titre: 'Additionner', nbQuestions: 2 }] }, classes, exportee: { '3e A': 1 } })
const bib = { lien: 'https://kdrive.infomaniak.com/app/share/1/abc', classes: [{ nom: '3e A' }, { nom: '3e B' }], parcours: [p('fractions', 'Fractions express', ['3e A', '3e B']), p('relatifs', 'Relatifs', ['3e A'])] }
for (const theme of ['clair', 'sombre']) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript(({ bib, theme }) => {
    localStorage.setItem('theme', theme)
    localStorage.setItem('copie:profil', '"enseignant"')
    localStorage.setItem('copie:bibliotheque', JSON.stringify(bib))
  }, { bib, theme })
  const page = await ctx.newPage()
  await page.goto('http://localhost:1420/')
  await page.getByRole('tab', { name: 'Parcours', exact: true }).waitFor()
  await page.screenshot({ path: `${sortie}/ens-accueil-${theme}.png` })
  await page.getByRole('tab', { name: 'Classes', exact: true }).click()
  await page.screenshot({ path: `${sortie}/ens-classes-${theme}.png` })
  await page.getByRole('tab', { name: 'Objectifs', exact: true }).click()
  await page.screenshot({ path: `${sortie}/ens-objectifs-${theme}.png` })
  await page.getByRole('tab', { name: 'Parcours', exact: true }).click()
  await page.getByRole('button', { name: /Éditer un parcours existant/ }).click()
  await page.screenshot({ path: `${sortie}/ens-editer-${theme}.png` })
  await page.getByRole('button', { name: 'Revenir en arrière' }).click()
  await page.getByRole('button', { name: /^Fractions express/ }).click()
  await page.getByRole('button', { name: 'Autres actions' }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${sortie}/ens-editeur-bas-${theme}.png` })
  await ctx.close()
}
await nav.close()
