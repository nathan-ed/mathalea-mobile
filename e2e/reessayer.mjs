// Réessayer avec d'autres valeurs (Nathan, 13 novembre 2026 : « par défaut on
// a l'option réessayer », réglage du parcours, « valable seulement si la
// validation est faite par question et pas à la fin du parcours »). Après une
// réponse incorrecte, la même question revient avec d'autres valeurs, sous la
// correction, hors score ; proposé de nouveau si le nouvel essai est manqué ;
// jamais après une réponse correcte, ni avec `reessayer: false`, ni avec la
// correction à la fin. Vraie saisie, téléphone (clair) et bureau (sombre).
//   CAPTURES=<dossier> node e2e/reessayer.mjs   (app construite servie sur 1420, ou BASE)
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

// Additionner deux relatifs : la réponse se calcule d'après l'énoncé affiché
const etape = { uuid: 'cbc26', id: '5R20', titre: 'Additionner deux relatifs', nbQuestions: 3 }
const commun = { version: 1, objectif: '', niveau: '5e', theme: 'Relatifs', difficulte: 1, icone: 'bx-calculator', presentation: 'une_question_par_page', enTetesMasques: true, etapes: [etape] }
const parcours = [
  { ...commun, id: 'reessai-defaut', titre: 'Essai par défaut', correction: 'question' },
  { ...commun, id: 'reessai-sans', titre: 'Essai refusé', correction: 'question', reessayer: false },
  { ...commun, id: 'reessai-fin', titre: 'Essai à la fin', correction: 'parcours', reessayer: true },
]

const BOUTON = /Réessayer avec d’autres valeurs/
/** Somme des relatifs de l'énoncé (« (-11) + (-1) »), écrite comme on la tape */
const sommeDe = async (zone) => {
  const tex = await zone.locator('annotation').first().textContent()
  const termes = [...tex.matchAll(/\(([+-]?\d+(?:[.,]\d+)?)\)/g)].map((m) => Number(m[1].replace(',', '.')))
  if (termes.length !== 2) throw new Error(`énoncé inattendu : ${tex}`)
  return { tex, somme: String(Math.round((termes[0] + termes[1]) * 100) / 100).replace('.', ',') }
}
const toucher = async (page, bouton) => {
  await bouton.scrollIntoViewIfNeeded()
  const p = await pointStable(bouton)
  await page.mouse.click(p.x, p.y)
  await pagePrete(page)
}
const verifierPrincipale = async (page, saisie) => {
  await taperDans(page, page.locator('main math-field').first(), saisie)
  await pagePrete(page)
  await toucher(page, page.locator('footer').getByRole('button', { name: 'Vérifier', exact: true }))
}
const score = (page) => page.locator('header').innerText()

