// Révisions espacées, parcourues comme un élève (pnpm dev seulement, sans le
// serveur de dossier qui remplace l'Explorer). Deux parcours de chapitres
// différents faits au clavier (l'un réussi, l'autre manqué), puis l'horloge du
// navigateur avance d'une semaine : séance de révision mélangée, bilan, écran
// des révisions, choix des chapitres et suivi des objectifs.
//   CAPTURES=<dossier> node e2e/revisions.mjs
// Captures du guide (docs/guide/images/revisions-*.png) : GUIDE=docs/guide/images.
import { chromium } from 'playwright'
import { join } from 'node:path'

const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}

const parcours = (id, titre, theme, uuid, exo, objectif) => ({
  id,
  version: 1,
  titre,
  objectif: '',
  niveau: '5e',
  theme,
  difficulte: 1,
  icone: 'bx-math',
  presentation: 'une_question_par_page',
  correction: 'question',
  melanger: true,
  etapes: [{ uuid, id: exo, titre: `${exo} - ${objectif}`, nbQuestions: 2, objectifs: [objectif] }],
})
const additions = parcours('rev-additions', 'Additions de relatifs', 'Nombres relatifs', 'cbc26', '5N2G', 'Additionner des relatifs')
const soustractions = parcours('rev-soustractions', 'Soustractions de relatifs', 'Calcul littéral', '36e2a', '5N2H', 'Soustraire des relatifs')

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
await ctx.addInitScript((explorer) => {
  if (sessionStorage.getItem('pret')) return
  sessionStorage.setItem('pret', '1')
  localStorage.setItem('copie:profil', JSON.stringify('eleve'))
  localStorage.setItem('copie:pays', JSON.stringify('FR'))
  localStorage.setItem('copie:explorer', JSON.stringify(explorer))
}, [additions, soustractions])
const page = await ctx.newPage()
page.on('pageerror', (e) => erreurs.push(e.message))
await page.clock.install({ time: new Date('2026-10-19T09:00:00') })
await page.goto(base)

/** Capture du guide avec un anneau autour de ce qu'on touche ensuite */
async function guide(nom, cible) {
  if (!process.env.GUIDE) return
  await page.waitForTimeout(500)
  if (cible) {
    const b = await cible.first().boundingBox()
    await page.evaluate((b) => {
      const anneau = document.createElement('div')
      anneau.id = 'repere-guide'
      Object.assign(anneau.style, {
        position: 'fixed', left: `${b.x - 5}px`, top: `${b.y - 5}px`, width: `${b.width + 10}px`, height: `${b.height + 10}px`,
        border: '3px solid var(--color-coopmaths-struct)', borderRadius: '14px', zIndex: 2147483647, pointerEvents: 'none',
      })
      document.body.append(anneau)
    }, b)
  }
  await page.screenshot({ path: join(process.env.GUIDE, `${nom}.png`) })
  await page.evaluate(() => document.getElementById('repere-guide')?.remove())
}

/** Réponse attendue par MathALÉA pour la question affichée (rang dans l'ordre mélangé) */
const reponseAttendue = (id, rang) =>
  page.evaluate(
    async ({ id, rang }) => {
      const s = JSON.parse(localStorage.getItem(`copie:seance:${id}`))
      const [e, q] = s.ordre[rang].split('-').map(Number)
      const man = await (await fetch('/moteur/manifest.json')).json()
      const m = await import('/moteur/' + man.entree)
      const ex = await m.preparerExercice({ ...s.contenu.etapes[e], alea: s.graines[e] }, 90 + e)
      return String(ex.interne.autoCorrection[q]?.valeur?.reponse?.value)
    },
    { id, rang },
  )

async function saisir(latex) {
  await page
    .waitForFunction(() => document.querySelectorAll('main math-field').length === 1 && !!document.querySelector('main math-field[data-listener-added]'), null, { timeout: 15_000 })
    .catch(() => {})
  for (let essai = 0; essai < 20; essai++) {
    const pris = await page
      .locator('main math-field')
      .last()
      .evaluate((el, v) => {
        el.setValue(v)
        el.dispatchEvent(new Event('input', { bubbles: true }))
        return el.value === v
      }, latex)
      .catch(() => false)
    if (pris && (await page.waitForTimeout(300), await page.locator('main math-field').last().evaluate((el, v) => el.value === v, latex).catch(() => false))) return
    await page.waitForTimeout(250)
  }
  throw new Error(`saisie impossible : ${latex}`)
}

