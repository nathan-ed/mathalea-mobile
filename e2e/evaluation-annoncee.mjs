// Évaluation annoncée par l'enseignant (Nathan, 16 novembre 2026 : « for
// teacher to be able to prepare an evaluation for the students and then it
// shows up on the home screen »). Le fichier du dossier partagé porte
// `evaluations` dans la classe (jour, parcours, titre). Élève : l'accueil la
// propose, un toucher prépare ses révisions, les parcours pas commencés sont
// « à finir », un parcours fait au clavier entre dans les révisions de
// l'évaluation, le lendemain l'accueil propose de réviser ; l'enseignant
// déplace l'évaluation et la préparation suit ; arrêtée, elle n'est pas
// reproposée. Dossier simulé (relais /__telecharger), horloge de Playwright.
// Téléphone clair, bureau sombre.
//   CAPTURES=<dossier> node e2e/evaluation-annoncee.mjs
import { chromium } from 'playwright'
import { pagePrete, SANS_BRIDAGE } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}

const parcours = (id, titre, uuid, exo, objectif) => ({
  id,
  version: 1,
  titre,
  objectif: '',
  niveau: '5e',
  theme: 'Nombres relatifs',
  difficulte: 1,
  icone: 'bx-math',
  presentation: 'une_question_par_page',
  correction: 'question',
  etapes: [{ uuid, id: exo, titre: `${exo} - ${objectif}`, nbQuestions: 2, objectifs: [objectif] }],
})
const additions = parcours('eval-additions', 'Additions de relatifs', 'cbc26', '5N2G', 'Additionner des relatifs')
const soustractions = parcours('eval-soustractions', 'Soustractions de relatifs', '36e2a', '5N2H', 'Soustraire des relatifs')
const LIEN = 'http://127.0.0.1:9/classe/'
const fichier = (evaluations) => ({
  format: 'classes-mathalea/1',
  exporteLe: '2026-11-15T10:00:00.000Z',
  classes: [{ nom: '5e A', parcours: [additions, soustractions], ...(evaluations ? { evaluations } : {}) }],
})
const annonce = { id: 'eval-relatifs', date: '2026-11-20', titre: 'Évaluation sur les relatifs', parcours: ['eval-additions', 'eval-soustractions'] }

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium', args: SANS_BRIDAGE })

/** Appareil d'un élève de la 5e A ; `page.dossier` : ce que le dossier partagé contient, modifiable ensuite */
async function appareil(nom, theme, taille, mobile) {
  const ctx = await nav.newContext({ locale: 'fr-FR', viewport: taille, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile })
  const page = await ctx.newPage()
  page.dossier = fichier([annonce])
  await ctx.route('**/*', (r) => {
    const url = new URL(r.request().url())
    if (url.pathname === '/__telecharger') {
      const cible = url.searchParams.get('url') ?? ''
      return cible.startsWith(LIEN) ? r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(page.dossier) }) : r.abort()
    }
    return ['localhost', '127.0.0.1'].includes(url.hostname) ? r.continue() : r.abort()
  })
  await ctx.addInitScript(
    ({ theme, classe }) => {
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      localStorage.setItem('theme', theme)
      localStorage.setItem('copie:profil', JSON.stringify('eleve'))
      localStorage.setItem('copie:pays', JSON.stringify('FR'))
      localStorage.setItem('copie:classes', JSON.stringify([classe]))
    },
    // Classe suivie avant l'annonce : l'évaluation arrive à la lecture du dossier
    { theme, classe: { lien: LIEN, nom: '5e A', disponibles: ['5e A'], parcours: [additions, soustractions] } },
  )
  page.on('pageerror', (e) => erreurs.push(`${nom}: ${e.message}`))
  await page.clock.install({ time: new Date('2026-11-16T09:00:00') })
  await page.goto(base)
  return page
}

const texte = async (page, sel = 'main') => (await page.locator(sel).innerText()).replace(/\s+/g, ' ')
const stock = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('copie:revisions') ?? '{}'))
const action = (page) => page.getByRole('region', { name: 'À faire maintenant' })
const tuile = (page) => page.getByRole('button', { name: /^Révisions/ })

