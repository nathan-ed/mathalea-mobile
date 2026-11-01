// Élève qui passe enseignant (Nathan, 1er novembre 2026 : « je suis passé en
// mode prof, et là je voyais plus les classes ») : le premier dossier suivi
// est repris d'office (classes, parcours, lien du drive), au passage en
// enseignant comme au lancement. Les dossiers suivants se reprennent dans les
// Réglages : « Classes et parcours » ou « Seulement les parcours » (collègue).
// Pas de Mise en route quand l'app connaît un lien. Téléphone (390 px, clair)
// et fenêtre de bureau (sombre). Dossiers kDrive fictifs servis par la suite
// (relais de l'app construite).
//   CAPTURES=<dossier> node e2e/eleve-puis-enseignant.mjs
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { jusqua, pagePrete, SANS_BRIDAGE } from './attente.mjs'

const base = 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}

// Dossier de deux classes : 9A (3 parcours) et 9B (2 parcours, dont un commun) : 4 parcours
const demo = JSON.parse(readFileSync(new URL('../static/demo/parcours-demonstration.json', import.meta.url), 'utf8'))
const parcours = demo.classes[0].parcours.map((p) => ({ ...p, niveau: '9e' }))
const par = (id) => parcours.find((p) => p.id === id)
const dossier = JSON.stringify({
  ...demo,
  classes: [
    { nom: '9A', parcours: [par('relatifs-5e'), par('relatifs-paliers-5e'), par('relatifs-ceintures-5e')] },
    { nom: '9B', parcours: [par('relatifs-5e'), par('fractions-4e')] },
  ],
})
const LIEN = 'https://kdrive.infomaniak.com/app/share/481516/2b7e1d4c-5a3f-4e9b-8c21-6f0d9a7b3e52'
// Dossier d'un collègue : une classe 10C, un parcours qui n'est pas dans le premier dossier
const LIEN_COLLEGUE = 'https://kdrive.infomaniak.com/app/share/481516/7f3a9c2e-1b4d-4e8f-a6c5-0d2e9b8a7c61'
const collegue = JSON.stringify({ ...demo, classes: [{ nom: '10C', parcours: [{ ...par('fractions-4e'), id: 'fractions-collegue', titre: 'Fractions du collègue' }] }] })
const contenus = { '2b7e1d4c-5a3f-4e9b-8c21-6f0d9a7b3e52': dossier, '7f3a9c2e-1b4d-4e8f-a6c5-0d2e9b8a7c61': collegue }

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })

async function appareil(nom, options) {
  const ctx = await nav.newContext({ locale: 'fr-FR', ...options })
  await ctx.route('**/__telecharger?**', async (route) => {
    const url = new URL(route.request().url()).searchParams.get('url') ?? ''
    if (!url.startsWith('https://kdrive.infomaniak.com/2/app/481516/share/')) return route.continue()
    const json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) })
    if (url.endsWith('/init')) return json({ data: { file_id: 1 } })
    if (url.includes('/files/1/files')) return json({ data: [{ id: 2, name: 'parcours-mathalea.json', type: 'file' }] })
    const contenu = contenus[/\/share\/([^/]+)\//.exec(url)?.[1]]
    if (!contenu) return route.fulfill({ status: 404, body: '' })
    if (url.endsWith('/files/2/download')) return route.fulfill({ status: 200, contentType: 'application/json', body: contenu })
    return route.fulfill({ status: 404, body: '' })
  })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${nom} : ${e.message}`))
  const role = (r, name) => page.getByRole(r, { name })
  const toucher = async (cible) => {
    await pagePrete(page)
    await cible.first().click()
    await pagePrete(page)
  }
  const texteMain = async () => (await page.locator('main').innerText()).replace(/\s+/g, ' ')
  // Ligne d'un dossier dans les Réglages
  const ligneDossier = (classe) => page.locator('main li').filter({ hasText: classe })

  // Élève : programme, dossier, classe 9A
  await page.goto(base)
  await pagePrete(page)
  await toucher(role('button', /^Suisse/))
  await page.getByLabel('Lien de partage donné par ton enseignant').fill(LIEN)
  await toucher(role('button', 'Ajouter le dossier'))
  await toucher(role('button', /^\s*9A/))
  ok((await texteMain()).includes('Relatifs en ceintures'), `${nom} : l’élève voit les parcours de 9A`)
  return { ctx, page, role, toucher, texteMain, ligneDossier }
}

const quatre = ['Nombres relatifs', 'Relatifs par paliers', 'Relatifs en ceintures', 'Fractions']

// ---------- Téléphone, clair : passage en enseignant, puis un collègue ----------
{
  const nom = 'téléphone'
  const { ctx, page, role, toucher, texteMain, ligneDossier } = await appareil(nom, {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: 'light',
  })
  // Réglages : « Je suis enseignant » : le dossier suivi devient son drive
  await toucher(role('button', 'Réglages'))
  await toucher(page.getByRole('switch'))
  await jusqua(async () => (await ligneDossier('9A').innerText()).includes('Votre drive'), { timeout: 30_000, quoi: 'drive repris' }).catch(() => {})
  ok((await ligneDossier('9A').innerText()).includes('Votre drive') && !(await ligneDossier('9A').getByRole('button', { name: 'Seulement les parcours' }).count()), `${nom} : premier dossier repris d’office (« Votre drive »)`)
  const rangee = (await ligneDossier('9A').innerText()).replace(/\s+/g, ' ')
  ok(rangee.startsWith('9A, 9B') && rangee.includes('4 parcours') && !(await ligneDossier('9A').getByRole('radio').count()), `${nom} : l’enseignant voit tout le dossier, sans choix de classe (${rangee})`)
  await toucher(role('button', 'Enregistrer et quitter'))
  ok(!(await page.getByRole('dialog').count()), `${nom} : aucun panneau à ouvrir`)
  const biblio = await texteMain()
  ok(!biblio.includes('Mise en route') && biblio.includes('Dossier partagé kdrive.infomaniak.com'), `${nom} : drive configuré, pas de Mise en route`)
  ok(quatre.every((x) => biblio.includes(x)), `${nom} : les 4 parcours dans la bibliothèque`)
  const rappels = await page.getByText(/déposez-le|Version différente|pas encore configuré/).allInnerTexts()
  ok(!rappels.length && !biblio.includes('Vérifier le dossier partagé'), `${nom} : aucun rappel (le fichier vient du drive) ${rappels.join(' | ')}`)
  await page.screenshot({ path: `${captures}/eleve-enseignant-1-bibliotheque-clair.png` })
  await toucher(role('tab', 'Classes'))
  const classes = await texteMain()
  ok(classes.includes('9A') && classes.includes('9B'), `${nom} : classes 9A et 9B (${classes.slice(0, 60)})`)
  await page.screenshot({ path: `${captures}/eleve-enseignant-2-classes-clair.png` })

  // Un dossier de collègue dans les Réglages : seulement ses parcours
  await toucher(role('button', 'Réglages'))
  await page.locator('#lien-classe').fill(LIEN_COLLEGUE)
  await toucher(role('button', 'Ajouter le dossier'))
  const ligne = ligneDossier('10C')
  await ligne.getByRole('button', { name: 'Seulement les parcours' }).waitFor({ timeout: 30_000 })
  ok(await ligne.getByRole('button', { name: 'Classes et parcours' }).isVisible(), `${nom} : dossier ajouté : « Classes et parcours » ou « Seulement les parcours »`)
  await ligne.scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${captures}/eleve-enseignant-3-reglages-clair.png` })
  await toucher(ligne.getByRole('button', { name: 'Seulement les parcours' }))
  await ligne.getByText('1 parcours repris.').waitFor({ timeout: 30_000 }).catch(() => {})
  ok((await ligne.innerText()).includes('1 parcours repris.') && !(await ligne.getByRole('button', { name: 'Seulement les parcours' }).count()), `${nom} : « 1 parcours repris. », plus de choix`)
  await toucher(role('button', /Enregistrer et quitter|Revenir en arrière/))
  await toucher(role('tab', 'Parcours'))
  ok((await texteMain()).includes('Fractions du collègue'), `${nom} : parcours du collègue dans la bibliothèque`)
  await toucher(role('tab', 'Classes'))
  ok(!(await texteMain()).includes('10C'), `${nom} : sans la classe du collègue`)
  await ctx.close()
}

