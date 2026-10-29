// Parcours corrigé après le travail des élèves, puis changement de téléphone
// (pnpm dev seulement). Un élève réussit la première ceinture de la V1. Le
// parcours est corrigé (V2 : un exercice ajouté à la première ceinture) : il
// voit « Parcours mis à jour », garde son résultat, sa ceinture et l'accès à
// la suivante. Il exporte une sauvegarde, la récupère sur un téléphone neuf et
// retrouve la même chose, puis termine la ceinture corrigée.
// Côté enseignant : la case « Les élèves repartent de zéro » d'un exercice.
//   CAPTURES=<dossier> node e2e/correction-parcours.mjs
import { chromium } from 'playwright'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const base = process.env.BASE ?? 'http://localhost:1420/'
const captures = process.env.CAPTURES ?? '.'
const dossier = mkdtempSync(join(tmpdir(), 'correction-parcours-'))
let echecs = 0
const erreurs = []
const ok = (cond, msg) => {
  if (!cond) echecs++
  console.log(cond ? '✔' : '✘', msg)
}

const exo = (uuid, id, titre, nbQuestions = 2) => ({ uuid, id, titre: `${id} - ${titre}`, nbQuestions, objectifs: [titre] })
const v1 = {
  id: 'cp-relatifs',
  version: 1,
  titre: 'Relatifs en ceintures',
  objectif: '',
  niveau: '5e',
  theme: 'Nombres relatifs',
  difficulte: 1,
  icone: 'bx-math',
  presentation: 'une_question_par_page',
  correction: 'question',
  melanger: true,
  style: 'ceintures',
  etapes: [exo('cbc26', '5N2G', 'Additionner'), exo('61b4a', '5N2G-1', 'Additionner (suite)')],
  paliers: [
    { titre: 'Additionner', nb: 1 },
    { titre: 'Additionner (suite)', nb: 1, acces: 'seuil', seuil: 80 },
  ],
}
// V2 : un exercice ajouté à la première ceinture (le palier suivant se décale)
const v2 = {
  ...v1,
  version: 2,
  etapes: [exo('cbc26', '5N2G', 'Additionner'), exo('b6982', '5N2I', 'Additionner (problèmes)'), v1.etapes[1]],
  paliers: [
    { titre: 'Additionner', nb: 2 },
    { titre: 'Additionner (suite)', nb: 1, acces: 'seuil', seuil: 80 },
  ],
}

const nav = await chromium.launch({ executablePath: '/usr/bin/chromium' })
async function telephone(nom, avant, sombre = false) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true, colorScheme: sombre ? 'dark' : 'light' })
  await ctx.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  if (avant) await ctx.addInitScript(avant[0], avant[1])
  const page = await ctx.newPage()
  page.on('pageerror', (e) => erreurs.push(`${nom} : ${e.message}`))
  await page.goto(base)
  return page
}
const texte = async (p, sel = 'main') => (await p.locator(sel).first().innerText()).replace(/\s+/g, ' ')
const cap = async (p, nom) => (await p.waitForTimeout(400), p.screenshot({ path: `${captures}/correction-${nom}.png` }))