/** Réponse attendue par MathALÉA pour la question affichée (rang dans l'ordre de la séance) */
const reponseAttendue = (page, id, rang) =>
  page.evaluate(
    async ({ id, rang }) => {
      const s = JSON.parse(localStorage.getItem(`copie:seance:${id}`))
      const cles = s.ordre ?? s.contenu.etapes.flatMap((e, i) => Array.from({ length: s.nbQuestions?.[i] ?? e.nbQuestions }, (_, q) => `${i}-${q}`))
      const [e, q] = cles[rang].split('-').map(Number)
      const man = await (await fetch('/moteur/manifest.json')).json()
      const m = await import('/moteur/' + man.entree)
      const ex = await m.preparerExercice({ ...s.contenu.etapes[e], alea: s.graines[e] }, 90 + e)
      return String(ex.interne.autoCorrection[q]?.valeur?.reponse?.value)
    },
    { id, rang },
  )

async function saisir(page, latex) {
  await page
    .waitForFunction(() => document.querySelectorAll('main math-field').length === 1 && !!document.querySelector('main math-field[data-listener-added]'), null, { timeout: 15_000 })
    .catch(() => {})
  for (let essai = 0; essai < 20; essai++) {
    const pris = await page
      .locator('main math-field')
      .last()
      .evaluate((el, v) => {
        el.setValue(v)
        el.dispatchEvent(new Event('input', { bubbles: true }))
        return el.value === v
      }, latex)
      .catch(() => false)
    if (pris && (await pagePrete(page), await page.locator('main math-field').last().evaluate((el, v) => el.value === v, latex).catch(() => false))) return
    await pagePrete(page)
  }
  throw new Error(`saisie impossible : ${latex}`)
}

/** Répond juste à `total` questions, en vérifiant chacune, jusqu'au bilan */
async function repondre(page, id, total) {
  await page.locator('main math-field').first().waitFor({ timeout: 60_000 })
  await pagePrete(page)
  for (let rang = 0; rang < total; rang++) {
    await saisir(page, await reponseAttendue(page, id, rang))
    await page.getByRole('button', { name: 'Vérifier' }).click()
    await pagePrete(page)
    if (rang < total - 1) {
      const btn = page.getByRole('button', { name: 'Question suivante' })
      for (let essai = 0; essai < 20 && !(await page.getByText(`Question ${rang + 2} sur ${total}`).isVisible().catch(() => false)); essai++) {
        if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {})
        await pagePrete(page)
      }
    } else await page.getByRole('button', { name: 'Voir le bilan' }).click()
  }
  await page.getByText(new RegExp(`\\d+ / ${total}`)).first().waitFor({ timeout: 30_000 })
}

