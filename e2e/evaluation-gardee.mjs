// Une évaluation préparée n'est jamais perdue (Nathan, 27 novembre 2026 : « être sûr que
// les évaluations sont toujours prises en compte, ne pas perdre les évaluations »). Élève
// de la 5e A, évaluation annoncée par l'enseignant : préparée d'un toucher, une série faite
// au clavier, puis l'évaluation et ce qui a été revu restent après chaque épreuve :
// relancement de l'app, dossier relu (« Mettre à jour les parcours »), dossier injoignable,
// enseignant qui déplace l'évaluation, sauvegarde récupérée sur un téléphone neuf, fusion
// des deux appareils, lendemain. Elle ne s'arrête que le lendemain de son jour.
// La série reprend tous les exercices des parcours, même ceux d'un parcours pas commencé
// (« pour une révision d'éval, c'est tous qui doivent être pris en compte ») ; ils ne
// passent pas dans les révisions habituelles. Dossier simulé (relais /__telecharger),
// horloge de Playwright. Téléphone clair, puis bureau sombre.
//   CAPTURES=<dossier> node e2e/evaluation-gardee.mjs
import { chromium } from 'playwright'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pagePrete, SANS_BRIDAGE } from './attente.mjs'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
const dossierFichiers = mkdtempSync(join(tmpdir(), 'evaluation-gardee-'))
let echecs = 0
const erreurs = []
const ok = (cond, msg, detail = '') => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg, cond || !detail ? '' : `(${detail})`)
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
const additions = parcours('garde-additions', 'Additions de relatifs', 'cbc26', '5N2G', 'Additionner des relatifs')
const soustractions = parcours('garde-soustractions', 'Soustractions de relatifs', '36e2a', '5N2H', 'Soustraire des relatifs')
const LIEN = 'http://127.0.0.1:9/classe-garde/'
const annonce = { id: 'eval-garde', date: '2026-11-20', titre: 'Évaluation sur les relatifs', parcours: [additions.id, soustractions.id] }
const fichier = (evaluations) => ({
  format: 'classes-mathalea/1',
  exporteLe: '2026-11-15T10:00:00.000Z',
  classes: [{ nom: '5e A', parcours: [additions, soustractions], evaluations }],
})

const nav = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/usr/bin/chromium', args: SANS_BRIDAGE })

/** Appareil d'un élève ; `page.dossier` : ce que sert le dossier partagé (null : injoignable) */
async function appareil(nom, { theme, taille, mobile, classe = true, heure = '2026-11-16T09:00:00', revisions = null }) {
  const ctx = await nav.newContext({ locale: 'fr-FR', viewport: taille, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile, acceptDownloads: true })
  const page = await ctx.newPage()
  page.dossier = fichier([annonce])
  await ctx.route('**/*', (r) => {
    const url = new URL(r.request().url())
    if (url.pathname === '/__telecharger') {
      const cible = url.searchParams.get('url') ?? ''
      return cible.startsWith(LIEN) && page.dossier ? r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(page.dossier) }) : r.abort()
    }
    return ['localhost', '127.0.0.1'].includes(url.hostname) ? r.continue() : r.abort()
  })
  await ctx.addInitScript(
    ({ theme, classe, revisions }) => {
      if (sessionStorage.getItem('pret')) return
      sessionStorage.setItem('pret', '1')
      localStorage.setItem('theme', theme)
      if (revisions) localStorage.setItem('copie:revisions', JSON.stringify(revisions))
      if (!classe) return
      localStorage.setItem('copie:profil', JSON.stringify('eleve'))
      localStorage.setItem('copie:pays', JSON.stringify('FR'))
      localStorage.setItem('copie:classes', JSON.stringify([classe]))
    },
    { theme, revisions, classe: classe ? { lien: LIEN, nom: '5e A', disponibles: ['5e A'], parcours: [additions, soustractions] } : null },
  )
  page.on('pageerror', (e) => erreurs.push(`${nom}: ${e.message}`))
  await page.clock.install({ time: new Date(heure) })
  await page.goto(base)
  return page
}

const texte = async (page, sel = 'main') => (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ')
const stock = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('copie:revisions') ?? '{}'))
const action = (page) => page.getByRole('region', { name: 'À faire maintenant' })
const tuile = (page) => page.getByRole('button', { name: /^Révisions/ })
const cap = (page, nom) => page.screenshot({ path: `${captures}/evaluation-gardee-${nom}.png` })