for (const [appareil, theme, ecran] of [
  ['téléphone', 'clair', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['bureau', 'sombre', { viewport: { width: 1280, height: 800 } }],
]) {
  // Un appareil neuf par parcours : l'app rouvre sinon l'écran quitté
  let ctx = null
  let page = null
  let essai = null
  let proposer = null
  const ouvrir = async (titre) => {
    await ctx?.close()
    ctx = await nav.newContext(ecran)
    await ctx.addInitScript(
      ({ parcours, theme }) => {
        if (sessionStorage.getItem('pret')) return
        sessionStorage.setItem('pret', '1')
        localStorage.setItem('theme', theme)
        localStorage.setItem('copie:profil', JSON.stringify('eleve'))
        localStorage.setItem('copie:ajoutes', JSON.stringify(parcours))
      },
      { parcours, theme },
    )
    page = await ctx.newPage()
    page.on('pageerror', (e) => erreurs.push(`${appareil}: ${e.message}`))
    essai = page.locator('section[aria-label="Nouvel essai"]')
    proposer = page.getByRole('button', { name: BOUTON })
    await page.goto(base)
    await pagePrete(page)
    await page.getByRole('button', { name: new RegExp(`^${titre}`) }).first().click()
    await pagePrete(page)
    await page.getByRole('button', { name: /^Commencer/ }).first().click()
    await page.getByRole('tablist', { name: 'Questions' }).waitFor({ timeout: 120_000 })
    await pagePrete(page)
  }

  // ---------- Par défaut : proposé après une erreur ----------
  await ouvrir('Essai par défaut')
  ok((await proposer.count()) === 0, `${appareil} : rien de proposé avant de répondre`)
  const q1 = await sommeDe(page.locator('main'))
  await verifierPrincipale(page, '999')
  ok((await proposer.count()) === 1, `${appareil} : « Réessayer avec d’autres valeurs » après une réponse incorrecte`)
  ok(/0\/3/.test(await score(page)), `${appareil} : score 0/3 après l'erreur`)
  await page.screenshot({ path: `${captures}/reessayer-1-propose-${theme}.png` })
  await toucher(page, proposer)
  ok((await essai.count()) === 1, `${appareil} : le nouvel essai s'affiche sous la correction`)
  ok(/ne compte pas dans le score/.test(await essai.innerText()), `${appareil} : « ne compte pas dans le score » est écrit`)
  ok((await proposer.count()) === 0, `${appareil} : plus de bouton tant que le nouvel essai n'est pas vérifié`)
  const e1 = await sommeDe(essai)
  ok(e1.tex !== q1.tex, `${appareil} : d'autres valeurs (${q1.tex.trim()} puis ${e1.tex.trim()})`)
  await page.screenshot({ path: `${captures}/reessayer-2-essai-${theme}.png` })
  // Nouvel essai manqué : proposé de nouveau
  await taperDans(page, essai.locator('math-field').first(), '999')
  await pagePrete(page)
  await toucher(page, essai.getByRole('button', { name: 'Vérifier' }))
  ok((await essai.locator('.pastille-verification').innerText()) === 'Incorrecte', `${appareil} : nouvel essai manqué, « Incorrecte »`)
  ok((await proposer.count()) === 1, `${appareil} : proposé de nouveau après un nouvel essai manqué`)
  await toucher(page, proposer)
  const e2 = await sommeDe(essai)
  ok((await essai.locator('.pastille-verification').count()) === 0, `${appareil} : deuxième nouvel essai, question vierge`)
  // Nouvel essai réussi : plus rien à proposer, le score ne bouge pas
  await taperDans(page, essai.locator('math-field').first(), e2.somme)
  await pagePrete(page)
  await toucher(page, essai.getByRole('button', { name: 'Vérifier' }))
  ok((await essai.locator('.pastille-verification').innerText()) === 'Correcte', `${appareil} : nouvel essai réussi (${e2.tex.trim()} = ${e2.somme}), « Correcte »`)
  ok((await proposer.count()) === 0, `${appareil} : rien de proposé après un nouvel essai réussi`)
  ok(/0\/3/.test(await score(page)), `${appareil} : le score reste 0/3 (première vérification)`)
  await page.screenshot({ path: `${captures}/reessayer-3-reussi-${theme}.png` })

  // Question suivante : réponse correcte, rien de proposé
  await toucher(page, page.locator('footer').getByRole('button', { name: 'Question suivante' }))
  ok((await essai.count()) === 0, `${appareil} : la question suivante n'a pas de nouvel essai`)
  const q2 = await sommeDe(page.locator('main'))
  await verifierPrincipale(page, q2.somme)
  ok(/1\/3/.test(await score(page)), `${appareil} : réponse correcte comptée (1/3)`)
  ok((await proposer.count()) === 0, `${appareil} : rien de proposé après une réponse correcte`)
  // Retour à la question 1 : l'essai n'est pas gardé, il se propose encore
  await page.getByRole('tablist', { name: 'Questions' }).getByRole('tab').nth(0).click()
  await pagePrete(page)
  ok((await essai.count()) === 0 && (await proposer.count()) === 1, `${appareil} : de retour sur la question manquée, le nouvel essai se propose encore`)
  // Dernière question manquée, puis bilan : seul le premier essai compte
  await page.getByRole('tablist', { name: 'Questions' }).getByRole('tab').nth(2).click()
  await pagePrete(page)
  await verifierPrincipale(page, '999')
  await toucher(page, proposer)
  const e3 = await sommeDe(essai)
  await taperDans(page, essai.locator('math-field').first(), e3.somme)
  await pagePrete(page)
  await toucher(page, essai.getByRole('button', { name: 'Vérifier' }))
  await toucher(page, page.locator('footer').getByRole('button', { name: 'Voir le bilan' }))
  await page.getByText('1 / 3').waitFor({ timeout: 30_000 })
  ok(true, `${appareil} : bilan 1 / 3, les nouveaux essais ne comptent pas`)
  await page.screenshot({ path: `${captures}/reessayer-4-bilan-${theme}.png` })

  // ---------- Réglage du parcours : reessayer false ----------
  await ouvrir('Essai refusé')
  await verifierPrincipale(page, '999')
  ok(/0\/3/.test(await score(page)) && (await proposer.count()) === 0, `${appareil} : « reessayer: false », rien de proposé après une erreur`)

  // ---------- Correction à la fin : jamais ----------
  await ouvrir('Essai à la fin')
  for (let i = 0; i < 3; i++) {
    await taperDans(page, page.locator('main math-field').first(), '999')
    await pagePrete(page)
    ok((await proposer.count()) === 0, `${appareil} : correction à la fin, question ${i + 1}, rien de proposé`)
    await toucher(page, page.locator('footer').getByRole('button', { name: i < 2 ? 'Question suivante' : 'Soumettre la tentative' }))
  }
  await page.locator('.pastille-verification').first().waitFor({ timeout: 30_000 })
  await pagePrete(page)
  ok((await proposer.count()) === 0, `${appareil} : correction à la fin, relecture sans nouvel essai`)
  await ctx.close()
}

ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
