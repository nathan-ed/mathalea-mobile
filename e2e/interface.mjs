// Interface de la 0.8.0 (refonte du 26 novembre 2026, docs/recherche-ui-mobile.md).
// Nathan : « trop d'espace, ces grosses boîtes », « il faut 4 / 4 fait très IA »,
// la ceinture à obtenir ne se distinguait pas de la blanche, « il ne faut pas
// que des gens installent l'application sans avoir la compatibilité ».
// Vérifié, comme un élève, sur petit téléphone (360 × 780, clair) et bureau
// (1280 × 800, sombre) :
//   - premier lancement : « Ajoute ta classe », pas de recherche ;
//   - accueil : lignes sans boîte, titres sur deux lignes au plus, ceintures
//     hachurées tant qu'elles ne sont pas obtenues, recherche à partir de
//     7 parcours, ajout de la classe en une ligne qui se déploie ;
//   - appui long : panneau Épingler / Cacher ; un toucher court ouvre le
//     parcours ; le bouton « Actions » au clavier ouvre le même panneau ;
//   - page du parcours : grand titre en entier (celui de la barre revient au
//     défilement), description repliée, échelle de ceintures, ceinture en
//     cours en relief, bouton principal touchable dans la barre du bas ;
//   - fiche de cours : règle en relief, étapes numérotées, choix à cocher ;
//   - séance : la ceinture dans la barre, le drapeau sur la ligne « Question n sur N » ;
//   - appareil trop ancien (iPad sous iPadOS 15, WebView Android 100) : écran
//     qui l'explique au lieu de l'erreur du moteur ;
//   - aucun débordement horizontal, aucune erreur de page.
//   CAPTURES=<dossier> node e2e/interface.mjs   (app construite servie sur 1420, ou BASE)
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { pagePrete, pointStable, SANS_BRIDAGE, actionTuile } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
}
const lire = (f) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')).classes.flatMap((c) => c.parcours)
const fr = lire('explorer/fr-college.json') // 3 parcours à ceintures
const ch = lire('explorer/ch-11e-ls.json') // 11 parcours : la recherche apparaît

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })

async function ouvrir(ecran, theme, stockage) {
  const ctx = await nav.newContext(ecran)
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
  page.on('pageerror', (e) => erreurs.push(e.message))
  await page.goto(base)
  await pagePrete(page)
  return { ctx, page }
}
const texte = async (page) => (await page.locator('body').innerText()).replace(/\s+/g, ' ')
const debordement = (page) => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
async function toucher(page, cible) {
  await cible.scrollIntoViewIfNeeded()
  await pagePrete(page)
  const pt = await pointStable(cible)
  await page.mouse.click(pt.x, pt.y)
  await pagePrete(page)
}
/** Le bouton est-il touchable à son centre (rien par-dessus) ? */
const touchable = (bouton) =>
  bouton.evaluate((b) => {
    const r = b.getBoundingClientRect()
    const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return !!e && (e === b || b.contains(e))
  })

