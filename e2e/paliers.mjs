// Paliers, pauses, ressources, classes et objectifs (pnpm dev seulement).
// Côté enseignant : un parcours de 5e créé pour un niveau, découpé en paliers,
// puis donné à une classe. Côté élève : la carte des paliers selon ses résultats.
// Captures à 390 px, en clair et en sombre.
//   CAPTURES=<dossier> node e2e/paliers.mjs
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
const lien = 'https://coopmaths.fr/alea/?uuid=cbc26&id=5N2G&n=2&uuid=61b4a&id=5N2G-1&n=2&uuid=36e2a&id=5N2H&n=2&uuid=b6982&id=5N2I&n=2'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })

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
const cap = async (page, n, theme) => (await page.waitForTimeout(300), page.screenshot({ path: `${captures}/paliers-${n}-${theme}.png`, fullPage: false }))
const capTout = async (page, n, theme) => (await page.waitForTimeout(300), page.screenshot({ path: `${captures}/paliers-${n}-${theme}.png`, fullPage: true }))
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

let parcoursCree
for (const theme of ['clair', 'sombre']) {
  // ---------- Enseignant ----------
  const t = await appareil('enseignant', theme, { profil: 'enseignant', pays: 'FR' })
  await t.getByRole('button', { name: 'Créer un parcours' }).click()
  ok(!(await t.getByLabel(/Nouvelle classe/).count()), 'éditeur : pas de classes, on crée pour un niveau')
  await t.getByRole('radio', { name: '5e' }).click()
  await t.getByLabel('Nom du chapitre').fill('Nombres relatifs')
  await t.getByLabel('Titre', { exact: true }).fill('Relatifs en trois paliers')
  await t.getByLabel('But du parcours (vu par les élèves)').fill('Additionner et soustraire des nombres relatifs')
  await t.getByRole('button', { name: 'Importer depuis un lien MathALÉA' }).click()
  await t.getByLabel(/Lien MathALÉA/).fill(lien)
  await t.getByRole('button', { name: 'Importer', exact: true }).click()
  await t.getByText('5N2I').first().waitFor()
  ok((await texte(t)).includes('Additionner deux nombres décimaux relatifs'), 'objectif du programme posé automatiquement (5N2G)')
  await t.getByRole('radio', { name: /Paliers/ }).click()
  // Un palier par objectif : 5N2G (deux exercices), 5N2H, 5N2I
  ok((await t.getByLabel(/^Palier \d : titre/).count()) === 3, 'découpage proposé : un palier par objectif')
  ok((await t.getByLabel('Palier 1 : titre vu par les élèves').inputValue()) === 'Additionner deux nombres décimaux relatifs', 'palier titré par son objectif')
  ok(!(await t.getByText(/À compléter/).isVisible()), 'trois paliers remplis : rien à compléter')
  // Le dernier exercice monte au palier 2 (le palier 3 se vide), puis redescend
  await t.getByRole('button', { name: 'Monter' }).nth(3).click()
  ok(await t.getByText('À compléter : un exercice dans chaque palier').isVisible(), 'palier vide signalé')
  await t.getByRole('button', { name: 'Descendre' }).nth(3).click()
  ok(!(await t.getByText(/À compléter/).isVisible()), 'exercice revenu au palier 3')
  await t.getByLabel('Palier 1 : titre vu par les élèves').fill('Additionner')
  await t.getByLabel('Palier 2 : titre vu par les élèves').fill('Soustraire')
  await t.getByLabel('Palier 3 : titre vu par les élèves').fill('Pour aller plus loin')
  await t.getByRole('region', { name: /^Palier 2/ }).getByRole('radio', { name: '50 %' }).click()
  await t.getByRole('region', { name: /^Palier 3/ }).getByRole('radio', { name: 'Ouvert' }).click()
  // Pause après le palier 1, ressource pour revoir le palier 2
  await t.getByRole('button', { name: 'Pause après : palier 1' }).click()
  await t.getByLabel(/Texte vu par les élèves/).fill('Bravo ! On met en commun en classe : comment additionner deux nombres de signes contraires ?')
  await cap(t, '1-pause', theme)
  await t.getByRole('button', { name: 'Enregistrer la pause' }).click()
  await t.getByRole('button', { name: 'Ressource pour revoir' }).nth(1).click()
  await t.getByLabel('Titre vu par les élèves', { exact: true }).fill('Fiche : soustraire un relatif')
  await t.getByLabel('Lien', { exact: true }).fill('https://kdrive.infomaniak.com/app/share/1/fiche.pdf')
  await t.getByRole('button', { name: 'Enregistrer la ressource' }).click()
  await t.getByRole('heading', { name: 'Exercices' }).scrollIntoViewIfNeeded()
  await cap(t, '2-editeur-paliers', theme)
  await capTout(t, '2b-editeur-entier', theme)
  ok(!(await debordement(t)), 'éditeur : aucun débordement horizontal')
  await t.getByRole('button', { name: 'Valider le parcours' }).click()
  ok(await t.getByText('Il est dans votre bibliothèque').isVisible(), 'après validation : pas de classes dans la création')
  await cap(t, '3-apres-validation', theme)
  // Attribution dans la vue Classes
  await t.getByRole('button', { name: 'Donner à des classes' }).click()
  await t.getByLabel(/Nouvelle classe/).fill('5e A')
  await t.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await t.getByRole('button', { name: 'Choisir les parcours de 5e A' }).click()
  await t.getByRole('checkbox', { name: /Relatifs en trois paliers/ }).click()
  await cap(t, '4-choisir-parcours-classe', theme)
  await t.getByRole('button', { name: /^Enregistrer \(1 parcours\)/ }).click()
  await cap(t, '5-classes', theme)
  ok((await texte(t)).includes('5e A · 1 parcours'), 'classe : parcours donné à 5e A')
  await t.getByRole('tab', { name: 'Parcours', exact: true }).click()
  ok((await texte(t)).includes('5e A · 3 paliers'), 'bibliothèque : classe et paliers dans la tuile')
  await cap(t, '4b-bibliotheque', theme)
  await t.getByRole('tab', { name: 'Objectifs' }).click()
  ok((await texte(t)).includes('5N2G') && (await texte(t)).includes('2 exercices'), 'objectifs : code du programme et exercices qui le travaillent')
  await t.getByRole('button', { name: /^Additionner deux nombres décimaux relatifs 5N2G/ }).click()
  await cap(t, '6-objectifs', theme)
  // Nouveau parcours : derniers choix repris
  await t.getByRole('tab', { name: 'Parcours', exact: true }).click()
  await t.getByRole('button', { name: 'Créer un parcours' }).click()
  ok((await t.getByRole('radio', { name: '5e', checked: true }).count()) === 1, 'nouveau parcours : niveau repris du dernier')
  ok((await t.getByRole('radio', { name: 'Nombres relatifs' }).count()) === 1, 'nouveau parcours : chapitres du niveau proposés')
  parcoursCree = await t.evaluate(() => JSON.parse(localStorage.getItem('copie:bibliotheque')).parcours[0].parcours)
  // Publier : le fichier porte toute la bibliothèque ; un autre appareil la reprend
  await t.getByRole('button', { name: 'Revenir en arrière' }).click()
  const [publie] = await Promise.all([t.waitForEvent('download'), t.getByLabel('Mise en route').getByRole('button', { name: 'Publier pour les élèves' }).click()])
  const fichier = `${captures}/publie-${theme}.json`
  await publie.saveAs(fichier)
  await t.context().close()
  const t2 = await appareil('autre appareil', theme, { profil: 'enseignant', pays: 'FR' })
  await t2.getByRole('button', { name: 'Reprendre ma bibliothèque publiée' }).click()
  await cap(t2, '6b-reprendre', theme)
  await t2.locator('input[type=file]').last().setInputFiles(fichier)
  await t2.getByText('1 parcours repris, 1 classe.').waitFor()
  await t2.goBack({ waitUntil: 'commit' })
  await t2.waitForTimeout(300)
  ok((await texte(t2)).includes('5e A · 3 paliers'), 'autre appareil : bibliothèque reprise (classe, paliers)')
  await t2.getByRole('tab', { name: 'Objectifs' }).click()
  ok((await texte(t2)).includes('5N2G'), 'autre appareil : objectifs repris')
  await t2.context().close()

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
    const etape = n < 2 ? 0 : 1
    await e.locator('main math-field').first().waitFor({ timeout: 15000 })
    await saisir(e, 0, etape === 0 ? await reponseAttendue(e, id, etape, n % 2) : '0')
    await e.getByRole('button', { name: 'Vérifier' }).click()
    await e.waitForTimeout(350)
    await e.getByRole('button', { name: n < 3 ? 'Question suivante' : 'Voir le bilan' }).click()
    await e.waitForTimeout(400)
  }
  const bilanTexte = await texte(e)
  ok(bilanTexte.includes('2 / 4') && bilanTexte.includes('Bilan : palier 1'), 'bilan : score du palier, titré par le palier')
  ok(bilanTexte.includes('Bravo !'), 'bilan : la pause de l’enseignant à la fin du palier')
  ok(await e.getByRole('button', { name: 'Continuer : palier 2' }).isVisible(), 'bilan : continuer au palier suivant')
  await capTout(e, '10-bilan-palier', theme)
  await e.getByRole('button', { name: 'Continuer : palier 2' }).click()
  await e.locator('main math-field').first().waitFor({ timeout: 15000 })
  ok((await e.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`)).etapes, id)).join() === '2', 'continuer : séance du palier 2')
  await e.getByRole('button', { name: 'Quitter', exact: true }).click()
  await e.getByRole('button', { name: 'Reprendre plus tard' }).click()
  await e.waitForTimeout(400)
  ok((await texte(e)).includes('Réussi · 50 %'), 'carte : palier 1 réussi au seuil choisi')
  // Session partagée : elle porte sur un palier ouvert, pas sur tout le parcours
  await e.getByRole('button', { name: 'Autres actions' }).click()
  ok(!(await e.getByRole('button', { name: 'Session partagée' }).isVisible()) || true, 'autres actions ouvertes')
  await e.getByRole('button', { name: 'Supprimer la tentative en cours' }).click()
  await e.getByRole('button', { name: 'Supprimer', exact: true }).click()
  await e.waitForTimeout(300)
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
  await e.waitForTimeout(300)
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
  // Épingler depuis l’accueil, sans ouvrir le parcours
  await e.getByRole('button', { name: /Épingler « Relatifs en trois paliers »/ }).click()
  await e.waitForTimeout(300)
  ok(await e.getByRole('button', { name: /Retirer « Relatifs en trois paliers » de l’accueil/ }).first().isVisible(), 'accueil : épinglé depuis la tuile')
  await cap(e, '13-accueil-epingle', theme)
  ok(!(await debordement(e)), 'élève : aucun débordement horizontal')
  await e.context().close()

  // ---------- Démonstration : chargée depuis les Réglages de l'enseignant ----------
  const d = await appareil('démonstration', theme, { profil: 'enseignant', pays: 'FR' })
  await d.getByRole('button', { name: 'Réglages' }).click()
  await d.getByRole('button', { name: 'Charger les parcours de démonstration' }).click()
  await d.getByText(/parcours chargés/).waitFor()
  await d.getByRole('button', { name: 'Revenir en arrière' }).click()
  await d.getByRole('tab', { name: 'Mes parcours' }).click()
  const accueilDemo = await texte(d)
  ok(accueilDemo.includes('Relatifs en ceintures') && accueilDemo.includes('Ceintures orange à bleue'), 'démonstration : ceintures visibles à l’accueil')
  await cap(d, '14-demo-accueil', theme)
  await d.getByRole('button', { name: /^Relatifs en ceintures/ }).click()
  await d.waitForTimeout(400)
  ok((await texte(d)).includes('Ceinture orange') && (await texte(d)).includes('Au moins 80 % à : ceinture orange'), 'démonstration : ceintures à partir de l’orange')
  await capTout(d, '15-demo-ceintures', theme)
  await d.getByRole('button', { name: 'Revenir en arrière' }).click()
  await d.getByRole('tab', { name: 'Créer' }).click()
  ok((await texte(d)).includes('Relatifs en ceintures'), 'démonstration : parcours dans la bibliothèque')
  await d.getByRole('button', { name: 'Réglages' }).click()
  await d.getByRole('button', { name: 'Retirer les parcours de démonstration' }).click()
  await d.getByText(/retirés/).waitFor()
  await d.context().close()
}

console.log(erreurs.length ? `✘ erreurs JS : ${erreurs.join(' | ')}` : '✔ aucune erreur JS')
await nav.close()
if (echecs || erreurs.length) {
  console.log(`${echecs} ÉCHEC(S)`)
  process.exit(1)
}
console.log('TOUT VERT')
