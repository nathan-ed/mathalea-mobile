// Explorer rangé par degré puis par chapitre, selon le référentiel du pays
// (pnpm dev). Élève suisse : seuls les degrés qui ont des parcours, chapitre,
// liste, bouton retour à chaque niveau, puis la ceinture blanche faite au
// clavier jusqu'au bilan ; le parcours commencé rejoint Mes parcours et le
// suivi. Élève français : seulement les parcours français. Enseignant :
// « Donner à des classes » reprend le parcours dans sa bibliothèque.
// Téléphone (390 px, clair et sombre) et fenêtre de bureau.
// Le script sert lui-même le catalogue d'essai (explorer/ch-4e-college.json et
// un parcours de 5e) ; pnpm dev doit le lire :
//   VITE_URL_EXPLORER=http://127.0.0.1:8702/explorer.json dans .env.development.local
//   CAPTURES=<dossier> node e2e/explorer.mjs
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}

const catalogue = JSON.parse(readFileSync(new URL('../explorer/ch-4e-college.json', import.meta.url), 'utf8'))
catalogue.classes.push({
  nom: '5e',
  parcours: [
    {
      id: 'essai-5e-relatifs',
      version: 1,
      titre: 'Nombres relatifs',
      objectif: 'Additionner des relatifs.',
      niveau: '5e',
      theme: 'Nombres relatifs',
      difficulte: 1,
      presentation: 'une_question_par_page',
      correction: 'question',
      etapes: [{ uuid: 'cbc26', id: '5N2G', nbQuestions: 2, titre: 'Additionner deux relatifs' }],
    },
  ],
})
const serveur = createServer((req, res) => {
  res.writeHead(req.url === '/explorer.json' ? 200 : 404, { 'content-type': 'application/json' })
  res.end(req.url === '/explorer.json' ? JSON.stringify(catalogue) : '')
}).listen(8702, '127.0.0.1')
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const texte = async (page, sel = 'main') => (await page.locator(sel).innerText()).replace(/\s+/g, ' ')
const titre = async (page) => (await page.locator('header h1').first().innerText()).trim()
const cap = async (page, nom) => (await page.waitForTimeout(450), page.screenshot({ path: `${captures}/explorer-${nom}.png` }))
const touchable = (bouton) =>
  bouton.evaluate((b) => {
    const r = b.getBoundingClientRect()
    if (!r.width || !r.height || r.bottom > innerHeight || r.top < 0) return false
    const dessus = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return !!dessus && (dessus === b || b.contains(dessus))
  })
const debordement = (page) => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)

const appareils = {
  telephone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  bureau: { viewport: { width: 1100, height: 800 }, isMobile: false, hasTouch: false },
}