for (const [appareil, theme, ecran] of [
  ['téléphone', 'clair', { viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['bureau', 'sombre', { viewport: { width: 1280, height: 800 } }],
]) {
  const cap = (page, nom) => page.screenshot({ path: `${captures}/interface-${nom}-${theme}.png` })

  // ---------- Premier lancement : « Ajoute ta classe », pas de recherche ----------
  {
    const { ctx, page } = await ouvrir(ecran, theme, { profil: 'eleve', pays: 'FR' })
    await page.getByText('Ajoute ta classe').waitFor({ timeout: 60_000 })
    ok(await page.getByLabel('Lien de partage donné par ton enseignant').isVisible(), `${appareil} : premier lancement, champ du lien`)
    ok(await page.getByRole('button', { name: 'Je n’ai pas de lien' }).isVisible(), `${appareil} : « Je n’ai pas de lien »`)
    ok(await page.getByRole('button', { name: 'Récupérer une sauvegarde' }).isVisible(), `${appareil} : « Récupérer une sauvegarde »`)
    ok(!(await page.getByLabel('Rechercher un parcours').count()), `${appareil} : pas de recherche sans parcours`)
    ok(!(await debordement(page)), `${appareil} : premier lancement, aucun débordement`)
    await cap(page, '1-premier-lancement')
    await ctx.close()
  }

  // ---------- Accueil avec trois parcours ----------
  const { ctx, page } = await ouvrir(ecran, theme, { profil: 'eleve', pays: 'FR', ajoutes: fr })
  await page.locator('.corps-tuile').first().waitFor({ timeout: 60_000 })
  await pagePrete(page)
  ok(!(await page.getByLabel('Rechercher un parcours').count()), `${appareil} : trois parcours, pas de recherche`)
  // Titres sur deux lignes au plus (Rémi : « titre sur cinq lignes »)
  const lignesTitres = await page.locator('.corps-tuile .titre-ligne').evaluateAll((ts) =>
    ts.map((t) => Math.round(t.getBoundingClientRect().height / parseFloat(getComputedStyle(t).lineHeight))),
  )
  ok(lignesTitres.length === 3 && lignesTitres.every((n) => n <= 2), `${appareil} : titres des tuiles sur deux lignes au plus`, lignesTitres.join())
  // Lignes sans boîte : aucune tuile n'a de fond ni de bord
  const fonds = await page.locator('.ligne-tuile').evaluateAll((ls) => ls.map((l) => getComputedStyle(l).backgroundColor + '|' + getComputedStyle(l).borderTopWidth))
  ok(fonds.every((f) => f === 'rgba(0, 0, 0, 0)|0px'), `${appareil} : tuiles sans fond ni bord`, fonds.join(' '))
  // Ceintures : 3 + 3 + 1, toutes à obtenir, hachurées (jamais pleines)
  const mini = await page.locator('.ceinture-mini').evaluateAll((cs) =>
    cs.map((c) => ({ aObtenir: c.classList.contains('a-obtenir'), motif: getComputedStyle(c).backgroundImage.includes('repeating-linear-gradient') })),
  )
  ok(mini.length === 7 && mini.every((c) => c.aObtenir && c.motif), `${appareil} : 7 ceintures en petit, hachurées tant qu'elles ne sont pas obtenues`, JSON.stringify(mini))
  ok(!(await page.locator('.bx-dots-vertical-rounded').count()) && !(await page.locator('.ligne-tuile .bx-hide').count()), `${appareil} : ni « ⋯ » ni œil sur les lignes`)
  // Ajout de la classe : une ligne qui se déploie
  const ajouter = page.getByRole('button', { name: 'Ajouter le dossier de ma classe' })
  ok((await ajouter.isVisible()) && !(await page.getByLabel('Lien de partage donné par ton enseignant').count()), `${appareil} : ajout de la classe en une ligne`)
  await toucher(page, ajouter)
  ok(await page.getByLabel('Lien de partage donné par ton enseignant').isVisible(), `${appareil} : la ligne déploie le formulaire`)
  ok(!(await debordement(page)), `${appareil} : accueil, aucun débordement`)
  await cap(page, '2-accueil')

  // ---------- Appui long : épingler, cacher, remettre ; toucher court : ouvrir ----------
  const titre = fr[0].titre
  await actionTuile(page, titre, `Épingler « ${titre} » à l’accueil`)
  ok((await texte(page)).includes('Épinglés') && (await page.locator('.epingle-ligne').count()) >= 1, `${appareil} : épinglé par l'appui long, petite épingle sur la ligne`)
  await actionTuile(page, titre, `Désépingler « ${titre} »`)
  ok(!(await texte(page)).includes('Épinglés'), `${appareil} : désépinglé`)
  // Clavier : le bouton « Actions » ouvre le même panneau
  await page.getByRole('button', { name: `Actions pour « ${titre} »` }).focus()
  await page.keyboard.press('Enter')
  const panneau = page.getByRole('dialog')
  await panneau.waitFor()
  ok((await panneau.getByRole('button', { name: `Cacher « ${titre} »` }).isVisible()) && (await panneau.getByRole('button', { name: `Épingler « ${titre} » à l’accueil` }).isVisible()), `${appareil} : au clavier, « Actions » ouvre Épingler / Cacher`)
  await pagePrete(page)
  await cap(page, '3-appui-long')
  await toucher(page, panneau.getByRole('button', { name: `Cacher « ${titre} »` }))
  ok((await texte(page)).includes('1 parcours caché'), `${appareil} : caché, rangé en bas`)
  await toucher(page, page.getByRole('button', { name: /parcours cachés?/i }))
  await toucher(page, page.getByRole('button', { name: `Remettre « ${titre} » sur l’accueil` }))
  ok(!(await texte(page)).includes('parcours caché'), `${appareil} : remis sur l'accueil`)

  // ---------- Page du parcours ----------
  await toucher(page, page.locator('.corps-tuile', { hasText: titre }).first())
  const grand = page.locator('main p[aria-hidden="true"]').first()
  await grand.waitFor()
  ok((await grand.innerText()).trim() === titre && (await grand.isVisible()), `${appareil} : grand titre en entier`)
  const opacite = () => page.locator('header h1').evaluate((h) => getComputedStyle(h).opacity)
  ok((await opacite()) === '0', `${appareil} : titre de la barre effacé tant que le grand titre est visible`)
  ok(await page.getByRole('button', { name: 'Lire la suite' }).isVisible(), `${appareil} : description repliée, « Lire la suite »`)
  const ceinturesPage = await page.locator('main ol .ceinture').evaluateAll((cs) => cs.map((c) => c.classList.contains('a-obtenir')))
  ok(ceinturesPage.length === 3 && ceinturesPage.every(Boolean), `${appareil} : échelle de 3 ceintures, hachurées`)
  ok((await page.locator('main li.palier-actif').count()) === 1, `${appareil} : la ceinture en cours seule en relief`)
  ok((await page.locator('main li.palier[class*="rounded"]').count()) === 0 && !(await page.locator('main section.rounded-2xl').count()), `${appareil} : pas de boîtes autour des ceintures`)
  // 0.8.1 : chaque ceinture ouverte a son bouton dans sa ligne, plein pour la ceinture à faire ;
  // plus de bouton dans la barre du bas (on ne voyait pas ce qu'il commençait)
  const principal = page.locator('main li.palier-actif button.bouton-palier')
  ok((await principal.isVisible()) && (await touchable(principal)) && (await principal.innerText()).trim() === 'Commencer', `${appareil} : « Commencer » plein dans la ligne de la ceinture à faire, touchable`)
  ok(!(await page.locator('footer').getByRole('button', { name: /^(Commencer|Continuer)/ }).count()), `${appareil} : pas de bouton dans la barre du bas`)
  const suivantes = await page.locator('main li.palier:not(.palier-actif) .lien-palier').allInnerTexts()
  ok(suivantes.every((t) => !/^Commencer/.test(t.trim()) || /^Commencer sans avoir fait la ceinture /.test(t.trim())), `${appareil} : une ceinture plus loin dit « Commencer sans avoir fait la ceinture … »`, suivantes.join(' | '))
  await cap(page, '4-parcours')
  await page.mouse.wheel(0, 600)
  await page.evaluate(() => window.scrollBy(0, 600))
  await pagePrete(page)
  // Page plus courte que l'écran (bureau) : le grand titre ne passe jamais sous la barre
  const defilable = await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 80)
  if (defilable) ok((await opacite()) === '1', `${appareil} : au défilement, le titre revient dans la barre`)
  await page.evaluate(() => window.scrollTo(0, 0))
  await pagePrete(page)
  await toucher(page, page.getByRole('button', { name: 'Lire la suite' }))
  ok(!(await page.getByRole('button', { name: 'Lire la suite' }).count()), `${appareil} : description dépliée`)
  ok(!(await debordement(page)), `${appareil} : page du parcours, aucun débordement`)

  // ---------- Fiche de cours ----------
  await toucher(page, page.getByRole('button', { name: /^\s*Fiche :/ }).first())
  await page.locator('main .regle').first().waitFor()
  ok((await page.locator('main .regle').count()) >= 1 && (await page.locator('main section.rounded-2xl.border').count()) === 0, `${appareil} : fiche, la règle seule en relief, pas de cartes`)
  const etape = page.getByRole('button', { name: /Voir la première étape/ }).first()
  if (await etape.count()) {
    await toucher(page, etape)
    ok((await page.locator('main .num-etape').first().innerText()).trim() === '1', `${appareil} : fiche, étape numérotée`)
  }
  const choix = page.getByRole('radio').first()
  if (await choix.count()) {
    await toucher(page, choix)
    ok((await page.locator('main .rond-choix.juste, main .rond-choix.faux').count()) === 1, `${appareil} : fiche, le choix est coché juste ou faux`)
  }
  await cap(page, '5-fiche')
  ok(!(await debordement(page)), `${appareil} : fiche, aucun débordement`)

  // ---------- Séance : ceinture dans la barre, drapeau sur la ligne du numéro ----------
  // Retour à la page du parcours, puis le bouton de la barre du bas (la fiche montrée d'office avant la première séance)
  await toucher(page, page.getByRole('button', { name: 'Revenir en arrière' }))
  await toucher(page, page.locator('main li.palier-actif button.bouton-palier'))
  const entrainement = page.getByRole('button', { name: 'Commencer l’entraînement' })
  if (await entrainement.isVisible({ timeout: 5_000 }).catch(() => false)) await toucher(page, entrainement)
  await page.locator('main math-field, main .question-eleve').first().waitFor({ timeout: 120_000 })
  await pagePrete(page)
  const barre = await page.locator('header').innerText()
  ok(/Ceinture blanche/.test(barre) && (await page.locator('header .ceinture').count()) === 1, `${appareil} : séance, la ceinture dans la barre`, barre)
  const ligneNumero = page.locator('p', { hasText: /^Question 1 sur \d+$/ }).locator('..')
  ok((await ligneNumero.getByRole('button', { name: 'Signaler un problème dans cet exercice' }).count()) === 1, `${appareil} : drapeau sur la ligne « Question 1 sur N »`)
  await cap(page, '6-seance')
  ok(!(await debordement(page)), `${appareil} : séance, aucun débordement`)
  await ctx.close()

  // ---------- Parcours sans chapitre : en haut, sans intertitre vide ; « N parcours » en clair ----------
  {
    const sans = { ...fr[0], id: 'essai-sans-chapitre', titre: 'Parcours sans chapitre', theme: '' }
    const { ctx: c2, page: p2 } = await ouvrir(ecran, theme, { profil: 'eleve', pays: 'FR', ajoutes: [sans, fr[1], fr[2]] })
    await p2.locator('.corps-tuile').first().waitFor({ timeout: 60_000 })
    await pagePrete(p2)
    const intertitres = await p2.locator('main .titre-section').allInnerTexts()
    ok(intertitres.every((t) => t.replace(/[·\d\s]|parcours/g, '').trim().length > 0), `${appareil} : aucun intertitre vide`, intertitres.join(' | '))
    const premiere = (await p2.locator('main .corps-tuile .titre-ligne').first().innerText()).trim()
    ok(premiere.startsWith('Parcours sans chapitre'), `${appareil} : le parcours sans chapitre en haut, avant les chapitres`, premiere)
    ok(intertitres.some((t) => /· 2 parcours/.test(t)), `${appareil} : le chapitre dit « 2 parcours » en clair`, intertitres.join(' | '))
    await cap(p2, '2b-sans-chapitre')
    await c2.close()
  }

  // ---------- Onze parcours : la recherche apparaît ----------
  {
    const { ctx, page } = await ouvrir(ecran, theme, { profil: 'eleve', pays: 'CH', ajoutes: ch })
    await page.locator('.corps-tuile').first().waitFor({ timeout: 60_000 })
    ok(await page.getByLabel('Rechercher un parcours').isVisible(), `${appareil} : ${ch.length} parcours, recherche affichée`)
    await ctx.close()
  }
}

// ---------- Appareil trop ancien : un écran l'explique ----------
for (const [nom, ua, attendu] of [
  ['iPad sous iPadOS 15', 'Mozilla/5.0 (iPad; CPU OS 15_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', 'iOS ou iPadOS 16.4'],
  ['WebView Android 100', 'Mozilla/5.0 (Linux; Android 11; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/100.0.4896.127 Mobile Safari/537.36', 'Android System WebView'],
]) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, userAgent: ua, isMobile: true, hasTouch: true })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  // Moteur JavaScript d'iPadOS 15 : pas de « lookbehind » dans les expressions régulières
  if (nom.startsWith('iPad')) {
    await ctx.addInitScript(() => {
      const R = window.RegExp
      window.RegExp = function (motif, drapeaux) {
        if (String(motif).includes('(?<=') || String(motif).includes('(?<!')) throw new SyntaxError('Invalid regular expression: Invalid group specifier name')
        return new R(motif, drapeaux)
      }
      window.RegExp.prototype = R.prototype
    })
  }
  const page = await ctx.newPage()
  await page.goto(base)
  const ecranAncien = page.locator('#webview-ancien')
  await ecranAncien.waitFor({ state: 'visible', timeout: 30_000 })
  const t = (await ecranAncien.innerText()).replace(/\s+/g, ' ')
  ok(t.includes(attendu) && t.includes(nom.startsWith('iPad') ? 'Appareil trop ancien' : 'Mise à jour nécessaire'), `${nom} : écran « appareil trop ancien » (${attendu})`, t)
  ok(nom.startsWith('iPad') ? !(await page.getByRole('button', { name: /Mettre à jour Android/ }).isVisible()) : await page.getByRole('button', { name: /Mettre à jour Android/ }).isVisible(), `${nom} : le bon bouton`)
  await page.screenshot({ path: `${captures}/interface-7-ancien-${nom.startsWith('iPad') ? 'ipad' : 'android'}.png` })
  await ctx.close()
}

ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
