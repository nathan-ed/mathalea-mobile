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
  ok(racine.includes('4e Collège') && racine.includes('2 parcours'), `${suffixe} : degré 4e Collège, 2 parcours`)
  ok(!/\b9e\b|\b10e\b|\b11e\b|1re Collège|3e Collège/.test(racine), `${suffixe} : degrés sans parcours masqués`)
  ok(!racine.includes('5e') && !racine.includes('Nombres relatifs'), `${suffixe} : aucun parcours français en Suisse`)
  ok(!(await debordement(e)), `${suffixe} : pas de défilement horizontal`)
  await cap(e, `1-degres-${suffixe}`)

  await degre.click()
  await e.waitForTimeout(300)
  ok((await titre(e)) === '4e Collège', `${suffixe} : écran du degré`)
  const chapitre = e.getByRole('button', { name: /^Intégration/ })
  ok((await texte(e)).includes('Intégration 2 parcours'), `${suffixe} : chapitre du référentiel avec ses parcours`)
  await cap(e, `2-chapitres-${suffixe}`)

  await chapitre.click()
  await e.waitForTimeout(300)
  ok((await titre(e)) === 'Intégration', `${suffixe} : écran du chapitre`)
  const liste = await texte(e)
  ok(liste.indexOf('Primitives et intégrales') !== -1 && liste.indexOf('Primitives et intégrales') < liste.indexOf('Intégration par parties'), `${suffixe} : parcours de Découverte à Approfondissement`)
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
  await e.getByRole('button', { name: /^Primitives et intégrales/ }).click()
  await e.getByRole('button', { name: 'Commencer', exact: true }).waitFor()
  await cap(e, `4-fiche-${suffixe}`)
  await e.getByRole('button', { name: 'Revenir en arrière' }).click()
  await e.waitForTimeout(400)
  ok((await titre(e)) === 'Intégration', `${suffixe} : retour d'un parcours au chapitre`)

  // Ceinture blanche, au clavier, jusqu'au bilan
  await e.getByRole('button', { name: /^Primitives et intégrales/ }).click()
  await e.getByRole('button', { name: 'Commencer', exact: true }).click()
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
  ok(n + 1 === 8, `${suffixe} : 8 questions dans la ceinture blanche (${n + 1})`)
  ok(types.has('case') && types.has('champ'), `${suffixe} : vrai/faux et expressions saisies`)
  const bilan = await texte(e)
  ok(/\d+ \/ 8/.test(bilan), `${suffixe} : bilan sur 8 questions`)
  await cap(e, `6-bilan-${suffixe}`)
  await e.getByRole('button', { name: 'Voir la carte du parcours' }).click()
  await e.waitForTimeout(400)
  await e.getByRole('button', { name: 'Revenir en arrière' }).click()
  await e.waitForTimeout(400)

  // Commencé depuis l'Explorer : il est dans Mes parcours et dans le suivi
  await onglet(e, 'Mes parcours').click()
  await e.waitForTimeout(300)
  ok(await e.getByRole('button', { name: /^Primitives et intégrales/ }).first().isVisible(), `${suffixe} : parcours commencé ajouté à Mes parcours`)
  await cap(e, `7-mes-parcours-${suffixe}`)
  await onglet(e, 'Suivi').click()
  await e.waitForTimeout(300)
  ok((await texte(e)).includes('Primitives et intégrales'), `${suffixe} : parcours dans le suivi`)
  await e.context().close()

  if (appareil !== 'telephone' || theme !== 'clair') continue

  // ---------- Élève français : rien de suisse ----------
  const f = await ouvrir('élève FR', appareil, theme, { profil: 'eleve', pays: 'FR' })
  await onglet(f, 'Explorer').click()
  await f.getByRole('button', { name: /^5e/ }).waitFor({ timeout: 60_000 })
  await f.waitForTimeout(1500)
  const fr = await texte(f)
  ok(!fr.includes('Collège'), 'France : aucun degré suisse')
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
  await t.getByRole('button', { name: /^Primitives et intégrales/ }).click()
  ok(!(await t.getByRole('button', { name: 'Ajouter à l’accueil' }).count()), 'enseignant : pas d’ajout à l’accueil')
  await t.getByRole('button', { name: 'Donner à des classes' }).click()
  await t.waitForTimeout(500)
  ok((await titre(t)) === 'Primitives et intégrales' && (await texte(t)).includes('Classes'), 'enseignant : page du parcours dans sa bibliothèque, choix des classes')
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
