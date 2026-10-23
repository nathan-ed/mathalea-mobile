// Questions sans champ de saisie et figures larges, dans une vraie séance à
// 390 px (pnpm dev seulement). Pour chaque exercice : la page garde la largeur
// de l'écran et la barre du bas reste visible (une figure apigeom de 600 px ou
// un tableau large élargissaient toute la page) ; après un geste dans la
// question, « Vérifier » devient actif (il restait grisé sans champ MathLive :
// question impossible à faire). Le tableur est rempli et vérifié pour de vrai ;
// Entrée dans une cellule ne vérifie pas la question. Une question qui affiche
// plusieurs éléments corrigés est vérifiée sur chacun d'eux.
//   CAPTURES=<dossier> node e2e/interactions.mjs
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

/** Séance d'un exercice seul (une question par page, correction à chaque question) */
async function seance(nom, uuid, nbQuestions = 1) {
  const p = {
    id: 'interactions', version: 1, titre: 'Interactions', objectif: '', niveau: '6e', theme: 'Divers', difficulte: 1, icone: 'bx-shape-triangle',
    presentation: 'une_question_par_page', correction: 'question',
    etapes: [{ uuid, id: nom, titre: nom, nbQuestions }],
  }
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
  page.on('pageerror', (e) => erreurs.push(`${nom} : ${e.message}`))
  await page.goto(base)
  await page.getByRole('tab', { name: 'Explorer' }).or(page.getByRole('button', { name: 'Explorer' })).first().click({ timeout: 60_000 })
  await page.getByText('6e').first().click().catch(() => {})
  await page.getByRole('button', { name: /^Interactions/ }).first().click({ timeout: 30_000 })
  await page.getByRole('button', { name: /^Commencer/ }).first().click()
  await page.locator('main .contenu-mathalea').first().waitFor({ timeout: 120_000 })
  await page.waitForTimeout(2000)
  return page
}

/** La page garde la largeur de l'écran, la barre du bas est visible et touchable */
async function mise(page, nom) {
  const m = await page.evaluate(() => {
    const pied = document.querySelector('footer')
    const r = pied.getBoundingClientRect()
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return { largeur: innerWidth, defile: document.documentElement.scrollWidth, bas: r.bottom, hauteur: visualViewport.height, touchable: pied.contains(el) }
  })
  ok(m.largeur === 390 && m.defile <= 390, `${nom} : la page garde 390 px (${m.largeur}, ${m.defile})`)
  ok(m.bas <= m.hauteur + 1 && m.touchable, `${nom} : barre du bas visible et touchable (${Math.round(m.bas)} / ${m.hauteur})`)
}

const verifier = (page) => page.getByRole('button', { name: 'Vérifier', exact: true })

// Figures et tableaux plus larges que l'écran
for (const [nom, uuid] of [
  ['CM2N2A-1 figure apigeom', 'c28e5'],
  ['6N2autoB-1 tableau MathLive', '1acf7'],
  ['CM2D1A-1 tableau et questions', '99d95'],
]) {
  const page = await seance(nom, uuid)
  await mise(page, nom)
  await page.screenshot({ path: `${captures}/interactions-${uuid}.png` })
  await page.context().close()
}

// Un geste dans la question rend « Vérifier » actif
const gestes = [
  ['canc3D04 horloge', '51242', async (p) => {
    const b = await p.locator('main .contenu-mathalea svg').first().boundingBox()
    await p.mouse.click(b.x + b.width * 0.7, b.y + b.height * 0.3)
  }],
  ['CM2N2A-1 colorier', 'c28e5', async (p) => {
    const b = await p.locator('main #divFigure polygon').first().boundingBox()
    await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  }],
  ['CM2G5C-1 cliquer sur une figure', 'f57fe', async (p) => {
    const b = await p.locator('main .contenu-mathalea svg').first().boundingBox()
    await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  }],
  ['6N5-14 échiquier (listes)', 'b7f28', async (p) => {
    const s = p.locator('main select').first()
    await s.selectOption((await s.locator('option').nth(1).getAttribute('value')) ?? '')
  }],
  ['can1D3-05 liste déroulante', 'ad915', async (p) => {
    await p.locator('main liste-deroulante').first().click()
    await p.locator('main [role="option"]').nth(1).click()
  }],
]
for (const [nom, uuid, geste] of gestes) {
  const page = await seance(nom, uuid)
  ok(!(await verifier(page).isEnabled()), `${nom} : « Vérifier » grisé avant tout geste`)
  await geste(page)
  await page.waitForTimeout(500)
  ok(await verifier(page).isEnabled(), `${nom} : « Vérifier » actif après un geste`)
  await verifier(page).click()
  await page.waitForTimeout(800)
  ok((await page.locator('footer').innerText()).includes('Terminer') || (await page.locator('main').innerText()).includes('Correction'), `${nom} : question vérifiée, correction affichée`)
  await page.context().close()
}

