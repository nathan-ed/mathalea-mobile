// Données laissées par une ancienne version de l'app, pour e2e/mise-a-jour.mjs
// (à écrire ; inachevé, voir docs/developpement.md, « À faire »).
// Joue un élève et un enseignant dans cette version, comme sur un téléphone
// (vraies réponses posées dans les champs, vrais boutons), puis garde tout son stockage.
//   git worktree add --detach ../mathalea-mobile-v048 v0.4.8   (pnpm install, static/moteur)
//   (cd ../mathalea-mobile-v048 && npx vite dev --port 1521)
//   BASE=http://localhost:1521/ VERSION=0.4.8 node e2e/donnees/creer.mjs
// Élève : « Nombres relatifs » terminé sans faute, première ceinture de
// « Relatifs en ceintures » obtenue, « Fractions » quitté en cours de route.
// Enseignant : démonstration chargée, un parcours dupliqué puis modifié.
import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'

const base = process.env.BASE ?? 'http://localhost:1521/'
const version = process.env.VERSION ?? 'inconnue'
const demo = JSON.parse(readFileSync('static/demo/parcours-demonstration.json', 'utf8'))
const classe = { lien: 'https://kdrive.infomaniak.com/app/share/1/demo', nom: '5e A', disponibles: ['5e A'], parcours: demo.classes.flatMap((c) => c.parcours) }
const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const erreurs = []

async function telephone(profil) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await ctx.addInitScript(
    ([profil, classe]) => {
      if (localStorage.getItem('copie:profil')) return
      localStorage.setItem('copie:profil', JSON.stringify(profil))
      localStorage.setItem('copie:pays', '"FR"')
      if (profil === 'eleve') localStorage.setItem('copie:classes', JSON.stringify([classe]))
    },
    [profil, classe],
  )
  const page = await ctx.newPage()
  page.setDefaultTimeout(30_000)
  page.on('pageerror', (e) => erreurs.push(`${profil} : ${e.message}`))
  await page.goto(base)
  await page.getByRole('button', { name: 'Réglages' }).first().waitFor({ timeout: 90_000 })
  return page
}

/** Réponses attendues de la séance en cours, régénérées par le moteur de la page */
const attendues = (page, id) =>
  page.evaluate(async (id) => {
    const s = JSON.parse(localStorage.getItem(`copie:seance:${id}`))
    const man = await (await fetch('/moteur/manifest.json')).json()
    const m = await import(/* @vite-ignore */ '/moteur/' + man.entree)
    const res = {}
    for (const k of s.etapes) {
      const ex = await m.preparerExercice({ ...s.contenu.etapes[k], alea: s.graines[k] }, k)
      res[k] = ex.interne.autoCorrection.map((a) => {
        const v = a?.valeur?.reponse?.value
        return Array.isArray(v) ? String(v[0]) : v == null ? '' : String(v)
      })
    }
    return res
  }, id)

const SUITE = /^(Question suivante|Exercice suivant|Voir le bilan|Soumettre la tentative|Voir les résultats)$/
const VALIDER = /^(Vérifier|Soumettre l’exercice|Soumettre)$/

/** Répond juste à `combien` écrans de questions (tous si absent) ; s'arrête au bilan */
async function repondre(page, id, combien = Infinity) {
  for (let ecran = 0; ecran < combien; ecran++) {
    await page.waitForTimeout(800)
    const champs = page.locator('main math-field[id^="champTexteEx"]')
    if (!(await champs.first().isVisible().catch(() => false))) return
    const suite = page.locator('footer').getByRole('button', { name: SUITE }).first()
    const valider = page.locator('footer').getByRole('button', { name: VALIDER }).first()
    // Écran déjà vérifié (dernière question, « Soumettre la tentative ») : on passe
    if (await valider.isVisible().catch(() => false)) {
      const rep = await attendues(page, id)
      if (process.env.TRACE) console.log(id, JSON.stringify(rep), await champs.evaluateAll((cs) => cs.map((c) => c.id)))
      for (const champ of await champs.all()) {
        const [, ex, q] = /Ex(\d+)Q(\d+)/.exec(await champ.getAttribute('id'))
        // Valeur posée dans le champ puis « input », comme une frappe : ces
        // données servent à tester la mise à jour, pas la saisie (le clavier de
        // MathALÉA ouvert recouvrait le champ suivant)
        await champ.evaluate((c, v) => {
          c.value = v
          c.dispatchEvent(new Event('input', { bubbles: true }))
        }, rep[ex]?.[q] ?? '')
      }
      await valider.click()
      await page.waitForTimeout(800)
    }
    if (!(await suite.isVisible().catch(() => false))) return
    await suite.click()
    // Soumettre la tentative : confirmation dans un panneau
    const confirmer = page.getByRole('dialog').getByRole('button', { name: /^(Soumettre|Terminer|Voir le bilan)/ })
    if (await confirmer.isVisible({ timeout: 1500 }).catch(() => false)) await confirmer.click()
  }
}

