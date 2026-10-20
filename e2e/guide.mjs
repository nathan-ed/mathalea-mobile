// Captures du guide (docs/guide/images) : chaque étape telle que l'enseignant
// ou l'élève la voit, à 390 px, thème clair (pnpm dev). Sur chaque capture,
// un anneau entoure ce qu'on touche ensuite.
//   node e2e/guide.mjs [dossier]
//   SEULEMENT=decouvrir|creer|eleve node e2e/guide.mjs
//   FICHIER=<publié sur le site> SEULEMENT=importer node e2e/guide.mjs
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const sortie = process.argv[2] ?? 'docs/guide/images'
const SEULEMENT = process.env.SEULEMENT
const base = 'http://localhost:1420/'
const demo = JSON.parse(readFileSync('static/demo/parcours-demonstration.json', 'utf8'))
const LIEN = 'https://kdrive.infomaniak.com/app/share/123456/7e1c0f4a-5b2d-4c1e-9f3a-2d6b8e0c4a17'
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })

async function appareil(stockage = {}) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await ctx.addInitScript((stockage) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('theme', 'clair')
    for (const [cle, valeur] of Object.entries(stockage)) localStorage.setItem(`copie:${cle}`, JSON.stringify(valeur))
  }, stockage)
  const page = await ctx.newPage()
  await page.goto(base)
  return page
}

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
const etape = (nom) => console.log('·', nom)
const parNom = (p, nom, exact = true) => p.getByRole('button', { name: nom, exact })

// ---------- Découvrir : premier lancement, mode enseignant, démonstration ----------
if (!SEULEMENT || SEULEMENT === 'decouvrir') {
  etape('découvrir')
  const p = await appareil()
  const france = p.getByRole('button', { name: /^France/ })
  await france.waitFor()
  await cap(p, 'decouvrir-1-programme', france)
  await france.click()
  await cap(p, 'decouvrir-2-accueil', parNom(p, 'Réglages'))
  await parNom(p, 'Réglages').click()
  const interrupteur = p.getByRole('switch', { name: /Je suis enseignant/ }).or(p.getByRole('checkbox', { name: /Je suis enseignant/ }))
  await interrupteur.first().scrollIntoViewIfNeeded()
  await p.evaluate(() => scrollBy(0, 120))
  await cap(p, 'decouvrir-3-enseignant', interrupteur)
  await interrupteur.first().click()
  const charger = parNom(p, 'Charger les parcours de démonstration')
  await charger.scrollIntoViewIfNeeded()
  await p.evaluate(() => scrollBy(0, 150))
  await cap(p, 'decouvrir-4-demonstration', charger)
  await charger.click()
  await p.waitForTimeout(800)
  await parNom(p, 'Revenir en arrière').click()
  const vueEleve = p.getByRole('button', { name: /^\s*Vue élève/ })
  await vueEleve.waitFor()
  await cap(p, 'decouvrir-5a-vue-eleve', vueEleve)
  await vueEleve.click()
  const ceintures = p.getByRole('button', { name: /^Relatifs en ceintures/ })
  await ceintures.first().waitFor()
  await cap(p, 'decouvrir-5-mes-parcours', ceintures)
  await ceintures.first().click()
  await p.waitForTimeout(800)
  const commencer = parNom(p, 'Commencer')
  await cap(p, 'decouvrir-6-ceintures', commencer)
  await commencer.first().click()
  await p.locator('main math-field').first().waitFor({ timeout: 20000 })
  await cap(p, 'decouvrir-7-question', p.locator('main math-field'))
  await p.goto(base)
  await p.getByRole('tab', { name: 'Parcours' }).waitFor()
  await cap(p, 'decouvrir-8-onglet-creer', p.getByRole('tab', { name: 'Parcours' }))
  const paliers = p.getByRole('button', { name: /^Relatifs par paliers/ })
  await paliers.first().waitFor()
  await cap(p, 'decouvrir-9-bibliotheque', paliers)
  await paliers.first().click()
  const modifier = p.getByRole('button', { name: 'Modifier' })
  await modifier.waitFor()
  await cap(p, 'decouvrir-10a-page', modifier)
  await modifier.click()
  await p.getByLabel('Palier 1 : titre vu par les élèves').evaluate((el) => (el.closest('section')?.scrollIntoView({ block: 'start' }), scrollBy(0, -90)))
  await cap(p, 'decouvrir-10-paliers-editeur')
  await p.context().close()
}

