// Reprendre une session partagée (pnpm dev seulement, sans le serveur de
// dossier qui remplace l'Explorer). Un élève rejoint une session par son code,
// répond à une question, touche « Reprendre plus tard », puis rejoint de nouveau
// la même session : ses réponses sont toujours là (elles étaient effacées). La
// fiche d'un parcours de l'Explorer non ajouté à l'accueil propose « Continuer »
// pour une tentative en cours (elle proposait « Commencer »).
import { chromium } from 'playwright'

let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
// Code de session sans QR code de réponses (voir reglageQr) : correction à chaque question
const code = 'abcdj'
const p = {
  id: 'reprise', version: 1, titre: 'Reprise de session', objectif: '', niveau: '6e', theme: 'Calcul', difficulte: 1, icone: 'bx-calculator',
  presentation: 'une_question_par_page', correction: 'question',
  etapes: [{ uuid: '385b7', id: 'canc3C01', titre: 'Calcul', nbQuestions: 3 }],
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
await ctx.addInitScript((p) => {
  if (sessionStorage.getItem('pret')) return
  sessionStorage.setItem('pret', '1')
  localStorage.setItem('copie:profil', JSON.stringify('eleve'))
  localStorage.setItem('copie:pays', JSON.stringify('FR'))
  localStorage.setItem('copie:explorer', JSON.stringify([p]))
}, p)
const page = await ctx.newPage()
page.on('pageerror', (e) => erreurs.push(e.message))
const essais = () => page.evaluate(() => JSON.parse(localStorage.getItem('copie:seance:reprise')).essais.length)
await page.goto('http://localhost:1420/')
await page.getByRole('tab', { name: 'Explorer' }).or(page.getByRole('button', { name: 'Explorer' })).first().click({ timeout: 60_000 })
await page.getByText('6e').first().click().catch(() => {})
await page.getByRole('button', { name: /^Reprise de session/ }).first().click({ timeout: 30_000 })
async function rejoindre() {
  await page.getByRole('button', { name: /Autres actions/ }).first().click()
  await page.getByRole('button', { name: /Rejoindre une session/ }).click()
  await page.getByLabel(/[Cc]ode/).first().fill(code)
  await page.getByRole('button', { name: 'Rejoindre la session' }).click()
  await page.locator('main math-field').first().waitFor({ timeout: 60_000 })
  await page.waitForTimeout(1000)
}
await rejoindre()
await page.locator('main math-field').first().click()
await page.waitForTimeout(300)
await page.keyboard.type('7')
await page.getByRole('button', { name: 'Vérifier', exact: true }).click()
await page.waitForTimeout(800)
ok((await essais()) === 1, 'session : une question vérifiée')
await page.getByRole('button', { name: 'Quitter' }).click()
await page.getByRole('button', { name: 'Reprendre plus tard' }).click()
await page.waitForTimeout(800)
ok(await page.getByRole('button', { name: 'Continuer', exact: true }).isVisible(), 'fiche (Explorer, non ajouté) : « Continuer » pour la tentative en cours')
await rejoindre()
ok((await essais()) === 1, 'même session rejointe de nouveau : la réponse donnée est gardée')
ok((await page.getByRole('tablist', { name: 'Questions' }).getByRole('tab').first().getAttribute('aria-label'))?.includes('correcte'), 'question 1 toujours vérifiée')
ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