async function ouvrir(page, titre) {
  await page.getByRole('tab', { name: /Mes parcours/ }).click().catch(() => {})
  await page.getByRole('button', { name: new RegExp(`^\\s*${titre}`) }).first().click()
  await page.getByRole('button', { name: /^(Commencer|Continuer|Reprendre)/ }).first().click()
  const entrainement = page.getByRole('button', { name: /Entraînement|Tout le parcours|Commencer la ceinture/ }).first()
  if (await entrainement.isVisible({ timeout: 3000 }).catch(() => false)) await entrainement.click()
  // Fiche de cours montrée d'office avant une ceinture
  const fiche = page.getByRole('button', { name: /^(J’ai compris|Commencer les exercices|Passer la fiche|C’est parti)/ }).first()
  if (await fiche.isVisible({ timeout: 3000 }).catch(() => false)) await fiche.click()
  await page.locator('main .contenu-mathalea').first().waitFor({ timeout: 90_000 })
}

async function accueil(page) {
  const retour = page.getByRole('button', { name: /^(Retour à l’accueil|Voir la carte du parc)$/ }).first()
  if (await retour.isVisible({ timeout: 3000 }).catch(() => false)) await retour.click()
  // Page du parcours : retour du téléphone jusqu'à l'accueil
  for (let i = 0; i < 3 && !(await page.getByRole('button', { name: 'Réglages' }).first().isVisible().catch(() => false)); i++) {
    await page.goBack()
    await page.waitForTimeout(800)
  }
  await page.getByRole('button', { name: 'Réglages' }).first().waitFor().catch(async (e) => {
    await page.screenshot({ path: `${process.env.CAPTURES ?? '.'}/creer-erreur.png` })
    console.log(`Écran : ${(await page.locator('body').innerText()).slice(0, 300).replace(/\s+/g, ' ')}`)
    throw e
  })
}

const vider = (page) => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith('copie:')).map((k) => [k.slice(6), JSON.parse(localStorage.getItem(k))])))

// Élève
const eleve = await telephone('eleve')
await ouvrir(eleve, 'Nombres relatifs')
await repondre(eleve, 'relatifs-5e')
await accueil(eleve)
await ouvrir(eleve, 'Relatifs en ceintures')
await repondre(eleve, 'relatifs-ceintures-5e')
await accueil(eleve)
await ouvrir(eleve, 'Fractions')
await repondre(eleve, 'fractions-4e', 1)
await eleve.getByRole('button', { name: 'Quitter', exact: true }).click()
await eleve.getByRole('button', { name: 'Reprendre plus tard' }).click()
await accueil(eleve)
const donneesEleve = await vider(eleve)

// Enseignant : démonstration chargée dans les Réglages
const prof = await telephone('enseignant')
await prof.getByRole('button', { name: 'Réglages' }).first().click()
await prof.getByRole('button', { name: /Charger la démonstration|Charger les parcours de démonstration/ }).click()
await prof.waitForTimeout(1500)
const donneesProf = await vider(prof)

await nav.close()
const resume = (d) => Object.keys(d).sort().join(', ')
console.log(`Élève : ${resume(donneesEleve)}`)
for (const [cle, r] of Object.entries(donneesEleve)) if (cle.startsWith('resultats:')) console.log(`  ${cle} : ${Object.values(r).map((e) => `${e.points}/${e.sur}`).join(' ')}`)
console.log(`Enseignant : ${resume(donneesProf)}`)
if (erreurs.length) console.log(`Erreurs JavaScript : ${erreurs.join(' | ')}`)
const sortie = (qui, d) => writeFileSync(`e2e/donnees/${version}-${qui}.json`, JSON.stringify({ version, qui, cree: new Date().toISOString().slice(0, 10), donnees: d }, null, 1) + '\n')
sortie('eleve', donneesEleve)
sortie('enseignant', donneesProf)
