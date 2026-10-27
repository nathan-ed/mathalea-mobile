// Paliers ouverts à une date (pnpm dev seulement). L'heure des serveurs fait
// foi (relais /__heure du serveur de dev, simulé ici), pas celle du téléphone. Enseignant : date posée
// dans l'éditeur, « À compléter » tant qu'elle manque, retirée puis remise,
// gardée à la modification, affichée sur la page du parcours ; version
// suivante si le parcours était publié. Élève (horloge de Playwright) : palier
// fermé avant le jour, même seuil atteint ; ouvert le jour même ; ouverture au
// passage de minuit sans relancer l'app et au retour dans l'app ; bilan qui dit
// la date ; palier 1 joué au toucher. Clair et sombre, 390 px.
//   CAPTURES=<dossier> node e2e/ouverture-paliers.mjs
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const etape = (uuid, id, titre) => ({ uuid, id, titre, nbQuestions: 1 })
const parcours = {
  id: 'relatifs-dates', version: 1, titre: 'Relatifs au fil des semaines', objectif: 'Additionner et soustraire des relatifs.', niveau: '5e', theme: 'Nombres relatifs', difficulte: 2, icone: 'bx-math',
  presentation: 'une_question_par_page', correction: 'question',
  etapes: [etape('cbc26', '5N2G', 'Additionner des relatifs'), etape('36e2a', '5N2H', 'Soustraire des relatifs'), etape('b6982', '5N2I', 'Additions et soustractions')],
  paliers: [
    { titre: 'Additionner', nb: 1 },
    { titre: 'Soustraire', nb: 1, acces: 'seuil', seuil: 50 },
    { titre: 'Mélanger', nb: 1, acces: 'libre' },
  ],
  style: 'ceintures',
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })

/**
 * Appareil à l'heure `telephone` (horloge de Playwright, réglable par l'élève) ;
 * `serveur` : heure renvoyée par les serveurs (null : hors ligne), modifiable
 * ensuite par `page.serveur = …`. Fuseau de Zurich (UTC+1 en novembre).
 */
async function appareil(nom, theme, stockage, telephone, serveur = telephone) {
  const ctx = await nav.newContext({ locale: 'fr-FR', timezoneId: 'Europe/Zurich', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true })
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
  page.serveur = serveur
  page.demandesHeure = 0
  await page.route('**/__heure**', (r) => {
    page.demandesHeure++
    return page.serveur === null ? r.abort() : r.fulfill({ json: { date: new Date(page.serveur).toUTCString() } })
  })
  await page.clock.install({ time: new Date(telephone) })
  page.on('pageerror', (e) => (console.log('ERREUR JS', nom, e.message), erreurs.push(`${nom}: ${e.message}`)))
  await page.goto(base)
  return page
}
const texte = async (page, sel = 'main') => (await page.locator(sel).innerText()).replace(/\s+/g, ' ')
const cap = async (page, n, theme, fullPage = true) => (await page.waitForTimeout(350), page.screenshot({ path: `${captures}/ouverture-${n}-${theme}.png`, fullPage }))
const debordement = (page) => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
const carte = (page, nom) => page.getByRole('region', { name: new RegExp(`^${nom}`) })