/** Répond à `total` questions (fausses aux rangs de `faux`), en vérifiant chacune, jusqu'au bilan */
async function repondre(id, total, faux = []) {
  await page.locator('main math-field').first().waitFor({ timeout: 60_000 })
  await page.waitForTimeout(500)
  for (let rang = 0; rang < total; rang++) {
    await saisir(faux.includes(rang) ? '999' : await reponseAttendue(id, rang))
    await page.getByRole('button', { name: 'Vérifier' }).click()
    await page.waitForTimeout(400)
    if (rang < total - 1) {
      const btn = page.getByRole('button', { name: 'Question suivante' })
      for (let essai = 0; essai < 20 && !(await page.getByText(`Question ${rang + 2} sur ${total}`).isVisible().catch(() => false)); essai++) {
        if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {})
        await page.waitForTimeout(400)
      }
    } else await page.getByRole('button', { name: 'Voir le bilan' }).click()
  }
  await page.getByText(new RegExp(`\\d+ / ${total}`)).first().waitFor({ timeout: 30_000 })
}

async function faireParcours(p, faux) {
  await page.getByRole('tab', { name: 'Explorer' }).click({ timeout: 60_000 })
  await page.getByText('5e').first().click().catch(() => {})
  await page.getByRole('button', { name: new RegExp(`^${p.theme}`) }).first().click()
  await page.getByRole('button', { name: new RegExp(`^${p.titre}`) }).first().click({ timeout: 30_000 })
  await page.getByRole('button', { name: 'Commencer' }).click()
  await repondre(p.id, 2, faux)
  await page.getByRole('button', { name: 'Retour à l’accueil' }).click()
  await page.waitForTimeout(500)
}

const tuile = page.getByRole('button', { name: /^Révisions/ })
await page.getByRole('tab', { name: 'Mes parcours' }).waitFor({ timeout: 60_000 })
ok(!(await tuile.count()), 'rien de terminé : pas de tuile Révisions')

// Lundi : additions réussies (100 %), soustractions manquées (0 %)
await faireParcours(additions, [])
await faireParcours(soustractions, [0, 1])
await page.getByRole('tab', { name: 'Mes parcours' }).click()
await tuile.waitFor()
ok((await tuile.innerText()).includes('Prochaine révision demain'), `après les parcours : ${(await tuile.innerText()).replace(/\s+/g, ' ')}`)

// Mardi : les soustractions manquées reviennent
await page.clock.setSystemTime(new Date('2026-10-20T09:00:00'))
await page.reload()
await tuile.waitFor({ timeout: 60_000 })
ok((await tuile.innerText()).includes('À revoir aujourd’hui'), `le lendemain : ${(await tuile.innerText()).replace(/\s+/g, ' ')}`)

// Lundi suivant : les deux exercices sont à revoir
await page.clock.setSystemTime(new Date('2026-10-26T09:00:00'))
await page.reload()
await tuile.waitFor({ timeout: 60_000 })
ok((await tuile.innerText()).includes('À revoir aujourd’hui') && !/\d+ exercice/.test(await tuile.innerText()), `une semaine plus tard, sans nombre en attente : ${(await tuile.innerText()).replace(/\s+/g, ' ')}`)
await guide('revisions-1-tuile', tuile)
await page.screenshot({ path: `${captures}/revisions-1-accueil.png` })
await tuile.click()
const main = page.locator('main')
const texteMain = async () => (await main.innerText()).replace(/\s+/g, ' ')
const commencer = page.getByRole('button', { name: 'Commencer', exact: true })
await commencer.waitFor()
const ecran = (await main.innerText()).replace(/\s+/g, ' ')
ok(ecran.includes('Combien de questions ?') && !/à revoir/.test(ecran), `écran des révisions : choix du nombre de questions, aucun stock affiché (${ecran.slice(0, 90)})`)
ok(ecran.includes('Nombres relatifs') && ecran.includes('Calcul littéral'), 'les deux chapitres sont proposés')
ok(await page.getByRole('radio', { name: '6' }).isChecked(), '6 questions par défaut')
await page.getByRole('radio', { name: '3' }).click()
ok((await page.getByRole('radio', { name: '3' }).isChecked()) && (await page.evaluate(() => JSON.parse(localStorage.getItem('copie:revisions')).taille)) === 3, '3 questions choisies, et retenues')
await guide('revisions-2-ecran', commencer)
await page.screenshot({ path: `${captures}/revisions-2-ecran.png`, fullPage: true })

