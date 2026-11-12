// Explorer rangé par degré puis par chapitre, selon le référentiel du pays
// (pnpm dev). Élève suisse : seuls les degrés qui ont des parcours, page du
// degré (parcours sous leur chapitre), ajout et retrait d'un toucher (« + » / « ✓ »)
// et « Tout ajouter », épingler et cacher depuis l'accueil, bouton retour à chaque niveau, puis la ceinture blanche faite au
// clavier jusqu'au bilan ; le parcours commencé rejoint Mes parcours et le
// suivi. Élève français : seulement les parcours français.
// Téléphone (390 px, clair et sombre) et fenêtre de bureau.
// Le script sert lui-même le catalogue d'essai (explorer/*.json et un parcours
// de 5e), comme les dossiers kDrive de l'Explorer ; pnpm dev doit le lire :
//   VITE_URL_EXPLORER=http://127.0.0.1:8702/explorer.json dans .env.development.local
//   CAPTURES=<dossier> node e2e/explorer.mjs
import { readFileSync, readdirSync } from 'node:fs'
import { createServer } from 'node:http'
import { chromium } from 'playwright'
import { pagePrete, SANS_BRIDAGE, taperDans, touchable } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
}

// Catalogue servi comme le dossier kDrive de l'Explorer : tous les fichiers du dépôt, plus un parcours de 5e
const catalogue = { format: 'classes-mathalea/1', exporteLe: '2026-11-04T00:00:00.000Z', classes: [] }
// 4e Collège : classe figée pour le test (ceintures avec fiches, trois parcours
// d'un même chapitre), le fichier de l'Explorer changeant avec les parcours de Nathan
const source = (f) => (f === 'ch-4e-college.json' ? new URL('donnees/explorer-4e-college.json', import.meta.url) : new URL(`../explorer/${f}`, import.meta.url))
for (const f of readdirSync(new URL('../explorer/', import.meta.url)).filter((x) => x.endsWith('.json')))
  catalogue.classes.push(...JSON.parse(readFileSync(source(f), 'utf8')).classes)
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
// Repères tirés des fichiers : le test suit le contenu de l'Explorer
const tousParcours = catalogue.classes.flatMap((c) => c.parcours)
// Degrés suisses dans l'ordre du référentiel ; le nombre de chapitres vient du
// référentiel (il peut ranger deux thèmes sous un même chapitre), pas des fichiers
const DEGRES_CH = ['9e', '10e', '11e', 'Préqualifiant', '1re Collège', '2e Collège', '3e Collège', '4e Collège']
const avecParcours = DEGRES_CH.filter((niveau) => tousParcours.some((p) => p.niveau === niveau))
const sansParcours = DEGRES_CH.filter((niveau) => !avecParcours.includes(niveau))
const degres = new RegExp(
  avecParcours.map((niveau) => `${niveau} (\\d+ chapitres · )?${tousParcours.filter((p) => p.niveau === niveau).length} parcours`).join(' '),
)
const integrales = tousParcours.find((p) => p.id === 'ch-4c-integrales')
const blanche = integrales.paliers[0]
const ficheBlanche = blanche.fiche
const nbBlanche = integrales.etapes.slice(0, blanche.nb).reduce((a, x) => a + x.nbQuestions, 0)
const exempleBlanche = ficheBlanche.blocs.find((b) => b.type === 'exemple')
const qcmBlanche = ficheBlanche.blocs.find((b) => b.type === 'question' && b.choix)
const nombreBlanche = ficheBlanche.blocs.find((b) => b.type === 'question' && !b.choix)
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
  // Catalogue lu sur le dossier (explorer/*.json) : les degrés qui ont des parcours, dans l'ordre du référentiel
  ok(degres.test(racine), `${suffixe} : ${avecParcours.join(', ')}, avec leurs parcours`, racine)
  ok(!new RegExp(sansParcours.map((d) => `\\b${d}\\b`).join('|')).test(racine), `${suffixe} : degrés sans parcours masqués`)
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
  ok(chapitres.join(',') === 'Analyse', `${suffixe} : chapitres du référentiel en titres, dans son ordre`, chapitres.join(','))
  ok(await e.getByRole('button', { name: /^Calcul intégral/ }).isVisible(), `${suffixe} : parcours visibles dès la page du degré`)
  ok(!(await e.locator('main .bx-folder').count()), `${suffixe} : aucun dossier de chapitre`)
  await cap(e, `2-degre-${suffixe}`)

  // Ajouter d'un toucher : « + » de la tuile, qui devient « ✓ » ; on reste dans le degré
  // Onglet Explorer : il rouvre le degré laissé ouvert, sinon on le touche
  const auDegre = async () => {
    await onglet(e, 'Explorer').click()
    await pagePrete(e)
    if ((await e.locator('header h1').first().innerText({ timeout: 2000 }).catch(() => '')).trim() !== '4e Collège') await degre.click()
    await pagePrete(e)
  }
  const lireAjoutes = () => e.evaluate(() => JSON.parse(localStorage.getItem('copie:ajoutes') ?? '[]').map((p) => p.id))
  const coches = () => e.locator('main button[aria-pressed=true]').count()
  ok(!(await e.getByRole('button', { name: 'Ajouter plusieurs parcours' }).count()), `${suffixe} : plus de panneau « Ajouter plusieurs parcours »`)
  await e.getByRole('button', { name: 'Ajouter « Calcul intégral » à ton accueil' }).click()
  await pagePrete(e)
  ok(await e.getByRole('button', { name: 'Retirer « Calcul intégral » de ton accueil' }).isVisible(), `${suffixe} : « + » devenu « ✓ »`)
  ok((await lireAjoutes()).join() === 'ch-4c-integrales', `${suffixe} : ajouté d'un toucher, enregistré`)
  ok((await titre(e)) === '4e Collège', `${suffixe} : on reste dans le degré`)
  // « Tout ajouter » : le reste du degré d'un coup
  await e.getByRole('button', { name: /^Tout ajouter \(2\)/ }).click()
  await pagePrete(e)
  ok((await texte(e)).includes('2 parcours ajoutés à ton accueil.'), `${suffixe} : « Tout ajouter » confirmé, on reste dans le degré`)
  ok((await coches()) === 3, `${suffixe} : les trois parcours marqués « ✓ »`)
  const ajoutes = await lireAjoutes()
  ok(ajoutes.length === 3 && ajoutes.includes('ch-4c-integrales'), `${suffixe} : parcours enregistrés à l'accueil`, ajoutes)
  ok(!(await e.getByRole('button', { name: /^Tout ajouter/ }).count()), `${suffixe} : tout est ajouté, plus de « Tout ajouter »`)
  await cap(e, `2b-ajoutes-${suffixe}`)

  // Retirer d'un toucher sur « ✓ »
  await e.getByRole('button', { name: 'Retirer « Exponentielle et logarithme » de ton accueil' }).click()
  await pagePrete(e)
  await e.getByRole('button', { name: 'Retirer « Prérequis pour l’analyse » de ton accueil' }).click()
  await pagePrete(e)
  ok((await coches()) === 1, `${suffixe} : un seul parcours encore marqué « ✓ »`)
  ok((await lireAjoutes()).join() === 'ch-4c-integrales', `${suffixe} : parcours retirés de l'accueil enregistrés`)
  ok(await e.getByRole('button', { name: 'Ajouter « Exponentielle et logarithme » à ton accueil' }).isVisible(), `${suffixe} : retiré, de nouveau « + »`)
  await cap(e, `2c-retirer-${suffixe}`)

  // Bouton retour du téléphone : degré, Explorer, puis Mes parcours
  await e.goBack()
  await pagePrete(e)
  ok(await degre.isVisible(), `${suffixe} : retour à l'Explorer`)
  await e.goBack()
  await pagePrete(e)
  ok((await onglet(e, 'Mes parcours').getAttribute('aria-selected')) === 'true' || (await texte(e)).includes('Mes parcours'), `${suffixe} : retour à Mes parcours`)
  // Parcours ajoutés : rangés comme les autres, boussole à côté du titre, plus de section à part
  const ajouteVisible = async () => (await e.getByRole('button', { name: /Calcul intégral \(ajouté depuis Explorer\)/ }).filter({ visible: true }).count()) > 0
  ok((await ajouteVisible()) && !(await texte(e)).includes('Ajoutés depuis Explorer'), `${suffixe} : parcours ajoutés sur l'accueil, boussole sur leur tuile`)
  ok(!(await texte(e)).includes('Exponentielle et logarithme'), `${suffixe} : parcours retiré absent de l'accueil`)

  // Accueil : épingle et œil sur chaque tuile, sans « ⋯ » : épingler, désépingler, cacher, remettre
  ok(!(await e.getByRole('button', { name: /^Actions pour/ }).count()), `${suffixe} : pas de « ⋯ » sur les tuiles`)
  await e.getByRole('button', { name: 'Épingler « Calcul intégral » à l’accueil' }).first().click()
  await pagePrete(e)
  const accueilEpingle = await texte(e)
  ok(/Épinglés Calcul intégral/.test(accueilEpingle), `${suffixe} : parcours de l'Explorer épinglé depuis l'accueil`)
  ok((await lireAjoutes()).join() === 'ch-4c-integrales', `${suffixe} : épingler ne retire pas le parcours`)
  await cap(e, `2d-epingle-${suffixe}`)
  await e.getByRole('button', { name: 'Désépingler « Calcul intégral »' }).first().click()
  await pagePrete(e)
  ok(!(await texte(e)).includes('Épinglés') && (await ajouteVisible()) && (await lireAjoutes()).join() === 'ch-4c-integrales', `${suffixe} : désépinglé, toujours sur l'accueil`)
  await e.getByRole('button', { name: 'Cacher « Calcul intégral »' }).first().click()
  await pagePrete(e)
  const accueilCache = await texte(e)
  ok(!(await ajouteVisible()) && accueilCache.includes('Parcours cachés · 1') && (await lireAjoutes()).join() === 'ch-4c-integrales', `${suffixe} : caché, rangé en bas, toujours enregistré`)
  await e.getByRole('button', { name: /Parcours cachés/ }).click()
  await cap(e, `2e-caches-${suffixe}`)
  await e.getByRole('button', { name: 'Remettre « Calcul intégral » sur l’accueil' }).click()
  await pagePrete(e)
  ok((await ajouteVisible()) && !(await texte(e)).includes('Parcours cachés'), `${suffixe} : remis sur l'accueil`)
  // Retirer depuis l'Explorer (« ✓ ») : il quitte l'accueil
  await auDegre()
  await e.getByRole('button', { name: 'Retirer « Calcul intégral » de ton accueil' }).click()
  await pagePrete(e)
  await onglet(e, 'Mes parcours').click()
  await pagePrete(e)
  ok(!(await ajouteVisible()) && !(await texte(e)).includes('Calcul intégral') && !(await lireAjoutes()).length, `${suffixe} : parcours retiré, absent de l'accueil`)

  // Ouvrir un parcours puis revenir : on retrouve le degré
  await auDegre()
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
  ok((await titre(e)) === ficheBlanche.titre, `${suffixe} : fiche de la ceinture avant l'entraînement`)
  ok(await touchable(entrainement), `${suffixe} : « Commencer l'entraînement » visible et touchable`)
  ok((await e.locator('main .katex').count()) > 10, `${suffixe} : formules rendues`)
  ok(!(await debordement(e)), `${suffixe} : fiche sans défilement horizontal`)
  await cap(e, `4b-fiche-cours-${suffixe}`)
  const exemple = e.getByRole('region', { name: exempleBlanche.titre.replace(/\$/g, '') }).first()
  await exemple.getByRole('button', { name: 'Voir la première étape' }).click()
  for (let k = 1; k < exempleBlanche.etapes.length; k++) await exemple.getByRole('button', { name: 'Étape suivante' }).click()
  ok((await exemple.locator('.border-l-4').count()) === exempleBlanche.etapes.length && !(await exemple.getByRole('button').count()), `${suffixe} : exemple dévoilé pas à pas, jusqu'au bout`)
  const qcm = e.getByRole('region', { name: 'À toi' }).first()
  await qcm.getByRole('radio').nth(qcmBlanche.bonne === 0 ? 1 : 0).click()
  ok((await qcm.innerText()).includes('Incorrecte'), `${suffixe} : question « À toi », mauvaise réponse signalée`)
  await qcm.getByRole('radio').nth(qcmBlanche.bonne).click()
  ok((await qcm.innerText()).includes('Correcte') && !(await qcm.innerText()).includes('Incorrecte'), `${suffixe} : bonne réponse, explication`)
  const nombre = e.getByRole('region', { name: 'À toi' }).nth(1)
  await taperDans(e, nombre.getByLabel('Ta réponse'), String(nombreBlanche.reponse))
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
  ok(n + 1 === nbBlanche, `${suffixe} : ${nbBlanche} questions dans la ceinture blanche (${n + 1})`)
  ok(types.has('champ'), `${suffixe} : expressions saisies au clavier`)
  const bilan = await texte(e)
  ok(new RegExp(`\\d+ / ${nbBlanche}`).test(bilan), `${suffixe} : bilan sur ${nbBlanche} questions`)
  await cap(e, `6-bilan-${suffixe}`)
  ok(await e.getByRole('button', { name: `Revoir la fiche : ${ficheBlanche.titre}` }).isVisible(), `${suffixe} : bilan sous le seuil, fiche à revoir`)
  await e.getByRole('button', { name: 'Voir la carte du parcours' }).click()
  await pagePrete(e)
  // La fiche reste dans le parcours, comme ressource ; la séance suivante commence sans elle
  await e.getByRole('button', { name: `Fiche : ${ficheBlanche.titre}`, exact: true }).click()
  await pagePrete(e)
  ok((await titre(e)) === ficheBlanche.titre && !(await entrainement.count()), `${suffixe} : fiche relue depuis le parcours, sans lancer de séance`)
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

  // Cacher un parcours commencé puis le remettre, puis le retirer depuis l'Explorer et le remettre : rien n'est perdu
  const travail = () => e.evaluate(() => Object.keys(localStorage).filter((k) => /^copie:(seance|historique|resultats):ch-4c-integrales/.test(k) && localStorage.getItem(k) !== 'null').sort().join())
  const avant = await travail()
  ok(avant.includes('seance'), `${suffixe} : tentative en cours enregistrée`, avant)
  await onglet(e, 'Mes parcours').click()
  await pagePrete(e)
  await e.getByRole('button', { name: 'Cacher « Calcul intégral »' }).first().click()
  await pagePrete(e)
  ok(!/En cours Calcul intégral/.test(await texte(e)) && (await texte(e)).includes('Parcours cachés · 1'), `${suffixe} : parcours commencé caché`)
  await e.getByRole('button', { name: /Parcours cachés/ }).click()
  await e.getByRole('button', { name: 'Remettre « Calcul intégral » sur l’accueil' }).click()
  await pagePrete(e)
  ok(/En cours Calcul intégral/.test(await texte(e)) && (await travail()) === avant, `${suffixe} : caché puis remis, de nouveau « En cours », rien de perdu`)
  await auDegre()
  await e.getByRole('button', { name: 'Retirer « Calcul intégral » de ton accueil' }).click()
  await pagePrete(e)
  await onglet(e, 'Mes parcours').click()
  await pagePrete(e)
  ok(!(await texte(e)).includes('Calcul intégral'), `${suffixe} : parcours commencé retiré de l'accueil`)
  await onglet(e, 'Suivi').click()
  await pagePrete(e)
  ok((await texte(e)).includes('Calcul intégral'), `${suffixe} : retiré, toujours dans le suivi`)
  await auDegre()
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
}

await nav.close()
serveur.close()
for (const x of erreurs) console.log('✘ erreur de page :', x)
console.log(echecs || erreurs.length ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs || erreurs.length ? 1 : 0)
