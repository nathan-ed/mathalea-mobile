// Vitrine : captures des écrans principaux avec de vrais parcours de l'Explorer
// et un élève qui avance (accueil, page d'un parcours, question, correction,
// bilan, accueil après, Explorer, Suivi, Fiches, Réglages). Sert à comparer
// une refonte d'interface avant et après (Nathan, 26 novembre 2026). Ce n'est
// pas une suite de vérification : aucun échec, seulement des captures.
// Petit téléphone clair (360 × 780, celui de Rémi) et téléphone sombre (390 × 844).
//   CAPTURES=<dossier> node e2e/vitrine.mjs   (app construite servie sur 1420, ou BASE)
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { pagePrete, pointStable, SANS_BRIDAGE, taperDans } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
const parcours = JSON.parse(readFileSync(new URL('../explorer/fr-college.json', import.meta.url), 'utf8')).classes.flatMap((c) => c.parcours)
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })

for (const [nom, theme, ecran] of [
  ['petit', 'clair', { viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['moyen', 'sombre', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
]) {
  const ctx = await nav.newContext(ecran)
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript(
    ({ parcours, theme }) => {
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      localStorage.setItem('theme', theme)
      localStorage.setItem('copie:profil', JSON.stringify('eleve'))
      localStorage.setItem('copie:ajoutes', JSON.stringify(parcours))
      localStorage.setItem('copie:explorer', JSON.stringify(parcours))
    },
    { parcours, theme },
  )
  const page = await ctx.newPage()
  await page.clock.install({ time: new Date('2026-11-26T09:00:00') })
  await page.goto(base)
  await pagePrete(page)
  let n = 0
  const capture = async (ecranNom, pleine = false) => {
    await pagePrete(page).catch(() => {})
    await page.waitForTimeout(400) // fin des animations d'écran, pour la capture seulement
    n++
    await page.screenshot({ path: `${captures}/vitrine-${nom}-${String(n).padStart(2, '0')}-${ecranNom}.png`, fullPage: pleine })
    console.log('capture', nom, ecranNom)
  }
  const toucher = async (cible) => {
    await cible.scrollIntoViewIfNeeded()
    const pt = await pointStable(cible)
    await page.mouse.click(pt.x, pt.y)
    await pagePrete(page)
  }
  const etape = async (titre, fn) => {
    try {
      await fn()
    } catch (e) {
      console.log('étape sautée :', titre, '-', e.message.split('\n')[0])
    }
  }
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

  await page.getByRole('tab', { name: 'Mes parcours' }).waitFor({ timeout: 60_000 })
  await capture('accueil')
  await capture('accueil-entier', true)

  const p = parcours[0]
  await etape('page du parcours', async () => {
    await toucher(page.getByRole('button', { name: new RegExp(`^${p.titre}`) }).first())
    await capture('parcours')
    await capture('parcours-entier', true)
  })
  await etape('séance', async () => {
    await toucher(page.getByRole('button', { name: /^(Commencer|Continuer)/ }).first())
    const entrainement = page.getByRole('button', { name: 'Commencer l’entraînement' })
    if (await entrainement.isVisible({ timeout: 5000 }).catch(() => false)) {
      await capture('fiche')
      await capture('fiche-entiere', true)
      await toucher(entrainement)
    }
    for (let rang = 0; rang < 12; rang++) {
      const champ = page.locator('main math-field').first()
      await champ.waitFor({ timeout: 90_000 })
      await pagePrete(page)
      if (rang === 0) await capture('question')
      await taperDans(page, champ, rang === 1 ? '999' : await reponseAttendue(p.id, rang))
      await pagePrete(page)
      await toucher(page.locator('footer').getByRole('button', { name: 'Vérifier', exact: true }))
      if (rang === 0) await capture('correcte')
      if (rang === 1) await capture('incorrecte')
      const suite = page.locator('footer').getByRole('button', { name: /Question suivante|Voir le bilan/ })
      const libelle = await suite.innerText()
      await toucher(suite)
      if (/bilan/.test(libelle)) break
    }
    await capture('bilan')
    await capture('bilan-entier', true)
  })
  await etape('retour à l’accueil', async () => {
    for (let i = 0; i < 5 && !(await page.getByRole('tab', { name: 'Mes parcours' }).isVisible().catch(() => false)); i++) {
      await page.goBack()
      await pagePrete(page)
    }
    await toucher(page.getByRole('tab', { name: 'Mes parcours' }))
    await capture('accueil-apres')
  })
  for (const onglet of ['Explorer', 'Suivi', 'Fiches']) {
    await etape(onglet, async () => {
      await toucher(page.getByRole('tab', { name: onglet }))
      await capture(onglet.toLowerCase())
    })
  }
  await etape('Réglages', async () => {
    await toucher(page.getByRole('tab', { name: 'Mes parcours' }))
    await toucher(page.getByRole('button', { name: 'Réglages' }))
    await capture('reglages')
  })
  await ctx.close()
}
await nav.close()
