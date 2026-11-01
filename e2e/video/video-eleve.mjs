// Vidéo de présentation, côté élève (sans son : commentée ensuite en voix off).
// Prérequis : app construite servie sur 1420 (AGENTS.md, « Suites e2e »),
// VITE_URL_EXPLORER du catalogue de l'équipe. Dossier de la classe fictif
// (e2e/video/dossier.mts), servi par la vidéo comme un dossier kDrive.
//   npx tsx e2e/video/dossier.mts /tmp/dossier.json /tmp/catalogue.json
//   DOSSIER=/tmp/dossier.json CATALOGUE=/tmp/catalogue.json SORTIE=videos bash e2e/video/filmer.sh e2e/video/video-eleve.mjs
import { BASE, LIEN_KDRIVE, calme, coller, defiler, taper, telephone, toucher } from './outils.mjs'

const { page, finir } = await telephone('mathalea-eleve', { fichierDossier: process.env.DOSSIER, fichierCatalogue: process.env.CATALOGUE })
const role = (r, name) => page.getByRole(r, { name })
const etape = (texte) => console.log(`· ${texte}`)

/** Réponses attendues de la page affichée, calculées par le moteur avec la graine de la séance (invisible à l'écran) */
const attendues = (id) =>
  page.evaluate(async (id) => {
    const s = JSON.parse(localStorage.getItem(`copie:seance:${id}`))
    const man = await (await fetch('/moteur/manifest.json')).json()
    const m = await import('/moteur/' + man.entree)
    const n = s.etapes[0]
    const ex = await m.preparerExercice({ ...s.contenu.etapes[n], alea: s.graines[n] }, n)
    return ex.interne.autoCorrection.map((a) => String(a.valeur.reponse.value))
  }, id)

/** Réponse attendue du champ affiché en révision (étape et rang lus dans son identifiant) */
async function attendueAffichee(champ) {
  const [, n, k] = /Ex(\d+)Q(\d+)/.exec(await champ.getAttribute('id'))
  return page.evaluate(
    async ({ n, k }) => {
      const s = JSON.parse(localStorage.getItem('copie:seance:revisions'))
      const man = await (await fetch('/moteur/manifest.json')).json()
      const m = await import('/moteur/' + man.entree)
      const ex = await m.preparerExercice({ ...s.contenu.etapes[n], alea: s.graines[n] }, n)
      return String(ex.interne.autoCorrection[k].valeur.reponse.value)
    },
    { n: Number(n), k: Number(k) },
  )
}

/** Fiche avant la ceinture : la règle, l'exemple dévoilé étape par étape, la petite question */
async function lireFiche(fausse) {
  await calme(page, 2600)
  for (let k = 0; k < 4; k++) {
    const suite = role('button', /Voir la première étape|Étape suivante|Voir l’étape suivante/)
    if (!(await suite.count())) break
    await toucher(page, suite, 1500)
  }
  const question = page.getByRole('region', { name: 'À toi' })
  await question.scrollIntoViewIfNeeded()
  await calme(page, 1500)
  if (fausse !== undefined) await toucher(page, question.getByRole('radio').nth(fausse), 2600)
  await toucher(page, question.getByRole('radio').first(), 2400)
  await toucher(page, role('button', /Commencer l’entraînement/), 1500)
}

/** Ceinture d'une page de deux calculs, corrigée à la fin ; `erreur` : rang de la réponse fausse */
async function ceinture(id, erreur) {
  const reponses = await attendues(id)
  const champs = page.locator('main math-field')
  for (let i = 0; i < reponses.length; i++) {
    const r = i === erreur ? String(-Number(reponses[i])) : reponses[i]
    await taper(page, champs.nth(i), r, 900)
  }
  await toucher(page, role('button', 'Soumettre la tentative'), 1200)
  await role('button', 'Voir le bilan').first().waitFor({ timeout: 60_000 })
  await calme(page, 2800) // la correction de chaque question
  await toucher(page, role('button', 'Voir le bilan'), 3200)
}

