// Bilan d'une ceinture (Nathan, 13 novembre 2026) : l'état d'abord, le score
// en petit. Ceinture manquée : « Il manquait 1 bonne réponse », pas de pause
// de l'enseignant (elle félicite), première erreur dépliée avec sa
// correction. Ceinture obtenue : sa couleur en grand, « Ceinture orange
// obtenue », la pause, « Continuer ». Ceinture déjà obtenue puis manquée :
// « déjà obtenue ». Vraie saisie, téléphone (clair) et bureau (sombre).
//   CAPTURES=<dossier> node e2e/bilan-ceinture.mjs   (app construite servie sur 1420, ou BASE)
import { chromium } from 'playwright'
import { pagePrete, pointStable, SANS_BRIDAGE, taperDans } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })

const PAUSE = 'Avant de soustraire, mise en commun en classe.'
const p = {
  id: 'bilan-ceintures',
  version: 1,
  titre: 'Bilan des ceintures',
  objectif: '',
  niveau: '5e',
  theme: 'Relatifs',
  difficulte: 2,
  icone: 'bx-medal',
  presentation: 'une_question_par_page',
  correction: 'question',
  enTetesMasques: true,
  style: 'ceintures',
  premiereCeinture: 2,
  etapes: [
    { uuid: 'cbc26', id: '5N2G', nbQuestions: 2, titre: 'Additionner deux nombres relatifs' },
    { uuid: 'cbc26', id: '5N2G', nbQuestions: 2, titre: 'Additionner deux nombres relatifs' },
  ],
  paliers: [
    { titre: 'Additionner', nb: 1, pause: { texte: PAUSE } },
    { titre: 'Encore', nb: 1, acces: 'seuil', seuil: 80 },
  ],
}

const texte = async (page) => (await page.locator('body').innerText()).replace(/\s+/g, ' ')
/** Somme des relatifs de l'énoncé (« (-11) + (-1) »), écrite comme on la tape */
const sommeDe = async (page) => {
  const tex = await page.locator('main annotation').first().textContent()
  const termes = [...tex.matchAll(/\(([+-]?\d+(?:[.,]\d+)?)\)/g)].map((m) => Number(m[1].replace(',', '.')))
  if (termes.length !== 2) throw new Error(`énoncé inattendu : ${tex}`)
  return String(Math.round((termes[0] + termes[1]) * 100) / 100).replace('.', ',')
}
const toucher = async (page, bouton) => {
  await bouton.scrollIntoViewIfNeeded()
  const pt = await pointStable(bouton)
  await page.mouse.click(pt.x, pt.y)
  await pagePrete(page)
}
/** Joue la ceinture : `justes` dit, question par question, si l'élève répond juste */
const jouer = async (page, justes) => {
  await page.getByRole('tablist', { name: 'Questions' }).waitFor({ timeout: 120_000 })
  await pagePrete(page)
  for (const [i, juste] of justes.entries()) {
    await taperDans(page, page.locator('main math-field').first(), juste ? await sommeDe(page) : '999')
    await pagePrete(page)
    await toucher(page, page.locator('footer').getByRole('button', { name: 'Vérifier', exact: true }))
    await toucher(page, page.locator('footer').getByRole('button', { name: i + 1 < justes.length ? 'Question suivante' : 'Voir le bilan' }))
  }
  await page.getByRole('button', { name: /^Refaire : ceinture orange/ }).waitFor({ timeout: 30_000 })
  await pagePrete(page)
}

