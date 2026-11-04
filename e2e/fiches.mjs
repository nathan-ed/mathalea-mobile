// Onglet Fiches de l'élève, joué au doigt : chapitre seul déplié d'office mais
// refermable (il ne se repliait pas, retour de Nathan du 4 novembre 2026),
// chapitres et parcours dépliables, recherche, fiches enregistrées (ordre,
// retrait), ouverture d'une fiche et bouton retour qui garde l'état.
// Téléphone (clair) et bureau (sombre). Captures : CAPTURES=<dossier>.
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { pagePrete, pointStable, SANS_BRIDAGE } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}
const catalogue = JSON.parse(readFileSync(new URL('../explorer/ch-11e-ls.json', import.meta.url), 'utf8')).classes.flatMap((c) => c.parcours)
const un = (id) => catalogue.find((p) => p.id === id)
const puissances = un('ch-11ls-puissances-racines')
const ensembles = un('ch-11ls-ensembles-nombres')
const equations = un('ch-11ls-equations')
const titresFiches = (p) => (p.paliers ?? []).filter((x) => x.fiche).map((x) => x.fiche.titre)
const nbFiches = (p) => titresFiches(p).length

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })
const appareils = [
  { nom: 'téléphone clair', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: 'light' },
  { nom: 'bureau sombre', viewport: { width: 1280, height: 800 }, colorScheme: 'dark' },
]

async function ouvrirOnglet(liste, a) {
  const { nom, ...options } = a
  const ctx = await nav.newContext({ ...options, deviceScaleFactor: 1 })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript((l) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('copie:profil', JSON.stringify('eleve'))
    localStorage.setItem('copie:pays', JSON.stringify('CH'))
    localStorage.setItem('copie:ajoutes', JSON.stringify(l))
  }, liste)
  const t = await ctx.newPage()
  const erreurs = []
  t.on('pageerror', (e) => erreurs.push(e.message))
  await t.goto(base)
  await pagePrete(t)
  await toucher(t, t.getByRole('tab', { name: 'Fiches' }))
  return { ctx, t, erreurs }
}

/** Touche un bouton immobile et visible (défilé au besoin), comme un élève */
async function toucher(t, bouton) {
  await bouton.scrollIntoViewIfNeeded()
  await pointStable(bouton)
  await bouton.click()
  await pagePrete(t)
}

const entete = (t, texte) => t.locator('button[aria-expanded]').filter({ hasText: texte }).first()
const deplie = async (b) => (await b.getAttribute('aria-expanded')) === 'true'
const lignes = (t) => t.locator('main li')
/** Touche l'en-tête, au plus deux fois si le toucher n'a pas eu d'effet */
async function basculer(t, b) {
  const avant = await deplie(b)
  for (let i = 0; i < 2 && (await deplie(b)) === avant; i++) await toucher(t, b)
  return deplie(b)
}