let enregistre
for (const theme of ['clair', 'sombre']) {
  // ---------- Enseignant : poser les dates ----------
  const bibliotheque = { lien: 'https://kdrive.infomaniak.com/app/share/1/essai', classes: [{ nom: '5e A' }], parcours: [{ parcours, classes: ['5e A'], exportee: { '5e A': 1 } }] }
  const t = await appareil('enseignant', theme, { profil: 'enseignant', pays: 'FR', bibliotheque }, '2026-11-10T10:00:00+01:00')
  await t.getByRole('button', { name: /^\s*Relatifs au fil des semaines/ }).first().click({ timeout: 60_000 })
  await t.getByRole('button', { name: 'Modifier' }).click()
  await t.getByRole('heading', { name: 'Modifier le parcours' }).waitFor()
  const p2 = carte(t, 'Ceinture jaune')
  const p3 = carte(t, 'Ceinture orange')
  await p2.getByRole('button', { name: 'À partir d’une date' }).click()
  ok(await t.getByText('À compléter : une date d’ouverture').isVisible(), 'date demandée mais vide : à compléter, Valider grisé')
  ok(await t.getByRole('button', { name: 'Enregistrer et quitter' }).isDisabled(), 'Enregistrer grisé sans date')
  await t.getByLabel('Ceinture jaune : date d’ouverture').fill('2026-11-12')
  ok(!(await t.getByText(/À compléter/).isVisible()), 'date choisie : rien à compléter')
  ok(!(await texte(t)).includes('Accessible'), 'éditeur : la date seule, sans texte en dessous')
  // Date retirée puis remise : rien ne reste
  await p3.getByRole('button', { name: 'À partir d’une date' }).click()
  await t.getByLabel('Ceinture orange : date d’ouverture').fill('2026-11-01')
  await p3.getByRole('button', { name: 'À partir d’une date' }).click()
  ok(!(await t.getByLabel('Ceinture orange : date d’ouverture').count()), 'date retirée : champ fermé')
  await p3.getByRole('button', { name: 'À partir d’une date' }).click()
  ok((await t.getByLabel('Ceinture orange : date d’ouverture').inputValue()) === '', 'date remise : champ vide, pas l’ancienne date')
  await t.getByLabel('Ceinture orange : date d’ouverture').fill('2026-11-20')
  // Premier palier : la date est proposée aussi, puis retirée
  await carte(t, 'Ceinture blanche').getByRole('button', { name: 'À partir d’une date' }).click()
  await carte(t, 'Ceinture blanche').getByRole('button', { name: 'À partir d’une date' }).click()
  await p2.scrollIntoViewIfNeeded()
  await cap(t, '1-editeur', theme, false)
  ok(!(await debordement(t)), 'éditeur : aucun débordement horizontal')
  await t.getByRole('button', { name: 'Enregistrer et quitter' }).click()
  await t.waitForTimeout(400)
  enregistre = await t.evaluate(() => JSON.parse(localStorage.getItem('copie:bibliotheque')).parcours[0].parcours)
  ok(JSON.stringify(enregistre.paliers.map((x) => x.ouverture ?? null)) === '[null,"2026-11-12T08:00:00+01:00","2026-11-20T08:00:00+01:00"]', `bibliothèque : dates enregistrées (${enregistre.paliers.map((x) => x.ouverture)})`)
  ok(!('ouverture' in enregistre.paliers[0]), 'premier palier : aucune date vide gardée')
  ok(t.demandesHeure === 0, 'enseignant : aucune demande d’heure (pas de palier fermé à afficher)')
  ok(enregistre.version === 2, 'parcours publié modifié : version suivante (V2)')
  // Panneau d'après l'enregistrement, puis la page du parcours
  await t.goBack({ waitUntil: 'commit' }).catch(() => {})
  await t.waitForTimeout(400)
  if (!(await t.getByRole('button', { name: 'Modifier' }).isVisible())) await t.getByRole('button', { name: /^\s*Relatifs au fil des semaines/ }).first().click()
  await t.getByRole('button', { name: 'Modifier' }).waitFor()
  const fiche = await texte(t)
  ok(fiche.includes('Ceinture jaune : à partir du jeudi 12 novembre à 8 h') && fiche.includes('Ceinture orange : à partir du vendredi 20 novembre à 8 h'), 'page du parcours : dates d’ouverture')
  await cap(t, '2-page-parcours', theme)
  await t.getByRole('button', { name: 'Modifier' }).click()
  await t.getByRole('heading', { name: 'Modifier le parcours' }).waitFor()
  ok((await t.getByLabel('Ceinture jaune : date d’ouverture').inputValue()) === '2026-11-12', 'modification : date préremplie')
  await t.context().close()

  // ---------- Élève ----------
  const classe = { lien: 'http://127.0.0.1:9/indisponible/', nom: '5e A', disponibles: ['5e A'], parcours: [enregistre] }
  const id = enregistre.id
  const r = (points) => ({ points, sur: 1, complet: true, le: '2026-11-09T08:00:00Z', version: 2 })
  const ouvrir = async (e) => {
    await e.getByRole('button', { name: /^Relatifs au fil des semaines/ }).waitFor({ timeout: 60_000 })
    await e.waitForTimeout(1500)
    await e.getByRole('button', { name: /^Relatifs au fil des semaines/ }).click().catch(async (x) => {
      await e.screenshot({ path: `${captures}/ouverture-erreur.png` })
      throw x
    })
    await e.getByRole('heading', { name: /^Ceinture blanche/ }).waitFor({ timeout: 8000 }).catch(async (x) => {
      await e.screenshot({ path: `${captures}/ouverture-erreur.png` })
      throw x
    })
    await e.waitForTimeout(300)
  }

  const blancheReussie = { profil: 'eleve', pays: 'FR', classes: [classe], [`resultats:${id}@2`]: { 0: r(1) } }
  // Veille : blanche réussie, la jaune attend sa date ; l'orange (libre) aussi
  let e = await appareil('élève veille', theme, blancheReussie, '2026-11-12T07:59:00+01:00')
  await ouvrir(e)
  let tx = await texte(e)
  ok(tx.includes('À partir du jeudi 12 novembre à 8 h') && !tx.includes('Au moins 50 %'), 'veille : jaune fermée, la date seule manque (seuil atteint)')
  ok(tx.includes('À partir du vendredi 20 novembre à 8 h'), 'veille : orange (accès libre) fermée jusqu’à sa date')
  ok(!(await carte(e, 'Ceinture jaune').getByRole('button', { name: /Commencer/ }).count()), 'veille : aucun bouton pour commencer la jaune')
  ok(!(await carte(e, 'Ceinture jaune').getByText('Soustraire des relatifs').count()), 'veille : exercices de la jaune cachés')
  await cap(e, '3-eleve-veille', theme)
  ok(!(await debordement(e)), 'élève : aucun débordement horizontal')
  // 8 h passe, l'app reste ouverte : la jaune s'ouvre d'elle-même
  await e.clock.runFor(90_000)
  await e.waitForTimeout(300)
  ok(await carte(e, 'Ceinture jaune').getByRole('button', { name: 'Commencer cette ceinture' }).isVisible(), '8 h passée, app ouverte : jaune ouverte sans relancer')
  ok((await texte(e)).includes('À partir du vendredi 20 novembre à 8 h'), '8 h passée : orange toujours fermée')
  await cap(e, '4-eleve-le-jour', theme)
  await e.context().close()

  // Téléphone avancé au 25 décembre par l'élève : l'heure des serveurs fait foi
  e = await appareil('élève tricheur', theme, blancheReussie, '2026-12-25T10:00:00+01:00', '2026-11-11T12:00:00+01:00')
  await ouvrir(e)
  tx = await texte(e)
  ok(tx.includes('À partir du jeudi 12 novembre à 8 h') && !(await carte(e, 'Ceinture jaune').getByRole('button', { name: /Commencer/ }).count()), 'téléphone avancé : jaune toujours fermée')
  ok(!tx.includes('connexion'), 'téléphone avancé, en ligne : aucune mention de connexion')
  await e.context().close()

  // Hors ligne, téléphone après la date : fermé, la connexion est demandée ; elle revient : ouvert
  e = await appareil('élève hors ligne', theme, blancheReussie, '2026-11-13T10:00:00+01:00', null)
  await ouvrir(e)
  tx = await texte(e)
  ok(tx.includes('À partir du jeudi 12 novembre à 8 h · connexion à internet nécessaire pour vérifier la date') && !(await carte(e, 'Ceinture jaune').getByRole('button', { name: /Commencer/ }).count()), 'hors ligne : fermé, connexion demandée')
  await cap(e, '4b-hors-ligne', theme)
  e.serveur = '2026-11-13T10:00:00+01:00'
  await e.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await e.waitForTimeout(500)
  ok((await carte(e, 'Ceinture jaune').getByRole('button', { name: /Commencer/ }).count()) === 1 && !(await texte(e)).includes('connexion'), 'connexion revenue, retour dans l’app : jaune ouverte')
  await e.context().close()

  // Retour dans l'app après plusieurs jours (horloge changée, pas de minuteur)
  e = await appareil('élève retour', theme, blancheReussie, '2026-11-19T18:00:00+01:00')
  await ouvrir(e)
  await e.clock.setSystemTime(new Date('2026-11-20T08:30:00+01:00'))
  e.serveur = '2026-11-20T08:30:00+01:00'
  await e.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await e.waitForTimeout(300)
  ok(!(await texte(e)).includes('vendredi 20 novembre') && (await carte(e, 'Ceinture orange').getByRole('button', { name: /Commencer/ }).count()) === 1, 'retour dans l’app le 20 : orange ouverte')
  await e.context().close()

  // Date passée, seuil manqué : le seuil seul est écrit
  e = await appareil('élève seuil', theme, { profil: 'eleve', pays: 'FR', classes: [classe], [`resultats:${id}@2`]: { 0: r(0) } }, '2026-11-13T10:00:00+01:00')
  await ouvrir(e)
  tx = await texte(e)
  ok(tx.includes('Au moins 50 % à : ceinture blanche') && !tx.includes('12 novembre'), 'date passée, seuil manqué : seuil seul')
  await e.context().close()

  // Ni date ni seuil : les deux sont écrits
  e = await appareil('élève début', theme, { profil: 'eleve', pays: 'FR', classes: [classe] }, '2026-11-10T10:00:00+01:00')
  await ouvrir(e)
  ok((await texte(e)).includes('À partir du jeudi 12 novembre à 8 h · au moins 50 % à : ceinture blanche'), 'avant la date, rien fait : date et seuil')
  // La blanche au toucher : réponse vraie, bilan qui donne la date
  await e.getByRole('button', { name: 'Commencer', exact: true }).click()
  await e.locator('main math-field').first().waitFor({ timeout: 20000 })
  const reponse = await e.evaluate(async (id) => {
    const s = JSON.parse(localStorage.getItem(`copie:seance:${id}`))
    const man = await (await fetch('/moteur/manifest.json')).json()
    const m = await import('/moteur/' + man.entree)
    const ex = await m.preparerExercice({ ...s.contenu.etapes[0], alea: s.graines[0] }, 90)
    return String(ex.interne.autoCorrection[0]?.valeur?.reponse?.value)
  }, id)
  // Vraie frappe clavier, répétée tant que le champ MathLive n'est pas prêt
  const champ = e.locator('main math-field').first()
  for (let i = 0; i < 20; i++) {
    await champ.click()
    await e.keyboard.type(reponse.replace(/[{}]/g, ''))
    await e.waitForTimeout(200)
    if (await e.getByRole('button', { name: 'Vérifier' }).isEnabled()) break
    await champ.evaluate((el) => el.setValue(''))
    await e.waitForTimeout(250)
  }
  await e.getByRole('button', { name: 'Vérifier' }).click()
  await e.waitForTimeout(400)
  await e.getByRole('button', { name: 'Voir le bilan' }).click()
  await e.waitForTimeout(500)
  tx = await texte(e)
  ok(tx.includes('1 / 1'), `bilan : réponse saisie au clavier comptée correcte (${reponse})`)
  ok(tx.includes('Pour ouvrir ceinture jaune : à partir du jeudi 12 novembre à 8 h.'), 'bilan : la date, pas de seuil (atteint)')
  ok(!(await e.getByRole('button', { name: /^Continuer/ }).count()), 'bilan : pas de « Continuer » vers une ceinture fermée')
  const classeCarte = await e.getByRole('button', { name: 'Voir la carte du parcours' }).getAttribute('class')
  const classeRefaire = await e.getByRole('button', { name: 'Refaire : ceinture blanche' }).getAttribute('class')
  ok(classeCarte.includes('bg-coopmaths-action ') && !classeRefaire.includes('bg-coopmaths-action '), 'bilan : réussi, seule la date manque : « Voir la carte » en bouton plein, pas « Refaire »')
  await cap(e, '5-bilan', theme)
  await e.getByRole('button', { name: 'Voir la carte du parcours' }).click()
  await e.waitForTimeout(500)
  tx = await texte(e)
  ok(tx.includes('Réussi · 100 %') && tx.includes('À partir du jeudi 12 novembre à 8 h'), 'carte : blanche réussie, jaune attend sa date')
  // Suivi : la ceinture blanche est obtenue
  await e.getByRole('button', { name: 'Revenir en arrière' }).click()
  await e.getByRole('tab', { name: 'Suivi' }).click()
  await e.waitForTimeout(400)
  await e.getByRole('tab', { name: 'Ceintures' }).click().catch(() => {})
  await e.waitForTimeout(400)
  ok((await e.getByLabel('Ceinture blanche : obtenue').count()) >= 1 && (await e.getByLabel('Ceinture jaune : pas encore obtenue').count()) >= 1, 'suivi : ceinture blanche obtenue, jaune pas encore')
  await cap(e, '6-suivi', theme)
  await e.context().close()

  // Fenêtre de bureau (testeurs sur Mac) : même carte, rien ne déborde
  const ctxBureau = await nav.newContext({ locale: 'fr-FR', timezoneId: 'Europe/Zurich', viewport: { width: 1280, height: 800 } })
  await ctxBureau.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctxBureau.addInitScript(
    ({ theme, classe, id }) => {
      localStorage.setItem('theme', theme)
      localStorage.setItem('copie:profil', '"eleve"')
      localStorage.setItem('copie:pays', '"FR"')
      localStorage.setItem('copie:classes', JSON.stringify([classe]))
      localStorage.setItem(`copie:resultats:${id}@2`, JSON.stringify({ 0: { points: 1, sur: 1, complet: true, le: '2026-11-09T08:00:00Z', version: 2 } }))
    },
    { theme, classe, id },
  )
  e = await ctxBureau.newPage()
  e.on('pageerror', (x) => erreurs.push(`bureau: ${x.message}`))
  await e.route('**/__heure**', (r) => r.fulfill({ json: { date: new Date('2026-11-11T15:00:00+01:00').toUTCString() } }))
  await e.clock.install({ time: new Date('2026-11-11T15:00:00+01:00') })
  await e.goto(base)
  await ouvrir(e)
  ok((await texte(e)).includes('À partir du jeudi 12 novembre à 8 h') && !(await debordement(e)), 'bureau : jaune fermée jusqu’à sa date, aucun débordement')
  await cap(e, '7-bureau', theme, false)
  await ctxBureau.close()
}

console.log(erreurs.length ? `✘ erreurs JS : ${erreurs.join(' | ')}` : '✔ aucune erreur JS')
await nav.close()
if (echecs || erreurs.length) {
  console.log(`${echecs} ÉCHEC(S)`)
  process.exit(1)
}
console.log('TOUT VERT')
