// Couleurs des réponses (pnpm dev seulement) : quand la réponse est correcte,
// la réponse mise en évidence dans la correction passe en vert ; incorrecte,
// elle reste orange (Nathan, 31 octobre 2026). Vraie saisie au clavier,
// correction à chaque question, clair et sombre. Pastilles du bilan :
// test-niveau.mjs.
//   CAPTURES=<dossier> node e2e/couleurs-reponse.mjs
import { chromium } from 'playwright'
import { incoherencesVert } from './couleurs-verdict.mjs'

const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })

// Deux questions à un champ dans une figure (bande de mesure, CAN 6e 2026)
const etape = { uuid: '098c5', id: 'can6a-2026', titre: 'CAN 6e sujet 2026', nbQuestions: 1, sup: 'false', sup2: '4', sup3: 'false' }
const p = { id: 'couleurs', version: 1, titre: 'Couleurs', objectif: '', niveau: '6e', theme: 'CAN', difficulte: 1, icone: 'bx-timer', presentation: 'une_question_par_page', correction: 'question', enTetesMasques: true, etapes: [etape, etape] }

for (const theme of ['clair', 'sombre']) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await ctx.addInitScript(
    ({ p, theme }) => {
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      localStorage.setItem('theme', theme)
      localStorage.setItem('copie:profil', JSON.stringify('eleve'))
      localStorage.setItem('copie:ajoutes', JSON.stringify([p]))
    },
    { p, theme },
  )
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${theme}: ${e.message}`))
  await page.goto(base)
  await page.getByRole('button', { name: /^Couleurs/ }).first().click()
  await page.getByRole('button', { name: /^Commencer/ }).first().click()
  await page.getByRole('tablist', { name: 'Questions' }).waitFor({ timeout: 120_000 })
  const attendues = await page.evaluate(async () => {
    const s = JSON.parse(localStorage.getItem('copie:seance:couleurs'))
    const man = await (await fetch('/moteur/manifest.json')).json()
    const m = await import('/moteur/' + man.entree)
    const r = []
    for (const n of [0, 1]) {
      const ex = await m.preparerExercice({ ...s.contenu.etapes[n], alea: s.graines[n] }, 90 + n)
      r.push(ex.interne.autoCorrection[0].valeur.field0.value)
    }
    return r
  })
  // Question 1 juste, question 2 fausse
  for (const [i, saisie] of [
    [0, String(attendues[0])],
    [1, String(Number(attendues[1]) + 7)],
  ]) {
    await page.getByRole('tablist', { name: 'Questions' }).getByRole('tab').nth(i).click()
    await page.waitForTimeout(800)
    await page.locator('main math-field[id^="MetaInteractif2dEx"]').first().click()
    await page.keyboard.type(saisie)
    await page.waitForTimeout(500)
    await page.locator('footer').getByRole('button', { name: 'Vérifier', exact: true }).click()
    await page.waitForTimeout(1200)
    const couleur = await page.locator('main .correction-juste .mathbf, main .contenu-mathalea .mathbf').last().evaluate((c) => getComputedStyle(c).color)
    if (i === 0) ok(couleur === 'rgb(77, 134, 19)', `${theme} : réponse correcte, mise en évidence en vert (${couleur})`)
    else ok(couleur === 'rgb(241, 89, 41)', `${theme} : réponse incorrecte, mise en évidence orange (${couleur})`)
    const inc = await incoherencesVert(page)
    ok(inc.length === 0, `${theme} : vert d'accord avec le smiley de MathALÉA${inc.length ? ' (' + inc.join(' ; ') + ')' : ''}`)
    await page.screenshot({ path: `${captures}/couleurs-q${i + 1}-${theme}.png` })
  }
  await ctx.close()
}

ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