// ---------- Premier lancement ----------
etape('premier lancement : le programme')
await page.goto(BASE)
await calme(page, 2500)
await toucher(page, role('button', /^Suisse/), 1500)

etape('le dossier de la classe : lien collé, puis la classe')
await coller(page, page.getByLabel('Lien de partage donné par ton enseignant'), LIEN_KDRIVE, 1200)
await toucher(page, role('button', 'Ajouter le dossier'), 2200)
await toucher(page, role('button', /^\s*9A/), 2500)

// ---------- Un parcours en ceintures ----------
etape('Mes parcours, puis un parcours en ceintures')
await toucher(page, role('button', /^\s*Relatifs en ceintures/), 2500)
await defiler(page, 300, 1500)
await defiler(page, -300, 800)

etape('ceinture orange : la fiche, puis deux calculs')
await toucher(page, role('button', 'Commencer').filter({ hasText: /^Commencer$/ }), 500)
await lireFiche(1)
await ceinture('relatifs-ceintures-5e')
etape('bilan : ceinture orange obtenue')
await defiler(page, 250, 1500)
await defiler(page, -250, 600)
// « Continuer » mène à la ceinture suivante : sa fiche s'ouvre d'office
for (let i = 0; i < 3 && !(await role('button', /Commencer l’entraînement/).count()); i++) {
  const suite = (await role('button', /^Continuer/).count()) ? role('button', /^Continuer/) : role('button', 'Commencer').filter({ hasText: /^Commencer$/ })
  await toucher(page, suite, 2500)
}

etape('ceinture verte : une erreur, la correction')
await lireFiche()
await ceinture('relatifs-ceintures-5e', 1)
await defiler(page, 250, 1800)
await defiler(page, -250, 600)

// ---------- Suivi, révisions, Explorer ----------
etape('retour à l’accueil, le suivi')
for (let i = 0; i < 4 && !(await role('tab', 'Suivi').isVisible().catch(() => false)); i++) {
  await toucher(page, role('button', /Revenir en arrière|Quitter/), 900)
}
await toucher(page, role('tab', 'Suivi'), 2500)
for (const vue of ['Ceintures', 'Objectifs']) {
  if (await role('tab', vue).count()) await toucher(page, role('tab', vue), 2200)
}

etape('une semaine plus tard : les révisions')
await toucher(page, role('tab', 'Mes parcours'), 1500)
await page.clock.setSystemTime(Date.now() + 8 * 86_400_000)
await page.reload()
const tuileRevisions = role('button', /^\s*Révisions/)
await tuileRevisions.waitFor({ timeout: 60_000 })
await calme(page, 2000)
await toucher(page, tuileRevisions, 3500)
await toucher(page, page.getByRole('radio', { name: '3' }), 1500)
await toucher(page, role('button', 'Commencer').filter({ hasText: /^Commencer$/ }), 2500)
for (let q = 0; q < 2; q++) {
  const champ = page.locator('main math-field').first()
  await taper(page, champ, await attendueAffichee(champ), 900)
  await toucher(page, role('button', 'Vérifier'), 2600)
  if (q === 0) await toucher(page, role('button', 'Question suivante'), 1500)
}
await toucher(page, role('button', 'Quitter'), 1500)
await toucher(page, role('button', 'Reprendre plus tard'), 1500)
for (let i = 0; i < 3 && !(await role('tab', 'Explorer').isVisible().catch(() => false)); i++) {
  await toucher(page, role('button', /Revenir en arrière/), 900)
}

etape('l’Explorer : les parcours proposés par l’équipe')
await toucher(page, role('tab', 'Explorer'), 2500)
await toucher(page, role('button', /^4e Collège/), 2200)
await toucher(page, role('button', /^Intégration/), 2200)
await toucher(page, role('button', /^\s*Calcul intégral/), 3000)
await defiler(page, 500, 1800)
await defiler(page, -500, 800)
for (let i = 0; i < 4 && !(await role('tab', 'Mes parcours').isVisible().catch(() => false)); i++) {
  await toucher(page, role('button', /Revenir en arrière/), 1000)
}
await toucher(page, role('tab', 'Mes parcours'), 1500)

console.log(await finir())
