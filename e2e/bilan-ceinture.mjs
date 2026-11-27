// Bilan d'une ceinture (Nathan, 13 novembre 2026) : l'état d'abord, le score
// en petit. Ceinture manquée : « Ceinture orange pas encore obtenue », une
// pastille par question, « Obtenue dès 2 sur 2 » (Nathan, 26 novembre 2026 :
// « il faut 2 / 2 » faisait IA), « Pour ouvrir la ceinture verte : au moins 80 % », pas de pause
// de l'enseignant (elle félicite), première erreur dépliée avec sa
// correction. Ceinture obtenue : sa couleur en grand, « Ceinture orange
// obtenue », la pause, « Continuer ». Ceinture déjà obtenue puis manquée :
// « déjà obtenue ». Puis le Suivi, onglet Séances (Nathan, 27 novembre 2026 : l'élève
// revoit toutes ses tentatives, réussies ou non, question par question) : les trois
// séances, la plus récente d'abord, chacune rejouée en lecture avec une pastille par
// question et « Seulement les questions incorrectes » ; le retour ramène à l'onglet.
// Vraie saisie, téléphone (clair) et bureau (sombre).
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
  ok(t.includes('Ceinture orange pas encore obtenue'), `${appareil} : ceinture manquée, « Ceinture orange pas encore obtenue »`)
  ok(t.includes('1 bonne réponse sur 2 · 50 %') && !t.includes('Tu as') && !t.includes('il faut'), `${appareil} : « 1 bonne réponse sur 2 », sans « il faut »`)
  ok(t.includes('Obtenue dès 2 sur 2'), `${appareil} : à partir de combien elle s'obtient`)
  ok((await page.locator('main .point.juste').count()) === 1 && (await page.locator('main .point.faux').count()) === 1, `${appareil} : une pastille par question, juste puis fausse`)
  ok(!(await page.locator('main span[style*="background-color"]').count()), `${appareil} : la ceinture n'est pas pleine (hachurée)`)
  ok(!t.includes(PAUSE), `${appareil} : pas de pause de l'enseignant après une ceinture manquée`)
  ok(t.includes('Pour ouvrir la ceinture verte : au moins 80 % (obtenu 50 %)'), `${appareil} : ce qu'il faut pour la ceinture suivante`)
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
  ok(t.includes('2 bonnes réponses sur 2 · 100 %') && !t.includes('pas encore') && !t.includes('dès'), `${appareil} : score en petit, rien ne manque`)
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
  ok(t.includes('Ceinture orange pas encore obtenue') && t.includes('0 bonne réponse sur 2 · 0 %'), `${appareil} : manquée de nouveau`)
  ok(t.includes('Obtenue dès 2 sur 2 · déjà obtenue avant'), `${appareil} : la ceinture reste obtenue`)
  ok(await page.getByRole('button', { name: 'Continuer : ceinture verte' }).isVisible(), `${appareil} : la ceinture suivante reste ouverte`)
  await page.screenshot({ path: `${captures}/bilan-ceinture-3-deja-${theme}.png`, fullPage: true })

  // ---------- Suivi, onglet Séances : toutes les tentatives, revues question par question ----------
  for (let i = 0; i < 5 && !(await page.getByRole('tab', { name: 'Suivi', exact: true }).isVisible().catch(() => false)); i++) {
    await page.getByRole('button', { name: 'Revenir en arrière' }).first().click().catch(() => {})
    await pagePrete(page)
  }
  await toucher(page, page.getByRole('tab', { name: 'Suivi', exact: true }))
  await pagePrete(page)
  await toucher(page, page.getByRole('tab', { name: 'Séances', exact: true }))
  await pagePrete(page)
  const lignes = (await page.locator('main [aria-label^="Séances du"] li').allInnerTexts()).map((x) => x.replace(/\s+/g, ' ').trim())
  ok(
    lignes.length === 3 &&
      lignes[0].includes('Ceinture orange pas obtenue · 0 bonne réponse sur 2') &&
      lignes[1].includes('Ceinture orange obtenue · 2 bonnes réponses sur 2') &&
      lignes[2].includes('Ceinture orange pas obtenue · 1 bonne réponse sur 2') &&
      lignes.every((l) => l.startsWith('Bilan des ceintures')),
    `${appareil} : Séances, les trois tentatives, la plus récente d'abord (${lignes.join(' | ')})`,
  )
  await page.screenshot({ path: `${captures}/bilan-ceinture-4-seances-${theme}.png`, fullPage: true })
  await toucher(page, page.locator('main [aria-label^="Séances du"] li button').nth(2))
  await page.getByRole('button', { name: 'Question 2 : incorrecte' }).waitFor({ timeout: 60_000 })
  await pagePrete(page)
  ok(await page.getByRole('button', { name: 'Question 1 : correcte' }).isVisible(), `${appareil} : relecture, une pastille par question (correcte, incorrecte)`)
  ok((await texte(page)).includes('1 bonne réponse sur 2'), `${appareil} : relecture, le score`)
  ok((await page.locator('main [id^="question-"]').count()) === 2, `${appareil} : relecture, les deux questions`)
  await page.screenshot({ path: `${captures}/bilan-ceinture-5-relecture-${theme}.png`, fullPage: true })
  await toucher(page, page.getByRole('switch'))
  await pagePrete(page)
  ok((await page.locator('main [id^="question-"]').count()) === 1 && (await page.locator('main #question-1').count()) === 1, `${appareil} : seulement la question incorrecte`)
  await page.locator('main .pastille-verification').first().waitFor({ timeout: 30_000 }).catch(() => {})
  ok((await page.locator('main .pastille-verification').allInnerTexts()).includes('Incorrecte'), `${appareil} : la réponse incorrecte et sa correction`)
  await page.screenshot({ path: `${captures}/bilan-ceinture-6-incorrectes-${theme}.png`, fullPage: true })
  await page.getByRole('button', { name: 'Revenir en arrière' }).first().click()
  await pagePrete(page)
  ok((await page.getByRole('tab', { name: 'Séances', exact: true }).getAttribute('aria-selected')) === 'true', `${appareil} : retour sur l'onglet Séances`)
  await ctx.close()
}

ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
