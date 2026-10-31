// Reprise après une fermeture de l'app (Nathan, 31 octobre 2026 : « quand on
// quitte l'app et qu'on revient plus tard, on arrive directement sur
// l'accueil »). Android arrête l'app laissée en arrière-plan : au relancement,
// on doit retrouver l'écran où l'on était. Le rechargement de la page joue ce
// relancement (données gardées, état de la page perdu).
// Prérequis : pnpm dev (port 1420).
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
let echecs = 0
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const etape = { uuid: 'ab88c', id: 'canc3a-2026', titre: 'Calcul', titreMasque: true, nbQuestions: 3, sup: 'false', sup2: '1-2-3', sup3: 'false' }
const parcours = { id: 'reprise', version: 1, titre: 'Reprise', objectif: 'Calculer', niveau: 'CM2', theme: 'Calcul', difficulte: 1, icone: 'bx-calculator', presentation: 'une_question_par_page', correction: 'parcours', etapes: [etape] }

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
for (const appareil of ['telephone', 'bureau']) {
  const ctx = await nav.newContext(
    appareil === 'telephone' ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 800 } },
  )
  await ctx.addInitScript((p) => {
    if (localStorage.getItem('copie:profil')) return
    localStorage.setItem('copie:profil', JSON.stringify('eleve'))
    localStorage.setItem('copie:ajoutes', JSON.stringify([p]))
  }, parcours)
  const page = await ctx.newPage()
  const erreurs = []
  page.on('pageerror', (e) => erreurs.push(e.message))
  const relancer = async () => {
    await page.reload()
    await page.waitForTimeout(4000)
  }
  const visible = (loc) => loc.first().isVisible().catch(() => false)

  await page.goto(base)
  // Séance en cours : on revient sur la question où l'on était
  await page.getByRole('button', { name: /^\s*Reprise/ }).first().click()
  await page.getByRole('button', { name: /^Commencer/ }).first().click()
  await page.getByText('Question 1 sur 3').waitFor({ timeout: 60000 })
  await page.getByRole('button', { name: 'Question suivante' }).click()
  await page.getByText('Question 2 sur 3').waitFor()
  await relancer()
  await page.getByText(/Question \d sur 3/).first().waitFor({ timeout: 60000 }).catch(() => {})
  ok(await visible(page.getByText('Question 2 sur 3')), `${appareil} : séance reprise à la question 2`)

  // « Reprendre plus tard » ramène à l'accueil, retrouvé au relancement
  await page.goBack()
  await page.getByRole('button', { name: 'Reprendre plus tard' }).click()
  await page.getByRole('tab', { name: 'Mes parcours' }).waitFor()
  await relancer()
  ok(await visible(page.getByRole('tab', { name: 'Mes parcours' })), `${appareil} : accueil retrouvé après « Reprendre plus tard »`)

  // Onglet Explorer
  await page.getByRole('tab', { name: 'Explorer' }).click()
  await page.waitForTimeout(500)
  await relancer()
  ok((await page.getByRole('tab', { name: 'Explorer' }).getAttribute('aria-selected')) === 'true', `${appareil} : onglet Explorer retrouvé`)

  // Teste ton niveau
  await page.getByRole('button', { name: /Teste ton niveau/ }).first().click()
  await page.getByText(/ceinture blanche/i).first().waitFor({ timeout: 60000 })
  await relancer()
  ok(await visible(page.getByText(/ceinture blanche/i)), `${appareil} : Teste ton niveau retrouvé`)

  ok(!erreurs.length, `${appareil} : aucune erreur JavaScript ${erreurs.slice(0, 2).join(' | ')}`)
  await ctx.close()
}
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
