// Recherche d'exercices dans l'éditeur (pnpm dev seulement) : la liste suit
// chaque frappe. Le référentiel range parfois un même exercice à plusieurs
// endroits (même uuid) ; un doublon figeait la liste sur la première lettre
// (« Dériver » montrait canc3D01, « Lire l'heure »).
//   node e2e/recherche.mjs
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
await ctx.addInitScript(() => {
  if (sessionStorage.getItem('pret')) return
  sessionStorage.setItem('pret', '1')
  localStorage.setItem('copie:profil', JSON.stringify('enseignant'))
  localStorage.setItem('copie:pays', JSON.stringify('FR'))
})
const page = await ctx.newPage()
page.on('pageerror', (e) => erreurs.push(e.message))
page.on('console', (m) => m.type() === 'error' && /each_key_duplicate|duplicate key/.test(m.text()) && erreurs.push(m.text().split('\n')[0]))
await page.goto(base)
await page.getByRole('button', { name: /Créer un parcours|Nouveau parcours/ }).first().click({ timeout: 60_000 })
await page.getByRole('button', { name: /Ajouter des exercices/ }).first().click({ timeout: 30_000 })
const champ = page.getByRole('searchbox')
await champ.waitFor({ timeout: 60_000 })
await page.waitForTimeout(1500)
const ids = async () => page.locator('main li .font-bold').allInnerTexts()

// Frappe lettre par lettre, comme au clavier
await champ.click()
for (const c of 'Dériver') await page.keyboard.type(c, { delay: 80 })
await page.waitForTimeout(500)
const derive = await ids()
ok(/^(1AN|BP1FDEV)/.test(derive[0] ?? '') && derive.every((id) => !id.startsWith('canc3D')), `« Dériver » : exercices de dérivation (${derive.slice(0, 3).join(', ')})`)
ok(new Set(derive).size === derive.length, 'aucun exercice en double')
await champ.fill('polynome')
await page.waitForTimeout(400)
ok((await page.locator('main').innerText()).includes('Dériver un polynôme'), '« polynome » : la liste suit la nouvelle recherche')
await champ.fill('')

// Chaque nœud du menu (niveau, chapitre, sous-chapitre…) s'ouvre et montre
// quelque chose (un doublon empêchait d'ouvrir « Fonctions » en Seconde)
const titres = async () => page.locator('main button .font-bold, main button h3').allInnerTexts()
// Tuiles de nœuds (chevron vers la droite), pas les exercices
const noeuds = async () => page.locator('main button:has(.bx-chevron-right) .font-bold').allInnerTexts()
const niveaux = await noeuds()
let fermes = []
let ouverts = 0
const explorer = async (chemin) => {
  const liste = await noeuds()
  for (const [i, c] of liste.entries()) {
    const avant = erreurs.length
    await page.locator('main button:has(.bx-chevron-right)').nth(i).click()
    ouverts++
    const nb = await page.locator('main li, main button:has(.bx-chevron-right)').count()
    if (!nb || erreurs.length > avant) fermes.push([...chemin, c].join(' / '))
    await explorer([...chemin, c])
    await page.goBack()
    await page.waitForTimeout(80)
    const titre = (await page.locator('h1:visible').last().innerText()).replace(/\s+/g, ' ')
    if (titre !== (chemin.at(-1) ?? 'Ajouter des exercices').replace(/\s+/g, ' ').trim()) throw new Error(`retour depuis ${[...chemin, c].join(' / ')} : « ${titre} »`)
  }
}
await explorer([])
ok(niveaux.length > 5, `${niveaux.length} niveaux, ${ouverts} nœuds parcourus`)
ok(fermes.length === 0, `tous les chapitres s'ouvrent${fermes.length ? ' sauf : ' + fermes.join(', ') : ''}`)
ok(!niveaux.some((n) => /Égalité/.test(n)), '« Égalité filles-garçons » rangé à part, comme sur le site')

// Comme sur le site : aussi les exercices non interactifs (3Z1, « Exercices de synthèse »)
await page.getByRole('button', { name: /^Troisième/ }).first().click()
ok((await titres()).some((t) => t.endsWith('Exercices de synthèse')), '3e : « Exercices de synthèse » (non interactif) proposé')
await page.goBack()
await page.waitForTimeout(200)
await ctx.close()

// Suisse : référentiel CH, chapitres non interactifs compris
{
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript(() => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('copie:profil', JSON.stringify('enseignant'))
    localStorage.setItem('copie:pays', JSON.stringify('CH'))
  })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(e.message))
  await page.goto(base)
  await page.getByRole('button', { name: /Créer un parcours|Nouveau parcours/ }).first().click({ timeout: 60_000 })
  await page.getByRole('button', { name: /Ajouter des exercices/ }).first().click({ timeout: 30_000 })
  await page.getByRole('searchbox').waitFor({ timeout: 60_000 })
  await page.waitForTimeout(1500)
  const titresCH = async () => page.locator('main button .font-bold, main button h3').allInnerTexts()
  // Le niveau du parcours peut être ouvert d'office : remonter aux niveaux
  if (!(await titresCH()).includes('2e Collège')) await page.getByRole('button', { name: /Retour/ }).first().click().catch(() => {})
  await page.getByRole('button', { name: /^2e Collège/ }).first().click()
  ok((await titresCH()).some((t) => t.endsWith('Équations cartésiennes')), 'Suisse, 2e Collège : « Équations cartésiennes » (non interactif) proposé')
  await ctx.close()
}

ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