for (const [appareil, theme, ecran] of [
  ['téléphone', 'clair', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['bureau', 'sombre', { viewport: { width: 1280, height: 800 } }],
]) {
  const ctx = await nav.newContext(ecran)
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
  page.on('pageerror', (e) => erreurs.push(`${appareil}: ${e.message}`))
  await page.goto(base)
  await pagePrete(page)
  await page.getByRole('button', { name: /^Bilan des ceintures/ }).first().click()
  await pagePrete(page)
  await page.getByRole('button', { name: /^Commencer/ }).first().click()

  // ---------- Ceinture manquée : 1 sur 2 ----------
  await jouer(page, [true, false])
  let t = await texte(page)
  ok(t.includes('Il manquait 1 bonne réponse'), `${appareil} : ceinture manquée, « Il manquait 1 bonne réponse »`)
  ok(t.includes('Ceinture orange · 1 / 2 · 50 %'), `${appareil} : ceinture et score en petit`)
  ok(!t.includes('obtenue'), `${appareil} : rien ne dit la ceinture obtenue`)
  ok(!t.includes(PAUSE), `${appareil} : pas de pause de l'enseignant après une ceinture manquée`)
  ok(t.includes('Pour ouvrir ceinture verte : au moins 80 % (tu as 50 %)'), `${appareil} : ce qu'il faut pour la ceinture suivante`)
  ok((await page.locator('main button[aria-expanded="true"]').count()) === 1, `${appareil} : l'exercice de l'erreur est déplié d'office`)
  await page.locator('main .pastille-verification').first().waitFor({ timeout: 30_000 })
  await pagePrete(page)
  ok((await page.locator('main .pastille-verification').allInnerTexts()).includes('Incorrecte'), `${appareil} : l'erreur et sa correction sont à l'écran`)
  await page.screenshot({ path: `${captures}/bilan-ceinture-1-manquee-${theme}.png`, fullPage: true })
  // Le toucher replie l'exercice, comme les autres
  await toucher(page, page.locator('main button[aria-expanded="true"]').first())
  ok((await page.locator('main button[aria-expanded="true"]').count()) === 0, `${appareil} : un toucher replie l'exercice`)

  // ---------- Ceinture obtenue : 2 sur 2 ----------
  await toucher(page, page.getByRole('button', { name: /^Refaire : ceinture orange/ }))
  await jouer(page, [true, true])
  t = await texte(page)
  ok(t.includes('Ceinture orange obtenue'), `${appareil} : « Ceinture orange obtenue »`)
  ok(t.includes('2 / 2 · 100 %') && !t.includes('Il manquait'), `${appareil} : score en petit, rien ne manque`)
  const couleur = await page.locator('main span[aria-hidden="true"][style*="background-color"]').first().evaluate((c) => getComputedStyle(c).backgroundColor)
  ok(couleur === 'rgb(249, 115, 22)', `${appareil} : la ceinture à sa couleur (${couleur})`)
  ok(t.includes(PAUSE), `${appareil} : la pause de l'enseignant suit la ceinture obtenue`)
  ok(await page.getByRole('button', { name: 'Continuer : ceinture verte' }).isVisible(), `${appareil} : « Continuer : ceinture verte »`)
  ok((await page.locator('main button[aria-expanded="true"]').count()) === 0, `${appareil} : aucun exercice déplié quand tout est correct`)
  await page.screenshot({ path: `${captures}/bilan-ceinture-2-obtenue-${theme}.png`, fullPage: true })

  // ---------- Déjà obtenue, puis manquée ----------
  await toucher(page, page.getByRole('button', { name: /^Refaire : ceinture orange/ }))
  await jouer(page, [false, false])
  t = await texte(page)
  ok(t.includes('Il manquait 2 bonnes réponses'), `${appareil} : accord au pluriel, « Il manquait 2 bonnes réponses »`)
  ok(t.includes('Ceinture orange déjà obtenue · 0 / 2 · 0 %'), `${appareil} : la ceinture reste obtenue`)
  ok(await page.getByRole('button', { name: 'Continuer : ceinture verte' }).isVisible(), `${appareil} : la ceinture suivante reste ouverte`)
  await page.screenshot({ path: `${captures}/bilan-ceinture-3-deja-${theme}.png`, fullPage: true })
  await ctx.close()
}

ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