// Choix des chapitres : un seul, puis les deux
const interrupteur = page.getByRole('switch', { name: 'Réviser Calcul littéral' })
const autre = page.getByRole('switch', { name: 'Réviser Nombres relatifs' })
await interrupteur.uncheck()
await page.waitForTimeout(300)
ok((await page.evaluate(() => JSON.parse(localStorage.getItem('copie:revisions')).chapitres))?.join() === '5e|Nombres relatifs' && (await commencer.isVisible()), 'un chapitre décoché : seul l’autre est révisé')
await guide('revisions-3-chapitres', interrupteur)
await autre.uncheck()
await page.waitForTimeout(300)
ok((await texteMain()).includes('Rien à revoir aujourd’hui') && !(await commencer.isVisible()), 'aucun chapitre : rien à revoir')
await interrupteur.check()
await autre.check()
await page.waitForTimeout(300)
ok(await commencer.isVisible(), 'chapitres recochés')
const choix = await page.evaluate(() => JSON.parse(localStorage.getItem('copie:revisions')).chapitres)
ok(choix === undefined, 'tous cochés : aucun filtre gardé (les nouveaux chapitres seront inclus)')

// Séance de révision : 4 questions mélangées, sans titre d'exercice
await commencer.click()
await page.locator('main math-field').first().waitFor({ timeout: 60_000 })
await page.waitForTimeout(600)
const pendant = (await page.locator('body').innerText()).replace(/\s+/g, ' ')
ok(!/5N2G|5N2H|Additionner des relatifs|Soustraire des relatifs/.test(pendant), 'pendant la révision : aucun titre d’exercice')
ok(pendant.includes('Question 1 sur 2'), 'une question par exercice (2 exercices à revoir, 3 demandées)')
await page.screenshot({ path: `${captures}/revisions-3-seance.png` })
const s = await page.evaluate(() => JSON.parse(localStorage.getItem('copie:seance:revisions')))
const ordre = s.ordre.map((k) => Number(k.split('-')[0]))
ok(ordre.every((e, i) => i === 0 || e !== ordre[i - 1]), `jamais deux questions du même exercice à la suite (${ordre.join(' ')})`)
// Soustractions réussies cette fois ; additions : une erreur
const rangAddition = ordre.findIndex((e) => s.contenu.etapes[e].uuid === 'cbc26')
await repondre('revisions', 2, [rangAddition])
const bilan = (await main.innerText()).replace(/\s+/g, ' ')
ok(bilan.includes('Additionner des relatifs') && bilan.includes('Soustraire des relatifs'), 'bilan : les titres sont dévoilés')
ok((bilan.match(/Revient dans 3 jours/g) ?? []).length === 2, `bilan : quand chaque exercice reviendra (${bilan.match(/Revient [^A-Z]*/g)?.join(' | ')})`)
await guide('revisions-4-bilan', page.getByRole('button', { name: 'Terminer' }))
await page.screenshot({ path: `${captures}/revisions-4-bilan.png`, fullPage: true })
const etat = await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('copie:revisions')).elements).map((e) => `${e.etape.uuid}:${e.boite}:${e.prochaine}`).sort())
// additions : boîte 3, manquée → 2 (3 jours) ; soustractions : boîte 1, réussie → 2 (3 jours)
ok(etat.join(' ') === '36e2a:2:2026-10-29 cbc26:2:2026-10-29', `boîtes après la révision : ${etat.join(' ')}`)
await page.getByRole('button', { name: 'Terminer' }).click()
await page.waitForTimeout(500)
const apres = (await main.innerText()).replace(/\s+/g, ' ')
ok(apres.includes('Rien à revoir aujourd’hui') && apres.includes('Prochaine révision dans 3 jours'), `retour à l’écran des révisions : ${apres.slice(0, 70)}`)
await page.screenshot({ path: `${captures}/revisions-5-fait.png` })

// Suivi : les objectifs gardent leur chapitre et montrent leur solidité dans le temps
await page.getByRole('button', { name: 'Revenir en arrière' }).click()
await page.getByRole('tab', { name: 'Suivi' }).click()
await page.getByRole('tab', { name: /Objectifs/ }).click().catch(() => {})
await page.waitForTimeout(400)
const suivi = (await main.innerText()).replace(/\s+/g, ' ')
ok(suivi.includes('révision : à consolider') && !suivi.includes('Sans niveau'), `suivi : solidité affichée, chapitres gardés (${suivi.slice(0, 160)})`)
await page.screenshot({ path: `${captures}/revisions-6-suivi.png`, fullPage: true })

// Sombre
await page.evaluate(() => localStorage.setItem('theme', 'sombre'))
await page.reload()
await tuile.waitFor({ timeout: 60_000 })
await tuile.click()
await page.waitForTimeout(600)
await page.screenshot({ path: `${captures}/revisions-7-ecran-sombre.png`, fullPage: true })

ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