// Tableur : formule saisie dans la cellule, Entrée valide la cellule, puis
// « Vérifier ». Le volume du pavé (B4 = B1×B2×B3) est l'une des questions tirées
{
  const nom = '6I1B-7 tableur'
  let page
  for (let essai = 0; essai < 6; essai++) {
    page = await seance(nom, 'e0f6b', 2)
    if ((await page.locator('main').innerText()).includes('Volume')) break
    await page.context().close()
    page = null
  }
  ok(!!page, `${nom} : question du volume tirée`)
  if (page) {
    await mise(page, nom)
    const cellule = page.locator('main td[data-x="1"][data-y="3"]')
    await cellule.dblclick()
    await page.keyboard.type('=B1*B2*B3')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    ok(/^\d+$/.test((await cellule.innerText()).trim()), `${nom} : formule calculée dans la cellule (${(await cellule.innerText()).trim()})`)
    ok(await verifier(page).isVisible(), `${nom} : Entrée dans la cellule ne vérifie pas la question`)
    await verifier(page).click()
    await page.waitForTimeout(1000)
    ok((await page.locator('header').innerText()).includes('1/2'), `${nom} : réponse correcte comptée (1/2)`)
    await page.screenshot({ path: `${captures}/interactions-tableur.png` })
    await page.context().close()
  }
}

// Plusieurs éléments corrigés dans une question (6N3M : trois champs ; 6AutoA1 :
// deux QCM) : la deuxième question, bien répondue, compte juste. Avant, l'app
// vérifiait l'élément de même rang, affiché dans la première question.
for (const [nom, uuid] of [['6N3M trois champs par question', '8e07a'], ['6AutoA1 deux QCM par question', '95313']]) {
  const page = await seance(nom, uuid, 3)
  await page.getByRole('tablist', { name: 'Questions' }).getByRole('tab').nth(1).click()
  await page.waitForTimeout(1500)
  const attendu = await page.evaluate(async () => {
    const s = JSON.parse(localStorage.getItem('copie:seance:interactions'))
    const man = await (await fetch('/moteur/manifest.json')).json()
    const m = await import('/moteur/' + man.entree)
    const ex = await m.preparerExercice({ ...s.contenu.etapes[0], alea: s.graines[0] }, 50)
    return ex.interne.autoCorrection.map((a) => a?.valeur?.reponse?.value ?? (a?.propositions ? a.propositions.map((p) => p.statut) : null))
  })
  const champs = await page.evaluate(() => [...document.querySelectorAll('main math-field[id], main input[type=checkbox][id]')].map((c) => c.id))
  ok(champs.length > 1 && !champs.some((id) => /Q1(?!\d)/.test(id)), `${nom} : la deuxième question affiche d'autres éléments que le deuxième (${champs.join(', ')})`)
  for (const id of champs) {
    const m = /Q(\d+)(R(\d+))?$/.exec(id)
    const k = Number(m[1])
    if (m[2]) {
      if (attendu[k][Number(m[3])]) await page.locator('#' + id).check({ force: true })
    } else {
      // Comme un élève : 4/6 pour une fraction, virgule décimale
      const texte = String(attendu[k]).replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, '$1/$2').replace('.', ',')
      await page.locator('#' + id).click()
      await page.waitForTimeout(400)
      await page.keyboard.type(texte, { delay: 30 })
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('ArrowRight')
    }
  }
  await page.waitForTimeout(500)
  await verifier(page).click()
  await page.waitForTimeout(1200)
  const score = (await page.locator('header').innerText()).replace(/\s+/g, ' ')
  ok(score.includes('1/3'), `${nom} : deuxième question juste, tous ses éléments vérifiés (${score})`)
  await page.screenshot({ path: `${captures}/interactions-${uuid}-q2.png` })
  await page.context().close()
}

ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