const reponseAttendue = (page, id, rang) =>
  page.evaluate(
    async ({ id, rang }) => {
      const s = JSON.parse(localStorage.getItem(`copie:seance:${id}`))
      const [e, q] = s.ordre[rang].split('-').map(Number)
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
    if (pris && (await page.waitForTimeout(300), await page.locator('main math-field').last().evaluate((el, v) => el.value === v, latex).catch(() => false))) return
    await page.waitForTimeout(250)
  }
  throw new Error(`saisie impossible : ${latex}`)
}
/** Répond (vraiment, au clavier MathLive) aux `total` questions d'une séance, puis « Voir le bilan » */
async function repondre(page, id, total) {
  await page.locator('main math-field').first().waitFor({ timeout: 60_000 })
  await page.waitForTimeout(500)
  for (let rang = 0; rang < total; rang++) {
    await page.getByText(`Question ${rang + 1} sur ${total}`).waitFor({ timeout: 30_000 })
    await saisir(page, await reponseAttendue(page, id, rang))
    await page.getByRole('button', { name: 'Vérifier' }).click()
    await page.waitForTimeout(400)
    if (rang < total - 1) {
      const btn = page.getByRole('button', { name: 'Question suivante' })
      for (let essai = 0; essai < 20 && !(await page.getByText(`Question ${rang + 2} sur ${total}`).isVisible().catch(() => false)); essai++) {
        if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {})
        await page.waitForTimeout(400)
      }
    } else await page.getByRole('button', { name: 'Voir le bilan' }).click()
  }
}
async function versLAccueil(page) {
  for (let i = 0; i < 6 && !(await page.getByRole('tab', { name: 'Suivi' }).isVisible().catch(() => false)); i++) {
    await page.getByRole('button', { name: /Retour à l’accueil|Revenir en arrière/ }).first().click().catch(() => {})
    await page.waitForTimeout(350)
  }
}
async function ouvrir(page, p) {
  await versLAccueil(page)
  const tuile = page.getByRole('button', { name: new RegExp(`^${p.titre}`) }).first()
  if (!(await tuile.isVisible().catch(() => false))) {
    await page.getByRole('tab', { name: 'Explorer' }).click({ timeout: 60_000 })
    await page.getByText('5e').first().click().catch(() => {})
    await page.getByRole('button', { name: /^Nombres relatifs/ }).first().click()
  }
  await page.getByRole('button', { name: new RegExp(`^${p.titre}`) }).first().click({ timeout: 30_000 })
}
/** Le parcours de l'Explorer devient `p` : ce que fait la synchronisation à la sortie d'une nouvelle version */
const publier = (page, p) =>
  page.evaluate((p) => {
    localStorage.setItem('copie:explorer', JSON.stringify([p]))
    const ajoutes = JSON.parse(localStorage.getItem('copie:ajoutes') ?? '[]').map((a) => (a.id === p.id ? p : a))
    localStorage.setItem('copie:ajoutes', JSON.stringify(ajoutes))
  }, p)

// ---------- Élève, V1 : première ceinture réussie ----------
const a = await telephone('ancien', [
  (explorer) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('copie:profil', JSON.stringify('eleve'))
    localStorage.setItem('copie:pays', JSON.stringify('FR'))
    localStorage.setItem('copie:explorer', JSON.stringify(explorer))
  },
  [v1],
])
await ouvrir(a, v1)
ok(!(await texte(a, 'body')).includes('Parcours mis à jour'), 'V1 : aucune mention de mise à jour')
await a.getByRole('button', { name: /^Commencer/ }).first().click()
await repondre(a, v1.id, 2)
await a.getByText('2 / 2').first().waitFor({ timeout: 30_000 })
ok(true, 'V1 : première ceinture terminée (2 / 2)')
await a.getByRole('button', { name: 'Retour à l’accueil' }).click().catch(() => {})
await ouvrir(a, v1)
const etatV1 = await texte(a, 'body')
ok(/Réussi · 100 %/.test(etatV1), `V1 : ceinture 1 réussie (${etatV1.slice(0, 200)})`)
ok(!/Au moins 80 %/.test(etatV1), 'V1 : ceinture 2 ouverte')
await cap(a, '1-v1')

// ---------- Le parcours est corrigé (V2) ----------
await publier(a, v2)
await a.reload()
await ouvrir(a, v2)
await a.waitForTimeout(500)
const etatV2 = await texte(a, 'body')
ok(etatV2.includes('Parcours mis à jour'), 'V2 : « Parcours mis à jour »')
ok(!/Au moins 80 %/.test(etatV2) && !/bx-lock/.test(await a.locator('body').innerHTML().then((h) => (h.includes('Au moins 80') ? 'bx-lock' : ''))), 'V2 : la ceinture 2 reste ouverte malgré l’exercice ajouté')
ok(/1 exercice sur 2/.test(etatV2), `V2 : ceinture 1 « 1 exercice sur 2 » (résultat conservé, nouvel exercice à faire) (${etatV2.slice(0, 220)})`)
const boutons = await a.getByRole('button', { name: /^Commencer/ }).count()
ok(boutons >= 1, 'V2 : on peut commencer la ceinture à finir')
await cap(a, '2-v2')
// Suivi : la ceinture orange reste obtenue
await versLAccueil(a)
await a.getByRole('tab', { name: 'Suivi' }).click()
await a.waitForTimeout(800)
const suiviV2 = await texte(a, 'body')
ok(suiviV2.includes('Relatifs en ceintures'), 'V2 : le parcours figure au suivi')
await a.screenshot({ path: `${captures}/correction-3-suivi-v2.png` })

