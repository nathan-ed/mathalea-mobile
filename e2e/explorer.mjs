// Explorer rangé par degré puis par chapitre, selon le référentiel du pays
// (pnpm dev). Élève suisse : seuls les degrés qui ont des parcours, page du
// degré (parcours sous leur chapitre), ajout de plusieurs parcours d'un coup,
// bouton retour à chaque niveau, puis la ceinture blanche faite au
// clavier jusqu'au bilan ; le parcours commencé rejoint Mes parcours et le
// suivi. Élève français : seulement les parcours français. Enseignant :
// « Donner à des classes » reprend le parcours dans sa bibliothèque, et
// « Ajouter plusieurs parcours » en reprend plusieurs d'un coup.
// Téléphone (390 px, clair et sombre) et fenêtre de bureau.
// Le script sert lui-même le catalogue d'essai (explorer/ch-4e-college.json et
// un parcours de 5e) ; pnpm dev doit le lire :
//   VITE_URL_EXPLORER=http://127.0.0.1:8702/explorer.json dans .env.development.local
//   CAPTURES=<dossier> node e2e/explorer.mjs
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { chromium } from 'playwright'
import { pagePrete, SANS_BRIDAGE, taperDans, touchable } from './attente.mjs'

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
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })
const texte = async (page, sel = 'main') => (await page.locator(sel).innerText()).replace(/\s+/g, ' ')
const titre = async (page) => (await page.locator('header h1').first().innerText()).trim()
const cap = async (page, nom) => (await pagePrete(page), page.screenshot({ path: `${captures}/explorer-${nom}.png` }))
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
  await taperDans(page, champ, i % 2 ? '-4sin(x)' : 'x^3')
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
  await pagePrete(e)
  const racine = await texte(e)
  // Catalogue intégré à l'app (explorer/*.json) : 11e, Préqualifiant, 4e Collège, dans cet ordre
  ok(/11e \d+ chapitres · \d+ parcours Préqualifiant 9 chapitres · 9 parcours 4e Collège 3 chapitres · 3 parcours/.test(racine), `${suffixe} : 11e, Préqualifiant puis 4e Collège, avec leurs parcours`, racine)
  ok(!/\b9e\b|\b10e\b|1re Collège|2e Collège|3e Collège/.test(racine), `${suffixe} : degrés sans parcours masqués`)
  ok(!racine.includes('5e') && !racine.includes('Nombres relatifs'), `${suffixe} : aucun parcours français en Suisse`)
  // Teste ton niveau : niveaux français, jamais proposé en Suisse (Nathan, 1er novembre 2026)
  ok(!racine.includes('Teste ton niveau'), `${suffixe} : pas de « Teste ton niveau » en Suisse`)
  ok(!(await debordement(e)), `${suffixe} : pas de défilement horizontal`)
  await cap(e, `1-degres-${suffixe}`)

  await degre.click()
  await pagePrete(e)
  ok((await titre(e)) === '4e Collège', `${suffixe} : écran du degré`)
  // Plus de dossier par chapitre : les parcours du degré sous le titre de leur chapitre
  const chapitres = (await e.locator('main h2').allInnerTexts()).map((x) => x.trim())
  ok(chapitres.join(',') === 'Analyse,Exponentielles et logarithmes,Intégration', `${suffixe} : chapitres du référentiel en titres, dans son ordre`)
  ok(await e.getByRole('button', { name: /^Calcul intégral/ }).isVisible(), `${suffixe} : parcours visibles dès la page du degré`)
  ok(!(await e.locator('main .bx-folder').count()), `${suffixe} : aucun dossier de chapitre`)
  await cap(e, `2-degre-${suffixe}`)

  // Ajouter plusieurs parcours : panneau du bas, chapitre entier, puis tout
  await e.getByRole('button', { name: 'Ajouter plusieurs parcours' }).click()
  const panneau = e.getByRole('dialog')
  await panneau.waitFor()
  const ajouter = panneau.getByRole('button', { name: /^Ajouter/ })
  ok((await ajouter.innerText()).trim() === 'Ajouter' && (await ajouter.isDisabled()), `${suffixe} : rien de coché, ajout impossible`)
  await panneau.getByRole('checkbox', { name: 'Tout le chapitre Intégration' }).click()
  ok((await ajouter.innerText()).trim() === 'Ajouter 1 parcours', `${suffixe} : chapitre coché d'un toucher`)
  await panneau.getByRole('button', { name: 'Tout cocher' }).click()
  ok((await ajouter.innerText()).trim() === 'Ajouter les 3 parcours', `${suffixe} : tout le degré coché`)
  await cap(e, `2b-ajout-plusieurs-${suffixe}`)
  await ajouter.click()
  await pagePrete(e)
  ok((await texte(e)).includes('3 parcours ajoutés à ton accueil.'), `${suffixe} : ajout confirmé, on reste dans le degré`)
  ok((await e.locator('main .tuile', { hasText: 'Ajouté' }).count()) === 3, `${suffixe} : parcours marqués « Ajouté »`)
  const lireAjoutes = () => e.evaluate(() => JSON.parse(localStorage.getItem('copie:ajoutes') ?? '[]').map((p) => p.id))
  const ajoutes = await lireAjoutes()
  ok(ajoutes.length === 3 && ajoutes.includes('ch-4c-integrales'), `${suffixe} : parcours enregistrés à l'accueil`, ajoutes)

  // Retirer : le panneau coche ce qui est sur l'accueil, décocher le retire
  await e.getByRole('button', { name: 'Ajouter ou retirer des parcours' }).click()
  await panneau.waitFor()
  ok((await panneau.locator('li [role=checkbox][aria-checked=true]').count()) === 3, `${suffixe} : parcours de l'accueil cochés dans le panneau`)
  await panneau.getByRole('checkbox', { name: /Exponentielle et logarithme/ }).click()
  await panneau.getByRole('checkbox', { name: /Prérequis pour l’analyse/ }).click()
  const valider = panneau.getByRole('button', { name: /^(Ajouter|Retirer)/ })
  ok((await valider.innerText()).trim() === 'Retirer 2 parcours', `${suffixe} : décocher propose de retirer`)
  await cap(e, `2c-retirer-${suffixe}`)
  await valider.click()
  await pagePrete(e)
  ok((await texte(e)).includes('2 parcours retirés de ton accueil.'), `${suffixe} : retrait confirmé`)
  ok((await e.locator('main .tuile', { hasText: 'Ajouté' }).count()) === 1, `${suffixe} : un seul parcours encore marqué « Ajouté »`)
  ok((await lireAjoutes()).join() === 'ch-4c-integrales', `${suffixe} : parcours retiré de l'accueil enregistré`)

  // Bouton retour du téléphone : degré, Explorer, puis Mes parcours
  await e.goBack()
  await pagePrete(e)
  ok(await degre.isVisible(), `${suffixe} : retour à l'Explorer`)
  await e.goBack()
  await pagePrete(e)
  ok((await onglet(e, 'Mes parcours').getAttribute('aria-selected')) === 'true' || (await texte(e)).includes('Mes parcours'), `${suffixe} : retour à Mes parcours`)
  ok((await texte(e)).includes('Ajoutés depuis Explorer') && (await texte(e)).includes('Calcul intégral'), `${suffixe} : parcours ajoutés sur l'accueil`)
  ok(!(await texte(e)).includes('Exponentielle et logarithme'), `${suffixe} : parcours retiré absent de l'accueil`)

  // Bouton « ⋯ » d'une tuile : épingler, puis désépingler, puis retirer de l'accueil
  const actionsTuile = async (nom) => {
    await e.getByRole('button', { name: `Actions pour « ${nom} »` }).first().click()
    const f = e.getByRole('dialog')
    await f.waitFor()
    return f
  }
  let menu = await actionsTuile('Calcul intégral')
  ok((await menu.getByRole('button', { name: 'Retirer de l’accueil' }).count()) === 1, `${suffixe} : menu de la tuile, « Retirer de l’accueil » proposé`)
  await cap(e, `2d-menu-tuile-${suffixe}`)
  await menu.getByRole('button', { name: 'Épingler à l’accueil' }).click()
  await pagePrete(e)
  const accueilEpingle = await texte(e)
  ok(/Épinglés Calcul intégral/.test(accueilEpingle) && !accueilEpingle.includes('Ajoutés depuis Explorer'), `${suffixe} : parcours de l'Explorer épinglé depuis l'accueil`)
  ok((await lireAjoutes()).join() === 'ch-4c-integrales', `${suffixe} : épingler ne retire pas le parcours`)
  menu = await actionsTuile('Calcul intégral')
  await menu.getByRole('button', { name: 'Désépingler' }).click()
  await pagePrete(e)
  ok((await texte(e)).includes('Ajoutés depuis Explorer') && (await lireAjoutes()).join() === 'ch-4c-integrales', `${suffixe} : désépinglé, toujours sur l'accueil`)
  menu = await actionsTuile('Calcul intégral')
  await menu.getByRole('button', { name: 'Retirer de l’accueil' }).click()
  await pagePrete(e)
  ok(!(await texte(e)).includes('Ajoutés depuis Explorer') && !(await lireAjoutes()).length, `${suffixe} : parcours retiré depuis l'accueil`)

  // Ouvrir un parcours puis revenir : on retrouve le degré
  await onglet(e, 'Explorer').click()
  await degre.click()
  await e.getByRole('button', { name: /^Calcul intégral/ }).click()
  await e.getByRole('button', { name: 'Commencer', exact: true }).waitFor()
  await cap(e, `4-fiche-${suffixe}`)
  await e.getByRole('button', { name: 'Revenir en arrière' }).click()
  await pagePrete(e)
  ok((await titre(e)) === '4e Collège', `${suffixe} : retour d'un parcours au degré`)

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
  await taperDans(e, nombre.getByLabel('Ta réponse'), '3')
  await nombre.getByRole('button', { name: 'Vérifier' }).click()
  ok((await nombre.innerText()).includes('Correcte'), `${suffixe} : réponse tapée au clavier, corrigée`)
  await nombre.scrollIntoViewIfNeeded()
  await cap(e, `4c-fiche-questions-${suffixe}`)
  await entrainement.click()
  let n = 0
  const types = new Set()
  for (; n < 20; n++) {
    await e.locator('main math-field:visible, main input[type="checkbox"]:visible, main input[type="radio"]:visible').first().waitFor({ timeout: 60_000 })
    await pagePrete(e)
    types.add(await repondre(e, n))
    const verifier = e.getByRole('button', { name: 'Vérifier' })
    if (n === 0) ok(await touchable(verifier), `${suffixe} : « Vérifier » visible et touchable`)
    await verifier.click()
    await pagePrete(e)
    const suite = e.getByRole('button', { name: /^(Question suivante|Voir le bilan)$/ })
    const libelle = await suite.innerText()
    if (n === 0) await cap(e, `5-question-${suffixe}`)
    await suite.click()
    await pagePrete(e)
    if (libelle.includes('bilan')) break
  }
  ok(n + 1 === 6, `${suffixe} : 6 questions dans la ceinture blanche (${n + 1})`)
  ok(types.has('champ'), `${suffixe} : expressions saisies au clavier`)
  const bilan = await texte(e)
  ok(/\d+ \/ 6/.test(bilan), `${suffixe} : bilan sur 6 questions`)
  await cap(e, `6-bilan-${suffixe}`)
  ok(await e.getByRole('button', { name: 'Revoir la fiche : Rappels de dérivées' }).isVisible(), `${suffixe} : bilan sous le seuil, fiche à revoir`)
  await e.getByRole('button', { name: 'Voir la carte du parcours' }).click()
  await pagePrete(e)
  // La fiche reste dans le parcours, comme ressource ; la séance suivante commence sans elle
  await e.getByRole('button', { name: 'Fiche : Rappels de dérivées', exact: true }).click()
  await pagePrete(e)
  ok((await titre(e)) === 'Rappels de dérivées' && !(await entrainement.count()), `${suffixe} : fiche relue depuis le parcours, sans lancer de séance`)
  await e.goBack()
  await pagePrete(e)
  ok((await titre(e)) === 'Calcul intégral', `${suffixe} : retour de la fiche à la page du parcours`)
  await e.getByRole('region', { name: /Ceinture blanche/ }).getByRole('button').last().click()
  await e.locator('main math-field:visible, main input[type="radio"]:visible').first().waitFor({ timeout: 60_000 })
  ok(!(await entrainement.count()), `${suffixe} : fiche montrée d'office une seule fois`)
  await e.getByRole('button', { name: 'Quitter', exact: true }).click()
  await e.getByRole('button', { name: 'Reprendre plus tard' }).click()
  await pagePrete(e)
  await e.getByRole('button', { name: 'Revenir en arrière' }).click()
  await pagePrete(e)

  // Commencé depuis l'Explorer : il est dans Mes parcours et dans le suivi
  await onglet(e, 'Mes parcours').click()
  await pagePrete(e)
  ok(await e.getByRole('button', { name: /^Calcul intégral/ }).first().isVisible(), `${suffixe} : parcours commencé ajouté à Mes parcours`)
  await cap(e, `7-mes-parcours-${suffixe}`)
  await onglet(e, 'Suivi').click()
  await pagePrete(e)
  ok((await texte(e)).includes('Calcul intégral'), `${suffixe} : parcours dans le suivi`)
  ok(!(await texte(e)).includes('Teste ton niveau'), `${suffixe} : suivi sans « Teste ton niveau » en Suisse`)

  // Retirer un parcours commencé puis le remettre : rien n'est perdu
  const travail = () => e.evaluate(() => Object.keys(localStorage).filter((k) => /^copie:(seance|historique|resultats):ch-4c-integrales/.test(k) && localStorage.getItem(k) !== 'null').sort().join())
  const avant = await travail()
  ok(avant.includes('seance'), `${suffixe} : tentative en cours enregistrée`, avant)
  await onglet(e, 'Mes parcours').click()
  await pagePrete(e)
  await e.getByRole('button', { name: 'Actions pour « Calcul intégral »' }).first().click()
  await e.getByRole('dialog').getByRole('button', { name: 'Retirer de l’accueil' }).click()
  await pagePrete(e)
  ok(!(await texte(e)).includes('Calcul intégral'), `${suffixe} : parcours commencé retiré de l'accueil`)
  await onglet(e, 'Suivi').click()
  await pagePrete(e)
  ok((await texte(e)).includes('Calcul intégral'), `${suffixe} : retiré, toujours dans le suivi`)
  await onglet(e, 'Explorer').click()
  await degre.click()
  await e.getByRole('button', { name: /^Calcul intégral/ }).click()
  await e.getByRole('button', { name: 'Ajouter à l’accueil' }).click()
  await e.getByRole('button', { name: 'Ajouté à l’accueil' }).waitFor()
  await e.getByRole('button', { name: 'Revenir en arrière' }).click()
  await pagePrete(e)
  await e.getByRole('button', { name: 'Revenir en arrière' }).click()
  await pagePrete(e)
  await onglet(e, 'Mes parcours').click()
  await pagePrete(e)
  ok(/En cours Calcul intégral/.test(await texte(e)), `${suffixe} : remis, de nouveau « En cours »`)
  ok((await travail()) === avant, `${suffixe} : remis, tentative et résultats intacts`)
  await e.context().close()

  if (appareil !== 'telephone' || theme !== 'clair') continue

  // ---------- Élève français : rien de suisse ----------
  const f = await ouvrir('élève FR', appareil, theme, { profil: 'eleve', pays: 'FR' })
  await onglet(f, 'Explorer').click()
  await f.getByRole('button', { name: /^5e/ }).waitFor({ timeout: 60_000 })
  await pagePrete(f)
  const fr = await texte(f)
  ok(!/Collège|Préqualifiant|\b11e\b|EVACOM/.test(fr), 'France : aucun degré ni parcours suisse', fr)
  ok(await f.getByRole('button', { name: /^Teste ton niveau/ }).isVisible(), 'France : « Teste ton niveau » proposé')
  await f.getByRole('button', { name: /^5e/ }).click()
  ok((await texte(f)).includes('Nombres relatifs'), 'France : chapitre du parcours de 5e')
  await f.context().close()

  // ---------- Changer de programme : l'Explorer suit ----------
  const c = await ouvrir('changement de pays', appareil, theme, { profil: 'eleve', pays: 'FR' })
  await onglet(c, 'Explorer').waitFor({ timeout: 60_000 })
  await c.getByRole('button', { name: 'Réglages' }).click()
  await pagePrete(c)
  await c.getByRole('radio', { name: /Suisse/ }).click()
  await c.getByRole('button', { name: 'Enregistrer et quitter' }).click()
  await onglet(c, 'Explorer').click()
  await c.getByRole('button', { name: /^4e Collège/ }).waitFor({ timeout: 60_000 })
  ok(!(await texte(c)).includes('5e'), 'programme changé en Suisse : parcours suisses seulement')
  ok(!(await texte(c)).includes('Teste ton niveau'), 'programme changé en Suisse : « Teste ton niveau » retiré')
  await c.context().close()

  // ---------- Enseignant : donner un parcours de l'Explorer à des classes ----------
  const t = await ouvrir('enseignant', appareil, theme, { profil: 'enseignant', pays: 'CH' })
  await onglet(t, 'Explorer').click()
  await t.getByRole('button', { name: /^4e Collège/ }).click({ timeout: 60_000 })
  await t.getByRole('button', { name: /^Calcul intégral/ }).click()
  ok(!(await t.getByRole('button', { name: 'Ajouter à l’accueil' }).count()), 'enseignant : pas d’ajout à l’accueil')
  await t.getByRole('button', { name: 'Donner à des classes' }).click()
  await pagePrete(t)
  ok((await titre(t)) === 'Calcul intégral' && (await texte(t)).includes('Classes'), 'enseignant : page du parcours dans sa bibliothèque, choix des classes')
  await cap(t, `8-enseignant-${theme}`)
  const biblio = await t.evaluate(() => JSON.parse(localStorage.getItem('copie:bibliotheque')))
  ok(biblio?.parcours?.some((pe) => pe.parcours.id === 'ch-4c-integrales'), 'enseignant : parcours repris dans la bibliothèque')
  await t.context().close()

  // ---------- Enseignant : tout un degré dans sa bibliothèque d'un coup ----------
  const t2 = await ouvrir('enseignant, plusieurs', appareil, theme, { profil: 'enseignant', pays: 'CH' })
  await onglet(t2, 'Explorer').click()
  await t2.getByRole('button', { name: /^Préqualifiant/ }).click({ timeout: 60_000 })
  await pagePrete(t2)
  await t2.getByRole('button', { name: 'Ajouter plusieurs parcours' }).click()
  await t2.getByRole('dialog').getByRole('button', { name: 'Tout cocher' }).click()
  await t2.getByRole('dialog').getByRole('button', { name: 'Ajouter les 9 parcours' }).click()
  await pagePrete(t2)
  ok((await titre(t2)) === 'Préqualifiant' && (await texte(t2)).includes('9 parcours ajoutés à votre bibliothèque.'), 'enseignant : 9 parcours ajoutés, on reste dans l’Explorer')
  await cap(t2, `9-enseignant-plusieurs-${theme}`)
  const biblio2 = await t2.evaluate(() => JSON.parse(localStorage.getItem('copie:bibliotheque')))
  ok(biblio2?.parcours?.length === 9 && biblio2.parcours.every((pe) => pe.parcours.niveau === 'Préqualifiant' && !pe.classes.length), 'enseignant : les 9 parcours dans la bibliothèque, sans classe')
  await onglet(t2, 'Parcours').click()
  await pagePrete(t2)
  ok((await texte(t2)).includes('Fractions'), 'enseignant : parcours ajoutés dans l’onglet Parcours')
  await t2.context().close()
}

await nav.close()
serveur.close()
for (const x of erreurs) console.log('✘ erreur de page :', x)
console.log(echecs || erreurs.length ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs || erreurs.length ? 1 : 0)