/** Évaluation gardée telle quelle : jour, parcours, annonce et exercices revus */
async function gardee(page, quand, revus = 2) {
  await page.waitForFunction(() => !!JSON.parse(localStorage.getItem('copie:revisions') ?? '{}').evaluation, null, { timeout: 30_000 }).catch(() => {})
  const e = (await stock(page)).evaluation
  ok(
    e?.annonce === annonce.id && e.date === '2026-11-20' && e.parcours.join() === annonce.parcours.join() && Object.values(e.vus ?? {}).filter((v) => v.reussiLe).length === revus,
    `${quand} : évaluation gardée, ${revus} exercices revus`,
    JSON.stringify(e),
  )
  await tuile(page).waitFor({ timeout: 60_000 })
  await pagePrete(page)
  ok((await tuile(page).innerText()).includes('Évaluation vendredi'), `${quand} : la tuile annonce l’évaluation`, (await tuile(page).innerText()).replace(/\s+/g, ' '))
}

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

/** Accueil par les boutons (jamais par le stockage) */
async function accueil(page) {
  for (let i = 0; i < 5 && !(await page.getByRole('tab', { name: 'Mes parcours' }).isVisible().catch(() => false)); i++) {
    await page.getByRole('button', { name: 'Revenir en arrière' }).first().click().catch(() => {})
    await pagePrete(page)
  }
}

/** Prépare l'évaluation annoncée et fait la première série au clavier (aucun parcours commencé) */
async function prepareEtRevise(page, suffixe) {
  await action(page).waitFor({ timeout: 60_000 })
  await pagePrete(page)
  await action(page).getByRole('button', { name: 'Préparer l’évaluation' }).click()
  await pagePrete(page)
  ok(!(await texte(page)).includes('ne sont plus dans tes parcours'), `${suffixe} : préparation, les exercices sont là sans parcours commencé`)
  await cap(page, `1-preparation-${suffixe}`)
  await accueil(page)
  // Aucun parcours fait : l'accueil propose déjà la série, sur les deux parcours
  const propose = await texte(page, 'section[aria-label="À faire maintenant"]')
  ok(propose.includes('Réviser pour l’évaluation') && propose.includes('2 questions'), `${suffixe} : série proposée tout de suite`, propose)
  await action(page).getByRole('button', { name: 'Réviser pour l’évaluation' }).click()
  await page.locator('main math-field').first().waitFor({ timeout: 60_000 })
  const serie = await page.evaluate(() => JSON.parse(localStorage.getItem('copie:seance:revisions')).contenu.etapes.map((e) => e.uuid).sort())
  ok(serie.join() === '36e2a,cbc26', `${suffixe} : la série reprend les exercices des deux parcours pas commencés`, serie.join())
  await repondre(page, 'revisions', 2)
  ok((await texte(page)).includes('Réussi aujourd’hui'), `${suffixe} : bilan de la série`)
  await page.getByRole('button', { name: 'Terminer' }).click()
  await pagePrete(page)
  const r = await stock(page)
  const uuids = Object.values(r.elements ?? {}).map((e) => e.etape.uuid)
  ok(!uuids.includes('cbc26') && !uuids.includes('36e2a'), `${suffixe} : rien dans les révisions habituelles (aucun parcours fait)`, uuids.join())
  await accueil(page)
}

