// Barrettes des ceintures (Nathan, 13 novembre 2026) : comme au judo, une
// ceinture obtenue gagne une barrette quand ses exercices sont réussis de
// nouveau en révision une semaine plus tard, une deuxième trois semaines
// après (« ceinture durable »). Une révision manquée ensuite ne retire rien.
// Joué comme un élève, l'horloge du navigateur avancée : ceinture obtenue,
// révisions, bilan (« Barrette gagnée »), Suivi et carte du parcours.
// Téléphone (clair) et bureau (sombre).
//   CAPTURES=<dossier> node e2e/barrettes.mjs   (app construite servie sur 1420, ou BASE)
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
  id: 'barrettes',
  version: 1,
  titre: 'Barrettes des relatifs',
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
  /** Avance l'horloge, relance l'app sur l'accueil et fait la révision du jour (une question) */
  const reviser = async (jour, juste) => {
    await page.clock.setSystemTime(new Date(`${jour}T09:00:00`))
    await page.reload()
    await page.getByRole('tab', { name: 'Mes parcours' }).click({ timeout: 60_000 })
    const tuile = page.getByRole('button', { name: /^Révisions/ })
    await tuile.waitFor({ timeout: 60_000 })
    await pagePrete(page)
    ok((await tuile.innerText()).includes('À revoir aujourd’hui'), `${appareil}, ${jour} : la tuile Révisions annonce une révision`)
    await toucher(tuile)
    await toucher(page.getByRole('button', { name: 'Commencer', exact: true }))
    await repondre('revisions', 1, juste)
    await page.getByRole('button', { name: 'Terminer' }).waitFor({ timeout: 30_000 })
    await pagePrete(page)
    return texte()
  }
  /** Ceinture orange dans le Suivi : son libellé pour les lecteurs d'écran et ses barrettes dessinées */
  const dansLeSuivi = async () => {
    await page.getByRole('tab', { name: 'Suivi' }).click()
    await page.getByRole('tab', { name: 'Ceintures' }).click()
    await pagePrete(page)
    const orange = page.locator('li[aria-label^="Ceinture orange"]')
    return { libelle: await orange.getAttribute('aria-label'), dessinees: await orange.locator('.barrette').count() }
  }
  const versAccueil = async () => {
    for (let i = 0; i < 4 && !(await page.getByRole('tab', { name: 'Mes parcours' }).isVisible().catch(() => false)); i++) {
      await page.getByRole('button', { name: /Revenir en arrière|Terminer/ }).first().click()
      await pagePrete(page)
    }
    await page.getByRole('tab', { name: 'Mes parcours' }).click()
    await pagePrete(page)
  }

  // ---------- Lundi : ceinture orange obtenue, sans barrette ----------
  await page.getByRole('button', { name: /^Barrettes des relatifs/ }).first().click()
  await pagePrete(page)
  await page.getByRole('button', { name: /^Commencer/ }).first().click()
  await repondre('barrettes', 2, true)
  await page.getByText('Ceinture orange obtenue').waitFor({ timeout: 30_000 })
  ok(!(await texte()).includes('gagnée'), `${appareil} : ceinture obtenue, pas encore de barrette au bilan`)
  await toucher(page.getByRole('button', { name: 'Voir la carte du parcours' }))
  await versAccueil()
  let s = await dansLeSuivi()
  ok(s.libelle === 'Ceinture orange : obtenue' && s.dessinees === 0, `${appareil} : Suivi, ceinture obtenue sans barrette (${s.libelle})`)
  ok((await texte()).includes('Une ceinture gagne une barrette'), `${appareil} : Suivi, la règle des barrettes est écrite`)

  // ---------- Une semaine après : révision réussie, première barrette ----------
  let bilan = await reviser('2026-10-26', true)
  ok(bilan.includes('Barrette gagnée') && bilan.includes('Ceinture orange · Relatifs') && bilan.includes('1 barrette sur 2'), `${appareil} : bilan de la révision, « Barrette gagnée », 1 barrette sur 2`)
  ok((await page.locator('section[aria-label="Barrettes gagnées"] .barrette').count()) === 1, `${appareil} : la ceinture du bilan porte une barrette`)
  await page.screenshot({ path: `${captures}/barrettes-1-gagnee-${theme}.png`, fullPage: true })
  await versAccueil()
  s = await dansLeSuivi()
  ok(s.libelle === 'Ceinture orange : obtenue, 1 barrette sur 2' && s.dessinees === 1, `${appareil} : Suivi, une barrette (${s.libelle})`)
  await page.screenshot({ path: `${captures}/barrettes-2-suivi-${theme}.png`, fullPage: true })
  await page.getByRole('tab', { name: 'Mes parcours' }).click()
  await page.getByRole('button', { name: /^Barrettes des relatifs/ }).first().click()
  await pagePrete(page)
  ok((await texte()).includes('Réussi · 100 % · 1 barrette sur 2'), `${appareil} : carte du parcours, la ceinture orange et sa barrette`)
  ok((await page.locator('section[aria-label^="Ceinture orange"] .barrette').count()) === 1 && (await page.locator('section[aria-label^="Ceinture verte"] .barrette').count()) === 0, `${appareil} : carte, barrette dessinée sur la ceinture obtenue seulement`)
  await page.screenshot({ path: `${captures}/barrettes-3-carte-${theme}.png`, fullPage: true })
  await versAccueil()

  // ---------- Trois semaines après : deuxième barrette, ceinture durable ----------
  bilan = await reviser('2026-11-16', true)
  ok(bilan.includes('Barrette gagnée') && bilan.includes('2 barrettes sur 2 : ceinture durable'), `${appareil} : deuxième barrette, « ceinture durable »`)
  await page.screenshot({ path: `${captures}/barrettes-4-durable-${theme}.png`, fullPage: true })
  await versAccueil()

  // ---------- Deux mois après : révision manquée, rien n'est retiré ----------
  bilan = await reviser('2027-01-11', false)
  ok(!bilan.includes('gagnée'), `${appareil} : révision manquée, aucune barrette annoncée`)
  await versAccueil()
  s = await dansLeSuivi()
  ok(s.libelle === 'Ceinture orange : obtenue, 2 barrettes sur 2 : ceinture durable' && s.dessinees === 2, `${appareil} : Suivi, les deux barrettes restent (${s.libelle})`)
  await ctx.close()
}

ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
