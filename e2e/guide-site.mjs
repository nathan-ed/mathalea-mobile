// Captures du guide pour la page « Parcours pour l'application » du site
// MathALÉA (?v=parcours), sur ordinateur (1280 × 800). Serveur MathALÉA en
// local (dépôt mathalea, `npx vite --port 5180`). Le fichier publié est gardé
// pour le guide de l'app (import).
//   SITE=http://localhost:5180/alea/ node e2e/guide-site.mjs [dossier] [fichier.json]
import { chromium } from 'playwright'

const sortie = process.argv[2] ?? 'docs/guide/images'
const fichier = process.argv[3] ?? '/tmp/parcours-mathalea-site.json'
const site = process.env.SITE ?? 'http://localhost:5180/alea/'
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const p = await (await nav.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5, acceptDownloads: true })).newPage()

/** Capture ; `cible` : ce qu'on touche ensuite, entouré d'un anneau (couleur
 * « struct » de MathALÉA) avec le point de toucher au centre */
async function cap(page, nom, cible) {
  await page.waitForTimeout(500)
  if (cible) {
    const c = cible.first()
    // Au milieu de l'écran (sinon sous la barre du bas) ; sans effet sur ce qui est fixé
    await c.evaluate((el) => {
      if (getComputedStyle(el.closest('nav, footer, header') ?? el).position !== 'fixed') el.scrollIntoView({ block: 'center' })
    })
    await page.waitForTimeout(200)
    const b = await c.boundingBox()
    await page.evaluate((b) => {
      const marge = 5
      const anneau = document.createElement('div')
      anneau.id = 'repere-guide'
      Object.assign(anneau.style, {
        position: 'fixed', left: `${b.x - marge}px`, top: `${b.y - marge}px`, width: `${b.width + 2 * marge}px`, height: `${b.height + 2 * marge}px`,
        border: '3px solid var(--color-coopmaths-struct)', borderRadius: '14px', zIndex: 2147483647, pointerEvents: 'none',
      })
      const point = document.createElement('div')
      Object.assign(point.style, {
        position: 'absolute', left: '50%', top: '50%', width: '18px', height: '18px', margin: '-9px 0 0 -9px', borderRadius: '50%',
        background: 'color-mix(in srgb, var(--color-coopmaths-struct) 30%, transparent)', border: '2px solid var(--color-coopmaths-struct)',
      })
      anneau.append(point)
      document.body.append(anneau)
    }, b)
  }
  await page.screenshot({ path: `${sortie}/${nom}.png` })
  await page.evaluate(() => document.getElementById('repere-guide')?.remove())
}

await p.goto(site + '?v=parcours', { timeout: 240000 })
const creer = p.getByRole('button', { name: 'Créer un parcours' })
await creer.waitFor({ timeout: 240000 })
await cap(p, 'site-1-accueil', creer)
await creer.click()
await p.locator('label:has-text("Titre") input').first().fill('Fractions et écritures décimales')
await p.locator('label:has-text("Niveau") select').first().selectOption('5e')
await p.waitForTimeout(800)
const chapitre = p.getByText('Nombres rationnels', { exact: true }).first()
await cap(p, 'site-2-editeur', chapitre)
await chapitre.click()
await p.locator('label:has-text("But du parcours") input, label:has-text("But du parcours") textarea').first().fill('Passer d’une fraction à son écriture décimale.')
const ajouter = p.getByRole('button', { name: 'Ajouter des exercices' })
await cap(p, 'site-3-ajouter', ajouter)
await ajouter.click()
const dossier = p.getByText(/^Entretenir l'écriture décimale des fractions/).first()
await dossier.waitFor({ timeout: 60000 })
await p.waitForTimeout(1000)
await cap(p, 'site-4-chapitre', dossier)
await dossier.click()
await p.waitForTimeout(2500)
const ajouterExercice = p.locator('button[title^="Ajouter cet exercice"]').first()
await cap(p, 'site-5-exercice', ajouterExercice)
await ajouterExercice.click()
await p.waitForTimeout(800)
const valider = p.getByRole('button', { name: 'Valider', exact: true })
await cap(p, 'site-6-valider', valider)
await valider.click()
await p.waitForTimeout(1500)
const classes = p.getByRole('tab', { name: 'Classes' }).or(p.getByRole('button', { name: 'Classes', exact: true })).first()
await cap(p, 'site-7-parcours', classes)
await classes.click()
await p.getByLabel('Nom de la nouvelle classe').fill('5e A')
const ajouterClasse = p.getByRole('button', { name: /Classe$/ }).first()
await cap(p, 'site-8-classe', ajouterClasse)
await ajouterClasse.click()
await p.waitForTimeout(500)
const choisir = p.getByRole('button', { name: /Choisir les parcours de 5e A/ })
await cap(p, 'site-9-choisir', choisir)
await choisir.click()
await p.getByRole('checkbox').first().check()
await p.waitForTimeout(400)
const publier = p.getByRole('button', { name: /Publier/ }).first()
await cap(p, 'site-10-cocher', publier)
const [telechargement] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }).catch(() => null), publier.click()])
await p.waitForTimeout(1000)
await cap(p, 'site-11-publie')
if (telechargement) {
  await telechargement.saveAs(fichier)
  console.log('fichier :', fichier, telechargement.suggestedFilename())
} else console.log('pas de téléchargement direct')
await nav.close()