// ---------- Bureau, sombre : déjà enseignant au lancement, puis un 2e dossier à soi ----------
{
  const nom = 'bureau'
  const { ctx, page, role, toucher, texteMain, ligneDossier } = await appareil(nom, { viewport: { width: 1280, height: 800 }, colorScheme: 'dark' })
  // App déjà réglée « enseignant » avec un dossier suivi et une bibliothèque vide
  // (état d'avant cette version) : repris au lancement
  await page.evaluate(() => localStorage.setItem('copie:profil', JSON.stringify('enseignant')))
  await page.reload()
  await pagePrete(page)
  await jusqua(async () => (await texteMain()).includes('Dossier partagé kdrive.infomaniak.com'), { timeout: 30_000, quoi: 'reprise au lancement' }).catch(() => {})
  const biblio = await texteMain()
  ok(!biblio.includes('Mise en route') && quatre.every((x) => biblio.includes(x)), `${nom} : au lancement, dossier repris d’office (${biblio.slice(0, 80)})`)
  await page.screenshot({ path: `${captures}/eleve-enseignant-4-bibliotheque-sombre.png` })
  // Un 2e dossier, à soi (autre établissement) : classes et parcours
  await toucher(role('button', 'Réglages'))
  await page.locator('#lien-classe').fill(LIEN_COLLEGUE)
  await toucher(role('button', 'Ajouter le dossier'))
  const ligne = ligneDossier('10C')
  await ligne.getByRole('button', { name: 'Classes et parcours' }).waitFor({ timeout: 30_000 })
  ok((await ligneDossier('9A').innerText()).includes('Votre drive'), `${nom} : le premier reste « Votre drive »`)
  await page.screenshot({ path: `${captures}/eleve-enseignant-5-reglages-sombre.png` })
  await toucher(ligne.getByRole('button', { name: 'Classes et parcours' }))
  await ligne.getByText(/parcours repris/).waitFor({ timeout: 30_000 }).catch(() => {})
  ok(!(await ligne.getByRole('button', { name: 'Classes et parcours' }).count()), `${nom} : plus de choix après la reprise`)
  await toucher(role('button', /Enregistrer et quitter|Revenir en arrière/))
  await toucher(role('tab', 'Classes'))
  const classes = await texteMain()
  ok(['9A', '9B', '10C'].every((c) => classes.includes(c)), `${nom} : classes 9A, 9B et 10C (${classes.slice(0, 60)})`)
  await toucher(role('tab', 'Parcours'))
  ok((await texteMain()).includes('Dossier partagé kdrive.infomaniak.com') && (await texteMain()).includes('Fractions du collègue'), `${nom} : drive inchangé, parcours du 2e dossier ajoutés`)
  await page.screenshot({ path: `${captures}/eleve-enseignant-6-classes-sombre.png` })
  await ctx.close()
}

await nav.close()
ok(!erreurs.length, `aucune erreur de page${erreurs.length ? ` : ${erreurs.join(' | ')}` : ''}`)
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
