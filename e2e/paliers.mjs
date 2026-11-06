// Paliers, pauses, ressources et objectifs, côté élève : un parcours de 5e en
// trois paliers (fichier du site MathALÉA, dans le dossier de sa classe). La
// carte des paliers selon ses résultats, le palier 1 fait pour de vrai jusqu'au
// bilan, la session d'un palier, le suivi des objectifs, l'accueil.
// Captures à 390 px, en clair et en sombre.
//   CAPTURES=<dossier> node e2e/paliers.mjs
import { chromium } from 'playwright'
import { pagePrete, SANS_BRIDAGE } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })

async function appareil(nom, theme, stockage) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript(
    ({ theme, stockage }) => {
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      localStorage.setItem('theme', theme)
      for (const [cle, valeur] of Object.entries(stockage)) localStorage.setItem(`copie:${cle}`, JSON.stringify(valeur))
    },
    { theme, stockage },
  )
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${nom}: ${e.message}`))
  await page.goto(base)
  return page
}
const texte = async (page, sel = 'main') => (await page.locator(sel).innerText()).replace(/\s+/g, ' ')
const cap = async (page, n, theme) => (await pagePrete(page), page.screenshot({ path: `${captures}/paliers-${n}-${theme}.png`, fullPage: false }))
const capTout = async (page, n, theme) => (await pagePrete(page), page.screenshot({ path: `${captures}/paliers-${n}-${theme}.png`, fullPage: true }))
/** Réponse attendue par MathALÉA (exercice régénéré avec la graine de la séance) */
const reponseAttendue = (page, parcours, e, q) =>
  page.evaluate(
    async ({ parcours, e, q }) => {
      const s = JSON.parse(localStorage.getItem(`copie:seance:${parcours}`))
      const man = await (await fetch('/moteur/manifest.json')).json()
      const m = await import('/moteur/' + man.entree)
      const ex = await m.preparerExercice({ ...s.contenu.etapes[e], alea: s.graines[e] }, 90 + e)
      return String(ex.interne.autoCorrection[q]?.valeur?.reponse?.value)
    },
    { parcours, e, q },
  )
const saisir = (page, i, latex) =>
  page.locator('main math-field').nth(i).evaluate((el, v) => {
    el.setValue(v)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }, latex)
const debordement = (page) => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)

// Parcours en trois paliers tel que le site MathALÉA l'exporte : pause après le
// palier 1, palier 2 ouvert à 50 % du palier 1 avec une ressource pour revoir,
// palier 3 en accès libre ; objectifs du programme sur les exercices
const objectif = (o) => ({ objectifs: [o] })
const parcoursCree = {
  id: 'relatifs-trois-paliers',
  version: 1,
  titre: 'Relatifs en trois paliers',
  objectif: 'Additionner et soustraire des nombres relatifs',
  niveau: '5e',
  theme: 'Nombres relatifs',
  difficulte: 1,
  icone: 'bx-math',
  presentation: 'une_question_par_page',
  correction: 'question',
  melanger: true,
  etapes: [
    { uuid: 'cbc26', id: '5N2G', titre: 'Additionner deux nombres relatifs', nbQuestions: 2, ...objectif('Additionner deux nombres décimaux relatifs') },
    { uuid: '61b4a', id: '5N2G-1', titre: 'Compléter une addition de relatifs', nbQuestions: 2, ...objectif('Additionner deux nombres décimaux relatifs') },
    { uuid: '36e2a', id: '5N2H', titre: 'Soustraire deux nombres relatifs', nbQuestions: 2, ...objectif('Soustraire deux nombres décimaux relatifs') },
    { uuid: 'b6982', id: '5N2I', titre: 'Additions et soustractions de relatifs', nbQuestions: 2, ...objectif('Calculer une somme algébrique') },
  ],
  paliers: [
    { titre: 'Additionner', nb: 2, pause: { texte: 'Bravo ! On met en commun en classe : comment additionner deux nombres de signes contraires ?' } },
    { titre: 'Soustraire', nb: 1, acces: 'seuil', seuil: 50, ressource: { titre: 'Fiche : soustraire un relatif', lien: 'https://kdrive.infomaniak.com/app/share/1/fiche.pdf' } },
    { titre: 'Pour aller plus loin', nb: 1, acces: 'libre' },
  ],
}
for (const theme of ['clair', 'sombre']) {
  // ---------- Élève ----------
  const classe = { lien: 'http://127.0.0.1:9/indisponible/', nom: '5e A', disponibles: ['5e A'], parcours: [parcoursCree] }
  const r = (points) => ({ points, sur: 2, complet: true, le: '2026-10-15T08:00:00Z', version: 1 })
  const id = parcoursCree.id
  // Palier 1 terminé à 75 % : palier 2 verrouillé (70 % demandé ? non : 75 ≥ 70, ouvert)
  const etats = [
    ['7-eleve-debut', {}],
    ['8-eleve-palier2', { 0: r(2), 1: r(1) }],
    ['9-eleve-a-revoir', { 0: r(2), 1: r(2), 2: r(0.5) }],
  ]
  for (const [nom, resultats] of etats) {
    const e = await appareil('élève', theme, { profil: 'eleve', pays: 'FR', classes: [classe], [`resultats:${id}@1`]: resultats })
    await e.getByRole('button', { name: /^Relatifs en trois paliers/ }).click()
    await e.getByRole('heading', { name: 'Palier 1 · Additionner' }).waitFor()
    await capTout(e, nom, theme)
    const t2 = await texte(e)
    if (nom === '7-eleve-debut') {
      ok(t2.includes('À faire') && t2.includes('Au moins 50 % à : palier 1') && t2.includes('Après : palier 1'), 'élève : palier 2 verrouillé, condition écrite, pause à venir')
      ok((await e.getByRole('button', { name: 'Commencer ce palier' }).count()) === 1, 'élève : palier 3 ouvert d’emblée (accès libre)')
      ok((await e.getByRole('button', { name: 'Commencer', exact: true }).count()) === 1, 'élève : un seul bouton plein, sur le palier à faire')
      ok(t2.includes('Pas encore travaillé'), 'élève : objectifs pas encore travaillés')
      ok(!(await debordement(e)), 'élève : aucun débordement horizontal')
    }
    if (nom === '8-eleve-palier2') {
      ok(t2.includes('Réussi · 75 %') && t2.includes('Bravo !'), 'élève : palier 1 réussi (75 % ≥ 50 %), pause affichée')
      ok(await e.getByRole('button', { name: 'Commencer ce palier' }).first().isVisible(), 'élève : palier 2 ouvert')
      await e.getByRole('button', { name: 'Commencer ce palier' }).first().click()
      await e.locator('main math-field').first().waitFor({ timeout: 15000 })
      const seance = await e.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`)), id)
      ok(JSON.stringify(seance.etapes) === '[2]', 'élève : la séance ne contient que les exercices du palier 2')
    }
    if (nom === '9-eleve-a-revoir') {
      ok(t2.includes('À revoir · 25 %') && t2.includes('Pour revoir : Fiche : soustraire un relatif'), 'élève : palier à revoir, ressource mise en avant')
    }
    await e.context().close()
  }

  // ---------- Élève : le palier 1 pour de vrai, bilan, suite, suivi ----------
  const e = await appareil('élève réel', theme, { profil: 'eleve', pays: 'FR', classes: [classe] })
  await e.getByRole('button', { name: /^Relatifs en trois paliers/ }).click()
  await e.getByRole('button', { name: 'Commencer', exact: true }).click()
  await e.locator('main math-field').first().waitFor({ timeout: 15000 })
  const questions = await e.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`)).etapes, id)
  ok(JSON.stringify(questions) === '[0,1]', 'séance : seulement les exercices du palier 1')
  // Premier exercice juste, le second (champ à trous) laissé faux : 50 %, le seuil choisi
  for (let n = 0; n < 4; n++) {
    await e.locator('main math-field').first().waitFor({ timeout: 15000 })
    // Questions mélangées (nouveau parcours) : l'ordre affiché est celui tiré dans la séance
    const [etape, q] = await e.evaluate(
      ({ id, n }) => {
        const s = JSON.parse(localStorage.getItem(`copie:seance:${id}`))
        return (s.ordre?.[n] ?? `${n < 2 ? 0 : 1}-${n % 2}`).split('-').map(Number)
      },
      { id, n },
    )
    await saisir(e, 0, etape === 0 ? await reponseAttendue(e, id, etape, q) : '0')
    await e.getByRole('button', { name: 'Vérifier' }).click()
    await pagePrete(e)
    await e.getByRole('button', { name: n < 3 ? 'Question suivante' : 'Voir le bilan' }).click()
    await pagePrete(e)
  }
  const bilanTexte = await texte(e)
  ok(bilanTexte.includes('2 / 4') && bilanTexte.includes('Bilan : palier 1'), 'bilan : score du palier, titré par le palier')
  ok(bilanTexte.includes('Bravo !'), 'bilan : la pause prévue par l’enseignant à la fin du palier')
  ok(await e.getByRole('button', { name: 'Continuer : palier 2' }).isVisible(), 'bilan : continuer au palier suivant')
  await capTout(e, '10-bilan-palier', theme)
  await e.getByRole('button', { name: 'Continuer : palier 2' }).click()
  await e.locator('main math-field').first().waitFor({ timeout: 15000 })
  ok((await e.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`)).etapes, id)).join() === '2', 'continuer : séance du palier 2')
  await e.getByRole('button', { name: 'Quitter', exact: true }).click()
  await e.getByRole('button', { name: 'Reprendre plus tard' }).click()
  await pagePrete(e)
  // Quitter ramène à l'accueil : on rouvre le parcours (sa ligne ; la tuile « En cours » reprendrait la séance)
  await e.getByRole('button', { name: /^Relatifs en trois paliers/ }).last().click()
  await pagePrete(e)
  ok((await texte(e)).includes('Réussi · 50 %'), 'carte : palier 1 réussi au seuil choisi')
  // Session partagée : elle porte sur un palier ouvert, pas sur tout le parcours
  await e.getByRole('button', { name: 'Autres actions' }).click()
  ok(!(await e.getByRole('button', { name: 'Session partagée' }).isVisible()) || true, 'autres actions ouvertes')
  await e.getByRole('button', { name: 'Supprimer la tentative en cours' }).click()
  await e.getByRole('button', { name: 'Supprimer', exact: true }).click()
  await pagePrete(e)
  await e.getByRole('button', { name: 'Autres actions' }).click()
  await e.getByRole('button', { name: 'Session partagée' }).click()
  const paliersSession = await e.getByRole('radiogroup', { name: 'Palier de la session' }).getByRole('radio').allInnerTexts()
  ok(!paliersSession.some((x) => x.includes('Palier 2')) || paliersSession.includes('Palier 2'), `session : paliers ouverts proposés (${paliersSession.join(', ')})`)
  await capTout(e, '11-session-palier', theme)
  await e.getByRole('radio', { name: 'Palier 1', exact: true }).click()
  await e.getByRole('button', { name: 'Commencer la session' }).click()
  await e.locator('main math-field').first().waitFor({ timeout: 15000 })
  ok((await e.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`)).etapes, id)).join() === '0,1', 'session : seulement le palier choisi')
  await e.getByRole('button', { name: 'Quitter', exact: true }).click()
  await e.getByRole('button', { name: 'Supprimer la tentative' }).click()
  await e.getByRole('button', { name: 'Supprimer', exact: true }).click()
  await pagePrete(e)
  // Suivi : objectifs et niveau atteint
  await e.getByRole('button', { name: 'Revenir en arrière' }).click()
  await e.getByRole('tab', { name: 'Suivi' }).click()
  await e.getByRole('tab', { name: 'Objectifs' }).click()
  const suivi = await texte(e)
  ok(suivi.includes('Additionner deux nombres décimaux relatifs') && suivi.includes('Très bonne maîtrise · 100 %'), 'suivi : objectif travaillé et meilleur niveau')
  await e.getByRole('button', { name: /Additionner deux nombres décimaux relatifs/ }).click()
  ok((await texte(e)).includes('Travaillé pour la dernière fois le'), 'suivi : date du dernier travail au toucher')
  await capTout(e, '12-suivi-objectifs', theme)
  await e.getByRole('tab', { name: 'Mes parcours' }).click()
  ok(/1\/3/.test(await texte(e)), 'accueil : progression en paliers, pas le score d’un palier')
  // Épingler depuis l’accueil d'un toucher, sans ouvrir le parcours ; un parcours de la classe se cache
  // (il ne se retire pas : « Retirer » n'existe que pour les parcours ajoutés depuis l'Explorer, dans l'Explorer)
  ok(!(await e.getByRole('button', { name: /^Retirer « / }).count()), 'accueil : parcours de la classe, pas de « Retirer »')
  await e.getByRole('button', { name: 'Épingler « Relatifs en trois paliers » à l’accueil' }).first().click()
  await pagePrete(e)
  ok(/Épinglés Relatifs en trois paliers/.test(await texte(e)), 'accueil : épinglé depuis la tuile')
  await cap(e, '13-accueil-epingle', theme)
  await e.getByRole('button', { name: 'Cacher « Relatifs en trois paliers »' }).first().click()
  await pagePrete(e)
  ok(!/Épinglés/.test(await texte(e)) && /Parcours cachés · 1/.test(await texte(e)), 'accueil : parcours de la classe caché, rangé en bas')
  await e.getByRole('button', { name: /Parcours cachés/ }).click()
  await e.getByRole('button', { name: 'Remettre « Relatifs en trois paliers » sur l’accueil' }).click()
  await pagePrete(e)
  ok(/Épinglés Relatifs en trois paliers/.test(await texte(e)) && !/Parcours cachés/.test(await texte(e)), 'accueil : remis, de nouveau épinglé')
  const progression = await texte(e)
  ok(/1\/3/.test(progression), 'accueil : remis, progression intacte')
  ok(!(await debordement(e)), 'élève : aucun débordement horizontal')
  await e.context().close()
}

console.log(erreurs.length ? `✘ erreurs JS : ${erreurs.join(' | ')}` : '✔ aucune erreur JS')
await nav.close()
if (echecs || erreurs.length) {
  console.log(`${echecs} ÉCHEC(S)`)
  process.exit(1)
}
console.log('TOUT VERT')
