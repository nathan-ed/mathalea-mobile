// Exercice non interactif (à faire sur papier) dans une séance, au toucher,
// sur téléphone et bureau, avec correction à chaque question puis à la fin :
// figure à main levée complète, « Voir la correction », hors du score et des
// questions passées, bilan « Correction vue » (pnpm dev seulement).
//   CAPTURES=<dossier> THEME=clair|sombre node e2e/papier.mjs
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const texte = async (page) => (await page.locator('main').innerText()).replace(/\s+/g, ' ')
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })

const appareils = [
  { nom: 'telephone', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { nom: 'bureau', viewport: { width: 1200, height: 800 }, isMobile: false, hasTouch: false },
]

for (const correction of ['question', 'parcours']) {
  for (const a of appareils) {
    const nom = `${a.nom}, correction ${correction === 'question' ? 'à chaque question' : 'à la fin'}`
    const p = {
      id: 'papier-essai', version: 1, titre: 'Parcours papier', objectif: '', niveau: '6e', theme: 'Géométrie', difficulte: 1, icone: 'bx-shape-triangle',
      presentation: 'une_question_par_page', correction,
      etapes: [
        { uuid: 'e8f0b', id: '6G0-3', titre: 'Utiliser le codage pour décrire ou illustrer une figure', nbQuestions: 2 },
        { uuid: '098c5', id: 'can6a-2026', titre: 'Calcul', nbQuestions: 1, sup: 'false', sup2: '1', sup3: 'false' },
      ],
    }
    const ctx = await nav.newContext({ viewport: a.viewport, isMobile: a.isMobile, hasTouch: a.hasTouch })
    await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
    await ctx.addInitScript(([p, theme]) => {
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      localStorage.setItem('theme', theme)
      localStorage.setItem('copie:profil', JSON.stringify('eleve'))
      localStorage.setItem('copie:pays', JSON.stringify('FR'))
      localStorage.setItem('copie:explorer', JSON.stringify([p]))
    }, [p, process.env.THEME ?? 'clair'])
    const page = await ctx.newPage()
    page.on('pageerror', (e) => erreurs.push(`${nom} : ${e.message}`))
    await page.goto(base)
    await page.getByRole('tab', { name: 'Explorer' }).or(page.getByRole('button', { name: 'Explorer' })).first().click({ timeout: 60_000 })
    await page.getByText('6e').first().click().catch(() => {})
    await page.getByRole('button', { name: /^Géométrie/ }).first().click()
    await page.getByRole('button', { name: /^Parcours papier/ }).first().click({ timeout: 30_000 })
    await page.getByRole('button', { name: /^Commencer/ }).first().click()
    const voir = page.getByRole('button', { name: 'Voir la correction' }).filter({ visible: true })
    await voir.first().waitFor({ timeout: 120_000 })

    // Questions 1 et 2 : sur papier
    for (const q of [1, 2]) {
      const traits = await page.locator('main svg.mathalea2d').first().locator('path, line, polyline, polygon').count()
      ok(traits > 0, `${nom} : question ${q}, segments de la figure tracés (${traits})`)
      if (q === 1 && correction === 'question') ok((await page.locator('header').first().innerText()).includes('0/1'), `${nom} : le score ne compte que la question à réponse`)
      ok(!(await texte(page)).includes('Correction'), `${nom} : question ${q}, correction cachée avant le toucher`)
      await voir.first().click()
      await page.waitForTimeout(600)
      ok((await texte(page)).includes('Correction') && (await voir.count()) === 0, `${nom} : question ${q}, correction ouverte`)
      if (q === 1) await page.screenshot({ path: `${captures}/papier-${a.nom}-${correction}-${process.env.THEME ?? 'clair'}-correction.png`, fullPage: true })
      await page.getByRole('button', { name: 'Question suivante' }).filter({ visible: true }).click()
      await page.waitForTimeout(800)
    }

    // Question 3 : réponse au clavier de MathALÉA
    const champ = page.locator('main math-field').first()
    await champ.waitFor({ timeout: 60_000 })
    const clavier = page.locator('#mathalea-virtual-keyboard')
    for (let r = 0; r < 10; r++) {
      await champ.click()
      await page.waitForTimeout(300)
      if (await clavier.getByRole('button', { name: '9', exact: true }).count()) await clavier.getByRole('button', { name: '9', exact: true }).first().click()
      else await page.keyboard.type('9')
      await page.waitForTimeout(400)
      if ((await page.evaluate(() => document.querySelector('main math-field')?.getPromptValue?.('champ1') ?? '')) !== '') break
    }
    if (correction === 'question') {
      const verifier = page.getByRole('button', { name: 'Vérifier' }).filter({ visible: true }).last()
      ok(await verifier.isEnabled(), `${nom} : « Vérifier » actif après une réponse dans un trou`)
      await verifier.click()
      await page.getByRole('button', { name: 'Voir le bilan' }).filter({ visible: true }).click({ timeout: 30_000 })
    } else {
      await page.getByRole('button', { name: 'Soumettre la tentative' }).filter({ visible: true }).click()
      ok(!(await page.getByRole('dialog').count()), `${nom} : soumission sans avertissement (questions papier non comptées)`)
      await page.getByRole('button', { name: 'Soumettre quand même' }).click({ timeout: 3000 }).catch(() => {})
      await page.getByRole('button', { name: 'Voir le bilan' }).filter({ visible: true }).click({ timeout: 120_000 })
    }
    await page.waitForTimeout(800)
    const b = await texte(page)
    ok(/\b[01] \/ 1\b/.test(b), `${nom} : bilan sur la seule question à réponse`)
    ok(b.includes('Correction vue') && !/passée/.test(b), `${nom} : bilan « Correction vue », aucune question passée`)
    await page.screenshot({ path: `${captures}/papier-${a.nom}-${correction}-${process.env.THEME ?? 'clair'}-bilan.png`, fullPage: true })
    // Le détail de l'exercice papier montre sa correction
    await page.getByRole('button', { name: /Utiliser le codage/ }).first().click()
    await page.waitForTimeout(1500)
    ok((await page.locator('main').innerText()).split('Correction').length > 2, `${nom} : détail du bilan avec les corrections`)
    // Fiche du parcours : pas de pourcentage pour l'exercice papier
    await page.goBack()
    await page.waitForTimeout(800)
    const fiche = await texte(page)
    ok(!/NaN|Infinity/.test(fiche), `${nom} : fiche sans pourcentage impossible`)
    await page.goBack()
    await page.waitForTimeout(500)
    await page.getByRole('tab', { name: 'Suivi' }).or(page.getByRole('button', { name: 'Suivi' })).first().click()
    await page.waitForTimeout(800)
    const suivi = await texte(page)
    ok(suivi.includes('Parcours papier') && !/NaN|Infinity/.test(suivi), `${nom} : le parcours figure dans le suivi`)
    await ctx.close()
  }
}

ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