// ---------- Sauvegarde puis téléphone neuf ----------
await a.getByRole('tab', { name: 'Mes parcours' }).click().catch(() => {})
await a.getByRole('button', { name: 'Réglages' }).click()
const [dl] = await Promise.all([a.waitForEvent('download'), a.getByRole('button', { name: 'Exporter une sauvegarde' }).click()])
const fichier = join(dossier, dl.suggestedFilename())
await dl.saveAs(fichier)
ok(true, `sauvegarde exportée après la correction (${dl.suggestedFilename()})`)

const b = await telephone('neuf')
await b.getByRole('button', { name: /France/ }).waitFor({ timeout: 60_000 })
const [choix] = await Promise.all([b.waitForEvent('filechooser'), b.getByRole('button', { name: /Récupérer mes données/ }).click()])
await choix.setFiles(fichier)
await b.getByText('Récupérer ces données ?').waitFor()
ok(/1 passage terminé/.test(await texte(b, '[role=dialog]')), 'aperçu : le passage terminé de la V1 est dans la sauvegarde')
await b.getByRole('button', { name: 'Récupérer', exact: true }).click()
await b.getByRole('tab', { name: 'Mes parcours' }).waitFor({ timeout: 60_000 })
await ouvrir(b, v2)
await b.waitForTimeout(500)
const etatB = await texte(b, 'body')
ok(etatB.includes('Parcours mis à jour'), 'téléphone neuf : « Parcours mis à jour » retrouvé')
ok(/1 exercice sur 2/.test(etatB), 'téléphone neuf : résultat de la V1 conservé sur la ceinture corrigée')
ok(!/Au moins 80 %/.test(etatB), 'téléphone neuf : la ceinture 2 reste ouverte')
await cap(b, '4-neuf-v2')

// ---------- Il termine la ceinture corrigée ----------
await b.getByRole('button', { name: /^Commencer/ }).first().click()
await b.locator('main math-field').first().waitFor({ timeout: 60_000 })
const total = await b.evaluate((id) => JSON.parse(localStorage.getItem(`copie:seance:${id}`)).ordre.length, v2.id)
await repondre(b, v2.id, total)
await b.getByText(/\d+ \/ \d+/).first().waitFor({ timeout: 30_000 })
ok(true, `V2 : ceinture corrigée terminée (${total} questions)`)
await b.getByRole('button', { name: 'Retour à l’accueil' }).click().catch(() => {})
await ouvrir(b, v2)
await b.waitForTimeout(500)
const fin = await texte(b, 'body')
ok(!fin.includes('Parcours mis à jour'), 'après un passage en V2 : la mention disparaît')
ok((fin.match(/Réussi · 100 %/g) ?? []).length >= 1, `après un passage en V2 : ceinture 1 réussie (${fin.slice(0, 200)})`)
await cap(b, '5-fin-v2')

// ---------- Sombre ----------
const s = await telephone('sombre', [
  (explorer) => {
    if (sessionStorage.getItem('pret')) return
    sessionStorage.setItem('pret', '1')
    localStorage.setItem('copie:profil', JSON.stringify('eleve'))
    localStorage.setItem('copie:pays', JSON.stringify('FR'))
    localStorage.setItem('copie:explorer', JSON.stringify(explorer))
  },
  [v2],
], true)
await ouvrir(s, v2)
await cap(s, '6-v2-sombre')

ok(!erreurs.length, `aucune erreur JS ${erreurs.join(' | ')}`)
await nav.close()
console.log(echecs ? `${echecs} ÉCHEC(S)` : 'TOUT VERT')
process.exit(echecs ? 1 : 0)
