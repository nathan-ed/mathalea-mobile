// Bouton retour du téléphone (simulé par « précédent » du navigateur) : chaque
// niveau se referme, la séance et l'éditeur demandent confirmation.
// Prérequis : comme complet.mjs (pnpm dev, dossier partagé local avec « test »).
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
const lienTest = 'http://127.0.0.1:8702/s/Xk42demo/test/'
let echecs = 0
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
const erreurs = []
page.on('pageerror', (e) => erreurs.push(e.message))
const retour = async () => {
  await page.goBack({ waitUntil: 'commit' }).catch(() => {})
  await page.waitForTimeout(300)
}
const visible = (role, name) => page.getByRole(role, { name }).first().isVisible()

await page.goto(base)
await page.getByRole('button', { name: /France/ }).click()
await page.getByRole('button', { name: /Élève/ }).click()
await page.getByLabel('Lien de partage donné par ton enseignant').fill(lienTest)
await page.getByRole('button', { name: 'Ajouter le dossier' }).click()
await page.getByRole('button', { name: /^\s*Classe test/ }).click()
await page.getByRole('button', { name: /^\s*Nombres relatifs/ }).first().waitFor()

// Détail d'un parcours → accueil
await page.getByRole('button', { name: /^\s*Nombres relatifs/ }).first().click()
await page.getByRole('button', { name: /Commencer|Continuer/ }).first().waitFor()
await retour()
ok(await visible('tab', 'Mes parcours'), 'détail → accueil')
ok(page.url() === base, `adresse inchangée (${page.url()})`)

// Onglet Explorer → Mes parcours
await page.getByRole('tab', { name: 'Explorer' }).click()
await retour()
ok((await page.getByRole('tab', { name: 'Mes parcours' }).getAttribute('aria-selected')) === 'true', 'Explorer → Mes parcours')

// Séance : retour demande confirmation, un second retour la referme
await page.getByRole('button', { name: /^\s*Nombres relatifs/ }).first().click()
await page.getByRole('button', { name: /Commencer|Continuer/ }).first().click()
await page.locator('main math-field, main input').first().waitFor()
await retour()
ok(await page.getByText('Quitter l’activité ?').isVisible(), 'séance : confirmation au retour')
await retour()
ok(!(await page.getByText('Quitter l’activité ?').isVisible()) && (await page.locator('main math-field, main input').first().isVisible()), 'séance : second retour, on reste')
await retour()
await page.getByRole('button', { name: 'Quitter', exact: true }).click()
await page.waitForTimeout(300)
ok(await visible('tab', 'Mes parcours'), 'séance quittée → accueil')

// Réglages → accueil, puis plus rien à refermer
await page.getByRole('button', { name: 'Réglages' }).click()
await retour()
ok(await visible('tab', 'Mes parcours'), 'réglages → accueil')
const longueur = await page.evaluate(() => history.length)
const etat = await page.evaluate(() => JSON.stringify(history.state))
ok(!etat.includes('"retour":true'), `accueil : aucune entrée de retour en attente (${longueur}, ${etat})`)

ok(erreurs.length === 0, `aucune erreur JavaScript ${erreurs.join(' | ')}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