// ---------- Créer un parcours dans l'app, le donner à une classe, publier ----------
if (!SEULEMENT || SEULEMENT === 'creer') {
  etape('créer dans l’app')
  const p = await appareil({ profil: 'enseignant', pays: 'FR' })
  await p.getByRole('tab', { name: 'Parcours' }).click()
  const creer = parNom(p, 'Créer un parcours')
  await creer.waitFor()
  await cap(p, 'creer-1-espace', creer)
  await creer.click()
  await p.getByRole('radio', { name: '5e' }).waitFor()
  await cap(p, 'creer-2-editeur', p.getByRole('radio', { name: '5e' }))
  await p.getByRole('radio', { name: '5e' }).click()
  await p.waitForTimeout(400)
  await p.getByLabel('Nom du chapitre').fill('Nombres rationnels')
  await p.getByLabel('Titre', { exact: true }).fill('Fractions et écritures décimales')
  await p.getByLabel('But du parcours (vu par les élèves)').fill('Passer d’une fraction à son écriture décimale.')
  await p.evaluate(() => scrollTo(0, 0))
  await cap(p, 'creer-3-infos')
  const ajouter = parNom(p, 'Ajouter des exercices')
  await cap(p, 'creer-4-ajouter', ajouter)
  await ajouter.click()
  // Le niveau du parcours est déjà choisi : on arrive sur ses chapitres
  const chapitre = p.getByRole('button', { name: /Nombres rationnels/ })
  await chapitre.first().waitFor({ timeout: 20000 })
  await p.evaluate(() => scrollTo(0, 0))
  await cap(p, 'creer-5-chapitres', chapitre)
  await chapitre.first().click()
  await p.waitForTimeout(500)
  const lignes = p.locator('main li > button[aria-expanded]').filter({ hasText: /fraction/i })
  await lignes.first().evaluate((el) => (el.scrollIntoView({ block: 'start' }), scrollBy(0, -140)))
  await cap(p, 'creer-6-exercices', lignes.nth(1))
  await lignes.nth(1).click()
  const ajouterAuParcours = parNom(p, 'Ajouter au parcours')
  await ajouterAuParcours.waitFor({ timeout: 20000 })
  await p.waitForTimeout(1500)
  await cap(p, 'creer-7-reglages', ajouterAuParcours)
  await ajouterAuParcours.click()
  await p.waitForTimeout(400)
  await lignes.nth(4).click()
  await ajouterAuParcours.waitFor({ timeout: 20000 })
  await ajouterAuParcours.click()
  await p.waitForTimeout(400)
  const revenir = p.getByRole('button', { name: /^Revenir au parcours/ })
  await cap(p, 'creer-8-revenir', revenir)
  await revenir.click()
  await p.waitForTimeout(500)
  await p.getByRole('heading', { name: 'Exercices' }).evaluate((el) => (el.scrollIntoView({ block: 'start' }), scrollBy(0, -80)))
  const valider = parNom(p, 'Valider le parcours')
  await cap(p, 'creer-9-exercices', valider)
  await valider.click()
  await p.getByRole('dialog').waitFor()
  const donner = parNom(p, 'Donner à des classes')
  await cap(p, 'creer-10-valide', donner)
  await donner.click()
  await p.waitForTimeout(400)
  await p.getByLabel(/Nouvelle classe/).first().fill('5e A')
  const ajouterClasse = parNom(p, 'Ajouter')
  await cap(p, 'creer-11-classe', ajouterClasse)
  await ajouterClasse.click()
  const choisir = parNom(p, 'Choisir les parcours de 5e A')
  await cap(p, 'creer-12-choisir', choisir)
  await choisir.click()
  await p.getByRole('checkbox', { name: /Fractions et écritures/ }).click()
  const enregistrer = p.getByRole('button', { name: /^Enregistrer \(1 parcours\)/ })
  await cap(p, 'creer-13-cocher', enregistrer)
  await enregistrer.click()
  await p.waitForTimeout(400)
  await p.evaluate(() => scrollTo(0, 0))
  await cap(p, 'creer-14-classe', p.getByRole('tab', { name: 'Parcours', exact: true }))
  await p.getByRole('tab', { name: 'Parcours', exact: true }).click()
  await p.evaluate(() => scrollTo(0, 0))
  await p.getByLabel('Lien du dossier partagé').fill(LIEN)
  const lien = parNom(p, 'Enregistrer le lien')
  await cap(p, 'creer-15-lien', lien)
  await lien.click()
  await p.waitForTimeout(400)
  await p.evaluate(() => scrollTo(0, 0))
  const publier = p.getByRole('button', { name: 'Mettre à jour', exact: true })
  await cap(p, 'creer-16-publier', publier)
  await publier.first().click()
  await p.waitForTimeout(600)
  await cap(p, 'creer-17-publie')
  await p.context().close()
}

