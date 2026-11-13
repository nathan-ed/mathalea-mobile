// Accueil : une seule action proposée (Nathan, 13 novembre 2026 : « en haut
// une seule action proposée : reprendre la séance, sinon la révision du jour,
// sinon la prochaine ceinture »). Rien tant que rien n'est commencé ; séance
// quittée : « Reprendre » ; ceinture obtenue : « Passer la ceinture verte » ;
// une semaine après : « Réviser maintenant », qui passe avant la ceinture.
// Chaque bouton mène où il le dit. Téléphone (clair) et bureau (sombre).
//   CAPTURES=<dossier> node e2e/accueil-action.mjs   (app construite servie sur 1420, ou BASE)
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

const p = {
  id: 'action',
  version: 1,
  titre: 'Relatifs en deux ceintures',
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
    { uuid: '36e2a', id: '5N2H', nbQuestions: 2, titre: 'Additionner plusieurs nombres relatifs' },
  ],
  paliers: [
    { titre: 'Additionner', nb: 1 },
    { titre: 'Enchaîner', nb: 1, acces: 'seuil', seuil: 80 },
  ],
}

for (const [appareil, theme, ecran] of [
  ['téléphone', 'clair', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['bureau', 'sombre', { viewport: { width: 1280, height: 800 } }],
]) {
  const ctx = await nav.newContext(ecran)
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
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
  await page.clock.install({ time: new Date('2026-10-19T09:00:00') })
  await page.goto(base)
  await pagePrete(page)

  const texte = async () => (await page.locator('body').innerText()).replace(/\s+/g, ' ')
  const toucher = async (bouton) => {
    await bouton.scrollIntoViewIfNeeded()
    const pt = await pointStable(bouton)
    await page.mouse.click(pt.x, pt.y)
    await pagePrete(page)
  }
  /** Réponse attendue par MathALÉA pour la question affichée (rang dans la séance) */
  const reponseAttendue = (id, rang) =>
    page.evaluate(
      async ({ id, rang }) => {
        const s = JSON.parse(localStorage.getItem(`copie:seance:${id}`))
        const [e, q] = (s.ordre?.[rang] ?? `${s.etapes[0]}-${rang}`).split('-').map(Number)
        const man = await (await fetch('/moteur/manifest.json')).json()
        const m = await import('/moteur/' + man.entree)
        const ex = await m.preparerExercice({ ...s.contenu.etapes[e], alea: s.graines[e] }, 90 + e)
        return String(ex.interne.autoCorrection[q]?.valeur?.reponse?.value)
      },
      { id, rang },
    )
  /** Répond aux questions de la séance (juste ou non), jusqu'au bilan */
  const repondre = async (id, total, juste) => {
    await page.locator('main math-field').first().waitFor({ timeout: 120_000 })
    await pagePrete(page)
    for (let rang = 0; rang < total; rang++) {
      await taperDans(page, page.locator('main math-field').first(), juste ? await reponseAttendue(id, rang) : '999')
      await pagePrete(page)
      await toucher(page.locator('footer').getByRole('button', { name: 'Vérifier', exact: true }))
      await toucher(page.locator('footer').getByRole('button', { name: rang + 1 < total ? 'Question suivante' : 'Voir le bilan' }))
    }
  }
  const versAccueil = async () => {
    for (let i = 0; i < 4 && !(await page.getByRole('tab', { name: 'Mes parcours' }).isVisible().catch(() => false)); i++) {
      await page.getByRole('button', { name: /Revenir en arrière|Terminer/ }).first().click()
      await pagePrete(page)
    }
    await page.getByRole('tab', { name: 'Mes parcours' }).click()
    await pagePrete(page)
  }

  const action = page.locator('section[aria-label="À faire maintenant"]')
  const seance = (id) => page.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`)), id)
  const repondreUne = async (id, rang) => {
    await page.locator('main math-field').first().waitFor({ timeout: 120_000 })
    await pagePrete(page)
    await taperDans(page, page.locator('main math-field').first(), await reponseAttendue(id, rang))
    await pagePrete(page)
    await toucher(page.locator('footer').getByRole('button', { name: 'Vérifier', exact: true }))
  }

  // ---------- Rien de commencé : rien de proposé ----------
  await page.getByRole('button', { name: /^Relatifs en deux ceintures/ }).first().waitFor({ timeout: 60_000 })
  ok((await action.count()) === 0, `${appareil} : rien de commencé, aucune action proposée`)

  // ---------- Séance quittée après une question : « Reprendre » ----------
  await page.getByRole('button', { name: /^Relatifs en deux ceintures/ }).first().click()
  await pagePrete(page)
  await page.getByRole('button', { name: /^Commencer/ }).first().click()
  await repondreUne('action', 0)
  await toucher(page.getByRole('button', { name: 'Quitter', exact: true }))
  await toucher(page.getByRole('button', { name: 'Reprendre plus tard' }))
  await action.waitFor({ timeout: 30_000 })
  let t = (await action.innerText()).replace(/\s+/g, ' ')
  ok(t.includes('Relatifs en deux ceintures · question 2 sur 2') && (await action.getByRole('button').innerText()) === 'Reprendre', `${appareil} : séance quittée, « Reprendre » (${t})`)
  await page.screenshot({ path: `${captures}/accueil-action-1-reprendre-${theme}.png` })
  await toucher(action.getByRole('button'))
  // La séance rouvre où elle a été quittée : la question 1, déjà vérifiée
  await page.locator('footer').getByRole('button', { name: 'Question suivante' }).waitFor({ timeout: 120_000 })
  await pagePrete(page)
  ok((await page.locator('main .pastille-verification').count()) === 1, `${appareil} : « Reprendre » rouvre la séance, la question 1 est restée vérifiée`)
  await toucher(page.locator('footer').getByRole('button', { name: 'Question suivante' }))
  await repondreUne('action', 1)
  await toucher(page.locator('footer').getByRole('button', { name: 'Voir le bilan' }))
  await page.getByText('Ceinture orange obtenue').waitFor({ timeout: 30_000 })
  await toucher(page.getByRole('button', { name: 'Voir la carte du parcours' }))
  await versAccueil()

  // ---------- Ceinture obtenue : la suivante est proposée ----------
  await action.waitFor({ timeout: 30_000 })
  t = (await action.innerText()).replace(/\s+/g, ' ')
  ok(t.includes('Relatifs en deux ceintures · Enchaîner') && (await action.getByRole('button').innerText()) === 'Passer la ceinture verte', `${appareil} : ceinture orange obtenue, « Passer la ceinture verte » (${t})`)
  await page.screenshot({ path: `${captures}/accueil-action-2-ceinture-${theme}.png` })
  await toucher(action.getByRole('button'))
  await page.locator('main math-field').first().waitFor({ timeout: 120_000 })
  ok((await seance('action')).etapes.join() === '1', `${appareil} : le bouton lance la ceinture verte`)
  await toucher(page.getByRole('button', { name: 'Quitter', exact: true }))
  await toucher(page.getByRole('button', { name: 'Supprimer la tentative' }))
  await toucher(page.getByRole('button', { name: 'Supprimer', exact: true }))
  await versAccueil()

  // ---------- Une semaine après : la révision du jour passe avant ----------
  await page.clock.setSystemTime(new Date('2026-10-26T09:00:00'))
  await page.reload()
  await page.getByRole('tab', { name: 'Mes parcours' }).click({ timeout: 60_000 })
  await action.waitFor({ timeout: 60_000 })
  await pagePrete(page)
  t = (await action.innerText()).replace(/\s+/g, ' ')
  ok(t.includes('Révision du jour · 1 question') && (await action.getByRole('button').innerText()) === 'Réviser maintenant', `${appareil} : une semaine après, « Réviser maintenant » (${t})`)
  await page.screenshot({ path: `${captures}/accueil-action-3-reviser-${theme}.png` })
  await toucher(action.getByRole('button'))
  await repondre('revisions', 1, true)
  await page.getByRole('button', { name: 'Terminer' }).waitFor({ timeout: 30_000 })
  ok((await seance('revisions')).parcours === 'revisions', `${appareil} : le bouton lance la révision`)
  await versAccueil()
  await action.waitFor({ timeout: 30_000 })
  ok((await action.getByRole('button').innerText()) === 'Passer la ceinture verte', `${appareil} : révision faite, la ceinture verte est de nouveau proposée`)
  await ctx.close()
}

ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
