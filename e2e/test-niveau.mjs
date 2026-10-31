// « Teste ton niveau » de bout en bout (pnpm dev seulement) : Explorer, niveaux,
// 15 questions, bilan direct, ceinture, bouton retour. Les réponses du test
// sont écrites comme correctes dans la séance (les questions de CAN ont des
// formats très variés) ; tout le reste passe par l'interface. En plus, une
// vraie saisie dans un champ placé dans une figure (bande de mesure de la
// CAN 6e 2026), corrigée à la fin. Captures à 390 px, en clair et en sombre.
//   CAPTURES=<dossier> node e2e/test-niveau.mjs
import { chromium } from 'playwright'
import { champsCoupes } from './champs-visibles.mjs'

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
  // Bilan direct : pas de page de relecture
  await page.getByText(/obtenue|Il faut/).first().waitFor({ timeout: 120_000 })
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
    // CM1 et CM2 déjà validés : la 6e est le niveau ouvert suivant
    const le = new Date().toISOString()
    localStorage.setItem('copie:test-niveau', JSON.stringify({ cm1: { valideLe: le }, cm2: { valideLe: le } }))
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
  ok(/6e · ceinture orange Commence ici/.test(niveaux), `${theme} : niveau proposé après les ceintures validées`)
  ok(await page.getByRole('button', { name: /^5e · ceinture verte/ }).isDisabled(), `${theme} : 5e fermée tant que la 6e n'est pas validée`)
  ok(/5e · ceinture verte Au moins 80 % à : ceinture orange/.test(niveaux), `${theme} : condition d'ouverture affichée`)
  ok(await page.getByRole('button', { name: /^CM1 · ceinture blanche/ }).isEnabled(), `${theme} : niveau validé toujours ouvert`)
  ok(!(await debordement(page)), `${theme} : pas de débordement (niveaux)`)
  await cap(page, '2-niveaux', theme)

  // Repérage
  await page.getByRole('button', { name: /^6e · ceinture orange/ }).click()
  await cap(page, '3-feuille', theme)
  await page.getByRole('dialog').getByRole('button', { name: 'Commencer' }).click()
  // Première question affichée, quel que soit son type de réponse (tirage au hasard)
  await page.locator('main math-field, main .bx, main input, main select').first().waitFor({ timeout: 120_000 })
  await page.getByRole('tablist', { name: 'Questions' }).waitFor({ timeout: 120_000 })
  const onglets = await page.getByRole('tablist', { name: 'Questions' }).getByRole('tab').count()
  ok(onglets === 15, `${theme} : 15 questions (${onglets})`)
  ok((await page.locator('main h1').count()) === 0, `${theme} : aucun en-tête d'exercice`)
  ok((await texte(page, 'body')).includes('Question 1 sur 15'), `${theme} : barre de progression`)
  ok((await texte(page, 'body')).includes('6e · ceinture orange'), `${theme} : ceinture du test en haut`)
  // Chaque question du tirage : champs de réponse entièrement visibles
  const coupes = []
  for (let i = 0; i < onglets; i++) {
    await page.getByRole('tablist', { name: 'Questions' }).getByRole('tab').nth(i).click()
    await page.waitForTimeout(500)
    coupes.push(...(await champsCoupes(page)).map((c) => `Q${i + 1} ${c}`))
  }
  ok(coupes.length === 0, `${theme} : champs de réponse entièrement visibles${coupes.length ? ` (${coupes.join(' ; ')})` : ''}`)
  await page.getByRole('tablist', { name: 'Questions' }).getByRole('tab').first().click()
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
  const verdict = await texte(page)
  ok(verdict.includes('Ceinture orange obtenue'), `${theme} : ceinture obtenue`)
  ok(verdict.includes('Niveau suivant : 5e'), `${theme} : niveau suivant proposé`)
  ok(verdict.includes('Question 15') && !verdict.includes('CAN 6e'), `${theme} : bilan par question, sans nom de sujet`)
  await page.getByRole('button', { name: /^Question 1 / }).click()
  await page.locator('main math-field, main .mathalea2d, main .katex').first().waitFor({ timeout: 60_000 })
  await cap(page, '5-bilan', theme)

  await page.getByRole('button', { name: 'Retour aux niveaux' }).click()
  const apres = await texte(page)
  ok(apres.includes('Validé le'), `${theme} : niveau validé affiché`)
  ok(/5e · ceinture verte Commence ici/.test(apres), `${theme} : le niveau suivant est proposé`)
  ok(await page.getByRole('button', { name: /^5e · ceinture verte/ }).isEnabled(), `${theme} : 5e ouverte après la 6e`)
  ok(await page.getByRole('button', { name: /^4e · ceinture bleue/ }).isDisabled(), `${theme} : 4e encore fermée`)
  await cap(page, '7-niveaux-apres', theme)

  // Bouton retour : vers l'Explorer, avec la ceinture dans la tuile
  await page.goBack()
  await page.getByRole('button', { name: /^Teste ton niveau/ }).waitFor()
  ok((await texte(page)).includes('Ceinture orange · 6e validé'), `${theme} : tuile avec la dernière ceinture`)
  await ctx.close()
}

