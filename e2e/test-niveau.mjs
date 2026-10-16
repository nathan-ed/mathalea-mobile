// « Teste ton niveau » de bout en bout (pnpm dev seulement) : Explorer, niveaux,
// repérage, validation, ceinture, bouton retour. Les réponses sont écrites
// comme correctes dans la séance (les questions de CAN ont des formats très
// variés) ; tout le reste passe par l'interface. Captures à 390 px, en clair
// et en sombre.
//   CAPTURES=<dossier> node e2e/test-niveau.mjs
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const texte = async (page, sel = 'main') => (await page.locator(sel).innerText()).replace(/\s+/g, ' ')
const cap = async (page, n, theme) => (await page.waitForTimeout(400), page.screenshot({ path: `${captures}/test-niveau-${n}-${theme}.png` }))
const debordement = (page) => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)

/** Toutes les questions de la tentative en cours comptées correctes, puis reprise */
async function toutCorrect(page) {
  await page.evaluate(() => {
    const cle = Object.keys(localStorage).find((k) => k.startsWith('copie:seance:test-niveau-'))
    const s = JSON.parse(localStorage.getItem(cle))
    s.essais = s.etapes.flatMap((etape) =>
      Array.from({ length: s.nbQuestions[etape] }, (_, question) => ({ etape, question, juste: true, points: 1, total: 1, reponses: {}, le: new Date().toISOString() })),
    )
    localStorage.setItem(cle, JSON.stringify(s))
  })
}

async function seanceJusquAuBilan(page) {
  // Dernière question, où l'on soumet la tentative
  await page.getByRole('tablist', { name: 'Questions' }).getByRole('tab').last().click({ timeout: 120_000 })
  await page.getByRole('button', { name: 'Soumettre la tentative' }).click({ timeout: 120_000 })
  const garde = page.getByRole('button', { name: 'Soumettre quand même' })
  if (await garde.isVisible().catch(() => false)) await garde.click()
  await page.getByRole('button', { name: 'Voir le bilan' }).click({ timeout: 120_000 })
}

for (const theme of ['clair', 'sombre']) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript((theme) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('theme', theme)
    localStorage.setItem('copie:profil', JSON.stringify('eleve'))
    localStorage.setItem('copie:pays', JSON.stringify('CH'))
  }, theme)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${theme}: ${e.message}`))
  await page.goto(base)

  // Explorer : la tuile, même sans catalogue
  await page.getByRole('tab', { name: 'Explorer' }).or(page.getByRole('button', { name: 'Explorer' })).first().click()
  const tuile = page.getByRole('button', { name: /^Teste ton niveau/ })
  await tuile.waitFor({ timeout: 60_000 })
  await cap(page, '1-explorer', theme)
  await tuile.click()
  await page.getByRole('button', { name: /^6e · ceinture orange/ }).waitFor({ timeout: 60_000 })
  const niveaux = await texte(page)
  ok(['CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Terminale'].every((n) => niveaux.includes(`${n} · ceinture`)), `${theme} : neuf niveaux, en Suisse aussi`)
  ok(niveaux.includes('Commence ici'), `${theme} : niveau proposé`)
  ok(!(await debordement(page)), `${theme} : pas de débordement (niveaux)`)
  await cap(page, '2-niveaux', theme)

  // Repérage
  await page.getByRole('button', { name: /^6e · ceinture orange/ }).click()
  await cap(page, '3-feuille', theme)
  await page.getByRole('dialog').getByRole('button', { name: 'Commencer' }).click()
  await page.locator('main math-field, main .bx').first().waitFor({ timeout: 120_000 })
  await page.getByRole('tablist', { name: 'Questions' }).waitFor({ timeout: 120_000 })
  const onglets = await page.getByRole('tablist', { name: 'Questions' }).getByRole('tab').count()
  ok(onglets === 10, `${theme} : 10 questions de repérage (${onglets})`)
  ok((await page.locator('main h1').count()) === 0, `${theme} : aucun en-tête d'exercice`)
  await cap(page, '4-question', theme)

  // Quitter, puis reprendre avec toutes les réponses correctes
  await page.getByRole('button', { name: 'Quitter' }).click()
  await page.getByRole('button', { name: /Reprendre plus tard|Plus tard/ }).first().click()
  await page.getByRole('button', { name: /^6e · ceinture orange/ }).waitFor()
  ok((await texte(page)).includes('En cours'), `${theme} : tentative en cours signalée`)
  await toutCorrect(page)
  await page.reload()
  await page.getByRole('tab', { name: 'Explorer' }).or(page.getByRole('button', { name: 'Explorer' })).first().click()
  await page.getByRole('button', { name: /^Teste ton niveau/ }).click()
  await page.getByRole('button', { name: /^6e · ceinture orange/ }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Reprendre' }).click()
  await seanceJusquAuBilan(page)
  ok((await texte(page)).includes('Repérage réussi'), `${theme} : repérage réussi`)
  await cap(page, '5-bilan-reperage', theme)

  // Validation
  await page.getByRole('button', { name: 'Passer la validation' }).click()
  await page.getByRole('tablist', { name: 'Questions' }).waitFor({ timeout: 120_000 })
  const onglets2 = await page.getByRole('tablist', { name: 'Questions' }).getByRole('tab').count()
  ok(onglets2 === 20, `${theme} : 20 questions de validation (${onglets2})`)
  await toutCorrect(page)
  await page.reload()
  await page.getByRole('tab', { name: 'Explorer' }).or(page.getByRole('button', { name: 'Explorer' })).first().click()
  await page.getByRole('button', { name: /^Teste ton niveau/ }).click()
  await page.getByRole('button', { name: /^6e · ceinture orange/ }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Reprendre' }).click()
  await seanceJusquAuBilan(page)
  const verdict = await texte(page)
  ok(verdict.includes('Ceinture orange obtenue'), `${theme} : ceinture obtenue`)
  ok(verdict.includes('Niveau suivant : 5e'), `${theme} : niveau suivant proposé`)
  await cap(page, '6-bilan-validation', theme)

  await page.getByRole('button', { name: 'Retour aux niveaux' }).click()
  const apres = await texte(page)
  ok(apres.includes('Validé le'), `${theme} : niveau validé affiché`)
  ok(/5e · ceinture verte Commence ici/.test(apres), `${theme} : le niveau suivant est proposé`)
  await cap(page, '7-niveaux-apres', theme)

  // Bouton retour : vers l'Explorer, avec la ceinture dans la tuile
  await page.goBack()
  await page.getByRole('button', { name: /^Teste ton niveau/ }).waitFor()
  ok((await texte(page)).includes('Ceinture orange · 6e validé'), `${theme} : tuile avec la dernière ceinture`)
  await ctx.close()
}

ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