// ---------- Téléphone, clair ----------
{
  const a = await appareil('téléphone', { theme: 'clair', taille: { width: 390, height: 844 }, mobile: true })
  await prepareEtRevise(a, 'téléphone')
  await gardee(a, 'après la série')
  await cap(a, '2-accueil-telephone')

  // Relancement de l'app
  await a.reload()
  await gardee(a, 'app relancée')

  // Dossier relu depuis les Réglages
  await a.getByRole('button', { name: 'Réglages' }).click()
  await pagePrete(a)
  await a.getByRole('button', { name: 'Mettre à jour les parcours' }).click()
  await pagePrete(a)
  await accueil(a)
  await gardee(a, 'dossier relu')

  // Dossier injoignable (hors connexion) : rien ne part
  a.dossier = null
  await a.reload()
  await gardee(a, 'dossier injoignable')
  a.dossier = fichier([annonce])

  // L'enseignant ajoute une autre évaluation et retouche le titre de celle-ci : la préparation suit, rien de revu ne se perd
  a.dossier = fichier([{ ...annonce, titre: 'Évaluation : relatifs' }, { id: 'eval-autre', date: '2026-12-04', parcours: [additions.id] }])
  await a.reload()
  await a.waitForFunction(() => JSON.parse(localStorage.getItem('copie:revisions')).evaluation?.titre === 'Évaluation : relatifs', null, { timeout: 30_000 }).catch(() => {})
  ok((await stock(a)).evaluation?.titre === 'Évaluation : relatifs', 'titre changé par l’enseignant : repris')
  await gardee(a, 'annonce retouchée par l’enseignant')

  // Sauvegarde, puis téléphone neuf
  await a.getByRole('button', { name: 'Réglages' }).click()
  const [dl] = await Promise.all([a.waitForEvent('download'), a.getByRole('button', { name: 'Exporter une sauvegarde' }).click()])
  const sauvegarde = join(dossierFichiers, dl.suggestedFilename())
  await dl.saveAs(sauvegarde)
  await accueil(a)

  const b = await appareil('téléphone neuf', { theme: 'clair', taille: { width: 390, height: 844 }, mobile: true, classe: false })
  b.dossier = a.dossier
  await b.getByRole('button', { name: /Récupérer mes données/ }).waitFor({ timeout: 60_000 })
  const [choix] = await Promise.all([b.waitForEvent('filechooser'), b.getByRole('button', { name: /Récupérer mes données/ }).click()])
  await choix.setFiles(sauvegarde)
  await b.getByRole('button', { name: 'Récupérer', exact: true }).click()
  await b.getByRole('tab', { name: 'Mes parcours' }).waitFor({ timeout: 60_000 })
  await gardee(b, 'sauvegarde récupérée sur un téléphone neuf')
  await tuile(b).click()
  await pagePrete(b)
  ok((await texte(b)).includes('Tout est revu pour aujourd’hui'), 'téléphone neuf : ce qui a été revu aujourd’hui est connu')
  await cap(b, '3-revisions-telephone-neuf')
  await accueil(b)

  // Fusion : l'ancien téléphone ajoute la sauvegarde du nouveau
  await b.getByRole('button', { name: 'Réglages' }).click()
  const [dlB] = await Promise.all([b.waitForEvent('download'), b.getByRole('button', { name: 'Exporter une sauvegarde' }).click()])
  const sauvegardeB = join(dossierFichiers, `neuf-${dlB.suggestedFilename()}`)
  await dlB.saveAs(sauvegardeB)
  await a.getByRole('button', { name: 'Réglages' }).click()
  await a.locator('input[type=file]').setInputFiles(sauvegardeB)
  await a.getByRole('button', { name: 'Fusionner', exact: true }).click()
  await a.getByRole('tab', { name: 'Suivi' }).waitFor({ timeout: 30_000 })
  await accueil(a)
  await gardee(a, 'deux appareils fusionnés')

  // Mardi : toujours là, la série revient (réussie lundi, pas mardi)
  await b.clock.setSystemTime(new Date('2026-11-17T09:00:00'))
  await b.reload()
  await gardee(b, 'le lendemain')
  ok((await texte(b, 'section[aria-label="À faire maintenant"]')).includes('Réviser pour l’évaluation'), 'le lendemain : la série est de nouveau proposée')
  await cap(b, '4-mardi-telephone')
  // Vendredi, jour de l'évaluation : encore là ; samedi : terminée d'office
  await b.clock.setSystemTime(new Date('2026-11-20T07:30:00'))
  await b.reload()
  await tuile(b).waitFor({ timeout: 60_000 })
  ok((await tuile(b).innerText()).includes('Évaluation aujourd’hui') && !!(await stock(b)).evaluation, 'le jour de l’évaluation : encore là')
  await b.clock.setSystemTime(new Date('2026-11-21T09:00:00'))
  await b.reload()
  await tuile(b).waitFor({ timeout: 60_000 }).catch(() => {})
  ok(!(await stock(b)).evaluation, 'le lendemain de l’évaluation : la préparation prend fin')
  await a.context().close()
  await b.context().close()
}

// ---------- Bureau, sombre : préparée, relancée ; jamais les parcours d'une autre classe ----------
{
  // L'élève était avant dans une autre classe, dont il a fait un parcours (état de départ)
  const ancienne = {
    elements: {
      '4C10': { etape: { uuid: 'c5ab7', id: '4C10', titre: '4C10 - Calculer', nbQuestions: 2 }, niveau: '4e', theme: 'Calcul numérique', parcours: 'Parcours de la 4e B', boite: 3, prochaine: '2026-11-30', historique: [], origines: ['ancienne-4eB'] },
    },
    traites: [],
    sources: { 'ancienne-4eB': { titre: 'Parcours de la 4e B', niveau: '4e', theme: 'Calcul numérique' } },
  }
  const page = await appareil('bureau', { theme: 'sombre', taille: { width: 1280, height: 800 }, mobile: false, revisions: ancienne })
  await prepareEtRevise(page, 'bureau')
  await page.reload()
  await gardee(page, 'bureau, app relancée')
  await tuile(page).click()
  await page.getByRole('button', { name: 'Modifier' }).click()
  await pagePrete(page)
  const choix = await texte(page)
  ok(choix.includes('Additions de relatifs') && !choix.includes('Parcours de la 4e B'), 'préparer une évaluation : seulement les parcours de la classe choisie', choix.slice(0, 200))
  await cap(page, '6-modifier-bureau-sombre')
  await page.getByRole('button', { name: 'Revenir en arrière' }).first().click()
  await accueil(page)
  await cap(page, '5-accueil-bureau-sombre')
  await page.context().close()
}

await nav.close()
ok(erreurs.length === 0, 'aucune erreur de page', erreurs.join(' | '))
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
