// Défilement au doigt sur chaque écran de l'app (pnpm dev seulement). En 0.4.6
// et 0.4.7, plus aucun écran ne défilait au doigt ; defilement.mjs ne contrôle
// que les Réglages et l'accueil. Ici : chaque écran de l'élève, de l'Explorer
// et de l'enseignant, et les panneaux du bas qui défilent à l'intérieur.
// À chaque écran, vrais événements tactiles :
//   - le doigt descend jusqu'en bas de la page, puis remonte tout en haut ;
//   - en bas, le dernier bouton de la page est visible et touchable (pas caché
//     sous la barre d'onglets ni sous une barre fixée) ;
//   - aucune largeur de trop (pas de défilement horizontal).
// Un écran trop court pour défiler est allongé (bloc de 1500 px dans main) :
// c'est le CSS de l'écran qu'on éprouve, pas la longueur de son contenu.
// Grand téléphone (390 × 844, sombre), petit téléphone (360 × 640, clair,
// comme beaucoup d'Android 11), fenêtre de bureau à la molette.
// Le script sert le catalogue de l'Explorer (explorer/*.json) ; pnpm dev doit le lire :
//   VITE_URL_EXPLORER=http://127.0.0.1:8702/explorer.json pnpm dev
//   node e2e/defilement-ecrans.mjs
import { readFileSync, readdirSync } from 'node:fs'
import { createServer } from 'node:http'
import { chromium } from 'playwright'

const base = 'http://localhost:1420/'
let echecs = 0
const erreurs = []
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond ? '' : detail)
}

// Catalogue de l'Explorer : tous les fichiers du dépôt réunis
const catalogue = { format: 'classes-mathalea/1', exporteLe: '2026-10-29T00:00:00.000Z', classes: [] }
for (const f of readdirSync('explorer').filter((x) => x.endsWith('.json'))) catalogue.classes.push(...JSON.parse(readFileSync(`explorer/${f}`, 'utf8')).classes)
const serveur = createServer((req, res) => {
  res.writeHead(req.url === '/explorer.json' ? 200 : 404, { 'content-type': 'application/json' })
  res.end(req.url === '/explorer.json' ? JSON.stringify(catalogue) : '')
}).listen(8702, '127.0.0.1')

const demo = JSON.parse(readFileSync('static/demo/parcours-demonstration.json', 'utf8'))
const parcoursDemo = demo.classes.flatMap((c) => c.parcours)
const classeEleve = { lien: 'https://kdrive.infomaniak.com/app/share/1/demo', nom: '5e A', disponibles: ['5e A'], parcours: parcoursDemo }
// Bibliothèque assez longue pour défiler d'elle-même : démonstration et catalogue
const tous = [...parcoursDemo, ...catalogue.classes.flatMap((c) => c.parcours)]
const bibliotheque = {
  lien: 'https://kdrive.infomaniak.com/app/share/1/essai',
  classes: [{ nom: '5e A' }, { nom: '5e B' }, { nom: '11LC' }],
  parcours: tous.map((p, i) => ({ parcours: p, classes: [['5e A', '5e B', '11LC'][i % 3]], exportee: {} })),
}

const appareils = {
  grand: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'dark' },
  petit: { viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'light' },
  bureau: { viewport: { width: 1100, height: 760 }, colorScheme: 'light' },
}
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })

async function ouvrir(appareil, stockage) {
  const ctx = await nav.newContext(appareils[appareil])
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript((stockage) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    for (const [cle, valeur] of Object.entries(stockage)) localStorage.setItem(`copie:${cle}`, JSON.stringify(valeur))
  }, stockage)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${appareil} : ${e.message}`))
  await page.goto(base)
  await page.locator('nav [role=tab]').first().waitFor({ timeout: 60_000 })
  const tactile = !!appareils[appareil].hasTouch
  return { ctx, page, cdp: tactile ? await ctx.newCDPSession(page) : null }
}

/** Glissé vertical du doigt, au milieu de l'écran (ou dans la zone donnée) */
async function glisser(cdp, page, versLeBas, zone) {
  const { width, height } = page.viewportSize()
  const x = zone ? zone.x + zone.width / 2 : width / 2
  const haut = zone ? zone.y + zone.height * 0.2 : height * 0.25
  const bas = zone ? zone.y + zone.height * 0.8 : height * 0.7
  const [y1, y2] = versLeBas ? [bas, haut] : [haut, bas]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y1 }] })
  for (let i = 1; i <= 10; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y1 + ((y2 - y1) * i) / 10 }] })
    await page.waitForTimeout(16)
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(350)
}

const mesure = (page) =>
  page.evaluate(() => ({ y: Math.round(scrollY), max: Math.max(0, document.documentElement.scrollHeight - innerHeight), large: document.documentElement.scrollWidth > innerWidth + 1 }))

/**
 * Contenu le plus bas de main (texte ou bouton), une fois en bas de la page :
 * visible en entier et non recouvert (barre d'onglets, barre fixée en bas)
 */
const dernierTouchable = (page) =>
  page.evaluate(() => {
    const feuilles = [...document.querySelectorAll('main *')].filter((e) => {
      if (!(e instanceof HTMLElement) || e.offsetParent === null || e.closest('.fixed')) return false
      const r = e.getBoundingClientRect()
      return r.height > 0 && (e.matches('button, a[href], [role=switch], input, textarea') || (!e.children.length && e.textContent.trim()))
    })
    const b = feuilles.sort((x, y) => x.getBoundingClientRect().bottom - y.getBoundingClientRect().bottom).at(-1)
    if (!b) return { ok: true, nom: '(rien)' }
    const r = b.getBoundingClientRect()
    const dessus = document.elementFromPoint(r.left + Math.min(r.width / 2, 20), r.bottom - Math.min(r.height / 2, 8))
    return { ok: r.bottom <= innerHeight + 1 && !!dessus && (dessus === b || b.contains(dessus) || dessus.contains(b)), nom: (b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 40), bas: Math.round(r.bottom), dessus: dessus?.className?.toString().slice(0, 60) }
  })

/** L'écran défile jusqu'en bas et revient en haut, au doigt (ou à la molette sur bureau) */
async function verifier(o, ecran) {
  const { page, cdp } = o
  await page.waitForTimeout(500)
  await page.evaluate(() => scrollTo(0, 0))
  let m = await mesure(page)
  let allonge = false
  if (m.max < 200) {
    allonge = true
    await page.evaluate(() => {
      const d = document.createElement('div')
      d.className = 'essai-defilement'
      d.style.height = '1500px'
      const main = document.querySelector('main') ?? document.body
      main.insertBefore(d, main.firstChild)
    })
    await page.waitForTimeout(200)
    m = await mesure(page)
  }
  const nom = `${ecran}${allonge ? ' (allongé)' : ''}`
  for (let i = 0; i < 40 && m.y < m.max - 2; i++) {
    const avant = m.y
    if (cdp) await glisser(cdp, page, true)
    else {
      await page.mouse.move(page.viewportSize().width / 2, page.viewportSize().height / 2)
      await page.mouse.wheel(0, 500)
      await page.waitForTimeout(250)
    }
    m = await mesure(page)
    if (m.y === avant) break
  }
  ok(m.y >= m.max - 2 && m.max > 0, `${nom} : ${cdp ? 'le doigt' : 'la molette'} descend jusqu’en bas`, JSON.stringify(m))
  if (!allonge) {
    const d = await dernierTouchable(page)
    ok(d.ok, `${nom} : en bas, « ${d.nom} » est visible, rien ne le recouvre`, JSON.stringify(d))
  }
  ok(!m.large, `${nom} : pas de défilement horizontal`)
  for (let i = 0; i < 40 && m.y > 0; i++) {
    const avant = m.y
    if (cdp) await glisser(cdp, page, false)
    else {
      await page.mouse.wheel(0, -500)
      await page.waitForTimeout(250)
    }
    m = await mesure(page)
    if (m.y === avant) break
  }
  ok(m.y === 0, `${nom} : ${cdp ? 'le doigt' : 'la molette'} remonte tout en haut`, JSON.stringify(m))
  await page.evaluate(() => document.querySelectorAll('.essai-defilement').forEach((d) => d.remove()))
}

/** Le panneau du bas ouvert défile en lui-même, au doigt */
async function verifierPanneau(o, ecran, doitDefiler = false) {
  const { page, cdp } = o
  const panneau = page.locator('.feuille').last()
  await panneau.waitFor()
  await page.waitForTimeout(400)
  const zone = await panneau.boundingBox()
  ok(!!zone && zone.y >= 0 && zone.y + zone.height <= page.viewportSize().height + 1, `${ecran} : le panneau tient dans l’écran`, JSON.stringify(zone))
  // Liste écrasée : en flex avec une hauteur limitée, une liste en overflow-hidden tombait à 0 px
  const ecrasees = await page.evaluate(() =>
    [...[...document.querySelectorAll('.feuille')].at(-1).querySelectorAll('ul, li, button')].filter((e) => e.children.length && e.getBoundingClientRect().height < e.scrollHeight - 2).length,
  )
  ok(ecrasees === 0, `${ecran} : aucune liste ni ligne écrasée`, `${ecrasees} élément(s)`)
  // Conteneur qui défile : le panneau ou une liste dedans (la plus haute)
  const defile = () =>
    page.evaluate(() => {
      const f = [...document.querySelectorAll('.feuille')].at(-1)
      const candidats = [f, ...f.querySelectorAll('.overflow-y-auto')].filter((e) => e.scrollHeight > e.clientHeight + 4)
      const e = candidats.at(-1)
      return e ? { top: Math.round(e.scrollTop), max: e.scrollHeight - e.clientHeight } : null
    })
  let d = await defile()
  if (!d) {
    ok(!doitDefiler, `${ecran} : ${doitDefiler ? 'le panneau devrait défiler' : 'panneau trop court pour défiler'}`)
    return
  }
  const pageAvant = (await mesure(page)).y
  const liste = page.locator('.feuille .overflow-y-auto').last()
  const zoneListe = (await liste.count()) ? await liste.boundingBox() : zone
  for (let i = 0; i < 20 && d.top < d.max - 2; i++) {
    const avant = d.top
    if (cdp) await glisser(cdp, page, true, zoneListe)
    else {
      await page.mouse.move(zoneListe.x + zoneListe.width / 2, zoneListe.y + zoneListe.height / 2)
      await page.mouse.wheel(0, 300)
      await page.waitForTimeout(250)
    }
    d = await defile()
    if (d.top === avant) break
  }
  ok(d.top >= d.max - 2, `${ecran} : le panneau défile jusqu’en bas`, JSON.stringify(d))
  const pageApres = await mesure(page)
  ok(pageApres.y === pageAvant, `${ecran} : la page derrière le panneau ne bouge pas`, `${pageAvant} → ${JSON.stringify(pageApres)}`)
}

const retour = async (page) => {
  await page.goBack({ waitUntil: 'commit', timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(400)
}
const onglet = (page, nom) => page.getByRole('tab', { name: nom, exact: true }).click()

for (const appareil of Object.keys(appareils)) {
  const a = (ecran) => `${appareil} · ${ecran}`

  // ---------- Élève (France) : accueil, parcours, fiche, séance, suivi, réglages ----------
  {
    const o = await ouvrir(appareil, { profil: 'eleve', pays: 'FR', classes: [classeEleve] })
    const { page } = o
    await page.getByRole('button', { name: /^\s*Relatifs en ceintures/ }).first().waitFor({ timeout: 60_000 })
    await verifier(o, a('élève, Mes parcours'))
    await page.getByRole('button', { name: /^\s*Relatifs en ceintures/ }).first().click()
    await page.getByRole('button', { name: /Commencer/ }).first().waitFor()
    await verifier(o, a('élève, page du parcours à ceintures'))
    await page.getByRole('button', { name: /Commencer/ }).first().click()
    await page.locator('main math-field, main input[type=checkbox], main input[type=radio]').first().waitFor({ timeout: 60_000 })
    await verifier(o, a('élève, séance'))
    await o.ctx.close()
  }
  {
    const o = await ouvrir(appareil, { profil: 'eleve', pays: 'FR', classes: [classeEleve] })
    await onglet(o.page, 'Suivi')
    await verifier(o, a('élève, Suivi'))
    await o.page.getByRole('button', { name: 'Réglages' }).first().click()
    await o.page.getByRole('heading', { name: 'Sauvegarde' }).waitFor()
    await verifier(o, a('élève, Réglages'))
    await o.ctx.close()
  }

  // ---------- Explorer (Suisse) : degrés, chapitres, parcours, fiche de cours ----------
  {
    const o = await ouvrir(appareil, { profil: 'eleve', pays: 'CH' })
    const { page } = o
    await onglet(page, 'Explorer')
    await page.getByRole('button', { name: /^\s*Préqualifiant/ }).waitFor({ timeout: 60_000 })
    await verifier(o, a('Explorer, degrés'))
    await page.getByRole('button', { name: /^\s*Préqualifiant/ }).click()
    await page.getByRole('button', { name: /^\s*Fractions/ }).waitFor()
    await verifier(o, a('Explorer, chapitres du Préqualifiant'))
    await retour(page)
    await page.getByRole('button', { name: /^\s*11e/ }).click()
    await page.getByRole('button', { name: /^\s*EVACOM TAF/ }).click()
    await page.getByRole('button', { name: /Réviser l’EVACOM TAF/ }).first().click()
    await page.getByRole('button', { name: /Commencer/ }).first().waitFor()
    await verifier(o, a('Explorer, page du parcours EVACOM TAF'))
    await page.getByRole('button', { name: /^\s*Fiche :/ }).first().click()
    await page.waitForTimeout(600)
    await verifier(o, a('Explorer, fiche de cours'))
    await o.ctx.close()
  }

  // ---------- Enseignant : Parcours, page, éditeur, Classes, En classe, panneaux ----------
  {
    const o = await ouvrir(appareil, { profil: 'enseignant', pays: 'FR', bibliotheque })
    const { page } = o
    await page.getByRole('button', { name: /^\s*Relatifs en ceintures/ }).first().waitFor({ timeout: 60_000 })
    await verifier(o, a('enseignant, Parcours'))
    await page.getByRole('button', { name: /Exporter des parcours/ }).click()
    await verifierPanneau(o, a('enseignant, panneau « Exporter »'), true)
    await retour(page)
    await page.getByRole('button', { name: /^\s*Relatifs en ceintures/ }).first().click()
    await page.getByRole('button', { name: 'Lancer une session' }).waitFor()
    await verifier(o, a('enseignant, page du parcours'))
    await page.getByRole('button', { name: 'Autres actions' }).click()
    await verifierPanneau(o, a('enseignant, panneau « Autres actions »'))
    await retour(page)
    await page.getByRole('button', { name: 'Modifier' }).click()
    await page.getByRole('heading', { name: 'Modifier le parcours' }).waitFor()
    await verifier(o, a('enseignant, éditeur'))
    await o.ctx.close()
  }
  {
    const o = await ouvrir(appareil, { profil: 'enseignant', pays: 'FR', bibliotheque })
    const { page } = o
    await onglet(page, 'Classes')
    await page.waitForTimeout(600)
    await verifier(o, a('enseignant, Classes'))
    const choisir = page.getByRole('button', { name: /Choisir les parcours de/ }).first()
    if (await choisir.count()) {
      await choisir.click()
      await verifierPanneau(o, a('enseignant, panneau « Choisir les parcours »'))
      await retour(page)
    }
    await onglet(page, 'En classe')
    await verifier(o, a('enseignant, En classe'))
    await onglet(page, 'Explorer')
    await page.getByRole('button', { name: /^\s*4e Collège|^\s*5e|^\s*Teste ton niveau/ }).first().waitFor({ timeout: 60_000 })
    await verifier(o, a('enseignant, Explorer'))
    await o.ctx.close()
  }
}

ok(erreurs.length === 0, `aucune erreur${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
serveur.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