// ---------- Téléphone, clair : l'accueil propose l'évaluation ----------
{
  const page = await appareil('téléphone', 'clair', { width: 390, height: 844 }, true)
  // Lundi 16 novembre : l'évaluation de vendredi arrive avec le fichier du dossier
  await action(page).waitFor({ timeout: 60_000 })
  await pagePrete(page)
  const propose = await texte(page, 'section[aria-label="À faire maintenant"]')
  ok(propose.includes('Évaluation vendredi · Évaluation sur les relatifs') && propose.includes('Préparer l’évaluation'), `accueil : ${propose}`)
  ok((await tuile(page).innerText()).includes('Évaluation vendredi, à préparer'), `tuile : ${(await tuile(page).innerText()).replace(/\s+/g, ' ')}`)
  ok(!(await stock(page)).evaluation, 'rien n’est préparé tant que l’élève n’a pas touché')
  await page.screenshot({ path: `${captures}/evaluation-annoncee-1-accueil-clair.png` })

  // Un toucher : le jour et les parcours sont ceux de l'enseignant
  await action(page).getByRole('button', { name: 'Préparer l’évaluation' }).click()
  await pagePrete(page)
  let ecran = await texte(page)
  ok(ecran.includes('Évaluation vendredi') && ecran.includes('Évaluation sur les relatifs'), `préparation : ${ecran.slice(0, 70)}`)
  // Tous les exercices des parcours comptent, faits ou non (Nathan, 27 novembre 2026)
  ok(ecran.includes('Combien de questions ?') && (await page.getByRole('button', { name: 'Commencer' }).isVisible()), 'aucun exercice fait : une série est déjà proposée')
  const aFinir = ecran.split('À finir avant l’évaluation')[1] ?? ''
  ok(aFinir.includes('Additions de relatifs Pas encore commencé') && aFinir.includes('Soustractions de relatifs Pas encore commencé'), 'les deux parcours sont à finir avant l’évaluation')
  const e = (await stock(page)).evaluation
  ok(e?.annonce === 'eval-relatifs' && e.date === '2026-11-20' && e.parcours.join() === 'eval-additions,eval-soustractions', 'évaluation retenue : celle de l’enseignant')
  await page.screenshot({ path: `${captures}/evaluation-annoncee-2-preparation-clair.png`, fullPage: true })

  // Le parcours à finir, fait au clavier
  await page.getByRole('button', { name: /^Additions de relatifs/ }).click()
  await page.getByRole('button', { name: 'Commencer' }).click()
  await repondre(page, 'eval-additions', 2)
  await page.getByRole('button', { name: 'Retour à l’accueil' }).click()
  await pagePrete(page)
  ok((await tuile(page).innerText()).includes('Évaluation vendredi') && !(await tuile(page).innerText()).includes('à préparer'), 'accueil : la tuile annonce l’évaluation')
  // Les additions sont réussies aujourd'hui ; reste l'exercice des soustractions, pas encore fait
  const lundi = await texte(page, 'section[aria-label="À faire maintenant"]')
  ok(lundi.includes('Réviser pour l’évaluation') && lundi.includes('1 question'), `réussi aujourd’hui : seul l’exercice pas encore fait est proposé (${lundi})`)

  // Mardi : l'accueil propose de réviser pour l'évaluation, sans attendre la date de révision (dans une semaine)
  await page.clock.setSystemTime(new Date('2026-11-17T09:00:00'))
  await page.reload()
  await action(page).waitFor({ timeout: 60_000 })
  await pagePrete(page)
  const mardi = await texte(page, 'section[aria-label="À faire maintenant"]')
  ok(mardi.includes('Évaluation vendredi · 2 questions') && mardi.includes('Réviser pour l’évaluation'), `le lendemain : ${mardi}`)
  await page.screenshot({ path: `${captures}/evaluation-annoncee-3-reviser-clair.png` })
  await action(page).getByRole('button', { name: 'Réviser pour l’évaluation' }).click()
  await repondre(page, 'revisions', 2)
  ok((await texte(page)).includes('Réussi aujourd’hui'), 'série de l’évaluation faite, bilan : réussi aujourd’hui')
  await page.getByRole('button', { name: 'Terminer' }).click()
  await pagePrete(page)
  ecran = await texte(page)
  ok(ecran.includes('Tout est revu pour aujourd’hui') && ecran.includes('Soustractions de relatifs Pas encore commencé') && !/Additions de relatifs Pas/.test(ecran), 'tout est revu ; il reste un parcours à finir')
  await page.screenshot({ path: `${captures}/evaluation-annoncee-4-revu-clair.png`, fullPage: true })

  // L'enseignant déplace l'évaluation au lundi 23 et retire les soustractions : la préparation suit
  page.dossier = fichier([{ ...annonce, date: '2026-11-23', parcours: ['eval-additions'] }])
  await page.getByRole('button', { name: 'Revenir en arrière' }).click()
  await pagePrete(page)
  await page.reload()
  await tuile(page).waitFor({ timeout: 60_000 })
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('copie:revisions')).evaluation?.date === '2026-11-23', null, { timeout: 30_000 }).catch(() => {})
  const suivie = (await stock(page)).evaluation
  ok(suivie?.date === '2026-11-23' && suivie.parcours.join() === 'eval-additions', `évaluation déplacée par l’enseignant : ${suivie?.date}, ${suivie?.parcours}`)
  await pagePrete(page)
  ok((await tuile(page).innerText()).includes('Évaluation lundi'), `tuile : ${(await tuile(page).innerText()).replace(/\s+/g, ' ')}`)

  // Arrêtée par l'élève : jamais reproposée
  await tuile(page).click()
  await page.getByRole('button', { name: 'Arrêter la préparation' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Arrêter la préparation' }).click()
  await pagePrete(page)
  ok(!(await stock(page)).evaluation && !(await texte(page)).includes('Annoncée par ton enseignant'), 'arrêtée : plus proposée dans les révisions')
  await page.getByRole('button', { name: 'Revenir en arrière' }).click()
  await pagePrete(page)
  ok(!(await page.getByRole('button', { name: 'Préparer l’évaluation' }).count()) && !(await tuile(page).innerText()).includes('Évaluation'), 'arrêtée : plus proposée à l’accueil')

  // Une autre évaluation annoncée ensuite est proposée à son tour
  page.dossier = fichier([{ ...annonce, date: '2026-11-23', parcours: ['eval-additions'] }, { id: 'eval-2', date: '2026-11-27', parcours: ['eval-soustractions'] }])
  await page.reload()
  await page.getByRole('button', { name: 'Préparer l’évaluation' }).waitFor({ timeout: 60_000 })
  ok((await texte(page, 'section[aria-label="À faire maintenant"]')).includes('Évaluation le 27 novembre'), 'nouvelle annonce : proposée (sans titre : le jour seul)')
  await page.context().close()
}

// ---------- Bureau, sombre : depuis l'écran des révisions ----------
{
  const page = await appareil('bureau', 'sombre', { width: 1280, height: 800 }, false)
  await tuile(page).waitFor({ timeout: 60_000 })
  await pagePrete(page)
  await page.screenshot({ path: `${captures}/evaluation-annoncee-5-accueil-sombre.png` })
  await tuile(page).click()
  await pagePrete(page)
  const ecran = await texte(page)
  ok(ecran.includes('Annoncée par ton enseignant') && ecran.includes('Évaluation sur les relatifs') && ecran.includes('vendredi 20 novembre'), `révisions : l’évaluation annoncée (${ecran.slice(0, 120)})`)
  ok(!ecran.includes('Chapitres') && !ecran.includes('À consolider'), 'aucun exercice encore : ni liste de chapitres vide ni cases à zéro')
  await page.screenshot({ path: `${captures}/evaluation-annoncee-6-revisions-sombre.png` })
  await page.getByRole('button', { name: /^Évaluation sur les relatifs/ }).click()
  await pagePrete(page)
  ok((await texte(page)).includes('Évaluation vendredi') && (await stock(page)).evaluation?.annonce === 'eval-relatifs', 'un toucher : préparation commencée')
  // Modifiée par l'élève : ses choix restent quand l'enseignant change la sienne
  await page.getByRole('button', { name: 'Modifier' }).click()
  await pagePrete(page)
  ok((await page.getByRole('switch', { name: 'Réviser Additions de relatifs' }).isChecked()) && (await page.getByRole('button', { name: 'vendredi 20 novembre' }).getAttribute('aria-pressed')) === 'true', 'modifier : le jour et les parcours de l’enseignant sont repris')
  await page.getByRole('switch', { name: 'Réviser Soustractions de relatifs' }).uncheck()
  await page.getByRole('button', { name: 'Enregistrer' }).click()
  await pagePrete(page)
  await page.screenshot({ path: `${captures}/evaluation-annoncee-7-preparation-sombre.png` })
  page.dossier = fichier([{ ...annonce, date: '2026-11-24' }])
  await page.getByRole('button', { name: 'Revenir en arrière' }).click()
  await pagePrete(page)
  await page.reload()
  await tuile(page).waitFor({ timeout: 60_000 })
  await pagePrete(page)
  const e = (await stock(page)).evaluation
  ok(e?.modifiee && e.date === '2026-11-20' && e.parcours.join() === 'eval-additions', `modifiée par l’élève : ses choix restent (${e?.date}, ${e?.parcours})`)
  await page.context().close()
}

ok(erreurs.length === 0, `aucune erreur de page${erreurs.length ? ' : ' + erreurs.join(' | ') : ''}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