for (const a of appareils) {
  const s = a.colorScheme === 'dark' ? '-sombre' : ''

  // Un seul chapitre (la capture de Nathan) : déplié d'office, puis replié, puis rouvert
  {
    const { ctx, t, erreurs } = await ouvrirOnglet([puissances], a)
    const chap = entete(t, 'Nombres réels')
    ok((await deplie(chap)) && (await lignes(t).count()) === nbFiches(puissances), `${a.nom} : chapitre seul déplié d'office, ${nbFiches(puissances)} fiches`)
    const sousTitres = await t.locator('main li').filter({ hasText: puissances.titre }).count()
    ok(sousTitres === 0, `${a.nom} : le titre du parcours n'est pas répété sous chaque fiche (${sousTitres})`)
    await t.screenshot({ path: `${captures}/fiches-seul${s}.png` })
    ok((await basculer(t, chap)) === false && (await lignes(t).count()) === 0, `${a.nom} : chapitre seul replié au toucher`)
    ok((await t.locator('i.bx-chevron-down').count()) === 1, `${a.nom} : chevron vers le bas une fois replié`)
    await t.screenshot({ path: `${captures}/fiches-seul-replie${s}.png` })
    ok((await basculer(t, chap)) === true && (await lignes(t).count()) === nbFiches(puissances), `${a.nom} : chapitre seul rouvert`)
    ok(!erreurs.length, `${a.nom} : aucune erreur de page ${erreurs}`)
    await ctx.close()
  }

  // Deux chapitres, dont un avec deux parcours
  {
    const { ctx, t, erreurs } = await ouvrirOnglet([puissances, ensembles, equations], a)
    const reels = entete(t, 'Nombres réels')
    const eq = entete(t, 'Équations')
    ok(!(await deplie(reels)) && !(await deplie(eq)) && (await lignes(t).count()) === 0, `${a.nom} : deux chapitres, repliés`)
    ok((await basculer(t, reels)) === true, `${a.nom} : Nombres réels déplié`)
    const p1 = entete(t, puissances.titre)
    const p2 = entete(t, ensembles.titre)
    ok((await p1.isVisible()) && (await p2.isVisible()) && (await lignes(t).count()) === 0, `${a.nom} : ses deux parcours, repliés`)
    ok((await basculer(t, p1)) === true && (await lignes(t).count()) === nbFiches(puissances), `${a.nom} : ${puissances.titre} déplié`)
    await t.screenshot({ path: `${captures}/fiches-chapitres${s}.png` })

    // Ouvrir une fiche, puis revenir : même onglet, mêmes dépliants
    const premiere = titresFiches(puissances)[0]
    await toucher(t, t.locator('main li button').filter({ hasText: premiere }).first())
    ok((await t.locator('body').innerText()).includes('Voir la première étape') && (await t.getByRole('heading', { name: premiere }).first().isVisible()) && !(await t.getByRole('tab', { name: 'Fiches' }).isVisible().catch(() => false)), `${a.nom} : fiche « ${premiere} » ouverte`)
    await t.screenshot({ path: `${captures}/fiches-fiche${s}.png` })
    await t.goBack({ waitUntil: 'commit', timeout: 3000 }).catch(() => {})
    await pagePrete(t)
    ok((await deplie(entete(t, 'Nombres réels'))) && (await deplie(entete(t, puissances.titre))) && !(await deplie(entete(t, 'Équations'))), `${a.nom} : retour du téléphone, dépliants gardés`)

    // Repli du chapitre, puis du parcours
    ok((await basculer(t, entete(t, 'Nombres réels'))) === false && (await lignes(t).count()) === 0, `${a.nom} : Nombres réels replié`)

    // Enregistrer deux fiches, les permuter, en retirer une
    await basculer(t, eq)
    const fichesEq = titresFiches(equations)
    for (const titre of fichesEq.slice(0, 2)) await toucher(t, t.getByRole('button', { name: `Enregistrer « ${titre} »` }).first())
    const mes = () => t.locator('main ul').first().locator('li').allInnerTexts()
    ok((await t.getByRole('heading', { name: 'Mes fiches' }).isVisible()) && (await mes()).length === 2, `${a.nom} : deux fiches dans Mes fiches`)
    await toucher(t, t.getByRole('button', { name: `Descendre « ${fichesEq[0]} »` }))
    const ordre = await mes()
    ok(ordre[0].includes(fichesEq[1]) && ordre[1].includes(fichesEq[0]), `${a.nom} : ordre changé`)
    const enregistrees = await t.evaluate(() => JSON.parse(localStorage.getItem('copie:fiches-enregistrees')).map((f) => f.fiche.titre))
    ok(enregistrees.join('|') === [fichesEq[1], fichesEq[0]].join('|'), `${a.nom} : ordre enregistré`)
    await toucher(t, t.getByRole('button', { name: `Retirer « ${fichesEq[1]} »` }).first())
    ok((await mes()).length === 1, `${a.nom} : une fiche retirée`)
    await t.screenshot({ path: `${captures}/fiches-mes-fiches${s}.png` })

    // Recherche par début de mot, sans accent
    const champ = t.getByLabel('Rechercher une fiche')
    await champ.scrollIntoViewIfNeeded()
    await champ.fill('ecriture scien')
    await pagePrete(t)
    const trouvees = await lignes(t).allInnerTexts()
    ok(trouvees.length > 0 && trouvees.every((x) => /Écriture scientifique|écriture scientifique/i.test(x)), `${a.nom} : recherche « ecriture scien » (${trouvees.length})`)
    await champ.fill('cientifique')
    await pagePrete(t)
    ok((await t.getByText('Aucune fiche ne correspond.').isVisible()), `${a.nom} : pas de milieu de mot`)
    await champ.fill('')
    await pagePrete(t)
    ok((await t.getByRole('heading', { name: 'Mes fiches' }).isVisible()), `${a.nom} : recherche vidée, liste revenue`)
    ok(!erreurs.length, `${a.nom} : aucune erreur de page ${erreurs}`)
    await ctx.close()
  }
}
await nav.close()
console.log(echecs ? `${echecs} échec(s)` : 'Fiches : tout vert')
process.exit(echecs ? 1 : 0)