// Champ dans une figure, correction à la fin : la saisie compte
{
  const etape = { uuid: '098c5', id: 'can6a-2026', titre: 'CAN 6e sujet 2026', nbQuestions: 1, sup: 'false', sup2: '4', sup3: 'false' }
  const p = { id: 'figure', version: 1, titre: 'Figure', objectif: '', niveau: '6e', theme: 'CAN', difficulte: 1, icone: 'bx-timer', presentation: 'une_question_par_page', correction: 'parcours', enTetesMasques: true, melanger: true, etapes: [etape, { ...etape, sup2: '1' }] }
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  await ctx.addInitScript((p) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('copie:profil', JSON.stringify('eleve'))
    localStorage.setItem('copie:ajoutes', JSON.stringify([p]))
  }, p)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`figure: ${e.message}`))
  await page.goto(base)
  await page.getByRole('button', { name: /^Figure/ }).first().click()
  await page.getByRole('button', { name: /^Commencer/ }).first().click()
  await page.getByRole('tablist', { name: 'Questions' }).waitFor({ timeout: 120_000 })
  // Page de la bande : celle qui contient le champ de la figure
  for (const i of [0, 1]) {
    await page.getByRole('tablist', { name: 'Questions' }).getByRole('tab').nth(i).click()
    await page.waitForTimeout(800)
    if (await page.locator('main [id^="MetaInteractif2dEx"][id$="field0"]').count()) break
  }
  const attendue = await page.evaluate(async () => {
    const s = JSON.parse(localStorage.getItem('copie:seance:figure'))
    const man = await (await fetch('/moteur/manifest.json')).json()
    const m = await import('/moteur/' + man.entree)
    const ex = await m.preparerExercice({ ...s.contenu.etapes[0], alea: s.graines[0] }, 90)
    return ex.interne.autoCorrection[0].valeur.field0.value
  })
  const champ = page.locator('main math-field[id^="MetaInteractif2dEx"]').first()
  await champ.click()
  await page.keyboard.type(String(attendue))
  await page.waitForTimeout(800) // brouillon (350 ms)
  await page.getByRole('tablist', { name: 'Questions' }).getByRole('tab').last().click()
  await page.getByRole('button', { name: 'Soumettre la tentative' }).click()
  const garde = page.getByRole('button', { name: 'Soumettre quand même' })
  await garde.click({ timeout: 5000 }).catch(() => {})
  await page.getByRole('button', { name: 'Voir le bilan' }).click({ timeout: 120_000 })
  const essai = await page.evaluate(() => JSON.parse(localStorage.getItem('copie:seance:figure')).essais.find((e) => e.etape === 0))
  ok(essai?.juste === true, `réponse dans une figure prise en compte (${attendue} : ${JSON.stringify(essai?.reponses)})`)
  await ctx.close()
}

ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