// ---------- Élève : ajouter le lien, travailler, bilan, suivi ----------
if (!SEULEMENT || SEULEMENT === 'eleve') {
  etape('élève')
  const p0 = await appareil({ pays: 'FR' })
  await p0.getByRole('button', { name: /^France/ }).click()
  await p0.getByLabel('Lien de partage donné par ton enseignant').fill(LIEN)
  await cap(p0, 'eleve-1-lien', parNom(p0, 'Ajouter le dossier'))
  await p0.context().close()

  const classe = { lien: LIEN, nom: '5e A', disponibles: ['5e A'], parcours: demo.classes.flatMap((c) => c.parcours) }
  const p = await appareil({ profil: 'eleve', pays: 'FR', classes: [classe] })
  const ceintures = p.getByRole('button', { name: /^Relatifs en ceintures/ })
  await ceintures.first().waitFor()
  await cap(p, 'eleve-2-parcours', ceintures)
  await ceintures.first().click()
  await parNom(p, 'Commencer').first().click()
  const id = 'relatifs-ceintures-5e'
  const attendue = (q) =>
    p.evaluate(
      async ({ id, q }) => {
        const s = JSON.parse(localStorage.getItem(`copie:seance:${id}`))
        const e = s.etapes[0]
        const man = await (await fetch('/moteur/manifest.json')).json()
        const m = await import('/moteur/' + man.entree)
        const ex = await m.preparerExercice({ ...s.contenu.etapes[e], alea: s.graines[e] }, e)
        return String(ex.interne.autoCorrection[q]?.valeur?.reponse?.value)
      },
      { id, q },
    )
  for (let q = 0; q < 2; q++) {
    const champ = p.locator('main math-field').nth(q)
    await champ.waitFor({ timeout: 20000 })
    const r = q === 0 ? await attendue(q) : '0'
    await champ.evaluate((el, v) => {
      el.setValue(v)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }, r)
  }
  const soumettre = p.getByRole('button', { name: /^Soumettre/ })
  await cap(p, 'eleve-3-reponses', soumettre)
  await soumettre.first().click()
  await p.waitForTimeout(1500)
  const suite = p.getByRole('button', { name: /bilan|Terminer/i })
  await cap(p, 'eleve-4-correction', suite)
  await suite.first().click()
  await p.waitForTimeout(1200)
  await cap(p, 'eleve-5-bilan')
  await p.goto(base)
  await cap(p, 'eleve-6-onglet-suivi', p.getByRole('tab', { name: 'Suivi' }))
  await p.getByRole('tab', { name: 'Suivi' }).click()
  await p.waitForTimeout(800)
  await cap(p, 'eleve-7-suivi')
  await p.context().close()
}

// ---------- Reprendre dans l'app un fichier publié sur le site ----------
if ((!SEULEMENT || SEULEMENT === 'importer') && process.env.FICHIER) {
  etape('reprendre un fichier')
  const p = await appareil({ profil: 'enseignant', pays: 'FR' })
  await p.getByRole('tab', { name: 'Parcours' }).click()
  const reprendre = parNom(p, 'Reprendre ma bibliothèque publiée')
  await reprendre.waitFor()
  await cap(p, 'importer-1-reprendre', reprendre)
  await reprendre.click()
  await p.waitForTimeout(500)
  const choisirFichier = p.locator('label', { hasText: 'Choisir le fichier publié' })
  await cap(p, 'importer-2-fichier', choisirFichier)
  await p.locator('input[type=file]').last().setInputFiles(process.env.FICHIER)
  await p.getByText(/parcours repris/).waitFor()
  await cap(p, 'importer-3-repris')
  await p.goBack({ waitUntil: 'commit' })
  await p.waitForTimeout(600)
  await p.evaluate(() => scrollTo(0, 0))
  await cap(p, 'importer-4-bibliotheque')
  await p.context().close()
}

await nav.close()