async function ouvrir(nom, appareil, theme, stockage) {
  const ctx = await nav.newContext(appareils[appareil])
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
const onglet = (page, nom) => page.getByRole('tab', { name: nom, exact: true }).or(page.getByRole('button', { name: nom, exact: true })).first()

/** Réponse au clavier : case « Vrai »/« Faux » ou expression tapée dans le champ */
async function repondre(page, i) {
  const cases = page.locator('main input[type="checkbox"]:visible, main input[type="radio"]:visible')
  if (await cases.count()) {
    await cases.nth(i % (await cases.count())).click({ force: true })
    return 'case'
  }
  const champ = page.locator('main math-field:visible').first()
  await champ.click()
  await page.keyboard.type(i % 2 ? '-4sin(x)' : 'x^3')
  return 'champ'
}

for (const [appareil, theme] of [
  ['telephone', 'clair'],
  ['telephone', 'sombre'],
  ['bureau', 'clair'],
]) {
  const suffixe = `${appareil}-${theme}`
  // ---------- Élève suisse ----------
  const e = await ouvrir(`élève CH ${suffixe}`, appareil, theme, { profil: 'eleve', pays: 'CH' })
  await onglet(e, 'Explorer').click()
  const degre = e.getByRole('button', { name: /^4e Collège/ })
  await degre.waitFor({ timeout: 60_000 })
  // Référentiel lu par le moteur : attendre qu'il ait rangé l'Explorer
  await e.waitForTimeout(1500)
  const racine = await texte(e)
  // Catalogue intégré à l'app (explorer/*.json) : 11e, Préqualifiant, 4e Collège, dans cet ordre
  ok(/11e 3 chapitres · 3 parcours Préqualifiant 9 chapitres · 9 parcours 4e Collège 2 chapitres · 2 parcours/.test(racine), `${suffixe} : 11e, Préqualifiant puis 4e Collège, avec leurs parcours`, racine)
  ok(!/\b9e\b|\b10e\b|1re Collège|2e Collège|3e Collège/.test(racine), `${suffixe} : degrés sans parcours masqués`)
  ok(!racine.includes('5e') && !racine.includes('Nombres relatifs'), `${suffixe} : aucun parcours français en Suisse`)
  ok(!(await debordement(e)), `${suffixe} : pas de défilement horizontal`)
  await cap(e, `1-degres-${suffixe}`)

  await degre.click()
  await e.waitForTimeout(300)
  ok((await titre(e)) === '4e Collège', `${suffixe} : écran du degré`)
  const chapitre = e.getByRole('button', { name: /^Intégration/ })
  ok((await texte(e)).includes('Intégration 1 parcours'), `${suffixe} : chapitre du référentiel avec ses parcours`)
  ok((await texte(e)).includes('Exponentielles et logarithmes 1 parcours'), `${suffixe} : second chapitre du degré`)
  await cap(e, `2-chapitres-${suffixe}`)

  await chapitre.click()
  await e.waitForTimeout(300)
  ok((await titre(e)) === 'Intégration', `${suffixe} : écran du chapitre`)
  const liste = await texte(e)
  ok(liste.includes('Calcul intégral') && (liste.includes('8 ceintures') || liste.includes('Ceintures blanche à noire, 2e dan')), `${suffixe} : parcours du chapitre, ses ceintures`)
  await cap(e, `3-parcours-${suffixe}`)

  // Bouton retour du téléphone : chapitre, degré, Explorer, puis Mes parcours
  await e.goBack()
  await e.waitForTimeout(300)
  ok((await titre(e)) === '4e Collège', `${suffixe} : retour au degré`)
  await e.goBack()
  await e.waitForTimeout(300)
  ok(await degre.isVisible(), `${suffixe} : retour à l'Explorer`)
  await e.goBack()
  await e.waitForTimeout(300)
  ok((await onglet(e, 'Mes parcours').getAttribute('aria-selected')) === 'true' || (await texte(e)).includes('Mes parcours'), `${suffixe} : retour à Mes parcours`)

  // Ouvrir un parcours puis revenir : on retrouve le chapitre
  await onglet(e, 'Explorer').click()
  await degre.click()
  await chapitre.click()
  await e.getByRole('button', { name: /^Calcul intégral/ }).click()
  await e.getByRole('button', { name: 'Commencer', exact: true }).waitFor()
  await cap(e, `4-fiche-${suffixe}`)
  await e.getByRole('button', { name: 'Revenir en arrière' }).click()
  await e.waitForTimeout(400)
  ok((await titre(e)) === 'Intégration', `${suffixe} : retour d'un parcours au chapitre`)

  // Ceinture blanche, au clavier, jusqu'au bilan
  await e.getByRole('button', { name: /^Calcul intégral/ }).click()
  await e.getByRole('button', { name: 'Commencer', exact: true }).click()

  // Fiche de la ceinture blanche, montrée d'office la première fois
  const entrainement = e.getByRole('button', { name: 'Commencer l’entraînement' })
  await entrainement.waitFor({ timeout: 30_000 })
  ok((await titre(e)) === 'Rappels de dérivées', `${suffixe} : fiche de la ceinture avant l'entraînement`)
  ok(await touchable(entrainement), `${suffixe} : « Commencer l'entraînement » visible et touchable`)
  ok((await e.locator('main .katex').count()) > 10, `${suffixe} : formules rendues`)
  ok(!(await debordement(e)), `${suffixe} : fiche sans défilement horizontal`)
  await cap(e, `4b-fiche-cours-${suffixe}`)
  const exemple = e.getByRole('region', { name: 'Produit' }).first()
  await exemple.getByRole('button', { name: 'Voir la première étape' }).click()
  await exemple.getByRole('button', { name: 'Étape suivante' }).click()
  ok((await exemple.locator('.border-l-4').count()) === 2 && !(await exemple.getByRole('button').count()), `${suffixe} : exemple dévoilé pas à pas, jusqu'au bout`)
  const qcm = e.getByRole('region', { name: 'À toi' }).first()
  await qcm.getByRole('radio').first().click()
  ok((await qcm.innerText()).includes('Incorrecte'), `${suffixe} : question « À toi », mauvaise réponse signalée`)
  await qcm.getByRole('radio').nth(1).click()
  ok((await qcm.innerText()).includes('Correcte') && !(await qcm.innerText()).includes('Incorrecte'), `${suffixe} : bonne réponse, explication`)
  const nombre = e.getByRole('region', { name: 'À toi' }).nth(1)
  await nombre.getByLabel('Ta réponse').click()
  await e.keyboard.type('3')
  await nombre.getByRole('button', { name: 'Vérifier' }).click()
  ok((await nombre.innerText()).includes('Correcte'), `${suffixe} : réponse tapée au clavier, corrigée`)
  await nombre.scrollIntoViewIfNeeded()
  await cap(e, `4c-fiche-questions-${suffixe}`)
  await entrainement.click()
  let n = 0
  const types = new Set()
  for (; n < 20; n++) {
    await e.locator('main math-field:visible, main input[type="checkbox"]:visible, main input[type="radio"]:visible').first().waitFor({ timeout: 60_000 })
    await e.waitForTimeout(500)
    types.add(await repondre(e, n))
    const verifier = e.getByRole('button', { name: 'Vérifier' })
    if (n === 0) ok(await touchable(verifier), `${suffixe} : « Vérifier » visible et touchable`)
    await verifier.click()
    await e.waitForTimeout(400)
    const suite = e.getByRole('button', { name: /^(Question suivante|Voir le bilan)$/ })
    const libelle = await suite.innerText()
    if (n === 0) await cap(e, `5-question-${suffixe}`)
    await suite.click()
    await e.waitForTimeout(400)
    if (libelle.includes('bilan')) break
  }
  ok(n + 1 === 6, `${suffixe} : 6 questions dans la ceinture blanche (${n + 1})`)
  ok(types.has('champ'), `${suffixe} : expressions saisies au clavier`)
  const bilan = await texte(e)
  ok(/\d+ \/ 6/.test(bilan), `${suffixe} : bilan sur 6 questions`)
  await cap(e, `6-bilan-${suffixe}`)
  ok(await e.getByRole('button', { name: 'Revoir la fiche : Rappels de dérivées' }).isVisible(), `${suffixe} : bilan sous le seuil, fiche à revoir`)
  await e.getByRole('button', { name: 'Voir la carte du parcours' }).click()
  await e.waitForTimeout(400)
  // La fiche reste dans le parcours, comme ressource ; la séance suivante commence sans elle
  await e.getByRole('button', { name: 'Fiche : Rappels de dérivées', exact: true }).click()
  await e.waitForTimeout(400)
  ok((await titre(e)) === 'Rappels de dérivées' && !(await entrainement.count()), `${suffixe} : fiche relue depuis le parcours, sans lancer de séance`)
  await e.goBack()
  await e.waitForTimeout(400)
  ok((await titre(e)) === 'Calcul intégral', `${suffixe} : retour de la fiche à la page du parcours`)
  await e.getByRole('region', { name: /Ceinture blanche/ }).getByRole('button').last().click()
  await e.locator('main math-field:visible, main input[type="radio"]:visible').first().waitFor({ timeout: 60_000 })
  ok(!(await entrainement.count()), `${suffixe} : fiche montrée d'office une seule fois`)
  await e.getByRole('button', { name: 'Quitter', exact: true }).click()
  await e.getByRole('button', { name: 'Reprendre plus tard' }).click()
  await e.waitForTimeout(400)
  await e.getByRole('button', { name: 'Revenir en arrière' }).click()
  await e.waitForTimeout(400)

  // Commencé depuis l'Explorer : il est dans Mes parcours et dans le suivi
  await onglet(e, 'Mes parcours').click()
  await e.waitForTimeout(300)
  ok(await e.getByRole('button', { name: /^Calcul intégral/ }).first().isVisible(), `${suffixe} : parcours commencé ajouté à Mes parcours`)
  await cap(e, `7-mes-parcours-${suffixe}`)
  await onglet(e, 'Suivi').click()
  await e.waitForTimeout(300)
  ok((await texte(e)).includes('Calcul intégral'), `${suffixe} : parcours dans le suivi`)
  await e.context().close()

  if (appareil !== 'telephone' || theme !== 'clair') continue

  // ---------- Élève français : rien de suisse ----------
  const f = await ouvrir('élève FR', appareil, theme, { profil: 'eleve', pays: 'FR' })
  await onglet(f, 'Explorer').click()
  await f.getByRole('button', { name: /^5e/ }).waitFor({ timeout: 60_000 })
  await f.waitForTimeout(1500)
  const fr = await texte(f)
  ok(!/Collège|Préqualifiant|\b11e\b|EVACOM/.test(fr), 'France : aucun degré ni parcours suisse', fr)
  await f.getByRole('button', { name: /^5e/ }).click()
  ok((await texte(f)).includes('Nombres relatifs'), 'France : chapitre du parcours de 5e')
  await f.context().close()

  // ---------- Changer de programme : l'Explorer suit ----------
  const c = await ouvrir('changement de pays', appareil, theme, { profil: 'eleve', pays: 'FR' })
  await onglet(c, 'Explorer').waitFor({ timeout: 60_000 })
  await c.getByRole('button', { name: 'Réglages' }).click()
  await c.waitForTimeout(500)
  await c.getByRole('radio', { name: /Suisse/ }).click()
  await c.getByRole('button', { name: 'Enregistrer et quitter' }).click()
  await onglet(c, 'Explorer').click()
  await c.getByRole('button', { name: /^4e Collège/ }).waitFor({ timeout: 60_000 })
  ok(!(await texte(c)).includes('5e'), 'programme changé en Suisse : parcours suisses seulement')
  await c.context().close()

  // ---------- Enseignant : donner un parcours de l'Explorer à des classes ----------
  const t = await ouvrir('enseignant', appareil, theme, { profil: 'enseignant', pays: 'CH' })
  await onglet(t, 'Explorer').click()
  await t.getByRole('button', { name: /^4e Collège/ }).click({ timeout: 60_000 })
  await t.getByRole('button', { name: /^Intégration/ }).click()
  await t.getByRole('button', { name: /^Calcul intégral/ }).click()
  ok(!(await t.getByRole('button', { name: 'Ajouter à l’accueil' }).count()), 'enseignant : pas d’ajout à l’accueil')
  await t.getByRole('button', { name: 'Donner à des classes' }).click()
  await t.waitForTimeout(500)
  ok((await titre(t)) === 'Calcul intégral' && (await texte(t)).includes('Classes'), 'enseignant : page du parcours dans sa bibliothèque, choix des classes')
  await cap(t, `8-enseignant-${theme}`)
  const biblio = await t.evaluate(() => JSON.parse(localStorage.getItem('copie:bibliotheque')))
  ok(biblio?.parcours?.some((pe) => pe.parcours.id === 'ch-4c-integrales'), 'enseignant : parcours repris dans la bibliothèque')
  await t.context().close()
}

await nav.close()
serveur.close()
for (const x of erreurs) console.log('✘ erreur de page :', x)
console.log(echecs || erreurs.length ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs || erreurs.length ? 1 : 0)
